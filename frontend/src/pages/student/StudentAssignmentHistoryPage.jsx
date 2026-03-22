import React from 'react';
import { 
  Container, Typography, Box, Paper, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow 
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function StudentAssignmentHistoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy dữ liệu bài tập được truyền từ trang trước sang
  const sessionData = location.state?.sessionData;

  if (!sessionData) {
    return (
      <Container sx={{ pt: 5, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Không tìm thấy dữ liệu lịch sử.</Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/student/assignment')}>Quay lại</Button>
      </Container>
    );
  }

  // Lọc ra các lần đã nộp bài
  const completedAttempts = sessionData.examTakens?.filter(et => et.isDone) || [];
  completedAttempts.sort((a, b) => new Date(a.doneAt) - new Date(b.doneAt));

  const maxScorePossible = sessionData.exam.total_score || sessionData.exam.total_ques || 1;
  const totalQues = sessionData.exam.total_ques || 0;

  // --- CÁC HÀM FORMAT THỜI GIAN VÀ ĐIỂM ---
  const formatShortDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return '-';
    const diff = new Date(end) - new Date(start);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes === 0) return `${seconds} giây`;
    return `${minutes} phút ${seconds} giây`;
  };

  const formatScore = (rawScore, maxPossible) => {
    return Number(rawScore).toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1');
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 8, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ fontWeight: 700, color: 'text.secondary' }}
        >
          Quay lại danh sách
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'grey.200' }}>
        <Typography variant="h5" fontWeight={800} color="text.primary" mb={1}>
          Lịch sử làm bài: {sessionData.exam.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Tổng số lần đã nộp: <strong>{completedAttempts.length}</strong> / {sessionData.limit_taken} lần
        </Typography>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', mt: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f4f6f8', borderBottom: '2px solid #e0e0e0' }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#454f5b', fontSize: '0.85rem', py: 2 }}>Lần thi</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#454f5b', textTransform: 'uppercase', fontSize: '0.85rem', py: 2 }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#454f5b', textTransform: 'uppercase', fontSize: '0.85rem', py: 2 }}>Số câu đúng</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#454f5b', textTransform: 'uppercase', fontSize: '0.85rem', py: 2 }}>Bắt đầu lúc</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#454f5b', textTransform: 'uppercase', fontSize: '0.85rem', py: 2 }}>Kết thúc lúc</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#454f5b', textTransform: 'uppercase', fontSize: '0.85rem', py: 2 }}>Thời gian làm</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#454f5b', textTransform: 'uppercase', fontSize: '0.85rem', py: 2 }}>Điểm số</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: '#454f5b', textTransform: 'uppercase', fontSize: '0.85rem', py: 2 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedAttempts.map((attempt, index) => {
                const score = formatScore(attempt.final_score, maxScorePossible);
                const isPassed = parseFloat(score) >= 5.0; // Điểm qua môn
                
                return (
                  <TableRow 
                    key={attempt.et_id} 
                    hover 
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s ease',
                      '&:hover': { bgcolor: 'primary.50' },
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight={700} color="primary.main">{index + 1}</Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip label="Đã nộp bài" color="success" size="small" sx={{ fontWeight: 600, bgcolor: 'success.50', color: 'success.dark', px: 1, borderRadius: 2 }} />
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body1" fontWeight={700} color="text.primary">
                        {attempt.total_ques_completed ?? 0} <Typography component="span" variant="caption" color="text.secondary" fontWeight={600}>/ {totalQues}</Typography>
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {formatShortDate(attempt.startAt)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {formatShortDate(attempt.doneAt)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontStyle: 'italic' }}>
                        {formatDuration(attempt.startAt, attempt.doneAt)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="h6" fontWeight={800} color={isPassed ? 'success.main' : 'error.main'}>
                        {score}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Button 
                        variant="contained" size="small" disableElevation
                        onClick={() => navigate(`/student/assignment/result/${attempt.et_id}`)}
                        sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 2, py: 0.5, bgcolor: '#e3f2fd', color: 'primary.main', '&:hover': { bgcolor: 'primary.main', color: '#fff' } }}
                      >
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}