import { Box, useTheme, alpha } from '@mui/material';
import bgImage from '../assets/images/bg.webp';

export const Background = ({ children }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: isDark
          ? `linear-gradient(${alpha(theme.palette.background.default, 0.92)}, ${alpha(theme.palette.background.default, 0.95)}), url(${bgImage})`
          : `linear-gradient(${alpha(theme.palette.background.default, 0.88)}, ${alpha(theme.palette.background.default, 0.92)}), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.3s ease',
      }}
    >
      {children}
    </Box>
  );
};
