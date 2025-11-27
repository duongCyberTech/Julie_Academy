import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TutorProfilePage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Hồ sơ Gia sư</Typography>
      <Paper sx={{ p: 3 }}>
        {/* Code hiển thị form Tutor: Kinh nghiệm, Chuyên môn... */}
        <Typography>Kinh nghiệm giảng dạy & Thông tin liên hệ...</Typography>
      </Paper>
    </Box>
  );
};
export default TutorProfilePage;