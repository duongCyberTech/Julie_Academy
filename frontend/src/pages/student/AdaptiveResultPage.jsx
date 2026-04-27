import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, CircularProgress, Paper, Button, Chip, Grid, 
  Divider, Stack, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { submitAdaptiveExam } from '../../services/ExamService';
import QuestionContentRenderer from '../../components/QuestionContentRenderer';

// --- Styled Components (Đã tích hợp đúng mẫu của bạn) ---
const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
  };
});

const HeaderBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  flexShrink: 0,
}));

const SummaryCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: '24px',
  marginBottom: theme.spacing(5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  boxShadow: '0 12px 32px rgba(0,0,0,0.02)',
}));

const ScoreCircle = styled(Box)(({ theme, score }) => ({
  width: 160,
  height: 160,
  borderRadius: '50%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: `conic-gradient(${theme.palette.primary.main} ${(score / 10) * 100}%, ${alpha(theme.palette.primary.main, 0.08)} ${(score / 10) * 100}% 100%)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    backgroundColor: theme.palette.background.paper,
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.03)',
  }
}));

const StatBox = styled(Box)(({ theme, colorType }) => ({
  padding: theme.spacing(2.5),
  borderRadius: '16px',
  backgroundColor: alpha(theme.palette[colorType].main, 0.05),
  border: `1px solid ${alpha(theme.palette[colorType].main, 0.12)}`,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
}));

