import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box
        sx={{
          py: 12,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Typography variant="h3" component="h1" fontWeight="bold">
          403 - Cấm Truy Cập
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Rất tiếc, bạn không có quyền truy cập vào trang này.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Quay về trang chủ
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
