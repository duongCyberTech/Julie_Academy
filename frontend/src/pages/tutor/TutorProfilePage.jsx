import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Box, Typography, Paper, CircularProgress, Alert, Snackbar,
  Avatar, Button, TextField, Chip, Divider, IconButton, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Stack, Grid, useTheme
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
      boxShadow: isDark ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}` : '0px 12px 24px rgba(0,0,0,0.06)',
      borderColor: theme.palette.primary.main,
    }
  }
});

const CoverBackground = styled(Box)(({ theme }) => ({
  height: 120,
  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  position: 'relative',
}));

function TutorProfilePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "", email: "", username: "", role: "", avata_url: "", createAt: "", experiences: "", phone_number: ""
  });
  const [formData, setFormData] = useState({ fname: "", mname: "", lname: "", phone_number: "", experiences: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const API_URL = "http://localhost:4000";
  const token = localStorage.getItem("token");

  const getAuthConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      let userId = null;
      if (token) {
        try {
          userId = jwtDecode(token).sub || jwtDecode(token).uid;
        } catch (error) {}
      }
      if (!token || !userId) return navigate("/login");

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/${userId}`, getAuthConfig());
        const data = response.data;
        const phoneVal = data.tutor?.phone_number || data.phone_number || "";
        const expVal = data.tutor?.experiences || "";

        setSavedUser({ ...data, phone_number: phoneVal, experiences: expVal });
        setFormData({ fname: data.fname || "", mname: data.mname || "", lname: data.lname || "", phone_number: phoneVal, experiences: expVal });
      } catch (error) {
        setToast({ open: true, message: "Lỗi tải thông tin.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, token, getAuthConfig]);

  const profileCompleteness = useMemo(() => {
    let score = 0;
    if (savedUser.fname || savedUser.lname) score += 25;
    if (savedUser.email) score += 25;
    if (savedUser.phone_number) score += 25;
    if (savedUser.experiences) score += 25;
    return score;
  }, [savedUser]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setToast({ open: true, message: "Ảnh quá lớn (Max 5MB)", severity: "warning" });

    const userId = jwtDecode(token).sub || jwtDecode(token).uid;
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/users/${userId}/avatar`, uploadData, {
        headers: { ...getAuthConfig().headers, "Content-Type": "multipart/form-data" },
      });
      if (res.data) {
        setSavedUser(prev => ({ ...prev, avata_url: res.data.avata_url || URL.createObjectURL(file) }));
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
      const userId = jwtDecode(token).sub || jwtDecode(token).uid;
      await axios.patch(`${API_URL}/users/${userId}`, formData, getAuthConfig());
      setSavedUser(prev => ({ ...prev, ...formData }));
      setToast({ open: true, message: "Cập nhật hồ sơ thành công!", severity: "success" });
    } catch (error) {
      setToast({ open: true, message: "Cập nhật thất bại. Vui lòng thử lại.", severity: "error" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></PageWrapper>;

  return (
    <PageWrapper>
      <HeaderBar>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">Hồ sơ giảng dạy</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
            Quản lý thông tin cá nhân và giới thiệu bản thân đến học viên.
          </Typography>
        </Box>
      </HeaderBar>

      <Grid container spacing={3}>
        {/* CỘT TRÁI */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ProfileCard elevation={0}>
            <CoverBackground />
            <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -7 }}>
              <Badge
                overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton onClick={() => setShowAvatarModal(true)} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'action.hover' }, width: 36, height: 36 }}>
                    <CameraAltIcon fontSize="small" color="primary" />
                  </IconButton>
                }
              >
                <Avatar src={savedUser.avata_url || ""} sx={{ width: 120, height: 120, border: `4px solid ${theme.palette.background.paper}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: '3rem', fontWeight: 700 }}>
                  {savedUser.fname?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Badge>

              <Typography variant="h6" fontWeight="700" sx={{ mt: 2, textAlign: 'center' }}>
                {[savedUser.lname, savedUser.mname, savedUser.fname].filter(Boolean).join(" ")}
              </Typography>
              
              <Stack direction="row" spacing={1} mt={1} mb={3}>
                <Chip label="GIA SƯ" color="primary" size="small" icon={<SchoolOutlinedIcon />} sx={{ fontWeight: 700 }} />
                {savedUser.phone_number && <Chip label="Xác thực" color="success" size="small" variant="outlined" icon={<VerifiedUserOutlinedIcon />} sx={{ fontWeight: 600 }} />}
              </Stack>

              <Box sx={{ width: '100%', mb: 4, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" fontWeight={700}>Độ hoàn thiện</Typography>
                  <Typography variant="caption" fontWeight={700} color={profileCompleteness === 100 ? 'success.main' : 'primary.main'}>{profileCompleteness}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={profileCompleteness} color={profileCompleteness === 100 ? "success" : "primary"} sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box sx={{ width: '100%', textAlign: 'left' }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>LIÊN HỆ</Typography>
                <Stack spacing={1.5} mt={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover' }}><EmailOutlinedIcon fontSize="small" color="primary" /></Avatar>
                    <Typography variant="body2" fontWeight={600} noWrap>{savedUser.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover' }}><PhoneOutlinedIcon fontSize="small" color="primary" /></Avatar>
                    <Typography variant="body2" fontWeight={600}>{savedUser.phone_number || "Chưa cập nhật"}</Typography>
                  </Box>
                </Stack>
              </Box>

              {savedUser.experiences && (
                <Box sx={{ width: '100%', textAlign: 'left', mt: 4 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>KINH NGHIỆM</Typography>
                  <Paper elevation={0} sx={{ p: 2, mt: 1, bgcolor: alpha(theme.palette.success.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.2), borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.6, color: 'text.secondary', fontWeight: 500 }}>{savedUser.experiences}</Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          </ProfileCard>
        </Grid>

        {/* CỘT PHẢI */}
        <Grid size={{ xs: 12, md: 8 }}>
          <ProfileCard elevation={0} sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="700" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
              <InfoOutlinedIcon /> Thông tin cơ bản
            </Typography>

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
                <TextField fullWidth label="Email đăng nhập" value={savedUser.email || ""} disabled size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} helperText="Email không thể thay đổi." />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Số điện thoại liên hệ" name="phone_number" value={formData.phone_number} onChange={handleInputChange} size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />
              </Grid>
              <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" fontWeight="700" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                  <WorkHistoryOutlinedIcon /> Giới thiệu & Kinh nghiệm
                </Typography>
                <TextField fullWidth multiline rows={6} name="experiences" value={formData.experiences} onChange={handleInputChange} size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} placeholder={`- Nơi công tác...\n- Bằng cấp...\n- Thành tích...`} />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" size="large" onClick={handleSave} disabled={updating} startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveOutlinedIcon />} sx={{ px: 4, py: 1.5, borderRadius: '12px', fontWeight: 700 }}>
                {updating ? "Đang lưu..." : "Lưu Thay Đổi"}
              </Button>
            </Box>
          </ProfileCard>
        </Grid>
      </Grid>

      <Dialog open={showAvatarModal} onClose={() => setShowAvatarModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>Cập Nhật Ảnh Đại Diện</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, mb: 2, border: '1px dashed', borderColor: 'primary.main' }}>
            <Typography variant="subtitle2" fontWeight={700} color="primary.main" gutterBottom>Lưu ý định dạng:</Typography>
            <Typography variant="body2" color="text.secondary">• Hỗ trợ ảnh: JPEG, PNG</Typography>
            <Typography variant="body2" color="text.secondary">• Dung lượng tối đa: 5MB</Typography>
          </Box>
          <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadOutlinedIcon />} sx={{ py: 1.5, borderStyle: 'dashed', borderRadius: '10px', fontWeight: 700 }}>
            Chọn ảnh từ máy tính
            <input type="file" accept="image/jpeg, image/png" hidden onChange={handleFileChange} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowAvatarModal(false)} color="inherit" sx={{ fontWeight: 700, borderRadius: '10px' }}>Hủy Bỏ</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled" sx={{ width: "100%", borderRadius: '12px' }}>{toast.message}</Alert>
      </Snackbar>
    </PageWrapper>
  );
}

export default memo(TutorProfilePage);