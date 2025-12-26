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
