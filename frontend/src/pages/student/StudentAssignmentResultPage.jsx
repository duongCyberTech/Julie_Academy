/*
 * File: frontend/src/pages/student/StudentAssignmentResultPage.jsx
 *
 * (TRANG KẾT QUẢ CHI TIẾT BÀI LÀM)
 *
 * Tính năng:
 * 1. Hiển thị thông tin tổng quan (Điểm, Thời gian, Lớp học, Bài kiểm tra).
 * 2. Sử dụng Stepper để hiển thị trạng thái từng câu (Đúng/Sai/Bỏ qua).
 * 3. Hiển thị chi tiết từng câu: Nội dung câu hỏi, đáp án đã chọn, đáp án đúng và Lời giải (có A/B/C/D).
 */

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Grid,
    Chip,
    Paper,
    Stepper,
    Step,
    StepButton,
    Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

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
import { red } from '@mui/material/colors';

// ======================================================
// --- MOCK DATA (Lấy data mẫu có kết quả chi tiết) ---
// ======================================================

const MOCK_SESSION_ID = 'session_1';

const mockResultData = {
    sessionId: MOCK_SESSION_ID,
    exam: {
        exam_id: 'exam_1',
        title: 'Kiểm tra 15 phút - Chương 1 (Bài 1)',
        duration: 15,
        total_question: 9,
        class: { classname: 'Lớp hè 9A1' },
        category: { subject: 'Toán' },
    },
    exam_taken: {
        et_id: 'taken_result_1',
        start_time: '2025-11-06T10:00:00Z',
        done_time: '2025-11-06T10:12:30Z',
        final_score: 7,
        total_correct: 7,
        total_skipped: 1,
        total_incorrect: 1,
        // Danh sách chi tiết bài làm của học sinh
        answers_taken: [
            { questionId: 'q1', selected: ['q1a3'], is_correct: true }, // Đúng
            { questionId: 'q2', selected: ['q2a3'], is_correct: true }, // Đúng
            { questionId: 'q3', selected: ['q3a1'], is_correct: false }, // Sai (Chọn q3a1, đúng là q3a2)
            { questionId: 'q4', selected: ['q4a2'], is_correct: true }, // Đúng
            { questionId: 'q5', selected: ['q5a2'], is_correct: true }, // Đúng
            { questionId: 'q6', selected: [], is_correct: 'skipped' }, // Bỏ qua
            { questionId: 'q7_multi', selected: ['q7a1', 'q7a2', 'q7a3'], is_correct: true }, // Đúng
            { questionId: 'q8', selected: ['q8a1'], is_correct: true }, // Đúng
            { questionId: 'q9', selected: ['q9a2'], is_correct: true }, // Đúng
        ],
    },
    // Chi tiết câu hỏi (đã gộp sẵn để dễ hiển thị)
    questions: [
        // Dữ liệu mockQuestions cũ, nhưng chỉ lấy những trường cần thiết
        {
            questionId: 'q1', content: 'Phương trình $(x - 5)(3x + 9) = 0$ có tập nghiệm là:', type: 'SINGLE_CHOICE',
            explanation: 'Để giải phương trình tích...',
            answers: [
                { answerId: 'q1a1', content: '$S = \\{5\\}$', is_correct: false, explanation: 'Chỉ có nghiệm $x=5$, thiếu $x=-3$.' },
                { answerId: 'q1a2', content: '$S = \\{-3\\}$', is_correct: false, explanation: 'Chỉ có nghiệm $x=-3$, thiếu $x=5$.' },
                { answerId: 'q1a3', content: '$S = \\{5; -3\\}$', is_correct: true, explanation: 'Giải $x-5=0 \\implies x=5$. Giải $3x+9=0 \\implies 3x=-9 \\implies x=-3$.' },
                { answerId: 'q1a4', content: '$S = \\{-5; 3\\}$', is_correct: false, explanation: 'Sai dấu các nghiệm.' },
            ],
        },
        {
            questionId: 'q2', content: 'Điều kiện xác định của phương trình $\\frac{2}{5x-3} = 1 + \\frac{1}{x+2}$ là gì?', type: 'SINGLE_CHOICE',
            explanation: 'Điều kiện xác định của phương trình chứa ẩn ở mẫu...',
            answers: [
                { answerId: 'q2a1', content: '$x \\ne \\frac{3}{5}$', is_correct: false, explanation: 'Thiếu điều kiện cho mẫu $x+2$.' },
                { answerId: 'q2a2', content: '$x \\ne -2$', is_correct: false, explanation: 'Thiếu điều kiện cho mẫu $5x-3$.' },
                { answerId: 'q2a3', content: '$x \\ne \\frac{3}{5}$ và $x \\ne -2$', is_correct: true, explanation: 'Mẫu $5x-3 \\ne 0 \\implies x \\ne 3/5$. Mẫu $x+2 \\ne 0 \\implies x \\ne -2$.' },
                { answerId: 'q2a4', content: '$x \\ne 0$', is_correct: false, explanation: 'Mẫu số không phải là x.' },
            ],
        },
        {
            questionId: 'q3', content: 'Phương trình nào sau đây có thể quy về phương trình bậc nhất một ẩn?', type: 'SINGLE_CHOICE',
            explanation: 'Phương trình bậc nhất một ẩn có dạng $ax+b=0$ ($a \\ne 0$)...',
            answers: [
                { answerId: 'q3a1', content: '$x^2 - 1 = 0$', is_correct: false, explanation: 'Đây là phương trình bậc hai.' },
                { answerId: 'q3a2', content: '$\\frac{1}{x} = 5$', is_correct: true, explanation: 'ĐKXĐ $x \\ne 0$. Quy đồng: $1 = 5x \\implies 5x - 1 = 0$, là phương trình bậc nhất.' },
                { answerId: 'q3a3', content: '$x^3 = 8$', is_correct: false, explanation: 'Đây là phương trình bậc ba.' },
                { answerId: 'q3a4', content: '$0x = 0$', is_correct: false, explanation: 'Đây là phương trình có vô số nghiệm.' },
            ],
        },
        {
            questionId: 'q4', content: 'Tìm tập nghiệm của phương trình $4x^2 - 16 = 5(x + 2)$.', type: 'SINGLE_CHOICE',
            explanation: 'Phân tích vế trái thành $4(x-2)(x+2)$, chuyển vế và đặt nhân tử chung $(x+2)$ để đưa về phương trình tích.',
            answers: [
                { answerId: 'q4a1', content: '$S = \\{2; -\\frac{13}{4}\\}$', is_correct: false, explanation: 'Nghiệm $x=2$ sai.' },
                { answerId: 'q4a2', content: '$S = \\{-2; \\frac{13}{4}\\}$', is_correct: true, explanation: '$(x+2)(4x-13)=0$.' },
                { answerId: 'q4a3', content: '$S = \\{-2\\}$', is_correct: false, explanation: 'Thiếu nghiệm $x=13/4$.' },
                { answerId: 'q4a4', content: '$S = \\{\\frac{13}{4}\\}$', is_correct: false, explanation: 'Thiếu nghiệm $x=-2$.' },
            ],
        },
        {
            questionId: 'q5', content: 'Giải phương trình $\\frac{x^2 - 6}{x} = x + \\frac{3}{2}$.', type: 'SINGLE_CHOICE',
            explanation: 'Tìm ĐKXĐ, quy đồng khử mẫu, giải phương trình hệ quả, sau đó kiểm tra nghiệm với ĐKXĐ.',
            answers: [
                { answerId: 'q5a1', content: '$x = 4$', is_correct: false, explanation: 'Kết quả tính toán sai. $3x=-12$.' },
                { answerId: 'q5a2', content: '$x = -4$', is_correct: true, explanation: 'Kết quả $x=-4$.' },
                { answerId: 'q5a3', content: 'Phương trình vô nghiệm', is_correct: false, explanation: 'Phương trình có nghiệm $x=-4$.' },
                { answerId: 'q5a4', content: '$x = 0$', is_correct: false, explanation: 'Nghiệm này vi phạm ĐKXĐ.' },
            ],
        },
        {
            questionId: 'q6', content: 'Giải phương trình $\\frac{4}{x(x-1)} + \\frac{3}{x} = \\frac{4}{x-1}$.', type: 'SINGLE_CHOICE',
            explanation: 'Tìm ĐKXĐ, quy đồng mẫu thức rồi khử mẫu, giải phương trình hệ quả và đối chiếu với ĐKXĐ.',
            answers: [
                { answerId: 'q6a1', content: '$x = 1$', is_correct: false, explanation: 'Nghiệm này vi phạm ĐKXĐ.' },
                { answerId: 'q6a2', content: '$x = 0$', is_correct: false, explanation: 'Nghiệm này vi phạm ĐKXĐ.' },
                { answerId: 'q6a3', content: 'Phương trình có nghiệm $x=1$', is_correct: false, explanation: 'Nghiệm $x=1$ không thỏa mãn ĐKXĐ.' },
                { answerId: 'q6a4', content: 'Phương trình vô nghiệm', is_correct: true, explanation: 'Phương trình có nghiệm $x=1$, nhưng vi phạm ĐKXĐ nên vô nghiệm.' },
            ],
        },
        {
            questionId: 'q7_multi', content: 'Phương trình $x^2 - 4 + (x+2)(2x-1) = 0$ tương đương với phương trình nào sau đây? (Chọn các đáp án đúng)', type: 'MULTIPLE_CHOICE',
            explanation: 'Phân tích $x^2-4$ thành $(x-2)(x+2)$, sau đó đặt nhân tử chung $(x+2)$ để đưa về phương trình tích.',
            answers: [
                { answerId: 'q7a1', content: '$(x+2)(3x-3) = 0$', is_correct: true, explanation: 'Đây là dạng tương đương.' },
                { answerId: 'q7a2', content: '$3(x+2)(x-1) = 0$', is_correct: true, explanation: 'Đây cũng là dạng tương đương.' },
                { answerId: 'q7a3', content: '$3x^2 + 3x - 6 = 0$', is_correct: true, explanation: 'Đây cũng là dạng tương đương.' },
                { answerId: 'q7a4', content: '$(x+2)(x-3) = 0$', is_correct: false, explanation: 'Sai khi cộng các hạng tử.' },
            ],
        },
        {
            questionId: 'q8', content: 'Một mảnh đất hình chữ nhật có chu vi 52m...', type: 'SINGLE_CHOICE',
            explanation: 'Lập hệ phương trình chu vi và diện tích vườn rau...',
            answers: [
                { answerId: 'q8a1', content: '16 m', is_correct: true, explanation: 'Chiều dài là 16m.' },
                { answerId: 'q8a2', content: '10 m', is_correct: false, explanation: 'Đây là chiều rộng.' },
                { answerId: 'q8a3', content: '14 m', is_correct: false, explanation: 'Đây là chiều dài vườn rau.' },
                { answerId: 'q8a4', content: '8 m', is_correct: false, explanation: 'Đây là chiều rộng vườn rau.' },
            ],
        },
        {
            questionId: 'q9', content: 'Hoa dự định mua một số áo đồng giá hết 600 nghìn...', type: 'SINGLE_CHOICE',
            explanation: 'Gọi giá dự định là $x$... Lập phương trình $600/(x-30) = 1.25 \\times (600/x)$',
            answers: [
                { answerId: 'q9a1', content: '150 nghìn đồng', is_correct: false, explanation: 'Đây là giá dự định ($x$).' },
                { answerId: 'q9a2', content: '120 nghìn đồng', is_correct: true, explanation: 'Giá đã mua (sau giảm) là $150 - 30 = 120$ nghìn.' },
                { answerId: 'q9a3', content: '100 nghìn đồng', is_correct: false, explanation: 'Tính toán sai.' },
                { answerId: 'q9a4', content: '180 nghìn đồng', is_correct: false, explanation: 'Tính toán sai.' },
            ],
        },
    ],
};

