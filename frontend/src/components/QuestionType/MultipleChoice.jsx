import React, { useState, useCallback } from 'react'; 
import { 
    Box, Tooltip, Button, IconButton, Paper, useTheme, alpha, styled,
    Collapse 
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import NotesIcon from '@mui/icons-material/Notes'; 
import RichTextEditor from '../RichTextEditor'; 
import { v4 as uuidv4 } from 'uuid'; 

const AnswerOptionWrapper = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'isCorrect' 
})(({ theme, color, isCorrect }) => ({
    padding: theme.spacing(1, 1, 1, 2),
    borderRadius: theme.shape.borderRadius,
    border: '2px solid',
    borderColor: isCorrect ? color : 'transparent',
    backgroundColor: alpha(color, 0.1),
    position: 'relative', 
    display: 'flex',
    flexDirection: 'column',
    transition: theme.transitions.create(['border-color', 'background-color']),
}));

const AnswerOption = React.memo(({ 
    answer, index, 
    onContentChange, 
    onCorrectChange, 
    onDelete, 
    color 
}) => {
    const [showExplaination, setShowExplaination] = useState(() => Boolean(answer.explaination)); 
    const handleChangeContent = useCallback((val) => {
        onContentChange(answer.id, 'content', val);
    }, [answer.id, onContentChange]);

    const handleChangeExplaination = useCallback((val) => {
        onContentChange(answer.id, 'explaination', val);
    }, [answer.id, onContentChange]);

    return (
        <AnswerOptionWrapper color={color} isCorrect={answer.isCorrect}>
            <Box sx={{ 
                position: 'absolute', top: 4, right: 4, zIndex: 3             
            }}>
                <Tooltip title="Đánh dấu là đáp án đúng">
                    <IconButton onClick={() => onCorrectChange(answer.id)} size="small">
                        <CheckCircleIcon sx={{ color: answer.isCorrect ? color : 'action.disabled' }}/>
                    </IconButton>
                </Tooltip>
                <Tooltip title={showExplaination ? "Ẩn giải thích" : "Thêm giải thích"}>
                    <IconButton onClick={() => setShowExplaination(!showExplaination)} size="small">
                        <NotesIcon sx={{ fontSize: 20, color: showExplaination ? 'primary.main' : 'action.disabled' }}/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Xóa lựa chọn này">
                    <IconButton onClick={() => onDelete(answer.id)} size="small">
                        <HighlightOffIcon sx={{ fontSize: 20, color: 'action.disabled', '&:hover': { color: 'error.main' } }}/>
                    </IconButton>
                </Tooltip>
            </Box>
            
            <RichTextEditor
                toolbarType="minimal" 
                placeholder={`Lựa chọn ${index + 1}`}
                value={answer.content}
                onChange={handleChangeContent} 
                style={{ 
                    paddingTop: '32px', flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '80px' 
                }}
            />
            
            <Collapse in={showExplaination} mountOnEnter unmountOnExit> 
                <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider', mt: 1 }}>
                    <RichTextEditor
                        toolbarType="minimal" 
                        placeholder="Thêm giải thích cho đáp án này..."
                        value={answer.explaination || ''} 
                        onChange={handleChangeExplaination} 
                        style={{ display: 'flex', flexDirection: 'column', minHeight: '60px' }}
                    />
                </Box>
            </Collapse>
        </AnswerOptionWrapper>
    );
});

export default function MultipleChoiceEditor({ questionType, answerData, setAnswerData }) {
    const theme = useTheme();
    
    const answerColors = [
        theme.palette.info.main, theme.palette.success.main,
        theme.palette.warning.main, theme.palette.error.main,
        theme.palette.secondary.main, theme.palette.grey[500] 
    ];

    const addAnswerOption = useCallback(() => {
        const newId = uuidv4(); 
        setAnswerData(prev => [
            ...prev, 
            { id: newId, content: '', isCorrect: false, explaination: '' } 
        ]);
    }, [setAnswerData]);

    const removeAnswerOption = useCallback((idToRemove) => {
        setAnswerData(prev => {
            if (prev.length <= 1) return prev; 
            return prev.filter(ans => ans.id !== idToRemove);
        });
    }, [setAnswerData]);

    const handleContentChange = useCallback((id, field, value) => {
        setAnswerData(prev => prev.map(ans => {
            if (ans.id === id) {
                if (ans[field] === value) return ans;
                
                return { ...ans, [field]: value };
            }
            return ans;
        }));
    }, [setAnswerData]);

    const handleCorrectChange = useCallback((id) => {
        setAnswerData(prev => {
            if (questionType === 'single_choice') {
                return prev.map(ans => ({ ...ans, isCorrect: ans.id === id }));
            } else {
                return prev.map(ans => 
                    ans.id === id ? { ...ans, isCorrect: !ans.isCorrect } : ans
                );
            }
        });
    }, [setAnswerData, questionType]);
    
    return (
        <Box>
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
                gap: 2 
            }}>
                {answerData.map((answer, index) => (
                    <AnswerOption
                        key={answer.id} 
                        answer={answer}
                        index={index}
                        onContentChange={handleContentChange} 
                        onCorrectChange={handleCorrectChange}
                        onDelete={removeAnswerOption}
                        color={answerColors[index % answerColors.length]}
                    />
                ))}
            
                <Button 
                    variant="dashed"
                    onClick={addAnswerOption}
                    sx={{ 
                        minHeight: '80px', borderStyle: 'dashed', borderWidth: 2, borderColor: 'divider', 
                        color: 'text.secondary',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                    }}
                >
                    <AddCircleOutlineIcon sx={{ mr: 1 }}/>
                    Thêm lựa chọn
                </Button>
            </Box>
        </Box>
    );
}