<<<<<<< HEAD
import React, { useState,useCallback, useEffect, useMemo } from "react";
=======
import React, { useState, useEffect } from "react";
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
<<<<<<< HEAD
  Box, Typography, Paper, CircularProgress, Alert, Snackbar,
  Avatar, Button, TextField, Chip, Divider, IconButton, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Stack, Grid
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

import {
  CameraAlt as CameraAltIcon,
  SaveOutlined as SaveOutlinedIcon,
  EmailOutlined as EmailOutlinedIcon,
  PhoneOutlined as PhoneOutlinedIcon,
  WorkHistoryOutlined as WorkHistoryOutlinedIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  VerifiedUserOutlined as VerifiedUserOutlinedIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";

// 1. CHUẨN WRAPPER TỰ ĐỘNG GIÃN TRANG
const PageWrapper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(4),
  backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.paper,
  borderRadius: '24px',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
  minHeight: 'calc(100vh - 120px)',
  display: 'flex',
  flexDirection: 'column',
}));

// Cover Image mỏng phía trên Avatar (Giống LinkedIn)
const CoverBackground = styled(Box)(({ theme }) => ({
  height: 120,
  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderTopRightRadius: theme.shape.borderRadius * 2,
  position: 'relative',
}));

export default function TutorProfilePage() {
=======
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Chip
} from "@mui/material";
import {
  CameraAlt,
  Save,
  Email,
  Phone,
  WorkHistory,
  CloudUpload,
  School,
  VerifiedUser,
  Lightbulb,
  InfoOutlined,
  Star
} from "@mui/icons-material";
import "../student/Profile.css"

