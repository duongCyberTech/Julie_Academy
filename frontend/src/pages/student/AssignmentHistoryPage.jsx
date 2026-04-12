import React, { useState, useMemo, useCallback, memo } from 'react';
import { 
  Typography, Box, Paper, Button, Chip, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  useTheme, Grid
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import ReviewRestrictedDialog from '../../components/ReviewRestrictedDialog';

// ==========================================
// STYLED COMPONENTS 
// ==========================================
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

const StatBox = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2.5),
    borderRadius: '16px',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
    boxShadow: isDark ? 'none' : `0 4px 12px ${alpha(theme.palette.primary.main, 0.03)}`,
    height: '100%'
  };
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.text.secondary,
  fontSize: '0.95rem',
  padding: theme.spacing(2),
  borderBottom: `2px solid ${theme.palette.divider}`,
}));

// ==========================================
// MAIN COMPONENT
// ==========================================
const StudentAssignmentHistoryPage = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [restrictionDialogOpen, setRestrictionDialogOpen] = useState(false);
  const [selectedAttemptScore, setSelectedAttemptScore] = useState(null);
  
  const sessionData = location.state?.sessionData;

  const completedAttempts = useMemo(() => {
    if (!sessionData?.examTakens) return [];
    return sessionData.examTakens
      .filter(et => et.isDone)
      .sort((a, b) => new Date(a.doneAt).getTime() - new Date(b.doneAt).getTime());
  }, [sessionData]);

  const maxScorePossible = useMemo(() => sessionData?.exam?.total_score || sessionData?.exam?.total_ques || 1, [sessionData]);
  const totalQues = useMemo(() => sessionData?.exam?.total_ques || 0, [sessionData]);

  const highestScore = useMemo(() => {
    return completedAttempts.length > 0 
      ? Math.max(...completedAttempts.map(et => et.final_score)) 
      : null;
  }, [completedAttempts]);
    
  const isOverdueReal = useMemo(() => {
    return sessionData?.expireAt ? new Date() > new Date(sessionData.expireAt) : false;
  }, [sessionData]);

  const handleOpenAttemptDetails = useCallback((attemptId, attemptScore, attemptData) => {
    if (isOverdueReal) {
      navigate(`/student/assignment/result/${attemptId}`, { state: { resultData: attemptData } });
    } else {
      setSelectedAttemptScore(attemptScore); 
      setRestrictionDialogOpen(true); 
    }
  }, [isOverdueReal, navigate]);

  const handleCloseDialog = useCallback(() => {
    setRestrictionDialogOpen(false);
  }, []);

  const formatShortDate = useCallback((dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }, []);

  // Hàm tính khoảng thời gian chính xác dựa trên doneAt trừ đi startAt
  const formatDuration = useCallback((start, end) => {
    if (!start || !end) return '-';
    
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diff = endTime - startTime;

    if (diff <= 0) return '0 giây';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const result = [];
    if (hours > 0) result.push(`${hours} giờ`);
    if (minutes > 0) result.push(`${minutes} phút`);
    if (seconds > 0 || result.length === 0) result.push(`${seconds} giây`);

    return result.join(' '); 
  }, []);

  const formatScore = useCallback((rawScore) => {
    return Number(rawScore).toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1');
  }, []);

  if (!sessionData) {
    return (
      <PageWrapper sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="error" fontWeight={700}>Không tìm thấy dữ liệu lịch sử bài làm.</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          sx={{ mt: 3, fontWeight: 700, borderRadius: 2 }} 
          variant="outlined" 
          onClick={() => navigate('/student/assignment')}
        >
          Quay lại danh sách
        </Button>
      </PageWrapper>
    );
  }

  const highestScoreFormatted = highestScore !== null ? formatScore(highestScore) : '-';
  const isPassed = highestScore !== null && highestScore >= 5.0;

  return (
    <PageWrapper>
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ 
            fontWeight: 700, 
            color: 'text.secondary', 
            mb: 2, 
            borderRadius: '12px',
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }
          }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {sessionData.exam.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Xem lại kết quả các lần bạn đã nộp bài.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatBox sx={{ bgcolor: highestScore !== null ? (isPassed ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.error.main, 0.05)) : 'transparent' }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isPassed ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.error.main, 0.1) }}>
              <EmojiEventsRoundedIcon sx={{ fontSize: 32, color: isPassed ? 'success.main' : 'error.main' }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Điểm cao nhất</Typography>
              <Stack direction="row" alignItems="baseline" spacing={0.5}>
                <Typography variant="h5" fontWeight={700} color={isPassed ? 'success.main' : 'error.main'}>
                  {highestScoreFormatted}
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.secondary">/ 10</Typography>
              </Stack>
            </Box>
          </StatBox>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <StatBox>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <AssignmentTurnedInIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Lượt làm bài</Typography>
              <Stack direction="row" alignItems="baseline" spacing={0.5}>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  {completedAttempts.length}
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.secondary">/ {sessionData.limit_taken}</Typography>
              </Stack>
            </Box>
          </StatBox>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <StatBox sx={{ border: `1px solid ${sessionData.expireAt ? alpha(theme.palette.warning.main, 0.4) : theme.palette.divider}` }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
              {sessionData.expireAt ? <AccessTimeFilledIcon sx={{ fontSize: 32, color: 'warning.main' }} /> : <EventBusyIcon sx={{ fontSize: 32, color: 'text.secondary' }} />}
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Hạn chót</Typography>
              <Typography variant="subtitle1" fontWeight={700} color={sessionData.expireAt ? 'text.primary' : 'text.secondary'}>
                {sessionData.expireAt ? formatShortDate(sessionData.expireAt) : 'Không giới hạn'}
              </Typography>
            </Box>
          </StatBox>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 2 }}>
        Lịch sử các lần nộp ({completedAttempts.length})
      </Typography>

      <TableContainer 
        component={Paper} 
        elevation={0} 
        sx={{ 
          border: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`, 
          borderRadius: '16px', 
          overflow: 'hidden' 
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: isDark ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.primary.main, 0.03) }}>
            <TableRow>
              <StyledTableCell align="center">Lần</StyledTableCell>
              <StyledTableCell align="center">Trạng thái</StyledTableCell>
              <StyledTableCell align="center">Số câu đúng</StyledTableCell>
              <StyledTableCell align="center">Thời gian bắt đầu</StyledTableCell>
              {/* Sửa lại tiêu đề cột để dứt khoát không nhầm lẫn */}
              <StyledTableCell align="center">Thời gian làm thực tế</StyledTableCell>
              <StyledTableCell align="center">Điểm số</StyledTableCell>
              <StyledTableCell align="center">Thao tác</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedAttempts.map((attempt, index) => {
              const score = formatScore(attempt.final_score);
              const isAttemptPassed = parseFloat(score) >= 5.0; 
              
              return (
                <TableRow 
                  key={attempt.et_id} 
                  hover 
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.2s ease',
                    '&:hover': { bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02) },
                  }}
                >
                  <TableCell align="center">
                    <Typography variant="body1" fontWeight={700} color="text.primary">
                      {index + 1}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Chip 
                      icon={<CheckCircleRoundedIcon />} 
                      label="Đã nộp" 
                      color="success" 
                      size="small" 
                      sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', px: 1, borderRadius: '8px' }} 
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="body1" fontWeight={700} color="text.primary">
                      {attempt.total_ques_completed ?? 0} <Typography component="span" variant="caption" color="text.secondary" fontWeight={600}>/ {totalQues}</Typography>
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {formatShortDate(attempt.startAt)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="body2" color="primary.main" fontWeight={700} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), py: 0.5, px: 1.5, borderRadius: '8px', display: 'inline-block' }}>
                      {formatDuration(attempt.startAt, attempt.doneAt)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="h6" fontWeight={700} color={isAttemptPassed ? 'success.main' : 'error.main'}>
                      {score}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Button 
                      variant="contained" 
                      disableElevation
                      endIcon={<PlayArrowRoundedIcon />}
                      onClick={() => handleOpenAttemptDetails(attempt.et_id, attempt.final_score, attempt)}
                      sx={{ 
                        borderRadius: '10px', 
                        fontWeight: 700, 
                        textTransform: 'none', 
                        px: 2, 
                        py: 0.8,
                        bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.08), 
                        color: 'primary.main', 
                        '&:hover': { bgcolor: 'primary.main', color: '#fff' } 
                      }}
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            
            {completedAttempts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    Bạn chưa có lần nộp bài nào được ghi nhận.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ReviewRestrictedDialog 
        open={restrictionDialogOpen} 
        onClose={handleCloseDialog} 
        score={selectedAttemptScore} 
      />
    </PageWrapper>
  );
});

export default StudentAssignmentHistoryPage;