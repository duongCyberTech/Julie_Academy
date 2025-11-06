/*
 * File: frontend/src/pages/student/StudentPracticeSessionPage.jsx
 *
 * (SỬA LỖI LOGIC - KHÔNG TÌM THẤY CÂU HỎI KHI LÀM BÀI TẬP)
 *
 * Cập nhật:
 * 1. Mock data giờ chứa câu hỏi cho NHIỀU ID khác nhau
 * (cho cả Luyện tập và Bài tập).
 * 2. `useEffect` sẽ lọc câu hỏi chính xác dựa trên `sessionId`
 * nhận được từ URL (sửa lỗi 'Không tìm thấy câu hỏi').
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  FormControlLabel,
  LinearProgress,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepButton,
  Alert,
  Paper,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import CloseIcon from '@mui/icons-material/Close';

// Import Katex để render LaTeX
import 'katex/dist/katex.min.css';
import katex from 'katex';

import AppSnackbar from '../../components/SnackBar';

// ======================================================
// --- MOCK DATA (Cho cả Luyện tập và Bài tập) ---
// ======================================================

// ID Luyện tập (từ StudentPracticePage)
const PRACTICE_ID_1 = 'cd-c1-s1';
// ID Bài tập (từ StudentAssignmentPage)
const ASSIGNMENT_ID_1 = 'session_1';
const ASSIGNMENT_ID_4 = 'session_4';

// CSDL giả, chứa câu hỏi cho nhiều ID
const mockQuestionDatabase = [
  // --- 9 CÂU HỎI (Dùng cho cả Luyện tập 'cd-c1-s1' VÀ Bài tập 'session_1') ---
  {
    questionId: 'q1',
    content: 'Phương trình $(x - 5)(3x + 9) = 0$ có tập nghiệm là:',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    // Gán cho cả 2 ID
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
    answers: [
      { answerId: 'q1a1', content: '$S = \\{5\\}$', is_correct: false },
      { answerId: 'q1a2', content: '$S = \\{-3\\}$', is_correct: false },
      { answerId: 'q1a3', content: '$S = \\{5; -3\\}$', is_correct: true },
      { answerId: 'q1a4', content: '$S = \\{-5; 3\\}$', is_correct: false },
    ],
  },
  {
    questionId: 'q2',
    content:
      'Điều kiện xác định của phương trình $\\frac{2}{5x-3} = 1 + \\frac{1}{x+2}$ là gì?',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
    answers: [
      { answerId: 'q2a1', content: '$x \\ne \\frac{3}{5}$', is_correct: false },
      { answerId: 'q2a2', content: '$x \\ne -2$', is_correct: false },
      {
        answerId: 'q2a3',
        content: '$x \\ne \\frac{3}{5}$ và $x \\ne -2$',
        is_correct: true,
      },
      { answerId: 'q2a4', content: '$x \\ne 0$', is_correct: false },
    ],
  },
  {
    questionId: 'q3',
    content: 'Phương trình nào sau đây có thể quy về phương trình bậc nhất một ẩn?',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
    answers: [
      { answerId: 'q3a1', content: '$x^2 - 1 = 0$', is_correct: false },
      { answerId: 'q3a2', content: '$\\frac{1}{x} = 5$', is_correct: true },
      { answerId: 'q3a3', content: '$x^3 = 8$', is_correct: false },
      { answerId: 'q3a4', content: '$0x = 0$', is_correct: false },
    ],
  },
  {
    questionId: 'q4',
    content: 'Tìm tập nghiệm của phương trình $4x^2 - 16 = 5(x + 2)$.',
    level: 'MEDIUM',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
    answers: [
      {
        answerId: 'q4a1',
        content: '$S = \\{2; -\\frac{13}{4}\\}$',
        is_correct: false,
      },
      {
        answerId: 'q4a2',
        content: '$S = \\{-2; \\frac{13}{4}\\}$',
        is_correct: true,
      },
      { answerId: 'q4a3', content: '$S = \\{-2\\}$', is_correct: false },
      { answerId: 'q4a4', content: '$S = \\{\\frac{13}{4}\\}$', is_correct: false },
    ],
  },
  {
    questionId: 'q5',
    content: 'Giải phương trình $\\frac{x^2 - 6}{x} = x + \\frac{3}{2}$.',
    level: 'MEDIUM',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
    answers: [
      { answerId: 'q5a1', content: '$x = 4$', is_correct: false },
      { answerId: 'q5a2', content: '$x = -4$', is_correct: true },
      { answerId: 'q5a3', content: 'Phương trình vô nghiệm', is_correct: false },
      { answerId: 'q5a4', content: '$x = 0$', is_correct: false },
    ],
  },
  {
    questionId: 'q6',
    content: 'Giải phương trình $\\frac{4}{x(x-1)} + \\frac{3}{x} = \\frac{4}{x-1}$.',
    level: 'MEDIUM',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
    answers: [
      { answerId: 'q6a1', content: '$x = 1$', is_correct: false },
      { answerId: 'q6a2', content: '$x = 0$', is_correct: false },
      { answerId: 'q6a3', content: 'Phương trình có nghiệm $x=1$', is_correct: false },
      { answerId: 'q6a4', content: 'Phương trình vô nghiệm', is_correct: true },
    ],
  },
  {
    questionId: 'q7_multi',
    content:
      'Phương trình $x^2 - 4 + (x+2)(2x-1) = 0$ tương đương với phương trình nào sau đây? (Chọn các đáp án đúng)',
    level: 'MEDIUM',
    type: 'MULTIPLE_CHOICE',
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
    answers: [
      { answerId: 'q7a1', content: '$(x+2)(3x-3) = 0$', is_correct: true },
      { answerId: 'q7a2', content: '$3(x+2)(x-1) = 0$', is_correct: true },
      { answerId: 'q7a3', content: '$3x^2 + 3x - 6 = 0$', is_correct: true },
      { answerId: 'q7a4', content: '$(x+2)(x-3) = 0$', is_correct: false },
    ],
  },
  {
    questionId: 'q8',
    content:
      'Một mảnh đất hình chữ nhật có chu vi 52m. Làm vườn rau hình chữ nhật bên trong, diện tích 112 $m^2$, lối đi xung quanh rộng 1m. Tính chiều dài mảnh đất ban đầu.',
    level: 'HARD',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
    answers: [
      { answerId: 'q8a1', content: '16 m', is_correct: true },
      { answerId: 'q8a2', content: '10 m', is_correct: false },
      { answerId: 'q8a3', content: '14 m', is_correct: false },
      { answerId: 'q8a4', content: '8 m', is_correct: false },
    ],
  },
  {
    questionId: 'q9',
    content:
      'Hoa dự định mua một số áo đồng giá hết 600 nghìn. Cửa hàng giảm 30 nghìn/chiếc nên Hoa mua được gấp 1.25 lần số lượng dự định. Tính giá tiền mỗi chiếc áo Hoa đã mua (giá sau giảm).',
    level: 'HARD',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
    answers: [
      { answerId: 'q9a1', content: '150 nghìn đồng', is_correct: false },
      { answerId: 'q9a2', content: '120 nghìn đồng', is_correct: true },
      { answerId: 'q9a3', content: '100 nghìn đồng', is_correct: false },
      { answerId: 'q9a4', content: '180 nghìn đồng', is_correct: false },
    ],
  },
  
  // --- 3 CÂU HỎI (Dùng cho Bài tập 'session_4') ---
  {
    questionId: 'q10',
    content: 'Câu hỏi 1 (cho Bài tập 2): $1+1 = ?$ (ID: session_4)',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [ASSIGNMENT_ID_4],
    answers: [
      { answerId: 'q10a1', content: '$2$', is_correct: true },
      { answerId: 'q10a2', content: '$3$', is_correct: false },
    ],
  },
  {
    questionId: 'q11',
    content: 'Câu hỏi 2 (cho Bài tập 2): $10-5 = ?$ (ID: session_4)',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [ASSIGNMENT_ID_4],
    answers: [
      { answerId: 'q11a1', content: '$5$', is_correct: true },
      { answerId: 'q11a2', content: '$4$', is_correct: false },
    ],
  },
  {
    questionId: 'q12',
    content: 'Câu hỏi 3 (cho Bài tập 2): $2 \\times 3 = ?$ (ID: session_4)',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [ASSIGNMENT_ID_4],
    answers: [
      { answerId: 'q12a1', content: '$6$', is_correct: true },
      { answerId: 'q12a2', content: '$5$', is_correct: false },
    ],
  },
];
// ======================================================
// --- END MOCK DATA ---
// ======================================================

/*
 * Component render LaTeX từ văn bản thô
 */