const TutorProfilePage = () => {
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
  const navigate = useNavigate();

  // --- STATE ---
  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "",
    email: "", username: "", role: "",
    avata_url: "", createAt: "",
<<<<<<< HEAD
    experiences: "",
=======
    experiences: "", // Dữ liệu hiển thị (đã lưu)
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    phone_number: ""
  });

  const [formData, setFormData] = useState({
    fname: "", mname: "", lname: "",
    phone_number: "",
<<<<<<< HEAD
    experiences: ""
=======
    experiences: "" // Dữ liệu đang nhập
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const API_URL = "http://localhost:4000";
  const token = localStorage.getItem("token");

<<<<<<< HEAD
  const getAuthConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);
=======
  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      let userId = null;
      if (token) {
        try {
          const decoded = jwtDecode(token);
          userId = decoded.sub || decoded.uid;
        } catch (error) {}
      }

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/${userId}`, getAuthConfig());
        const data = response.data;

<<<<<<< HEAD
=======
        // Lấy dữ liệu an toàn từ object tutor (nếu có)
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        const phoneVal = data.tutor?.phone_number || data.phone_number || "";
        const expVal = data.tutor?.experiences || "";

        const fullData = { ...data, phone_number: phoneVal, experiences: expVal };
<<<<<<< HEAD
=======
        
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        setSavedUser(fullData);
        setFormData({
          fname: data.fname || "",
          mname: data.mname || "",
          lname: data.lname || "",
          phone_number: phoneVal,
          experiences: expVal
        });
<<<<<<< HEAD
      } catch (error) {
        setToast({ open: true, message: "Lỗi tải thông tin.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, token, getAuthConfig]);

  // Tính toán độ hoàn thiện hồ sơ
  const profileCompleteness = useMemo(() => {
    let score = 0;
    if (savedUser.fname || savedUser.lname) score += 25;
    if (savedUser.email) score += 25;
    if (savedUser.phone_number) score += 25;
    if (savedUser.experiences) score += 25;
    return score;
  }, [savedUser]);
=======

        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải thông tin:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token]);
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
<<<<<<< HEAD
=======

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    if (file.size > 5 * 1024 * 1024) {
        setToast({ open: true, message: "Ảnh quá lớn (Max 5MB)", severity: "warning" });
        return;
    }

    const decoded = jwtDecode(token);
    const userId = decoded.sub || decoded.uid;
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
<<<<<<< HEAD
      const res = await axios.post(`${API_URL}/users/${userId}/avatar`, uploadData, {
        headers: { ...getAuthConfig().headers, "Content-Type": "multipart/form-data" },
      });
=======
      const res = await axios.post(
        `${API_URL}/users/${userId}/avatar`,
        uploadData,
        {
          headers: {
            ...getAuthConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
      if (res.data) {
        const newAvatarUrl = res.data.avata_url || URL.createObjectURL(file);
        setSavedUser(prev => ({ ...prev, avata_url: newAvatarUrl }));
        setToast({ open: true, message: "Đổi ảnh đại diện thành công!", severity: "success" });
        setShowAvatarModal(false);
      }
    } catch (error) {
      setToast({ open: true, message: "Lỗi upload ảnh.", severity: "error" });
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      const decoded = jwtDecode(token);
      const userId = decoded.sub || decoded.uid;

<<<<<<< HEAD
      const payload = {
        fname: formData.fname, mname: formData.mname, lname: formData.lname,
        phone_number: formData.phone_number, experiences: formData.experiences 
      };

      await axios.patch(`${API_URL}/users/${userId}`, payload, getAuthConfig());
      setSavedUser(prev => ({ ...prev, ...formData }));
=======
      // Payload khớp với Postman bạn đã test
      const payload = {
        fname: formData.fname,
        mname: formData.mname,
        lname: formData.lname,
        phone_number: formData.phone_number,
        experiences: formData.experiences 
      };

      await axios.patch(`${API_URL}/users/${userId}`, payload, getAuthConfig());

      // Cập nhật UI ngay lập tức
      setSavedUser(prev => ({
        ...prev,
        ...formData
      }));

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
      setToast({ open: true, message: "Cập nhật hồ sơ thành công!", severity: "success" });
    } catch (error) {
      setToast({ open: true, message: "Cập nhật thất bại. Vui lòng thử lại.", severity: "error" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
<<<<<<< HEAD
      <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </PageWrapper>
    );
  }

  const displayAvatar = savedUser.avata_url || "";

  return (
    <PageWrapper>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" color="text.primary">Hồ sơ giảng dạy</Typography>
        <Typography variant="body2" color="text.secondary">Quản lý thông tin cá nhân và giới thiệu bản thân đến học viên.</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* ================================================= */}
        {/* CỘT TRÁI: MINI CV & AVATAR */}
        {/* ================================================= */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', height: '100%', borderColor: 'divider' }}>
            <CoverBackground />
            
            <Box sx={{ px: 3, pb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -7 }}>
              {/* Avatar kèm nút sửa */}
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton 
                    onClick={() => setShowAvatarModal(true)}
                    sx={{ 
                      bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'grey.100' }, width: 36, height: 36
                    }}
                  >
                    <CameraAltIcon fontSize="small" color="action" />
                  </IconButton>
                }
              >
                <Avatar 
                  src={displayAvatar} 
                  sx={{ 
                    width: 120, height: 120, border: '4px solid #fff', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', bgcolor: 'primary.light', fontSize: '3rem'
                  }}
                >
                  {savedUser.fname?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Badge>

              <Typography variant="h6" fontWeight="800" sx={{ mt: 2, textAlign: 'center' }}>
                {savedUser.lname} {savedUser.mname} {savedUser.fname}
              </Typography>
              
              <Stack direction="row" spacing={1} mt={1} mb={3}>
                <Chip label="GIA SƯ" color="primary" size="small" icon={<SchoolOutlinedIcon />} sx={{ fontWeight: 700 }} />
                {savedUser.phone_number && (
                  <Chip label="Xác thực" color="success" size="small" variant="outlined" icon={<VerifiedUserOutlinedIcon />} />
                )}
              </Stack>

              {/* Progress Bar hoàn thiện hồ sơ */}
              <Box sx={{ width: '100%', mb: 4, p: 2, bgcolor: (t) => alpha(t.palette.primary.main, 0.04), borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" fontWeight={700}>Độ hoàn thiện hồ sơ</Typography>
                  <Typography variant="caption" fontWeight={700} color={profileCompleteness === 100 ? 'success.main' : 'primary.main'}>
                    {profileCompleteness}%
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={profileCompleteness} 
                  color={profileCompleteness === 100 ? "success" : "primary"}
                  sx={{ height: 8, borderRadius: 4 }} 
                />
              </Box>

              {/* Thông tin liên hệ */}
              <Box sx={{ width: '100%', textAlign: 'left' }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>LIÊN HỆ</Typography>
                <Stack spacing={1.5} mt={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover' }}><EmailOutlinedIcon fontSize="small" color="action" /></Avatar>
                    <Typography variant="body2" fontWeight={600} noWrap>{savedUser.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover' }}><PhoneOutlinedIcon fontSize="small" color="action" /></Avatar>
                    <Typography variant="body2" fontWeight={600}>{savedUser.phone_number || "Chưa cập nhật"}</Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Tiểu sử ngắn */}
              {savedUser.experiences && (
                <Box sx={{ width: '100%', textAlign: 'left', mt: 4 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>KINH NGHIỆM & THÀNH TÍCH</Typography>
                  <Paper elevation={0} sx={{ p: 2, mt: 1, bgcolor: (t) => alpha(t.palette.success.main, 0.05), border: '1px solid', borderColor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.6, color: 'text.secondary' }}>
                      {savedUser.experiences}
                    </Typography>
                  </Paper>
                </Box>
              )}

            </Box>
          </Paper>
        </Grid>

        {/* ================================================= */}
        {/* CỘT PHẢI: FORM CHỈNH SỬA */}
        {/* ================================================= */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, borderColor: 'divider' }}>
            
            <Typography variant="h6" fontWeight="700" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlinedIcon color="primary" /> Thông tin cơ bản
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Họ (Last Name)" name="lname" value={formData.lname} onChange={handleInputChange} size="medium" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Tên đệm (Middle Name)" name="mname" value={formData.mname} onChange={handleInputChange} size="medium" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Tên (First Name)" name="fname" value={formData.fname} onChange={handleInputChange} size="medium" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth label="Email đăng nhập" value={savedUser.email || ""} disabled 
                  helperText="Email được dùng để đăng nhập và không thể thay đổi."
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth label="Số điện thoại liên hệ" name="phone_number" value={formData.phone_number} onChange={handleInputChange} 
                  placeholder="Ví dụ: 0912345678"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" fontWeight="700" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkHistoryOutlinedIcon color="primary" /> Giới thiệu & Kinh nghiệm
                </Typography>
                <TextField
                  fullWidth multiline rows={6} name="experiences" value={formData.experiences} onChange={handleInputChange}
                  placeholder={`Mẹo liệt kê uy tín:\n- Nơi công tác: Giáo viên Toán THCS...\n- Bằng cấp: Thạc sĩ Sư phạm...\n- Thành tích: Đào tạo 50+ học sinh giỏi...`}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" size="large" 
                onClick={handleSave} disabled={updating}
                startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveOutlinedIcon />}
                sx={{ px: 4, py: 1.5, borderRadius: '12px' }}
              >
                {updating ? "Đang lưu..." : "Lưu Thay Đổi"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ================================================= */}
      {/* DIALOG UPLOAD ẢNH (Thay thế Modal HTML thuần) */}
      {/* ================================================= */}
      <Dialog open={showAvatarModal} onClose={() => setShowAvatarModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>Cập Nhật Ảnh Đại Diện</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 2, border: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Lưu ý định dạng:</Typography>
            <Typography variant="body2" color="text.secondary">• Hỗ trợ ảnh: JPEG, PNG</Typography>
            <Typography variant="body2" color="text.secondary">• Dung lượng tối đa: 5MB</Typography>
            <Typography variant="body2" color="text.secondary">• Nên dùng ảnh tỉ lệ vuông (1:1)</Typography>
          </Box>
          <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadOutlinedIcon />} sx={{ py: 1.5, borderStyle: 'dashed' }}>
            Chọn ảnh từ máy tính
            <input type="file" accept="image/jpeg, image/png" hidden onChange={handleFileChange} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowAvatarModal(false)} color="inherit" sx={{ fontWeight: 600 }}>Hủy Bỏ</Button>
        </DialogActions>
      </Dialog>

      {/* TOAST THÔNG BÁO */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled" sx={{ width: "100%", borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
}
=======
      <div className="profile-container" style={{ alignItems: "center" }}>
        <CircularProgress />
      </div>
    );
  }

  const displayAvatar = savedUser.avata_url || "https://via.placeholder.com/150";

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* === CỘT TRÁI: HIỂN THỊ (MINI CV) === */}
        <div
          className="left-panel card"
          style={{ background: "linear-gradient(to bottom, #ffffff, #f0fdf4)" }}
        >
          <div className="avatar-wrapper">
            <img
              src={displayAvatar}
              alt="Avatar"
              className="avatar-img"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
            <button
              className="camera-btn"
              onClick={() => setShowAvatarModal(true)}
            >
              <CameraAlt fontSize="small" />
            </button>
          </div>

          <h2 className="user-fullname">
            {savedUser.lname} {savedUser.mname} {savedUser.fname}
          </h2>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Chip
              label="GIA SƯ"
              color="success"
              size="small"
              icon={<School style={{ fontSize: 16 }} />}
              style={{ fontWeight: 600 }}
            />
            {savedUser.phone_number && (
              <Chip
                label="Đã xác thực SĐT"
                variant="outlined"
                color="primary"
                size="small"
                icon={<VerifiedUser style={{ fontSize: 16 }} />}
              />
            )}
          </div>

          <div
            className="basic-info"
            style={{
              width: "100%",
              padding: "0 20px", // Tạo khoảng cách an toàn 2 bên
              marginTop: "25px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start", // QUAN TRỌNG: Căn tất cả sang trái
            }}
          >
            {/* Khối Email */}
            <div
              className="info-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "2px",
                color: "#4b5563", // Màu xám đậm cho dễ đọc
              }}
            >
              <Email fontSize="small" color="action" />
              <span style={{ fontSize: "0.95rem" }}>{savedUser.email}</span>
            </div>

            {/* Khối SĐT */}
            {savedUser.phone_number && (
              <div
                className="info-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#4b5563",
                }}
              >
                <Phone fontSize="small" color="action" />
                <span style={{ fontSize: "0.95rem" }}>
                  {savedUser.phone_number}
                </span>
              </div>
            )}
          </div>

          {/* HIỂN THỊ KINH NGHIỆM - PHẦN QUAN TRỌNG NHẤT */}
          {savedUser.experiences && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "12px",
                border: "1px solid #dcfce7",
                width: "100%",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "8px",
                  color: "#15803d",
                  fontWeight: "bold",
                }}
              >
                <WorkHistory fontSize="small" /> Kinh nghiệm & Thành tích
              </div>
              <p
                style={{
                  whiteSpace: "pre-line", // QUAN TRỌNG: Giữ định dạng xuống dòng
                  fontSize: "0.9rem",
                  color: "#374151",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                {savedUser.experiences}
              </p>
            </div>
          )}
        </div>

        {/* === CỘT PHẢI: FORM CHỈNH SỬA === */}
        <div className="right-panel card">
          <div className="panel-header">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h3>Hồ Sơ Giảng Dạy</h3>
                <p>
                  Hãy xây dựng thật uy tín để thu hút học sinh và phụ huynh đăng
                  kí lớp của mình nhé
                </p>
              </div>
              <Star style={{ color: "#fbbf24", fontSize: 40 }} />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Họ (Last Name)</label>
              <input
                type="text"
                name="lname"
                value={formData.lname}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Tên đệm (Middle Name)</label>
              <input
                type="text"
                name="mname"
                value={formData.mname}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group full-width-mobile">
              <label>Tên (First Name)</label>
              <input
                type="text"
                name="fname"
                value={formData.fname}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Số điện thoại liên hệ</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 0912345678"
                  style={{ paddingLeft: "40px" }}
                />
                <Phone
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "12px",
                    color: "#9ca3af",
                    fontSize: "20px",
                  }}
                />
              </div>
            </div>

            {/* EXPERIENCE TEXTAREA - HERO SECTION */}
            <div
              className="form-group full-width"
              style={{ marginTop: "10px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "5px",
                }}
              >
                <label>Giới thiệu & Kinh nghiệm</label>
                <Tooltip title="Mẹo: Hãy liệt kê nơi công tác, bằng cấp và các thành tích cụ thể (số học sinh đậu, điểm số...)">
                  <Lightbulb
                    fontSize="small"
                    style={{ color: "#eab308", cursor: "pointer" }}
                  />
                </Tooltip>
              </div>

              <div style={{ position: "relative" }}>
                <textarea
                  name="experiences"
                  value={formData.experiences}
                  onChange={handleInputChange}
                  rows="8"
                  placeholder={`- Nơi công tác: Giáo viên Toán THCS Nguyễn Du\n- Bằng cấp: Thạc sĩ Sư phạm Toán\n- Thành tích: Đào tạo 50+ học sinh đậu trường Chuyên\n- Phương pháp: Tư duy logic, sơ đồ Mindmap`}
                  style={{
                    width: "100%",
                    padding: "12px",
                    paddingLeft: "12px",
                    borderRadius: "10px",
                    border: "1.5px solid #e5e7eb",
                    fontFamily: "inherit",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    resize: "vertical",
                    outline: "none",
                    backgroundColor: "#f9fafb",
                  }}
                />
              </div>
              <small
                style={{
                  color: "#6b7280",
                  fontStyle: "italic",
                  marginTop: "4px",
                }}
              ></small>
            </div>

            <div className="form-group full-width">
              <label>Email đăng nhập (Không thể thay đổi)</label>
              <input
                type="email"
                value={savedUser.email || ""}
                disabled
                className="input-disabled"
              />
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={updating}
              style={{
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              }}
            >
              {updating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Save fontSize="small" />
              )}
              {updating ? " Đang cập nhật..." : " Lưu Hồ Sơ"}
            </button>
          </div>
        </div>
      </div>

      {/* === MODAL UPLOAD ẢNH (Đã nâng cấp giao diện giống Student) === */}
      {showAvatarModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Thay Đổi Ảnh Đại Diện</h3>

            {/* Khu vực thông tin hướng dẫn (Mới thêm) */}
            <div
              style={{
                margin: "20px 0",
                padding: "15px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                textAlign: "left",
                border: "1px dashed #cbd5e1",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  color: "#334155",
                  fontWeight: 600,
                }}
              >
                <InfoOutlined fontSize="small" color="primary" /> Lưu ý khi tải
                ảnh:
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  color: "#64748b",
                  fontSize: "0.9rem",
                }}
              >
                <li>
                  Định dạng hỗ trợ: <strong>JPEG, PNG</strong>
                </li>
                <li>
                  Dung lượng tối đa: <strong>5MB</strong>
                </li>
                <li>Nên dùng ảnh vuông để hiển thị đẹp nhất.</li>
              </ul>
            </div>

            <div className="modal-actions">
              <label
                htmlFor="file-upload"
                className="btn-upload"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <CloudUpload fontSize="small" /> Chọn ảnh từ máy tính
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />

              <button
                className="btn-close"
                onClick={() => setShowAvatarModal(false)}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TutorProfilePage;
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
