import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import {
  Typography, Box, Button, RadioGroup, Radio, Checkbox,
  FormGroup, FormControlLabel, CircularProgress, Paper, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Drawer, Fab, IconButton, Grid, useTheme, useMediaQuery, Tooltip, Zoom
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CloseIcon from '@mui/icons-material/Close';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlagIcon from '@mui/icons-material/Flag';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

import 'katex/dist/katex.min.css';
import katex from 'katex';
import DOMPurify from 'dompurify'; 

import AppSnackbar from '../../components/SnackBar';
import { takeExam, continueTakeExam, submitExam } from '../../services/ExamService';

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(2),
    padding: theme.spacing(3),
    backgroundColor: isDark ? theme.palette.background.paper : alpha(theme.palette.background.default, 0.6),
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : `0 8px 48px ${alpha(theme.palette.common.black, 0.03)}`,
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
    }
  };
});

const HtmlContentRenderer = memo(({ htmlContent }) => {
  const containerRef = useRef(null);
  const cleanHtml = DOMPurify.sanitize(htmlContent || '', { ADD_TAGS: ['span'], ADD_ATTR: ['class', 'data-value'] });

  useEffect(() => {
      if (containerRef.current) {
          const formulaElements = containerRef.current.querySelectorAll(".ql-formula");
          formulaElements.forEach(element => {
              const latex = element.getAttribute('data-value') || element.textContent; 
              if (latex) {
                  try { katex.render(latex, element, { throwOnError: false, displayMode: false }); } 
                  catch (e) { element.textContent = `[Error: ${latex}]`; }
              }
          });
      }
  }, [cleanHtml]); 

  return <Box 
    ref={containerRef} 
    dangerouslySetInnerHTML={{ __html: cleanHtml }} 
    sx={{ 
      '& p': { m: 0, p: 0 }, 
      '& img': { maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '8px' }, 
      width: '100%', 
      overflowX: 'auto', 
      wordBreak: 'break-word' 
    }} 
  />;
});

const getAnswerPrefix = (index) => String.fromCharCode(65 + index); 

