import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ParentProfilePage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Hồ sơ Phụ huynh</Typography>
      <Paper sx={{ p: 3 }}>
        {/* Code hiển thị form Parent: Số điện thoại, Danh sách con... */}
        <Typography>Thông tin liên lạc & Quản lý con cái...</Typography>
      </Paper>
    </Box>
  );
};
export default ParentProfilePage;