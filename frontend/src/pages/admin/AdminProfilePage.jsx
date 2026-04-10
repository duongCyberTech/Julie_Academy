import React, { useState, useEffect, useCallback, memo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Box, Typography, Paper, CircularProgress, Alert, Snackbar,
  Avatar, Button, TextField, Chip, Divider, IconButton, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, Grid, useTheme
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

import {
  CameraAlt as CameraAltIcon,
  SaveOutlined as SaveOutlinedIcon,
  EmailOutlined as EmailOutlinedIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Security as SecurityIcon,
  GppGood as GppGoodIcon,
  Fingerprint as FingerprintIcon,
  InfoOutlined as InfoOutlinedIcon
} from "@mui/icons-material";

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
  };
});

const HeaderBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(4),
  flexShrink: 0,
}));

const ProfileCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    borderRadius: '16px',
    backgroundColor: isDark ? alpha(theme.palette.background.default, 0.4) : theme.palette.background.paper,
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`,
    boxShadow: isDark ? 'none' : '0px 4px 12px rgba(0,0,0,0.02)',
    transition: 'all 0.3s',
    height: '100%',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isDark ? `0 0 20px ${alpha(theme.palette.error.main, 0.1)}` : '0px 12px 24px rgba(0,0,0,0.06)',
      borderColor: theme.palette.error.main,
    }
  };
});

const CoverBackground = styled(Box)(({ theme }) => ({
  height: 120,
  background: `linear-gradient(135deg, ${theme.palette.error.light}, ${theme.palette.error.main})`,
  position: 'relative',
}));

function AdminProfilePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "", email: "", role: "", avata_url: "", createAt: "", uid: ""
  });

  const [formData, setFormData] = useState({
    fname: "", mname: "", lname: ""
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const getAuthConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      let userId = null;
      if (token) {
        try { userId = jwtDecode(token).sub || jwtDecode(token).uid; } catch (error) {}
      }

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/${userId}`, getAuthConfig());
        const data = response.data;

        setSavedUser(data);
        setFormData({
          fname: data.fname || "", mname: data.mname || "", lname: data.lname || ""
        });
      } catch (error) {
        setToast({ open: true, message: "Lỗi tải thông tin.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, token, getAuthConfig]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({ open: true, message: "Ảnh quá lớn (Max 5MB)", severity: "warning" });
      return;
    }

    const userId = jwtDecode(token).sub || jwtDecode(token).uid;
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/users/${userId}/avatar`, uploadData, {
        headers: { ...getAuthConfig().headers, "Content-Type": "multipart/form-data" },
      });
      if (res.data) {
        setSavedUser(prev => ({ ...prev, avata_url: res.data.avata_url || URL.createObjectURL(file) }));
        setToast({ open: true, message: "Cập nhật ảnh quản trị viên thành công!", severity: "success" });
        setShowAvatarModal(false);
      }
    } catch (error) {
      setToast({ open: true, message: "Lỗi upload ảnh.", severity: "error" });
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      const userId = jwtDecode(token).sub || jwtDecode(token).uid;
      const payload = { fname: formData.fname, mname: formData.mname, lname: formData.lname };

      await axios.patch(`${API_URL}/users/${userId}`, payload, getAuthConfig());

      setSavedUser(prev => ({ ...prev, ...formData }));
      setToast({ open: true, message: "Cập nhật thông tin thành công!", severity: "success" });
    } catch (error) {
      setToast({ open: true, message: "Cập nhật thất bại.", severity: "error" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}><CircularProgress color="error" /></PageWrapper>;
  }

  return (
    <PageWrapper>
      <HeaderBar>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">Hồ sơ Quản trị</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
            Quản lý thông tin định danh hệ thống (Root Access).
          </Typography>
        </Box>
      </HeaderBar>

      <Grid container spacing={3}>
        {/* ================================================= */}
        {/* CỘT TRÁI */}
        {/* ================================================= */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ProfileCard elevation={0}>
            <CoverBackground />
            <Box sx={{ px: 3, pb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -7 }}>
              <Badge
                overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton 
                    onClick={() => setShowAvatarModal(true)} 
                    sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'action.hover' }, width: 36, height: 36 }}
                  >
                    <CameraAltIcon fontSize="small" color="error" />
                  </IconButton>
                }
              >
                <Avatar 
                  src={savedUser.avata_url || ""} 
                  sx={{ width: 120, height: 120, border: `4px solid ${theme.palette.background.paper}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', fontSize: '3rem', fontWeight: 700 }}
                >
                  {savedUser.fname?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Badge>

              <Typography variant="h6" fontWeight="700" sx={{ mt: 2, textAlign: 'center' }}>
                {[savedUser.lname, savedUser.mname, savedUser.fname].filter(Boolean).join(" ")}
              </Typography>
              
              <Stack direction="row" spacing={1} mt={1} mb={3} flexWrap="wrap" justifyContent="center">
                <Chip label="QUẢN TRỊ VIÊN" color="error" size="small" icon={<AdminPanelSettingsIcon />} sx={{ fontWeight: 700 }} />
                <Chip label="Root Access" size="small" variant="outlined" icon={<SecurityIcon />} sx={{ fontWeight: 600, color: 'text.secondary', borderColor: 'divider' }} />
              </Stack>

              <Box sx={{ width: '100%', textAlign: 'left' }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>THÔNG TIN CƠ BẢN</Typography>
                <Stack spacing={1.5} mt={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover' }}><EmailOutlinedIcon fontSize="small" color="error" /></Avatar>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ wordBreak: 'break-all' }}>{savedUser.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.success.main, 0.1) }}><GppGoodIcon fontSize="small" color="success" /></Avatar>
                    <Typography variant="body2" fontWeight={600} color="success.main">Tài khoản bảo mật</Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ width: '100%', mt: 4, p: 1.5, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FingerprintIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  UID: {savedUser.uid ? `${savedUser.uid.substring(0, 15)}...` : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </ProfileCard>
        </Grid>

        {/* ================================================= */}
        {/* CỘT PHẢI */}
        {/* ================================================= */}
        <Grid size={{ xs: 12, md: 8 }}>
          <ProfileCard elevation={0} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                <InfoOutlinedIcon /> Thông Tin Định Danh
              </Typography>
              <SecurityIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Họ (Last Name)" name="lname" value={formData.lname} onChange={handleInputChange} size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Tên đệm (Middle Name)" name="mname" value={formData.mname} onChange={handleInputChange} size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Tên (First Name)" name="fname" value={formData.fname} onChange={handleInputChange} size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Email đăng nhập" value={savedUser.email || ""} disabled size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />
              </Grid>

              <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Vai trò hệ thống" value="Super Admin" disabled size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1, '& .MuiInputBase-input.Mui-disabled': { color: 'error.main', WebkitTextFillColor: theme.palette.error.main, fontWeight: 'bold' } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Ngày gia nhập" value={savedUser.createAt ? new Date(savedUser.createAt).toLocaleDateString("vi-VN") : "N/A"} disabled size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" color="error" size="large" onClick={handleSave} disabled={updating} 
                startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveOutlinedIcon />} 
                sx={{ px: 4, py: 1.5, borderRadius: '12px', fontWeight: 700 }}
              >
                {updating ? "Đang cập nhật..." : "Lưu Thay Đổi"}
              </Button>
            </Box>
          </ProfileCard>
        </Grid>
      </Grid>

      {/* DIALOG UPLOAD ẢNH */}
      <Dialog open={showAvatarModal} onClose={() => setShowAvatarModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', color: 'error.main' }}>Ảnh Hồ Sơ Admin</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2, mb: 2, border: '1px dashed', borderColor: 'error.main' }}>
            <Typography variant="subtitle2" fontWeight={700} color="error.main" gutterBottom>Lưu ý hệ thống:</Typography>
            <Typography variant="body2" color="text.secondary">• Dùng ảnh chân dung rõ mặt.</Typography>
            <Typography variant="body2" color="text.secondary">• Định dạng: JPEG, PNG (Max 5MB).</Typography>
          </Box>
          <Button variant="outlined" color="error" component="label" fullWidth startIcon={<CloudUploadOutlinedIcon />} sx={{ py: 1.5, borderStyle: 'dashed', borderRadius: '10px', fontWeight: 700 }}>
            Chọn ảnh từ máy tính
            <input type="file" accept="image/jpeg, image/png" hidden onChange={handleFileChange} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowAvatarModal(false)} color="inherit" sx={{ fontWeight: 700, borderRadius: '10px' }}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled" sx={{ width: "100%", borderRadius: '12px' }}>{toast.message}</Alert>
      </Snackbar>
    </PageWrapper>
  );
}

export default memo(AdminProfilePage);