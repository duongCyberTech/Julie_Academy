import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useTheme, alpha, styled } from "@mui/material/styles";
import {
  Box, Typography, Card, CardContent, Stack, Avatar, List,
  ListItem, ListItemText, ListItemAvatar, Fade,
  CircularProgress, Alert, Button, IconButton, Tooltip, Divider,
  AlertTitle, Paper, Grid
} from "@mui/material";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend
} from "recharts";

import { getAdminStats } from "../../services/DashboardAdminService";

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import SyncIcon from '@mui/icons-material/Sync';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const mockAdminData = {
  topTutors: [
    { name: "Nguyễn Văn A", questions: 120 },
    { name: "Trần Thị B", questions: 95 },
    { name: "Lê Minh C", questions: 88 },
  ],
  topStudents: [
    { name: "Học sinh chăm chỉ 1", topics: 58 },
    { name: "Học sinh ưu tú 2", topics: 52 },
    { name: "Học sinh A", topics: 45 },
  ]
};

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : `0 8px 48px ${alpha(theme.palette.common.black, 0.03)}`,
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
    }
  };
});

const DashboardWidget = styled(Card)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: isDark ? 'none' : `0px 4px 20px ${alpha(theme.palette.common.black, 0.04)}`,
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    display: 'flex',
    flexDirection: 'column',
  };
});

const ChartTooltipBox = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[6],
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
}));

const CustomTooltip = memo(({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltipBox>
        <Typography variant="subtitle2" sx={{ mb: 1, borderBottom: 1, borderColor: 'divider', pb: 0.5, fontWeight: 700 }}>
          Ngày: {label}
        </Typography>
        <Stack spacing={1}>
          {payload.map((p) => (
            <Stack key={p.name} direction="row" justifyContent="space-between" spacing={3}>
              <Typography variant="caption" sx={{ color: p.color, fontWeight: 600 }}>{p.name}:</Typography>
              <Typography variant="caption" fontWeight={700}>{p.value.toLocaleString("vi-VN")}</Typography>
            </Stack>
          ))}
        </Stack>
      </ChartTooltipBox>
    );
  }
  return null;
});

const KpiCard = memo(({ title, value, subValue, subLabel, icon, color = "primary" }) => {
  const theme = useTheme();
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight={700} sx={{ mt: 1, color: theme.palette.text.primary }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: alpha(theme.palette[color].main, 0.1), color: theme.palette[color].main, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Stack>
        {subValue !== undefined && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="caption" fontWeight={700} color="success.main">
              +{subValue}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subLabel}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </DashboardWidget>
  );
});

