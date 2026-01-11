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
  LinearProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import HelpIcon from '@mui/icons-material/Help';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Import Katex
import 'katex/dist/katex.min.css';
import katex from 'katex';

// Import MockData
import { mockQuestionDatabase } from './MockData';

// ... (Giữ nguyên phần HELPERS: LatexRenderer, getAnswerPrefix, isQuestionCorrect) ...
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

const getAnswerPrefix = (index) => String.fromCharCode(65 + index);

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

export default function StudentPracticeReviewPage() {
  // --- FIX LỖI QUAN TRỌNG Ở ĐÂY ---
  // AppRoutes định nghĩa là :reviewId, nên ta phải lấy reviewId và gán nó vào biến sessionId
  const { reviewId } = useParams(); 
  const sessionId = reviewId; // Gán lại tên cho khớp với logic bên dưới
  
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Debug: Kiểm tra xem ID có nhận được không
    console.log("Review Page - Session ID:", sessionId);

    const storedAnswers = sessionStorage.getItem(`practice_answers_${sessionId}`);
    
    setTimeout(() => {
      let fetchedQuestions = mockQuestionDatabase.filter(q => q.assignTo && q.assignTo.includes(sessionId));
      
      if (fetchedQuestions.length === 0) {
        console.warn("Dev Mode: ID không khớp, load toàn bộ mock data.");
        fetchedQuestions = mockQuestionDatabase;
      }

      setQuestions(fetchedQuestions);

      if (storedAnswers) {
        const loadedAnswers = JSON.parse(storedAnswers);
        setSelectedAnswers(loadedAnswers);
        console.log("Loaded Answers:", loadedAnswers); 
      } else {
        console.warn(`Không tìm thấy dữ liệu bài làm cho ID: ${sessionId}`);
      }
      
      setIsLoading(false);
    }, 500);
  }, [sessionId]);

  if (isLoading) {
    return <Container><LinearProgress sx={{ mt: 4 }} /></Container>;
  }
  
  if (questions.length === 0) {
      return <Container sx={{mt:4}}><Alert severity="error">Không tìm thấy dữ liệu câu hỏi.</Alert></Container>
  }

  const currentQuestion = questions[activeStep];
  const currentQId = currentQuestion?.questionId;

  // Logic kiểm tra trạng thái
  const isCorrect = isQuestionCorrect(currentQuestion, selectedAnswers);
  const userAns = selectedAnswers[currentQId];
  // Kiểm tra kỹ hơn: phải khác undefined/null VÀ nếu là mảng thì phải có phần tử
  const isAnswered = userAns !== undefined && userAns !== null && (Array.isArray(userAns) ? userAns.length > 0 : true);
  
  const statusLabel = !isAnswered ? 'BỎ QUA' : (isCorrect ? 'CHÍNH XÁC' : 'CHƯA ĐÚNG');
  const statusColor = !isAnswered ? 'warning' : (isCorrect ? 'success' : 'error');

  const handleStepClick = (step) => setActiveStep(step);
  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, questions.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Xem lại chi tiết bài làm
      </Typography>

      {/* Stepper */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, overflowX: 'auto' }}>
        <Stepper nonLinear activeStep={activeStep} sx={{ minWidth: '600px' }}>
          {questions.map((q, index) => {
            const uAns = selectedAnswers[q.questionId];
            const hasAns = uAns !== undefined && uAns !== null && (Array.isArray(uAns) ? uAns.length > 0 : true);
            const qCorrect = isQuestionCorrect(q, selectedAnswers);

            return (
              <Step key={q.questionId} completed={hasAns}>
                <StepButton 
                  color="inherit" 
                  onClick={() => handleStepClick(index)}
                  icon={
                    !hasAns 
                    ? <HelpIcon color="warning" /> 
                    : (qCorrect ? <CheckCircleIcon color="success" /> : <CloseIcon color="error" />)
                  }
                />
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      {/* Chi tiết câu hỏi */}
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ mr: 2 }}>
              Câu {activeStep + 1}
            </Typography>
            <Chip label={statusLabel} color={statusColor} sx={{ fontWeight: 600 }} />
          </Box>

          <Box sx={{ my: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, minHeight: 100, fontSize: '1.1rem' }}>
            <LatexRenderer content={currentQuestion.content} />
          </Box>

          <Typography variant="h6" gutterBottom>Chi tiết đáp án</Typography>

          <Box>
            {currentQuestion.answers.map((answer, index) => {
              const prefix = getAnswerPrefix(index);
              
              const isSelected = currentQuestion.type === 'SINGLE_CHOICE' 
                ? selectedAnswers[currentQId] === answer.answerId
                : (selectedAnswers[currentQId] || []).includes(answer.answerId);
              
              let borderColor = 'divider';
              let bgColor = 'transparent';

              if (answer.is_correct) {
                borderColor = 'success.main';
                bgColor = 'rgba(46, 125, 50, 0.08)'; 
              } else if (isSelected) {
                borderColor = 'error.main';
                bgColor = 'rgba(211, 47, 47, 0.08)';
              }

              return (
                <Box
                  key={answer.answerId}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: borderColor,
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: bgColor,
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography sx={{ mr: 1, fontWeight: 'bold', mt: '2px' }}>{prefix}.</Typography>
                  <Box sx={{ flexGrow: 1, mt: '2px' }}>
                    <LatexRenderer content={answer.content} />
                  </Box>
                  
                  {isSelected && (
                    <Chip size="small" label="Bạn chọn" color={answer.is_correct ? 'success' : 'error'} sx={{ ml: 2, flexShrink: 0 }} />
                  )}
                  {!isSelected && answer.is_correct && (
                    <Chip size="small" label="Đáp án đúng" variant="outlined" color="success" sx={{ ml: 2, flexShrink: 0 }} />
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Lời giải */}
          {currentQuestion.explanation && (
            <Alert severity="success" icon={false} sx={{ mt: 3, backgroundColor: '#f1f8e9', color: '#1b5e20' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>🎉 Lời giải</Typography>
              <Box sx={{ mb: 2 }}>
                <LatexRenderer content={currentQuestion.explanation} />
              </Box>
              {currentQuestion.answers.map((ans, index) => {
                if (!ans.explanation) return null;
                return (
                  <Box key={index} sx={{ borderTop: '1px dashed #66bb6a', pt: 1, mt: 1 }}>
                    <Typography variant="body2" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {getAnswerPrefix(index)}. {ans.is_correct ? 'Đúng' : 'Sai'}:
                    </Typography>
                    <LatexRenderer content={ans.explanation} />
                  </Box>
                );
              })}
            </Alert>
          )}
        </CardContent>
        
        {/* Điều hướng */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderTop: '1px solid #eee' }}>
          <Button variant="outlined" onClick={() => navigate('/student/practice')}>Thư viện</Button>
          <Box>
            <Button onClick={handleBack} disabled={activeStep === 0}>Câu trước</Button>
            <Button onClick={handleNext} disabled={activeStep === questions.length - 1} sx={{ ml: 1 }} endIcon={<ArrowForwardIcon />}>Câu sau</Button>
          </Box>
        </Box>
      </Card>
    </Container>
  );
}