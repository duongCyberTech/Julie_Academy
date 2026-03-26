import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { getExamDetail, getQuestionsOfExam, removeQuestionFromExam } from '../../services/ExamService';
import AddQuestionDialog from '../../components/AddQuestionDialog';

import {
    Box, Typography, Button, Paper, CircularProgress, Alert,
    Stack, Chip, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, DialogContentText, Snackbar
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const PageWrapper = styled(Paper)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        margin: theme.spacing(3),
        padding: theme.spacing(5),
        backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
        backgroundImage: 'none',
        borderRadius: '24px',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
        boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
    };
});

const HeaderBar = styled(Stack)(({ theme }) => ({
    justifyContent: 'space-between',
    marginBottom: theme.spacing(4),
    flexShrink: 0,
}));

const PanelCard = styled(Paper)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        borderRadius: '16px',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        boxShadow: 'none',
        overflow: 'hidden',
    };
});

const DifficultyChip = ({ level }) => {
    const map = { 
        EASY: { label: "Dễ", color: "success" }, 
        MEDIUM: { label: "Trung bình", color: "warning" }, 
        HARD: { label: "Khó", color: "error" } 
    };
    
    const safeLevel = level ? String(level).toUpperCase() : "";
    const conf = map[safeLevel];

    if (conf) {
        return (
            <Chip 
                label={conf.label} 
                size="small" 
                sx={{ 
                    fontWeight: 700, 
                    border: '1px solid', 
                    borderColor: `${conf.color}.main`,
                    bgcolor: (theme) => alpha(theme.palette[conf.color].main, 0.08),
                    color: `${conf.color}.main`
                }} 
            />
        );
    }

    return (
        <Chip 
            label="Chưa phân loại" 
            size="small" 
            sx={{ 
                fontWeight: 600, 
                bgcolor: 'action.hover', 
                color: 'text.secondary',
                border: '1px solid divider'
            }} 
        />
    );
};

