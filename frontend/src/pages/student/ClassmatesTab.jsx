import React, { useState, useMemo, useCallback, useEffect, memo } from "react";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Chip,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Grid,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { jwtDecode } from "jwt-decode";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WavingHandRoundedIcon from "@mui/icons-material/WavingHandRounded";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded"; 
import ConnectWithoutContactRoundedIcon from "@mui/icons-material/ConnectWithoutContactRounded";
import SentimentDissatisfiedRoundedIcon from "@mui/icons-material/SentimentDissatisfiedRounded";

const TopBar = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(4),
    backgroundColor: isDark
      ? alpha(theme.palette.primary.main, 0.08)
      : alpha(theme.palette.primary.main, 0.04),
    padding: theme.spacing(2.5, 3),
    borderRadius: "20px",
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.primary.main, 0.15)}`,
    gap: theme.spacing(2),
    flexWrap: "wrap",
    boxShadow: isDark ? "none" : `0 4px 20px ${alpha(theme.palette.primary.main, 0.03)}`,
  };
});

const ClassmateCard = styled(Card)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    borderRadius: "24px",
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.4)}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: isDark ? "none" : `0 4px 16px ${alpha(theme.palette.common.black, 0.02)}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    height: "100%",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: isDark
        ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
        : `0 12px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
      borderColor: alpha(theme.palette.primary.main, 0.3),
    },
  };
});

const AvatarRing = styled(Box)(({ theme }) => ({
  width: 90,
  height: 90,
  borderRadius: "50%",
  margin: "0 auto",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(0.5),
  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.info.light})`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const EmptyStateContainer = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    padding: theme.spacing(6),
    textAlign: "center",
    backgroundColor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.primary.main, 0.02),
    borderRadius: "24px",
    border: `2px dashed ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.primary.main, 0.2)}`,
    boxShadow: "none",
  };
});

