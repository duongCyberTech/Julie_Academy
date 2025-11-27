/*
 * File: frontend/src/pages/student/StudentPracticeReviewPage.jsx
 *
 * (TRANG XEM LẠI CHI TIẾT CÂU HỎI TRONG LUỒNG LUYỆN TẬP - ĐÃ KHẮC PHỤC LỖI HIỂN THỊ 9 CÂU)
 *
 * Tính năng:
 * 1. Đồng bộ 9 câu hỏi từ SessionPage.
 * 2. Đọc đáp án đã chọn (selectedAnswers) và tính toán trạng thái ĐÚNG/SAI/BỎ QUA động.
 * 3. Hiển thị Stepper, nội dung câu hỏi và Lời giải chi tiết.
 */

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Chip,
    Paper,
    Stepper,
    Step,
    StepButton,
    Alert,
    Card,
    CardContent,
    Divider,
    LinearProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

// Import Katex
import 'katex/dist/katex.min.css';
import katex from 'katex';

// ======================================================
// --- MOCK DATA ĐỒNG BỘ 9 CÂU (Lấy từ SessionPage) ---
// ======================================================

const MOCK_PRACTICE_ID = 'cd-c1-s1';

const mockQuestionDatabase = [
    // Q1: Đúng là {5; -3}
    {
        questionId: 'q1', content: 'Phương trình $(x - 5)(3x + 9) = 0$ có tập nghiệm là:', explanation: 'Để giải phương trình tích $(ax+b)(cx+d)=0$, ta giải $ax+b=0$ và $cx+d=0$. Nghiệm là tập hợp các giá trị tìm được.', type: 'SINGLE_CHOICE', assignTo: [MOCK_PRACTICE_ID],
        answers: [
            { answerId: 'q1a1', content: '$S = \\{5\\}$', is_correct: false, explanation: 'Chỉ có nghiệm $x=5$, thiếu $x=-3$.' },
            { answerId: 'q1a2', content: '$S = \\{-3\\}$', is_correct: false, explanation: 'Chỉ có nghiệm $x=-3$, thiếu $x=5$.' },
            { answerId: 'q1a3', content: '$S = \\{5; -3\\}$', is_correct: true, explanation: 'Giải $x-5=0 \\implies x=5$.' },
            { answerId: 'q1a4', content: '$S = \\{-5; 3\\}$', is_correct: false, explanation: 'Sai dấu các nghiệm.' },
        ],
    },
    // Q2: Đúng là x ≠ 3/5 và x ≠ -2
    {
        questionId: 'q2', content: 'Điều kiện xác định của phương trình $\\frac{2}{5x-3} = 1 + \\frac{1}{x+2}$ là gì?', explanation: 'Điều kiện xác định của phương trình chứa ẩn ở mẫu là điều kiện để tất cả các mẫu thức khác 0.', type: 'SINGLE_CHOICE', assignTo: [MOCK_PRACTICE_ID],
        answers: [
            { answerId: 'q2a1', content: '$x \\ne \\frac{3}{5}$', is_correct: false, explanation: 'Thiếu điều kiện cho mẫu $x+2$.' },
            { answerId: 'q2a2', content: '$x \\ne -2$', is_correct: false, explanation: 'Thiếu điều kiện cho mẫu $5x-3$.' },
            { answerId: 'q2a3', content: '$x \\ne \\frac{3}{5}$ và $x \\ne -2$', is_correct: true, explanation: 'Mẫu $5x-3 \\ne 0$. Mẫu $x+2 \\ne 0$.' },
            { answerId: 'q2a4', content: '$x \\ne 0$', is_correct: false, explanation: 'Mẫu số không phải là x.' },
        ],
    },
    // Q3: Đúng là 1/x = 5
    {
        questionId: 'q3', content: 'Phương trình nào sau đây có thể quy về phương trình bậc nhất một ẩn?', explanation: 'Phương trình bậc nhất một ẩn có dạng $ax+b=0$ ($a \\ne 0$).', type: 'SINGLE_CHOICE', assignTo: [MOCK_PRACTICE_ID],
        answers: [
            { answerId: 'q3a1', content: '$x^2 - 1 = 0$', is_correct: false, explanation: 'Đây là phương trình bậc hai.' },
            { answerId: 'q3a2', content: '$\\frac{1}{x} = 5$', is_correct: true, explanation: 'Quy đồng: $5x - 1 = 0$.' },
        ],
    },
    // Q4: Đúng là {-2; 13/4}
    {
        questionId: 'q4', content: 'Tìm tập nghiệm của phương trình $4x^2 - 16 = 5(x + 2)$.', explanation: 'Phân tích vế trái thành $4(x-2)(x+2)$, chuyển vế và đặt nhân tử chung $(x+2)$ để đưa về phương trình tích.', type: 'SINGLE_CHOICE', assignTo: [MOCK_PRACTICE_ID],
        answers: [
            { answerId: 'q4a1', content: '$S = \\{2; -\\frac{13}{4}\\}$', is_correct: false, explanation: 'Sai nghiệm.' },
            { answerId: 'q4a2', content: '$S = \\{-2; \\frac{13}{4}\\}$', is_correct: true, explanation: '$(x+2)(4x-13)=0$.' },
            { answerId: 'q4a3', content: '$S = \\{-2\\}$', is_correct: false, explanation: 'Thiếu nghiệm.' },
            { answerId: 'q4a4', content: '$S = \\{\\frac{13}{4}\\}$', is_correct: false, explanation: 'Thiếu nghiệm.' },
        ],
    },
    // Q5: Đúng là x = -4
    {
        questionId: 'q5', content: 'Giải phương trình $\\frac{x^2 - 6}{x} = x + \\frac{3}{2}$.', explanation: 'Tìm ĐKXĐ, quy đồng khử mẫu, giải phương trình hệ quả, sau đó kiểm tra nghiệm với ĐKXĐ.', type: 'SINGLE_CHOICE', assignTo: [MOCK_PRACTICE_ID],
        answers: [
            { answerId: 'q5a1', content: '$x = 4$', is_correct: false, explanation: 'Sai dấu.' },
            { answerId: 'q5a2', content: '$x = -4$', is_correct: true, explanation: 'Kết quả $x=-4$.' },
        ],
    },
    // Q6: Đúng là Vô nghiệm
    {
        questionId: 'q6', content: 'Giải phương trình $\\frac{4}{x(x-1)} + \\frac{3}{x} = \\frac{4}{x-1}$.', explanation: 'Tìm ĐKXĐ, quy đồng mẫu thức rồi khử mẫu, giải phương trình hệ quả và đối chiếu với ĐKXĐ.', type: 'SINGLE_CHOICE', assignTo: [MOCK_PRACTICE_ID],
        answers: [
            { answerId: 'q6a4', content: 'Phương trình vô nghiệm', is_correct: true, explanation: 'Nghiệm $x=1$, nhưng vi phạm ĐKXĐ nên vô nghiệm.' },
        ],
    },
    // Q7: Đúng là (x+2)(3x-3)=0
    {
        questionId: 'q7_multi', content: 'Phương trình $x^2 - 4 + (x+2)(2x-1) = 0$ tương đương với phương trình nào sau đây? (Chọn các đáp án đúng)', explanation: 'Phân tích $x^2-4$ thành $(x-2)(x+2)$...', type: 'MULTIPLE_CHOICE', assignTo: [MOCK_PRACTICE_ID],
        answers: [
            { answerId: 'q7a1', content: '$(x+2)(3x-3) = 0$', is_correct: true, explanation: 'Dạng tương đương.' },
        ],
    },
    // Q8: Đúng là 16 m
    {
        questionId: 'q8', content: 'Một mảnh đất hình chữ nhật có chu vi 52m...', explanation: 'Lập hệ phương trình chu vi và diện tích vườn rau...', type: 'SINGLE_CHOICE', assignTo: [MOCK_PRACTICE_ID],
        answers: [
            { answerId: 'q8a1', content: '16 m', is_correct: true, explanation: 'Chiều dài là 16m.' },
        ],
    },
    // Q9: Đúng là 120 nghìn đồng
    {
        questionId: 'q9', content: 'Hoa dự định mua một số áo đồng giá hết 600 nghìn...', explanation: 'Gọi giá dự định là $x$... Lập phương trình $600/(x-30) = 1.25 \\times (600/x)$', type: 'SINGLE_CHOICE', assignTo: [MOCK_PRACTICE_ID],
        answers: [
            { answerId: 'q9a2', content: '120 nghìn đồng', is_correct: true, explanation: 'Giá đã mua (sau giảm) là $150 - 30 = 120$ nghìn.' },
        ],
    },
];
// ======================================================
// --- FUNCTIONAL HELPERS ---
// ======================================================

