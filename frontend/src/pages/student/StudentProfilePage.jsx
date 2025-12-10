import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Divider,
  InputAdornment,
  Container,
  Fade,
  useTheme
} from "@mui/material";
import {
  School as SchoolIcon,
  Cake as CakeIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  CameraAlt as CameraIcon
} from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";

import { getUserById, updateUser } from "../../services/UserService";

const StudentProfilePage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userId, setUserId] = useState(null);

  // State form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fname: "",
    lname: "",
    school: "",
    dob: "",
  });

  // State thông báo
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // 1. Load dữ liệu khi vào trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const uid = decoded.sub || decoded.uid; // Lấy UID từ token
        setUserId(uid);
        
        // Gọi hàm fetch data
        fetchUserProfile(uid, token);
      } catch (error) {
        console.error("Lỗi decode token:", error);
        setToast({ open: true, message: "Phiên đăng nhập không hợp lệ", severity: "error" });
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Hàm gọi API lấy thông tin
  const fetchUserProfile = async (id, token) => {
    try {
      setLoading(true);
      const data = await getUserById(id, token);
      
      // Map dữ liệu vào form
      setFormData({
        username: data.username || "",
        email: data.email || "",
        fname: data.fname || "",
        lname: data.lname || "",
        school: data.student?.school || "",
        // Chuyển đổi ngày ISO về yyyy-MM-dd cho input date
        dob: data.student?.dob ? data.student.dob.split("T")[0] : "",
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin:", error);
      setToast({ open: true, message: "Không thể tải thông tin hồ sơ", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Xử lý Lưu (Update)
  const handleSubmit = async () => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    
    try {
      setUpdating(true);
      
      const payload = {
        fname: formData.fname,
        lname: formData.lname,
        school: formData.school,
        dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      };

      await updateUser(userId, payload, token);
      
      setToast({ open: true, message: "🎉 Cập nhật hồ sơ thành công!", severity: "success" });
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      setToast({ open: true, message: "Cập nhật thất bại. Vui lòng thử lại.", severity: "error" });
    } finally {
      setUpdating(false);
    }
  };

  // Loading View
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress size={60} thickness={4} color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Fade in={true} timeout={800}>
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}>
            <Typography variant="h4" fontWeight="800" sx={{ background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Hồ Sơ Cá Nhân
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Quản lý thông tin tài khoản và cập nhật hồ sơ học tập của bạn
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Cột Trái: Card Profile */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 0,
                  borderRadius: 4,
                  overflow: "hidden",
                  textAlign: "center",
                  height: "100%",
                  position: "relative"
                }}
              >
                {/* Background trang trí */}
                <Box
                  sx={{
                    height: 140,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                />
                
                {/* Avatar */}
                <Box sx={{ mt: -7, display: "flex", justifyContent: "center", position: "relative" }}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        border: "4px solid white",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                        fontSize: "3rem",
                        bgcolor: "primary.main"
                      }}
                    >
                      {formData.fname?.charAt(0).toUpperCase()}
                    </Avatar>
                    {/* Nút sửa ảnh (Mock UI) */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 5,
                        right: 5,
                        bgcolor: "white",
                        borderRadius: "50%",
                        p: 0.5,
                        boxShadow: 1,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#f5f5f5" }
                      }}
                    >
                      <CameraIcon color="primary" fontSize="small" />
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {formData.lname} {formData.fname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    @{formData.username}
                  </Typography>
                  <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
                    <Button variant="outlined" size="small" startIcon={<BadgeIcon />}>
                      Học sinh
                    </Button>
                  </Stack>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Thông tin liên hệ
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1, p: 1.5, bgcolor: "grey.50", borderRadius: 2 }}>
                      <EmailIcon color="action" fontSize="small" />
                      <Typography variant="body2" noWrap title={formData.email}>
                        {formData.email}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Cột Phải: Form Chỉnh Sửa */}
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: "primary.light", color: "primary.main" }}>
                    <EditIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Cập nhật thông tin
                  </Typography>
                </Stack>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ & Tên đệm"
                      name="lname"
                      value={formData.lname}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tên"
                      name="fname"
                      value={formData.fname}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Trường học"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      placeholder="Nhập tên trường học của bạn"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SchoolIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CakeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email (Không thể thay đổi)"
                      value={formData.email}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="disabled" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ bgcolor: "grey.50" }}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button variant="outlined" color="inherit" size="large">
                        Hủy bỏ
                      </Button>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={updating}
                        startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{ 
                          px: 4, 
                          borderRadius: 3,
                          textTransform: "none",
                          fontSize: "1rem",
                          boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)"
                        }}
                      >
                        {updating ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Thông báo Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentProfilePage;