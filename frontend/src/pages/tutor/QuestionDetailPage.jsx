import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // Import CSS của KaTeX

import {
    Box, Typography, Paper, Chip, Button, Divider,
    Stack, Grid, CircularProgress, Alert, IconButton,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Breadcrumbs, Link as MuiLink
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';

// Services
import { getQuestionById, deleteQuestion } from '../../services/QuestionService';

// --- SUB-COMPONENT: Hiển thị HTML + KaTeX ---
const LatexContent = ({ content, className }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && content) {
            // 1. Render HTML cơ bản
            containerRef.current.innerHTML = content;

            // 2. Render KaTeX cho các phần tử toán học
            // Tìm tất cả các đoạn text nằm trong $$...$$ hoặc \(...\) nếu bạn dùng regex replace trước đó
            // Hoặc đơn giản là render lại toàn bộ container nếu nội dung chưa được parse
            // Ở đây giả định nội dung HTML từ Editor đã an toàn. 
            // Nếu muốn render công thức toán dạng text "$x^2$", ta dùng renderMathInElement (cần import extension auto-render)
            // Code dưới đây là cách thủ công đơn giản tìm các thẻ đặc biệt nếu có, hoặc chỉ hiển thị HTML
            // Để đơn giản nhất cho RichText, ta chỉ hiển thị HTML. 
            // Nếu bạn muốn parse $...$, cần thêm logic replace hoặc dùng thư viện 'react-latex-next'
        }
    }, [content]);

    // Lưu ý: Để render $...$ thành công thức, bạn nên cài thêm 'katex/dist/contrib/auto-render' 
    // và gọi renderMathInElement(containerRef.current) trong useEffect.
    
    return (
        <div 
            ref={containerRef} 
            className={className}
            style={{ 
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                lineHeight: 1.6,
                fontSize: '1rem'
            }} 
        />
    );
};

// --- HELPER: Styles & Mapping ---
const difficultyMap = {
    EASY: { label: "Dễ", color: "success" },
    MEDIUM: { label: "Trung bình", color: "warning" },
    HARD: { label: "Khó", color: "error" },
};

const typeMap = {
    single_choice: "Trắc nghiệm 1 đáp án",
    multiple_choice: "Trắc nghiệm nhiều đáp án",
    essay: "Tự luận",
    true_false: "Đúng / Sai"
};

