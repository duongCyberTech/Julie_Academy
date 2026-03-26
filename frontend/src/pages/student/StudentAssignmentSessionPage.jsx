import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Box, Button, RadioGroup, Radio, Checkbox,
  FormGroup, FormControlLabel, CircularProgress, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Drawer, Fab, IconButton
} from '@mui/material';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CloseIcon from '@mui/icons-material/Close';

import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import 'katex/dist/katex.min.css';
import katex from 'katex';
import DOMPurify from 'dompurify'; 

import AppSnackbar from '../../components/SnackBar';
import { takeExam, continueTakeExam, submitExam } from '../../services/ExamService';

// --- Component render HTML & Công thức Toán học ---
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

  return <Box 
    ref={containerRef} 
    dangerouslySetInnerHTML={{ __html: cleanHtml }} 
    sx={{ 
      '& p': { m: 0, p: 0 }, 
      '& img': { maxWidth: '100%', height: 'auto', display: 'block' }, 
      width: '100%', 
      overflowX: 'auto', 
      wordBreak: 'break-word' 
    }} 
  />;
};

const getAnswerPrefix = (index) => String.fromCharCode(65 + index); 

export default function StudentAssignmentSessionPage() {
  const { classId, examId, sessionId, etId } = useParams(); 
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examData, setExamData] = useState(null);
  const [examTakenId, setExamTakenId] = useState(etId || null);
  const [questions, setQuestions] = useState([]);
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filter, setFilter] = useState('all'); 

  // Tracking thời gian làm bài từng câu
  const [timeTracker, setTimeTracker] = useState({}); 
  const currentStartTime = useRef(Date.now());

  const [timeLeft, setTimeLeft] = useState(null);
  const [openSubmitConfirm, setOpenSubmitConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const getActualClassId = () => {
    if (classId) return classId;
    if (examTakenId) {
      const savedClassId = localStorage.getItem(`exam_class_${examTakenId}`);
      if (savedClassId) return savedClassId;
    }
    return examData?.class_id || examData?.exam_open_in?.[0]?.class_id || null;
  };


  const isFetchingExam = useRef(false);
  
  // Fetch data và set up luồng làm bài
  useEffect(() => {
    const fetchExamData = async () => {
      if (isFetchingExam.current) return;
      let isRedirecting = false;
      
      try {
        isFetchingExam.current = true; 
        setIsLoading(true);

        // Luồng 1: Bắt đầu làm bài mới
        if (classId && examId && sessionId && !etId) {
            const res = await takeExam(classId, examId, sessionId, token);
            const newEtId = res.info?.et_id || res.et_id;
            
            if (newEtId) {
                localStorage.setItem(`exam_class_${newEtId}`, classId);
                isRedirecting = true;
                navigate(`/student/assignment/continue/${newEtId}`, { replace: true });
                return; 
            }
        }

        // Luồng 2: Tiếp tục làm bài dở dang (Có etId trên URL)
        if (etId) {
            const responseData = await continueTakeExam(etId, token);
            const coreData = responseData.data || responseData;
            
            setExamTakenId(etId);
            setExamData(coreData);
            
            const rawQuestions = coreData.questions || [];
            const questionsList = rawQuestions.map(item => {
                if (item.question) return { ...item.question, answer_set: item.answer_set };
                return item;
            });
            setQuestions(questionsList);

            // Phục hồi đáp án đã chọn & setup bộ đếm thời gian
            if (questionsList.length > 0) {
                const restoredAnswers = {};
                const restoredTime = {};
                const localDraft = JSON.parse(localStorage.getItem(`exam_draft_${etId}`)) || {};

                questionsList.forEach((q, index) => {
                    if (!q.ques_id) return;
                    let savedAnswers = [];
                    if (q.answer_set && Array.isArray(q.answer_set) && q.answer_set.length > 0) {
                        savedAnswers = q.answer_set;
                    } else if (localDraft[q.ques_id]) {
                        savedAnswers = localDraft[q.ques_id];
                    }

                    if (savedAnswers.length > 0) restoredAnswers[q.ques_id] = savedAnswers;
                    restoredTime[q.ques_id] = { firstResponse: 0, totalSpent: 0, index: index };
                });
                setSelectedAnswers(restoredAnswers);
                setTimeTracker(restoredTime);
            }

            // Đồng bộ thời gian đếm ngược
            let expireTime;
            const duration = coreData.exam_session?.exam?.duration || coreData.exam?.duration || 60; 
            const dbExpire = coreData.exam_session?.expireAt || coreData.expireAt; 
            const startAt = coreData.startAt; 

            if (startAt) {
                expireTime = new Date(startAt).getTime() + duration * 60000;
            } else {
                const savedExpire = localStorage.getItem(`exam_expire_${etId}`);
                if (savedExpire) {
                    expireTime = parseInt(savedExpire, 10);
                } else {
                    expireTime = Date.now() + duration * 60000;
                    localStorage.setItem(`exam_expire_${etId}`, expireTime.toString());
                }
            }

            if (dbExpire && expireTime > new Date(dbExpire).getTime()) {
                expireTime = new Date(dbExpire).getTime();
            }

            setTimeLeft(Math.max(0, Math.floor((expireTime - Date.now()) / 1000)));
        }

      } catch (error) {
        console.error("Lỗi lấy đề thi:", error);
        setSnackbar({ open: true, message: 'Lỗi tải đề thi. Vui lòng thử lại!', severity: 'error' });
      } finally {
        if (!isRedirecting) {
          setIsLoading(false);
        }

        isFetchingExam.current = false; 
      }
    };
    
    if (token) fetchExamData();
  }, [classId, examId, sessionId, etId, token, navigate]);

  // Đếm ngược thời gian
  useEffect(() => {
    if (timeLeft === null || isSubmitting) return;
    if (timeLeft <= 0) {
      handleFinalSubmit(true); // Hết giờ -> Tự động nộp
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  // Cập nhật tổng thời gian đã dành cho 1 câu hỏi
  const updateTimeSpent = (questionId) => {
    const timeSpent = Date.now() - currentStartTime.current;
    setTimeTracker(prev => {
      const current = prev[questionId] || { firstResponse: 0, totalSpent: 0 };
      return { ...prev, [questionId]: { ...current, totalSpent: current.totalSpent + timeSpent }};
    });
    currentStartTime.current = Date.now(); 
  };

  // Xây dựng Payload gửi lên Server
  const buildPayload = (currentAnswers, tracker) => {
    return questions.map((q, index) => {
      const t = tracker[q.ques_id] || { firstResponse: 0, totalSpent: 0 };
      return {
        ques_id: q.ques_id,
        answers: currentAnswers[q.ques_id] || [],
        ms_first_response: t.firstResponse || t.totalSpent || 500, 
        ms_total_response: t.totalSpent || 1000, 
        index: index
      };
    });
  };

  // Xử lý khi click vào Đáp án
  const handleAnswerChange = (questionId, answerAid, isMultiChoice) => {
    let newAnswersObj = {};
    
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };
      if (isMultiChoice) {
        const currentSelections = prev[questionId] || [];
        if (currentSelections.includes(answerAid)) {
          newAnswers[questionId] = currentSelections.filter((id) => id !== answerAid); 
        } else {
          newAnswers[questionId] = [...currentSelections, answerAid]; 
        }
      } else {
        newAnswers[questionId] = [answerAid]; 
      }
      newAnswersObj = newAnswers;
      
      // Lưu nháp xuống LocalStorage
      localStorage.setItem(`exam_draft_${examTakenId}`, JSON.stringify(newAnswersObj));
      return newAnswers;
    });

    // Cập nhật ms_first_response
    setTimeTracker(prev => {
      const current = prev[questionId] || { totalSpent: 0 };
      const newTracker = { ...prev };
      if (!current.firstResponse) {
        newTracker[questionId] = { ...current, firstResponse: Date.now() - currentStartTime.current };
      }

      const actClassId = getActualClassId();
      if (actClassId && examTakenId) {
         const payload = buildPayload(newAnswersObj, newTracker);
         // Gửi isDone: false để báo server đây chỉ là lưu nháp
         submitExam(examTakenId, actClassId, payload, false, token).catch(() => {});
      }
      return newTracker;
    });
  };

  // Điều hướng câu hỏi
  const handleStepClick = (stepIndex) => {
    if (questions[activeStep]) updateTimeSpent(questions[activeStep].ques_id);
    setActiveStep(stepIndex);
  };
  const handleNext = () => handleStepClick(Math.min(activeStep + 1, questions.length - 1));
  const handleBack = () => handleStepClick(Math.max(activeStep - 1, 0));

  // Hàm nộp bài chính thức
  const handleFinalSubmit = async (isAutoSubmit = false) => {
    if (questions[activeStep]) updateTimeSpent(questions[activeStep].ques_id); 
    setIsSubmitting(true);
    setOpenSubmitConfirm(false);

    try {
      const actClassId = getActualClassId();
      const payload = buildPayload(selectedAnswers, timeTracker);
      
      // Gọi API Nộp bài (isDone: true)
      const res = await submitExam(examTakenId, actClassId || 'no-class-id', payload, true, token); 
      
      // Xóa nháp
      localStorage.removeItem(`exam_draft_${examTakenId}`);
      localStorage.removeItem(`exam_expire_${examTakenId}`);
      localStorage.removeItem(`exam_class_${examTakenId}`);

      setSnackbar({ open: true, message: isAutoSubmit ? 'Hết giờ! Đã nộp bài tự động.' : 'Nộp bài thành công!', severity: 'success' });
      
      // Chuyển hướng sang trang Kết Quả, đính kèm kết quả trả về
      setTimeout(() => {
        navigate(`/student/assignment/result/${examTakenId}`, { state: { resultData: res.data } });
      }, 1000);

    } catch (error) {
      console.error("Lỗi nộp bài:", error);
      setSnackbar({ open: true, message: 'Lỗi nộp bài. Vui lòng thử lại!', severity: 'error' });
      setIsSubmitting(false);
    }
  };

  // Render Loading & Lỗi
  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8' }}><CircularProgress size={60} thickness={4} /></Box>;
  if (!questions.length) return <Container><Typography variant="h5" color="error" align="center" mt={5}>Không tải được dữ liệu đề thi.</Typography></Container>;

  const currentQuestion = questions[activeStep];
  const isMultiChoice = currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'MULTIPLE_CHOICE';
  const displayTitle = examData?.exam_session?.exam?.title || examData?.exam?.title || examData?.title || 'Bài thi';
  const displaySubject = examData?.exam_session?.exam?.category?.subject || examData?.exam?.category?.subject || examData?.category?.subject || 'Bài tập';

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        pt: 3, pb: 2, 
        px: { xs: 2, sm: 3 }, 
        backgroundColor: '#f4f6f8', 
        minHeight: '100vh', 
        display: 'flex', flexDirection: 'column' 
      }}
    >
      
      {/* Nút bật/tắt Bảng tiến độ */}
      <Fab 
        color="primary" variant="extended" aria-label="open-navigation"
        onClick={() => setIsDrawerOpen(true)}
        sx={{ position: 'fixed', bottom: 32, right: { xs: 16, md: 32 }, zIndex: 1000, fontWeight: 700, px: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
      >
        <FormatListBulletedIcon sx={{ mr: 1 }} />
        Bảng tiến độ
      </Fab>

      {/* Header bài thi */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>{displayTitle}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
          <MenuBookIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body1" fontWeight={500}>{displaySubject}</Typography>
        </Box>
      </Box>

      {/* Vùng câu hỏi */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pb: 2, width: '100%' }}>
          <Paper 
            elevation={0} 
            sx={{ 
              flexGrow: 1, 
              overflow: 'hidden',
              borderRadius: 4, 
              border: '1px solid', 
              borderColor: 'grey.200', 
              display: 'flex', flexDirection: 'column', 
              backgroundColor: '#fff' 
            }}
          >
            {/* Header Câu hỏi & Timer */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 2, md: 3 }, borderBottom: '1px solid #eee' }}>
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary.main" component="span">Câu {activeStep + 1} </Typography>
                <Typography component="span" color="text.secondary" variant="h6" fontWeight={600}> / {questions.length}</Typography>
                <Chip label={isMultiChoice ? "Nhiều đáp án" : "Một đáp án"} variant="outlined" size="small" sx={{ ml: 2, fontWeight: 600 }} />
              </Box>
              <Chip icon={<AccessTimeIcon sx={{ fontSize: 20 }}/>} label={timeLeft !== null ? formatTime(timeLeft) : '00:00'} color={timeLeft < 300 ? "error" : "primary"} sx={{ fontWeight: 800, fontSize: '1.1rem', py: 2.5, px: 1, borderRadius: 2 }} />
            </Box>
            
            {/* Nội dung câu hỏi */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', p: { xs: 2, md: 4, lg: 5 } }}>
              <Box sx={{ fontSize: '1.2rem', lineHeight: 1.8, mb: 4, color: 'text.primary', fontWeight: 500, width: '100%' }}>
                <HtmlContentRenderer htmlContent={currentQuestion.content} />
              </Box>
              
              <FormGroup sx={{ width: '100%' }}>
                {currentQuestion.answers?.map((answer, index) => {
                  const isSelected = (selectedAnswers[currentQuestion.ques_id] || []).includes(answer.aid);
                  return (
                    <FormControlLabel
                      key={answer.aid} value={answer.aid}
                      control={isMultiChoice ? <Checkbox checked={isSelected} size="large" /> : <Radio checked={isSelected} size="large" />}
                      label={
                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', py: 1 }}>
                            <Typography sx={{ mr: 2, fontWeight: 700, fontSize: '1.1rem', color: isSelected ? 'primary.main' : 'text.secondary', mt: '2px' }}>{getAnswerPrefix(index)}.</Typography>
                            <Box sx={{ flexGrow: 1, fontSize: '1.1rem', lineHeight: 1.6, width: '100%' }}><HtmlContentRenderer htmlContent={answer.content} /></Box>
                        </Box>
                      }
                      onChange={() => handleAnswerChange(currentQuestion.ques_id, answer.aid, isMultiChoice)}
                      sx={{
                        m: 0, mb: 2, pr: 3, pl: 1, py: 1, width: '100%', borderRadius: 3, border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'grey.200', backgroundColor: isSelected ? 'primary.50' : 'transparent',
                        alignItems: 'flex-start', '&:hover': { borderColor: isSelected ? 'primary.main' : 'grey.300', backgroundColor: isSelected ? 'primary.50' : 'grey.50' },
                        '& .MuiFormControlLabel-label': { width: '100%' } 
                      }}
                    />
                  );
                })}
              </FormGroup>
            </Box>

            {/* Nút Điều hướng */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: { xs: 2, md: 3 }, borderTop: '1px solid #eee' }}>
              <Button variant="outlined" size="large" onClick={handleBack} disabled={activeStep === 0} startIcon={<ArrowBackIcon />} sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}>Câu trước</Button>
              <Button variant="contained" size="large" onClick={handleNext} disabled={activeStep === questions.length - 1} endIcon={<ArrowForwardIcon />} disableElevation sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}>Câu tiếp</Button>
            </Box>
          </Paper>
      </Box>

      {/* Drawer Bảng tiến độ  */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: { 
            width: { xs: '85vw', sm: 400 }, 
            p: 3, 
            borderTopLeftRadius: 16, 
            borderBottomLeftRadius: 16,
            display: 'flex', flexDirection: 'column'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Tiến độ làm bài
          </Typography>
          <IconButton onClick={() => setIsDrawerOpen(false)} color="inherit">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1.5 }}>
            {questions.map((q, index) => {
              const isAnswered = (selectedAnswers[q.ques_id] || []).length > 0;
              const isActive = index === activeStep;

              return (
                <Button
                  key={q.ques_id} variant={isAnswered ? "contained" : "outlined"} 
                  onClick={() => {
                    handleStepClick(index);
                    setIsDrawerOpen(false); 
                  }}
                  sx={{
                    minWidth: 0, height: 48, borderRadius: 2, fontWeight: 800, fontSize: '1.1rem', p: 0,
                    bgcolor: isAnswered ? 'primary.main' : (isActive ? 'secondary.light' : 'grey.100'),
                    color: isAnswered ? '#fff' : (isActive ? '#fff' : 'text.primary'),
                    border: '2px solid', borderColor: isActive ? 'secondary.main' : (isAnswered ? 'primary.main' : 'grey.300'),
                    '&:hover': { bgcolor: isAnswered ? 'primary.dark' : 'grey.200' }
                  }}
                >
                  {index + 1}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ pt: 2, borderTop: '1px solid #eee', mt: 2 }}>
          <Button
            fullWidth variant="contained" color="success" size="large" startIcon={<SendIcon />}
            onClick={() => {
              setIsDrawerOpen(false);
              setOpenSubmitConfirm(true);
            }} 
            disabled={isSubmitting} disableElevation
            sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, fontSize: '1.2rem' }}
          >
            Nộp bài thi
          </Button>
        </Box>
      </Drawer>

      {/* Dialog xác nhận nộp bài */}
      <Dialog open={openSubmitConfirm} onClose={() => setOpenSubmitConfirm(false)} PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.6rem', textAlign: 'center', pb: 1 }}>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '1.1rem', textAlign: 'center', color: 'text.primary' }}>
            Bạn đã trả lời <Typography component="span" fontWeight={800} color="primary" fontSize="1.3rem">{Object.values(selectedAnswers).filter(a => a && a.length > 0).length}</Typography> / {questions.length} câu hỏi. <br/><br/>
            Bạn có chắc chắn muốn nộp ngay?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setOpenSubmitConfirm(false)} variant="outlined" color="inherit" size="large" sx={{ borderRadius: 2, fontWeight: 700 }}>Kiểm tra lại</Button>
          <Button onClick={() => handleFinalSubmit(false)} variant="contained" color="success" size="large" disableElevation sx={{ borderRadius: 2, fontWeight: 700 }}>Nộp bài ngay</Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})} />
    </Container>
  );
}