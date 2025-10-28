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
  Grid,
  Fade,
} from "@mui/material";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// --- CÁC ICON CHO DASHBOARD ADMIN ---
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";

// --- DỮ LIỆU GIẢ LẬP (ĐÃ BỎ TÀI CHÍNH) ---
const mockAdminData = {
  // Q2: Việc cần xử lý
  actionableStats: [
    {
      title: "Học liệu chờ duyệt",
      count: "25",
      icon: <DescriptionOutlinedIcon />,
      color: "warning",
    },
    {
      title: "Gia sư chờ duyệt",
      count: "5",
      icon: <SchoolOutlinedIcon />,
      color: "info",
    },
    {
      title: "Báo cáo/Khiếu nại",
      count: "1",
      icon: <ReportProblemOutlinedIcon />,
      color: "error",
    },
    {
      title: "Tổng Người Dùng",
      count: "1,250",
      icon: <PeopleAltOutlinedIcon />,
      color: "primary",
    },
  ],
  // Q1: Tăng trưởng người dùng
  userGrowth: [
    { name: "T2", "Gia sư": 4, "Học sinh": 12 },
    { name: "T3", "Gia sư": 3, "Học sinh": 19 },
    { name: "T4", "Gia sư": 5, "Học sinh": 15 },
    { name: "T5", "Gia sư": 8, "Học sinh": 22 },
    { name: "T6", "Gia sư": 6, "Học sinh": 18 },
    { name: "T7", "Gia sư": 9, "Học sinh": 25 },
    { name: "CN", "Gia sư": 7, "Học sinh": 21 },
  ],
  // Q4: Hoạt động hệ thống
  contentDistribution: [
    { name: "Video Bài giảng", value: 450, color: "#3B82F6" }, // primary.main
    { name: "Tài liệu PDF", value: 1200, color: "#10B981" }, // success.main
    { name: "Bộ đề thi (Quiz)", value: 320, color: "#e17319ff" }, // secondary.main
  ],
  recentActivities: [
    {
      user: "Gia sư A",
      action: "vừa tải lên tài liệu mới",
      type: "upload",
    },
    {
      user: "Học sinh B",
      action: "vừa hoàn thành 1 bộ đề thi",
      type: "quiz",
    },
    {
      user: "Admin",
      action: "vừa duyệt 1 tài khoản Gia sư",
      type: "admin",
    },
  ],
};

// --- STYLED COMPONENTS ---
const DashboardWidget = styled(Card)(({ theme }) => ({
  height: "100%",
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
}));

// Tooltip cho biểu đồ
const ChartTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          p: 1.5,
          borderRadius: 2,
          boxShadow: theme.shadows[10],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="caption"
          display="block"
          sx={{ mb: 1, fontWeight: "bold" }}
        >{`Ngày: ${label}`}</Typography>
        <Stack spacing={0.5}>
          {payload.map((p) => (
            <Typography
              key={p.name}
              variant="caption"
              sx={{ color: p.color, fontWeight: 500 }}
            >{`${p.name}: ${p.value.toLocaleString("vi-VN")}`}</Typography>
          ))}
        </Stack>
      </Box>
    );
  }
  return null;
};

// --- CÁC WIDGET CHO ADMIN ---

/**
 * Q2: Thẻ thống kê các việc cần làm
 */
function ActionStatCard({ title, count, icon, color = "primary" }) {
  const theme = useTheme();
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: alpha(theme.palette[color].main, 0.15),
              color: theme.palette[color].main,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold">
              {count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </DashboardWidget>
  );
}

/**
 * Q1: Biểu đồ tăng trưởng người dùng
 */
function UserGrowthWidget() {
  const theme = useTheme();
  return (
    <DashboardWidget>
      <CardContent
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Typography variant="h6" component="h2" fontWeight={600} mb={3}>
          Tăng trưởng người dùng (7 ngày qua)
        </Typography>
        <Box sx={{ flexGrow: 1, minHeight: 320 }}> {/* Tăng chiều cao */}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockAdminData.userGrowth}
              margin={{ top: 5, right: 25, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorTutor" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={theme.palette.info.main}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor={theme.palette.info.main}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorStudent" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={theme.palette.secondary.main}
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor={theme.palette.secondary.main}
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
                wrapperStyle={{ top: -15, right: 0 }}
              />
              <Area
                type="monotone"
                name="Gia sư"
                dataKey="Gia sư"
                stroke={theme.palette.info.main}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTutor)"
              />
              <Area
                type="monotone"
                name="Học sinh"
                dataKey="Học sinh"
                stroke={theme.palette.secondary.main}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorStudent)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </DashboardWidget>
  );
}

/**
 * Q4: Phân bổ nội dung (Biểu đồ tròn)
 */
function ContentDistributionWidget() {
  const theme = useTheme();
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={3}>
          Phân bổ Học liệu
        </Typography>
        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockAdminData.contentDistribution}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {mockAdminData.contentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString("vi-VN")} tài liệu`} />
              <Legend
                iconType="circle"
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </DashboardWidget>
  );
}

// Icon helper cho Hoạt động gần đây
const ActivityIcon = ({ type }) => {
  const theme = useTheme();
  const iconMapping = {
    upload: {
      icon: <ArticleOutlinedIcon />,
      color: theme.palette.secondary.main,
    },
    quiz: { icon: <QuizOutlinedIcon />, color: theme.palette.primary.main },
    admin: {
      icon: <PeopleAltOutlinedIcon />,
      color: theme.palette.info.main,
    },
  };
  const { icon, color } = iconMapping[type] || {
    icon: <PeopleAltOutlinedIcon />,
    color: theme.palette.text.secondary,
  };
  return <Avatar sx={{ bgcolor: alpha(color, 0.15), color }}>{icon}</Avatar>;
};

/**
 * Q4: Hoạt động gần đây
 */
function RecentActivityWidget() {
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={2}>
          Hoạt động gần đây
        </Typography>
        <List disablePadding>
          {mockAdminData.recentActivities.map((item, index) => (
            <ListItem key={index} disableGutters sx={{ py: 1.5 }}>
              <ListItemAvatar sx={{ minWidth: 52 }}>
                <ActivityIcon type={item.type} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    <Typography component="span" variant="body2" fontWeight="bold">
                      {item.user}
                    </Typography>{" "}
                    {item.action}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </DashboardWidget>
  );
}

// --- MAIN DASHBOARD LAYOUT (ĐÃ SẮP XẾP LẠI) ---
export default function AdminDashboard() {
  return (
    <Fade in timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" fontWeight="bold" mb={4}>
          Bảng điều khiển Admin
        </Typography>

        <Grid container spacing={3}>
          {/* Hàng 1: Thẻ thống kê (Q2 & Q1) */}
          {mockAdminData.actionableStats.map((stat) => (
            <Grid key={stat.title} size={{ xs: 12, sm: 6, lg: 3 }}>
              <ActionStatCard
                title={stat.title}
                count={stat.count}
                icon={stat.icon}
                color={stat.color}
              />
            </Grid>
          ))}

          {/* Hàng 2: Tăng trưởng (Q1) */}
          <Grid size={{ xs: 12, lg: 12 }}> {/* Biểu đồ chính chiếm toàn bộ hàng */}
            <UserGrowthWidget />
          </Grid>

          {/* Hàng 3: Phân bổ (Q4) và Hoạt động (Q4) */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <ContentDistributionWidget />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <RecentActivityWidget />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}