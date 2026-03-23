import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Button, Divider } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ClassIcon from '@mui/icons-material/Class';
import UpdateIcon from '@mui/icons-material/Update';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function AssignmentCard({ session, status, onStart, onContinue, onView, isGlobal }) {
  const { exam, expireAt, startAt, limit_taken, pending_et_id, examTakens } = session;

  const classNames = session.exam_open_in && session.exam_open_in.length > 0
    ? session.exam_open_in.map(item => item.classname).join(', ')
    : 'Chưa xếp lớp';

  const attempts = examTakens ? examTakens.length : 0;
  const completedAttempts = examTakens ? examTakens.filter(et => et.isDone) : [];
  const highestScore = completedAttempts.length > 0 
    ? Math.max(...completedAttempts.map(et => et.final_score)) 
    : null;

  const statusConfig = {
    upcoming: { color: 'info', label: 'Sắp mở', bg: '#e3f2fd' },
    todo: pending_et_id ? { color: 'warning', label: 'Đang làm dở', bg: '#fff8e1' } : { color: 'primary', label: 'Cần làm', bg: '#e3f2fd' },
    overdue: { color: 'error', label: 'Quá hạn', bg: '#ffebee' },
    // Nếu tab completed mà có pending -> Hiện mác Đang làm dở
    completed: pending_et_id 
      ? { color: 'secondary', label: `Đang làm lại`, bg: '#f3e5f5' } 
      : { color: 'success', label: 'Hoàn thành', bg: '#e8f5e9' }
  };

  const currentStatus = statusConfig[status];

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getCountdownText = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    if (diff <= 0) return "";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    
    if (days > 0) return `(Còn ${days} ngày ${hours} giờ)`;
    if (hours > 0) return `(Còn ${hours} giờ ${mins} phút)`;
    return `(Còn ${mins} phút)`;
  };

  const getOverdueText = (dateStr) => {
    const diff = new Date() - new Date(dateStr); 
    if (diff <= 0) return ""; 

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    
    let text = "Quá hạn: ";
    if (days > 0) text += `${days} ngày `;
    if (hours > 0) text += `${hours} giờ `;
    if (mins > 0 || (days === 0 && hours === 0)) text += `${mins} phút`;
    
    return `(${text.trim()})`;
  };
  
  const isOverdueReal = new Date() > new Date(expireAt);
  const maxPossible = exam.total_score || exam.total_ques || 1;
  const displayScore = highestScore !== null 
    ? Number(highestScore).toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1')
    : null;

  // Xét điều kiện ghi màu cho điểm (xanh lá nếu >= 5) 
  const isPassed = highestScore !== null && highestScore >= 5;

  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 3, 
        position: 'relative',
        borderRadius: 3,
        border: '1px solid', 
        borderColor: `${currentStatus.color}.main`, 
        backgroundColor: '#ffffff',
        overflow: 'hidden', 
        transition: 'all 0.3s ease', 
        
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: '6px',
          backgroundColor: `${currentStatus.color}.main`,
          opacity: 0, 
          transition: 'opacity 0.2s ease-in-out',
        },

        '&:hover, &:focus-within, &:active': { 
          boxShadow: '0 8px 24px rgba(149, 157, 165, 0.15)',
          transform: 'translateY(-2px)',
          '&::before': { opacity: 1 }
        } 
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
            {exam.title}
          </Typography>
          <Chip 
            label={currentStatus.label} color={currentStatus.color} size="small"
            sx={{ fontWeight: 600, borderRadius: 1.5, minWidth: 'max-content' }} 
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          {isGlobal && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', bgcolor: 'primary.50', px: 0, py: 0.5, borderRadius: 2 }}>
              <ClassIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" fontWeight={600}>Lớp học: {classNames}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <MenuBookIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">{exam.category?.subject || 'Môn học: Toán'}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={9}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '45%' }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">Thời gian: <strong>{exam.duration}</strong> phút</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '45%' }}>
                <QuestionMarkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">Số câu hỏi: <strong>{exam.total_ques}</strong> câu</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '45%' }}>
                <FactCheckIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">Số lượt làm bài: <strong>{attempts}/{limit_taken}</strong></Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '45%' }}>
                <AssessmentIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">Cách chấm: <strong>{limit_taken >= 1 ? "Lần cao nhất" : "1 Lần"}</strong></Typography>
              </Box>
            </Box>
          </Grid>

          {/* Cột phải: Hạn nộp & Kết quả */}
          <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', borderLeft: { xs: 'none', sm: '1px solid #eee' }, pl: { xs: 0, sm: 2 }, mt: { xs: 1, sm: 0 } }}>
            {highestScore !== null ? (
              <Box sx={{ textAlign: 'left', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Điểm cao nhất</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', color: isPassed ? 'success.main' : 'error.main' }}>
                  <EmojiEventsIcon sx={{ mr: 0.5, fontSize: 28 }} />
                  <Typography variant="h5" fontWeight={600} sx={{ lineHeight: 1 }}>
                    {displayScore}
                  </Typography>
                  <Typography variant="h5" fontWeight={600} sx={{ ml: 0.5, lineHeight: 1 }}>
                    / 10
                  </Typography>
                </Box>
              </Box>    
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                {status === 'upcoming' ? (
                  <UpdateIcon sx={{ mr: 1, color: 'info.main', mt: 0.5 }} />
                ) : (
                  <EventBusyIcon sx={{ mr: 1, color: status === 'overdue' ? 'error.main' : 'text.secondary', mt: 0.5 }} />
                )}
  
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {status === 'upcoming' ? 'Thời điểm mở bài' : 'Hạn chót nộp bài'}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color={status === 'overdue' ? 'error.main' : 'text.primary'}>
                    {formatShortDate(status === 'upcoming' ? startAt : expireAt)}
                  </Typography>
                  {status === 'upcoming' && (
                    <Typography variant="caption" fontWeight={700} color="info.main" display="block" sx={{ mt: 0.5 }}>
                      {getCountdownText(startAt)}
                    </Typography>
                  )}
                  {status === 'overdue' && (
                    <Typography variant="caption" fontWeight={700} color="error.main" display="block" sx={{ mt: 0.5 }}>
                      {getOverdueText(expireAt)}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: '1px solid #f0f0f0' }}>
          {status === 'upcoming' && <Button variant="contained" disabled disableElevation sx={{ borderRadius: 2 }}>Chưa đến giờ mở</Button>}
          
          {(status === 'todo' || status === 'completed') && !pending_et_id && attempts < limit_taken && (
             <Button variant="contained" color="primary" onClick={() => onStart(session)} disableElevation sx={{ borderRadius: 2, px: 3 }}>
               {attempts === 0 ? "Bắt đầu làm bài" : "Làm lại bài"}
             </Button>
          )}

          {/* Nút Tiếp tục làm bài */}
          {pending_et_id && (
            <Button 
              variant="contained" 
              color={status === 'completed' ? 'secondary' : 'warning'} 
              onClick={() => onContinue(pending_et_id)} 
              disableElevation 
              sx={{ borderRadius: 2, px: 3 }}
            >
              {status === 'completed' ? `Tiếp tục lần làm lại thứ ${attempts}` : 'Tiếp tục làm bài'}
            </Button>
          )}

          {status === 'overdue' && <Button variant="contained" color="error" disabled disableElevation sx={{ borderRadius: 2 }}>Đã quá hạn</Button>}
          
          {highestScore !== null && (
            <Button variant="outlined" color="secondary" onClick={() => onView(session)} sx={{ borderRadius: 2, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
              Xem kết quả
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}