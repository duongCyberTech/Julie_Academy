import React from "react";
import { useTheme, alpha, styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  Grid,
  Fade,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

// --- MOCK DATA (Không thay đổi) ---
const mockData = {
  tutorName: "Hung Pham",
  engagementData: [
    { name: "T2", "Tương tác": 32, "Hoàn thành": 28 },
    { name: "T3", "Tương tác": 41, "Hoàn thành": 35 },
    { name: "T4", "Tương tác": 28, "Hoàn thành": 25 },
    { name: "T5", "Tương tác": 55, "Hoàn thành": 48 },
    { name: "T6", "Tương tác": 47, "Hoàn thành": 40 },
    { name: "T7", "Tương tác": 62, "Hoàn thành": 58 },
    { name: "CN", "Tương tác": 58, "Hoàn thành": 51 },
  ],
  schedule: [
    { time: "19:00 Hôm nay", title: "Lớp Vật Lý 9 - Sóng Cơ", type: "class" },
    { time: "23:59 Ngày mai", title: "Hạn nộp bài tập Tuần 5", type: "deadline" },
  ],
  leaderboard: [
    { name: "Nguyễn Thị Thu", change: "+15%", avatar: "/logo.png" },
    { name: "Hoàng Văn Long", change: "+12%", avatar: "/logo.png" },
    { name: "Trần Minh Anh", change: "+9%", avatar: "/logo.png" },
  ],
  contentPerformance: [
    { name: "Quiz Sóng", "Tỷ lệ": 92, color: "primary" },
    { name: "Bài giảng Dao động", "Tỷ lệ": 88, color: "secondary" },
    { name: "Bài tập Con lắc", "Tỷ lệ": 76, color: "success" },
  ],
};

// --- STYLED COMPONENTS ---
const DashboardWidget = styled(Card)(({ theme }) => ({
  height: "100%",
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
}));

const ChartTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.95),
        p: 1.5,
        borderRadius: 2,
        boxShadow: theme.shadows[10],
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: "bold" }}>{`Ngày: ${label}`}</Typography>
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>{`Tương tác: ${payload[0].value}`}</Typography>
          <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 500 }}>{`Hoàn thành: ${payload[1].value}`}</Typography>
        </Stack>
      </Box>
    );
  }
  return null;
};

const ScheduleIcon = ({ type }) => {
  const theme = useTheme();
  const iconMapping = {
    class: { icon: <VideocamOutlinedIcon />, color: theme.palette.secondary.main },
    deadline: { icon: <PendingActionsOutlinedIcon />, color: theme.palette.warning.main },
  };
  const { icon, color } = iconMapping[type] || { icon: <CalendarTodayOutlinedIcon />, color: theme.palette.text.secondary };
  return <Avatar sx={{ bgcolor: alpha(color, 0.15), color }}>{icon}</Avatar>;
};

// --- WIDGET COMPONENTS ---
function EngagementWidget() {
  const theme = useTheme();
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={3}>
          Tổng Quan Tương Tác Tuần
        </Typography>
        <Box sx={{ flexGrow: 1, minHeight: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData.engagementData} margin={{ top: 5, right: 25, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.5}/>
                  <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ top: -15, right: 0, }} />
              <Area type="monotone" name="Tương tác" dataKey="Tương tác" stroke={theme.palette.primary.main} strokeWidth={2.5} fillOpacity={1} fill="url(#colorEngagement)"/>
              <Area type="monotone" name="Hoàn thành" dataKey="Hoàn thành" stroke={theme.palette.success.main} strokeWidth={2.5} fillOpacity={1} fill="url(#colorSuccess)"/>
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </DashboardWidget>
  );
}

function ScheduleWidget() {
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={2}>Lịch Trình Sắp Tới</Typography>
        <List disablePadding>
          {mockData.schedule.map((item, index) => (
            <ListItem key={index} disableGutters sx={{ py: 1.5 }}>
              <ListItemAvatar sx={{ minWidth: 52 }}><ScheduleIcon type={item.type} /></ListItemAvatar>
              <ListItemText 
                primary={<Typography variant="body1" fontWeight="500" >{item.title}</Typography>} 
                secondary={<Typography variant="body2" color="text.secondary">{item.time}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </DashboardWidget>
  );
}

function LeaderboardWidget() {
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={2}>Tiến Bộ Học Sinh</Typography>
        <List disablePadding>
          {mockData.leaderboard.map((student) => (
            <ListItem key={student.name} disableGutters sx={{ py: 1.2 }}>
              <ListItemAvatar>
                <Avatar alt={student.name} src={student.avatar} sx={{ width: 40, height: 40 }}/>
              </ListItemAvatar>
              <ListItemText primary={<Typography variant="subtitle2" fontWeight="600" noWrap>{student.name}</Typography>}/>
              <Typography variant="subtitle2" color="success.main" fontWeight="bold">{student.change}</Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </DashboardWidget>
  );
}

function PerformanceWidget() {
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={3}>Hiệu Suất Nội Dung</Typography>
        <Stack spacing={3}>
          {mockData.contentPerformance.map((item) => (
            <Box key={item.name}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body1" fontWeight="500">{item.name}</Typography>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>{`${item["Tỷ lệ"]}%`}</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={item["Tỷ lệ"]} color={item.color || "primary"} sx={{ height: 8, borderRadius: 4, bgcolor: (theme) => alpha(theme.palette[item.color || "primary"].main, 0.2) }}/>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </DashboardWidget>
  );
}

// --- MAIN DASHBOARD LAYOUT ---
export default function StudentDashboard() {
  return (
    <Fade in timeout={500}>
      <Box>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* HOÀN LẠI: Sử dụng cú pháp 'size' theo yêu cầu của bạn */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <EngagementWidget />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ScheduleWidget />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <LeaderboardWidget />
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <PerformanceWidget />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}
