import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Box, Typography, Paper, Button, Stack, Switch,
  IconButton, Dialog, TextField, MenuItem, Snackbar, Alert, Grid, Tooltip, useTheme,
  AppBar, Toolbar, Card, CardContent, CardActions, Divider, Slide, Chip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import AddTaskIcon from '@mui/icons-material/AddTask';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PostAddIcon from '@mui/icons-material/PostAdd';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import {
  getAllEmailChains, createEmailChain, updateEmailChain, deleteEmailChain
} from '../../services/EmailService';

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

const HeaderBar = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
}));

const ColumnCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    backgroundColor: theme.palette.background.paper,
    backgroundImage: 'none',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`,
    boxShadow: isDark ? 'none' : '0px 4px 12px rgba(0,0,0,0.02)',
    transition: 'all 0.3s',
    overflow: 'hidden',
    '&:hover': {
      boxShadow: isDark ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}` : '0px 12px 24px rgba(0,0,0,0.06)',
      borderColor: theme.palette.primary.main,
    },
  };
});

const CardHeader = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
    backgroundColor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    flexShrink: 0,
  };
});

const CardBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flexGrow: 1,
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
}));

const CardFooter = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    padding: theme.spacing(2, 3),
    borderTop: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
    backgroundColor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.grey[50], 0.8),
    flexShrink: 0,
    marginTop: 'auto',
  };
});

const StepBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    width: 36,
    height: 36,
    borderRadius: '10px',
    backgroundColor: active ? theme.palette.primary.main : (isDark ? alpha(theme.palette.text.secondary, 0.2) : theme.palette.grey[200]),
    color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
    flexShrink: 0,
    boxShadow: active ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
  };
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MOCK_TEMPLATES = [
  { template_id: 't1', title: 'Thông báo nghỉ học', type: 'public', body: 'Kính gửi Phụ huynh và các em học sinh,\n\nDo điều kiện khách quan, lớp học ngày [Ngày] sẽ được nghỉ. Lịch học bù sẽ được thông báo sau.\n\nTrân trọng,' },
  { template_id: 't2', title: 'Nhắc nhở làm bài tập', type: 'public', body: 'Chào các em,\n\nNhắc nhở các em hoàn thành bài tập về nhà [Tên bài tập] trước buổi học ngày mai.\n\nChúc các em học tốt!' },
  { template_id: 't3', title: 'Báo cáo tiến độ tháng', type: 'private', body: 'Kính gửi Phụ huynh,\n\nĐây là báo cáo tiến độ học tập tháng [Tháng] của em...\n\nTrân trọng,' }
];

const initialForm = {
  header: '',
  body: '',
  period: 'none',
  time_to_send: '08:00',
  day_of_week: 1,
  day_of_month: 1,
  active: true,
  use_template: false,
  template_id: null,
  create_as_template: false 
};

const daysOfWeek = [
  { value: 1, label: 'Thứ 2' }, { value: 2, label: 'Thứ 3' }, { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' }, { value: 5, label: 'Thứ 6' }, { value: 6, label: 'Thứ 7' },
  { value: 0, label: 'Chủ nhật' }
];

const daysOfMonth = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `Ngày ${i + 1}` }));

