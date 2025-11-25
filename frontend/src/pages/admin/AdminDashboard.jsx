import React, { useState, useEffect, useCallback, memo } from "react";
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
  CircularProgress,
  Alert,
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

// --- Import Service API thật ---
import {
  getRegisterStats,
  getClassCreatedStats,
  getExamTakenStats,
  getNumberOfActiveClasses,
  getNumberOfQuestions,
} from "../../services/DashboardAdminService"; // Đảm bảo đường dẫn chính xác

// --- CÁC ICON CHO DASHBOARD ADMIN ---
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';

// --- DỮ LIỆU GIẢ LẬP (Mock data) ---
const mockAdminData = {
  actionableStats: [
    {
      title: "Gia sư chờ duyệt",
      count: "5",
      icon: <PeopleAltOutlinedIcon />,
      color: "info",
    },
    {
      title: "Khiếu nại chưa giải quyết",
      count: "3",
      icon: <ReportProblemOutlinedIcon />,
      color: "error",
    },
  ],
  topTutors: [
    { name: "Nguyễn Văn A", questions: 120 },
    { name: "Trần Thị B", questions: 95 },
    { name: "Lê Minh C", questions: 88 },
    { name: "Phạm Hùng D", questions: 76 },
    { name: "Vũ Thu E", questions: 64 },
  ],
  topStudents: [
    { name: "Học sinh chăm chỉ 1", topics: 58 },
    { name: "Học sinh ưu tú 2", topics: 52 },
    { name: "Học sinh A", topics: 45 },
    { name: "Học sinh B", topics: 41 },
    { name: "Học sinh C", topics: 39 },
  ]
};

// --- STYLED COMPONENTS (Giữ nguyên) ---
const DashboardWidget = styled(Card)(({ theme }) => ({
  height: "100%",
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
}));

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

function UserGrowthWidget({ data }) {
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
          Tổng quan hoạt động (7 ngày qua)
        </Typography>
        <Box sx={{ flexGrow: 1, minHeight: 320, height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 25, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.5}/>
                  <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
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
                allowDecimals={false}
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
                name="Người dùng mới"
                dataKey="users"
                stroke={theme.palette.primary.main}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
              <Area
                type="monotone"
                name="Lớp học mới"
                dataKey="classes"
                stroke={theme.palette.success.main}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorClasses)"
              />
              <Area
                type="monotone"
                name="Lượt làm bài"
                dataKey="exams"
                stroke={theme.palette.secondary.main}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorExams)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </DashboardWidget>
  );
}

function TopTutorsWidget() {
  const theme = useTheme();
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={2}>
          Top 5 Gia sư
        </Typography>
        <List disablePadding>
          {mockAdminData.topTutors.map((tutor, index) => (
            <ListItem key={index} disableGutters sx={{ py: 1.5 }}>
              <ListItemAvatar sx={{ minWidth: 52 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.15),
                    color: "info.main",
                    fontWeight: "bold",
                  }}
                >
                  {tutor.name.split(" ").pop().charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight="bold">
                    {tutor.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {tutor.questions.toLocaleString("vi-VN")} câu hỏi
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

function TopStudentsWidget() {
  const theme = useTheme();
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={2}>
          Top 5 Học sinh
        </Typography>
        <List disablePadding>
          {mockAdminData.topStudents.map((student, index) => (
            <ListItem key={index} disableGutters sx={{ py: 1.5 }}>
              <ListItemAvatar sx={{ minWidth: 52 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.15),
                    color: "warning.main",
                    fontWeight: "bold",
                  }}
                >
                  <EmojiEventsOutlinedIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight="bold">
                    {student.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Hoàn thành {student.topics.toLocaleString("vi-VN")} chủ điểm
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


// --- MAIN DASHBOARD LAYOUT ---
export default function AdminDashboard() {
  const [token] = useState(() => localStorage.getItem("token"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateDateLabels = () => {
    return Array(7)
      .fill(0)
      .map((_, index) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - index));
        return d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });
      });
  };

  const fetchData = useCallback(async () => {
    if (!token) {
      setError("Bạn chưa đăng nhập.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [
        registerStats,
        classStats,
        examStats,
        activeClasses,
        totalQuestions,
      ] = await Promise.all([
        getRegisterStats(token),
        getClassCreatedStats(token),
        getExamTakenStats(token),
        getNumberOfActiveClasses(token),
        getNumberOfQuestions(token),
      ]);

      const labels = generateDateLabels();
      const chartData = labels.map((day, index) => ({
        name: day,
        users: registerStats[index] || 0,
        classes: classStats[index] || 0,
        exams: examStats[index] || 0,
      }));

      setData({
        activeClasses,
        totalQuestions,
        chartData,
      });
    } catch (err) {
      setError("Không thể tải dữ liệu dashboard.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" fontWeight="bold" mb={4}>
          Bảng điều khiển Admin
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Hàng 1: Thẻ thống kê */}
          {data && (
            <>
              <Grid item xs={12} sm={6} lg={3}>
                <ActionStatCard
                  title="Lớp học đang hoạt động"
                  count={data.activeClasses.toLocaleString("vi-VN")}
                  icon={<SchoolOutlinedIcon />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <ActionStatCard
                  title="Tổng số câu hỏi"
                  count={data.totalQuestions.toLocaleString("vi-VN")}
                  icon={<ArticleOutlinedIcon />}
                  color="primary"
                />
              </Grid>
            </>
          )}
          {mockAdminData.actionableStats.map((stat) => (
            <Grid key={stat.title} item xs={12} sm={6} lg={3}>
              <ActionStatCard
                title={stat.title}
                count={stat.count}
                icon={stat.icon}
                color={stat.color}
              />
            </Grid>
          ))}

          {/* SỬA: Hàng 2: Chia 3 cột đều nhau */}
          
          {/* Cột 1: Biểu đồ (Dữ liệu thật) */}
          {data && (
            <Grid item xs={12} lg={4}>
              <UserGrowthWidget data={data.chartData} />
            </Grid>
          )}

          {/* Cột 2: Top Gia sư (Mock) */}
          <Grid item xs={12} md={6} lg={4}>
            <TopTutorsWidget />
          </Grid>
          
          {/* Cột 3: Top Học sinh (Mock) */}
          <Grid item xs={12} md={6} lg={4}>
            <TopStudentsWidget />
          </Grid>

        </Grid>
      </Box>
    </Fade>
  );
}