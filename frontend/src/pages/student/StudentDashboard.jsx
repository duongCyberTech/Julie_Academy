import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip as RechartsTooltip
} from "recharts";
import { useNavigate } from "react-router-dom";

// Icons
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import StarIcon from "@mui/icons-material/Star";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";

// MOCK DATA TẠM THỜI
import { 
  MOCK_USER_PROFILE, 
  MOCK_BADGES, 
  MOCK_SUGGESTIONS,
  MOCK_PROGRESS_DATA, 
  MOCK_SKILL_MAP,     
  MOCK_EXAM_HISTORY   
} from "./MockDashboardData";

// --- HELPER FUNCTIONS ---
const calculateDaysJoined = (dateString) => {
  if (!dateString) return 0;
  const diffTime = Math.abs(new Date() - new Date(dateString));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// --- SUB-COMPONENTS ---
const StatCard = ({ title, value, icon, color, subtext }) => (
  <Card sx={{ 
    height: "100%", 
    borderRadius: 3, 
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)", 
    border: "1px solid #f0f0f0" 
  }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar variant="rounded" sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56, borderRadius: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            {value}
          </Typography>
        </Box>
      </Stack>
      {subtext && (
        <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.secondary", bgcolor: "grey.50", p: 1, borderRadius: 1 }}>
          {subtext}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// --- MAIN DASHBOARD ---
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // States bộ lọc Biểu đồ
  const [progressTimeRange, setProgressTimeRange] = useState("week");
  const [progressSubject, setProgressSubject] = useState("all");
  
  // States bộ lọc Bảng Lịch sử
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activityType, setActivityType] = useState("all");
  
  // States Phân trang (Pagination)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State UI
  const [openBadgeDialog, setOpenBadgeDialog] = useState(false);

  // Fake Loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  // Xử lý Phân trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Logic Lọc Dữ liệu Bảng (Tạm thời lọc trên Mock Data để bạn thấy UI)
  const getFilteredActivities = () => {
    let filtered = [...MOCK_EXAM_HISTORY];
    if (activityType !== "all") {
      filtered = filtered.filter(item => item.exam.exam_type === activityType);
    }
    // (Sau này API sẽ đảm nhận việc lọc này thông qua Query params)
    return filtered;
  };

  const filteredActivities = getFilteredActivities();
  const paginatedActivities = filteredActivities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const displayedBadges = MOCK_BADGES.slice(0, 5);
  const remainingBadgesCount = MOCK_BADGES.length - 5;

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      
      {/* 1. HEADER ROW */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Avatar src={MOCK_USER_PROFILE.avatar_url} sx={{ width: 72, height: 72, border: "3px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: "-0.5px" }}>
              Xin chào, {MOCK_USER_PROFILE.fname}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {MOCK_USER_PROFILE.student.school} • Thành viên {calculateDaysJoined(MOCK_USER_PROFILE.createAt)} ngày
            </Typography>
          </Box>
        </Stack>

        <Paper elevation={0} sx={{ p: 1, border: "1px solid #e0e0e0", borderRadius: 4, display: 'flex', alignItems: 'center', gap: 1, bgcolor: "#fff" }}>
          {displayedBadges.map((badge) => (
            <Tooltip key={badge.badge_id} title={badge.title}>
              <Avatar sx={{ bgcolor: badge.color, width: 40, height: 40, fontSize: "1.1rem", cursor: "pointer" }}>{badge.icon}</Avatar>
            </Tooltip>
          ))}
          {remainingBadgesCount > 0 && (
            <Avatar sx={{ bgcolor: "grey.200", color: "text.primary", width: 40, height: 40, fontSize: "0.9rem", cursor: "pointer", fontWeight: "bold" }} onClick={() => setOpenBadgeDialog(true)}>
              +{remainingBadgesCount}
            </Avatar>
          )}
        </Paper>
      </Box>

      {/* 2. STATS ROW */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Điểm bài mới nhất" value="8.5" icon={<StarIcon />} color="warning" subtext="Tiếp tục phát huy nhé!" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Lớp đang tham gia" value="3" icon={<SchoolIcon />} color="info" subtext="Toán, Lý, Hóa" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Giờ luyện tập" value="12.5h" icon={<AccessTimeFilledIcon />} color="success" subtext="Tính trên bài thực hành" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Điểm trung bình" value="8.2" icon={<WorkspacePremiumIcon />} color="error" subtext="Top 15% của lớp" /></Grid>
      </Grid>

      {/* 3. CHARTS ROW (SỬ DỤNG CSS GRID THEO ĐỀ XUẤT CỦA BẠN: 1fr 340px) */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '1fr 340px', xl: '1fr 580px' }, 
        gap: 3, 
        mb: 4,
        alignItems: 'stretch' // Giúp 2 cột cao bằng nhau
      }}>
        
        {/* CỘT TRÁI (Biểu đồ đường - Chiếm không gian còn lại: 1fr) */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e0e0e0", display: "flex", flexDirection: "column", height: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>📈 Xu hướng điểm số</Typography>
              <Typography variant="body2" color="text.secondary">Kết quả các bài làm gần đây</Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Môn học</InputLabel>
                <Select value={progressSubject} label="Môn học" onChange={(e) => setProgressSubject(e.target.value)}>
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="Toán">Toán</MenuItem>
                  <MenuItem value="Lý">Lý</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={progressTimeRange} onChange={(e) => setProgressTimeRange(e.target.value)}>
                  <MenuItem value="week">Tuần này</MenuItem>
                  <MenuItem value="month">Tháng này</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
          
          <Box sx={{ flexGrow: 1, minHeight: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_PROGRESS_DATA.week}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#666'}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{fontSize: 12, fill: '#666'}} axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="score" name="Điểm số" stroke="#2196f3" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* CỘT PHẢI (Radar Chart & Gợi ý - Được khóa cứng kích thước 340px) */}
        <Stack spacing={3} sx={{ height: "100%" }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e0e0e0", flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle1" fontWeight={700} align="center" gutterBottom>🕸️ Bản đồ Kỹ năng</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 220 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MOCK_SKILL_MAP}>
                   <PolarGrid stroke="#e0e0e0" />
                   <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#666' }} />
                   <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                   <Radar name="Kỹ năng" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                   <RechartsTooltip />
                 </RadarChart>
               </ResponsiveContainer>
            </Box>
          </Paper>

          <Card sx={{ borderRadius: 3, bgcolor: "#f8f9fa", border: "1px solid #e0e0e0", boxShadow: "none" }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <AutoAwesomeIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">Gợi ý AI</Typography>
              </Stack>
              <List dense disablePadding>
                {MOCK_SUGGESTIONS.slice(0, 2).map((item, index) => (
                  <ListItem key={item.id} sx={{ px: 0, py: 1, borderBottom: index === 0 ? "1px dashed #e0e0e0" : "none" }}>
                    <ListItemText 
                      primary={<Typography variant="body2" fontWeight={600} color="text.primary">{item.title}</Typography>}
                      secondary={<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{item.reason}</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* 4. BẢNG HOẠT ĐỘNG GẦN ĐÂY CÓ FILTER DROP-DOWN VÀ PAGINATION */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0", overflow: 'hidden', boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)" }}>
        
        {/* Khu vực Filter Header */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, py: 2, bgcolor: '#fff' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FilterListIcon color="action" />
              <Typography variant="h6" fontWeight={700}>Lịch sử hoạt động</Typography>
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              {/* Filter: Loại bài */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Loại bài</InputLabel>
                <Select value={activityType} label="Loại bài" onChange={(e) => { setActivityType(e.target.value); setPage(0); }}>
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="practice">Luyện tập (Practice)</MenuItem>
                  <MenuItem value="test">Kiểm tra (Test)</MenuItem>
                  <MenuItem value="adaptive">Thích ứng (Adaptive)</MenuItem>
                </Select>
              </FormControl>
              
              {/* Filter: Từ ngày - Đến ngày */}
              <TextField label="Từ ngày" type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <TextField label="Đến ngày" type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Stack>
          </Stack>
        </Box>

        <TableContainer sx={{ maxHeight: 450 }}>
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#fafafa", fontWeight: 700 }}>Tên bài</TableCell>
                <TableCell sx={{ bgcolor: "#fafafa", fontWeight: 700 }}>Môn học</TableCell>
                <TableCell align="center" sx={{ bgcolor: "#fafafa", fontWeight: 700 }}>Loại</TableCell>
                <TableCell align="center" sx={{ bgcolor: "#fafafa", fontWeight: 700 }}>Điểm số</TableCell>
                <TableCell align="right" sx={{ bgcolor: "#fafafa", fontWeight: 700 }}>Thời gian nộp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedActivities.length > 0 ? (
                paginatedActivities.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell><Typography variant="body2" fontWeight={500} color="text.primary">{row.exam.title}</Typography></TableCell>
                    <TableCell><Chip label={row.exam.class.subject} size="small" variant="outlined" sx={{ borderRadius: 1 }} /></TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={row.exam.exam_type.toUpperCase()} 
                        size="small" 
                        color={row.exam.exam_type === 'test' ? 'error' : row.exam.exam_type === 'adaptive' ? 'secondary' : 'default'}
                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={700} color={row.final_score >= 8 ? "success.main" : row.final_score >= 5 ? "warning.main" : "error.main"}>
                        {row.final_score}
                      </Typography>
                    </TableCell>
                    <TableCell align="right"><Typography variant="body2" color="text.secondary">{new Date(row.doneAt).toLocaleString("vi-VN")}</Typography></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">Không tìm thấy hoạt động nào phù hợp. 🍃</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Phân trang (Pagination) */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredActivities.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} trên ${count !== -1 ? count : `hơn ${to}`}`}
        />
      </Paper>

      {/* DIALOG HUY HIỆU */}
      <Dialog open={openBadgeDialog} onClose={() => setOpenBadgeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
          Bộ sưu tập Huy hiệu
          <IconButton onClick={() => setOpenBadgeDialog(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {MOCK_BADGES.map((badge) => (
              <Grid item xs={12} sm={6} key={badge.badge_id}>
                <Paper variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: badge.color, width: 48, height: 48, fontSize: "1.5rem" }}>{badge.icon}</Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{badge.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{badge.description}</Typography>
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