<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Card, CardContent, Avatar, Stack, Chip,
  List, ListItem, ListItemAvatar, ListItemText, Divider, LinearProgress,
  FormControl, Select, MenuItem, InputLabel, Button, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, TextField, IconButton
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
  BarChart, Bar, ReferenceLine, Tooltip as RechartsTooltip,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import StarIcon from '@mui/icons-material/Star';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Import Mock Data
import { 
  MOCK_USER_PROFILE, MOCK_BADGES, 
  MOCK_PROGRESS_DATA, MOCK_COMPARISON_DATA, 
  MOCK_TIME_DISTRIBUTION, MOCK_SKILL_MAP,
  MOCK_SUGGESTIONS, MOCK_EXAM_HISTORY, MOCK_ACTIVE_CLASSES
} from './MockDashboardData';

// --- HELPER FUNCTIONS ---
const calculateDaysJoined = (dateString) => {
  const joinDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - joinDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

const calculateStudyHours = (history) => {
  if (!history) return 0;
  const validSessions = history.filter(item => item.exam && (item.exam.exam_type === 'practice' || item.exam.exam_type === 'test'));
  let totalMinutes = 0;
  validSessions.forEach(session => {
    const start = new Date(session.startAt);
    const end = new Date(session.doneAt);
    const diffMs = end - start;
    if (diffMs > 0) totalMinutes += Math.round(diffMs / 60000);
  });
  return (totalMinutes / 60).toFixed(1);
};

const getLatestScore = (history) => {
  if (!history || history.length === 0) return 0;
  const sorted = [...history].sort((a, b) => new Date(b.doneAt) - new Date(a.doneAt));
  return sorted[0].final_score;
};

// --- SUB-COMPONENTS ---
const StatCard = ({ title, value, icon, color, subtext }) => (
  <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar variant="rounded" sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56, borderRadius: 3 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{title}</Typography>
        </Box>
      </Stack>
      {subtext && <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', bgcolor: 'grey.50', p: 0.5, borderRadius: 1, textAlign: 'center' }}>{subtext}</Typography>}
    </CardContent>
  </Card>
);

// --- MAIN DASHBOARD ---
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // States cho Biểu đồ
  const [progressTimeRange, setProgressTimeRange] = useState('week');
  const [progressSubject, setProgressSubject] = useState('all'); // Mới thêm: Lọc môn học cho biểu đồ xu hướng
  const [comparisonTimeRange, setComparisonTimeRange] = useState('month');

  // States cho Hoạt động gần đây (Lịch sử)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false); // Trạng thái mở rộng bảng

  // States cho Huy hiệu
  const [openBadgeDialog, setOpenBadgeDialog] = useState(false);

  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);

  // --- LOGIC LỌC DỮ LIỆU ---
  
  // 1. Lọc Lịch sử Hoạt động theo ngày
  const getFilteredHistory = () => {
    let data = [...MOCK_EXAM_HISTORY];
    
    // Sắp xếp mới nhất lên đầu
    data.sort((a, b) => new Date(b.doneAt) - new Date(a.doneAt));

    if (startDate) {
        data = data.filter(item => new Date(item.doneAt) >= new Date(startDate));
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        data = data.filter(item => new Date(item.doneAt) <= end);
    }
    return data;
  };

  const filteredHistory = getFilteredHistory();
  const displayedHistory = isHistoryExpanded ? filteredHistory : filteredHistory.slice(0, 5);

  // 2. Logic Huy hiệu
  const MAX_BADGES_DISPLAY = 5;
  const displayedBadges = MOCK_BADGES.slice(0, MAX_BADGES_DISPLAY);
  const remainingBadgesCount = MOCK_BADGES.length - MAX_BADGES_DISPLAY;

  // 3. Logic Lọc Biểu đồ Xu hướng (Nâng cao)
  const getFilteredProgressData = () => {
    let data = MOCK_PROGRESS_DATA[progressTimeRange] || [];

    // Lọc theo môn học
    if (progressSubject !== 'all') {
        data = data.filter(item => item.subject === progressSubject);
    } 
    // Nếu chọn tất cả môn ở view Tháng/Kỳ -> Gom nhóm tính trung bình để biểu đồ gọn
    else if (progressTimeRange !== 'week') {
        const grouped = data.reduce((acc, curr) => {
            if (!acc[curr.name]) acc[curr.name] = { sum: 0, count: 0, name: curr.name };
            acc[curr.name].sum += curr.score;
            acc[curr.name].count += 1;
            return acc;
        }, {});
        data = Object.values(grouped).map(item => ({
            name: item.name,
            score: parseFloat((item.sum / item.count).toFixed(1)),
            subject: 'Trung bình'
        }));
    }
    return data;
  };

  const currentComparisonData = MOCK_COMPARISON_DATA[comparisonTimeRange] || [];

  if (loading) return <Container sx={{ mt: 4 }}><LinearProgress /></Container>;

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 5 }}>
      
      {/* 1. HEADER */}
      <Box sx={{ mb: 4 }}>
        <Grid container alignItems="center" spacing={2}>
            <Grid item><Avatar src={MOCK_USER_PROFILE.avata_url} sx={{ width: 80, height: 80, border: '3px solid #fff', boxShadow: 2 }} /></Grid>
            <Grid item xs>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>Xin chào, {MOCK_USER_PROFILE.fname}! 👋</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip icon={<DateRangeIcon />} label={`Thành viên: ${calculateDaysJoined(MOCK_USER_PROFILE.createAt)} ngày`} color="primary" variant="outlined" size="small" />
                    <Chip icon={<SchoolIcon />} label={MOCK_USER_PROFILE.student.school} size="small" variant="outlined" />
                </Stack>
            </Grid>
            
            {/* KHU VỰC HUY HIỆU */}
            <Grid item>
                <Paper elevation={0} sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {displayedBadges.map(badge => (
                            <Tooltip key={badge.badge_id} title={badge.title}>
                                <Avatar sx={{ bgcolor: badge.color, width: 40, height: 40, fontSize: '1.2rem', cursor: 'pointer' }}>
                                    {badge.icon}
                                </Avatar>
                            </Tooltip>
                        ))}
                        {remainingBadgesCount > 0 && (
                            <Tooltip title="Xem tất cả huy hiệu">
                                <Avatar 
                                    sx={{ bgcolor: 'grey.300', color: 'grey.800', width: 40, height: 40, fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold' }}
                                    onClick={() => setOpenBadgeDialog(true)}
                                >
                                    +{remainingBadgesCount}
                                </Avatar>
                            </Tooltip>
                        )}
                    </Stack>
                </Paper>
            </Grid>
        </Grid>
      </Box>

      {/* 2. STATS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Điểm bài mới nhất" value={getLatestScore(MOCK_EXAM_HISTORY)} icon={<StarIcon />} color="warning" subtext="Cố gắng phát huy!" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Lớp đang tham gia" value={MOCK_ACTIVE_CLASSES.length} icon={<SchoolIcon />} color="info" subtext={MOCK_ACTIVE_CLASSES.map(c => c.subject).join(', ')} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Giờ luyện tập" value={`${calculateStudyHours(MOCK_EXAM_HISTORY)}h`} icon={<AccessTimeFilledIcon />} color="success" subtext="Tính trên bài thực hành" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Điểm trung bình" value="8.2" icon={<WorkspacePremiumIcon />} color="error" subtext="Top 15% của lớp" /></Grid>
      </Grid>

      {/* 3. CHARTS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* TIẾN ĐỘ & SO SÁNH */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            
            {/* Chart 1: Xu hướng điểm số (Có lọc Môn + Thời gian) */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>📈 Xu hướng điểm số</Typography>
                        <Typography variant="caption" color="text.secondary">Kết quả các bài kiểm tra gần đây</Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Môn học</InputLabel>
                            <Select value={progressSubject} label="Môn học" onChange={(e) => setProgressSubject(e.target.value)}>
                                <MenuItem value="all">Tất cả</MenuItem>
                                <MenuItem value="Toán">Toán</MenuItem>
                                <MenuItem value="Lý">Lý</MenuItem>
                                <MenuItem value="Hóa">Hóa</MenuItem>
                                <MenuItem value="Anh">Anh</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select value={progressTimeRange} onChange={(e) => setProgressTimeRange(e.target.value)}>
                                <MenuItem value="week">Tuần này</MenuItem>
                                <MenuItem value="month">Tháng này</MenuItem>
                                <MenuItem value="semester">Học kỳ</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>
                <Box sx={{ height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={getFilteredProgressData()}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 10]} />
                            <RechartsTooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="score" 
                                name={progressSubject === 'all' ? "Điểm trung bình" : "Điểm số"} 
                                stroke="#2196f3" 
                                strokeWidth={3} 
                                dot={{r:4}} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>

            {/* Chart 2: So sánh (Có lọc Thời gian) */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>📊 So sánh với lớp</Typography>
                        <Typography variant="caption" color="text.secondary">Điểm trung bình của bạn vs Lớp</Typography>
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select value={comparisonTimeRange} onChange={(e) => setComparisonTimeRange(e.target.value)}>
                            <MenuItem value="week">Tuần này</MenuItem>
                            <MenuItem value="month">Tháng này</MenuItem>
                            <MenuItem value="semester">Cả kỳ</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
                <Box sx={{ height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={currentComparisonData} barGap={2} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="subject" />
                            <YAxis domain={[0, 10]} />
                            <RechartsTooltip cursor={{fill: 'transparent'}} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="myAvg" name="Bạn" fill="#4caf50" radius={[4, 4, 0, 0]} barSize={30} />
                            <Bar dataKey="classAvg" name="TB Lớp" fill="#ff9800" radius={[4, 4, 0, 0]} barSize={30} />
                            <ReferenceLine y={5} stroke="red" strokeDasharray="3 3" label={{ value: 'Đạt', position: 'insideTopRight', fill: 'red', fontSize: 10 }} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* CỘT PHẢI: KỸ NĂNG, PIE, AI */}
        <Grid item xs={12} md={4}>
            <Stack spacing={3}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" fontWeight={700} align="center" gutterBottom>🕸️ Bản đồ Kỹ năng</Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MOCK_SKILL_MAP}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{fontSize: 11}} />
                                <PolarRadiusAxis domain={[0, 100]} angle={30} />
                                <Radar name="Điểm năng lực" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <RechartsTooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" fontWeight={700} align="center" gutterBottom>⏳ Phân bổ thời gian</Typography>
                    <Box sx={{ height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={MOCK_TIME_DISTRIBUTION} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {MOCK_TIME_DISTRIBUTION.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <RechartsTooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '12px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                <Card sx={{ borderRadius: 3, bgcolor: '#e8eaf6', border: '1px solid #c5cae9' }}>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <AutoAwesomeIcon color="primary" />
                            <Typography variant="h6" fontWeight={700} color="primary.main">Gợi ý</Typography>
                        </Stack>
                        <List dense disablePadding>
                            {MOCK_SUGGESTIONS.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemAvatar sx={{ minWidth: 40 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'white', color: 'primary.main', border: '1px solid #c5cae9' }}>
                                                {item.type === 'topic' ? <TrendingUpIcon fontSize="small"/> : <SchoolIcon fontSize="small"/>}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={<Typography variant="subtitle2" fontWeight={600}>{item.title}</Typography>} secondary={item.reason} />
                                    </ListItem>
                                    <Button size="small" variant="outlined" fullWidth onClick={() => navigate('/student/practice')} sx={{ mb: 1 }}>Học ngay</Button>
                                    {index < MOCK_SUGGESTIONS.length - 1 && <Divider sx={{ my: 1 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Stack>
        </Grid>
      </Grid>

      {/* 4. HOẠT ĐỘNG GẦN ĐÂY (LỊCH SỬ) - CÓ BỘ LỌC NGÀY & NÚT MỞ RỘNG */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Grid container alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight={700}>📚 Hoạt động gần đây</Typography>
            </Grid>
            
            {/* Bộ lọc Từ ngày - Đến ngày */}
            <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                    <TextField
                        label="Từ ngày"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <TextField
                        label="Đến ngày"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </Stack>
            </Grid>
        </Grid>

        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell><strong>Tên bài / Hoạt động</strong></TableCell>
                        <TableCell><strong>Môn học</strong></TableCell>
                        <TableCell align="center"><strong>Điểm số</strong></TableCell>
                        <TableCell align="right"><strong>Thời gian</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {displayedHistory.length > 0 ? (
                        displayedHistory.map((row) => (
                            <TableRow key={row.et_id} hover>
                                <TableCell component="th" scope="row">
                                    <Typography variant="body2" fontWeight={500}>{row.exam.title}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={row.exam.class.subject} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell align="center">
                                    <Chip 
                                        label={row.final_score} 
                                        color={row.final_score >= 8 ? "success" : row.final_score >= 5 ? "warning" : "error"} 
                                        size="small" 
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    {new Date(row.doneAt).toLocaleString('vi-VN')}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                <Typography color="text.secondary">Không tìm thấy hoạt động nào trong khoảng thời gian này.</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>

        {/* Nút Xem tất cả / Thu gọn */}
        {filteredHistory.length > 5 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                    variant="text" 
                    endIcon={isHistoryExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                >
                    {isHistoryExpanded ? 'Thu gọn' : `Xem tất cả (${filteredHistory.length})`}
                </Button>
            </Box>
        )}
      </Paper>

      {/* DIALOG HIỂN THỊ TẤT CẢ HUY HIỆU */}
      <Dialog open={openBadgeDialog} onClose={() => setOpenBadgeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Bộ sưu tập Huy hiệu
            <IconButton onClick={() => setOpenBadgeDialog(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
            <Grid container spacing={2}>
                {MOCK_BADGES.map((badge) => (
                    <Grid item xs={12} sm={6} key={badge.badge_id}>
                        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: badge.color, width: 50, height: 50, fontSize: '1.5rem' }}>
                                {badge.icon}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700}>{badge.title}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: 'block' }}>
                                    {badge.description}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                                    Nhận ngày: {new Date(badge.claimedAt).toLocaleDateString('vi-VN')}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </DialogContent>
      </Dialog>

    </Container>
  );
}
=======
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
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
