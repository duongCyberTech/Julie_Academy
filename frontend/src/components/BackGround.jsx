import React from 'react';
import { Box, useTheme, alpha } from '@mui/material';
import bgImage from '../assets/images/bg.webp'; 
const Background = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: theme.palette.mode === 'light'
          ? `linear-gradient(170deg, 
              ${alpha(theme.palette.primary.light, 0.7)} 0%, 
              ${alpha(theme.palette.accent.light, 0.6)} 50%, 
              ${alpha(theme.palette.secondary.light, 0.7)} 100%
            ), url(${bgImage})`
          : `linear-gradient(to bottom, 
              ${alpha(theme.palette.primary.dark, 0.3)}, 
              ${alpha(theme.palette.background.default, 0.9)} 70%
            ), url(${bgImage})`,
      }}
    >
    </Box>
  );
};

export default Background;