import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Box, CircularProgress, Paper, Divider, 
  Grid, Button, Chip
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CancelIcon from '@mui/icons-material/Cancel'; // Icon cho đáp án sai

import 'katex/dist/katex.min.css';
import katex from 'katex';
import DOMPurify from 'dompurify'; 

import { continueTakeExam } from '../../services/ExamService';

// --- Component Render HTML & Toán học ---
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

// --- MAIN COMPONENT ---
export default function StudentAssignmentResultPage() {
  const { etId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Dùng để lấy State truyền từ trang Session sang
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

  if (!examData) return <Container><Typography variant="h5" color="error" align="center" mt={5}>Không tìm thấy dữ liệu bài thi.</Typography></Container>;

  const displayTitle = examData?.exam_session?.exam?.title || 'Bài thi';
  
  // TÍNH TOÁN ĐIỂM SỐ: Lấy từ location.state (nếu vừa nộp) hoặc từ examData (nếu xem lại)
  const rawScore = location.state?.resultData?.final_score ?? examData?.final_score;
  // Làm tròn 2 chữ số thập phân
  const totalScore = rawScore !== undefined && rawScore !== null ? Number(rawScore).toFixed(2) : 'Đang chấm...';

  // Tính số câu đã làm
  const totalCompleted = questions.filter(q => {
    let ans = [];
    if (Array.isArray(q.answer_set)) ans = q.answer_set;
    else if (typeof q.answer_set === 'string') {
        try { ans = JSON.parse(q.answer_set); } catch(e){}
    }
    return ans.length > 0;
  }).length;

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 8, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* CÁC NÚT ĐIỀU HƯỚNG */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/student/assignment')} 
          sx={{ fontWeight: 700, color: 'text.secondary' }}
        >
          Danh sách bài tập
        </Button>

        {/* Nút Làm lại: Chỉ hiện nếu giới hạn làm bài > 1 */}
        {examData?.exam_session?.limit_taken > 1 && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
               // Lấy class_id từ localStorage hoặc từ data để build link
               const savedClassId = localStorage.getItem(`exam_class_${etId}`) || examData?.exam_session?.exam_open_in?.[0]?.class_id;
               
               if (savedClassId) {
                 navigate(`/student/assignment/class/${savedClassId}/exam/${examData.exam_id}/session/${examData.session_id}`);
               } else {
                 navigate('/student/assignment');
               }
            }}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Làm lại bài thi
          </Button>
        )}
      </Box>

      {/* CARD TỔNG QUAN KẾT QUẢ */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, mb: 4, textAlign: 'center', backgroundColor: '#fff', border: '1px solid', borderColor: 'grey.200', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: 'success.50' }}>
            <AssignmentTurnedInIcon sx={{ fontSize: 50, color: 'success.main' }} />
          </Box>
        </Box>
        <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
          Kết quả làm bài
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
              {totalCompleted} <Typography component="span" variant="h5" color="text.secondary">/ {questions.length}</Typography>
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
        const isMissed = selectedAnswers.length === 0;

        return (
          <Paper key={q.ques_id} elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'grey.200', backgroundColor: '#fff' }}>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={800} color="text.primary">
                Câu {index + 1}
              </Typography>
              {isMissed && (
                <Chip label="Bỏ trống" color="warning" size="small" sx={{ fontWeight: 600 }} />
              )}
            </Box>

            <Box sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3, color: 'text.primary', fontWeight: 500 }}>
              <HtmlContentRenderer htmlContent={q.content} />
            </Box>

            {/* DANH SÁCH ĐÁP ÁN */}
            <Box sx={{ pl: 1 }}>
              {q.answers?.map((answer, aIndex) => {
                const isSelected = selectedAnswers.includes(answer.aid);
                const isCorrect = answer.is_correct; // Lấy cờ đúng/sai từ Database
                
                // Logic tô màu
                let borderColor = 'grey.200';
                let bgColor = 'transparent';
                let textColor = 'text.secondary';
                let IconComponent = RadioButtonUncheckedIcon;

                if (isCorrect) {
                  // Đáp án đúng của hệ thống luôn tô xanh
                  borderColor = 'success.main';
                  bgColor = 'success.50';
                  textColor = 'success.dark';
                  IconComponent = CheckCircleIcon;
                } else if (isSelected && !isCorrect) {
                  // Sinh viên chọn sai tô đỏ
                  borderColor = 'error.main';
                  bgColor = 'error.50';
                  textColor = 'error.main';
                  IconComponent = CancelIcon;
                }

                return (
                  <Box key={answer.aid} sx={{ mb: 2 }}>
                    <Box 
                      sx={{
                        display: 'flex', alignItems: 'flex-start', p: 2, borderRadius: 2,
                        border: '2px solid', borderColor: borderColor, backgroundColor: bgColor,
                      }}
                    >
                      <Box sx={{ mr: 2, color: textColor, mt: '2px' }}>
                        <IconComponent color="inherit" />
                      </Box>
                      <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', width: '100%' }}>
                            <Typography sx={{ mr: 1.5, fontWeight: 700, color: textColor }}>
                              {getAnswerPrefix(aIndex)}.
                            </Typography>
                            <Box sx={{ flexGrow: 1, fontSize: '1.05rem', lineHeight: 1.6, color: textColor }}>
                              <HtmlContentRenderer htmlContent={answer.content} />
                            </Box>
                          </Box>
                          
                          {/* GIẢI THÍCH CHO TỪNG ĐÁP ÁN (Chỉ hiện cho đáp án đúng hoặc đáp án học sinh đã chọn) */}
                          {(isSelected || isCorrect) && answer.explaination && answer.explaination !== "<p><br></p>" && (
                            <Box sx={{ mt: 1.5, p: 2, bgcolor: '#fff', borderRadius: 1, width: '100%', border: '1px dashed', borderColor: isCorrect ? 'success.main' : 'error.main' }}>
                               <Typography variant="body2" fontWeight={800} color={textColor} mb={0.5}>Giải thích đáp án này:</Typography>
                               <Box sx={{ fontSize: '1rem', color: 'text.secondary' }}>
                                 <HtmlContentRenderer htmlContent={answer.explaination} />
                               </Box>
                            </Box>
                          )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* GIẢI THÍCH CHUNG CHO TOÀN BỘ CÂU HỎI */}
            {q.explaination && q.explaination !== "<p><br></p>" && (
              <Box sx={{ mt: 3, p: 2.5, bgcolor: 'info.50', borderRadius: 2, borderLeft: '4px solid', borderColor: 'info.main' }}>
                <Typography variant="subtitle1" fontWeight={800} color="info.dark" mb={1}>💡 Hướng dẫn giải chi tiết:</Typography>
                <Box sx={{ color: 'info.dark', fontSize: '1.05rem' }}>
                   <HtmlContentRenderer htmlContent={q.explaination} />
                </Box>
              </Box>
            )}

          </Paper>
        );
      })}

    </Container>
  );
}