const TypeChip = ({ type }) => {
    const map = {
        single_choice: "1 Đáp án",
        multiple_choice: "Nhiều đáp án",
        essay: "Tự luận",
        true_false: "Đúng / Sai"
    };
    return (
        <Chip 
            label={map[type] || type || "Không rõ"}
            size="small"
            sx={{ 
                fontWeight: 700, 
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08), 
                color: 'primary.main',
                border: '1px dashed',
                borderColor: 'primary.main'
            }}
        />
    );
};

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
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

    if (loading) return (
        <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </PageWrapper>
    );

    if (!exam) return (
        <PageWrapper sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>Không tìm thấy thông tin đề thi.</Alert>
            <Button 
                onClick={() => navigate('/tutor/exam')} 
                sx={{ mt: 2, fontWeight: 700, borderRadius: '10px' }} 
                startIcon={<ArrowBackRoundedIcon />}
            >
                Quay lại
            </Button>
        </PageWrapper>
    );

    return (
        <PageWrapper>
            {/* NÚT QUAY LẠI */}
            <Box sx={{ mb: 2, flexShrink: 0 }}>
                <Button
                    onClick={() => navigate('/tutor/exam')}
                    startIcon={<ArrowBackRoundedIcon />}
                    color="inherit"
                    sx={{ 
                        textTransform: 'none', 
                        fontWeight: 700, 
                        color: 'text.secondary',
                        borderRadius: '10px',
                        px: 2,
                        '&:hover': { 
                            color: 'primary.main', 
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) 
                        }
                    }}
                >
                    Quay lại danh sách đề thi
                </Button>
            </Box>

            {/* HEADER TRANG */}
            <HeaderBar 
                direction={{ xs: 'column', md: 'row' }} 
                alignItems={{ xs: 'flex-start', md: 'center' }} 
                spacing={3}
            >
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight="700" color="text.primary">
                        {exam.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block", maxWidth: 800 }}>
                        {exam.description || "Chưa có mô tả chi tiết cho đề thi này."}
                    </Typography>
                    
                    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                        <DifficultyChip level={exam.level} />
                        <Chip 
                            icon={<AccessTimeRoundedIcon fontSize="small" />} 
                            label={`${exam.duration} phút`} 
                            size="small" 
                            sx={{ 
                                bgcolor: 'background.paper', 
                                border: '1px solid', 
                                borderColor: 'divider', 
                                fontWeight: 600 
                            }} 
                        />
                        <Chip 
                            icon={<FormatListNumberedRoundedIcon fontSize="small" />} 
                            label={`${questions.length} câu hỏi`} 
                            size="small" 
                            sx={{ 
                                bgcolor: 'background.paper', 
                                border: '1px solid', 
                                borderColor: 'divider', 
                                fontWeight: 600 
                            }} 
                        />
                    </Stack>
                </Box>

                <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />} 
                    onClick={() => setOpenAddDialog(true)}
                    sx={{ minWidth: 160, borderRadius: '12px', py: 1.5, px: 3, fontWeight: 700 }}
                >
                    Thêm câu hỏi
                </Button>
            </HeaderBar>

            {/* BẢNG DANH SÁCH CÂU HỎI */}
            <Typography variant="h6" fontWeight="700" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoOutlinedIcon color="primary" /> Danh sách câu hỏi trong đề
            </Typography>

            <PanelCard>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03) }}>
                                <TableCell align="center" width="5%" sx={{ fontWeight: 700, color: 'text.secondary' }}>STT</TableCell>
                                <TableCell width="55%" sx={{ fontWeight: 700, color: 'text.secondary' }}>Tiêu đề câu hỏi</TableCell>
                                <TableCell width="25%" sx={{ fontWeight: 700, color: 'text.secondary' }}>Phân loại</TableCell>
                                <TableCell align="center" width="15%" sx={{ fontWeight: 700, color: 'text.secondary' }}>Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {questions.length > 0 ? questions.map((q, idx) => (
                                <TableRow key={q.ques_id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600 }}>{idx + 1}</TableCell>
                                    
                                    <TableCell sx={{ py: 2 }}>
                                        <Typography 
                                            variant="subtitle2" 
                                            fontWeight={600}
                                            sx={{ 
                                                color: 'text.primary',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {q.title || "(Chưa có tiêu đề)"}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
                                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                                                    borderRadius: '10px',
                                                    '&:hover': { 
                                                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.2), 
                                                        transform: 'translateY(-2px)' 
                                                    },
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <DeleteOutlineRoundedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary" gutterBottom>Chưa có câu hỏi nào trong đề thi này.</Typography>
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            onClick={() => setOpenAddDialog(true)} 
                                            sx={{ mt: 1, borderRadius: '10px', fontWeight: 700 }}
                                        >
                                            Thêm câu hỏi ngay
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </PanelCard>

            {/* DIALOGS & SNACKBAR */}
            <AddQuestionDialog 
                open={openAddDialog} 
                onClose={() => setOpenAddDialog(false)} 
                onRefresh={fetchData} 
                examId={examId} 
                existingQuestionIds={questions.map(q => q.ques_id)} 
            />

            <Dialog 
                open={!!qToDelete} 
                onClose={() => setQToDelete(null)}
                PaperProps={{ 
                    sx: { 
                        borderRadius: '16px', 
                        p: 1,
                        backgroundColor: 'background.paper',
                        backgroundImage: 'none'
                    } 
                }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa câu hỏi</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa câu hỏi này khỏi đề thi <Typography component="span" fontWeight="bold" color="text.primary">{exam.title}</Typography> không? 
                        <br/><br/><i>Lưu ý: Hành động này không xóa câu hỏi khỏi thư viện tổng, chỉ gỡ khỏi đề thi hiện tại.</i>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setQToDelete(null)} color="inherit" sx={{ fontWeight: 700, borderRadius: '10px' }}>Hủy</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disableElevation sx={{ borderRadius: '10px', fontWeight: 700 }}>
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
                <Alert onClose={() => setToast(prev => ({...prev, open: false}))} severity={toast.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
                    {toast.msg}
                </Alert>
            </Snackbar>
        </PageWrapper>
    );
}

export default memo(ExamDetailPage);