import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Box, Typography, Paper, Grid, Stack, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Divider, useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InboxIcon from '@mui/icons-material/Inbox';

import { getEmailLogs, getEmailLogsByConfig } from '../../services/EmailService';

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)',
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
    },
  };
});

const ConfigCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    borderRadius: 16,
    backgroundColor: theme.palette.background.paper,
    backgroundImage: 'none',
    border: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.divider, 0.6)}`,
    boxShadow: 'none',
    transition: 'all 0.25s',
    overflow: 'hidden',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      boxShadow: isDark
        ? `0 0 20px ${alpha(theme.palette.primary.main, 0.12)}`
        : '0px 8px 24px rgba(0,0,0,0.06)',
    },
  };
});

const periodLabels = {
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  monthly: 'Hàng tháng',
  none: 'Một lần',
};

const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusChip({ status }) {
  const isSuccess = status === 'success';
  return (
    <Chip
      icon={isSuccess ? <CheckCircleOutlineIcon fontSize="small" /> : <ErrorOutlineIcon fontSize="small" />}
      label={isSuccess ? 'Thành công' : 'Thất bại'}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: '0.72rem',
        bgcolor: isSuccess ? alpha('#22c55e', 0.12) : alpha('#ef4444', 0.12),
        color: isSuccess ? '#16a34a' : '#dc2626',
        '& .MuiChip-icon': { color: 'inherit' },
      }}
    />
  );
}

function LogsDialog({ open, config, onClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!open || !config) return;
    setLoading(true);
    setError(null);
    getEmailLogsByConfig(config.config_id, token)
      .then((data) => setLogs(data?.emailLogs || []))
      .catch(() => setError('Không thể tải nhật ký. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [open, config, token]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Nhật ký gửi email
          </Typography>
          {config && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {config.header}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {error && !loading && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          </Box>
        )}

        {!loading && !error && logs.length === 0 && (
          <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <InboxIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.3) }} />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Chưa có nhật ký nào cho cấu hình này
            </Typography>
          </Box>
        )}

        {!loading && !error && logs.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.grey[100], 0.8) }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', pl: 3 }}>
                    Trạng thái
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                    Thời gian gửi
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', pr: 3 }}>
                    Chi tiết lỗi
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.log_id}
                    sx={{
                      '&:last-child td': { border: 0 },
                      '&:hover': { bgcolor: isDark ? alpha(theme.palette.action.hover, 0.5) : alpha(theme.palette.primary.main, 0.02) },
                    }}
                  >
                    <TableCell sx={{ pl: 3, py: 1.5 }}>
                      <StatusChip status={log.status} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(log.sent_at)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ pr: 3, py: 1.5 }}>
                      {log.error_message && Array.isArray(log.error_message) && log.error_message.length > 0 ? (
                        <Typography variant="caption" color="error.main" sx={{ fontFamily: 'monospace', display: 'block', maxWidth: 320, wordBreak: 'break-word' }}>
                          {log.error_message.join('; ')}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, fontWeight: 700 }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EmailLogsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const token = localStorage.getItem('token');

  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getEmailLogs(token);
      setConfigs(data || []);
    } catch {
      setError('Không thể tải dữ liệu nhật ký email.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleViewLogs = useCallback((config) => {
    setSelectedConfig(config);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedConfig(null);
  }, []);

  return (
    <PageWrapper>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Nhật ký Email
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Xem lịch sử gửi email của từng cấu hình tự động
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>{error}</Alert>
      )}

      {!loading && !error && configs.length === 0 && (
        <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <EmailOutlinedIcon sx={{ fontSize: 64, color: alpha(theme.palette.primary.main, 0.3) }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">
            Chưa có cấu hình email nào
          </Typography>
          <Typography variant="body2" color="text.disabled" textAlign="center">
            Tạo cấu hình email tự động và hệ thống sẽ ghi nhật ký tại đây sau mỗi lần gửi.
          </Typography>
        </Box>
      )}

      {!loading && !error && configs.length > 0 && (
        <Grid container spacing={3}>
          {configs.map((config) => {
            const logCount = config.emailLogs?.length ?? 0;
            const successCount = config.emailLogs?.filter((l) => l.status === 'success').length ?? 0;
            const failCount = logCount - successCount;
            const lastLog = config.emailLogs?.[0] ?? null;

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={config.config_id}>
                <ConfigCard>
                  <Box
                    sx={{
                      p: 2.5,
                      borderBottom: `1px solid ${isDark ? alpha(theme.palette.divider, 0.5) : theme.palette.divider}`,
                      bgcolor: config.active
                        ? alpha(theme.palette.primary.main, 0.05)
                        : alpha(theme.palette.action.hover, 0.3),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <EmailOutlinedIcon
                      fontSize="small"
                      sx={{ color: config.active ? 'primary.main' : 'text.disabled', flexShrink: 0 }}
                    />
                    <Box overflow="hidden" flexGrow={1}>
                      <Typography variant="subtitle2" fontWeight={700} color="text.primary" noWrap>
                        {config.header}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {periodLabels[config.period] ?? config.period}
                        {config.period === 'weekly' && ` · ${daysOfWeek[config.day_of_week] ?? ''}`}
                        {config.period === 'monthly' && ` · Ngày ${config.day_of_month}`}
                        {' · '}{config.time_to_send}
                      </Typography>
                    </Box>
                    <Chip
                      label={config.active ? 'Đang bật' : 'Tắt'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        bgcolor: config.active ? alpha('#22c55e', 0.12) : alpha(theme.palette.text.disabled, 0.1),
                        color: config.active ? '#16a34a' : 'text.disabled',
                        flexShrink: 0,
                      }}
                    />
                  </Box>

                  <Box sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={2} mb={2}>
                      <Box textAlign="center" flex={1}>
                        <Typography variant="h5" fontWeight={800} color="text.primary">
                          {logCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Tổng lần gửi</Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box textAlign="center" flex={1}>
                        <Typography variant="h5" fontWeight={800} color="#16a34a">
                          {successCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Thành công</Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box textAlign="center" flex={1}>
                        <Typography variant="h5" fontWeight={800} color="#dc2626">
                          {failCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Thất bại</Typography>
                      </Box>
                    </Stack>

                    {lastLog && (
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 2 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary">
                          Gần nhất: {formatDateTime(lastLog.sent_at)}
                        </Typography>
                        <StatusChip status={lastLog.status} />
                      </Stack>
                    )}

                    {!lastLog && (
                      <Typography variant="caption" color="text.disabled" display="block" mb={2}>
                        Chưa có lần gửi nào được ghi nhận
                      </Typography>
                    )}

                    <Tooltip title="Xem nhật ký chi tiết">
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<HistoryIcon />}
                        onClick={() => handleViewLogs(config)}
                        sx={{ borderRadius: 2, fontWeight: 700, borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}
                      >
                        Xem nhật ký ({logCount})
                      </Button>
                    </Tooltip>
                  </Box>
                </ConfigCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      <LogsDialog open={dialogOpen} config={selectedConfig} onClose={handleCloseDialog} />
    </PageWrapper>
  );
}

export default memo(EmailLogsPage);
