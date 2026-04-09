import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import {
  Container, Typography, Box, CircularProgress, Paper, Divider, 
  Grid, Button, Chip, Accordion, AccordionSummary, AccordionDetails,
  Drawer, Fab, IconButton
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CloseIcon from '@mui/icons-material/Close';

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

const formatDuration = (start, end) => {
  if (!start || !end) return '-';
  const diff = new Date(end) - new Date(start);
  if (diff <= 0) return '0 giây';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  let result = [];
  if (days > 0) result.push(`${days} ngày`);
  if (hours > 0) result.push(`${hours} giờ`);
  if (minutes > 0) result.push(`${minutes} phút`);
  if (seconds > 0 || result.length === 0) result.push(`${seconds} giây`);

  return result.join(' '); 
};

export default function StudentAssignmentResultPage() {
  const { etId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  const token = localStorage.getItem('token');

  const [isLoading, setIsLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('all'); 
  
  // State điều khiển ngăn kéo 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  // Hàm xử lý cuộn mượt đến câu hỏi & đóng Drawer
  const scrollToQuestion = (index) => {
    const element = document.getElementById(`question-${index}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsDrawerOpen(false); 
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8' }}><CircularProgress size={60} thickness={4} /></Box>;

  if (!examData) return <Container><Typography variant="h5" color="error" align="center" mt={5}>Không tìm thấy dữ liệu bài thi.</Typography></Container>;

  const displayTitle = examData?.exam_session?.exam?.title || 'Bài thi';
  const rawScore = location.state?.resultData?.final_score ?? examData?.final_score;
  const totalScore = rawScore !== undefined && rawScore !== null ? Number(rawScore).toFixed(2) : 'Đang chấm...';

  // Lấy thời gian học sinh làm và đóng bài
  const startTime = location.state?.resultData?.startAt || examData?.startAt;
  const endTime = location.state?.resultData?.doneAt || examData?.doneAt;

  const processedQuestions = questions.map((q, originalIndex) => {
    let selectedAnswers = [];
    if (Array.isArray(q.answer_set)) selectedAnswers = q.answer_set;
    else if (typeof q.answer_set === 'string') {
        try { selectedAnswers = JSON.parse(q.answer_set); } catch(e){}
    }

    const correctAnswerIds = q.answers?.filter(a => a.is_correct).map(a => a.aid) || [];
    const isMissed = selectedAnswers.length === 0;
    const isQuestionCorrect = !isMissed && selectedAnswers.length === correctAnswerIds.length && selectedAnswers.every(id => correctAnswerIds.includes(id));
    const isQuestionWrong = !isMissed && !isQuestionCorrect;

    return { ...q, selectedAnswers, isQuestionCorrect, isQuestionWrong, isMissed, correctAnswerIds, originalIndex };
  });

  const correctQuestions = processedQuestions.filter(q => q.isQuestionCorrect);
  const wrongQuestions = processedQuestions.filter(q => q.isQuestionWrong);
  const missedQuestions = processedQuestions.filter(q => q.isMissed);

  const totalCompleted = processedQuestions.filter(q => !q.isMissed).length;

  const filteredQuestions = processedQuestions.filter(q => {
    if (filter === 'correct') return q.isQuestionCorrect;
    if (filter === 'wrong') return q.isQuestionWrong;
    if (filter === 'missed') return q.isMissed;
    return true;
  });

  const isExpired = examData?.exam_session?.expireAt 
  ? new Date() > new Date(examData.exam_session.expireAt) 
  : false;
  
  const canViewDetails = examData?.exam_session?.expireAt 
    ? new Date() > new Date(examData.exam_session.expireAt) 
    : true; // Nếu bài không cài hạn chót thì cho xem 
    
  return (
    <Container
      maxWidth="lg"
      sx={{
        pt: 3,
        pb: 12,
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {canViewDetails && (
        <Draggable>
          <Box sx={{ position: 'fixed', bottom: 32, right: { xs: 16, md: 32 }, zIndex: 1000, cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
            <Fab
              color="primary"
              variant="extended"
              aria-label="open-navigation"
              onClick={() => setIsDrawerOpen(true)}
              sx={{
                fontWeight: 700,
                px: 3,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              <FormatListBulletedIcon sx={{ mr: 1 }} />
              Bảng điều hướng
            </Fab>
          </Box>
        </Draggable>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/student/assignment")}
          sx={{ fontWeight: 700, color: "text.secondary" }}
        >
          Danh sách bài tập
        </Button>

        {examData?.exam_session?.limit_taken > 1 && (
          <Button
            variant="contained"
            color="primary"
            // Vô hiệu hóa nút nếu đã hết hạn
            disabled={isExpired}
            onClick={() => {
              const savedClassId =
                localStorage.getItem(`exam_class_${etId}`) ||
                examData?.exam_session?.exam_open_in?.[0]?.class_id;
              if (savedClassId)
                navigate(
                  `/student/assignment/class/${savedClassId}/exam/${examData.exam_id}/session/${examData.session_id}`,
                );
            }}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            {isExpired ? "Đã hết hạn nộp bài" : "Làm lại bài thi"}
          </Button>
        )}
      </Box>

      {/* Card tổng quan */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          mb: 4,
          textAlign: "center",
          backgroundColor: "#fff",
          border: "1px solid",
          borderColor: "grey.200",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
          <Box
            sx={{ p: 2, borderRadius: "50%", backgroundColor: "success.50" }}
          >
            <AssignmentTurnedInIcon
              sx={{ fontSize: 50, color: "success.main" }}
            />
          </Box>
        </Box>
        <Typography
          variant="h4"
          fontWeight={700}
          color="text.primary"
          gutterBottom
        >
          Kết quả làm bài
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={500} mb={4}>
          {displayTitle}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Grid container justifyContent="center" alignItems="center" spacing={0}>
          <Grid item xs={12} sm={3} sx={{ py: 2 }}>
            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight={600}
              gutterBottom
            >
              Điểm số của bạn
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {totalScore}
            </Typography>
          </Grid>

          {/* VẠCH KẺ THỨ NHẤT */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              display: { xs: "none", sm: "block" },
              borderStyle: "dashed",
              mx: { sm: 2, md: 4 },
            }}
          />

          <Grid item xs={12} sm={3} sx={{ py: 2 }}>
            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight={600}
              gutterBottom
            >
              Thời gian làm bài
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              color="info.main"
              sx={{ mt: 1 }}
            >
              {formatDuration(startTime, endTime)}
            </Typography>
          </Grid>

          {/* VẠCH KẺ THỨ HAI */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              display: { xs: "none", sm: "block" },
              borderStyle: "dashed",
              mx: { sm: 2, md: 4 },
            }}
          />

          <Grid item xs={12} sm={3} sx={{ py: 2 }}>
            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight={600}
              gutterBottom
            >
              Số câu đã làm
            </Typography>
            <Typography variant="h4" fontWeight={700} color="success.main">
              {totalCompleted}{" "}
              <Typography component="span" variant="h5" color="text.secondary">
                / {questions.length}
              </Typography>
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Danh sách câu hỏi */}
      {canViewDetails ? (
        <>
          <Box sx={{ maxWidth: "100%", mx: "auto" }}>
            <Typography
              variant="h5"
              fontWeight={700}
              color="text.primary"
              mb={3}
              px={1}
            >
              Chi tiết bài làm
            </Typography>

            {filteredQuestions.map((q, index) => {
              const correctPrefixes = q.answers
                ?.map((a, idx) => (a.is_correct ? getAnswerPrefix(idx) : null))
                .filter((p) => p !== null)
                .join(", ");

              return (
                <Paper
                  key={q.ques_id}
                  id={`question-${q.originalIndex}`}
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    mb: 4,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "grey.200",
                    backgroundColor: "#fff",
                    scrollMarginTop: "80px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color="text.primary"
                    >
                      Câu {q.originalIndex + 1}:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {q.isMissed && (
                        <Chip
                          label="Bỏ trống"
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                      {q.isQuestionCorrect && (
                        <Chip
                          label="Đúng"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                      {q.isQuestionWrong && (
                        <Chip
                          label="Sai"
                          color="error"
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      fontSize: "1.1rem",
                      lineHeight: 1.8,
                      mb: 3,
                      color: "text.primary",
                      fontWeight: 500,
                    }}
                  >
                    <HtmlContentRenderer htmlContent={q.content} />
                  </Box>

                  <Box sx={{ pl: 1, mb: 3 }}>
                    {q.answers?.map((answer, aIndex) => {
                      const isSelected = q.selectedAnswers.includes(answer.aid);
                      const isCorrect = answer.is_correct;

                      // Không chọn
                      let borderColor = "#e0e0e0";
                      let bgColor = "transparent";
                      let borderStyle = "solid";
                      let labelText = null;
                      let labelColor = "";

                      if (isSelected && isCorrect) {
                        // 1. Chọn ĐÚNG
                        borderColor = "#4caf50";
                        borderStyle = "solid";
                        bgColor = "transparent";
                        labelText = "Đáp án chính xác";
                        labelColor = "#4caf50";
                      } else if (isSelected && !isCorrect) {
                        // 2. Chọn SAI
                        borderColor = "#f44336";
                        borderStyle = "solid";
                        bgColor = "#fff5f5";
                        labelText = "Đáp án của bạn sai";
                        labelColor = "#f44336";
                      } else if (!isSelected && isCorrect) {
                        // 3. Không chọn nhưng ĐÚNG
                        borderColor = "#2e7d32";
                        borderStyle = "dashed";
                        bgColor = "#f1f8f1";
                        labelText = null;
                      }

                      return (
                        <Box
                          key={answer.aid}
                          sx={{
                            position: "relative",
                            mb: 2,
                            mt: labelText ? 1.5 : 0,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 2,
                              borderRadius: 2,
                              borderWidth: "1.5px",
                              borderStyle: borderStyle,
                              borderColor: borderColor,
                              backgroundColor: bgColor,
                            }}
                          >
                            <Box sx={{ display: "flex", width: "100%" }}>
                              <Typography
                                sx={{
                                  mr: 1,
                                  fontWeight: 700,
                                  color: "text.primary",
                                }}
                              >
                                {getAnswerPrefix(aIndex)}.
                              </Typography>
                              <Box
                                sx={{
                                  flexGrow: 1,
                                  fontSize: "1.05rem",
                                  color: "text.primary",
                                }}
                              >
                                <HtmlContentRenderer
                                  htmlContent={answer.content}
                                />
                              </Box>
                            </Box>
                          </Box>

                          {labelText && (
                            <Typography
                              variant="caption"
                              sx={{
                                position: "absolute",
                                top: -10,
                                right: 20,
                                backgroundColor: "#fff",
                                px: 1,
                                color: labelColor,
                                fontWeight: 600,
                                fontSize: "0.8rem",
                              }}
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
                      border: "1px solid",
                      borderColor: "info.main",
                      borderRadius: "8px !important",
                      "&:before": { display: "none" },
                      overflow: "hidden",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon sx={{ color: "info.main" }} />
                      }
                      sx={{
                        backgroundColor: "info.50",
                        "& .MuiAccordionSummary-content": { my: 1.5 },
                      }}
                    >
                      <Typography fontWeight={700} color="info.dark">
                        Xem đáp án & Hướng dẫn giải
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        backgroundColor: "#fff",
                        borderTop: "1px solid",
                        borderColor: "info.100",
                        p: 3,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color="success.main"
                        mb={2}
                      >
                        Đáp án chính xác: {correctPrefixes}
                      </Typography>

                      {q.explaination && q.explaination !== "<p><br></p>" && (
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="text.secondary"
                            mb={1}
                          >
                            Hướng dẫn giải chung:
                          </Typography>
                          <Box
                            sx={{
                              color: "text.primary",
                              fontSize: "1rem",
                              p: 2,
                              bgcolor: "grey.50",
                              borderRadius: 2,
                            }}
                          >
                            <HtmlContentRenderer htmlContent={q.explaination} />
                          </Box>
                        </Box>
                      )}

                      {q.answers?.map((answer, aIndex) => {
                        if (
                          answer.explaination &&
                          answer.explaination !== "<p><br></p>"
                        ) {
                          return (
                            <Box key={`exp-${answer.aid}`} sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color="text.secondary"
                                mb={0.5}
                              >
                                Giải thích phương án {getAnswerPrefix(aIndex)}:
                              </Typography>
                              <Box
                                sx={{
                                  fontSize: "0.95rem",
                                  color: "text.primary",
                                  p: 1.5,
                                  bgcolor: "#fff",
                                  border: "1px dashed",
                                  borderColor: "grey.300",
                                  borderRadius: 1,
                                }}
                              >
                                <HtmlContentRenderer
                                  htmlContent={answer.explaination}
                                />
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
          </Box>

          <Drawer
            anchor="right"
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: { xs: "85vw", sm: 400 },
                p: 3,
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
                display: "flex",
                flexDirection: "column",
              },
            }}
          >
            {/* Drawer Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  Bảng điều hướng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng cộng: {processedQuestions.length} câu
                </Typography>
              </Box>
              <IconButton
                onClick={() => setIsDrawerOpen(false)}
                color="inherit"
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Chú thích & Bộ lọc */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
              <Chip
                label={`Tất cả (${processedQuestions.length})`}
                variant={filter === "all" ? "filled" : "outlined"}
                color="primary"
                onClick={() => setFilter("all")}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={`Đúng (${correctQuestions.length})`}
                variant={filter === "correct" ? "filled" : "outlined"}
                color="success"
                onClick={() => setFilter("correct")}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={`Sai (${wrongQuestions.length})`}
                variant={filter === "wrong" ? "filled" : "outlined"}
                color="error"
                onClick={() => setFilter("wrong")}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={`Bỏ qua (${missedQuestions.length})`}
                variant={filter === "missed" ? "filled" : "outlined"}
                color="warning"
                onClick={() => setFilter("missed")}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box
              sx={{
                overflowY: "auto",
                flexGrow: 1,
                pr: 1,
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#e0e0e0",
                  borderRadius: "4px",
                },
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 1,
                }}
              >
                {processedQuestions.map((q, index) => {
                  let btnColor = "grey.100";
                  let btnTextColor = "text.primary";
                  let borderColor = "grey.300";

                  if (q.isQuestionCorrect) {
                    btnColor = "success.50";
                    btnTextColor = "success.dark";
                    borderColor = "success.main";
                  } else if (q.isQuestionWrong) {
                    btnColor = "error.50";
                    btnTextColor = "error.main";
                    borderColor = "error.main";
                  } else if (q.isMissed) {
                    btnColor = "warning.50";
                    btnTextColor = "warning.dark";
                    borderColor = "warning.main";
                  }

                  return (
                    <Button
                      key={`nav-${index}`}
                      onClick={() => scrollToQuestion(index)}
                      sx={{
                        minWidth: 0,
                        height: 40,
                        p: 0,
                        fontWeight: 700,
                        fontSize: "1rem",
                        borderRadius: 1.5,
                        bgcolor: btnColor,
                        color: btnTextColor,
                        border: "3px solid",
                        borderColor: borderColor,
                        "&:hover": { opacity: 0.8, bgcolor: btnColor },
                      }}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          </Drawer>
        </>
      ) : (
        // Giao diện khi chưa đến hạn được xem đáp án
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            textAlign: "center",
            bgcolor: "warning.50",
            border: "1px dashed",
            borderColor: "warning.main",
          }}
        >
          <Typography variant="h5" color="warning.dark" fontWeight={700} mb={1}>
            Chi tiết đáp án...
          </Typography>
          <Typography variant="body1" color="warning.dark" fontWeight={500}>
            Toàn bộ câu hỏi và đáp án chi tiết sẽ được công bố sau khi hết hạn
            nộp bài. Bạn chú ý theo dõi nhé!
          </Typography>
        </Paper>
      )}
    </Container>
  );
}