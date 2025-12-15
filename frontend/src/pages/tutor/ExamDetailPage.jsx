import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import renderMathInElement from "katex/dist/contrib/auto-render";

import { getExamDetail, getQuestionsOfExam, removeQuestionFromExam } from '../../services/ExamService';
import AddQuestionDialog from '../../components/AddQuestionDialog';

import {
    Box, Typography, Button, Paper, CircularProgress, Alert,
    Stack, Chip, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, DialogContentText, Snackbar, Breadcrumbs, Link
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

const PageWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : theme.palette.background.paper,
    minHeight: '85vh',
    boxShadow: 'none'
}));

const LatexContent = memo(({ content }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (containerRef.current && content) {
            containerRef.current.innerHTML = content;
            try {
                renderMathInElement(containerRef.current, {
                    delimiters: [
                        { left: "$$", right: "$$", display: true },
                        { left: "$", right: "$", display: false },
                        { left: "\\(", right: "\\)", display: false },
                        { left: "\\[", right: "\\]", display: true }
                    ],
                    throwOnError: false
                });
            } catch (e) { console.error(e); }
        }
    }, [content]);
    
    return (
        <div 
            ref={containerRef} 
            style={{ 
                fontSize: '0.95rem', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
            }} 
        />
    );
});

const DifficultyChip = ({ level }) => {
    const map = { 
        EASY: { label: "Dễ", color: "success" }, 
        MEDIUM: { label: "Trung bình", color: "warning" }, 
        HARD: { label: "Khó", color: "error" } 
    };
    
    const safeLevel = String(level).toUpperCase();
    const conf = map[safeLevel] || { label: level, color: "default" };

    return <Chip label={conf.label} color={conf.color} size="small" variant="outlined" sx={{ fontWeight: 500 }} />;
};

const TypeChip = ({ type }) => {
    const map = {
        single_choice: "1 Đáp án",
        multiple_choice: "Nhiều đáp án",
        essay: "Tự luận"
    };
    return (
        <Typography variant="caption" sx={{ 
            display: 'inline-block', 
            bgcolor: 'action.hover', 
            px: 1, py: 0.5, borderRadius: 1, 
            color: 'text.secondary' 
        }}>
            {map[type] || type}
        </Typography>
    );
};

function ExamDetailPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [token] = useState(() => localStorage.getItem('token'));

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [qToDelete, setQToDelete] = useState(null);
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'info' });

    const fetchData = useCallback(async () => {
        if (!token || !examId) return;
        setLoading(true);
        try {
            const [examDetail, quesRes] = await Promise.all([
                getExamDetail(examId, token),
                getQuestionsOfExam(examId, token)
            ]);
            
            setExam(examDetail);
            
            let qList = [];
            if (Array.isArray(quesRes)) {
                qList = quesRes;
            } else if (quesRes && Array.isArray(quesRes.data)) {
                qList = quesRes.data;
            } else if (quesRes && Array.isArray(quesRes.questions)) {
                qList = quesRes.questions;
            }
            
            setQuestions(qList);
        } catch (err) {
            console.error(err);
            setToast({ open: true, msg: "Lỗi tải dữ liệu. Vui lòng thử lại.", severity: "error" });
        } finally {
            setLoading(false);
        }
    }, [token, examId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async () => {
        if (!qToDelete) return;
        try {
            await removeQuestionFromExam(examId, qToDelete.ques_id, token);
            setToast({ open: true, msg: "Đã xóa câu hỏi khỏi đề thi", severity: "success" });
            fetchData(); 
        } catch (err) {
            setToast({ open: true, msg: "Xóa thất bại. Vui lòng thử lại.", severity: "error" });
        } finally {
            setQToDelete(null);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
    if (!exam) return <Alert severity="error" sx={{ mt: 3 }}>Không tìm thấy thông tin đề thi.</Alert>;

    return (
        <PageWrapper>
            {/* Header */}
            <Box mb={4}>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link 
                        underline="hover" 
                        color="inherit" 
                        onClick={() => navigate('/tutor/exam')} 
                        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <ArrowBackIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Quản lý đề thi
                    </Link>
                    <Typography color="text.primary" fontWeight={500}>{exam.title}</Typography>
                </Breadcrumbs>
                
                <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff', border: '1px solid #eee', borderRadius: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                                {exam.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 800 }}>
                                {exam.description || "Chưa có mô tả cho đề thi này."}
                            </Typography>
                            
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                <DifficultyChip level={exam.level} />
                                <Chip icon={<AccessTimeIcon />} label={`${exam.duration} phút`} size="small" sx={{ bgcolor: '#f5f5f5' }} />
                                <Chip icon={<FormatListNumberedIcon />} label={`${questions.length} câu hỏi`} size="small" sx={{ bgcolor: '#f5f5f5' }} />
                            </Stack>
                        </Box>
                        <Button 
                            variant="contained" 
                            size="large"
                            startIcon={<AddCircleOutlineIcon />} 
                            onClick={() => setOpenAddDialog(true)}
                            sx={{ minWidth: 160 }}
                        >
                            Thêm câu hỏi
                        </Button>
                    </Stack>
                </Paper>
            </Box>

            {/* Question Table */}
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#fff' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                <TableCell width="5%" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>STT</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Nội dung câu hỏi</TableCell>
                                <TableCell width="20%" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Thông tin</TableCell>
                                <TableCell width="10%" align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {questions.length > 0 ? questions.map((q, idx) => (
                                <TableRow key={q.ques_id || idx} hover>
                                    <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                                    <TableCell>
                                        <LatexContent content={q.content} />
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={1} alignItems="flex-start">
                                            <DifficultyChip level={q.level} />
                                            <TypeChip type={q.type} />
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Xóa khỏi đề thi">
                                            <IconButton 
                                                size="small"
                                                onClick={() => setQToDelete(q)}
                                                sx={{ 
                                                    color: 'error.main',
                                                    bgcolor: alpha('#d32f2f', 0.05),
                                                    '&:hover': { bgcolor: alpha('#d32f2f', 0.15) }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary" gutterBottom>Chưa có câu hỏi nào trong đề thi này.</Typography>
                                        <Button variant="outlined" size="small" onClick={() => setOpenAddDialog(true)}>
                                            Thêm câu hỏi ngay
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialogs */}
            <AddQuestionDialog 
                open={openAddDialog} 
                onClose={() => setOpenAddDialog(false)} 
                onRefresh={fetchData} 
                examId={examId} 
                existingQuestionIds={questions.map(q => q.ques_id)} 
            />

            <Dialog open={!!qToDelete} onClose={() => setQToDelete(null)}>
                <DialogTitle>Xác nhận xóa câu hỏi</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa câu hỏi này khỏi đề thi <strong>{exam.title}</strong> không? 
                        <br/>Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQToDelete(null)} color="inherit">Hủy</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
                        Xóa bỏ
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={toast.open} 
                autoHideDuration={3000} 
                onClose={() => setToast(prev => ({...prev, open: false}))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setToast(prev => ({...prev, open: false}))} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
                    {toast.msg}
                </Alert>
            </Snackbar>
        </PageWrapper>
    );
}

export default memo(ExamDetailPage);