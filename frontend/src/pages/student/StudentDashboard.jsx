import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // <-- Thêm import này để dùng chức năng chuyển trang
import {
  Paper, Typography, Box, Card, CardContent, Avatar, Stack, Chip,
  LinearProgress, FormControl, Select, MenuItem, InputLabel,
  Dialog, DialogTitle, DialogContent, IconButton, Grid, TextField, Button, Tooltip
} from "@mui/material";
import { styled, useTheme, alpha, keyframes } from "@mui/material/styles";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RechartsTooltip,
  BarChart, Bar
} from "recharts";

// Icons
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import StarIcon from "@mui/icons-material/Star";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import QuizIcon from '@mui/icons-material/Quiz';
import AutoModeIcon from '@mui/icons-material/AutoMode';

// Import Services
import {
  getStudentStats, getMyPlans, getScoreTrend, getSkillsMap, getSkillsMapDrillDown, getHistory
} from "../../services/DashboardStudentService";

// --- ANIMATIONS ---
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;
const dropAnimation = keyframes`
  0% { transform: translateY(-20px) scale(0.8); opacity: 0; }
  50% { transform: translateY(0px) scale(1.2); opacity: 1; }
  100% { transform: translateY(10px) scale(1); opacity: 0; }
`;

// --- STYLED COMPONENTS ---
const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3), padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none', borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column',
    [theme.breakpoints.down('md')]: { margin: theme.spacing(1), padding: theme.spacing(2) }
  };
});