export default function StudentAdaptiveResultPage() {
  const { etId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await submitAdaptiveExam(etId);
        const actualData = res?.data?.data || res?.data || res;
        setData(actualData);
      } catch (error) {
        console.error("Lỗi tải kết quả:", error);
      } finally {
        setLoading(false);
      }
    };
    if (etId) fetchResult();
  }, [etId]);

  const formatTime = (start, end) => {
    if (!start || !end) return "0p 0s";
    const diff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000);
    if (isNaN(diff) || diff < 0) return "0p 0s";
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m} phút ${s} giây`;
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress size={50} thickness={4} />
    </Box>
  );

  if (!data) return null;

  const listQuestions = data.questions || [];
  const maxQues = listQuestions.length > 0 ? listQuestions.length : 8; 
  const correctCount = data.total_ques_completed !== undefined ? data.total_ques_completed : (listQuestions.filter(q => q.isCorrect === true).length || 0);
  const scoreValue = parseFloat(data.final_score || 0);


  return (
    <PageWrapper>
      <HeaderBar>
        <Button
          onClick={() => navigate("/student/adaptive")}
          startIcon={<ArrowBackIcon />}
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            textTransform: "none",
            fontSize: "0.95rem",
          }}
        >
          Trở về trang luyện tập
        </Button>
      </HeaderBar>

      {/* PHẦN 1: TỔNG KẾT ĐIỂM SỐ */}
      <SummaryCard elevation={0}>
        <Grid container spacing={4} alignItems="center" justifyContent="center">

          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRight: { md: `1px dashed ${alpha("#000", 0.1)}` },
            }}
          >
            <ScoreCircle score={scoreValue}>
              <Box
                sx={{ position: "relative", zIndex: 1, textAlign: "center" }}
              >
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {scoreValue.toFixed(2)}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Điểm hệ 10
                </Typography>
              </Box>
            </ScoreCircle>

            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ mt: 3 }}
              gutterBottom
              align="center"
            >
              {data.category?.category_name || "Bài luyện tập thích ứng"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              align="center"
            >
              {scoreValue >= 8
                ? "Hoàn thành xuất sắc!"
                : scoreValue >= 5
                  ? "Hoàn thành khá tốt!"
                  : "Cần cố gắng luyện tập thêm!"}
            </Typography>
          </Grid>

          {/* Cột phải: Thống kê chi tiết */}
          <Grid item xs={12} md={7}>
            <Grid
              container
              spacing={3}
              justifyContent="center"
              sx={{ px: { xs: 0, md: 2 } }}
            >
              <Grid item xs={12} sm={4}>
                <StatBox colorType="success">
                  <EmojiEventsIcon
                    color="success"
                    sx={{ fontSize: 32, mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="success.main"
                  >
                    {correctCount}/{maxQues}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Số câu đúng
                  </Typography>
                </StatBox>
              </Grid>

              <Grid item xs={12} sm={4}>
                <StatBox colorType="primary">
                  <HelpOutlineIcon
                    color="primary"
                    sx={{ fontSize: 32, mb: 1 }}
                  />
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {maxQues}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Tổng số câu
                  </Typography>
                </StatBox>
              </Grid>

              <Grid item xs={12} sm={4}>
                <StatBox colorType="info">
                  <AccessTimeIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h6" fontWeight={700} color="info.main">
                    {formatTime(data.startAt, data.doneAt)}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Thời gian làm bài
                  </Typography>
                </StatBox>
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<ReplayIcon />}
                onClick={() => navigate("/student/adaptive")}
                sx={{
                  borderRadius: "12px",
                  fontWeight: 600,
                  px: 4,
                  py: 1.2,
                  textTransform: "none",
                  fontSize: "1rem",
                  boxShadow: "none",
                }}
              >
                Luyện tập lại chủ đề này
              </Button>
            </Box>
          </Grid>
        </Grid>
      </SummaryCard>

      {/* PHẦN 2: CHI TIẾT BÀI LÀM  */}
      <Box sx={{ mb: 3, pl: 1 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <HelpOutlineIcon color="primary" /> Chi tiết từng câu hỏi
        </Typography>
      </Box>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}
      >
        {listQuestions.map((item, idx) => (
          <Accordion
            key={idx}
            disableGutters
            sx={{
              borderRadius: "16px !important",
              "&:before": { display: "none" },
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              boxShadow: "none",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: alpha("#000", 0.015), px: 3 }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ width: "100%" }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    flexShrink: 0,
                    bgcolor: item.isCorrect
                      ? alpha("#4caf50", 0.15)
                      : alpha("#f44336", 0.15),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.isCorrect ? (
                    <CheckCircleIcon sx={{ fontSize: 20, color: "#4caf50" }} />
                  ) : (
                    <CancelIcon sx={{ fontSize: 20, color: "#f44336" }} />
                  )}
                </Box>
                <Typography fontWeight={600}>Câu {idx + 1}</Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Chip
                  label={item.question?.level?.toUpperCase() || "NORMAL"}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                />
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 4, pt: 2 }}>
              <Box sx={{ mb: 4, "& *": { fontSize: "1.05rem" } }}>
                <QuestionContentRenderer htmlContent={item.question?.content} />
              </Box>

              {item.question?.answers?.map((ans, aIdx) => {
                const isUserChosen = (item.answer_set || [])
                  .map((id) => String(id))
                  .includes(String(ans.aid));
                const isCorrect = ans.is_correct;
                const isQuestionCorrect = item.isCorrect === true;

                let borderColor = alpha("#000", 0.15);
                let bgColor = "transparent";
                let labelText = null;
                let labelColor = "";

                if (isUserChosen && isCorrect) {
                  borderColor = "#4caf50";
                  bgColor = alpha("#4caf50", 0.08);
                  labelText = "Bạn chọn đúng";
                  labelColor = "#4caf50";
                } else if (isUserChosen && !isCorrect) {
                  borderColor = "#f44336";
                  bgColor = alpha("#f44336", 0.05);
                  labelText = "Bạn chọn sai";
                  labelColor = "#f44336";
                } else if (!isUserChosen && isCorrect && isQuestionCorrect) {
                  borderColor = "#4caf50";
                  bgColor = alpha("#4caf50", 0.05);
                  labelText = "Đáp án đúng";
                  labelColor = "#4caf50";
                }

                return (
                  <Grid item xs={12} key={aIdx}>
                    <Box
                      sx={{
                        position: "relative",
                        mb: 0.5,
                        mt: labelText ? 1.5 : 0,
                      }}
                    >
                      {/* Box chứa chữ đáp án */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          p: 1.5,
                          borderRadius: "10px",
                          border: "2px solid",
                          borderColor,
                          backgroundColor: bgColor,
                        }}
                      >
                        <Typography
                          fontWeight={700}
                          sx={{ mr: 1.5, color: "text.primary" }}
                        >
                          {String.fromCharCode(65 + aIdx)}.
                        </Typography>
                        <Box sx={{ flexGrow: 1, "& p": { m: 0 } }}>
                          <QuestionContentRenderer htmlContent={ans.content} />
                        </Box>
                      </Box>

                      {/* Label nổi góc trên bên phải */}
                      {labelText && (
                        <Typography
                          variant="caption"
                          sx={{
                            position: "absolute",
                            top: -10,
                            right: 12,
                            backgroundColor: "background.paper",
                            px: 1,
                            borderRadius: "4px",
                            color: labelColor,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        >
                          {labelText}
                        </Typography>
                      )}

                      {isUserChosen && ans.explaination && (
                        <Box
                          sx={{
                            mt: 1,
                            ml: 4,
                            p: 1.5,
                            borderRadius: "8px",
                            backgroundColor: alpha("#000", 0.03),
                            borderLeft: `3px solid ${labelColor}`,
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            textTransform="uppercase"
                            color="text.secondary"
                            display="block"
                            mb={0.5}
                          >
                            Phân tích lựa chọn của bạn
                          </Typography>
                          <Box sx={{ fontSize: "0.9rem" }}>
                            <QuestionContentRenderer
                              htmlContent={ans.explaination}
                            />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                );
              })}

              {item.question?.explaination && (
                <Box
                  sx={{
                    mt: 4,
                    p: 3,
                    bgcolor: alpha("#2196f3", 0.05),
                    borderRadius: "16px",
                    border: "1px dashed",
                    borderColor: alpha("#2196f3", 0.3),
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    💡 Giải thích chi tiết:
                  </Typography>
                  <Box sx={{ mt: 1, color: "text.primary" }}>
                    <QuestionContentRenderer
                      htmlContent={item.question.explaination}
                    />
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </PageWrapper>
  );
}