// ======================================================
// --- FUNCTIONAL HELPERS ---
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
    const navigate = useNavigate();

    // Tạm thời dùng mock data, sau này sẽ dùng state
    const [resultData, setResultData] = useState(null);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        // Mô phỏng API call để lấy kết quả chi tiết
        if (sessionId === MOCK_SESSION_ID) {
            setResultData(mockResultData);
        } else {
            // Trường hợp không tìm thấy session (404)
            setResultData(null); 
        }
    }, [sessionId]);

    if (!resultData) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>
                    Không tìm thấy kết quả bài làm
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/student/assignment')}>
                    Quay lại Trang Bài tập
                </Button>
            </Container>
        );
    }
    
    const session = resultData;
    const taken = session.exam_taken;

    // Lấy thông tin câu hỏi và kết quả của câu hiện tại
    const currentQuestionIndex = activeStep;
    const currentQuestion = session.questions[currentQuestionIndex];
    const currentResult = taken.answers_taken[currentQuestionIndex];
    const isCorrect = currentResult.is_correct === true;
    const isSkipped = currentResult.is_correct === 'skipped';
    
    const handleStepClick = (step) => {
        setActiveStep(step);
    };

    // Hàm lấy màu và icon dựa trên trạng thái câu hỏi
    const getStatusInfo = (result) => {
        if (result.is_correct === true) return { color: 'success', icon: <CheckCircleIcon /> };
        if (result.is_correct === false) return { color: 'error', icon: <CloseIcon /> };
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
                        <Typography variant="h3" sx={{ fontWeight: 700, color: isCorrect ? 'success.main' : red[600] }}>
                            {taken.final_score} / {session.exam.total_question}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Điểm số đạt được
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                            {session.exam.title}
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <MenuBookIcon fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="body1">Môn: {session.exam.category.subject}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="body1">Lớp: {session.exam.class.classname}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <EventAvailableIcon fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="body1">Ngày nộp: {new Date(taken.done_time).toLocaleDateString('vi-VN')}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="body1">Thời gian làm: {calculateDuration(taken.start_time, taken.done_time)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sx={{ mt: 1 }}>
                                <Chip label={`Đúng: ${taken.total_correct}`} color="success" sx={{ mr: 1 }} />
                                <Chip label={`Sai: ${taken.total_incorrect}`} color="error" sx={{ mr: 1 }} />
                                <Chip label={`Bỏ qua: ${taken.total_skipped}`} color="warning" />
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
                    <Stepper nonLinear activeStep={activeStep} sx={{ minWidth: `${session.questions.length * 50}px` }}>
                        {session.questions.map((q, index) => {
                            const statusInfo = getStatusInfo(taken.answers_taken[index]);
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
                <Card variant="outlined">
                    <CardContent>
                        {/* Trạng thái câu hỏi hiện tại */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" component="h3" sx={{ mr: 2 }}>
                                Câu {activeStep + 1}
                            </Typography>
                            <Chip 
                                label={isSkipped ? 'BỎ QUA' : (isCorrect ? 'CHÍNH XÁC' : 'CHƯA ĐÚNG')} 
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
                                let color = 'text.primary';
                                let backgroundColor = 'transparent';
                                if (answer.is_correct) {
                                    color = 'success.darker';
                                    backgroundColor = 'success.lighter';
                                } else if (isSelected) {
                                    color = 'error.darker';
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
                                                    {getAnswerPrefix(index)}. {ans.is_correct ? 'Đáp án ĐÚNG (Chi tiết):' : 'Đáp án SAI (Phân tích):'}
                                                </Typography>
                                                <LatexRenderer content={ans.explanation} />
                                            </Box>
                                        );
                                    })}
                            </Alert>
                        )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between' }}>
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
                            <Button onClick={() => handleStepClick(activeStep + 1)} disabled={activeStep === session.questions.length - 1} sx={{ ml: 1 }}>
                                Câu sau
                            </Button>
                        </Box>
                    </CardActions>
                </Card>
            </Paper>
        </Container>
    );
}