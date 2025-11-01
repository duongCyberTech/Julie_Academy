import React, { forwardRef } from 'react';
import { Snackbar, Alert, useTheme } from '@mui/material';

const SnackbarAlert = forwardRef(function SnackbarAlert(props, ref) {
    const theme = useTheme();
    
    const getBackgroundColor = (severity) => {
        return theme.palette[severity] ? theme.palette[severity].main : theme.palette.grey[800];
    };

    return (
        <Alert
            elevation={6} 
            ref={ref}
            variant="filled" 
            {...props}
            sx={{
                backgroundColor: getBackgroundColor(props.severity),
                fontFamily: theme.typography.fontFamily,
                fontWeight: theme.typography.fontWeightMedium,
                width: '100%', 
            }}
        />
    );
});

const AppSnackbar = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000} 
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
    >
      <SnackbarAlert 
        onClose={onClose} 
        severity={severity} 
      >
        {message}
      </SnackbarAlert>
    </Snackbar>
  );
};

export default AppSnackbar;