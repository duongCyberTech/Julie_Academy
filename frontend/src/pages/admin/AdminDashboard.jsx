import React, { useState, useEffect, useCallback, memo } from "react";
import { useTheme, alpha, styled } from "@mui/material/styles";
import {
  Box, Typography, Card, CardContent, Stack, Avatar, Fade,
  CircularProgress, IconButton, Tooltip, Paper, Grid,
  FormControl, Select, MenuItem, Chip
} from "@mui/material";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, FunnelChart, Funnel, LabelList, Cell
} from "recharts";

import { getAdminStats } from "../../services/DashboardAdminService";

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import SyncIcon from "@mui/icons-material/Sync";
import ReportIcon from '@mui/icons-material/Report';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';

import { socket } from "../../services/ApiClient";

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3), padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none', borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column',
    [theme.breakpoints.down('md')]: { margin: theme.spacing(1), padding: theme.spacing(2) }
  };
});

const WidgetCard = styled(Card)(({ theme }) => ({
  height: "100%", borderRadius: '16px', 
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
  backgroundColor: theme.palette.background.paper, boxShadow: 'none',
  transition: 'box-shadow 0.3s',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.05)}` : `0 8px 24px ${alpha(theme.palette.common.black, 0.04)}`
  }
}));

const KpiCard = memo(({ title, value, icon, color, trend }) => {
  const theme = useTheme();
  return (
    <WidgetCard>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette[color].main, 0.1), color: `${color}.main` }}>{icon}</Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">{title}</Typography>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h5" fontWeight={700}>{value}</Typography>
              {trend && <Typography variant="caption" color="success.main" fontWeight={700}>+{trend}%</Typography>}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </WidgetCard>
  );
});

const TrueConversionFunnel = memo(({ data }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <WidgetCard>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={3}>Phễu chuyển đổi (Conversion)</Typography>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: isDark ? '#333' : '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: theme.palette.text.primary, fontWeight: 600 }}
              />
              <Funnel dataKey="value" data={data} isAnimationActive>
                <LabelList position="right" fill={theme.palette.text.secondary} stroke="none" dataKey="name" fontSize={12} fontWeight={600} />
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={alpha(theme.palette.primary.main, 1 - index * 0.25)} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </WidgetCard>
  );
});

const SystemHealthWidget = memo(({ serverMetrics }) => {
  const theme = useTheme();
  return (
    <WidgetCard>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>Sức khỏe kỹ thuật</Typography>
        <Stack spacing={2}>
          {[
            { label: 'Tải CPU Server', val: Number(serverMetrics?.find(item => item.Id === 'cpuUtilization')?.Values?.[0].toFixed(2)), color: 'success' }, 
            { label: 'Tốc độ phản hồi API trung bình', val: Number(serverMetrics?.find(item => item.Id === 'apiMetrics')?.Values?.[3].toFixed(2)) ?? 0, color: 'info', unit: 'ms' }, 
            { label: 'Tổng lượng requests', val: Number(serverMetrics?.find(item => item.Id === 'apiMetrics')?.Values?.[0].toFixed(2)) ?? 0, color: 'primary', unit: ' requests' },
            { label: 'Số lượng requests thành công', val: Number(serverMetrics?.find(item => item.Id === 'apiMetrics')?.Values?.[1].toFixed(2)) ?? 0, color: 'success', unit: ' requests' },
            { label: 'Số lượng requests lỗi', val: Number(serverMetrics?.find(item => item.Id === 'apiMetrics')?.Values?.[2].toFixed(2)) ?? 0, color: 'error', unit: ' requests' }
          ].map((item, i) => (
            <Box key={i}>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" fontWeight={600}>{item.label}</Typography> &nbsp;
                <Typography variant="caption" color="text.secondary">{item.val}{item.unit || '%'}</Typography>
              </Stack>
              <Box sx={{ height: 6, width: '100%', bgcolor: alpha(theme.palette[item.color].main, 0.1), borderRadius: 1 }}>
                <Box sx={{ height: '100%', width: `${Math.min(item.val, 100)}%`, bgcolor: `${item.color}.main`, borderRadius: 1 }} />
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </WidgetCard>
  );
});

// Component Khu vực trống (Placeholder)
const FeaturePlaceholderWidget = memo(() => {
  const theme = useTheme();
  return (
    <WidgetCard sx={{ 
      border: `2px dashed ${alpha(theme.palette.text.disabled, 0.3)}`,
      backgroundColor: alpha(theme.palette.background.default, 0.4),
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <CardContent sx={{ textAlign: 'center', p: 4, width: '100%' }}>
        <ExtensionOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
        <Typography variant="subtitle1" color="text.secondary" fontWeight={600} mb={1}>
          Khu vực dự kiến phát triển
        </Typography>
        <Typography variant="body2" color="text.disabled" mb={3}>
          Chừa sẵn layout để bổ sung tính năng mới
        </Typography>
        
        <Stack spacing={1.5} alignItems="center">
          <Chip label="Thiết bị truy cập (Mobile/PC)" variant="outlined" size="small" sx={{ color: 'text.secondary' }} />
          <Chip label="Báo cáo lỗi/Feedback mới nhất" variant="outlined" size="small" sx={{ color: 'text.secondary' }} />
          <Chip label="Lịch trình/Sự kiện hệ thống" variant="outlined" size="small" sx={{ color: 'text.secondary' }} />
        </Stack>
      </CardContent>
    </WidgetCard>
  );
});

const AdminDashboard = memo(() => {
  const theme = useTheme();
  const [token] = useState(() => localStorage.getItem("token"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");
  const [activeUsers, setActiveUsers] = useState(0);
  const [serverMetrics, setServerMetrics] = useState(null);
  const [funnelData, setFunnelData] = useState([
    { name: 'Truy cập trang', value: 3500 }, { name: 'Đăng ký tài khoản', value: 1200 }, { name: 'Vào lớp học', value: 850 }, { name: 'Làm bài thi', value: 400 }
  ]);

  useEffect(() => {
    socket.on('active_users', (count) => {
      setActiveUsers(count);
    });

    return () => { socket.off('active_users'); };
  }, []);

  useEffect(() => {
    const fetchMetrics = () => socket.emit('get_ec2_metrics');

    socket.on('ec2_metrics', (metrics) => {
      setServerMetrics(metrics?.MetricDataResults || []);
    });

    socket.on('ec2_metrics_error', (error) => {
      console.error('Lỗi AWS EC2 Metrics:', error);
    });

    // Re-fetch on every (re)connect so data is never stale after a reconnection
    socket.on('connect', fetchMetrics);

    // Also emit immediately if the socket is already connected when the component mounts
    if (socket.connected) {
      fetchMetrics();
    }

    const interval = setInterval(fetchMetrics, 60000);

    return () => {
      clearInterval(interval);
      socket.off('connect', fetchMetrics);
      socket.off('ec2_metrics');
      socket.off('ec2_metrics_error');
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const stats = await getAdminStats(token);
      const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      const chartData = days.map((day, i) => ({
        name: day, users: stats.numRegByWeek[i] || 0, classes: stats.numClassCreatedByWeek[i] || 0, exams: stats.numExamTakenByWeek[i] || 0
      }));
      setData({ ...stats, chartData });

      setFunnelData(
        Object.entries(stats.conversionStatsByWeek).map(([key, value]) => ({
          name: key,
          value
        }))
      );
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [token, timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !data) return <CircularProgress sx={{ m: 'auto', display: 'block', mt: 10 }} />;

  return (
    <Fade in timeout={600}>
      <PageWrapper>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Command Center</Typography>
            <Typography variant="body2" color="text.secondary">Trung tâm điều hành và phân tích dữ liệu</Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Làm mới">
              <IconButton onClick={fetchData} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}><SyncIcon color="primary" /></IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard title="Người dùng Online" value={activeUsers} icon={<GroupAddOutlinedIcon />} color="primary" /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard title="Lớp Đang Chạy" value={data?.numActiveClasses || 0} icon={<SchoolOutlinedIcon />} color="success" /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard title="Câu Hỏi Mới" value={data?.numQuestion || 0} icon={<ArticleOutlinedIcon />} color="info" /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard title="Tác Vụ Chờ" value={serverMetrics?.find(item => item.Id === 'jobMetrics')?.Values?.[0] + serverMetrics?.find(item => item.Id === 'jobMetrics')?.Values?.[4]} icon={<ReportIcon />} color="error" /></Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <WidgetCard sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={3}>Lưu lượng hệ thống</Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data?.chartData}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/><stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.2}/><stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.1)} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: theme.shadows[4] }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                  <Area type="monotone" name="Đăng ký mới" dataKey="users" stroke={theme.palette.primary.main} fill="url(#colorPrimary)" strokeWidth={3} />
                  <Area type="monotone" name="Lượt làm bài" dataKey="exams" stroke={theme.palette.secondary.main} fill="url(#colorSecondary)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </WidgetCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <SystemHealthWidget serverMetrics={serverMetrics} />
          </Grid>
        </Grid>

        {/* Cân đối lại không gian ở đây */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <TrueConversionFunnel data={funnelData} />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <FeaturePlaceholderWidget />
          </Grid>
        </Grid>

      </PageWrapper>
    </Fade>
  );
});

export default AdminDashboard;