const LatexRenderer = ({ content }) => {
    // ... (Code LatexRenderer)
    const renderMath = (text) => {
        if (!text) return null;
        try {
          const parts = text.split(/(\$.*?\S\$)/g);
          return parts.map((part, index) => {
            if (part.startsWith('$') && part.endsWith('$')) {
              const latex = part.substring(1, part.length - 1);
              try {
                const html = katex.renderToString(latex, { throwOnError: false, displayMode: false, });
                return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
              } catch (e) { return <span key={index}>{part}</span>; }
            }
            return <span key={index}>{part}</span>;
          });
        } catch (e) { return <span>{text}</span>; }
      };
      return <>{renderMath(content)}</>;
};

const getAnswerPrefix = (index) => String.fromCharCode(65 + index);

const isQuestionCorrect = (q, selectedAnswers) => {
    const correctAnswers = q.answers.filter((a) => a.is_correct).map((a) => a.answerId);
    const userAnswers = selectedAnswers[q.questionId];

    if (q.type === 'SINGLE_CHOICE') {
        // SC: phải là string và khớp
        return userAnswers && typeof userAnswers === 'string' && userAnswers === correctAnswers[0];
    } else if (q.type === 'MULTIPLE_CHOICE') {
        const userArray = userAnswers || [];
        // MC: phải khớp số lượng và mọi phần tử phải khớp
        return (
            userArray.length === correctAnswers.length &&
            userArray.every((id) => correctAnswers.includes(id))
        );
    }
    return false;
};

