import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardMedia,
  Typography,
  Box,
  useTheme,
  alpha,
} from '@mui/material';

const Card = ({
  title,
  description,
  image,
  icon: IconComponent,
  iconColor = 'primary',
  children,
  ...rest
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const safeIconColor = theme.palette[iconColor] ? iconColor : 'primary';
  const mainColor = theme.palette[safeIconColor].main;

  return (
    <MuiCard
      sx={{
        maxWidth: 360,
        m: theme.spacing(2), 
        textAlign: 'center',
      }}
      {...rest}
    >
      {image && (
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={title || 'Card Image'}
          sx={{ objectFit: 'cover' }}
        />
      )}

      <CardContent sx={{ p: 3 }}>
        {IconComponent && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
              width: 64,
              height: 64,
              borderRadius: '50%',
              color: mainColor,
              backgroundColor: isDark
                ? theme.palette.neutral[700]
                : theme.palette.neutral[100],
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: `0 0 20px ${alpha(mainColor, 0.5)}`,
              },
            }}
          >
            <IconComponent sx={{ fontSize: 32 }} />
          </Box>
        )}

        {title && (
          <Typography
            gutterBottom
            variant="h5"
            component="h3"
            sx={{ color: 'text.primary' }}
          >
            {title}
          </Typography>
        )}

        {description && (
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', lineHeight: 1.6 }}
          >
            {description}
          </Typography>
        )}

        {children && <Box mt={2}>{children}</Box>}
      </CardContent>
    </MuiCard>
  );
};

export default Card;