const TreeProgress = styled(LinearProgress)(({ theme }) => ({
  height: 12, borderRadius: 8, backgroundColor: alpha(theme.palette.success.main, 0.15),
  '& .MuiLinearProgress-bar': {
    borderRadius: 8,
    backgroundImage: `linear-gradient(90deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
  },
}));

// --- KNOWLEDGE TREE WIDGET ---
const KnowledgeTreeWidget = memo(() => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate(); // <-- Khởi tạo hook điều hướng

  const [waterDrops, setWaterDrops] = useState(30);
  const [experience, setExperience] = useState(450);
  const [isWatering, setIsWatering] = useState(false);

  const levelConfig = useMemo(() => {
    if (experience < 200) return { level: 1, name: "Hạt giống hi vọng", emoji: "🌱", maxExp: 200, color: "#8d6e63" };
    if (experience < 500) return { level: 2, name: "Mầm non vươn lên", emoji: "🌿", maxExp: 500, color: "#66bb6a" };
    if (experience < 1000) return { level: 3, name: "Cây non đâm chồi", emoji: "🪴", maxExp: 1000, color: "#43a047" };
    if (experience < 2000) return { level: 4, name: "Cây ra hoa", emoji: "🌸", maxExp: 2000, color: "#ec407a" };
    return { level: 5, name: "Cây cổ thụ tri thức", emoji: "🌳", maxExp: 5000, color: "#2e7d32" };
  }, [experience]);

  const progressPercent = Math.min(100, (experience / levelConfig.maxExp) * 100);

  const handleWater = useCallback(() => {
    if (waterDrops > 0 && !isWatering) {
      setIsWatering(true);
      setWaterDrops(prev => prev - 1);
      setTimeout(() => { setExperience(prev => prev + 25); setIsWatering(false); }, 600);
    }
  }, [waterDrops, isWatering]);

  return (
    <Card sx={{ 
      borderRadius: 3, 
      border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
      background: isDark ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)` : `linear-gradient(135deg, #f1f8e9 0%, #ffffff 100%)`,
      boxShadow: isDark ? 'none' : '0 8px 32px rgba(76, 175, 80, 0.08)',
      position: 'relative', overflow: 'hidden'
    }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <Box sx={{
              width: 160, height: 160, borderRadius: '50%', background: alpha(theme.palette.success.main, 0.1),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 0 12px ${alpha(theme.palette.success.main, 0.05)}`,
              animation: `${floatAnimation} 4s ease-in-out infinite`, position: 'relative'
            }}>
              <Typography sx={{ fontSize: '5rem', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }}>
                {levelConfig.emoji}
              </Typography>
              {isWatering && <WaterDropIcon sx={{ position: 'absolute', top: -10, color: '#29b6f6', fontSize: '2rem', animation: `${dropAnimation} 0.6s ease-in forwards` }} />}
            </Box>
            <Chip label={`Lv. ${levelConfig.level}`} sx={{ position: 'absolute', bottom: -10, bgcolor: levelConfig.color, color: '#fff', fontWeight: 700, borderRadius: '8px', px: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2.5}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle2" color="success.main" fontWeight={700} textTransform="uppercase" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AutoAwesomeIcon fontSize="small" /> Cây Tri Thức
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mt: 0.5 }}>
                      {levelConfig.name}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Nước hiện có</Typography>
                      <Tooltip title={
                        <Box sx={{ p: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700} mb={1}>Làm sao để có 💧?</Typography>
                          <Typography variant="body2">• Làm 1 bài Thích ứng: +2 💧</Typography>
                          <Typography variant="body2">• Làm 1 bài Kiểm tra: +5 💧</Typography>
                          <Typography variant="body2">• Đăng nhập mỗi ngày: +1 💧</Typography>
                        </Box>
                      } arrow placement="top">
                        <InfoOutlinedIcon fontSize="inherit" color="action" sx={{ cursor: 'pointer' }}/>
                      </Tooltip>
                    </Stack>
                    <Typography variant="h5" fontWeight={700} color="info.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      {waterDrops} <WaterDropIcon fontSize="small" />
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="text.primary">Tiến trình trưởng thành</Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">{experience} / {levelConfig.maxExp} EXP</Typography>
                </Stack>
                <TreeProgress variant="determinate" value={progressPercent} />
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} pt={1}>
                <Button variant="contained" onClick={handleWater} disabled={waterDrops === 0 || isWatering} startIcon={<WaterDropIcon />}
                  sx={{
                    bgcolor: '#29b6f6', color: '#fff', borderRadius: '12px', fontWeight: 700, px: 3, py: 1.2,
                    boxShadow: `0 8px 20px ${alpha('#29b6f6', 0.4)}`,
                    '&:hover': { bgcolor: '#039be5', boxShadow: `0 8px 24px ${alpha('#29b6f6', 0.6)}` },
                    '&:disabled': { bgcolor: alpha(theme.palette.action.disabledBackground, 0.5) },
                    animation: (waterDrops > 0 && !isWatering) ? `${pulseAnimation} 2s infinite` : 'none'
                  }}>
                  {waterDrops > 0 ? 'Tưới nước ngay (+25 EXP)' : 'Hết nước'}
                </Button>
                {/* Nút bấm để chuyển hướng */}
                <Button variant="outlined" endIcon={<PlayArrowRoundedIcon />}
                  onClick={() => navigate('/student/practice')}
                  sx={{ borderRadius: '12px', fontWeight: 600, borderColor: alpha(theme.palette.success.main, 0.5), color: 'success.main', '&:hover': { borderColor: 'success.main', bgcolor: alpha(theme.palette.success.main, 0.05) } }}>
                  Làm bài kiếm thêm nước
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

// --- STAT CARD ---
const StatCard = memo(({ title, value, icon, color, subtext }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card sx={{ height: "100%", borderRadius: 3, boxShadow: isDark ? 'none' : "0px 4px 20px rgba(0, 0, 0, 0.03)", border: `1px solid ${isDark ? theme.palette.midnight?.border : '#f0f0f0'}`, display: "flex", flexDirection: "column", justifyContent: "space-between", bgcolor: isDark ? 'background.paper' : 'white' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette[color].main, 0.1), color: `${color}.main`, width: 48, height: 48, borderRadius: 2 }}>{icon}</Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>{title}</Typography>
            <Typography variant="h5" fontWeight={700} color="text.primary">{value}</Typography>
          </Box>
        </Stack>
        {subtext && <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.secondary", bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : "grey.50", p: 1, borderRadius: 1 }}>{subtext}</Typography>}
      </CardContent>
    </Card>
  );
});

// --- MAIN DASHBOARD ---
const StudentDashboard = memo(() => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ latestScore: 0, totalPracticeTime: 0, numJoinClassess: {total_classes: 0}, avgTestScore: 0 });
  const [trendData, setTrendData] = useState([]);
  const [progressTimeRange, setProgressTimeRange] = useState("week");
  const [progressExamType, setProgressExamType] = useState("all");
  const [myPlans, setMyPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [radarData, setRadarData] = useState([]);
  const [openDrillDown, setOpenDrillDown] = useState(false);
  const [selectedChapterName, setSelectedChapterName] = useState("");
  const [drillDownData, setDrillDownData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [activityType, setActivityType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await getStudentStats(token);
      setStats(data);
    } catch (error) { console.error("Failed to fetch stats", error); }
  }, []);

  const fetchMyPlans = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await getMyPlans(token);
      const plans = data.map(p => ({ id: p.plan_id, name: p.title }));
      setMyPlans(plans);
      if (plans.length > 0) setSelectedPlan(plans[0].id);
    } catch (error) { console.error("Failed to fetch plans", error); }
  }, []);

  const fetchTrend = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await getScoreTrend(token, { group_time: progressTimeRange, exam_type: progressExamType });
      const formattedTrend = data.score_trend.map(item => ({ name: item.label, score: Number(item.averageScore).toFixed(1) }));
      setTrendData(formattedTrend);
    } catch (error) { console.error("Failed to fetch trend", error); }
  }, [progressTimeRange, progressExamType]);

  const fetchRadar = useCallback(async () => {
    if (!selectedPlan) return;
    try {
      const token = localStorage.getItem("token");
      const data = await getSkillsMap(token, selectedPlan);
      const formattedRadar = data.map(item => {
        const total = item.correct_cnt + item.fail_cnt;
        const percent = total === 0 ? 0 : Math.round((item.correct_cnt / total) * 100);
        return { chapter_id: item.category_id, subject: item.category_name, A: percent };
      });
      setRadarData(formattedRadar);
    } catch (error) { console.error("Failed to fetch radar data", error); }
  }, [selectedPlan]);

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const params = { limit: 10, page: 1 }; // Load top 10 for feed
      if (activityType !== 'all') params.exam_type = activityType;
      if (startDate) params.startAt = startDate;
      if (endDate) params.endAt = endDate;
      const data = await getHistory(token, params);
      setHistoryData(data);
    } catch (error) { console.error("Failed to fetch history", error); }
  }, [activityType, startDate, endDate]);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchMyPlans()]);
      setLoading(false);
    };
    initData();
  }, [fetchStats, fetchMyPlans]);

  useEffect(() => { fetchTrend(); }, [fetchTrend]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { fetchRadar(); }, [fetchRadar]); 

  const handleRadarClick = useCallback(async (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const chapter = data.activePayload[0].payload;
      setSelectedChapterName(chapter.subject);
      try {
        const token = localStorage.getItem("token");
        const responseData = await getSkillsMapDrillDown(token, chapter.chapter_id, selectedPlan);
        const formattedDrillDown = responseData.map(item => {
          const total = item.correct_cnt + item.fail_cnt;
          return { topic: item.category_name, percent: total === 0 ? 0 : Math.round((item.correct_cnt / total) * 100) };
        });
        setDrillDownData(formattedDrillDown);
        setOpenDrillDown(true);
      } catch (error) { console.error("Failed to fetch drill down data", error); }
    }
  }, [selectedPlan]);

  // Sinh câu nhận xét tự động (Data Storytelling)
  const trendInsightMessage = useMemo(() => {
    if (trendData.length < 2) return "Hãy làm thêm bài tập để xem phân tích xu hướng nhé!";
    const last = Number(trendData[trendData.length - 1].score);
    const prev = Number(trendData[trendData.length - 2].score);
    if (last > prev) return `Tuyệt quá! Điểm số của em đang tăng lên (+${(last - prev).toFixed(1)}). Cứ giữ phong độ này nhé! 🚀`;
    if (last < prev) return `Oops, điểm hơi giảm một xíu. Xem lại phần lỗi sai ở Bản đồ kỹ năng bên cạnh để cải thiện nha! 💪`;
    return "Phong độ của em đang rất ổn định định. Thử thách bản thân với bài khó hơn xem sao! 🎯";
  }, [trendData]);

  if (loading) return <LinearProgress />;

  return (
    <PageWrapper>
      {/* 1. KNOWLEDGE TREE */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <KnowledgeTreeWidget />
        </Grid>
      </Grid>

      {/* 2. QUICK STATS (Đã xóa các dòng subtext) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Điểm bài mới nhất" value={stats.latestScore} icon={<StarIcon />} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Lớp đang tham gia" value={stats.numJoinClassess?.total_classes || 0} icon={<SchoolIcon />} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Giờ luyện tập" value={`${stats.totalPracticeTime || 0}h`} icon={<AccessTimeFilledIcon />} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Điểm trung bình" value={stats.avgTestScore} icon={<WorkspacePremiumIcon />} color="error" />
        </Grid>
      </Grid>

      {/* 3. CHARTS AREA */}
      <Grid container spacing={3} sx={{ mb: 4, alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 8, xl: 9 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${isDark ? theme.palette.midnight?.border : '#e0e0e0'}`, display: "flex", flexDirection: "column", height: '100%', bgcolor: 'transparent' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
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

            {/* AI Insight Storytelling */}
            <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : '#e3f2fd', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>🤖</Avatar>
              <Typography variant="body2" fontWeight={500} color={isDark ? "primary.light" : "primary.dark"}>
                {trendInsightMessage}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, minHeight: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? alpha(theme.palette.divider, 0.1) : "#f0f0f0"} />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: isDark ? '#aaa' : '#666'}} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{fontSize: 12, fill: isDark ? '#aaa' : '#666'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: isDark ? '#333' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="score" name="Điểm số" stroke="#2196f3" strokeWidth={3} dot={{ r: 4, fill: "#2196f3" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4, xl: 3 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${isDark ? theme.palette.midnight?.border : '#e0e0e0'}`, display: "flex", flexDirection: "column", height: '100%', bgcolor: 'transparent' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>🕸️ Bản đồ Kỹ năng</Typography>
            </Stack>
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel>Chọn Lộ trình</InputLabel>
              <Select value={selectedPlan} label="Chọn Lộ trình" onChange={(e) => setSelectedPlan(e.target.value)}>
                {myPlans.map(plan => (<MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', fontStyle: 'italic', mb: 2 }}>
              * Click vào đỉnh mạng nhện để xem chi tiết
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 250, cursor: 'pointer' }}>
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData} onClick={handleRadarClick}>
                   <PolarGrid stroke={isDark ? alpha(theme.palette.divider, 0.2) : "#e0e0e0"} />
                   <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: isDark ? '#ccc' : '#333', fontWeight: 600 }} />
                   <PolarRadiusAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={false} axisLine={false} />
                   <Radar name="Độ thông thạo (%)" dataKey="A" stroke="#8884d8" strokeWidth={2} fill="#8884d8" fillOpacity={0.5} />
                   <RechartsTooltip contentStyle={{ backgroundColor: isDark ? '#333' : '#fff', borderRadius: '8px', border: 'none' }} />
                 </RadarChart>
               </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 4. ACTIVITY TIMELINE */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${isDark ? theme.palette.midnight?.border : '#e0e0e0'}`, bgcolor: 'transparent', p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} mb={3}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FilterListIcon color="action" />
            <Typography variant="h6" fontWeight={700}>Hành trình học tập gần đây</Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField label="Từ ngày" type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <TextField label="Đến ngày" type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
                <MenuItem value="all">Tất cả bài</MenuItem>
                <MenuItem value="practice">Luyện tập</MenuItem>
                <MenuItem value="test">Kiểm tra</MenuItem>
                <MenuItem value="adaptive">Thích ứng</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Stack spacing={2}>
          {historyData.length === 0 ? (
            <Typography align="center" color="text.secondary" py={4}>Chưa có hoạt động nào trong khoảng thời gian này.</Typography>
          ) : (
            historyData.map((item, index) => {
              const isTest = item.exam_type === 'test';
              const isAdaptive = item.exam_type === 'adaptive';
              const typeColor = isTest ? 'error' : isAdaptive ? 'secondary' : 'primary';
              const TypeIcon = isTest ? QuizIcon : isAdaptive ? AutoModeIcon : EditNoteIcon;

              return (
                <Card key={index} elevation={0} sx={{ 
                  border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.5)}`, 
                  borderRadius: 2, 
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.05)' }
                }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette[typeColor].main, 0.1), color: `${typeColor}.main` }}>
                        <TypeIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>{item.title || 'Bài tập chưa đặt tên'}</Typography>
                        <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                          <Chip label={item.subject || 'Môn học'} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                          <Typography variant="caption" color="text.secondary">
                            • {new Date(item.doneAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                          </Typography>
                        </Stack>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h5" fontWeight={700} color={isTest ? 'error.main' : 'text.primary'}>
                          {item.score} <Typography component="span" variant="caption" color="text.secondary">/ 10</Typography>
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      </Paper>

      {/* 5. DRILL DOWN DIALOG */}
      <Dialog open={openDrillDown} onClose={() => setOpenDrillDown(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: isDark ? 'background.paper' : '#fff' } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
          Phân tích: {selectedChapterName}
          <IconButton onClick={() => setOpenDrillDown(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: isDark ? theme.palette.midnight?.border : 'divider' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tỷ lệ thông thạo các chủ đề con. Những thanh chưa đầy 100% là phần em cần luyện tập thêm.
          </Typography>
          <Box sx={{ width: '100%', height: 250, mt: 2 }}>
            <ResponsiveContainer>
              <BarChart data={drillDownData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? alpha(theme.palette.divider, 0.1) : "#f0f0f0"} />
                <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: isDark ? '#aaa' : '#666' }} />
                <YAxis dataKey="topic" type="category" width={100} tick={{fontSize: 12, fill: isDark ? '#aaa' : '#666'}} />
                <RechartsTooltip contentStyle={{ backgroundColor: isDark ? '#333' : '#fff', borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="percent" name="Độ thông thạo (%)" fill="#8884d8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
});

export default StudentDashboard;