// ======================================================
// --- MAIN COMPONENT ---
// ======================================================

export default function StudentPracticeReviewPage() {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [activeStep, setActiveStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);

        // 🔥 Đọc dữ liệu đã lưu trữ từ SessionStorage
        const storedAnswers = sessionStorage.getItem(`practice_answers_${sessionId}`);
        
        setTimeout(() => {
            const fetchedQuestions = mockQuestionDatabase.filter(q => q.assignTo && q.assignTo.includes(sessionId));

            if (storedAnswers && fetchedQuestions.length > 0) {
                // Tải dữ liệu đã lưu
                let loadedAnswers = JSON.parse(storedAnswers);
                
                setSelectedAnswers(loadedAnswers);
                setQuestions(fetchedQuestions);
            } else {
                // Nếu không có dữ liệu, cảnh báo và chuyển về trang làm bài
                alert("Không tìm thấy dữ liệu phiên luyện tập trước đó. Vui lòng làm bài trước.");
                navigate(`/student/practice/session/${sessionId}`, { replace: true });
                return;
            }
            setIsLoading(false);
        }, 500);
    }, [sessionId, navigate]);

    if (isLoading) {
        return <Container><LinearProgress sx={{ mt: 4 }} /></Container>;
    }
    
    const currentQuestion = questions[activeStep];
    const currentQId = currentQuestion?.questionId;

    // Tính toán kết quả cho câu hiện tại (động)
    const currentResult = {
        is_correct: isQuestionCorrect(currentQuestion, selectedAnswers),
        selected: currentQuestion.type === 'SINGLE_CHOICE' 
            ? (selectedAnswers[currentQId] ? [selectedAnswers[currentQId]] : []) 
            : (selectedAnswers[currentQId] || []),
    };
    
    const isAnswered = currentResult.selected.length > 0;
    const isSkipped = !isAnswered;
    
    const handleStepClick = (step) => {
        setActiveStep(step);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Xem lại chi tiết bài làm
            </Typography>

            {/* 1. Thanh Stepper */}
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, overflowX: 'auto' }}>
                <Stepper nonLinear activeStep={activeStep} sx={{ minWidth: '600px' }}>
                    {questions.map((q, index) => {
                        const isCorrect = isQuestionCorrect(q, selectedAnswers);
                        const isAnswered = (selectedAnswers[q.questionId] !== undefined) && (typeof selectedAnswers[q.questionId] === 'string' || selectedAnswers[q.questionId].length > 0);
                        
                        return (
                            <Step key={q.questionId} completed={isAnswered}>
                                <StepButton 
                                    color="inherit" 
                                    onClick={() => handleStepClick(index)}
                                    icon={
                                        !isAnswered ? <Chip label="B" size="small" color="warning"/> : (isCorrect ? <CheckCircleIcon color="success" /> : <CloseIcon color="error" />)
                                    }
                                >
                                    {index + 1}
                                </StepButton>
                            </Step>
                        );
                    })}
                </Stepper>
            </Paper>

            {/* 2. Chi tiết câu hỏi */}
            <Card>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h3" sx={{ mr: 2 }}>
                            Câu {activeStep + 1}
                        </Typography>
                        <Chip 
                            label={isSkipped ? 'BỎ QUA' : (currentResult.is_correct ? 'CHÍNH XÁC' : 'CHƯA ĐÚNG')} 
                            color={isSkipped ? 'warning' : (currentResult.is_correct ? 'success' : 'error')}
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
                            <Typography variant="h6" gutterBottom sx={{ color: 'success.darker', fontWeight: 700 }}>
                                🎉 Lời giải
                            </Typography>

                            <Box sx={{ mb: 2, color: 'success.darker' }}>
                                <LatexRenderer content={currentQuestion.explanation} />
                            </Box>

                            {currentQuestion.answers
                                .map((ans, index) => {
                                    if (!ans.explanation) return null;

                                    return (
                                        <Box
                                            key={index}
                                            sx={{
                                                borderTop: '1px dashed',
                                                borderColor: 'success.main',
                                                pt: 1,
                                                mt: 1,
                                                color: 'success.darker',
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
                
                {/* Thanh điều hướng */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderTop: '1px solid #eee' }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/student/practice')}
                    >
                        Quay lại Trang chính
                    </Button>
                    <Box>
                        <Button onClick={() => handleStepClick(activeStep - 1)} disabled={activeStep === 0}>
                            Câu trước
                        </Button>
                        <Button onClick={() => handleStepClick(activeStep + 1)} disabled={activeStep === questions.length - 1} sx={{ ml: 1 }}>
                            Câu sau
                        </Button>
                    </Box>
                </Box>
            </Card>
        </Container>
    );
}