const AdminDashboard = memo(() => {
  const theme = useTheme();
  const [token] = useState(() => localStorage.getItem("token"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(new Date());

  const generateDateLabels = useCallback(() => {
    return Array(7).fill(0).map((_, index) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - index));
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    });
  }, []);

const fetchData = useCallback(async () => {
    if (!token) {
      setError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
      setLoading(false); 
      return;
    }
    setLoading(true); 
    setError(null);
    try {
      const stats = await getAdminStats(token);
      
      const { 
        numRegByWeek, 
        numClassCreatedByWeek, 
        numExamTakenByWeek, 
        numActiveClasses, 
        numQuestion 
      } = stats;

      const labels = generateDateLabels();
      const chartData = labels.map((day, index) => ({
        name: day,
        users: numRegByWeek[index] || 0,
        classes: numClassCreatedByWeek[index] || 0,
        exams: numExamTakenByWeek[index] || 0,
      }));

      // Tính tổng 7 ngày qua
      const totalNewUsers = numRegByWeek.reduce((a, b) => a + b, 0);
      const totalNewExams = numExamTakenByWeek.reduce((a, b) => a + b, 0);

      setData({ 
        activeClasses: numActiveClasses, 
        totalQuestions: numQuestion, 
        chartData, 
        totalNewUsers, 
        totalNewExams 
      });
      setLastSync(new Date());
    } catch (err) {
      setError("Không thể đồng bộ dữ liệu hệ thống. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [token, generateDateLabels]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  if (loading && !data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  return (
    <Fade in timeout={600}>
      <PageWrapper>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={4} spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
              Tổng quan Hệ thống
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Báo cáo hiệu suất và hoạt động nền tảng
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="caption" color="text.secondary">
              Đồng bộ lần cuối: {lastSync.toLocaleTimeString("vi-VN")}
            </Typography>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton onClick={fetchData} disabled={loading} color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <SyncIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Alert severity="warning" icon={<ManageAccountsIcon fontSize="inherit" />} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.warning.light}` }}>
              <AlertTitle sx={{ fontWeight: 700 }}>Chờ phê duyệt</AlertTitle>
              Hệ thống đang có <strong>5 gia sư</strong> mới đăng ký chờ xét duyệt hồ sơ. <Button size="small" color="warning" sx={{ ml: 1, fontWeight: 700 }}>Xử lý ngay</Button>
            </Alert>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Alert severity="error" icon={<WarningAmberIcon fontSize="inherit" />} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.error.light}` }}>
              <AlertTitle sx={{ fontWeight: 700 }}>Cảnh báo khiếu nại</AlertTitle>
              Phát hiện <strong>3 báo cáo vi phạm</strong> nội dung chưa được giải quyết. <Button size="small" color="error" sx={{ ml: 1, fontWeight: 700 }}>Kiểm tra</Button>
            </Alert>
          </Grid>
        </Grid>

        {data && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard 
                title="Lớp học đang chạy" 
                value={data.activeClasses.toLocaleString("vi-VN")} 
                icon={<SchoolOutlinedIcon />} 
                color="success" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard 
                title="Ngân hàng câu hỏi" 
                value={data.totalQuestions.toLocaleString("vi-VN")} 
                icon={<ArticleOutlinedIcon />} 
                color="info" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard 
                title="Người dùng mới" 
                value={data.totalNewUsers.toLocaleString("vi-VN")} 
                subValue={data.totalNewUsers} 
                subLabel="trong 7 ngày qua"
                icon={<GroupAddOutlinedIcon />} 
                color="primary" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard 
                title="Lượt làm bài thi" 
                value={data.totalNewExams.toLocaleString("vi-VN")} 
                subValue={data.totalNewExams}
                subLabel="trong 7 ngày qua"
                icon={<TrendingUpIcon />} 
                color="secondary" 
              />
            </Grid>
          </Grid>
        )}

        <Grid container spacing={3}>
          {data && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <DashboardWidget>
                <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", minHeight: 450 }}>
                  <Typography variant="h6" fontWeight={700} mb={1}>Lưu lượng hệ thống</Typography>
                  <Typography variant="body2" color="text.secondary" mb={4}>Phân tích hoạt động nền tảng trong 7 ngày gần nhất</Typography>
                  <Box sx={{ flexGrow: 1, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 20 }} />
                        <Area type="monotone" name="Đăng ký mới" dataKey="users" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                        <Area type="monotone" name="Lượt thi" dataKey="exams" stroke={theme.palette.secondary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorExams)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </DashboardWidget>
            </Grid>
          )}

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3} height="100%">
              <DashboardWidget sx={{ flex: 1 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight={700}>Gia sư đóng góp tích cực</Typography>
                    <Button size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>Xem tất cả</Button>
                  </Stack>
                  <List disablePadding>
                    {mockAdminData.topTutors.map((tutor, index) => (
                      <React.Fragment key={index}>
                        <ListItem disableGutters sx={{ py: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: "info.main", fontWeight: 700 }}>
                              {tutor.name.split(" ").pop().charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={<Typography variant="body2" fontWeight={700}>{tutor.name}</Typography>} secondary={<Typography variant="caption" color="text.secondary">{tutor.questions} câu hỏi đã tạo</Typography>} />
                        </ListItem>
                        {index < mockAdminData.topTutors.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </DashboardWidget>

              <DashboardWidget sx={{ flex: 1 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight={700}>Học sinh xuất sắc</Typography>
                    <Button size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>Xem tất cả</Button>
                  </Stack>
                  <List disablePadding>
                    {mockAdminData.topStudents.map((student, index) => (
                      <React.Fragment key={index}>
                        <ListItem disableGutters sx={{ py: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: "warning.dark" }}>
                              <EmojiEventsOutlinedIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={<Typography variant="body2" fontWeight={700}>{student.name}</Typography>} secondary={<Typography variant="caption" color="text.secondary">Master {student.topics} chủ điểm</Typography>} />
                        </ListItem>
                        {index < mockAdminData.topStudents.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </DashboardWidget>
            </Stack>
          </Grid>
        </Grid>
      </PageWrapper>
    </Fade>
  );
});

export default AdminDashboard;