import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Box, CircularProgress, Paper, Divider, 
  Grid, Button, Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import 'katex/dist/katex.min.css';
import katex from 'katex';
import DOMPurify from 'dompurify'; 

import { continueTakeExam } from '../../services/ExamService';

// Component Render HTML & Toán học (Dùng chung với trang Session)
const HtmlContentRenderer = ({ htmlContent }) => {
  const containerRef = useRef(null);
  const cleanHtml = DOMPurify.sanitize(htmlContent || '', { ADD_TAGS: ['span'], ADD_ATTR: ['class', 'data-value'] });

  useEffect(() => {
      if (containerRef.current) {
          const formulaElements = containerRef.current.querySelectorAll(".ql-formula");
          formulaElements.forEach(element => {
              const latex = element.getAttribute('data-value') || element.textContent; 
              if (latex) {
                  try { katex.render(latex, element, { throwOnError: false, displayMode: false }); } 
                  catch (e) { element.textContent = `[Lỗi LaTeX: ${latex}]`; }
              }
          });
      }
  }, [cleanHtml]); 

  return <Box ref={containerRef} dangerouslySetInnerHTML={{ __html: cleanHtml }} sx={{ '& p': { m: 0, p: 0 }, width: '100%', overflowX: 'auto', wordBreak: 'break-word' }} />;
};

const getAnswerPrefix = (index) => String.fromCharCode(65 + index);

export default function StudentAssignmentResultPage() {
  const { etId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [isLoading, setIsLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchResultData = async () => {
      try {
        setIsLoading(true);
        if (etId) {
          const responseData = await continueTakeExam(etId, token);
          const coreData = responseData.data || responseData;
          setExamData(coreData);
          
          const rawQuestions = coreData.questions || [];
          const questionsList = rawQuestions.map(item => {
              if (item.question) return { ...item.question, answer_set: item.answer_set };
              return item;
          });
          setQuestions(questionsList);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu kết quả:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchResultData();
  }, [etId, token]);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8' }}><CircularProgress size={60} thickness={4} /></Box>;
  console.log("DỮ LIỆU BÀI THI:", examData);

  if (!examData) return <Container><Typography variant="h5" color="error" 
  align="center" mt={5}>Không tìm thấy dữ liệu bài thi.</Typography></Container>;

  const displayTitle = examData?.exam_session?.exam?.title || 'Bài thi';
  const totalScore = examData?.final_score !== undefined ? examData.final_score : 'Đang chấm...'; // Dành cho khi Backend chưa trả về điểm

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 8, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* Nút quay lại */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/student/assignment')} 
        sx={{ mb: 3, fontWeight: 700, color: 'text.secondary' }}
      >
        Quay lại danh sách bài tập
      </Button>

      {/* CARD TỔNG QUAN KẾT QUẢ */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, mb: 4, textAlign: 'center', backgroundColor: '#fff', border: '1px solid', borderColor: 'grey.200', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: 'success.50' }}>
            <AssignmentTurnedInIcon sx={{ fontSize: 50, color: 'success.main' }} />
          </Box>
        </Box>
        <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
          Nộp bài thành công!
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={500} mb={4}>
          {displayTitle}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={6} md={3}>
            <Typography variant="body1" color="text.secondary" fontWeight={600} gutterBottom>Điểm số của bạn</Typography>
            <Typography variant="h3" fontWeight={800} color="primary.main">{totalScore}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body1" color="text.secondary" fontWeight={600} gutterBottom>Số câu đã làm</Typography>
            <Typography variant="h3" fontWeight={800} color="success.main">
              {questions.filter(q => q.answer_set && q.answer_set.length > 0).length} <Typography component="span" variant="h5" color="text.secondary">/ {questions.length}</Typography>
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" fontWeight={800} color="text.primary" mb={3} px={1}>
        Chi tiết bài làm
      </Typography>

      {/* DANH SÁCH CÂU HỎI ĐÃ LÀM (REVIEW) */}
      {questions.map((q, index) => {
        // Parse answer_set an toàn
        let selectedAnswers = [];
        if (Array.isArray(q.answer_set)) selectedAnswers = q.answer_set;
        else if (typeof q.answer_set === 'string') {
            try { selectedAnswers = JSON.parse(q.answer_set); } catch(e){}
        }

        const isMultiChoice = q.type === 'multiple_choice' || q.type === 'MULTIPLE_CHOICE';

        return (
          <Paper key={q.ques_id} elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, border: '1px solid', borderColor: 'grey.200', backgroundColor: '#fff' }}>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                Câu {index + 1}
              </Typography>
              {selectedAnswers.length === 0 && (
                <Chip label="Bỏ trống" color="warning" size="small" sx={{ fontWeight: 600 }} />
              )}
            </Box>

            <Box sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3, color: 'text.primary', fontWeight: 500 }}>
              <HtmlContentRenderer htmlContent={q.content} />
            </Box>

            <Box sx={{ pl: 1 }}>
              {q.answers?.map((answer, aIndex) => {
                const isSelected = selectedAnswers.includes(answer.aid);
                
                return (
                  <Box 
                    key={answer.aid}
                    sx={{
                      display: 'flex', alignItems: 'flex-start', p: 2, mb: 1.5, borderRadius: 2,
                      border: '2px solid',
                      borderColor: isSelected ? 'primary.main' : 'grey.100',
                      backgroundColor: isSelected ? 'primary.50' : 'transparent',
                    }}
                  >
                    <Box sx={{ mr: 2, color: isSelected ? 'primary.main' : 'grey.400', mt: '2px' }}>
                      {isSelected ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                    </Box>
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                        <Typography sx={{ mr: 1.5, fontWeight: 700, color: isSelected ? 'primary.main' : 'text.secondary' }}>
                          {getAnswerPrefix(aIndex)}.
                        </Typography>
                        <Box sx={{ flexGrow: 1, fontSize: '1.05rem', lineHeight: 1.6, color: isSelected ? 'text.primary' : 'text.secondary' }}>
                          <HtmlContentRenderer htmlContent={answer.content} />
                        </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>

          </Paper>
        );
      })}

    </Container>
  );
}