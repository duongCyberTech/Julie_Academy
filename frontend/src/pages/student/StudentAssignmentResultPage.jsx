/*
 * File: frontend/src/pages/student/StudentAssignmentResultPage.jsx
 *
 * (TRANG KẾT QUẢ CHI TIẾT BÀI LÀM - ĐỌC DỮ LIỆU TỪ useLocation().state)
 *
 * Tính năng:
 * 1. Đọc dữ liệu chi tiết (questions, answers_taken) từ useLocation().state.
 * 2. Cung cấp fallback (hiển thị lỗi) nếu dữ liệu bị thiếu, tránh crash trang trắng.
 */

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Chip,
    Paper,
    Stepper,
    Step,
    StepButton,
    Divider,
    Card, CardContent, Alert,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import { red } from '@mui/material/colors';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SkipNextIcon from '@mui/icons-material/SkipNext';

// Import Katex (tạm thời copy lại từ file trước)
import 'katex/dist/katex.min.css';
import katex from 'katex';


// ======================================================
// --- FUNCTIONAL HELPERS (Giữ nguyên) ---
// ======================================================

// Component render LaTeX
const LatexRenderer = ({ content }) => {
    const renderMath = (text) => {
        if (!text) return null;
        try {
            const parts = text.split(/(\$.*?\S\$)/g);
            return parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    const latex = part.substring(1, part.length - 1);
                    try {
                        const html = katex.renderToString(latex, { throwOnError: false, displayMode: false });
                        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
                    } catch (e) {
                        return <span key={index}>{part}</span>;
                    }
                }
                return <span key={index}>{part}</span>;
            });
        } catch (e) {
            return <span>{text}</span>;
        }
    };
    return <>{renderMath(content)}</>;
};

// Helper để tạo tiền tố A, B, C, D...
const getAnswerPrefix = (index) => String.fromCharCode(65 + index); // 65 là mã ASCII của 'A'

// Hàm giả định thông tin Session (Do không có API call)
const MOCK_ASSIGNMENT_INFO = {
    title: "Kiểm tra giữa kỳ",
    class: { classname: 'Lớp hè 9A1' },
    category: { subject: 'Toán' },
    duration: 45,
    exam_id: 'exam_mock',
    done_time: new Date().toISOString(), // Dùng thời gian hiện tại
    start_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 phút trước
};

