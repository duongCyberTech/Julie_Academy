import React, { useState } from 'react';
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
  Card, 
  CardContent, 
  Alert,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { red } from '@mui/material/colors';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SkipNextIcon from '@mui/icons-material/SkipNext';

import 'katex/dist/katex.min.css';
import katex from 'katex';


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

// Hàm giả định thông tin Session
const MOCK_ASSIGNMENT_INFO = {
  title: "Bài tập về nhà",
  class: { classname: 'Lớp 9A' },
  category: { subject: 'Toán' },
  duration: 45,
  done_time: new Date().toISOString(),
  start_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
};

const calculateDuration = (start, end) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diff = Math.abs(endTime - startTime);
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${minutes} phút ${seconds} giây`;
};


// Main Component
export default function StudentAssignmentResultPage() {
  // Lấy sessionId từ URL
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Đọc dữ liệu truyền từ trang làm bài
  const passedState = location.state || {};
  
  // Dữ liệu mặc định 
  const sessionScore = passedState.score || { correct: 0, total: 0, skipped: 0, incorrect: 0 };
  const sessionQuestions = passedState.questions || [];
  const sessionAnswersTaken = passedState.answers_taken || [];
  
  const [activeStep, setActiveStep] = useState(0);

  // Nếu không có dữ liệu câu hỏi, hiển thị thông báo
  if (sessionQuestions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Không tìm thấy dữ liệu kết quả bài làm.
        </Typography>
        <Typography color="text.secondary" paragraph>
          Dữ liệu kết quả chi tiết được truyền từ phiên làm bài. Nếu bạn tải lại trang, dữ liệu này sẽ mất.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/student/assignment')}>
          Quay lại Trang Bài tập
        </Button>
      </Container>
    );
  }
  
  const currentQuestion = sessionQuestions[activeStep];
  const currentResult = sessionAnswersTaken[activeStep];
  
  // Kiểm tra trạng thái câu hỏi hiện tại
  const isCorrect = currentResult?.is_correct === true;
  const isSkipped = currentResult?.is_skipped === true; 
  
  const handleStepClick = (step) => setActiveStep(step);

  const getStatusInfo = (result) => {
    if (result?.is_correct === true) return { color: 'success', icon: <CheckCircleIcon /> };
    if (result?.is_correct === false && !result.is_skipped) return { color: 'error', icon: <CloseIcon /> };
    return { color: 'warning', icon: <SkipNextIcon /> }; // Bỏ qua
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Chi tiết kết quả bài làm
      </Typography>

      {/* 1. KHUNG TỔNG QUAN */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4} sx={{ textAlign: 'center', borderRight: { md: '1px solid #eee' } }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: sessionScore.correct / sessionScore.total >= 0.5 ? 'success.main' : red[600] }}>
              {sessionScore.correct} / {sessionScore.total}
            </Typography>
            <Typography variant="h6" color="text.secondary">Số câu đúng</Typography>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              {passedState.title || MOCK_ASSIGNMENT_INFO.title}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><Chip icon={<SchoolIcon />} label={`Môn: ${passedState.subject || MOCK_ASSIGNMENT_INFO.category.subject}`} variant="outlined"/></Grid>
              <Grid item xs={6}><Chip icon={<EventAvailableIcon />} label={`Ngày nộp: ${new Date().toLocaleDateString('vi-VN')}`} variant="outlined"/></Grid>
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Chip label={`Đúng: ${sessionScore.correct}`} color="success" sx={{ mr: 1 }} />
                <Chip label={`Sai: ${sessionScore.incorrect}`} color="error" sx={{ mr: 1 }} />
                <Chip label={`Bỏ qua: ${sessionScore.skipped}`} color="warning" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 2. STEPPER */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, overflowX: 'auto' }}>
        <Stepper nonLinear activeStep={activeStep} sx={{ minWidth: `${sessionQuestions.length * 60}px` }}>
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
      </Paper>

      {/* 3. CHI TIẾT CÂU HỎI */}
      {currentQuestion && (
        <Card variant="outlined">
          <CardContent>
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

            <Box sx={{ my: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, minHeight: 100, fontSize: '1.1rem' }}>
              <LatexRenderer content={currentQuestion.content} />
            </Box>

            <Typography variant="h6" gutterBottom>Chi tiết Đáp án</Typography>

            <Box>
              {currentQuestion.answers.map((answer, index) => {
                const prefix = getAnswerPrefix(index);
                // Kiểm tra đáp án này có được user chọn không
                // currentResult.selected là mảng các answerId
                const isSelected = currentResult?.selected?.includes(answer.answerId);
                
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
                    <Typography sx={{ mr: 1, fontWeight: 'bold' }}>{prefix}.</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <LatexRenderer content={answer.content} />
                    </Box>
                    {isSelected && <Chip size="small" label="Bạn chọn" color={answer.is_correct ? 'success' : 'error'} sx={{ ml: 2 }} />}
                    {!isSelected && answer.is_correct && <Chip size="small" label="Đáp án đúng" variant="outlined" color="success" sx={{ ml: 2 }} />}
                  </Box>
                );
              })}
            </Box>

            {/* Lời giải */}
            {currentQuestion.explanation && (
              <Alert severity="success" icon={false} sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>🎉 Lời giải</Typography>
                <Box sx={{ mb: 2 }}>
                  <LatexRenderer content={currentQuestion.explanation} />
                </Box>
              </Alert>
            )}
          </CardContent>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderTop: '1px solid #eee' }}>
            <Button variant="outlined" onClick={() => navigate('/student/assignment')}>
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
    </Container>
  );
}