import React, { useState,useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
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
  const navigate = useNavigate();

  // --- STATE ---
  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "",
    email: "", username: "", role: "",
    avata_url: "", createAt: "",
    experiences: "",
    phone_number: ""
  });

  const [formData, setFormData] = useState({
    fname: "", mname: "", lname: "",
    phone_number: "",
    experiences: ""
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const API_URL = "http://localhost:4000";
  const token = localStorage.getItem("token");

  const getAuthConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

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

        const phoneVal = data.tutor?.phone_number || data.phone_number || "";
        const expVal = data.tutor?.experiences || "";

        const fullData = { ...data, phone_number: phoneVal, experiences: expVal };
        setSavedUser(fullData);
        setFormData({
          fname: data.fname || "",
          mname: data.mname || "",
          lname: data.lname || "",
          phone_number: phoneVal,
          experiences: expVal
        });
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

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        setToast({ open: true, message: "Ảnh quá lớn (Max 5MB)", severity: "warning" });
        return;
    }

    const decoded = jwtDecode(token);
    const userId = decoded.sub || decoded.uid;
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/users/${userId}/avatar`, uploadData, {
        headers: { ...getAuthConfig().headers, "Content-Type": "multipart/form-data" },
      });
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

      const payload = {
        fname: formData.fname, mname: formData.mname, lname: formData.lname,
        phone_number: formData.phone_number, experiences: formData.experiences 
      };

      await axios.patch(`${API_URL}/users/${userId}`, payload, getAuthConfig());
      setSavedUser(prev => ({ ...prev, ...formData }));
      setToast({ open: true, message: "Cập nhật hồ sơ thành công!", severity: "success" });
    } catch (error) {
      setToast({ open: true, message: "Cập nhật thất bại. Vui lòng thử lại.", severity: "error" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
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