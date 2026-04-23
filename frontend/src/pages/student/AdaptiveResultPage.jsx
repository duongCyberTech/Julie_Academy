import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, CircularProgress, Paper, Button, Chip, Accordion, 
  AccordionSummary, AccordionDetails, Grid, useTheme, Divider, Stack
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ReplayIcon from '@mui/icons-material/Replay';

import { apiClient } from '../../services/ApiClient';
import QuestionContentRenderer from '../../components/QuestionContentRenderer';

// =========================================
// STYLED COMPONENTS
// =========================================
const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#ffffff',
    borderRadius: '24px',
    border: `1px solid ${isDark ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
    minHeight: '80vh',
  };
});

const ScoreCircle = styled(Box)(({ theme, score }) => ({
  width: 150,
  height: 150,
  borderRadius: '50%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  border: `8px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -8, left: -8, right: -8, bottom: -8,
    borderRadius: '50%',
    border: `8px solid ${theme.palette.primary.main}`,
    clipPath: `inset(0 0 ${100 - score * 10}% 0)`, // Giả lập progress vòng tròn
    transform: 'rotate(0deg)',
  }
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  backgroundColor: alpha(theme.palette.action.hover, 0.3),
  textAlign: 'center',
  boxShadow: 'none',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

// =========================================
// MAIN COMPONENT
// =========================================
export default function StudentAdaptiveResultPage() {
  const { etId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        // Gọi API lấy chi tiết lần thi (Bao gồm các câu hỏi đã làm)
        const res = await apiClient.post(`/exam/adaptive/submit/${etId}`);
        setResultData(res.data?.data || res.data);
      } catch (error) {
        console.error("Lỗi khi tải kết quả:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [etId]);

  if (loading) {
    return (
      <PageWrapper sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={48} />
      </PageWrapper>
    );
  }

  if (!resultData) return null;

  const { final_score, total_ques_completed, question_for_exam_taken, category } = resultData;
  const scoreValue = parseFloat(final_score || 0);
  const correctCount = question_for_exam_taken?.filter(q => q.isCorrect).length || 0;

  return (
    <PageWrapper>
      {/* HEADER */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button 
          onClick={() => navigate('/student/adaptive')}
          startIcon={<ArrowBackIcon />}
          sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'none' }}
        >
          Quay lại danh mục
        </Button>
      </Box>

      {/* SUMMARY SECTION */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <ScoreCircle score={scoreValue}>
              <Typography variant="h3" fontWeight={900} color="primary.main">
                {scoreValue}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>
                ĐIỂM SỐ
              </Typography>
            </ScoreCircle>
            <Typography variant="h6" fontWeight={800} mt={2}>
              {scoreValue >= 8 ? "Xuất sắc!" : scoreValue >= 5 ? "Tốt lắm!" : "Cần cố gắng thêm"}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight={800} mb={3}>
            Kết quả luyện tập: {category?.category_name}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <StatCard>
                <EmojiEventsIcon color="warning" sx={{ mb: 1 }} />
                <Typography variant="h6" fontWeight={800}>{correctCount}/{total_ques_completed}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>CÂU ĐÚNG</Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4}>
              <StatCard>
                <HelpOutlineIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" fontWeight={800}>{total_ques_completed}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>TỔNG SỐ CÂU</Typography>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard>
                <AccessTimeIcon color="info" sx={{ mb: 1 }} />
                <Typography variant="h6" fontWeight={800}>
                   {/* Logic hiển thị thời gian làm bài từ startAt - doneAt */}
                   {resultData.doneAt ? 
                    Math.floor((new Date(resultData.doneAt) - new Date(resultData.startAt)) / 60000) : 0} phút
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>THỜI GIAN</Typography>
              </StatCard>
            </Grid>
          </Grid>
          
          <Stack direction="row" spacing={2} mt={4}>
            <Button 
              variant="contained" 
              startIcon={<ReplayIcon />}
              onClick={() => navigate(`/student/adaptive/take/${category?.category_id}`)}
              sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 3 }}
            >
              Luyện tập lại
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* DETAILED REVIEW SECTION */}
      <Typography variant="h6" fontWeight={800} mb={3}>
        Xem lại chi tiết
      </Typography>

      <Box sx={{ maxWidth: 900 }}>
        {question_for_exam_taken?.sort((a, b) => a.index - b.index).map((item, idx) => (
          <Accordion 
            key={item.ques_id}
            elevation={0}
            sx={{ 
              mb: 2, 
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              borderRadius: '12px !important',
              '&:before': { display: 'none' },
              overflow: 'hidden'
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{ 
                  width: 32, height: 32, borderRadius: '50%', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  bgcolor: item.isCorrect ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                  color: item.isCorrect ? 'success.main' : 'error.main',
                  flexShrink: 0, fontWeight: 800
                }}>
                  {item.isCorrect ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                </Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ flexGrow: 1 }}>
                  Câu {item.index}: {item.question?.title || "Câu hỏi luyện tập"}
                </Typography>
                <Chip 
                  label={item.question?.level?.toUpperCase()} 
                  size="small" 
                  variant="outlined" 
                  sx={{ fontWeight: 800, borderRadius: '6px' }} 
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 4, pb: 4, pt: 0 }}>
              <Box sx={{ mb: 3, '& > div': { maxHeight: 'none !important' } }}>
                <QuestionContentRenderer htmlContent={item.question?.content} />
              </Box>

              <Typography variant="caption" fontWeight={800} color="text.secondary" textTransform="uppercase">
                Đáp án của bạn
              </Typography>
              <Box sx={{ mt: 1, mb: 3 }}>
                {item.question?.answers?.map((ans) => {
                  const isSelected = item.answer_set?.includes(ans.aid);
                  const isCorrect = ans.is_correct;

                  if (!isSelected && !isCorrect) return null;

                  return (
                    <Box 
                      key={ans.aid}
                      sx={{ 
                        p: 2, mb: 1, borderRadius: '10px',
                        border: `1px solid ${isCorrect ? theme.palette.success.main : theme.palette.error.main}`,
                        bgcolor: isCorrect ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.error.main, 0.05),
                        display: 'flex', alignItems: 'center', gap: 2
                      }}
                    >
                      {isCorrect ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                      <Box sx={{ flexGrow: 1, '& > div': { maxHeight: 'none !important' } }}>
                        <QuestionContentRenderer htmlContent={ans.content} />
                      </Box>
                      <Chip 
                        label={isCorrect ? "Đáp án đúng" : "Bạn đã chọn"} 
                        size="small" 
                        color={isCorrect ? "success" : "error"} 
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  );
                })}
              </Box>

              {/* GIẢI THÍCH (HIỆN LUÔN VÌ KHÔNG CÓ EXPIRE DATE) */}
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: '12px', border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}` }}>
                <Typography variant="subtitle2" fontWeight={800} color="info.main" mb={1}>
                   Giải thích chi tiết:
                </Typography>
                <Box sx={{ '& > div': { maxHeight: 'none !important' } }}>
                   <QuestionContentRenderer htmlContent={item.question?.explaination} />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </PageWrapper>
  );
}