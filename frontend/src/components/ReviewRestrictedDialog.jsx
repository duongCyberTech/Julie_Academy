import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button } from '@mui/material';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function ReviewRestrictedDialog({ open, onClose, score }) {
  
  const displayScore = score !== null 
    ? Number(score).toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1') 
    : '-';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
      sx={{ 
        '& .MuiDialog-paper': { borderRadius: 3 },
        '& .MuiDialogTitle-root': { p: 3, pb: 1 },
        '& .MuiDialogContent-root': { p: { xs: 3, sm: 4 }, textAlign: 'center' },
        '& .MuiDialogActions-root': { p: 3, pt: 1, justifyContent: 'center' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
        <FactCheckIcon color="warning" sx={{ mr: 1.5, fontSize: 32 }} />
        Chi tiết đáp án chưa mở
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.100' }}>
          <EmojiEventsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body2" color="primary.main">Điểm số lần này</Typography>
          <Typography variant="h4" fontWeight={600} color="primary.main">
            {displayScore}/10
          </Typography>
        </Box>
        
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Hệ thống sẽ cho phép bạn xem chi tiết đáp án chỉ sau khi đã hết hạn nộp bài thôi nhé!
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button variant="contained" color="primary" onClick={onClose} disableElevation sx={{ borderRadius: 2, px: 3 }}>
          Đã hiểu
        </Button>
      </DialogActions>
    </Dialog>
  );
}