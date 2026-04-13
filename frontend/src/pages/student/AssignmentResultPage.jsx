import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import {
  Typography, Box, CircularProgress, Paper, Button, Chip, Accordion, AccordionSummary, AccordionDetails,
  Drawer, Fab, IconButton, useTheme, Tooltip, Zoom, useMediaQuery ,Grid
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CloseIcon from '@mui/icons-material/Close';

import 'katex/dist/katex.min.css';
import katex from 'katex';
import DOMPurify from 'dompurify'; 

import { continueTakeExam } from '../../services/ExamService';

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(2),
    padding: theme.spacing(3),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '16px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 4px 24px rgba(0,0,0,0.02)',
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
                  catch (e) { element.textContent = `[Lỗi LaTeX: ${latex}]`; }
              }
          });
      }
  }, [cleanHtml]); 

  return <Box ref={containerRef} dangerouslySetInnerHTML={{ __html: cleanHtml }} sx={{ '& p': { m: 0, p: 0 }, width: '100%', overflowX: 'auto', wordBreak: 'break-word' }} />;
});

const getAnswerPrefix = (index) => String.fromCharCode(65 + index);

export default function StudentAssignmentResultPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const { etId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [isLoading, setIsLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(-1);

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
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchResultData();
  }, [etId, token]);

  const scrollToQuestion = useCallback((index) => {
    const element = document.getElementById(`question-${index}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'instant' }); 
    }
    if (!isDesktop) setIsDrawerOpen(false); 
  }, [isDesktop]);

  const processedQuestions = useMemo(() => {
    return questions.map((q, originalIndex) => {
      let selectedAnswers = [];
      if (Array.isArray(q.answer_set)) selectedAnswers = q.answer_set;
      else if (typeof q.answer_set === 'string') {
          try { selectedAnswers = JSON.parse(q.answer_set); } catch(e){}
      }

      const correctAnswerIds = q.answers?.filter(a => a.is_correct).map(a => a.aid) || [];
      const isMissed = selectedAnswers.length === 0;
      
      const correctSelectedCount = selectedAnswers.filter(id => correctAnswerIds.includes(id)).length;
      const wrongSelectedCount = selectedAnswers.filter(id => !correctAnswerIds.includes(id)).length;

      const isQuestionCorrect = !isMissed && correctSelectedCount === correctAnswerIds.length && wrongSelectedCount === 0;
      const isQuestionPartiallyCorrect = !isMissed && !isQuestionCorrect && correctSelectedCount > 0;
      const isQuestionWrong = !isMissed && !isQuestionCorrect && !isQuestionPartiallyCorrect;

      return { ...q, selectedAnswers, isQuestionCorrect, isQuestionPartiallyCorrect, isQuestionWrong, isMissed, correctAnswerIds, originalIndex };
    });
  }, [questions]);

  const { correctQuestions, partialQuestions, wrongQuestions, missedQuestions, filteredQuestions } = useMemo(() => {
    const correct = processedQuestions.filter(q => q.isQuestionCorrect);
    const partial = processedQuestions.filter(q => q.isQuestionPartiallyCorrect);
    const wrong = processedQuestions.filter(q => q.isQuestionWrong);
    const missed = processedQuestions.filter(q => q.isMissed);
    const filtered = processedQuestions.filter(q => {
      if (filter === 'correct') return q.isQuestionCorrect;
      if (filter === 'partial') return q.isQuestionPartiallyCorrect;
      if (filter === 'wrong') return q.isQuestionWrong;
      if (filter === 'missed') return q.isMissed;
      return true;
    });

    return { correctQuestions: correct, partialQuestions: partial, wrongQuestions: wrong, missedQuestions: missed, filteredQuestions: filtered };
  }, [processedQuestions, filter]);

  const isExpired = useMemo(() => {
    return examData?.exam_session?.expireAt ? new Date() > new Date(examData.exam_session.expireAt) : false;
  }, [examData]);
  
  const canViewDetails = useMemo(() => {
    return examData?.exam_session?.expireAt ? new Date() > new Date(examData.exam_session.expireAt) : true;
  }, [examData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idParts = entry.target.id.split('-');
            if (idParts.length > 1) {
              setActiveQuestion(parseInt(idParts[1], 10));
            }
          }
        });
      }, { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 });

      filteredQuestions.forEach(q => {
        const el = document.getElementById(`question-${q.originalIndex}`);
        if (el) observer.observe(el);
      });

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [filteredQuestions]);

  const NavigationBoardContent = useMemo(() => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: isDark ? theme.palette.background.paper : '#fff', borderRadius: isDesktop ? '16px' : 0, border: isDesktop ? `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}` : 'none', overflow: 'hidden', boxShadow: isDesktop ? (isDark ? `0 0 20px ${alpha(theme.palette.primary.main, 0.05)}` : '0 4px 24px rgba(0,0,0,0.03)') : 'none' }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}`, bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : '#fff' }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.2}>
              Bảng điều hướng
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {processedQuestions.length} câu hỏi
            </Typography>
          </Box>
          {!isDesktop && (
            <IconButton onClick={() => setIsDrawerOpen(false)} color="inherit" size="small" sx={{ bgcolor: alpha(theme.palette.divider, 0.1), borderRadius: '8px' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 0.75, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          <Chip label="Tất cả" variant={filter === "all" ? "filled" : "outlined"} color="primary" onClick={() => setFilter("all")} size="small" sx={{ fontWeight: 600, borderRadius: '8px', flexShrink: 0 }} />
          <Chip label={`Sai (${wrongQuestions.length})`} variant={filter === "wrong" ? "filled" : "outlined"} color="error" onClick={() => setFilter("wrong")} size="small" sx={{ fontWeight: 700, borderRadius: '8px', flexShrink: 0 }} />
          <Chip label={`Đúng (${correctQuestions.length})`} variant={filter === "correct" ? "filled" : "outlined"} color="success" onClick={() => setFilter("correct")} size="small" sx={{ fontWeight: 600, borderRadius: '8px', flexShrink: 0 }} />
          {partialQuestions.length > 0 && <Chip label={`Đúng 1 phần (${partialQuestions.length})`} variant={filter === "partial" ? "filled" : "outlined"} color="info" onClick={() => setFilter("partial")} size="small" sx={{ fontWeight: 600, borderRadius: '8px', flexShrink: 0 }} />}
          <Chip label={`Trống (${missedQuestions.length})`} variant={filter === "missed" ? "filled" : "outlined"} color="warning" onClick={() => setFilter("missed")} size="small" sx={{ fontWeight: 600, borderRadius: '8px', flexShrink: 0 }} />
        </Box>
      </Box>
      <Box sx={{ overflowY: "auto", flexGrow: 1, p: 2, maxHeight: isDesktop ? 'calc(100vh - 220px)' : 'none', "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { backgroundColor: alpha(theme.palette.divider, 0.3), borderRadius: "4px" } }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(34px, 1fr))", gap: 1 }}>
          {processedQuestions.map((q, index) => {
            let btnColor = alpha(theme.palette.divider, 0.08);
            let btnTextColor = theme.palette.text.primary;
            let borderColor = alpha(theme.palette.divider, 0.2);
            let tooltipText = "Chưa làm";

            if (q.isQuestionCorrect) {
              btnColor = alpha(theme.palette.success.main, 0.1);
              btnTextColor = theme.palette.success.main;
              borderColor = theme.palette.success.main;
              tooltipText = "Làm đúng";
            } else if (q.isQuestionPartiallyCorrect) {
              btnColor = alpha(theme.palette.info.main, 0.1);
              btnTextColor = theme.palette.info.main;
              borderColor = theme.palette.info.main;
              tooltipText = "Đúng 1 phần";
            } else if (q.isQuestionWrong) {
              btnColor = alpha(theme.palette.error.main, 0.1);
              btnTextColor = theme.palette.error.main;
              borderColor = theme.palette.error.main;
              tooltipText = "Làm sai";
            } else if (q.isMissed) {
              btnColor = alpha(theme.palette.warning.main, 0.1);
              btnTextColor = theme.palette.warning.dark; 
              borderColor = theme.palette.warning.main;
            }

            const isCurrentActive = activeQuestion === index;

            return (
              <Tooltip key={`nav-${index}`} title={`Câu ${index + 1}: ${tooltipText}`} placement="top" TransitionComponent={Zoom} arrow>
                <Button
                  onClick={() => scrollToQuestion(index)}
                  sx={{ 
                    minWidth: 0, height: 36, p: 0, fontWeight: 700, fontSize: "0.9rem", borderRadius: '8px', 
                    bgcolor: isCurrentActive ? btnTextColor : btnColor, 
                    color: isCurrentActive ? '#fff' : btnTextColor, 
                    border: "2px solid", borderColor: borderColor, 
                    "&:hover": { opacity: 0.8, bgcolor: isCurrentActive ? btnTextColor : btnColor },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {index + 1}
                </Button>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    </Box>
  ), [processedQuestions, filter, activeQuestion, isDesktop, isDark, theme, wrongQuestions.length, correctQuestions.length, partialQuestions.length, missedQuestions.length, scrollToQuestion]);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress size={60} thickness={4} /></Box>;

  if (!examData) return <PageWrapper><Typography variant="h5" color="error" align="center" mt={5}>Không tìm thấy dữ liệu bài thi.</Typography></PageWrapper>;

  return (
    <PageWrapper>
      {!isDesktop && canViewDetails && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
          <Fab
            color="primary"
            variant="extended"
            onClick={() => setIsDrawerOpen(true)}
            size="medium"
            sx={{ fontWeight: 700, px: 2.5, borderRadius: '12px', boxShadow: isDark ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.4)}` : "0 6px 20px rgba(0,0,0,0.12)", textTransform: 'none', fontSize: '0.95rem' }}
          >
            <FormatListBulletedIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            Điều hướng
          </Fab>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ fontWeight: 700, color: "text.secondary", bgcolor: alpha(theme.palette.divider, 0.05), px: 2, py: 1, borderRadius: '10px' }}
        >
          Quay lại
        </Button>

        {examData?.exam_session?.limit_taken > 1 && (
          <Button
            variant="contained"
            color="primary"
            disabled={isExpired}
            onClick={() => {
              const savedClassId = localStorage.getItem(`exam_class_${etId}`) || examData?.exam_session?.exam_open_in?.[0]?.class_id;
              if (savedClassId) navigate(`/student/assignment/class/${savedClassId}/exam/${examData.exam_id}/session/${examData.session_id}`);
            }}
            sx={{ fontWeight: 700, borderRadius: '10px', px: 3 }}
          >
            {isExpired ? "Đã hết hạn" : "Làm lại"}
          </Button>
        )}
      </Box>

      {canViewDetails ? (
        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8, xl: 9 }}>
            {filteredQuestions.map((q) => {
              const correctPrefixes = q.answers?.map((a, idx) => (a.is_correct ? getAnswerPrefix(idx) : null)).filter((p) => p !== null).join(", ");
              const isActive = activeQuestion === q.originalIndex;

              return (
                <Paper
                  key={q.ques_id}
                  id={`question-${q.originalIndex}`}
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    mb: 2.5,
                    borderRadius: '12px',
                    border: `2px solid ${isActive ? theme.palette.primary.main : isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.4)}`,
                    backgroundColor: isDark ? theme.palette.background.default : '#fff',
                    scrollMarginTop: "90px",
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} color={isActive ? "primary.main" : "text.primary"}>
                      Câu {q.originalIndex + 1}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {q.isMissed && <Chip label="Chưa làm" color="warning" size="small" sx={{ fontWeight: 700, borderRadius: '6px' }} />}
                      {q.isQuestionCorrect && <Chip label="Đúng" color="success" size="small" sx={{ fontWeight: 700, borderRadius: '6px' }} />}
                      {q.isQuestionPartiallyCorrect && <Chip label="Đúng 1 phần" color="info" size="small" sx={{ fontWeight: 700, borderRadius: '6px' }} />}
                      {q.isQuestionWrong && <Chip label="Sai" color="error" size="small" sx={{ fontWeight: 700, borderRadius: '6px' }} />}
                    </Box>
                  </Box>

                  <Box sx={{ fontSize: "1rem", lineHeight: 1.6, mb: 2, color: "text.primary", fontWeight: 500 }}>
                    <HtmlContentRenderer htmlContent={q.content} />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    {q.answers?.map((answer, aIndex) => {
                      const isSelected = q.selectedAnswers.includes(answer.aid);
                      const isCorrect = answer.is_correct;

                      let borderColor = isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.5);
                      let bgColor = 'transparent';
                      let borderStyle = "solid";
                      let labelText = null;
                      let labelColor = "";

                      if (isSelected && isCorrect) {
                        borderColor = theme.palette.success.main;
                        bgColor = alpha(theme.palette.success.main, 0.08);
                        labelText = "Bạn chọn đúng";
                        labelColor = theme.palette.success.main;
                      } else if (isSelected && !isCorrect) {
                        borderColor = theme.palette.error.main;
                        bgColor = alpha(theme.palette.error.main, 0.05);
                        labelText = "Bạn chọn sai";
                        labelColor = theme.palette.error.main;
                      } else if (!isSelected && isCorrect) {
                        borderColor = theme.palette.success.main;
                        bgColor = alpha(theme.palette.success.main, 0.05);
                        labelText = "Đáp án đúng";
                        labelColor = theme.palette.success.main;
                      }

                      return (
                        <Box key={answer.aid} sx={{ position: "relative", mb: 1.25, mt: labelText ? 1.5 : 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", p: 1.25, borderRadius: '10px', borderWidth: "2px", borderStyle: borderStyle, borderColor: borderColor, backgroundColor: bgColor }}>
                            <Box sx={{ display: "flex", width: "100%" }}>
                              <Typography sx={{ mr: 1.5, fontWeight: 700, color: "text.primary" }}>
                                {getAnswerPrefix(aIndex)}.
                              </Typography>
                              <Box sx={{ flexGrow: 1, fontSize: "0.95rem", color: "text.primary" }}>
                                <HtmlContentRenderer htmlContent={answer.content} />
                              </Box>
                            </Box>
                          </Box>

                          {labelText && (
                            <Typography
                              variant="caption"
                              sx={{ position: "absolute", top: -10, right: 12, backgroundColor: isDark ? theme.palette.background.paper : '#fff', px: 1, color: labelColor, fontWeight: 700, fontSize: "0.75rem", borderRadius: '4px' }}
                            >
                              {labelText}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      borderRadius: "10px !important",
                      "&:before": { display: "none" },
                      overflow: "hidden",
                      backgroundColor: 'transparent'
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "info.main" }} />} sx={{ backgroundColor: alpha(theme.palette.info.main, 0.04), minHeight: 40, "& .MuiAccordionSummary-content": { my: 0.5 } }}>
                      <Typography fontWeight={700} color="info.main" fontSize="0.9rem">Xem đáp án chi tiết</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ backgroundColor: isDark ? alpha(theme.palette.background.default, 0.5) : '#FAFAFA', borderTop: `1px solid ${alpha(theme.palette.info.main, 0.1)}`, p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700} color="success.main" mb={1.5}>
                        Đáp án: {correctPrefixes}
                      </Typography>

                      {q.explaination && q.explaination !== "<p><br></p>" && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }} mb={0.5} display="block">Hướng dẫn chung</Typography>
                          <Box sx={{ color: "text.primary", fontSize: "0.9rem", p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: '8px' }}>
                            <HtmlContentRenderer htmlContent={q.explaination} />
                          </Box>
                        </Box>
                      )}

                      {q.answers?.map((answer, aIndex) => {
                        if (answer.explaination && answer.explaination !== "<p><br></p>") {
                          return (
                            <Box key={`exp-${answer.aid}`} sx={{ mb: 1 }}>
                              <Typography variant="caption" fontWeight={700} color="text.secondary" mb={0.5} display="block">Giải thích ({getAnswerPrefix(aIndex)})</Typography>
                              <Box sx={{ fontSize: "0.85rem", color: "text.primary", p: 1.25, bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : "#fff", border: "1px solid", borderColor: alpha(theme.palette.divider, 0.3), borderRadius: '8px' }}>
                                <HtmlContentRenderer htmlContent={answer.explaination} />
                              </Box>
                            </Box>
                          );
                        }
                        return null;
                      })}
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              );
            })}
          </Grid>
          <Grid size={{ xs: 12, lg: 4, xl: 3 }} sx={{ display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 24, zIndex: 10 }}>
            {NavigationBoardContent}
          </Grid>
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ p: 4, borderRadius: '12px', textAlign: "center", bgcolor: alpha(theme.palette.warning.main, 0.1), border: "1px dashed", borderColor: "warning.main" }}>
          <Typography variant="h6" color="warning.main" fontWeight={700} mb={1}>Đang khóa đáp án</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>Chi tiết sẽ được công bố sau khi hết hạn nộp bài.</Typography>
        </Paper>
      )}

      {!isDesktop && canViewDetails && (
        <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} PaperProps={{ sx: { width: { xs: "85vw", sm: 320 }, borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px', display: "flex", flexDirection: "column", backgroundColor: isDark ? theme.palette.background.paper : '#fff', backgroundImage: 'none' } }}>
          {NavigationBoardContent}
        </Drawer>
      )}
    </PageWrapper>
  );
}