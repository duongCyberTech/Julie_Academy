import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Card, CardContent, Button,
  Radio, RadioGroup, FormControlLabel, Paper, CircularProgress,
  Alert, AlertTitle, Divider, Chip
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// API Services
import { takeAdaptiveExam, getNextAdaptiveQuestion } from '../../services/ExamService';

// Render nội dung
import QuestionContentRenderer from '../../components/QuestionContentRenderer';

export default function StudentAdaptiveSessionPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  // States
  const [etId, setEtId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  
  // UX State: 'LOADING_INIT' | 'ANSWERING' | 'REVIEWING' | 'LOADING_NEXT'
  const [step, setStep] = useState('LOADING_INIT'); 
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

  // 1. TẢI CÂU HỎI ĐẦU TIÊN
  useEffect(() => {
    const startExam = async () => {
      try {
        setStep('LOADING_INIT');
        const res = await takeAdaptiveExam(categoryId);
        
        // Bóc tách data an toàn
        const data = res.data?.data || res.data || res;
        const examId = data.exam_info?.et_id || data.et_id;
        const firstQuestion = Array.isArray(data.questions) ? data.questions[0] : data;

        setEtId(examId);
        setCurrentQuestion(firstQuestion);
        setStep('ANSWERING');
      } catch (error) {
        console.error("Lỗi khi bắt đầu bài thi Adaptive:", error);
      }
    };
    if (categoryId) startExam();
  }, [categoryId]);

  // 2. BẤM KIỂM TRA ĐÁP ÁN
  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;

    // Ép kiểu String để so sánh an toàn tuyệt đối (chống lỗi Số vs Chuỗi)
    const selectedAnsObj = (currentQuestion.answers || []).find(
      a => String(a.aid) === String(selectedAnswer)
    );
    
    const correctStatus = selectedAnsObj?.isCorrect || selectedAnsObj?.is_correct;
    setIsAnswerCorrect(!!correctStatus);
    setStep('REVIEWING'); 
  };

  // 3. BẤM TIẾP TỤC
  const handleNextQuestion = async () => {
    try {
      setStep('LOADING_NEXT');
      
      // Xử lý payload, nếu backend expect Number thì ép về Number, không thì giữ nguyên
      const answerPayload = !isNaN(selectedAnswer) ? Number(selectedAnswer) : selectedAnswer;

      const payload = {
        et_id: etId,
        question_id: currentQuestion.ques_id,
        index: currentQuestion.index,
        level: currentQuestion.level,
        answers: [answerPayload] 
      };

      const res = await getNextAdaptiveQuestion(categoryId, payload);
      const data = res.data?.data || res.data || res;

      // Check kết thúc bài
      if (data.message === "Adaptive Exam Submitted Successfully" || data.isDone) {
        navigate(`/student/adaptive/result/${etId}`);
      } else {
        // Có câu mới
        setCurrentQuestion(data);
        setSelectedAnswer('');
        setIsAnswerCorrect(null);
        setStep('ANSWERING'); 
      }
    } catch (error) {
      console.error("Lỗi khi tải câu hỏi tiếp theo:", error);
      setStep('REVIEWING'); // Lỗi thì cho nán lại màn hình
    }
  };

  // RENDER: LOADING
  if (step === 'LOADING_INIT') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 15 }}>
        <CircularProgress size={50} thickness={4} />
        <Typography sx={{ mt: 3, color: 'text.secondary' }}>Đang khởi tạo phiên Thích ứng AI...</Typography>
      </Box>
    );
  }

  // RENDER: EMPTY STATE
  if (!currentQuestion || Object.keys(currentQuestion).length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 15 }}>
        <Typography sx={{ mt: 3, color: 'text.secondary' }}>Không tải được dữ liệu câu hỏi.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="700" color="primary.main">
          Câu hỏi số {currentQuestion.index || 1}
        </Typography>
        <Chip 
          label={`Mức độ: ${currentQuestion.level || 'Cơ bản'}`} 
          color="secondary" 
          variant="outlined" 
          sx={{ fontWeight: 'bold' }} 
        />
      </Box>

      {/* Card Nội Dung */}
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'grey.200', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          
          {/* NỘI DUNG CÂU HỎI */}
          <Box sx={{ mb: 4, fontSize: '1.15rem', color: 'text.primary' }}>
            {currentQuestion.content ? (
              <QuestionContentRenderer content={currentQuestion.content} />
            ) : (
              <Typography color="error">Câu hỏi không có nội dung.</Typography>
            )}
          </Box>

          {/* DANH SÁCH ĐÁP ÁN */}
          <RadioGroup
            value={selectedAnswer}
            onChange={(e) => step === 'ANSWERING' && setSelectedAnswer(e.target.value)}
          >
            {(currentQuestion.answers || []).map((ans) => {
              // Ép kiểu so sánh
              const isSelected = String(selectedAnswer) === String(ans.aid);
              const isCorrectAns = ans.isCorrect || ans.is_correct;
              
              // Đổi màu Border UI
              let paperStyle = { borderColor: 'grey.300', bgcolor: 'transparent' };
              if (step === 'ANSWERING') {
                if (isSelected) paperStyle = { borderColor: 'primary.main', bgcolor: '#f0f7ff' };
              } else if (step === 'REVIEWING') {
                if (isCorrectAns) {
                  paperStyle = { borderColor: 'success.main', bgcolor: '#f1fdf4', borderWidth: 2 }; 
                } else if (isSelected && !isCorrectAns) {
                  paperStyle = { borderColor: 'error.main', bgcolor: '#fffcfc', borderWidth: 2 }; 
                }
              }

              return (
                <Paper 
                  key={ans.aid}
                  variant="outlined"
                  sx={{ 
                    mb: 2, p: 1.5, pl: 2,
                    borderRadius: 2,
                    cursor: step === 'ANSWERING' ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    ...paperStyle,
                    '&:hover': step === 'ANSWERING' && !isSelected ? { borderColor: 'grey.400', bgcolor: '#fafafa' } : {}
                  }}
                  onClick={() => step === 'ANSWERING' && setSelectedAnswer(String(ans.aid))}
                >
                  <FormControlLabel
                    value={String(ans.aid)}
                    control={<Radio color="primary" disabled={step !== 'ANSWERING'} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {/* RENDER NỘI DUNG ĐÁP ÁN AN TOÀN */}
                        {ans.content ? (
                          <QuestionContentRenderer content={ans.content} />
                        ) : (
                          <Typography color="text.secondary">Đáp án trống</Typography>
                        )}

                        {step === 'REVIEWING' && isCorrectAns && <CheckCircleIcon color="success" sx={{ ml: 2 }} />}
                        {step === 'REVIEWING' && isSelected && !isCorrectAns && <CancelIcon color="error" sx={{ ml: 2 }} />}
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
              );
            })}
          </RadioGroup>

          {/* NƠI HIỂN THỊ LỜI GIẢI CHI TIẾT */}
          {step === 'REVIEWING' && (
            <Box sx={{ mt: 4, animation: 'fadeIn 0.5s ease-in-out' }}>
              <Divider sx={{ mb: 3 }} />
              <Alert 
                severity={isAnswerCorrect ? "success" : "error"}
                icon={isAnswerCorrect ? <CheckCircleIcon fontSize="inherit" /> : <CancelIcon fontSize="inherit" />}
                sx={{ borderRadius: 2, mb: 2, '& .MuiAlert-message': { width: '100%' } }}
              >
                <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {isAnswerCorrect ? "Chính xác! Làm tốt lắm." : "Chưa chính xác! Hãy xem lại nhé."}
                </AlertTitle>
                
                {/* 1. LỜI GIẢI CHUNG (Của cả câu hỏi) */}
                {currentQuestion.explaination && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                      LỜI GIẢI CHUNG:
                    </Typography>
                    <QuestionContentRenderer content={currentQuestion.explaination} />
                  </Box>
                )}

                {/* 2. LỜI GIẢI RIÊNG (Cho từng lựa chọn) */}
                {(currentQuestion.answers || []).some(a => a.explaination) && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                      GIẢI THÍCH TỪNG ĐÁP ÁN:
                    </Typography>
                    
                    {(currentQuestion.answers || []).map((ans, idx) => {
                      if (!ans.explaination) return null; // Bỏ qua nếu đáp án không có giải thích riêng
                      
                      const isCorrect = ans.isCorrect || ans.is_correct;
                      return (
                        <Box 
                          key={`exp-${ans.aid}`} 
                          sx={{ 
                            mt: 1.5, p: 2, 
                            bgcolor: '#ffffff', 
                            borderLeft: '4px solid', 
                            borderColor: isCorrect ? 'success.main' : 'error.main',
                            borderRadius: 1,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          <Typography variant="body2" fontWeight="bold" color={isCorrect ? 'success.main' : 'error.main'} gutterBottom>
                            {isCorrect ? 'Tại sao đáp án này ĐÚNG:' : 'Tại sao đáp án này SAI:'}
                          </Typography>
                          <QuestionContentRenderer content={ans.explaination} />
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {/* Fallback nếu không có lời giải nào */}
                {!currentQuestion.explaination && !(currentQuestion.answers || []).some(a => a.explaination) && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Hệ thống chưa cập nhật lời giải chi tiết cho câu hỏi này.
                  </Typography>
                )}
              </Alert>
            </Box>
          )}

          {/* BUTTON CHUYỂN TRẠNG THÁI */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            {step === 'ANSWERING' && (
              <Button
                variant="contained" size="large"
                onClick={handleCheckAnswer}
                disabled={!selectedAnswer}
                endIcon={<SendIcon />}
                sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem' }}
              >
                Kiểm tra đáp án
              </Button>
            )}

            {(step === 'REVIEWING' || step === 'LOADING_NEXT') && (
              <Button
                variant="contained" color={isAnswerCorrect ? "primary" : "secondary"} size="large"
                onClick={handleNextQuestion}
                disabled={step === 'LOADING_NEXT'}
                endIcon={step === 'LOADING_NEXT' ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem' }}
              >
                {step === 'LOADING_NEXT' ? "Đang phân tích độ khó..." : "Tiếp tục"}
              </Button>
            )}
          </Box>

        </CardContent>
      </Card>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Container>
  );
}