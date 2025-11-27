import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyExams} from '../../services/ExamService'; 
import {
    Box, Typography, Button, Paper, CircularProgress,
    Alert, Grid, Card, CardContent, CardActions,
    IconButton, Tooltip, Stack, Chip, SvgIcon,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle 
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import NoteAddIcon from '@mui/icons-material/NoteAdd'; 

import CreateExamDialog from '../../components/CreateExamDialog';


const PageWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
}));

const Header = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
});

const ExamCardStyled = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
    }
}));

const RenderEmptyState = memo(({ onOpenCreateDialog }) => {
    return (
        <Paper
            variant="outlined"
            sx={{
                mt: 4, p: { xs: 3, md: 6 }, textAlign: 'center',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderColor: 'divider',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                borderRadius: 2.5
            }}
        >
            <NoteAddIcon sx={{ width: 100, height: 100, color: 'primary.main', opacity: 0.6 }} />
            <Typography variant="h5" component="h2" fontWeight={600} mt={2} color="text.primary">
                Bạn chưa có đề thi nào
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, mb: 3, maxWidth: '450px' }}>
                Hãy bắt đầu tạo đề thi đầu tiên. Bạn có thể thêm câu hỏi vào đề thi sau khi tạo.
            </Typography>
            <Button
                variant="contained"
                size="large"
                onClick={onOpenCreateDialog} 
                startIcon={<AddCircleOutlineIcon />}
                sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
            >
                Tạo đề thi đầu tiên
            </Button>
        </Paper>
    );
});

const LevelChip = memo(({ level }) => {
    const levelMap = {
        EASY: { label: "Dễ", color: "success" },
        MEDIUM: { label: "Trung bình", color: "warning" },
        HARD: { label: "Khó", color: "error" },
    };
    const { label, color } = levelMap[level] || { label: level, color: "default" };
    return <Chip icon={<StarBorderIcon />} label={label} color={color} size="small" variant="outlined" />;
});

const RenderExamGrid = memo(({ exams, onNavigate, onDelete }) => {
    return (
        <Grid container spacing={3} sx={{ mt: 2 }}>
            {exams.map((examItem) => (
                <Grid item xs={12} sm={6} md={4} key={examItem.exam_id}>
                    <ExamCardStyled>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ mb: 1.5 }}>
                                <LevelChip level={examItem.level} />
                            </Box>
                            
                            <Typography variant="h6" component="h2" fontWeight={600} noWrap title={examItem.title}>
                                {examItem.title}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 0.5, mb: 2, flexGrow: 1, minHeight: '40px' }}>
                                {examItem.description || "Đề thi chưa có mô tả."}
                            </Typography>
                            
                            <Stack direction="row" spacing={2} color="text.secondary">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <QuizIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    <Typography variant="body2">{examItem.total_ques} câu</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <TimerIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    <Typography variant="body2">{examItem.duration} phút</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0, backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.04) }}>
                            <Box>
                                <Tooltip title="Xóa đề thi">
                                    <span>
                                        <IconButton size="small" onClick={() => onDelete(examItem)} disabled={true}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                            <Button
                                size="small"
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => onNavigate(examItem.exam_id)}
                            >
                                Chi tiết
                            </Button>
                        </CardActions>
                    </ExamCardStyled>
                </Grid>
            ))}
        </Grid>
    );
});


function ExamPage() {
    const navigate = useNavigate();
    const [token] = useState(() => localStorage.getItem('token'));
    
    const [exams, setExams] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [openCreateDialog, setOpenCreateDialog] = useState(false);

    const fetchExams = useCallback(async () => {
        if (!token) {
            setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await getMyExams(token); 
            setExams(Array.isArray(response) ? response : []);
        } catch (err) {
            setError("Không thể tải danh sách đề thi.");
        } finally {
            setLoading(false);
        }
    }, [token]); 

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    const handleOpenCreateDialog = () => setOpenCreateDialog(true);
    const handleCloseCreateDialog = () => setOpenCreateDialog(false);
    
    const handleNavigateToDetail = (examId) => navigate(`/tutor/exam/${examId}`);
    
    const handleOpenDeleteDialog = (examInfo) => {
        // setExamToDelete(examInfo);
        // setOpenDeleteDialog(true);
        alert("Chức năng xóa chưa được hỗ trợ (thiếu API deleteExam).");
    };
    // const handleCloseDeleteDialog = () => {
    //     setExamToDelete(null);
    //     setOpenDeleteDialog(false);
    // };
    
    // const handleConfirmDelete = async () => {
    //     ...
    // };

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }
        
        if (error) {
            return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
        }

        if (exams.length === 0) {
            return <RenderEmptyState onOpenCreateDialog={handleOpenCreateDialog} />;
        }
    
        return (
            <RenderExamGrid 
                exams={exams}
                onDelete={handleOpenDeleteDialog}
                onNavigate={handleNavigateToDetail}
            />
        );
    };

    return (
        <PageWrapper>
            <Header>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Quản lý đề thi
                </Typography>
                {!loading && !error && exams.length > 0 && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenCreateDialog}
                        startIcon={<AddCircleOutlineIcon />}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Tạo đề thi mới
                    </Button>
                )}
            </Header>

            {renderContent()}

            {/* Sửa: Dùng CreateExamDialog */}
            <CreateExamDialog 
                open={openCreateDialog} 
                onClose={handleCloseCreateDialog} 
                onRefresh={fetchExams} 
            />

            {/* (Tạm thời vô hiệu hóa Dialog Xóa) */}
            
        </PageWrapper>
    );
}

export default memo(ExamPage);