const LatexRenderer = ({ content }) => {
  const renderMath = (text) => {
    if (!text) return null;
    try {
      const parts = text.split(/(\$.*?\S\$)/g);
      return parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const latex = part.substring(1, part.length - 1);
          try {
            const html = katex.renderToString(latex, {
              throwOnError: false,
              displayMode: false,
            });
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

export default function StudentPracticeSessionPage() {
  const { sessionId } = useParams(); // ID này có thể là 'cd-c1-s1' HOẶC 'session_1'
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(null);

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // 1. Tải câu hỏi khi trang được mở
  useEffect(() => {
    setIsLoading(true);
    console.log(`Bắt đầu phiên làm bài cho ID: ${sessionId}`);
    
    setTimeout(() => {
      // (SỬA LỖI LOGIC)
      // Lọc CSDL giả dựa trên ID từ URL
      const fetchedQuestions = mockQuestionDatabase.filter(
        (q) => q.assignTo && q.assignTo.includes(sessionId)
      );
      
      setQuestions(fetchedQuestions);
      setIsLoading(false);
      setIsFinished(false);
      setScore(null);
      setActiveStep(0);
      setSelectedAnswers({});
    }, 500);
  }, [sessionId]);

  const currentQuestion = questions[activeStep];

  // 2. Xử lý khi chọn đáp án
  const handleAnswerChange = (questionId, answerId, isMultiChoice) => {
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };
      
      if (isMultiChoice) {
        const currentSelections = prev[questionId] || [];
        if (currentSelections.includes(answerId)) {
          newAnswers[questionId] = currentSelections.filter((id) => id !== answerId);
        } else {
          newAnswers[questionId] = [...currentSelections, answerId];
        }
      } else {
        newAnswers[questionId] = answerId;
      }
      return newAnswers;
    });
  };

  // 3. Điều hướng
  const handleStepClick = (step) => {
    if (!isFinished) {
      setActiveStep(step);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // 4. Các hàm SnackBar
  const showSnackBar = (message, severity) => {
    setSnackbarState({ open: true, message, severity });
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  // 5. Xử lý Nộp bài
  const handleSubmit = () => {
    let correctCount = 0;
    
    questions.forEach((q) => {
      const correctAnswers = q.answers
        .filter((a) => a.is_correct)
        .map((a) => a.answerId);
      const userAnswers = selectedAnswers[q.questionId];

      if (q.type === 'SINGLE_CHOICE') {
        if (userAnswers === correctAnswers[0]) {
          correctCount++;
        }
      } else if (q.type === 'MULTIPLE_CHOICE') {
        if (
          userAnswers &&
          userAnswers.length === correctAnswers.length &&
          userAnswers.every((id) => correctAnswers.includes(id))
        ) {
          correctCount++;
        }
      }
    });

    const finalScore = { correct: correctCount, total: questions.length };
    setScore(finalScore);
    setIsFinished(true);
    
    showSnackBar(
      `Hoàn thành! Bạn đúng ${finalScore.correct} / ${finalScore.total} câu.`,
      'success'
    );
  };
  
  // 6. Làm lại
  const handleRetry = () => {
    setIsLoading(false);
    setIsFinished(false);
    setScore(null);
    setActiveStep(0);
    setSelectedAnswers({});
    showSnackBar('Đã tải lại. Bắt đầu làm lại!', 'info');
  }

  // --- Render ---

  if (isLoading) {
    return <Container><LinearProgress sx={{ mt: 4 }} /></Container>;
  }

  // (SỬA LỖI) Hiển thị thông báo khi lọc không có câu hỏi
  if (questions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Không tìm thấy câu hỏi
        </Typography>
        <Typography color="text.secondary">
          Không tìm thấy câu hỏi cho ID: {sessionId}.
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 3 }}
          onClick={() => navigate('/student/practice')} // Quay về Luyện tập (trang chính)
        >
          Quay lại Thư viện
        </Button>
         <AppSnackbar
            open={snackbarState.open}
            message={snackbarState.message}
            severity={snackbarState.severity}
            onClose={handleCloseSnackbar}
          />
      </Container>
    );
  }

  // Hàm kiểm tra đúng/sai
  const isQuestionCorrect = (q) => {
    const correctAnswers = q.answers
      .filter((a) => a.is_correct)
      .map((a) => a.answerId);
    const userAnswers = selectedAnswers[q.questionId];
    
    if (q.type === 'SINGLE_CHOICE') {
      return userAnswers === correctAnswers[0];
    } else if (q.type === 'MULTIPLE_CHOICE') {
      return (
        userAnswers &&
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((id) => correctAnswers.includes(id))
      );
    }
    return false;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Phiên Luyện tập
      </Typography>

      {/* 1. Thanh Stepper */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, overflowX: 'auto' }}>
        <Stepper nonLinear activeStep={activeStep} sx={{ minWidth: '600px' }}>
          {questions.map((q, index) => (
            <Step key={q.questionId} completed={selectedAnswers[q.questionId] !== undefined}>
              <StepButton 
                color="inherit" 
                onClick={() => handleStepClick(index)}
                icon={
                  isFinished 
                  ? (isQuestionCorrect(q) ? <CheckCircleIcon color="success" /> : <CloseIcon color="error" />)
                  : (index + 1)
                }
              />
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      {/* 2. Khung hiển thị kết quả (nếu đã xong) */}
      {isFinished && score && (
        <Alert 
          severity={score.correct / score.total > 0.5 ? "success" : "warning"}
          sx={{ mb: 3, '.MuiAlert-message': { width: '100%' } }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Button color="inherit" size="small" onClick={() => navigate('/student/assignment')}>
                Về trang Bài tập
              </Button>
               <Button color="inherit" size="small" onClick={handleRetry} startIcon={<ReplayIcon />}>
                Làm lại
              </Button>
            </Box>
          }
        >
          <Typography variant="h6">
            Kết quả: {score.correct} / {score.total}
          </Typography>
        </Alert>
      )}

      {/* 3. Thẻ câu hỏi và đáp án */}
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h6" gutterBottom component="h2">
            Câu {activeStep + 1}:
          </Typography>
          
          <Box sx={{ my: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, minHeight: 100, fontSize: '1.1rem' }}>
            <LatexRenderer content={currentQuestion.content} />
          </Box>

          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>Chọn đáp án:</Typography>
            
            {/* --- Single Choice --- */}
            {currentQuestion.type === 'SINGLE_CHOICE' && (
              <RadioGroup
                aria-label="answers"
                value={selectedAnswers[currentQuestion.questionId] || null}
                onChange={(e) => handleAnswerChange(currentQuestion.questionId, e.target.value, false)}
              >
                {currentQuestion.answers.map((answer) => (
                  <FormControlLabel
                    key={answer.answerId}
                    value={answer.answerId}
                    disabled={isFinished}
                    control={<Radio />}
                    label={<LatexRenderer content={answer.content} />}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      ...(selectedAnswers[currentQuestion.questionId] === answer.answerId && !isFinished && {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.lighter',
                      }),
                      ...(isFinished && answer.is_correct && {
                         borderColor: 'success.main',
                         backgroundColor: 'success.lighter',
                      }),
                      ...(isFinished && !answer.is_correct && selectedAnswers[currentQuestion.questionId] === answer.answerId && {
                         borderColor: 'error.main',
                         backgroundColor: 'error.lighter',
                      }),
                    }}
                  />
                ))}
              </RadioGroup>
            )}
            
            {/* --- Multiple Choice --- */}
            {currentQuestion.type === 'MULTIPLE_CHOICE' && (
              <FormGroup>
                 {currentQuestion.answers.map((answer) => {
                   const isSelected = (selectedAnswers[currentQuestion.questionId] || []).includes(answer.answerId);
                   return (
                     <FormControlLabel
                        key={answer.answerId}
                        disabled={isFinished}
                        control={
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => handleAnswerChange(currentQuestion.questionId, answer.answerId, true)}
                          />
                        }
                        label={<LatexRenderer content={answer.content} />}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          ...(isSelected && !isFinished && {
                            borderColor: 'primary.main',
                            backgroundColor: 'primary.lighter',
                          }),
                          ...(isFinished && answer.is_correct && {
                             borderColor: 'success.main',
                             backgroundColor: 'success.lighter',
                          }),
                          ...(isFinished && !answer.is_correct && isSelected && {
                             borderColor: 'error.main',
                             backgroundColor: 'error.lighter',
                          }),
                        }}
                     />
                   )
                 })}
              </FormGroup>
            )}

          </Box>
        </CardContent>
      </Card>

      {/* 4. Thanh điều hướng */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          p: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Câu trước
        </Button>
        
        {activeStep === questions.length - 1 && !isFinished && (
           <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<CheckCircleIcon />}
            onClick={handleSubmit}
          >
            Nộp bài
          </Button>
        )}
        
        {activeStep < questions.length - 1 && (
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNext}
          >
            Câu sau
          </Button>
        )}
      </Box>

      {/* 5. SnackBar */}
      <AppSnackbar
        open={snackbarState.open}
        message={snackbarState.message}
        severity={snackbarState.severity}
        onClose={handleCloseSnackbar}
      />
    </Container>
  );
}