// Tính thời gian làm bài
const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = Math.abs(endTime - startTime); // difference in milliseconds

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${minutes} phút ${seconds} giây`;
};


// ======================================================
// --- MAIN COMPONENT ---
// ======================================================

export default function StudentAssignmentResultPage() {
    const { sessionId } = useParams();
    const location = useLocation(); // Dùng để nhận dữ liệu state
    const navigate = useNavigate();

    // 🔥 ĐỌC DỮ LIỆU TỪ STATE (CHỐNG CRASH)
    const passedState = location.state;
    const isDataValid = passedState?.score && passedState?.questions && passedState?.answers_taken;
    
    // Giả lập dữ liệu nếu dữ liệu từ state bị mất (như khi refresh trang)
    const sessionScore = passedState?.score || { correct: 0, total: 0, skipped: 0, incorrect: 0 };
    const sessionQuestions = passedState?.questions || [];
    const sessionAnswersTaken = passedState?.answers_taken || [];
    
    const [activeStep, setActiveStep] = useState(0);

    // Xử lý khi dữ liệu không hợp lệ (ví dụ: truy cập trực tiếp bằng URL)
    if (!isDataValid && sessionQuestions.length === 0) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>
                    Không tìm thấy dữ liệu kết quả bài làm.
                </Typography>
                <Typography color="text.secondary">
                    Vui lòng quay lại trang danh sách bài tập để xem.
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/student/assignment')}>
                    Quay lại Trang Bài tập
                </Button>
            </Container>
        );
    }
    
    // Lấy thông tin câu hỏi và kết quả của câu hiện tại
    const currentQuestionIndex = activeStep;
    const currentQuestion = sessionQuestions[currentQuestionIndex];
    const currentResult = sessionAnswersTaken[currentQuestionIndex];
    
    const isCorrect = currentResult?.is_correct === true;
    const isSkipped = currentResult?.is_skipped === true || currentResult?.selected.length === 0;
    
    const handleStepClick = (step) => {
        setActiveStep(step);
    };

    // Hàm lấy màu và icon dựa trên trạng thái câu hỏi
    const getStatusInfo = (result) => {
        if (result?.is_correct === true) return { color: 'success', icon: <CheckCircleIcon /> };
        if (result?.is_correct === false) return { color: 'error', icon: <CloseIcon /> };
        return { color: 'warning', icon: <SkipNextIcon /> };
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                Chi tiết kết quả bài làm
            </Typography>

            {/* 1. KHUNG TỔNG QUAN VÀ ĐIỂM SỐ */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center', borderRight: { md: '1px solid #eee' } }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: sessionScore.correct / sessionScore.total >= 0.5 ? 'success.main' : red[600] }}>
                            {sessionScore.correct} / {sessionScore.total}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Số câu đúng
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                            {MOCK_ASSIGNMENT_INFO.title}
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <MenuBookIcon fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="body1">Môn: {MOCK_ASSIGNMENT_INFO.category.subject}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="body1">Lớp: {MOCK_ASSIGNMENT_INFO.class.classname}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <EventAvailableIcon fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="body1">Ngày nộp: {new Date().toLocaleDateString('vi-VN')}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="body1">Thời gian làm: {calculateDuration(MOCK_ASSIGNMENT_INFO.start_time, MOCK_ASSIGNMENT_INFO.done_time)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sx={{ mt: 1 }}>
                                <Chip label={`Đúng: ${sessionScore.correct}`} color="success" sx={{ mr: 1 }} />
                                <Chip label={`Sai: ${sessionScore.incorrect}`} color="error" sx={{ mr: 1 }} />
                                <Chip label={`Bỏ qua: ${sessionScore.skipped}`} color="warning" />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
            
            {/* 2. STEPPER & CHI TIẾT CÂU HỎI */}
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Chi tiết từng câu hỏi</Typography>
                {/* Stepper điều hướng */}
                <Box sx={{ overflowX: 'auto', mb: 3 }}>
                    <Stepper nonLinear activeStep={activeStep} sx={{ minWidth: `${sessionQuestions.length * 50}px` }}>
                        {sessionQuestions.map((q, index) => {
                            const statusInfo = getStatusInfo(sessionAnswersTaken[index]);
                            return (
                                <Step key={q.questionId}>
                                    <StepButton color="inherit" onClick={() => handleStepClick(index)} icon={statusInfo.icon}>
                                        {index + 1}
                                    </StepButton>
                                </Step>
                            );
                        })}
                    </Stepper>
                </Box>
                <Divider sx={{ mb: 3 }} />

                {/* Nội dung câu hỏi và lời giải */}
                {currentQuestion && currentResult && (
                    <Card variant="outlined">
                        <CardContent>
                            {/* Trạng thái câu hỏi hiện tại */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" component="h3" sx={{ mr: 2 }}>
                                    Câu {activeStep + 1}
                                </Typography>
                                <Chip 
                                    label={isSkipped ? 'Bỏ qua' : (isCorrect ? 'Chính xác' : 'Chưa đúng')} 
                                    color={isSkipped ? 'warning' : (isCorrect ? 'success' : 'error')}
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>

                            {/* Nội dung câu hỏi */}
                            <Box sx={{ my: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, minHeight: 100, fontSize: '1.1rem' }}>
                                <LatexRenderer content={currentQuestion.content} />
                            </Box>

                            <Typography variant="h6" gutterBottom>Chi tiết Đáp án</Typography>

                            {/* Chi tiết đáp án (Hiển thị đáp án đã chọn và đáp án đúng) */}
                            <Box>
                                {currentQuestion.answers.map((answer, index) => {
                                    const prefix = getAnswerPrefix(index);
                                    const isSelected = currentResult.selected.includes(answer.answerId);
                                    
                                    // Quyết định màu sắc hiển thị
                                    let color = 'divider';
                                    let backgroundColor = 'transparent';
                                    if (answer.is_correct) { // Đáp án đúng luôn xanh
                                        color = 'success.main';
                                        backgroundColor = 'success.lighter';
                                    } else if (isSelected) { // Đáp án sai đã chọn thì đỏ
                                        color = 'error.main';
                                        backgroundColor = 'error.lighter';
                                    }

                                    return (
                                        <Box
                                            key={answer.answerId}
                                            sx={{
                                                p: 1.5,
                                                border: '1px solid',
                                                borderColor: color,
                                                borderRadius: 1,
                                                mb: 1,
                                                backgroundColor: backgroundColor,
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            <Typography sx={{ mr: 1, fontWeight: 'bold' }}>{prefix}.</Typography>
                                            <LatexRenderer content={answer.content} />
                                            {isSelected && <Chip size="small" label="Bạn đã chọn" color={answer.is_correct ? 'success' : 'error'} sx={{ ml: 2 }} />}
                                        </Box>
                                    );
                                })}
                            </Box>
                            
                            {/* HỘP LỜI GIẢI */}
                            {currentQuestion.explanation && (
                                <Alert severity="success" icon={false} sx={{ mt: 3, '.MuiAlert-icon': { display: 'none' }, backgroundColor: 'success.main', color: '#fff' }}>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#fff', fontWeight: 700 }}>
                                        🎉 Lời giải
                                    </Typography>

                                    {/* 1. Lời giải chung của Câu hỏi */}
                                    <Box sx={{ mb: 2, color: '#fff' }}>
                                        <LatexRenderer content={currentQuestion.explanation} />
                                    </Box>

                                    {/* 2. Lời giải chi tiết cho TẤT CẢ đáp án có explanation (CÓ A/B/C/D) */}
                                    {currentQuestion.answers
                                        .map((ans, index) => {
                                            if (!ans.explanation) return null;

                                            return (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        borderTop: '1px dashed',
                                                        borderColor: '#fff',
                                                        pt: 1,
                                                        mt: 1,
                                                        color: '#fff',
                                                    }}
                                                >
                                                    <Typography variant="body2" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                        {getAnswerPrefix(index)}. {ans.is_correct ? 'Đúng' : 'Sai'}
                                                    </Typography>
                                                    <LatexRenderer content={ans.explanation} />
                                                </Box>
                                            );
                                        })}
                                </Alert>
                            )}
                        </CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderTop: '1px solid #eee' }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/student/assignment')}
                            >
                                Quay lại Trang Bài tập
                            </Button>
                            <Box>
                                <Button onClick={() => handleStepClick(activeStep - 1)} disabled={activeStep === 0}>
                                    Câu trước
                                </Button>
                                <Button onClick={() => handleStepClick(activeStep + 1)} disabled={activeStep === sessionQuestions.length - 1} sx={{ ml: 1 }}>
                                    Câu sau
                                </Button>
                            </Box>
                        </Box>
                    </Card>
                )}
            </Paper>
        </Container>
    );
}