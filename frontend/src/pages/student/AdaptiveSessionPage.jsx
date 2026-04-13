import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, Button, Paper, CircularProgress,
  Divider, Chip, Collapse, Fade, useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// API Services (Giữ nguyên theo logic hệ thống của bạn)
import { takeAdaptiveExam, getNextAdaptiveQuestion } from '../../services/ExamService';

// Render nội dung
import QuestionContentRenderer from '../../components/QuestionContentRenderer';

// =========================================
// STYLED COMPONENTS
// =========================================
const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 4px 20px rgba(0,0,0,0.02)',
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(2),
      padding: theme.spacing(3),
      borderRadius: '16px',
    }
  };
});

const AnswerCard = styled(Paper, {
  shouldForwardProp: (prop) => !['isSelected', 'isReviewing', 'isCorrect', 'isWrong'].includes(prop)
})(({ theme, isSelected, isReviewing, isCorrect, isWrong }) => {
  const isDark = theme.palette.mode === 'dark';
  let borderColor = alpha(theme.palette.divider, isDark ? 0.2 : 0.4);
  let bgColor = isDark ? alpha(theme.palette.background.paper, 0.4) : '#ffffff';

  if (isReviewing) {
    if (isCorrect) {
      borderColor = theme.palette.success.main;
      bgColor = alpha(theme.palette.success.main, isDark ? 0.15 : 0.08);
    } else if (isWrong) {
      borderColor = theme.palette.error.main;
      bgColor = alpha(theme.palette.error.main, isDark ? 0.15 : 0.08);
    }
  } else if (isSelected) {
    borderColor = theme.palette.primary.main;
    bgColor = alpha(theme.palette.primary.main, isDark ? 0.1 : 0.05);
  }

  return {
    padding: theme.spacing(2.5, 3),
    marginBottom: theme.spacing(2),
    borderRadius: '16px',
    border: `2px solid ${borderColor}`,
    backgroundColor: bgColor,
    cursor: isReviewing ? 'default' : 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: 'none',
    '&:hover': {
      borderColor: (!isReviewing && !isSelected) ? theme.palette.primary.main : borderColor,
    }
  };
});

const MiniExplanation = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  borderRadius: '12px',
  fontSize: '0.9rem',
  backgroundColor: alpha(theme.palette.info.main, 0.05),
  borderLeft: `4px solid ${theme.palette.info.main}`,
  '& .ql-formula': { fontSize: '0.95rem' }
}));

