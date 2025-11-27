import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AdminProfilePage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Hồ sơ Quản trị viên</Typography>
      <Paper sx={{ p: 3 }}>
        {/* Code hiển thị form thông tin Admin (Họ tên, Email...) */}
        <Typography>Thông tin tài khoản Admin...</Typography>
      </Paper>
    </Box>
  );
};
export default AdminProfilePage;