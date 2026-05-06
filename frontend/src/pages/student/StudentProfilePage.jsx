import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getUserProfile, updateUserProfile, changePassword } from "../../services/UserService"; 

import {
  Box, Typography, Paper, CircularProgress, Alert, Snackbar,
  Avatar, Button, TextField, Chip, Divider, IconButton, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Stack, Grid, useTheme, InputAdornment
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

import {
  CameraAlt as CameraAltIcon,
  SaveOutlined as SaveOutlinedIcon,
  EmailOutlined as EmailOutlinedIcon,
  CalendarToday as CalendarTodayIcon,
  InfoOutlined as InfoOutlinedIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  LockResetOutlined as LockResetOutlinedIcon,
  Visibility,
  VisibilityOff
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

  // --- States Profile ---
  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "", email: "", username: "", role: "", avata_url: "", createAt: "", student: { school: "", dob: "" }
  });
  const [formData, setFormData] = useState({ fname: "", mname: "", lname: "", school: "", dob: "", avata: null });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // --- States Đổi Mật Khẩu ---
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  const token = localStorage.getItem("token");

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
        const data = await getUserProfile(userId, token);
        const schoolVal = data.student?.school || "";
        const dobVal = data.student?.dob ? data.student.dob.split("T")[0] : "";
        setSavedUser({ ...data, student: { ...data.student, school: schoolVal, dob: dobVal } });
        setFormData({ fname: data.fname || "", mname: data.mname || "", lname: data.lname || "", school: schoolVal, dob: dobVal, avata: null });
      } catch (error) {
        setToast({ open: true, message: "Lỗi tải thông tin.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, token]);

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
    setSavedUser(prev => ({ ...prev, avata_url: URL.createObjectURL(file) }));
    setFormData(prev => ({ ...prev, avata: file }));
    setShowAvatarModal(false);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      const userId = jwtDecode(token).sub || jwtDecode(token).uid;
      const formPayload = new FormData();
      formPayload.append("fname", formData.fname);
      formPayload.append("mname", formData.mname);
      formPayload.append("lname", formData.lname);
      formPayload.append("school", formData.school);
      formPayload.append("dob", formData.dob ? new Date(formData.dob).toISOString() : "");
      if (formData.avata) formPayload.append("avata", formData.avata);

      await updateUserProfile(userId, formPayload, token);
      setSavedUser(prev => ({ ...prev, fname: formData.fname, mname: formData.mname, lname: formData.lname, student: { ...prev.student, school: formData.school, dob: formData.dob } }));
      setToast({ open: true, message: "Cập nhật hồ sơ thành công!", severity: "success" });
    } catch (error) {
      setToast({ open: true, message: "Cập nhật thất bại.", severity: "error" });
    } finally {
      setUpdating(false);
    }
  };

  // --- Handlers Đổi Mật Khẩu ---
  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (!/[a-z]/.test(password)) return "Mật khẩu phải chứa ít nhất 1 chữ thường";
    if (!/[A-Z]/.test(password)) return "Mật khẩu phải chứa ít nhất 1 chữ hoa";
    if (!/\d/.test(password)) return "Mật khẩu phải chứa ít nhất 1 số";
    if (!/[@$!%*?&]/.test(password)) return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)";
    return "";
  };

  const submitChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setToast({ open: true, message: "Mật khẩu xác nhận không khớp!", severity: "error" });
    }
    const passwordError = validatePassword(passwordForm.newPassword);
    if (passwordError) {
      return setToast({ open: true, message: passwordError, severity: "warning" });
    }

    try {
      setChangingPassword(true);
      const userId = jwtDecode(token).sub || jwtDecode(token).uid;
      await changePassword(userId, {
        current_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
        confirm_new_password: passwordForm.confirmPassword
      }, token);
      
      setToast({ open: true, message: "Đổi mật khẩu thành công!", severity: "success" });
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Đổi mật khẩu thất bại.";
      const finalMessage = Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage;
      setToast({ open: true, message: finalMessage, severity: "error" });
    } finally {
      setChangingPassword(false);
    }
  };

  const renderPasswordAdornment = (field) => (
    <InputAdornment position="end">
      <IconButton onClick={() => togglePasswordVisibility(field)} edge="end">
        {showPasswords[field] ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  if (loading) return <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}><CircularProgress color="info" /></PageWrapper>;

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
        <Grid size={{ xs: 12, md: 4 }}>
          <ProfileCard elevation={0}>
            <CoverBackground />
            <Box sx={{ px: 3, pb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -7 }}>
              <Badge
                overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton onClick={() => setShowAvatarModal(true)} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'action.hover' }, width: 36, height: 36 }}>
                    <CameraAltIcon fontSize="small" color="info" />
                  </IconButton>
                }
              >
                <Avatar src={savedUser.avata_url || ""} sx={{ width: 120, height: 120, border: `4px solid ${theme.palette.background.paper}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', fontSize: '3rem', fontWeight: 700 }}>
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
                <TextField fullWidth label="Ngày sinh" type="date" name="dob" value={formData.dob} onChange={handleInputChange} size="small" InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Trường học" name="school" value={formData.school} onChange={handleInputChange} size="small" placeholder="Nhập tên trường học..." sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />
              </Grid>
            </Grid>

            {/* BỘ NÚT ACTIONS */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" color="info" size="large" onClick={() => setShowPasswordModal(true)}
                startIcon={<LockResetOutlinedIcon />} 
                sx={{ px: 3, py: 1.5, borderRadius: '12px', fontWeight: 700, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Đổi Mật Khẩu
              </Button>
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

      {/* MODAL CẬP NHẬT ẢNH */}
      <Dialog open={showAvatarModal} onClose={() => setShowAvatarModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>Thay Ảnh Đại Diện</DialogTitle>
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

      {/* MODAL ĐỔI MẬT KHẨU */}
      <Dialog open={showPasswordModal} onClose={() => !changingPassword && setShowPasswordModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', pb: 2, color: 'info.main' }}>
          Đổi Mật Khẩu
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Stack spacing={3}>
            <TextField 
              fullWidth type={showPasswords.old ? "text" : "password"} label="Mật khẩu hiện tại" name="oldPassword" 
              value={passwordForm.oldPassword} onChange={handlePasswordChange} 
              InputProps={{ endAdornment: renderPasswordAdornment('old') }}
            />
            <TextField 
              fullWidth type={showPasswords.new ? "text" : "password"} label="Mật khẩu mới" name="newPassword" 
              value={passwordForm.newPassword} onChange={handlePasswordChange} 
              InputProps={{ endAdornment: renderPasswordAdornment('new') }}
              helperText="Ít nhất 8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt"
            />
            <TextField 
              fullWidth type={showPasswords.confirm ? "text" : "password"} label="Xác nhận mật khẩu mới" name="confirmPassword" 
              value={passwordForm.confirmPassword} onChange={handlePasswordChange} 
              InputProps={{ endAdornment: renderPasswordAdornment('confirm') }}
              error={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== ""}
              helperText={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== "" ? "Mật khẩu xác nhận không khớp" : ""}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button onClick={() => { setShowPasswordModal(false); setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); }} color="inherit" disabled={changingPassword} sx={{ fontWeight: 700, borderRadius: '10px' }}>
            Hủy
          </Button>
          <Button 
            onClick={submitChangePassword} variant="contained" color="info" 
            disabled={changingPassword || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
            sx={{ fontWeight: 700, borderRadius: '10px' }} startIcon={changingPassword && <CircularProgress size={20} color="inherit" />}
          >
            {changingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled" sx={{ width: "100%", borderRadius: '12px' }}>{toast.message}</Alert>
      </Snackbar>
    </PageWrapper>
  );
}

export default memo(StudentProfilePage);