// =========================================
// MAIN COMPONENT
// =========================================
export default function StudentAdaptiveSessionPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [etId, setEtId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [step, setStep] = useState('LOADING_INIT'); 
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

  useEffect(() => {
    const startExam = async () => {
      try {
        const res = await takeAdaptiveExam(categoryId);
        const data = res.data?.data || res.data;
        if (data?.questions?.[0]) {
          setEtId(data.exam_info.et_id);
          setCurrentQuestion(data.questions[0]);
          setStep('ANSWERING');
        } else {
          navigate('/student/adaptive');
        }
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      }
    };
    startExam();
  }, [categoryId, navigate]);

  const handleCheckAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    const correctAns = currentQuestion.answers?.find(a => a.is_correct);
    const isCorrect = correctAns && parseInt(selectedAnswer) === correctAns.aid;
    setIsAnswerCorrect(isCorrect);
    setStep('REVIEWING');
  };

  const handleNextQuestion = async () => {
    setStep('LOADING_NEXT');
    try {
      const payload = {
        et_id: etId,
        question_id: currentQuestion.ques_id,
        answers: [parseInt(selectedAnswer)],
        index: currentQuestion.index,
        level: currentQuestion.level
      };

      const res = await getNextAdaptiveQuestion(categoryId, payload);
      const nextQues = res.data?.data || res.data;

      // FIX LỖI MAP: Kiểm tra nếu không có câu hỏi mới hoặc backend báo kết thúc
      if (!nextQues || !nextQues.ques_id || !nextQues.answers) {
        navigate(`/student/adaptive/result/${etId}`);
        return;
      }

      setCurrentQuestion(nextQues);
      setSelectedAnswer('');
      setIsAnswerCorrect(null);
      setStep('ANSWERING');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Lỗi lấy câu hỏi:", error);
      navigate(`/student/adaptive/result/${etId}`);
    }
  };

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  if (step === 'LOADING_INIT' || !currentQuestion) {
    return (
      <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body1" color="text.secondary" mt={2} fontWeight={600}>
          Đang chuẩn bị nội dung học tập...
        </Typography>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/student/adaptive')}
          sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'none' }}
        >
          Thoát
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`Câu ${currentQuestion.index}`} 
            color="primary" 
            sx={{ fontWeight: 800, borderRadius: '8px' }} 
          />
          <Chip 
            label={currentQuestion.level?.toUpperCase()} 
            color={getDifficultyColor(currentQuestion.level)}
            variant="outlined"
            sx={{ fontWeight: 800, borderRadius: '8px' }} 
          />
        </Box>
      </Box>

      {/* NỘI DUNG CÂU HỎI */}
      <Box sx={{ 
        mb: 4, 
        '& > div': { maxHeight: 'none !important', overflow: 'visible !important' } 
      }}>
        <QuestionContentRenderer htmlContent={currentQuestion.content} />
      </Box>

      {/* DANH SÁCH ĐÁP ÁN */}
      <Box sx={{ maxWidth: 850 }}>
        {/* FIX LỖI MAP: Sử dụng optional chaining ?. để an toàn */}
        {currentQuestion.answers?.map((ans, idx) => {
          const isSelected = parseInt(selectedAnswer) === ans.aid;
          const isReviewing = step === 'REVIEWING' || step === 'LOADING_NEXT';
          const isCorrectAns = ans.is_correct;
          const isWrongSelection = isSelected && !ans.is_correct;

          return (
            <AnswerCard
              key={ans.aid}
              isSelected={isSelected}
              isReviewing={isReviewing}
              isCorrect={isReviewing && isCorrectAns}
              isWrong={isReviewing && isWrongSelection}
              onClick={() => step === 'ANSWERING' && setSelectedAnswer(ans.aid.toString())}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  width: 32, height: 32, borderRadius: '8px', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontWeight: 800, mr: 2, fontSize: '0.9rem',
                  backgroundColor: isSelected || (isReviewing && isCorrectAns) 
                    ? alpha(theme.palette.primary.main, 0.2) 
                    : alpha(theme.palette.divider, 0.1),
                  color: isSelected || (isReviewing && isCorrectAns) ? 'primary.main' : 'text.secondary'
                }}>
                  {String.fromCharCode(65 + idx)}
                </Box>

                <Box sx={{ flexGrow: 1, '& > div': { maxHeight: 'none !important' } }}>
                  <QuestionContentRenderer htmlContent={ans.content} />
                </Box>

                {isReviewing && isCorrectAns && <CheckCircleIcon color="success" sx={{ ml: 1 }} />}
                {isReviewing && isWrongSelection && <CancelIcon color="error" sx={{ ml: 1 }} />}
              </Box>

              {/* YÊU CẦU 2: HIỆN GIẢI THÍCH CHO TỪNG ĐÁP ÁN KHI REVIEW */}
              <Collapse in={isReviewing}>
                <MiniExplanation>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <InfoOutlinedIcon fontSize="small" color="info" sx={{ mt: 0.2 }} />
                    <Box sx={{ '& > div': { maxHeight: 'none !important' } }}>
                      <QuestionContentRenderer 
                        htmlContent={ans.explaination || "Đáp án này không có giải thích cụ thể."} 
                      />
                    </Box>
                  </Box>
                </MiniExplanation>
              </Collapse>
            </AnswerCard>
          );
        })}
      </Box>

      <Collapse in={step === 'REVIEWING' || step === 'LOADING_NEXT'}>
        <Box sx={{ 
          mt: 2, p: 3, borderRadius: '16px', 
          bgcolor: alpha(theme.palette.success.main, 0.05),
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: 'success.main' }}>
            <LightbulbOutlinedIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight={800}>Giải thích tổng quát</Typography>
          </Box>
          <Box sx={{ '& > div': { maxHeight: 'none !important' } }}>
            <QuestionContentRenderer htmlContent={currentQuestion.explaination} />
          </Box>
        </Box>
      </Collapse>

      {/* ACTIONS */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto', pt: 5 }}>
        {step === 'ANSWERING' && (
          <Button
            variant="contained" size="large"
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer}
            sx={{ px: 6, py: 1.5, borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
          >
            Kiểm tra đáp án
          </Button>
        )}

        {(step === 'REVIEWING' || step === 'LOADING_NEXT') && (
          <Button
            variant="contained" 
            size="large"
            onClick={handleNextQuestion}
            disabled={step === 'LOADING_NEXT'}
            endIcon={step === 'LOADING_NEXT' ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
            sx={{ px: 6, py: 1.5, borderRadius: '12px', fontWeight: 800, textTransform: 'none' }}
          >
            {step === 'LOADING_NEXT' ? "Đang tải..." : "Câu tiếp theo"}
          </Button>
        )}
      </Box>
    </PageWrapper>
  );
}