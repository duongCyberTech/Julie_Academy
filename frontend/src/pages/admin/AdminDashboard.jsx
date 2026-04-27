import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useTheme, alpha, styled } from "@mui/material/styles";
import {
  Box, Typography, Card, CardContent, Stack, Avatar, Fade,
  CircularProgress, Button, IconButton, Tooltip, Paper, Grid, Chip,
  FormControl, Select, MenuItem
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
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ReportIcon from '@mui/icons-material/Report';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

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

const SystemHealthWidget = memo(() => {
  const theme = useTheme();
  return (
    <WidgetCard>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>Sức khỏe kỹ thuật</Typography>
        <Stack spacing={2}>
          {[{ label: 'Tải CPU Server', val: 35, color: 'success' }, { label: 'Tải RAM Server', val: 62, color: 'info' }, { label: 'Độ trễ API', val: 85, color: 'primary', unit: 'ms' }].map((item, i) => (
            <Box key={i}>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" fontWeight={600}>{item.label}</Typography>
                <Typography variant="caption" color="text.secondary">{item.val}{item.unit || '%'}</Typography>
              </Stack>
              <Box sx={{ height: 6, width: '100%', bgcolor: alpha(theme.palette[item.color].main, 0.1), borderRadius: 1 }}>
                <Box sx={{ height: '100%', width: `${item.val}%`, bgcolor: `${item.color}.main`, borderRadius: 1 }} />
              </Box>
            </Box>
          ))}
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

  const funnelData = useMemo(() => [
    { name: 'Truy cập trang', value: 3500 }, { name: 'Đăng ký tài khoản', value: 1200 }, { name: 'Vào lớp học', value: 850 }, { name: 'Làm bài thi', value: 400 }
  ], []);

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
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                startAdornment={<FilterAltOutlinedIcon color="action" sx={{ mr: 1, ml: 0.5 }} fontSize="small" />}
                sx={{ borderRadius: '12px', fontWeight: 600, fontSize: '0.875rem' }}
              >
                <MenuItem value="today">Hôm nay</MenuItem>
                <MenuItem value="7days">7 ngày qua</MenuItem>
                <MenuItem value="30days">30 ngày qua</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Làm mới">
              <IconButton onClick={fetchData} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}><SyncIcon color="primary" /></IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard title="Học sinh Online" value="342" icon={<GroupAddOutlinedIcon />} color="primary" trend={12} /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard title="Lớp Đang Chạy" value={data?.numActiveClasses || 0} icon={<SchoolOutlinedIcon />} color="success" /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard title="Câu Hỏi Mới" value={data?.numQuestion || 0} icon={<ArticleOutlinedIcon />} color="info" /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><KpiCard title="Tác Vụ Chờ" value="15" icon={<ReportIcon />} color="error" /></Grid>
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
            <Stack spacing={3} height="100%">
              <SystemHealthWidget />
              <WidgetCard sx={{ p: 3, flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight={700}>Phê duyệt gia sư</Typography>
                  <Button size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>Xem tất cả</Button>
                </Stack>
                <Stack spacing={2}>
                  {[1, 2].map((i) => (
                    <Stack key={i} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.divider, 0.04) }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}><AssignmentIndIcon fontSize="small" /></Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>Gia sư #{i}</Typography>
                          <Typography variant="caption" color="text.secondary">Chờ duyệt hồ sơ</Typography>
                        </Box>
                      </Stack>
                      <Button size="small" variant="contained" color="primary" disableElevation sx={{ borderRadius: '8px', fontWeight: 600 }}>Duyệt</Button>
                    </Stack>
                  ))}
                </Stack>
              </WidgetCard>
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}><TrueConversionFunnel data={funnelData} /></Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
             <WidgetCard sx={{ p: 3 }}>
               <Typography variant="subtitle1" fontWeight={700} mb={3}>Môn học được quan tâm nhất</Typography>
               <Stack spacing={3}>
                 {['Toán học Cao cấp', 'Tiếng Anh Giao tiếp', 'Vật lý 12', 'Hóa vô cơ'].map((m, i) => (
                   <Box key={m}>
                     <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                       <Typography variant="body2" fontWeight={600}>{m}</Typography>
                       <Chip label={`${80 - i * 15}%`} size="small" color={i === 0 ? 'primary' : 'default'} sx={{ fontWeight: 700, borderRadius: '6px' }} />
                     </Stack>
                     <Box sx={{ height: 4, width: '100%', bgcolor: alpha(theme.palette.divider, 0.1), borderRadius: 1 }}>
                        <Box sx={{ height: '100%', width: `${80 - i * 15}%`, bgcolor: i === 0 ? theme.palette.primary.main : theme.palette.text.secondary, borderRadius: 1 }} />
                     </Box>
                   </Box>
                 ))}
               </Stack>
             </WidgetCard>
          </Grid>
        </Grid>
      </PageWrapper>
    </Fade>
  );
});

export default AdminDashboard;