function EmailChainPage({ classId, token }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorStep, setEditorStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const commonInputSx = useMemo(() => ({ bgcolor: 'background.paper', borderRadius: 1 }), []);

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const fetchChains = useCallback(async () => {
    if (!classId) return;
    try {
      setLoading(true);
      const data = await getAllEmailChains(classId, token);
      setChains(data || []);
    } catch (error) {
      showToast("Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, [classId, token, showToast]);

  useEffect(() => {
    fetchChains();
  }, [fetchChains]);

  const handleOpenBuilderNew = useCallback(() => {
    setFormData(initialForm);
    setEditingId(null);
    setEditorStep(1);
    setEditorOpen(true);
  }, []);

  const handleOpenBuilderEdit = useCallback((chain) => {
    setFormData({ ...chain, create_as_template: false });
    setEditingId(chain.config_id);
    setEditorStep(2); 
    setEditorOpen(true);
  }, []);

  const handleCloseBuilder = useCallback(() => {
    setEditorOpen(false);
    setFormData(initialForm);
    setEditingId(null);
  }, []);

  const handleSelectTemplate = useCallback((template) => {
    if (template === 'blank') {
      setFormData({ ...initialForm, use_template: false, template_id: null });
    } else {
      setFormData({ 
        ...initialForm, 
        header: template.title,
        body: template.body, 
        use_template: true, 
        template_id: template.template_id 
      });
    }
    setEditorStep(2);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.header || !formData.body) {
      showToast("Cần nhập đủ tiêu đề và nội dung", "warning");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData };
      if (payload.period !== 'weekly') payload.day_of_week = null;
      if (payload.period !== 'monthly') payload.day_of_month = null;

      if (editingId) {
        const { create_as_template, config_id, class_id, ...updatePayload } = payload;
        await updateEmailChain(editingId, updatePayload, token);
        showToast("Cập nhật thành công");
      } else {
        await createEmailChain(classId, payload, token);
        showToast("Khởi tạo luồng tự động thành công");
      }
      handleCloseBuilder();
      fetchChains();
    } catch (error) {
      showToast("Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  }, [formData, editingId, classId, token, fetchChains, handleCloseBuilder, showToast]);

  const handleToggleActive = useCallback(async (configId, currentActive) => {
    try {
      await updateEmailChain(configId, { active: !currentActive }, token);
      setChains(prev => prev.map(c => c.config_id === configId ? { ...c, active: !currentActive } : c));
      showToast(!currentActive ? 'Đã bật' : 'Đã tạm dừng');
    } catch (error) {
      showToast("Lỗi thay đổi trạng thái", "error");
    }
  }, [token, showToast]);

  const handleDelete = useCallback(async (configId) => {
    if (!window.confirm("Xóa cấu hình này vĩnh viễn?")) return;
    try {
      await deleteEmailChain(configId, token);
      showToast("Đã xóa");
      fetchChains();
    } catch (error) {
      showToast("Lỗi khi xóa", "error");
    }
  }, [token, fetchChains, showToast]);

  return (
    <PageWrapper>
      <HeaderBar>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">Tự động hóa Email</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>Thiết lập các email tự động gửi cho học sinh của lớp học</Typography>
        </Box>
        <Button variant="contained" disableElevation onClick={handleOpenBuilderNew} sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 700 }}>
          Tạo email mới
        </Button>
      </HeaderBar>

      <Alert icon={<InfoOutlinedIcon />} severity="info" sx={{ mb: 4, borderRadius: 2, bgcolor: isDark ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`, alignItems: 'center' }}>
        Hệ thống sẽ thay bạn gửi email nhắc nhở theo lịch trình đã cài đặt. Rất phù hợp để gửi thông báo định kỳ hoặc nhắc nhở làm bài tập trước hạn.
      </Alert>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={3}>
          {chains.length === 0 && !loading && (
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.primary.main, 0.02), border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`, borderRadius: 4 }}>
                <EmailOutlinedIcon sx={{ fontSize: 64, color: alpha(theme.palette.primary.main, 0.4), mb: 2 }} />
                <Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
                  Chưa có email tự động nào
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3} textAlign="center" maxWidth={400}>
                  Tiết kiệm thời gian bằng cách thiết lập các thông báo tự động. Hãy bắt đầu từ thư viện mẫu của chúng tôi.
                </Typography>
                <Button variant="outlined" onClick={handleOpenBuilderNew} sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Khám phá Kho mẫu
                </Button>
              </Paper>
            </Grid>
          )}
          
          {chains.map((chain) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={chain.config_id}>
              <ColumnCard sx={{ borderColor: chain.active ? 'primary.main' : 'divider', opacity: chain.active ? 1 : 0.6 }}>
                <CardHeader sx={{ bgcolor: chain.active ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.action.hover, 0.5) }}>
                  <StepBadge active={chain.active}><EmailOutlinedIcon fontSize="small" /></StepBadge>
                  <Box overflow="hidden" flexGrow={1}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary" noWrap>
                      {chain.header}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color={chain.active ? 'primary.main' : 'text.secondary'} sx={{ textTransform: 'uppercase' }}>
                      {chain.period}
                    </Typography>
                  </Box>
                  <Switch size="small" checked={chain.active} onChange={() => handleToggleActive(chain.config_id, chain.active)} color="primary" />
                </CardHeader>
                <CardBody sx={{ pb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2 }}>
                    {chain.body}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1} mt="auto">
                    <Chip icon={<AccessTimeIcon />} label={chain.time_to_send} size="small" sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.text.secondary, 0.1) }} />
                    {chain.period === 'weekly' && <Chip label={daysOfWeek.find(d => d.value === chain.day_of_week)?.label || 'Thứ 2'} size="small" sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.text.secondary, 0.1) }} />}
                    {chain.period === 'monthly' && <Chip label={`Ngày ${chain.day_of_month}`} size="small" sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.text.secondary, 0.1) }} />}
                  </Stack>
                </CardBody>
                <CardFooter sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                  <Chip label={chain.use_template ? 'Mẫu hệ thống' : 'Tùy chỉnh'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: chain.use_template ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.secondary.main, 0.1), color: chain.use_template ? 'info.main' : 'secondary.main', borderRadius: 1 }} />
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => handleOpenBuilderEdit(chain)} sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" onClick={() => handleDelete(chain.config_id)} sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) }}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                </CardFooter>
              </ColumnCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog fullScreen open={editorOpen} onClose={handleCloseBuilder} TransitionComponent={Transition} PaperProps={{ sx: { bgcolor: isDark ? theme.palette.background.default : '#F4F5F7', backgroundImage: 'none' } }}>
        <AppBar elevation={0} position="sticky" sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.4)}` }}>
          <Toolbar>
            {editorStep === 2 && !editingId ? (
              <IconButton edge="start" onClick={() => setEditorStep(1)} sx={{ mr: 2, color: 'text.primary' }}><ArrowBackIcon /></IconButton>
            ) : (
              <IconButton edge="start" onClick={handleCloseBuilder} sx={{ mr: 2, color: 'text.primary' }}><CloseIcon /></IconButton>
            )}
            <Typography sx={{ ml: 2, flex: 1, fontWeight: 700, color: 'text.primary' }} variant="h6">
              {editingId ? 'Cập nhật Luồng Tự Động' : (editorStep === 1 ? 'Khám phá Thư viện Mẫu' : 'Tùy chỉnh Nội dung & Lên lịch')}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, overflowY: 'auto' }}>
          {editorStep === 1 && (
            <Box maxWidth={1200} mx="auto">
              <Typography variant="h4" fontWeight={700} color="text.primary" mb={1}>Chọn mẫu để bắt đầu</Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>Tiết kiệm thời gian với các mẫu được tinh chỉnh sẵn cho giáo dục.</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card elevation={0} onClick={() => handleSelectTemplate('blank')} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: `2px dashed ${alpha(theme.palette.primary.main, 0.5)}`, bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02), cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), borderColor: 'primary.main', transform: 'translateY(-4px)' } }}>
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, minHeight: 220 }}>
                      <PostAddIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2, opacity: 0.9 }} />
                      <Typography variant="h6" fontWeight={700} color="primary.main">Tạo từ trang trắng</Typography>
                      <Typography variant="caption" color="text.secondary" mt={1}>Soạn nội dung hoàn toàn mới</Typography>
                    </Box>
                  </Card>
                </Grid>
                {MOCK_TEMPLATES.map((tpl) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={tpl.template_id}>
                    <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}`, bgcolor: 'background.paper', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-4px)', boxShadow: isDark ? `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}` : `0 12px 32px ${alpha(theme.palette.primary.main, 0.08)}` } }}>
                      <Box sx={{ bgcolor: isDark ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.grey[100], 0.5), height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}` }}>
                        <EmailOutlinedIcon sx={{ fontSize: 48, color: isDark ? alpha(theme.palette.text.secondary, 0.3) : alpha(theme.palette.text.secondary, 0.2) }} />
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Chip label={tpl.type === 'public' ? 'MẪU HỆ THỐNG' : 'MẪU CÁ NHÂN'} size="small" sx={{ mb: 1.5, fontWeight: 700, fontSize: '0.65rem', borderRadius: 1, bgcolor: tpl.type === 'public' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.info.main, 0.1), color: tpl.type === 'public' ? 'success.main' : 'info.main' }} />
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={1}>{tpl.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {tpl.body}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button fullWidth variant="outlined" onClick={() => handleSelectTemplate(tpl)} sx={{ borderRadius: 2, fontWeight: 700, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
                          Sử dụng mẫu này
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {editorStep === 2 && (
            <Box maxWidth={1400} mx="auto" height="100%">
              <Grid container spacing={3} sx={{ height: '100%', alignItems: 'stretch' }}>
                <Grid size={{ xs: 12, lg: 8 }} sx={{ height: '100%' }}>
                  <ColumnCard>
                    <CardHeader>
                      <StepBadge active={!!formData.header}>1</StepBadge>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">NỘI DUNG EMAIL</Typography>
                        <Typography variant="caption" color="text.secondary">Khu vực soạn thảo</Typography>
                      </Box>
                    </CardHeader>
                    <CardBody sx={{ p: 4 }}>
                      <TextField fullWidth placeholder="Tiêu đề email (Subject)..." variant="standard" name="header" value={formData.header} onChange={handleChange} InputProps={{ disableUnderline: true, sx: { fontSize: '1.5rem', fontWeight: 700, mb: 1, color: 'text.primary' } }} />
                      <Divider sx={{ mb: 4, borderColor: isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.4) }} />
                      <TextField fullWidth multiline placeholder="Viết nội dung truyền cảm hứng tại đây..." variant="standard" name="body" value={formData.body} onChange={handleChange} InputProps={{ disableUnderline: true, sx: { fontSize: '1.05rem', lineHeight: 1.7, color: 'text.secondary' } }} />
                    </CardBody>
                  </ColumnCard>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }} sx={{ position: 'sticky', top: 24, alignSelf: 'flex-start' }}>
                  <ColumnCard sx={{ borderColor: 'primary.main', borderWidth: isDark ? 1 : 2 }}>
                    <CardHeader sx={{ bgcolor: isDark ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.05) }}>
                      <StepBadge active={true}>2</StepBadge>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary.main">LÊN LỊCH & LƯU</Typography>
                        <Typography variant="caption" color="text.secondary">Thiết lập cấu hình gửi</Typography>
                      </Box>
                    </CardHeader>
                    <CardBody>
                      <Stack spacing={2.5}>
                        <TextField select label="Chu kỳ lặp lại" name="period" value={formData.period} onChange={handleChange} fullWidth size="small" sx={commonInputSx}>
                          <MenuItem value="none">Chỉ gửi 1 lần</MenuItem>
                          <MenuItem value="daily">Hàng ngày</MenuItem>
                          <MenuItem value="weekly">Hàng tuần</MenuItem>
                          <MenuItem value="monthly">Hàng tháng</MenuItem>
                        </TextField>

                        {formData.period === 'weekly' && (
                          <TextField select label="Ngày trong tuần" name="day_of_week" value={formData.day_of_week} onChange={handleChange} fullWidth size="small" sx={commonInputSx}>
                            {daysOfWeek.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                          </TextField>
                        )}

                        {formData.period === 'monthly' && (
                          <TextField select label="Ngày trong tháng" name="day_of_month" value={formData.day_of_month} onChange={handleChange} fullWidth size="small" sx={commonInputSx}>
                            {daysOfMonth.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                          </TextField>
                        )}

                        <TextField label="Giờ gửi tự động (HH:mm)" name="time_to_send" type="time" value={formData.time_to_send} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} sx={commonInputSx} />
                        
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="body2" fontWeight={700}>Trạng thái:</Typography>
                          <FormControlLabel control={<Switch name="active" checked={formData.active} onChange={handleChange} color="primary" />} label={formData.active ? 'Đang bật' : 'Tạm dừng'} />
                        </Box>

                        {!editingId && !formData.use_template && (
                          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                            <FormControlLabel control={<Checkbox name="create_as_template" checked={formData.create_as_template} onChange={handleChange} color="primary" />} label={<Typography variant="body2" fontWeight={700} color="primary.main">Lưu thành Mẫu mới</Typography>} />
                            <Typography variant="caption" color="text.secondary" display="block" pl={4}>Lưu vào thư viện cá nhân để tái sử dụng.</Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardBody>
                    <CardFooter>
                      <Button variant="contained" size="large" fullWidth onClick={handleSubmit} disabled={loading} endIcon={!loading && <SendIcon />} sx={{ py: 1.5, fontWeight: 700, borderRadius: '12px' }}>
                        {loading ? 'ĐANG XỬ LÝ...' : 'LƯU & KHỞI ĐỘNG'}
                      </Button>
                    </CardFooter>
                  </ColumnCard>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(p => ({...p, open: false}))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" sx={{ width: '100%', borderRadius: 2, fontWeight: 700 }}>{toast.message}</Alert>
      </Snackbar>
    </PageWrapper>
  );
}

export default memo(EmailChainPage);