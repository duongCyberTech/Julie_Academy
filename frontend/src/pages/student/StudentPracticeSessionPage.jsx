/*
 * File: frontend/src/pages/student/StudentPracticeSessionPage.jsx
 *
 * (CHẾ ĐỘ LUYỆN TẬP - PHIÊN LÀM BÀI)
 *
 * Cập nhật giao diện:
 * - Fix lỗi ô tích (Checkbox/Radio) bị lệch so với text đáp án.
 * - Sử dụng MockData từ file ngoài.
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Radio,
  Checkbox,
  FormGroup,
  FormControlLabel,
  LinearProgress,
  Stepper,
  Step,
  StepButton,
  Alert,
  Paper,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

// Import Katex
import 'katex/dist/katex.min.css';
import katex from 'katex';

// Import Component phụ trợ
import AppSnackbar from '../../components/SnackBar';

// --- Import Mock Data ---
import { mockQuestionDatabase, PRACTICE_ID_1 } from './MockData';

// ======================================================
// --- HELPERS ---
// ======================================================

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

const getDifficultyChip = (level) => {
  const styles = {
    EASY: { label: 'Dễ', color: 'success' },
    MEDIUM: { label: 'Trung bình', color: 'warning' },
    HARD: { label: 'Khó', color: 'error' },
  };
  const style = styles[level?.toUpperCase()] || { label: level, color: 'default' };
  return <Chip label={style.label} color={style.color} size="small" />;
};

const getAnswerPrefix = (index) => String.fromCharCode(65 + index);

const saveSessionState = (sessionId, answers, checkedStatus) => {
  if (!sessionId) return;
  sessionStorage.setItem(`practice_answers_${sessionId}`, JSON.stringify(answers));
  sessionStorage.setItem(`practice_checked_${sessionId}`, JSON.stringify(checkedStatus));
};

const isQuestionCorrect = (q, selectedAnswers) => {
  const correctAnswers = q.answers.filter((a) => a.is_correct).map((a) => a.answerId);
  const userAnswers = selectedAnswers[q.questionId];

  if (!userAnswers) return false;

  if (q.type === 'SINGLE_CHOICE') {
    return userAnswers === correctAnswers[0];
  } else if (q.type === 'MULTIPLE_CHOICE') {
    const userArray = userAnswers || [];
    return (
      userArray.length === correctAnswers.length &&
      userArray.every((id) => correctAnswers.includes(id))
    );
  }
  return false;
};

// ======================================================
// --- COMPONENT CHÍNH ---
// ======================================================

export default function StudentPracticeSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [practiceAnswerChecked, setPracticeAnswerChecked] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // 1. Load câu hỏi
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const fetchedQuestions = mockQuestionDatabase.filter(
        (q) => q.assignTo && q.assignTo.includes(sessionId)
      );

      if (fetchedQuestions.length === 0) {
        console.warn("Dev: Không tìm thấy câu hỏi khớp ID, load toàn bộ.");
        setQuestions(mockQuestionDatabase);
      } else {
        setQuestions(fetchedQuestions);
      }

      setIsLoading(false);
      setActiveStep(0);
      setSelectedAnswers({});
      setPracticeAnswerChecked({});
      setIsFinished(false);
    }, 500);
  }, [sessionId]);

  const currentQuestion = questions[activeStep];
  const currentQId = currentQuestion?.questionId;

  // 2. Xử lý chọn đáp án
  const handleAnswerChange = (questionId, answerId, isMultiChoice) => {
    if (isFinished || practiceAnswerChecked[questionId]) return;

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

    if (!isMultiChoice) {
      const question = questions.find((q) => q.questionId === questionId);
      const answer = question.answers.find((a) => a.answerId === answerId);
      
      if (answer.is_correct) {
        showSnackBar('Chính xác!', 'success');
      } else {
        showSnackBar('Chưa đúng. Xem lời giải nhé.', 'error');
      }
      setPracticeAnswerChecked((prev) => ({ ...prev, [questionId]: true }));
    }
  };

  const handlePracticeCheckMulti = (q) => {
    const isCorrect = isQuestionCorrect(q, selectedAnswers);
    if (isCorrect) {
      showSnackBar('Chính xác!', 'success');
    } else {
      showSnackBar('Chưa đúng. Xem lời giải nhé.', 'error');
    }
    setPracticeAnswerChecked((prev) => ({ ...prev, [q.questionId]: true }));
  };

  // 3. Nộp bài
  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (isQuestionCorrect(q, selectedAnswers)) {
        correctCount++;
      }
    });

    const finalScore = { correct: correctCount, total: questions.length, skipped: 0 };
    
    questions.forEach(q => {
        if (!selectedAnswers[q.questionId] || (Array.isArray(selectedAnswers[q.questionId]) && selectedAnswers[q.questionId].length === 0)) {
            finalScore.skipped++;
        }
    });

    setIsFinished(true);
    saveSessionState(sessionId, selectedAnswers, practiceAnswerChecked);

    navigate(`/student/practice/result/${sessionId}`, { 
        state: { 
            score: finalScore,
            title: "Bài luyện tập phương trình",
            subject: "Toán 9"
        } 
    });
  };

  const handleStepClick = (step) => setActiveStep(step);
  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, questions.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const showSnackBar = (message, severity) => setSnackbarState({ open: true, message, severity });
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  if (isLoading) return <Container><LinearProgress sx={{ mt: 4 }} /></Container>;
  if (questions.length === 0) return <Container sx={{mt:4}}><Alert severity="warning">Không có dữ liệu câu hỏi.</Alert></Container>;

  const isCheckedPractice = practiceAnswerChecked[currentQId];
  const isDisabled = isFinished || isCheckedPractice;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Phiên Luyện tập
      </Typography>

      {/* Stepper */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, overflowX: 'auto' }}>
        <Stepper nonLinear activeStep={activeStep} sx={{ minWidth: '600px' }}>
          {questions.map((q, index) => {
            const isCorrectPractice = isQuestionCorrect(q, selectedAnswers);
            const isAnswered = selectedAnswers[q.questionId] !== undefined && selectedAnswers[q.questionId].length !== 0;
            const isChecked = practiceAnswerChecked[q.questionId];

            return (
              <Step key={q.questionId} completed={isAnswered}>
                <StepButton 
                  color="inherit" 
                  onClick={() => handleStepClick(index)}
                  icon={
                    isChecked 
                    ? (isCorrectPractice ? <CheckCircleIcon color="success" /> : <CloseIcon color="error" />)
                    : (index + 1)
                  }
                />
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      {/* Card Câu hỏi */}
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" gutterBottom component="h2" sx={{ mb: 0, mr: 2 }}>
              Câu {activeStep + 1}:
            </Typography>
            {getDifficultyChip(currentQuestion.level)}
          </Box>
          
          <Box sx={{ my: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, minHeight: 100, fontSize: '1.1rem' }}>
            <LatexRenderer content={currentQuestion.content} />
          </Box>

          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>Chọn đáp án:</Typography>
            <FormGroup>
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = currentQuestion.type === 'SINGLE_CHOICE'
                  ? selectedAnswers[currentQId] === answer.answerId
                  : (selectedAnswers[currentQId] || []).includes(answer.answerId);

                let cardBorderColor = 'divider';
                let cardBgColor = 'transparent';
                
                if (isCheckedPractice) {
                    if (answer.is_correct) {
                        cardBorderColor = 'success.main';
                        cardBgColor = 'rgba(46, 125, 50, 0.08)'; 
                    } else if (isSelected && !answer.is_correct) {
                        cardBorderColor = 'error.main';
                        cardBgColor = 'rgba(211, 47, 47, 0.08)';
                    }
                }

                return (
                  <FormControlLabel
                    key={answer.answerId}
                    disabled={isDisabled}
                    control={
                        currentQuestion.type === 'SINGLE_CHOICE' 
                        // --- FIX LỆCH: Bỏ padding mặc định và thêm margin top nhỏ ---
                        ? <Radio checked={isSelected} sx={{ p: 0.5, mt: '2px', mr: 1 }} /> 
                        : <Checkbox checked={isSelected} sx={{ p: 0.5, mt: '2px', mr: 1 }} />
                    }
                    label={
                      // --- FIX LỆCH: Chuyển về flex-start và căn text ---
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', pt: '2px' }}>
                        <Typography sx={{ mr: 1, fontWeight: 'bold' }}>{getAnswerPrefix(index)}.</Typography>
                        <Box sx={{ flexGrow: 1 }}>
                            <LatexRenderer content={answer.content} />
                        </Box>
                      </Box>
                    }
                    onChange={currentQuestion.type === 'SINGLE_CHOICE'
                      ? (e) => handleAnswerChange(currentQId, answer.answerId, false)
                      : () => handleAnswerChange(currentQId, answer.answerId, true)
                    }
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: cardBorderColor,
                      backgroundColor: cardBgColor,
                      borderRadius: 1,
                      mb: 1,
                      ml: 0,
                      width: '100%',
                      alignItems: 'flex-start', // Căn đỉnh Container
                      '& .MuiFormControlLabel-label': { width: '100%' },
                      // Tinh chỉnh margin-left âm nếu cần để sát lề hơn (tùy chọn)
                      // mx: 0
                    }}
                  />
                );
              })}
            </FormGroup>

            {currentQuestion.type === 'MULTIPLE_CHOICE' && !isCheckedPractice && (
              <Button
                onClick={() => handlePracticeCheckMulti(currentQuestion)}
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                startIcon={<CheckCircleIcon />}
              >
                Kiểm tra
              </Button>
            )}
          </Box>

          {/* Lời giải */}
          {isCheckedPractice && currentQuestion.explanation && (
            <Alert severity="success" icon={false} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>🎉 Lời giải</Typography>
              <Box sx={{ mb: 2 }}>
                <LatexRenderer content={currentQuestion.explanation} />
              </Box>
              {currentQuestion.answers.map((ans, index) => ans.explanation && (
                <Box key={index} sx={{ borderTop: '1px dashed #4caf50', pt: 1, mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {getAnswerPrefix(index)}. {ans.is_correct ? 'Đúng' : 'Sai'}
                  </Typography>
                  <LatexRenderer content={ans.explanation} />
                </Box>
              ))}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Điều hướng */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Câu trước
        </Button>

        {activeStep === questions.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<CheckCircleIcon />}
            onClick={handleSubmit}
            disabled={isFinished}
          >
            Nộp bài & Kết thúc
          </Button>
        ) : (
          <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext}>
            Câu sau
          </Button>
        )}
      </Box>

      <AppSnackbar
        open={snackbarState.open}
        message={snackbarState.message}
        severity={snackbarState.severity}
        onClose={handleCloseSnackbar}
      />
    </Container>
  );
}