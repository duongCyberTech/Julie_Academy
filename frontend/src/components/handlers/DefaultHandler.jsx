import React from "react";
import { Box, Typography } from "@mui/material";

const DefaultHandler = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
      <Typography>Không hỗ trợ xem trước định dạng này.</Typography>
      <Typography variant="caption">Vui lòng tải về máy.</Typography>
    </Box>
  );
};

export default DefaultHandler;