// --- MAIN COMPONENT ---
const QuestionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [token] = useState(localStorage.getItem('token'));
    
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Lấy User ID từ token
    const userInfo = useMemo(() => {
        try { return token ? jwtDecode(token) : null; }
        catch (e) { return null; }
    }, [token]);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const data = await getQuestionById(id, token);
                setQuestion(data);
            } catch (err) {
                console.error(err);
                setError("Không thể tải chi tiết câu hỏi.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, token]);

    // Kiểm tra quyền sở hữu
    const isOwner = useMemo(() => {
        if (!question || !userInfo) return false;
        // question.tutor.user.uid là ID của người tạo (dựa theo API getDetail)
        return question.tutor?.user?.uid === userInfo.sub;
    }, [question, userInfo]);

    // Handlers
    const handleEdit = () => {
        navigate(`/tutor/edit-question/${id}`);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteQuestion(id, token);
            navigate('/tutor/question'); // Quay lại danh sách
        } catch (err) {
            alert("Xóa thất bại: " + (err.message || "Lỗi không xác định"));
            setDeleteDialog(false);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
    if (error) return <Box p={4}><Alert severity="error">{error}</Alert><Button onClick={() => navigate(-1)} sx={{mt: 2}}>Quay lại</Button></Box>;
    if (!question) return null;

    const levelInfo = difficultyMap[String(question.level).toUpperCase()] || { label: question.level, color: "default" };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header & Breadcrumbs */}
            <Box mb={3}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <MuiLink color="inherit" href="/tutor/question" onClick={(e) => {e.preventDefault(); navigate('/tutor/question');}} sx={{ cursor: 'pointer' }}>
                        Thư viện câu hỏi
                    </MuiLink>
                    <Typography color="text.primary">Chi tiết câu hỏi</Typography>
                </Breadcrumbs>

                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 1 }}>
                        Quay lại
                    </Button>
                    
                    {/* Chỉ hiện nút sửa/xóa nếu là Owner */}
                    {isOwner && (
                        <Stack direction="row" spacing={1}>
                            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
                                Chỉnh sửa
                            </Button>
                            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteDialog(true)}>
                                Xóa
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {/* CỘT TRÁI: NỘI DUNG CÂU HỎI */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                        <Stack direction="row" spacing={1} mb={2}>
                            <Chip label={typeMap[question.type] || question.type} color="primary" size="small" variant="outlined" />
                            <Chip label={levelInfo.label} color={levelInfo.color} size="small" />
                            <Chip label={question.status === 'ready' ? 'Sẵn sàng' : 'Bản nháp'} size="small" />
                        </Stack>

                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {question.title || "Câu hỏi không có tiêu đề"}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {/* Nội dung câu hỏi (Render HTML/Latex) */}
                        <Box sx={{ fontSize: '1.1rem', mb: 3 }}>
                            <LatexContent content={question.content} />
                        </Box>

                        {/* Danh sách đáp án */}
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                            Các lựa chọn:
                        </Typography>
                        <Stack spacing={1}>
                            {question.answers?.map((ans) => (
                                <Paper 
                                    key={ans.aid} 
                                    variant="outlined" 
                                    sx={{ 
                                        p: 2, 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        // Tô xanh nếu đúng, xám nhẹ nếu sai
                                        backgroundColor: ans.is_correct ? alpha('#4caf50', 0.1) : 'transparent',
                                        borderColor: ans.is_correct ? 'success.main' : 'divider',
                                        borderWidth: ans.is_correct ? 2 : 1
                                    }}
                                >
                                    <Box mr={2} display="flex" alignItems="center">
                                        {ans.is_correct ? (
                                            <CheckCircleIcon color="success" />
                                        ) : (
                                            <RadioButtonUncheckedIcon color="disabled" />
                                        )}
                                    </Box>
                                    <Box flexGrow={1}>
                                        <LatexContent content={ans.content} />
                                    </Box>
                                </Paper>
                            ))}
                        </Stack>
                    </Paper>

                    {/* Phần giải thích */}
                    {question.explaination && (
                        <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: '#fffde7', borderColor: '#fff59d' }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <HelpOutlineIcon color="warning" />
                                <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
                                    Giải thích chi tiết
                                </Typography>
                            </Stack>
                            <LatexContent content={question.explaination} />
                        </Paper>
                    )}
                </Grid>

                {/* CỘT PHẢI: THÔNG TIN META */}
                <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                            Thông tin phân loại
                        </Typography>
                        
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                    <CategoryIcon fontSize="inherit" /> Chuyên đề / Danh mục
                                </Typography>
                                <Typography variant="body2" fontWeight={500} mt={0.5}>
                                    {question.category?.category_name || "Chưa phân loại"}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                    <SchoolIcon fontSize="inherit" /> Thuộc Giáo án
                                </Typography>
                                <Typography variant="body2" fontWeight={500} mt={0.5}>
                                    {question.category?.structure?.[0]?.Plan?.title || "Không có thông tin"}
                                </Typography>
                                {question.category?.structure?.[0]?.Plan && (
                                    <Typography variant="caption" color="text.secondary">
                                        Môn: {question.category.structure[0].Plan.subject} • Khối {question.category.structure[0].Plan.grade}
                                    </Typography>
                                )}
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary">Người tạo</Typography>
                                <Typography variant="body2">
                                    {question.tutor?.user?.lname} {question.tutor?.user?.fname}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialog Xóa */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Xác nhận xóa câu hỏi</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)} disabled={isDeleting}>Hủy</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
                        {isDeleting ? "Đang xóa..." : "Xóa"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionDetailPage;