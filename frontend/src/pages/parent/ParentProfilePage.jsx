import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
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
  PhoneOutlined as PhoneOutlinedIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  FamilyRestroom as FamilyRestroomIcon,
  InfoOutlined as InfoOutlinedIcon,
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

function ParentProfilePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  // --- States Profile ---
  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "", email: "", role: "", avata_url: "", createAt: "", phone_number: ""
  });
  const [formData, setFormData] = useState({ fname: "", mname: "", lname: "", phone_number: "", avata: null });
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
      if (!token || !userId) return navigate("/login");

      try {
        setLoading(true);
        const data = await getUserProfile(userId, token);
        const phoneVal = data.parents?.phone_number || data.phone_number || "";
        setSavedUser({ ...data, phone_number: phoneVal });
        setFormData({ fname: data.fname || "", mname: data.mname || "", lname: data.lname || "", phone_number: phoneVal, avata: null });
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
    if (savedUser.fname || savedUser.lname) score += 30;
    if (savedUser.email) score += 30;
    if (savedUser.phone_number) score += 40;
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
      formPayload.append("phone_number", formData.phone_number);
      if (formData.avata) formPayload.append("avata", formData.avata);

      await updateUserProfile(userId, formPayload, token);
      setSavedUser(prev => ({ ...prev, fname: formData.fname, mname: formData.mname, lname: formData.lname, phone_number: formData.phone_number }));
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

  if (loading) return <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></PageWrapper>;

  return (
    <PageWrapper>
      <HeaderBar>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">Hồ sơ phụ huynh</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
            Quản lý thông tin cá nhân và phương thức liên lạc.
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
                    <CameraAltIcon fontSize="small" color="primary" />
                  </IconButton>
                }
              >
                <Avatar src={savedUser.avata_url || ""} sx={{ width: 120, height: 120, border: `4px solid ${theme.palette.background.paper}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: '3rem', fontWeight: 700 }}>
                  {savedUser.lname?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Badge>

              <Typography variant="h6" fontWeight="700" sx={{ mt: 2, textAlign: 'center' }}>
                {[savedUser.lname, savedUser.mname, savedUser.fname].filter(Boolean).join(" ")}
              </Typography>
              
              <Stack direction="row" spacing={1} mt={1} mb={3}>
                <Chip label="PHỤ HUYNH" color="primary" size="small" icon={<FamilyRestroomIcon />} sx={{ fontWeight: 700 }} />
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
                    <Typography variant="body2" fontWeight={600} color={savedUser.phone_number ? 'text.primary' : 'text.secondary'}>
                      {savedUser.phone_number || "Chưa cập nhật SĐT"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </ProfileCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <ProfileCard elevation={0} sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="700" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
              <InfoOutlinedIcon /> Cập nhật thông tin
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
                <TextField fullWidth label="Email đăng nhập" value={savedUser.email || ""} disabled size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} helperText="Email được dùng để đăng nhập và không thể thay đổi." />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Số điện thoại liên hệ" name="phone_number" value={formData.phone_number} onChange={handleInputChange} size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} placeholder="Ví dụ: 0912345678" helperText="* Giáo viên sẽ ưu tiên liên hệ qua số điện thoại này." />
              </Grid>
            </Grid>

            {/* BỘ NÚT ACTIONS */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" color="primary" size="large" onClick={() => setShowPasswordModal(true)}
                startIcon={<LockResetOutlinedIcon />} 
                sx={{ px: 3, py: 1.5, borderRadius: '12px', fontWeight: 700, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Đổi Mật Khẩu
              </Button>
              <Button 
                variant="contained" size="large" onClick={handleSave} disabled={updating} 
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

      {/* MODAL ĐỔI MẬT KHẨU */}
      <Dialog open={showPasswordModal} onClose={() => !changingPassword && setShowPasswordModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', pb: 2, color: 'primary.main' }}>
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
            onClick={submitChangePassword} variant="contained" color="primary" 
            disabled={changingPassword || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
            sx={{ fontWeight: 700, borderRadius: '10px' }} startIcon={changingPassword && <CircularProgress size={20} color="inherit" />}
          >
            {changingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled" sx={{ width: "100%", borderRadius: '12px' }}>{toast.message}</Alert>
      </Snackbar>
    </PageWrapper>
  );
}

export default memo(ParentProfilePage);