export default function StudentAssignmentSessionPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const { classId, examId, sessionId, etId } = useParams(); 
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examData, setExamData] = useState(null);
  const [examTakenId, setExamTakenId] = useState(etId || null);
  const [questions, setQuestions] = useState([]);
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const [timeTracker, setTimeTracker] = useState({}); 
  const currentStartTime = useRef(Date.now());

  const [timeLeft, setTimeLeft] = useState(null);
  const [openSubmitConfirm, setOpenSubmitConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const isFetchingExam = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmitting && timeLeft > 0) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitting, timeLeft]);

  const getActualClassId = useCallback(() => {
    if (classId) return classId;
    if (examTakenId) {
      const savedClassId = localStorage.getItem(`exam_class_${examTakenId}`);
      if (savedClassId) return savedClassId;
    }
    return examData?.class_id || examData?.exam_open_in?.[0]?.class_id || null;
  }, [classId, examTakenId, examData]);

  useEffect(() => {
    const fetchExamData = async () => {
      if (isFetchingExam.current) return;
      let isRedirecting = false;
      
      try {
        isFetchingExam.current = true; 
        setIsLoading(true);

        if (classId && examId && sessionId && !etId) {
            const res = await takeExam(classId, examId, sessionId, token);
            const newEtId = res.info?.et_id || res.et_id;
            
            if (newEtId) {
                localStorage.setItem(`exam_class_${newEtId}`, classId);
                isRedirecting = true;
                // Dùng replace: true để học sinh không back lại trang tạo session được
                navigate(`/student/assignment/continue/${newEtId}`, { replace: true });
                return; 
            }
        }

        if (etId) {
            const responseData = await continueTakeExam(etId, token);
            const coreData = responseData.data || responseData;
            
            // 🛡️ BẢO MẬT LOGIC: Kiểm tra nếu bài thi đã được nộp
            // Tuỳ vào backend của bạn trả về field nào (is_done, status, submitAt...)
            if (coreData.is_done === true || coreData.status === 'COMPLETED' || coreData.submitAt) {
                 isRedirecting = true;
                 // Đá thẳng sang trang kết quả, dùng replace để xóa lịch sử trang hiện tại
                 navigate(`/student/assignment/result/${etId}`, { replace: true });
                 return;
            }

            setExamTakenId(etId);
            setExamData(coreData);
            
            const rawQuestions = coreData.questions || [];
            const questionsList = rawQuestions.map(item => {
                if (item.question) return { ...item.question, answer_set: item.answer_set };
                return item;
            });
            setQuestions(questionsList);

            if (questionsList.length > 0) {
                const restoredAnswers = {};
                const restoredTime = {};
                const localDraft = JSON.parse(localStorage.getItem(`exam_draft_${etId}`)) || {};
                const localBookmarks = JSON.parse(localStorage.getItem(`exam_bookmarks_${etId}`)) || [];
                setBookmarkedQuestions(localBookmarks);

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

            // Đồng bộ thời gian bảo mật
            let expireTime;
            const duration = coreData.exam_session?.exam?.duration || coreData.exam?.duration || 60; 
            const dbExpire = coreData.exam_session?.expireAt || coreData.expireAt; 
            const startAt = coreData.startAt; 

            if (startAt) {
                // Ưu tiên tính thời gian từ server (chống hack localstorage)
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

            // Chốt chặn cuối cùng: Không bao giờ vượt quá giờ đóng cửa của kỳ thi
            if (dbExpire && expireTime > new Date(dbExpire).getTime()) {
                expireTime = new Date(dbExpire).getTime();
            }

            setTimeLeft(Math.max(0, Math.floor((expireTime - Date.now()) / 1000)));
        }

      } catch (error) {
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

  const buildPayload = useCallback((currentAnswers, tracker) => {
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
  }, [questions]);

  const handleFinalSubmit = useCallback(async (isAutoSubmit = false) => {
    setIsSubmitting(true);
    setOpenSubmitConfirm(false);

    try {
      const actClassId = getActualClassId();
      const payload = buildPayload(selectedAnswers, timeTracker);
      
      const res = await submitExam(examTakenId, actClassId || 'no-class-id', payload, true, token); 
      
      localStorage.removeItem(`exam_draft_${examTakenId}`);
      localStorage.removeItem(`exam_expire_${examTakenId}`);
      localStorage.removeItem(`exam_class_${examTakenId}`);
      localStorage.removeItem(`exam_bookmarks_${examTakenId}`);

      setSnackbar({ open: true, message: isAutoSubmit ? 'Hết giờ! Đã nộp bài tự động.' : 'Nộp bài thành công!', severity: 'success' });
      
      setTimeout(() => {
        // 🛡️ BẢO MẬT LOGIC: Dùng replace: true để đè lên lịch sử
        // Trình duyệt sẽ "quên" trang làm bài này đi, bấm Back sẽ về trang bên ngoài
        navigate(`/student/assignment/result/${examTakenId}`, { 
            state: { resultData: res.data },
            replace: true 
        });
      }, 1000);

    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi nộp bài. Vui lòng thử lại!', severity: 'error' });
      setIsSubmitting(false);
    }
  }, [getActualClassId, buildPayload, selectedAnswers, timeTracker, examTakenId, token, navigate]);

  useEffect(() => {
    if (timeLeft === null || isSubmitting) return;
    if (timeLeft <= 0) {
      handleFinalSubmit(true); 
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting, handleFinalSubmit]);

  const formatTime = useCallback((seconds) => {
    if (seconds === null) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  }, []);

  const updateTimeSpent = useCallback((questionId) => {
    const timeSpent = Date.now() - currentStartTime.current;
    setTimeTracker(prev => {
      const current = prev[questionId] || { firstResponse: 0, totalSpent: 0 };
      return { ...prev, [questionId]: { ...current, totalSpent: current.totalSpent + timeSpent }};
    });
    currentStartTime.current = Date.now(); 
  }, []);

  const handleAnswerChange = useCallback((questionId, answerAid, isMultiChoice) => {
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
      
      localStorage.setItem(`exam_draft_${examTakenId}`, JSON.stringify(newAnswersObj));
      return newAnswers;
    });

    setTimeTracker(prev => {
      const current = prev[questionId] || { totalSpent: 0 };
      const newTracker = { ...prev };
      if (!current.firstResponse) {
        newTracker[questionId] = { ...current, firstResponse: Date.now() - currentStartTime.current };
      }

      const actClassId = getActualClassId();
      if (actClassId && examTakenId) {
         setSaveStatus('saving');
         const payload = buildPayload(newAnswersObj, newTracker);
         submitExam(examTakenId, actClassId, payload, false, token)
            .then(() => setSaveStatus('saved'))
            .catch(() => setSaveStatus(''));
      }
      return newTracker;
    });
  }, [examTakenId, getActualClassId, buildPayload, token]);

  const handleStepClick = useCallback((stepIndex) => {
    if (questions[activeStep]) updateTimeSpent(questions[activeStep].ques_id);
    setActiveStep(stepIndex);
  }, [questions, activeStep, updateTimeSpent]);

  const handleNext = useCallback(() => handleStepClick(Math.min(activeStep + 1, questions.length - 1)), [activeStep, questions.length, handleStepClick]);
  const handleBack = useCallback(() => handleStepClick(Math.max(activeStep - 1, 0)), [activeStep, handleStepClick]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') return;
      if (e.key === 'ArrowRight' && activeStep < questions.length - 1) handleNext();
      if (e.key === 'ArrowLeft' && activeStep > 0) handleBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep, questions.length, handleNext, handleBack]);

  const handleToggleBookmark = useCallback((questionId) => {
    setBookmarkedQuestions(prev => {
        let newList;
        if (prev.includes(questionId)) {
            newList = prev.filter(id => id !== questionId);
        } else {
            newList = [...prev, questionId];
        }
        localStorage.setItem(`exam_bookmarks_${examTakenId}`, JSON.stringify(newList));
        return newList;
    });
  }, [examTakenId]);

  const answeredCount = useMemo(() => {
    return Object.values(selectedAnswers).filter((a) => a && a.length > 0).length;
  }, [selectedAnswers]);

  const NavigationBoardContent = useMemo(() => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: isDark ? theme.palette.background.paper : theme.palette.common.white, borderRadius: isDesktop ? '16px' : 0, border: isDesktop ? `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}` : 'none', overflow: 'hidden', boxShadow: isDesktop ? (isDark ? `0 0 20px ${alpha(theme.palette.primary.main, 0.05)}` : `0 4px 24px ${alpha(theme.palette.common.black, 0.03)}`) : 'none' }}>
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}`, bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : theme.palette.common.white }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.2}>
              Tiến độ làm bài
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Đã làm {answeredCount} / {questions.length} câu
            </Typography>
          </Box>
          {!isDesktop && (
            <IconButton onClick={() => setIsDrawerOpen(false)} color="inherit" size="small" sx={{ bgcolor: alpha(theme.palette.divider, 0.1), borderRadius: '8px' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Chip
            icon={<AccessTimeIcon sx={{ fontSize: 20 }} />}
            label={formatTime(timeLeft)}
            color={timeLeft < 300 ? "error" : "primary"}
            sx={{ fontWeight: 700, fontSize: "1.1rem", py: 2.5, px: 2, borderRadius: '12px', width: '100%', display: 'flex', justifyContent: 'center' }}
          />
        </Box>
      </Box>
      
      <Box sx={{ overflowY: "auto", flexGrow: 1, p: 2.5, maxHeight: isDesktop ? 'calc(100vh - 260px)' : 'none', "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { backgroundColor: alpha(theme.palette.divider, 0.3), borderRadius: "4px" } }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))", gap: 1.5 }}>
          {questions.map((q, index) => {
            const isAnswered = (selectedAnswers[q.ques_id] || []).length > 0;
            const isActive = index === activeStep;
            const isBookmarked = bookmarkedQuestions.includes(q.ques_id);

            let btnColor = alpha(theme.palette.divider, 0.08);
            let btnTextColor = theme.palette.text.primary;
            let borderColor = alpha(theme.palette.divider, 0.2);

            if (isActive) {
              btnColor = alpha(theme.palette.primary.main, 0.1);
              btnTextColor = theme.palette.primary.main;
              borderColor = theme.palette.primary.main;
            } else if (isAnswered) {
              btnColor = theme.palette.primary.main;
              btnTextColor = theme.palette.common.white;
              borderColor = theme.palette.primary.main;
            }

            return (
              <Button
                key={q.ques_id}
                onClick={() => {
                  handleStepClick(index);
                  if (!isDesktop) setIsDrawerOpen(false);
                }}
                sx={{ 
                  width: 36, height: 36, minWidth: 36, p: 0, fontWeight: 700, fontSize: "0.9rem", borderRadius: '8px', 
                  bgcolor: btnColor, 
                  color: btnTextColor, 
                  border: "2px solid", borderColor: borderColor, 
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  "&:hover": { opacity: 0.8, bgcolor: btnColor },
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative' 
                }}
              >
                {index + 1}
                {isBookmarked && (
                  <Box sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', borderRadius: '50%', p: 0.25, display: 'flex', boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}` }}>
                      <FlagIcon sx={{ fontSize: '14px', color: theme.palette.warning.main }} />
                  </Box>
                )}
              </Button>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ p: 2.5, borderTop: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}`, bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : theme.palette.common.white }}>
        <Button
          fullWidth
          variant="contained"
          color="success"
          size="large"
          startIcon={<SendIcon />}
          onClick={() => {
            if (!isDesktop) setIsDrawerOpen(false);
            setOpenSubmitConfirm(true);
          }}
          disabled={isSubmitting}
          disableElevation
          sx={{ borderRadius: '12px', py: 1.5, fontWeight: 700 }}
        >
          Nộp bài thi
        </Button>
      </Box>
    </Box>
  ), [isDesktop, isDark, theme, answeredCount, questions, timeLeft, selectedAnswers, activeStep, isSubmitting, handleStepClick, formatTime, bookmarkedQuestions]);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: isDark ? theme.palette.background.default : alpha(theme.palette.background.default, 0.6) }}><CircularProgress size={60} thickness={4} /></Box>;
  
  // Tránh render nếu bị redirect
  if (!questions.length) return <PageWrapper><Typography variant="h5" color="error" align="center" mt={5}>Đang xử lý dữ liệu...</Typography></PageWrapper>;

  const currentQuestion = questions[activeStep];
  const isMultiChoice = currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'MULTIPLE_CHOICE';
  const displayTitle = examData?.exam_session?.exam?.title || examData?.exam?.title || examData?.title || 'Bài thi';
  const isCurrentBookmarked = bookmarkedQuestions.includes(currentQuestion?.ques_id);

  return (
    <PageWrapper>
      {!isDesktop && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
          <Fab
            color="primary"
            variant="extended"
            onClick={() => setIsDrawerOpen(true)}
            size="medium"
            sx={{ fontWeight: 700, px: 2.5, borderRadius: '12px', boxShadow: isDark ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.4)}` : `0 6px 20px ${alpha(theme.palette.common.black, 0.12)}`, textTransform: 'none', fontSize: '0.95rem' }}
          >
            <FormatListBulletedIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            Tiến độ
          </Fab>
        </Box>
      )}

      <Box sx={{ mb: 4, px: 1 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {displayTitle}
        </Typography>
      </Box>

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 8, xl: 9 }} sx={{ display: "flex", flexDirection: "column" }}>
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              borderRadius: '16px',
              border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
              display: "flex",
              flexDirection: "column",
              backgroundColor: isDark ? theme.palette.background.paper : theme.palette.common.white,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: { xs: 2.5, md: 3.5 }, borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.2)}` }}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6" fontWeight={700} color="primary.main" component="span">
                  Câu {activeStep + 1}
                </Typography>
                <Typography component="span" color="text.secondary" variant="body1" fontWeight={700} sx={{ ml: 0.5 }}>
                  / {questions.length}
                </Typography>
                
                {saveStatus === 'saving' && <CircularProgress size={16} sx={{ ml: 2, color: 'text.secondary' }} />}
                {saveStatus === 'saved' && (
                  <Box display="flex" alignItems="center" ml={2} sx={{ opacity: 0.7 }}>
                    <CloudDoneIcon color="success" sx={{ fontSize: 20 }} />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5, fontWeight: 700 }}>Đã lưu</Typography>
                  </Box>
                )}

                <Tooltip title={isCurrentBookmarked ? "Bỏ đánh dấu" : "Đánh dấu xem lại"} placement="top">
                    <IconButton 
                        onClick={() => handleToggleBookmark(currentQuestion.ques_id)} 
                        sx={{ ml: 1.5, color: isCurrentBookmarked ? theme.palette.warning.main : 'text.disabled' }}
                    >
                        {isCurrentBookmarked ? <FlagIcon /> : <OutlinedFlagIcon />}
                    </IconButton>
                </Tooltip>

                <Chip label={isMultiChoice ? "Nhiều đáp án" : "Một đáp án"} variant="outlined" color="primary" size="small" sx={{ ml: 1, fontWeight: 700, borderRadius: '8px', display: { xs: 'none', sm: 'flex' } }} />
              </Box>
              
              {!isDesktop && (
                <Chip icon={<AccessTimeIcon sx={{ fontSize: 16 }} />} label={formatTime(timeLeft)} color={timeLeft < 300 ? "error" : "primary"} size="small" sx={{ fontWeight: 700, borderRadius: '8px' }} />
              )}
            </Box>

            <Box sx={{ flexGrow: 1, p: { xs: 2.5, md: 4 } }}>
              <Box sx={{ fontSize: "1.1rem", lineHeight: 1.8, mb: 4, color: "text.primary", fontWeight: 500, width: "100%" }}>
                <HtmlContentRenderer htmlContent={currentQuestion.content} />
              </Box>

              <FormGroup sx={{ width: "100%" }}>
                {currentQuestion.answers?.map((answer, index) => {
                  const isSelected = (selectedAnswers[currentQuestion.ques_id] || []).includes(answer.aid);
                  return (
                    <FormControlLabel
                      key={answer.aid}
                      value={answer.aid}
                      control={isMultiChoice ? <Checkbox checked={isSelected} size="medium" /> : <Radio checked={isSelected} size="medium" />}
                      label={
                        <Box sx={{ display: "flex", width: "100%", alignItems: "flex-start", py: 0.5 }}>
                          <Typography sx={{ mr: 1.5, fontWeight: 700, fontSize: "1rem", color: isSelected ? "primary.main" : "text.secondary", mt: "2px" }}>
                            {getAnswerPrefix(index)}.
                          </Typography>
                          <Box sx={{ flexGrow: 1, fontSize: "1rem", lineHeight: 1.6, width: "100%" }}>
                            <HtmlContentRenderer htmlContent={answer.content} />
                          </Box>
                        </Box>
                      }
                      onChange={() => handleAnswerChange(currentQuestion.ques_id, answer.aid, isMultiChoice)}
                      sx={{
                        m: 0, mb: 1.5, pr: 2, pl: 1, py: 1, width: "100%", borderRadius: '12px',
                        border: "2px solid", borderColor: isSelected ? "primary.main" : isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3),
                        backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                        alignItems: "flex-start",
                        transition: 'all 0.2s',
                        "&:hover": { borderColor: isSelected ? "primary.main" : alpha(theme.palette.primary.main, 0.5), backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.02) },
                        "& .MuiFormControlLabel-label": { width: "100%" },
                      }}
                    />
                  );
                })}
              </FormGroup>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", p: { xs: 2.5, md: 3.5 }, borderTop: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.2)}`, bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.background.default, 0.6) }}>
              <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0} startIcon={<ArrowBackIcon />} sx={{ borderRadius: '10px', fontWeight: 700, px: { xs: 2, sm: 3 } }}>
                Câu trước
              </Button>
              
              {activeStep === questions.length - 1 ? (
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={() => {
                    if (!isDesktop) setIsDrawerOpen(false);
                    setOpenSubmitConfirm(true);
                  }} 
                  endIcon={<SendIcon />} 
                  disableElevation 
                  sx={{ borderRadius: '10px', fontWeight: 700, px: { xs: 2, sm: 4 } }}
                >
                  Nộp bài
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleNext} 
                  endIcon={<ArrowForwardIcon />} 
                  disableElevation 
                  sx={{ borderRadius: '10px', fontWeight: 700, px: { xs: 2, sm: 4 } }}
                >
                  Câu tiếp
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4, xl: 3 }} sx={{ display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 24, zIndex: 10 }}>
          {NavigationBoardContent}
        </Grid>
      </Grid>

      {!isDesktop && (
        <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} PaperProps={{ sx: { width: { xs: "85vw", sm: 320 }, borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px', display: "flex", flexDirection: "column", backgroundColor: isDark ? theme.palette.background.paper : theme.palette.common.white, backgroundImage: 'none' } }}>
          {NavigationBoardContent}
        </Drawer>
      )}

      <Dialog open={openSubmitConfirm} onClose={() => setOpenSubmitConfirm(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1, minWidth: { xs: '90vw', sm: 400 }, backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.4rem", textAlign: "center", pb: 1 }}>
          Xác nhận nộp bài
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "1rem", textAlign: "center", color: "text.primary" }}>
            Bạn đã trả lời <Typography component="span" fontWeight={700} color="primary.main" fontSize="1.2rem">{answeredCount}</Typography> / {questions.length} câu hỏi. <br /><br />Bạn có chắc chắn muốn nộp ngay?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center", gap: 2 }}>
          <Button onClick={() => setOpenSubmitConfirm(false)} variant="outlined" color="inherit" sx={{ borderRadius: '10px', fontWeight: 700 }}>
            Kiểm tra lại
          </Button>
          <Button onClick={() => handleFinalSubmit(false)} variant="contained" color="success" disableElevation sx={{ borderRadius: '10px', fontWeight: 700 }}>
            Nộp bài ngay
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} />
    </PageWrapper>
  );
}