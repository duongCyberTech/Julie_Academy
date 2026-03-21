import React from 'react';
import { Box, useTheme, alpha } from '@mui/material';

export const Background = ({ children }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        bgcolor: 'background.default',
        overflow: 'hidden',
        '&::before': isDark ? {
          // Lớp lưới (Grid pattern) đặc trưng của LangChain/Linear
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${alpha('#38BDF8', 0.05)} 1px, transparent 1px), 
                            linear-gradient(90deg, ${alpha('#38BDF8', 0.05)} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
        } : {},
        '&::after': isDark ? {
          // Điểm sáng (Glow) ở phía trên tỏa xuống
          content: '""',
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '40%',
          background: `radial-gradient(circle, ${alpha('#38BDF8', 0.15)} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          zIndex: 0,
        } : {
          // Ánh sáng nhẹ cho Light mode
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 0% 0%, #FFF5F7 0%, transparent 50%), 
                       radial-gradient(circle at 100% 100%, #F0F9FF 0%, transparent 50%)`,
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};