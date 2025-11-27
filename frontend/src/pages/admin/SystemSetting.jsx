import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SaveIcon from '@mui/icons-material/Save';

// --- Styled Component (Giống các trang khác của bạn) ---
const PageWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor:
    theme.palette.mode === "light"
      ? theme.palette.grey[50]
      : theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
}));

// --- Mock Data cho cài đặt ban đầu ---
const mockSettings = {
  maintenanceMode: false,
  allowRegistration: true,
  requireTutorApproval: true,
  requireContentApproval: false,
};
// -------------------------------------

/**
 * Component con cho mỗi nhóm cài đặt
 */
const SettingsCard = memo(({ title, children }) => (
    <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" component="h3" fontWeight={600} gutterBottom>
            {title}
        </Typography>
        <Stack spacing={1}>
            {children}
        </Stack>
    </Paper>
));

/**
 * Component con cho mỗi dòng cài đặt
 */
const SettingToggle = memo(({ name, label, caption, checked, onChange }) => (
    <Box>
        <FormControlLabel
            control={
                <Switch
                    checked={checked}
                    onChange={onChange}
                    name={name}
                />
            }
            label={
                <Typography fontWeight={500}>{label}</Typography>
            }
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: '2px' }}>
            {caption}
        </Typography>
    </Box>
));


// --- Component chính ---
export default function SystemSettings() {
  const [settings, setSettings] = useState(mockSettings);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "" });

  // Giả lập việc tải cài đặt ban đầu
  useEffect(() => {
    setLoading(true);
    setError(null);
    //
    // --- API THẬT SẼ GỌI Ở ĐÂY ---
    // try {
    //   const token = localStorage.getItem('token');
    //   const fetchedSettings = await getSystemSettings(token);
    //   setSettings(fetchedSettings);
    // } catch (err) {
    //   setError("Không thể tải cài đặt.");
    // } finally {
    //   setLoading(false);
    // }
    //
    
    // --- Giả lập (Mock) ---
    setTimeout(() => {
      setSettings(mockSettings); // Tải mock data
      setLoading(false);
    }, 500);
  }, []);

  const handleChange = (event) => {
    const { name, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Giả lập việc lưu
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    //
    // --- API THẬT SẼ GỌI Ở ĐÂY ---
    // try {
    //   const token = localStorage.getItem('token');
    //   await saveSystemSettings(settings, token);
    //   setToast({ open: true, message: "Cài đặt đã được lưu." });
    // } catch (err) {
    //   setError("Lỗi khi lưu cài đặt.");
    // } finally {
    //   setIsSubmitting(false);
    // }
    //

    // --- Giả lập (Mock) ---
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setToast({ open: true, message: "Cài đặt đã được lưu (Giả lập)." });
    console.log("Saving settings:", settings);
  };

  const handleCloseToast = (event, reason) => {
    if (reason === "clickaway") return;
    setToast(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  return (
    <PageWrapper>
      <Typography variant="h4" component="h1" fontWeight="bold" mb={4}>
        Cài đặt Hệ thống
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        
        {/* Cột 1: Cài đặt Chung */}
        <Grid item xs={12} md={6}>
            <SettingsCard title="Cài đặt Chung">
                <SettingToggle
                    name="maintenanceMode"
                    label="Chế độ bảo trì"
                    caption="Bật để tạm khóa trang web với người dùng (trừ Admin)."
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                />
                <Divider sx={{ my: 1.5 }} />
                <SettingToggle
                    name="allowRegistration"
                    label="Cho phép đăng ký mới"
                    caption="Cho phép người dùng mới (Học sinh, Gia sư) tự tạo tài khoản."
                    checked={settings.allowRegistration}
                    onChange={handleChange}
                />
            </SettingsCard>
        </Grid>

        {/* Cột 2: Cài đặt Duyệt */}
        <Grid item xs={12} md={6}>
            <SettingsCard title="Cài đặt Duyệt (Workflow)">
                <SettingToggle
                    name="requireTutorApproval"
                    label="Yêu cầu duyệt Gia sư"
                    caption="Gia sư mới đăng ký phải được Admin duyệt thủ công (hiển thị ở Dashboard)."
                    checked={settings.requireTutorApproval}
                    onChange={handleChange}
                />
                <Divider sx={{ my: 1.5 }} />
                <SettingToggle
                    name="requireContentApproval"
                    label="Yêu cầu duyệt Nội dung"
                    caption="Câu hỏi/Tài liệu mới của Gia sư phải được Admin duyệt (status='pending')."
                    checked={settings.requireContentApproval}
                    onChange={handleChange}
                />
            </SettingsCard>
        </Grid>
      </Grid>

      {/* Nút Lưu */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
      </Box>

      {/* Thông báo (Toast) */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

    </PageWrapper>
  );
}