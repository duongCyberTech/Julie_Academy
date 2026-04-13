import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
  CalendarToday as CalendarTodayIcon,
  InfoOutlined as InfoOutlinedIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon
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
      boxShadow: isDark ? `0 0 20px ${alpha(theme.palette.info.main, 0.1)}` : '0px 12px 24px rgba(0,0,0,0.06)',
      borderColor: theme.palette.info.main,
    }
  };
});

const CoverBackground = styled(Box)(({ theme }) => ({
  height: 120,
  background: `linear-gradient(135deg, ${theme.palette.info.light}, ${theme.palette.info.main})`,
  position: 'relative',
}));

function StudentProfilePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "", email: "", username: "", role: "", avata_url: "", createAt: "", student: { school: "", dob: "" }
  });

  const [formData, setFormData] = useState({
    fname: "", mname: "", lname: "", school: "", dob: ""
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

  useEffect(() => {
    const fetchProfile = async () => {
      let userId = null;
      if (token) {
        try { userId = jwtDecode(token).sub || jwtDecode(token).uid; } catch (error) {}
      }

      if (!token || !userId) {
        setToast({ open: true, message: "Phiên đăng nhập hết hạn", severity: "error" });
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/${userId}`, getAuthConfig());
        const data = response.data;

        const schoolVal = data.student?.school || "";
        const dobVal = data.student?.dob ? data.student.dob.split("T")[0] : "";

        setSavedUser({ ...data, student: { ...data.student, school: schoolVal, dob: dobVal } });
        setFormData({
          fname: data.fname || "", mname: data.mname || "", lname: data.lname || "",
          school: schoolVal, dob: dobVal
        });
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
    if (savedUser.student?.school) score += 25;
    if (savedUser.student?.dob) score += 25;
    return score;
  }, [savedUser]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({ open: true, message: "Ảnh quá lớn! Vui lòng chọn ảnh < 5MB", severity: "warning" });
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
      const payload = {
        fname: formData.fname, mname: formData.mname, lname: formData.lname,
        school: formData.school, dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      };

      await axios.patch(`${API_URL}/users/${userId}`, payload, getAuthConfig());

      setSavedUser(prev => ({
        ...prev, fname: formData.fname, mname: formData.mname, lname: formData.lname,
        student: { ...prev.student, school: formData.school, dob: formData.dob }
      }));
      setToast({ open: true, message: "Cập nhật hồ sơ thành công!", severity: "success" });
    } catch (error) {
      setToast({ open: true, message: "Cập nhật thất bại.", severity: "error" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}><CircularProgress color="info" /></PageWrapper>;
  }

  return (
    <PageWrapper>
      <HeaderBar>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">Hồ sơ học sinh</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
            Quản lý và cập nhật thông tin hồ sơ học tập của bạn.
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
                    <CameraAltIcon fontSize="small" color="info" />
                  </IconButton>
                }
              >
                <Avatar 
                  src={savedUser.avata_url || ""} 
                  sx={{ width: 120, height: 120, border: `4px solid ${theme.palette.background.paper}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', fontSize: '3rem', fontWeight: 700 }}
                >
                  {savedUser.fname?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Badge>

              <Typography variant="h6" fontWeight="700" sx={{ mt: 2, textAlign: 'center' }}>
                {[savedUser.lname, savedUser.mname, savedUser.fname].filter(Boolean).join(" ")}
              </Typography>
              
              <Stack direction="row" spacing={1} mt={1} mb={3}>
                <Chip label={savedUser.role || "HỌC SINH"} color="info" size="small" icon={<SchoolOutlinedIcon />} sx={{ fontWeight: 700 }} />
              </Stack>

              <Box sx={{ width: '100%', mb: 4, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" fontWeight={700}>Độ hoàn thiện</Typography>
                  <Typography variant="caption" fontWeight={700} color={profileCompleteness === 100 ? 'success.main' : 'info.main'}>{profileCompleteness}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={profileCompleteness} color={profileCompleteness === 100 ? "success" : "info"} sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box sx={{ width: '100%', textAlign: 'left' }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>THÔNG TIN CƠ BẢN</Typography>
                <Stack spacing={1.5} mt={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover' }}><EmailOutlinedIcon fontSize="small" color="info" /></Avatar>
                    <Typography variant="body2" fontWeight={600} noWrap>{savedUser.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover' }}><SchoolOutlinedIcon fontSize="small" color="info" /></Avatar>
                    <Typography variant="body2" fontWeight={600}>{savedUser.student?.school || "Chưa cập nhật trường"}</Typography>
                  </Box>
                  {savedUser.createAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover' }}><CalendarTodayIcon fontSize="small" color="info" /></Avatar>
                      <Typography variant="body2" fontWeight={600}>Gia nhập: {new Date(savedUser.createAt).toLocaleDateString("vi-VN")}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Box>
          </ProfileCard>
        </Grid>

        {/* ================================================= */}
        {/* CỘT PHẢI */}
        {/* ================================================= */}
        <Grid size={{ xs: 12, md: 8 }}>
          <ProfileCard elevation={0} sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="700" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'info.main' }}>
              <InfoOutlinedIcon /> Thông Tin Cá Nhân
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Email (Không thể thay đổi)" value={savedUser.email || ""} disabled size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Tên đăng nhập" value={savedUser.username || ""} disabled size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />
              </Grid>

              <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  fullWidth label="Ngày sinh" type="date" name="dob" value={formData.dob} onChange={handleInputChange} 
                  size="small" InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'background.paper', borderRadius: 1 }} 
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  fullWidth label="Trường học" name="school" value={formData.school} onChange={handleInputChange} 
                  size="small" placeholder="Nhập tên trường học..." sx={{ bgcolor: 'background.paper', borderRadius: 1 }} 
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" color="info" size="large" onClick={handleSave} disabled={updating} 
                startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveOutlinedIcon />} 
                sx={{ px: 4, py: 1.5, borderRadius: '12px', fontWeight: 700 }}
              >
                {updating ? "Đang lưu..." : "Lưu Thay Đổi"}
              </Button>
            </Box>
          </ProfileCard>
        </Grid>
      </Grid>

      {/* DIALOG UPLOAD ẢNH */}
      <Dialog open={showAvatarModal} onClose={() => setShowAvatarModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>Thay Ảnh Đại Diện</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2, mb: 2, border: '1px dashed', borderColor: 'info.main' }}>
            <Typography variant="subtitle2" fontWeight={700} color="info.main" gutterBottom>Lưu ý định dạng:</Typography>
            <Typography variant="body2" color="text.secondary">• Hỗ trợ ảnh: JPEG, PNG</Typography>
            <Typography variant="body2" color="text.secondary">• Dung lượng tối đa: 5MB</Typography>
            <Typography variant="body2" color="text.secondary">• Nên dùng ảnh vuông để hiển thị đẹp nhất.</Typography>
          </Box>
          <Button variant="outlined" color="info" component="label" fullWidth startIcon={<CloudUploadOutlinedIcon />} sx={{ py: 1.5, borderStyle: 'dashed', borderRadius: '10px', fontWeight: 700 }}>
            Chọn ảnh từ máy tính
            <input type="file" accept="image/jpeg, image/png" hidden onChange={handleFileChange} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowAvatarModal(false)} color="inherit" sx={{ fontWeight: 700, borderRadius: '10px' }}>Hủy Bỏ</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled" sx={{ width: "100%", borderRadius: '12px' }}>{toast.message}</Alert>
      </Snackbar>
    </PageWrapper>
  );
}

export default memo(StudentProfilePage);