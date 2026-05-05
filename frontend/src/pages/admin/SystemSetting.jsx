import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Box, Typography, Paper, Grid, Switch, FormControlLabel,
  Button, Stack, Divider, CircularProgress, Alert, Snackbar
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import SaveIcon from '@mui/icons-material/Save';
import { getSystemConfig, updateSystemConfig } from "../../services/SystemConfigService";

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
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
    }
  };
});

const mockSettings = {
  maintenanceMode: false,
  allowRegistration: true,
  requireTutorApproval: true,
  requireContentApproval: false,
};

const SettingsCard = memo(({ title, children }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        height: '100%', 
        borderRadius: '16px',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
        backgroundColor: theme.palette.background.paper,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: isDark 
            ? `0 0 24px ${alpha(theme.palette.primary.main, 0.1)}` 
            : `0 8px 24px ${alpha(theme.palette.common.black, 0.04)}`
        }
      }}
    >
      <Typography variant="h6" component="h3" fontWeight={700} gutterBottom color="text.primary">
        {title}
      </Typography>
      <Stack spacing={1}>
        {children}
      </Stack>
    </Paper>
  );
});

const SettingToggle = memo(({ name, label, caption, checked, onChange }) => (
  <Box sx={{ py: 1 }}>
    <FormControlLabel
      control={<Switch checked={Boolean(checked)} onChange={onChange} name={name} color="primary" />}
      label={<Typography fontWeight={600} color="text.primary">{label}</Typography>}
    />
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: '2px', mt: 0.5, lineHeight: 1.5 }}>
      {caption}
    </Typography>
  </Box>
));

const SystemSettings = memo(() => {
  const [settings, setSettings] = useState(mockSettings);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "" });

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSettings = await getSystemConfig();
      setSettings(fetchedSettings);
    } catch (err) {
      setError("Không thể tải cài đặt.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleChange = useCallback((event) => {
    const { name, checked } = event.target;
    const keyMap = {
      maintenanceMode: "maintenance_mode",
      allowRegistration: "register_allowance",
      requireTutorApproval: "profile_preview",
      requireContentApproval: "document_check",
    };
    const key = keyMap[name] || name;

    setSettings((prev) => {
      const currentSetting = prev[key];
      if (currentSetting && typeof currentSetting === "object" && "enabled" in currentSetting) {
        return {
          ...prev,
          [key]: {
            ...currentSetting,
            enabled: checked,
          },
        };
      }
      return {
        ...prev,
        [key]: checked,
      };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateSystemConfig(settings);
      setToast({ open: true, message: "Cài đặt đã được lưu." });
    } catch (err) {
      setError("Lỗi khi lưu cài đặt.");
    } finally {
      setIsSubmitting(false);
    }
  }, [settings]);

  const handleCloseToast = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setToast(prev => ({ ...prev, open: false }));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageWrapper>
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight={700} color="text.primary" sx={{ letterSpacing: -0.5 }}>
          Cài đặt hệ thống
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Quản lý các cấu hình cốt lõi và quy trình duyệt của hệ thống
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsCard title="Cài đặt Chung">
            <SettingToggle
              name="maintenanceMode"
              label="Chế độ bảo trì"
              caption="Bật để tạm khóa trang web với người dùng (trừ Admin)."
              checked={settings?.maintenance_mode?.enabled}
              onChange={handleChange}
            />
            <Divider sx={{ my: 1.5 }} />
            <SettingToggle
              name="allowRegistration"
              label="Cho phép đăng ký mới"
              caption="Cho phép người dùng mới (Học sinh, Gia sư) tự tạo tài khoản."
              checked={settings?.register_allowance?.enabled}
              onChange={handleChange}
            />
          </SettingsCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsCard title="Cài đặt Duyệt (Workflow)">
            <SettingToggle
              name="requireTutorApproval"
              label="Yêu cầu duyệt Gia sư"
              caption="Gia sư mới đăng ký phải được Admin duyệt thủ công (hiển thị ở Dashboard)."
              checked={settings?.profile_preview?.enabled}
              onChange={handleChange}
            />
            <Divider sx={{ my: 1.5 }} />
            <SettingToggle
              name="requireContentApproval"
              label="Yêu cầu duyệt Nội dung"
              caption="Câu hỏi/Tài liệu mới của Gia sư phải được Admin duyệt."
              checked={settings?.document_check?.enabled}
              onChange={handleChange}
            />
          </SettingsCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          disableElevation
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{ borderRadius: '12px', fontWeight: 700, px: 4, py: 1.5 }}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </Box>

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
          sx={{ width: "100%", borderRadius: '12px', fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
});

export default SystemSettings;