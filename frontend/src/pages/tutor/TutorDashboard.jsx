import React, { memo } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from "@mui/material";

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";

const mockData = {
  kpiCards: [
    {
      id: 1,
      title: "Tổng học sinh (Lớp 9)",
      value: "85",
      icon: <PeopleAltOutlinedIcon />,
      color: "primary",
    },
    {
      id: 2,
      title: "Lớp phụ trách (Lớp 9)", 
      value: "3",
      icon: <SchoolOutlinedIcon />,
      color: "secondary",
    },
    {
      id: 4,
      title: "Tin nhắn mới",
      value: "3",
      icon: <ForumOutlinedIcon />,
      color: "success",
    },
  ],
  todaySchedule: [
    {
      id: 1,
      time: "09:00 - 10:00",
      title: "Lớp 9A1 - Dạy online",
      topic: "Chủ đề: Giải hệ phương trình",
    },
    {
      id: 2,
      time: "14:00 - 15:00",
      title: "Lớp 9A2 - Dạy online",
      topic: "Chủ đề: Căn bậc hai",
    },
    {
      id: 3,
      time: "16:00",
      title: "Hạn chót nộp bài",
      topic: "Kiểm tra 15 phút (Lớp 9A1)",
    },
  ],
  classProgress: [
    { id: 1, name: "Lớp 9A1", completed: 24, total: 30, color: "primary" },
    { id: 2, name: "Lớp 9A2", completed: 18, total: 25, color: "secondary" },
    { id: 3, name: "Lớp 9A3", completed: 29, total: 30, color: "success" },
  ],
  studentsToWatch: [
    {
      id: 1,
      name: "Trần Văn B",
      class: "9A2",
      metricType: "Điểm giảm",
      metricValue: "-1.5 điểm TB",
    },
    {
      id: 3,
      name: "Lê Hoàng D",
      class: "9A1",
      metricType: "Điểm giảm",
      metricValue: "-2.1 điểm TB",
    },
    {
      id: 4,
      name: "Phạm Thị E",
      class: "9A1",
      metricType: "Bỏ bài",
      metricValue: "3 bài trễ",
    },
  ],
  // (Yêu cầu 2) Chỉ Lớp 9
  hotTopics: [
    {
      id: 1,
      name: "Bài 3: Giải hệ phương trình (Lớp 9A1)",
      errorRate: 65,
    },
    {
      id: 2,
      name: "Câu 5: Biểu thức chứa căn (Lớp 9A2)",
      errorRate: 58,
    },
    {
      id: 3,
      name: "Bài 1: Hệ thức lượng (Lớp 9A1)",
      errorRate: 52,
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

// --- WIDGET COMPONENTS ---

// 1. Widget cho Q1, Q5: Thẻ KPI
const KpiCardWidget = memo(
  ({ title, value, icon, color = "primary" }) => {
    const theme = useTheme();
    const bgColor = alpha(theme.palette[color].main, 0.1);
    const iconColor = theme.palette[color].main;

    return (
      <DashboardWidget>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: bgColor,
                color: iconColor,
              }}
            >
              {icon}
            </Avatar>
            <Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {value}
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
);

// 2. Widget cho Q2: Lịch Dạy Hôm Nay
const ScheduleWidget = memo(() => {
  const theme = useTheme(); // Sửa lỗi: Thêm useTheme
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={2}>
          Lịch hôm nay
        </Typography>
        <List disablePadding>
          {mockData.todaySchedule.map((item) => (
            <ListItem key={item.id} disableGutters sx={{ py: 1.5 }}>
              <ListItemAvatar>
                <Avatar
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                >
                  <CalendarTodayOutlinedIcon color="primary" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight="500">
                    {item.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {item.time} - {item.topic}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </DashboardWidget>
  );
});

const ClassProgressWidget = memo(() => {
  const theme = useTheme(); 
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={3}>
          Tiến độ hoàn thành bài tập tuần này
        </Typography>
        <Stack spacing={3.5}>
          {mockData.classProgress.map((item) => {
            const percentage =
              item.total > 0
                ? Math.round((item.completed / item.total) * 100)
                : 0;

            return (
              <Box key={item.id}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="body1" fontWeight="500">
                    {item.name}
                  </Typography>
                  {/* (Yêu cầu 3) Hiển thị X/Y (Z%) */}
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    {`${item.completed}/${item.total} (${percentage}%)`}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={percentage} 
                  color={item.color || "primary"}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: (theme) =>
                      alpha(theme.palette[item.color || "primary"].main, 0.2),
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </DashboardWidget>
  );
});

const StudentsToWatchWidget = memo(() => {
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={2}>
          Học sinh cần chú ý
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="Bảng học sinh cần chú ý">
            <TableHead>
              <TableRow>
                <TableCell>Tên Học Sinh</TableCell>
                <TableCell>Lớp</TableCell>
                <TableCell>Vấn đề</TableCell>
                <TableCell align="center">Chi tiết</TableCell>
                <TableCell align="right">Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockData.studentsToWatch.map((row) => {
                const isWarning = row.metricType === "Bỏ bài";
                const chipColor = isWarning ? "warning" : "error";
                const chipIcon = isWarning ? (
                  <EventBusyOutlinedIcon />
                ) : (
                  <TrendingDownOutlinedIcon />
                );

                return (
                  <TableRow
                    key={row.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="subtitle2" fontWeight={600}>
                        {row.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.class}</TableCell>
                    <TableCell>
                      <Chip
                        icon={chipIcon}
                        label={row.metricType}
                        color={chipColor}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: `${chipColor}.main`,
                        fontWeight: 600,
                      }}
                    >
                      {row.metricValue}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<ChevronRightOutlinedIcon />}
                      >
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </DashboardWidget>
  );
});

// 5. Widget cho Q7: Chủ Đề Gây Khó Khăn
const HotTopicsWidget = memo(() => {
  const theme = useTheme(); 
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" fontWeight={600} mb={2}>
          Chủ Đề cần ôn tập
        </Typography>
        <List disablePadding>
          {mockData.hotTopics.map((item) => (
            <ListItem
              key={item.id}
              disableGutters
              secondaryAction={
                <Chip
                  label={`${item.errorRate}% sai`}
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              }
            >
              <ListItemAvatar>
                <Avatar
                  sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}
                >
                  <LocalFireDepartmentOutlinedIcon color="warning" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight="500">
                    {item.name}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </DashboardWidget>
  );
});

// --- MAIN DASHBOARD LAYOUT ---
function TutorDashboard() {
  return (
    <Fade in timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>

        <Grid container spacing={3}>
          {/* HÀNG 1: KPI CARDS (3 Thẻ) */}
          {mockData.kpiCards.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <KpiCardWidget
                title={item.title}
                value={item.value}
                icon={item.icon}
                color={item.color}
              />
            </Grid>
          ))}

          {/* HÀNG 2: LỊCH DẠY (Q2) & TIẾN ĐỘ (Q3) */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <ScheduleWidget />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ClassProgressWidget />
          </Grid>

          {/* HÀNG 3: CAN THIỆP (Q6) & CHỦ ĐỀ NÓNG (Q7) */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <StudentsToWatchWidget />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <HotTopicsWidget />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}

export default memo(TutorDashboard);