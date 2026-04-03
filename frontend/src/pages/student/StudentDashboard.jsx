import React, { useState, useEffect } from "react";
import axios from "axios"; 
import {
  Container, Paper, Typography, Box, Card, CardContent, Avatar, Stack, Chip,
  LinearProgress, FormControl, Select, MenuItem, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Dialog, DialogTitle, DialogContent, IconButton, Grid, Pagination, TextField
} from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RechartsTooltip,
  BarChart, Bar
} from "recharts";

import SchoolIcon from "@mui/icons-material/School";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import StarIcon from "@mui/icons-material/Star";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";


const BASE_URL = "http://localhost:4000"; 
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); 
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Nhờ ai thêm cho vui chưa sửa
const MOCK_AI_SUGGESTIONS = [
  { id: 1, title: "🆘 Báo động đỏ: Hàm số", reason: "Tỷ lệ đúng ở bài Thích ứng chỉ đạt 30%. Hãy ôn lại ngay để chuẩn bị cho kỳ thi CUỐI KỲ sắp tới." },
  { id: 2, title: "⚠️ Cần cải thiện: Hình học không gian", reason: "Bạn thường xuyên sai phần tính khoảng cách. Kỳ thi GIỮA KỲ đang đến rất gần." },
  { id: 3, title: "⭐ Duy trì phong độ: Xác suất", reason: "Bạn đang làm rất tốt phần này. Hãy tiếp tục phát huy ở các bài Test nhé!" },
];

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);

  // 1. States cho 4 Cards (Stats)
  const [stats, setStats] = useState({ latestScore: 0, totalPracticeTime: 0, numJoinClassess: {total_classes: 0}, avgTestScore: 0 });

  // 2. States cho Line Chart (Trend)
  const [trendData, setTrendData] = useState([]);
  const [progressTimeRange, setProgressTimeRange] = useState("week");
  const [progressExamType, setProgressExamType] = useState("all");

  // 3. States cho Radar Chart (Skills Map)
  const [myPlans, setMyPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [radarData, setRadarData] = useState([]);

  // 4. States cho Drill Down (Chi tiết Radar)
  const [openDrillDown, setOpenDrillDown] = useState(false);
  const [selectedChapterName, setSelectedChapterName] = useState("");
  const [drillDownData, setDrillDownData] = useState([]);

  // 5. States cho History Table
  const [historyData, setHistoryData] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [activityType, setActivityType] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  // 6. States AI Pagination
  const [aiPage, setAiPage] = useState(1);
  const aiItemsPerPage = 2;

  // Fetch 4 Cards Stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dashboard/student-stats`, getAuthHeaders());
      setStats(res.data);
    } catch (error) { console.error("Error fetching stats:", error); }
  };

  // Fetch Danh sách Sách 
  const fetchMyPlans = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/books`, getAuthHeaders());
      const plans = res.data.map(p => ({ id: p.plan_id, name: p.title }));
      setMyPlans(plans);
      if (plans.length > 0) setSelectedPlan(plans[0].id);
    } catch (error) { console.error("Error fetching plans:", error); }
  };

  // Fetch Line Chart Data
  const fetchTrend = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dashboard/student/score-trend`, {
        ...getAuthHeaders(),
        params: { group_time: progressTimeRange, exam_type: progressExamType }
      });
      const formattedTrend = res.data.score_trend.map(item => ({
        name: item.label,
        score: Number(item.averageScore).toFixed(1)
      }));
      setTrendData(formattedTrend);
    } catch (error) { console.error("Error fetching trend:", error); }
  };

  // Fetch Radar Chart Data
  const fetchRadar = async () => {
    if (!selectedPlan) return;
    try {
      const res = await axios.get(`${BASE_URL}/dashboard/student/skills-map`, {
        ...getAuthHeaders(),
        params: { plan_id: selectedPlan }
      });
      
      const formattedRadar = res.data.map(item => {
        const total = item.correct_cnt + item.fail_cnt;
        const percent = total === 0 ? 0 : Math.round((item.correct_cnt / total) * 100);
        return {
          chapter_id: item.category_id,
          subject: item.category_name,
          A: percent
        };
      });
      setRadarData(formattedRadar);
    } catch (error) { console.error("Error fetching radar:", error); }
  };

  // Fetch History Table
  const fetchHistory = async () => {
    try {
      const params = { limit: rowsPerPage, page: page + 1 };
      
      if (activityType !== 'all') params.exam_type = activityType;
      if (startDate) params.startAt = startDate;
      if (endDate) params.endAt = endDate;

      const res = await axios.get(`${BASE_URL}/dashboard/student/current-test`, {
        ...getAuthHeaders(),
        params
      });
      setHistoryData(res.data);
    } catch (error) { console.error("Error fetching history:", error); }
  };


  useEffect(() => {
    // Chạy 1 lần khi load trang
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchMyPlans()]);
      setLoading(false);
    };
    initData();
  }, []);

  useEffect(() => { fetchTrend(); }, [progressTimeRange, progressExamType]);
  useEffect(() => { fetchHistory(); }, [activityType, page, rowsPerPage, startDate, endDate]);
  useEffect(() => { fetchRadar(); }, [selectedPlan]); 
  const handleRadarClick = async (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const chapter = data.activePayload[0].payload;
      setSelectedChapterName(chapter.subject);
      
      try {
        // Gọi API: Drill down
        const res = await axios.get(`${BASE_URL}/dashboard/student/skills-map/${chapter.chapter_id}`, {
          ...getAuthHeaders(),
          params: { plan_id: selectedPlan }
        });
        
        const formattedDrillDown = res.data.map(item => {
          const total = item.correct_cnt + item.fail_cnt;
          const percent = total === 0 ? 0 : Math.round((item.correct_cnt / total) * 100);
          return { topic: item.category_name, percent: percent };
        });

        setDrillDownData(formattedDrillDown);
        setOpenDrillDown(true);
      } catch (error) {
        console.error("Error fetching drill down:", error);
      }
    }
  };

  // AI Pagination logic
  const currentAiSuggestions = MOCK_AI_SUGGESTIONS.slice((aiPage - 1) * aiItemsPerPage, aiPage * aiItemsPerPage);

  if (loading) return <LinearProgress />;

  // Component Thẻ thống kê
  const StatCard = ({ title, value, icon, color, subtext }) => (
    <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 48, height: 48, borderRadius: 2 }}>{icon}</Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>{title}</Typography>
            <Typography variant="h5" fontWeight={800} color="text.primary">{value}</Typography>
          </Box>
        </Stack>
        {subtext && <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.secondary", bgcolor: "grey.50", p: 1, borderRadius: 1 }}>{subtext}</Typography>}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      
      {/* 1. CARDS ROW */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 4 }}>
        <StatCard title="Điểm bài mới nhất" value={stats.latestScore} icon={<StarIcon />} color="warning" subtext="Loại bài: Kiểm tra (Test)" />
        <StatCard title="Lớp đang tham gia" value={stats.numJoinClassess?.total_classes || 0} icon={<SchoolIcon />} color="info" subtext="Các lớp học hiện tại" />
        <StatCard title="Giờ luyện tập" value={`${stats.totalPracticeTime || 0}h`} icon={<AccessTimeFilledIcon />} color="success" subtext="Tính trên bài Thích ứng" />
        <StatCard title="Điểm trung bình" value={stats.avgTestScore} icon={<WorkspacePremiumIcon />} color="error" subtext="Tính trên các bài Kiểm tra" />
      </Box>

      {/* 2. CHARTS ROW */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' }, gap: 3, mb: 4, alignItems: 'stretch' }}>
        
        {/* LINE CHART */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e0e0e0", display: "flex", flexDirection: "column" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h6" fontWeight={700}>📈 Xu hướng điểm số</Typography>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Loại bài</InputLabel>
                <Select value={progressExamType} label="Loại bài" onChange={(e) => setProgressExamType(e.target.value)}>
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="practice">Luyện tập</MenuItem>
                  <MenuItem value="test">Kiểm tra</MenuItem>
                  <MenuItem value="adaptive">Thích ứng</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={progressTimeRange} onChange={(e) => setProgressTimeRange(e.target.value)}>
                  <MenuItem value="week">Tuần này</MenuItem>
                  <MenuItem value="month">Tháng này</MenuItem>
                  <MenuItem value="term">Học kỳ</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
          <Box sx={{ flexGrow: 1, minHeight: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#666'}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{fontSize: 12, fill: '#666'}} axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="score" name="Điểm số" stroke="#2196f3" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* RADAR CHART */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e0e0e0", display: "flex", flexDirection: "column" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>🕸️ Bản đồ Kỹ năng</Typography>
          </Stack>
          <FormControl size="small" fullWidth sx={{ mb: 2 }}>
            <InputLabel>Chọn Sách / Lộ trình</InputLabel>
            <Select value={selectedPlan} label="Chọn Sách / Lộ trình" onChange={(e) => setSelectedPlan(e.target.value)}>
              {myPlans.map(plan => (
                <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', fontStyle: 'italic' }}>
            * Click vào tên chương để xem chi tiết
          </Typography>
          <Box sx={{ flexGrow: 1, minHeight: 250, cursor: 'pointer' }}>
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData} onClick={handleRadarClick}>
                 <PolarGrid stroke="#e0e0e0" />
                 <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#333', fontWeight: 600 }} />
                 <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                 <Radar name="Độ thông thạo (%)" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                 <RechartsTooltip />
               </RadarChart>
             </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      {/* 3. AI SUGGESTIONS*/}
      <Card sx={{ borderRadius: 3, bgcolor: "#f0f4f8", border: "1px solid #d9e2ec", boxShadow: "none", mb: 4 }}>
        <CardContent sx={{ p: 3, pb: "16px !important" }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6" fontWeight={700} color="primary.dark">Cố vấn học tập AI</Typography>
            <Chip label="Phân tích từ bài Thích ứng" size="small" sx={{ ml: 2, bgcolor: "primary.light", color: "primary.dark", fontWeight: 600, fontSize: '0.7rem' }}/>
          </Stack>
          
          <Grid container spacing={2}>
            {currentAiSuggestions.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0", height: "100%" }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.reason}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={Math.ceil(MOCK_AI_SUGGESTIONS.length / aiItemsPerPage)} 
              page={aiPage} 
              onChange={(e, val) => setAiPage(val)} 
              color="primary" 
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* 4. HISTORY TABLE */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0", overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, py: 2, bgcolor: '#fff' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FilterListIcon color="action" />
              <Typography variant="h6" fontWeight={700}>Lịch sử hoạt động</Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Từ ngày"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              />
              <TextField
                label="Đến ngày"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
              />
        
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={activityType} onChange={(e) => { setActivityType(e.target.value); setPage(0); }}>
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="practice">Luyện tập</MenuItem>
                <MenuItem value="test">Kiểm tra</MenuItem>
                <MenuItem value="adaptive">Thích ứng</MenuItem>
              </Select>
            </FormControl>
            </Stack>
          </Stack>
        </Box>

        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Tên bài</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Môn học</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Loại</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Thời gian nộp</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Điểm số</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyData.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell><Typography variant="body2" fontWeight={500}>{row.title || 'Bài tập'}</Typography></TableCell>
                  <TableCell><Chip label={row.subject || 'N/A'} size="small" variant="outlined" /></TableCell>

                  {/* Hiển thị chip theo loại bài */}
                  <TableCell align="center">
                    <Chip 
                      label={row.exam_type ? row.exam_type.toUpperCase() : 'PRACTICE'} 
                      size="small" 
                      color={row.exam_type === 'test' ? 'error' : row.exam_type === 'adaptive' ? 'secondary' : 'default'} 
                      sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                    />
                  </TableCell>

                  <TableCell align="center"><Typography variant="body2">{new Date(row.doneAt).toLocaleDateString('vi-VN')}</Typography></TableCell>
                  <TableCell align="center"><Typography fontWeight={700}>{row.score}</Typography></TableCell>
                </TableRow>
              ))}
              {historyData.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={4} align="center" sx={{py: 3}}>Chưa có lịch sử làm bài</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10]} component="div" count={historyTotal > 0 ? historyTotal : -1} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} labelRowsPerPage="Số dòng:" />
      </Paper>

      {/* Dialog chi tiết chủ đề theo chương */}
      <Dialog open={openDrillDown} onClose={() => setOpenDrillDown(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
          Phân tích: {selectedChapterName}
          <IconButton onClick={() => setOpenDrillDown(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tỷ lệ thông thạo các chủ đề con (dựa trên bài Luyện tập Thích ứng).
          </Typography>
          <Box sx={{ width: '100%', height: 250, mt: 2 }}>
            <ResponsiveContainer>
              <BarChart data={drillDownData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="topic" type="category" width={100} tick={{fontSize: 12}} />
                <RechartsTooltip />
                <Bar dataKey="percent" name="Độ thông thạo (%)" fill="#8884d8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}