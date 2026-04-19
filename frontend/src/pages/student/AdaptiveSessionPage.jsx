import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, Button, Paper, CircularProgress,
  Chip, Collapse, useTheme, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// API Services
import { takeAdaptiveExam, getNextAdaptiveQuestion } from '../../services/ExamService';

// Render nội dung
import QuestionContentRenderer from '../../components/QuestionContentRenderer';


const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(4),
    backgroundColor: isDark ? theme.palette.background.paper : '#ffffff',
    backgroundImage: 'none',
    borderRadius: '16px',
    border: `1px solid ${isDark ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.5)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 2px 10px rgba(0,0,0,0.02)',
    minHeight: '65vh',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
      borderRadius: '12px',
    }
  };
});

const OptionBox = styled(Box, {
  shouldForwardProp: (prop) => !['isSelected', 'showAsCorrect', 'showAsWrong', 'isReviewing'].includes(prop)
})(({ theme, isSelected, showAsCorrect, showAsWrong, isReviewing }) => {
  const isDark = theme.palette.mode === 'dark';
  let borderColor = alpha(theme.palette.divider, isDark ? 0.2 : 0.3);
  let bgColor = 'transparent';

  if (showAsCorrect) {
    borderColor = theme.palette.success.main;
    bgColor = alpha(theme.palette.success.main, 0.08);
  } else if (showAsWrong) {
    borderColor = theme.palette.error.main;
    bgColor = alpha(theme.palette.error.main, 0.08);
  } else if (isSelected) {
    borderColor = theme.palette.primary.main;
    bgColor = alpha(theme.palette.primary.main, 0.05);
  }

  return {
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(1.5),
    borderRadius: '10px',
    border: `1px solid ${borderColor}`,
    backgroundColor: bgColor,
    cursor: isReviewing ? 'default' : 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: (!isReviewing && !isSelected) ? alpha(theme.palette.action.hover, 0.5) : bgColor,
    }
  };
});

const SpecificExplanationBox = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(5.5),
    padding: theme.spacing(1.5),
    borderRadius: '8px',
    backgroundColor: isDark ? alpha(theme.palette.grey[800], 0.3) : '#f8f9fa',
    borderLeft: `3px solid ${isDark ? theme.palette.primary.main : theme.palette.primary.main}`,
    color: theme.palette.text.primary,
  };
});

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

  // Mở mặc định Accordion Giải thích chung nếu muốn (hiện đang để false)
  const [generalExpanded, setGeneralExpanded] = useState(false);
  // Thêm state cho bộ đếm thời gian
  const [elapsedTime, setElapsedTime] = useState(0);

  // Hàm chuyển đổi giây sang định dạng MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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

  // Hook chạy bộ đếm thời gian
  useEffect(() => {
    let timer;
    if (step !== 'LOADING_INIT') {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step]);

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

      if (!nextQues || !nextQues.ques_id || !nextQues.answers) {
        navigate(`/student/adaptive/result/${etId}`);
        return;
      }

      setCurrentQuestion(nextQues);
      setSelectedAnswer('');
      setIsAnswerCorrect(null);
      setGeneralExpanded(false);
      setStep('ANSWERING');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Lỗi lấy câu hỏi:", error);
      navigate(`/student/adaptive/result/${etId}`);
    }
  };

  const handleFinalize = async () => {
    setStep('LOADING_NEXT');
    try {
      await apiClient.post(`/exam/adaptive/submit/${etId}`);
      navigate(`/student/adaptive/result/${etId}`);
    } catch (error) {
      console.error("Lỗi khi nộp bài:", error);
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
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        
        {/* Nhóm bên trái: Câu hỏi và Độ khó */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Chip 
            label={`Câu ${currentQuestion.index}`} 
            color="primary" 
            sx={{ fontWeight: 800, borderRadius: '8px', fontSize: '1rem' }} 
          />
          <Chip 
            label={currentQuestion.level?.toUpperCase() || 'NORMAL'} 
            color={getDifficultyColor(currentQuestion.level)}
            variant="outlined"
            sx={{ fontWeight: 800, borderRadius: '8px', fontSize: '0.85rem' }} 
          />
        </Box>

        {/* Nhóm bên phải: Đồng hồ ( */}
        <Chip 
          icon={<AccessTimeIcon sx={{ fontSize: '1.3rem !important' }} />}
          label={formatTime(elapsedTime)} 
          variant="outlined"
          sx={{ 
            height: 42, // Tăng chiều cao để Chip to hơn
            px: 2,      // Tăng padding ngang
            fontSize: '1.1rem', // Chữ to hơn
            fontWeight: 800, 
            borderRadius: '10px', 
            color: 'text.secondary', 
            borderColor: alpha(theme.palette.divider, 0.5),
            backgroundColor: alpha(theme.palette.action.hover, 0.2)
          }} 
        />
      </Box>

      {/* NỘI DUNG CÂU HỎI */}
      <Box sx={{ 
        mb: 3, 
        fontSize: '1.05rem',
        '& > div': { maxHeight: 'none !important', overflow: 'visible !important' } 
      }}>
        <QuestionContentRenderer htmlContent={currentQuestion.content} />
      </Box>

      <Box sx={{ maxWidth: '100%', mb: 2 }}>
        {currentQuestion.answers?.map((ans, idx) => {
          const isSelected = parseInt(selectedAnswer) === ans.aid;
          const isReviewing = step === 'REVIEWING' || step === 'LOADING_NEXT';
          

          const showAsCorrect = isReviewing && isSelected && ans.is_correct;
          const showAsWrong = isReviewing && isSelected && !ans.is_correct;

          return (
            <OptionBox
              key={ans.aid}
              isSelected={isSelected}
              isReviewing={isReviewing}
              showAsCorrect={showAsCorrect}
              showAsWrong={showAsWrong}
              onClick={() => step === 'ANSWERING' && setSelectedAnswer(ans.aid.toString())}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ 
                  width: 28, height: 28, borderRadius: '50%', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontWeight: 700, mr: 2, mt: 0.2, fontSize: '0.85rem', flexShrink: 0,
                  backgroundColor: showAsCorrect ? 'success.main' 
                                 : showAsWrong ? 'error.main' 
                                 : isSelected ? 'primary.main' 
                                 : alpha(theme.palette.text.disabled, 0.15),
                  color: (isSelected || showAsCorrect || showAsWrong) ? '#fff' : 'text.primary'
                }}>
                  {String.fromCharCode(65 + idx)}
                </Box>

                <Box sx={{ flexGrow: 1, '& > div': { maxHeight: 'none !important' }, pt: 0.3 }}>
                  <QuestionContentRenderer htmlContent={ans.content} />
                </Box>

                {/* Icon trạng thái nhỏ gọn bên phải */}
                {showAsCorrect && <CheckCircleIcon color="success" sx={{ ml: 1, fontSize: 20, mt: 0.5 }} />}
                {showAsWrong && <CancelIcon color="error" sx={{ ml: 1, fontSize: 20, mt: 0.5 }} />}
              </Box>

              <Collapse in={isReviewing && isSelected && Boolean(ans.explaination)}>
                <SpecificExplanationBox>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary' }}>
                    <SubdirectoryArrowRightIcon fontSize="small" />
                    <Typography variant="caption" fontWeight={700} textTransform="uppercase">
                      Phân tích lựa chọn của bạn
                    </Typography>
                  </Box>
                  <Box sx={{ '& > div': { maxHeight: 'none !important', fontSize: '0.9rem' } }}>
                    <QuestionContentRenderer 
                      htmlContent={ans.explaination || "<p>Chưa có phân tích cho lựa chọn này.</p>"} 
                    />
                  </Box>
                </SpecificExplanationBox>
              </Collapse>
            </OptionBox>
          );
        })}
      </Box>

      {/* GIẢI THÍCH CHUNG */}
      <Collapse in={step === 'REVIEWING' || step === 'LOADING_NEXT'}>
        <Accordion 
          expanded={generalExpanded} 
          onChange={() => setGeneralExpanded(!generalExpanded)}
          elevation={0}
          sx={{ 
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            borderRadius: '10px !important',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon color="info" />}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'info.main' }}>
              <LightbulbOutlinedIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Hướng dẫn giải
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, borderTop: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
            <Box sx={{ '& > div': { maxHeight: 'none !important', mt: 2, fontSize: '0.95rem' } }}>
              <QuestionContentRenderer 
                htmlContent={currentQuestion.explaination || "<p>Hệ thống chưa có lời giải tổng quát cho câu này.</p>"} 
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Collapse>

     {/* ACTIONS */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 4 }}>
        
        {/* Nút Dừng luyện tập */}
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/student/adaptive')}
          sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'none', px: 2 }}
        >
          Dừng luyện tập
        </Button>

        {/* Cụm nút hành động chính */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {step === 'ANSWERING' && (
            <Button
              variant="contained" 
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer}
              sx={{ px: 4, py: 1.2, borderRadius: '8px', fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
            >
              Kiểm tra
            </Button>
          )}

          {(step === 'REVIEWING' || step === 'LOADING_NEXT') && (
            <Button
              variant="contained" 
              onClick={handleNextQuestion}
              disabled={step === 'LOADING_NEXT'}
              endIcon={step === 'LOADING_NEXT' ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon fontSize="small" />}
              sx={{ px: 4, py: 1.2, borderRadius: '8px', fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
            >
              {step === 'LOADING_NEXT' ? "Đang tải..." : "Câu tiếp theo"}
            </Button>
          )}
        </Box>
      </Box>
    </PageWrapper>
  );
}