const ClassmatesTab = ({ studentsData }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "info" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.sub || decoded.uid || decoded.userId);
      } catch (e) {
        console.error("Token invalid");
      }
    }
  }, []);

  const safeData = useMemo(() => (Array.isArray(studentsData) ? studentsData : []), [studentsData]);
  
  const classmates = useMemo(() => {
    return safeData.filter(
      (item) => item.status === "accepted" && item.student?.uid !== currentUserId
    );
  }, [safeData, currentUserId]);

  const filteredClassmates = useMemo(() => {
    if (!searchTerm) return classmates;
    const lowerTerm = searchTerm.toLowerCase();
    return classmates.filter((item) => {
      const user = item.student?.user || {};
      const fullName = `${user.lname || ""} ${user.mname || ""} ${user.fname || ""}`.toLowerCase();
      return fullName.includes(lowerTerm);
    });
  }, [classmates, searchTerm]);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleWave = useCallback(async (targetStudent) => {
    const token = localStorage.getItem("token");
    if (!token || !currentUserId) return;

    const targetUser = targetStudent?.user || {};
    const targetName = targetUser.fname || "bạn học";

    setLoadingActionId(targetStudent.uid); 
    try {
      // TODO: Thay thế hàm này bằng API thực tế của Backend bạn
      // await createNotification({
      //   recipient_id: targetStudent.uid,
      //   type: 'WAVE',
      //   message: `Một người bạn trong lớp vừa vẫy tay chào bạn!`
      // }, token);

      // Giả lập API call 1 giây
      await new Promise(resolve => setTimeout(resolve, 1000));

      setToast({
        open: true,
        msg: `Đã gửi lời chào đến ${targetName}! 👋`,
        severity: "success",
      });
    } catch (err) {
      setToast({
        open: true,
        msg: err.response?.data?.message || "Không thể gửi lời chào lúc này.",
        severity: "error",
      });
    } finally {
      setLoadingActionId(null);
    }
  }, [currentUserId]);

  const handleCloseToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <TopBar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.2) : theme.palette.background.paper, 
              color: "primary.main",
              width: 48, height: 48,
              boxShadow: isDark ? 'none' : `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Diversity3RoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} color={isDark ? "primary.light" : "primary.main"}>
              Bạn cùng tiến
            </Typography>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Giao lưu và học hỏi cùng các bạn trong lớp
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Tìm tên bạn bè..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              minWidth: { xs: '100%', sm: 220 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
                backgroundColor: theme.palette.background.paper,
                fontWeight: 600,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Chip
            icon={<ConnectWithoutContactRoundedIcon fontSize="small" />}
            label={`${classmates.length} bạn`}
            color="primary"
            variant={isDark ? "outlined" : "filled"}
            sx={{ 
              fontWeight: 700, 
              borderRadius: "12px", 
              px: 1, py: 2.5,
              bgcolor: !isDark ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              color: !isDark ? 'primary.dark' : 'primary.light',
              border: 'none'
            }}
          />
        </Box>
      </TopBar>

      {filteredClassmates.length > 0 ? (
        <Grid container spacing={3}>
          {filteredClassmates.map((item) => {
            const student = item.student;
            const user = student?.user || {};
            const displayName = `${user.lname || ""} ${user.mname || ""} ${user.fname || ""}`.trim();
            const fallbackChar = user.fname?.charAt(0) || "U";
            const isLoading = loadingActionId === student.uid;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={student?.uid || Math.random()}>
                <ClassmateCard elevation={0}>
                  <CardContent sx={{ textAlign: "center", p: 3, pt: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <AvatarRing>
                      <Avatar
                        src={user.avata_url}
                        alt={displayName}
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: "info.main",
                          fontSize: "2rem",
                          fontWeight: 700,
                          border: `4px solid ${theme.palette.background.paper}`,
                        }}
                      >
                        {fallbackChar}
                      </Avatar>
                    </AvatarRing>

                    <Typography variant="subtitle1" fontWeight={700} color="text.primary" noWrap title={displayName}>
                      {displayName}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "inline-block",
                        bgcolor: isDark ? alpha(theme.palette.divider, 0.05) : alpha(theme.palette.grey[100], 0.8),
                        borderRadius: "8px",
                        px: 1.5,
                        py: 0.5,
                        mt: 1,
                        mb: 2,
                        fontWeight: 600,
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.email || "Chưa có email"}
                    </Typography>

                    <Box sx={{ mt: "auto", display: "flex", justifyContent: "center", pt: 1 }}>
                      <Tooltip title={`Vẫy tay chào ${user.fname || "bạn này"}`} arrow placement="top">
                        <span>
                          <IconButton
                            disabled={isLoading}
                            onClick={() => handleWave(student)}
                            sx={{
                              bgcolor: alpha(theme.palette.warning.main, 0.1), // Dùng tone vàng/cam cho hành động thân thiện
                              color: "warning.main",
                              transition: "all 0.2s",
                              borderRadius: '14px',
                              p: 1.2,
                              "&:hover": {
                                bgcolor: alpha(theme.palette.warning.main, 0.2),
                                transform: "scale(1.1) rotate(15deg)",
                              },
                              "&.Mui-disabled": {
                                bgcolor: alpha(theme.palette.action.disabledBackground, 0.5),
                              }
                            }}
                          >
                            {isLoading ? (
                               <CircularProgress size={22} color="inherit" thickness={5} />
                            ) : (
                               <WavingHandRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </ClassmateCard>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <EmptyStateContainer>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: "0 auto",
              mb: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              color: "primary.light",
            }}
          >
            {searchTerm ? <SentimentDissatisfiedRoundedIcon fontSize="large" /> : <Diversity3RoundedIcon fontSize="large" />}
          </Avatar>
          <Typography variant="h6" color="text.primary" fontWeight={700} gutterBottom>
            {searchTerm ? "Không tìm thấy bạn nào!" : "Lớp mình chưa có ai"}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {searchTerm
              ? `Thử tìm kiếm với một tên khác xem sao nhé.`
              : "Có vẻ như bạn là người đầu tiên ở đây. Hãy chờ các bạn khác vào lớp nhé!"}
          </Typography>
        </EmptyStateContainer>
      )}

      {/* Snackbar feedback giống hệt trang Enroll */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          icon={toast.severity === 'success' ? <WavingHandRoundedIcon /> : undefined}
          sx={{ borderRadius: "14px", fontWeight: 600, alignItems: 'center' }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default memo(ClassmatesTab);