import React from 'react';
import { 
    Box, Tooltip, TextField, Button, IconButton, Paper, useTheme, alpha, styled
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const AnswerOptionWrapper = styled(Paper)(({ theme, color, isCorrect }) => ({
    padding: theme.spacing(1, 1, 2, 2),
    borderRadius: theme.shape.borderRadius,
    border: '2px solid',
    borderColor: isCorrect ? color : 'transparent',
    backgroundColor: alpha(color, 0.1),
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '150px',
    transition: theme.transitions.create(['border-color', 'background-color']),
}));

// --- Sub-component: Một ô đáp án ---
const AnswerOption = ({ answer, index, questionType, onContentChange, onCorrectChange, onDelete, color }) => (
    <AnswerOptionWrapper color={color} isCorrect={answer.isCorrect}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Đánh dấu là đáp án đúng">
                <IconButton onClick={onCorrectChange} size="small">
                    <CheckCircleIcon sx={{ color: answer.isCorrect ? color : 'action.disabled' }}/>
                </IconButton>
            </Tooltip>
             <Tooltip title="Xóa lựa chọn này">
                <IconButton onClick={onDelete} size="small">
                    <HighlightOffIcon sx={{ fontSize: 20, color: 'action.disabled', '&:hover': { color: 'error.main' } }}/>
                </IconButton>
            </Tooltip>
        </Box>
        <TextField
            fullWidth multiline variant="standard"
            placeholder={`Lựa chọn ${index + 1}`}
            value={answer.content}
            onChange={onContentChange}
            InputProps={{
                disableUnderline: true,
                sx: { 
                    textAlign: 'center', fontWeight: 500,
                    color: 'text.primary', flexGrow: 1
                }
            }}
            sx={{
                display: 'flex', flexGrow: 1,
                '& .MuiInputBase-root': { height: '100%' }
            }}
        />
    </AnswerOptionWrapper>
);


// --- Component chính để soạn thảo đáp án trắc nghiệm ---
export default function MultipleChoiceEditor({ questionType, answerData, setAnswerData }) {
    const theme = useTheme();
    
    const answerColors = [
        theme.palette.info.main, theme.palette.success.main,
        theme.palette.warning.main, theme.palette.error.main,
    ];

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answerData];
        newAnswers[index].content = value;
        setAnswerData(newAnswers);
    };

    const handleCorrectChange = (index) => {
        const newAnswers = [...answerData];
        if (questionType === 'single_choice') {
            newAnswers.forEach((answer, i) => {
                answer.isCorrect = (i === index);
            });
        } else {
            newAnswers[index].isCorrect = !newAnswers[index].isCorrect;
        }
        setAnswerData(newAnswers);
    };

    const addAnswerOption = () => {
        if (answerData.length < 4) {
            setAnswerData([...answerData, { content: '', isCorrect: false }]);
        }
    };

    const removeAnswerOption = (indexToRemove) => {
        if (answerData.length > 2) { // Luôn giữ lại ít nhất 2 đáp án
            setAnswerData(answerData.filter((_, index) => index !== indexToRemove));
        }
    };
    
    return (
        <Box>
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
                gap: 2 
            }}>
                {answerData.map((answer, index) => (
                    <AnswerOption
                        key={index}
                        answer={answer}
                        index={index}
                        questionType={questionType}
                        onContentChange={(e) => handleAnswerChange(index, e.target.value)}
                        onCorrectChange={() => handleCorrectChange(index)}
                        onDelete={() => removeAnswerOption(index)}
                        color={answerColors[index % answerColors.length]}
                    />
                ))}
            
                {answerData.length < 4 && (
                    <Button 
                        variant="dashed"
                        onClick={addAnswerOption}
                        sx={{ 
                            height: '150px', 
                            borderStyle: 'dashed', 
                            borderWidth: 2, 
                            borderColor: 'divider', 
                            color: 'text.secondary',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'action.hover'
                            }
                        }}
                    >
                        <AddCircleOutlineIcon sx={{ mr: 1 }}/>
                        Thêm lựa chọn
                    </Button>
                )}
            </Box>
        </Box>
    );
}
