import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, CircularProgress, Paper, Button, Chip, Accordion, 
  AccordionSummary, AccordionDetails, Grid, useTheme, Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';

import { apiClient } from '../../services/ApiClient';
import QuestionContentRenderer from '../../components/QuestionContentRenderer';

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#ffffff',
    borderRadius: '16px',
    border: `1px solid ${isDark ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.5)}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
    minHeight: '80vh',
  };
});

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  backgroundColor: alpha(theme.palette.action.hover, 0.3),
  textAlign: 'center',
  boxShadow: 'none',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const UserChoiceBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCorrect'
})(({ theme, isCorrect }) => ({
  padding: theme.spacing(2),
  borderRadius: '10px',
  border: `1px solid ${isCorrect ? theme.palette.success.main : theme.palette.error.main}`,
  backgroundColor: isCorrect ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.error.main, 0.05),
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginTop: theme.spacing(1)
}));

const SpecificExplanationBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginLeft: theme.spacing(5.5),
  padding: theme.spacing(2),
  borderRadius: '10px',
  backgroundColor: alpha(theme.palette.primary.main, 0.03),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
}));

export default function StudentAdaptiveResultPage() {
  const { etId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);

        const res = await apiClient.get(`/exam_taken/${etId}`);
        setResultData(res.data?.data || res.data);
      } catch (error) {
        console.error("Lỗi khi tải kết quả:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [etId]);

  if (loading || !resultData) {
    return (
      <PageWrapper sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={40} thickness={4} />
      </PageWrapper>
    );
  }

  const { final_score, total_ques_completed, question_for_exam_taken, category, startAt, doneAt } = resultData;
  const correctCount = question_for_exam_taken?.filter(q => q.isCorrect).length || 0;
  const duration = doneAt ? Math.floor((new Date(doneAt) - new Date(startAt)) / 60000) : 0;

  return (
    <PageWrapper>
      <Box sx={{ mb: 4 }}>
        <Button 
          onClick={() => navigate('/student/adaptive')}
          startIcon={<ArrowBackIcon />}
          sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'none' }}
        >
          Quay lại danh mục
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
            <Typography variant="h4" fontWeight={900} color="primary.main">{final_score}</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1 }}>ĐIỂM SỐ ĐẠT ĐƯỢC</Typography>
            <Typography variant="h6" fontWeight={800} mt={1}>
              {parseFloat(final_score) >= 8 ? "Rất xuất sắc!" : "Tiếp tục cố gắng nhé!"}
            </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <StatCard>
                <EmojiEventsIcon color="warning" sx={{ mb: 0.5 }} />
                <Typography variant="h6" fontWeight={800}>{correctCount}/{total_ques_completed}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>CÂU ĐÚNG</Typography>
              </StatCard>
            </Grid>
            <Grid item xs={4}>
              <StatCard>
                <AccessTimeIcon color="info" sx={{ mb: 0.5 }} />
                <Typography variant="h6" fontWeight={800}>{duration} Phút</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>THỜI GIAN</Typography>
              </StatCard>
            </Grid>
            <Grid item xs={4}>
              <StatCard>
                <HelpOutlineIcon color="primary" sx={{ mb: 0.5 }} />
                <Typography variant="h6" fontWeight={800}>{total_ques_completed}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>TỔNG CÂU</Typography>
              </StatCard>
            </Grid>
          </Grid>
          <Button 
            variant="contained" startIcon={<ReplayIcon />}
            onClick={() => navigate(`/student/adaptive/take/${category?.category_id}`)}
            sx={{ mt: 3, borderRadius: '8px', fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
          >
            Luyện tập lại chủ đề này
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h6" fontWeight={800} mb={3}>Xem lại quá trình làm bài</Typography>

      <Box sx={{ maxWidth: '100%' }}>
        {question_for_exam_taken?.sort((a, b) => a.index - b.index).map((item) => {
          const userChoiceId = item.answer_set?.[0];
          const userSelectedAnswer = item.question?.answers?.find(a => a.aid === userChoiceId);

          return (
            <Accordion 
              key={item.ques_id}
              elevation={0}
              sx={{ 
                mb: 2, border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                borderRadius: '12px !important', '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ 
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    bgcolor: item.isCorrect ? 'success.main' : 'error.main', color: '#fff', flexShrink: 0 
                  }}>
                    {item.isCorrect ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : <CancelIcon sx={{ fontSize: 18 }} />}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ flexGrow: 1 }}>
                    Câu {item.index}: {item.question?.level?.toUpperCase()}
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 4, pb: 4, pt: 0 }}>
                <Box sx={{ mb: 3, '& > div': { maxHeight: 'none !important' } }}>
                  <QuestionContentRenderer htmlContent={item.question?.content} />
                </Box>

                <Typography variant="caption" fontWeight={800} color="text.secondary" textTransform="uppercase">
                  Lựa chọn của bạn
                </Typography>
                
                {userSelectedAnswer ? (
                  <>
                    <UserChoiceBox isCorrect={item.isCorrect}>
                      <Box sx={{ 
                        width: 24, height: 24, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        bgcolor: item.isCorrect ? 'success.main' : 'error.main', color: '#fff', fontWeight: 800, flexShrink: 0, fontSize: '0.75rem'
                      }}>
                        {item.isCorrect ? "✓" : "✕"}
                      </Box>
                      <Box sx={{ flexGrow: 1, '& > div': { maxHeight: 'none !important' }, pt: 0.2 }}>
                        <QuestionContentRenderer htmlContent={userSelectedAnswer.content} />
                      </Box>
                    </UserChoiceBox>

                    {Boolean(userSelectedAnswer.explaination) && (
                      <SpecificExplanationBox>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'primary.main' }}>
                          <SubdirectoryArrowRightIcon fontSize="small" />
                          <Typography variant="caption" fontWeight={800} textTransform="uppercase">Phân tích lựa chọn</Typography>
                        </Box>
                        <Box sx={{ '& > div': { maxHeight: 'none !important', fontSize: '0.92rem', color: 'text.primary' } }}>
                          <QuestionContentRenderer htmlContent={userSelectedAnswer.explaination} />
                        </Box>
                      </SpecificExplanationBox>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Bạn chưa chọn đáp án cho câu này.</Typography>
                )}

                {Boolean(item.question?.explaination) && (
                  <Accordion elevation={0} sx={{ mt: 3, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`, borderRadius: '8px !important' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'info.main' }}>
                        <LightbulbOutlinedIcon fontSize="small" />
                        <Typography variant="subtitle2" fontWeight={700}>Xem giải thích tổng quát</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Box sx={{ '& > div': { maxHeight: 'none !important', fontSize: '0.92rem' } }}>
                        <QuestionContentRenderer htmlContent={item.question?.explaination} />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </PageWrapper>
  );
}