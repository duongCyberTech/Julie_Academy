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
    {
      time: "23:59 Ngày mai",
      title: "Hạn nộp bài tập Tuần 5",
      type: "deadline",
    },
  ],
  leaderboard: [
    { name: "Nguyễn Thị Thu", change: "+15%", avatar: "/logo.png" },
    { name: "Hoàng Văn Long", change: "+12%", avatar: "/logo.png" },
  ],
  contentPerformance: [
    { name: "Quiz Sóng", "Tỷ lệ": 92 },
    { name: "Bài giảng Dao động", "Tỷ lệ": 88 },
  ],
};

const DashboardWidget = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  height: "100%",
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.05)}`,
}));

const ChartTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          p: 1.5,
          borderRadius: 2,
          boxShadow: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="caption"
          display="block"
          sx={{ mb: 1, fontWeight: "bold" }}
        >{`Ngày: ${label}`}</Typography>
        <Stack spacing={0.5}>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.primary.light }}
          >{`Tương tác: ${payload[0].value}`}</Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.success.light }}
          >{`Hoàn thành: ${payload[1].value}`}</Typography>
        </Stack>
      </Box>
    );
  }
  return null;
};

const ScheduleIcon = ({ type }) => {
  const theme = useTheme();
  const iconMapping = {
    class: {
      icon: <VideocamOutlinedIcon />,
      color: theme.palette.secondary.main,
    },
    deadline: {
      icon: <PendingActionsOutlinedIcon />,
      color: theme.palette.warning.main,
    },
  };
  const { icon, color } = iconMapping[type] || {
    icon: <CalendarTodayOutlinedIcon />,
    color: theme.palette.text.secondary,
  };

  return <Avatar sx={{ bgcolor: alpha(color, 0.1), color }}>{icon}</Avatar>;
};

function EngagementWidget() {
  const theme = useTheme();
  return (
    <DashboardWidget>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{ fontSize: "1.25rem", fontWeight: 600, mb: 3 }}
        >
          Tổng Quan Tương Tác Tuần
        </Typography>
        <Box sx={{ height: 265 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockData.engagementData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="colorEngagement"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={theme.palette.primary.main}
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor={theme.palette.primary.main}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={theme.palette.success.main}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={theme.palette.success.main}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={theme.palette.divider}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ top: -10, right: 0 }}
              />
              <Area
                type="monotone"
                name="Tương tác"
                dataKey="Tương tác"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                fill="url(#colorEngagement)"
              />
              <Area
                type="monotone"
                name="Hoàn thành"
                dataKey="Hoàn thành"
                stroke={theme.palette.success.main}
                strokeWidth={2}
                fill="url(#colorSuccess)"
              />
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
        <Typography
          variant="h2"
          component="h2"
          sx={{ fontSize: "1.25rem", fontWeight: 600, mb: 1 }}
        >
          Lịch Trình
        </Typography>
        <List>
          {mockData.schedule.map((item, index) => (
            <ListItem key={index} disableGutters sx={{ py: 1.2 }}>
              <ListItemAvatar sx={{ minWidth: 48 }}>
                <ScheduleIcon type={item.type} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight="500">
                    {item.title}
                  </Typography>
                }
                secondary={item.time}
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
        <Typography
          variant="h2"
          component="h2"
          sx={{ fontSize: "1.25rem", fontWeight: 600, mb: 1 }}
        >
          Tiến Bộ
        </Typography>
        <List disablePadding>
          {mockData.leaderboard.map((student) => (
            <ListItem key={student.name} disableGutters sx={{ py: 1.5 }}>
              <ListItemAvatar sx={{ minWidth: 48 }}>
                <Avatar
                  alt={student.name}
                  src={student.avatar}
                  sx={{ width: 36, height: 36, objectFit: "cover" }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight="500" noWrap>
                    {student.name}
                  </Typography>
                }
              />
              <Typography
                variant="body2"
                color="success.light"
                fontWeight="bold"
              >
                {student.change}
              </Typography>
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
        <Typography
          variant="h2"
          component="h2"
          sx={{ fontSize: "1.25rem", fontWeight: 600, mb: 2 }}
        >
          Hiệu Suất
        </Typography>
        <Stack spacing={3}>
          {mockData.contentPerformance.map((item) => (
            <Box key={item.name}>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" fontWeight="500" noWrap>
                  {item.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >{`${item["Tỷ lệ"]}%`}</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={item["Tỷ lệ"]} />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </DashboardWidget>
  );
}

export default function OptimizedDashboard() {
  const theme = useTheme();
  return (
    <Box
      component="main"
      sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", flexGrow: 1 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: "2.5rem", fontWeight: "bold" }}
        >
          Dashboard
        </Typography>
        <Typography
          sx={{
            color:
              theme.palette.mode === "dark" ? "grey.400" : "text.secondary",
          }}
        >
          Chào mừng trở lại, {mockData.tutorName}. Đây là không gian làm việc
          của bạn.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 4,
        }}
      >
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <EngagementWidget />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ScheduleWidget />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <LeaderboardWidget />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <PerformanceWidget />
        </Box>
      </Box>
    </Box>
  );
}
