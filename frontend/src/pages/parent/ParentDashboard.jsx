import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import {
  Paper, Typography, Box, Card, CardContent, Stack, Chip,
  LinearProgress, FormControl, Select, MenuItem, InputLabel,
  Dialog, DialogTitle, DialogContent, IconButton, Grid, TextField, Avatar
} from "@mui/material";
import { styled, useTheme, alpha, keyframes } from "@mui/material/styles";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RechartsTooltip,
  BarChart, Bar
} from "recharts";

import CloseIcon from "@mui/icons-material/Close";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";
import WaterDropIcon from "@mui/icons-material/WaterDrop";

import {
  getStudentStats, getMyPlans, getScoreTrend, getSkillsMap, getSkillsMapDrillDown, getHistory
} from "../../services/DashboardStudentService"; 
import { getMyChildren } from "../../services/UserService";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
    }
  };
});

const TreeProgress = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.success.main, 0.15),
  '& .MuiLinearProgress-bar': {
    borderRadius: 8,
    backgroundImage: `linear-gradient(90deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
  },
}));

// Widget tiến trình: Giữ UI giống hệt Học sinh nhưng loại bỏ các nút tương tác
const ChildProgressWidget = memo(({ childName, initialWater, initialExp }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const levelConfig = useMemo(() => {
    if (initialExp < 200) return { level: 1, name: "Hạt giống hi vọng", emoji: "🌱", maxExp: 200, color: theme.palette.warning.dark, next: "Mầm non" };
    if (initialExp < 500) return { level: 2, name: "Mầm non vươn lên", emoji: "🌿", maxExp: 500, color: theme.palette.success.light, next: "Cây non" };
    if (initialExp < 1000) return { level: 3, name: "Cây non đâm chồi", emoji: "🪴", maxExp: 1000, color: theme.palette.success.main, next: "Cây ra hoa" };
    if (initialExp < 2000) return { level: 4, name: "Cây ra hoa", emoji: "🌸", maxExp: 2000, color: theme.palette.secondary.main, next: "Cổ thụ" };
    return { level: 5, name: "Cổ thụ tri thức", emoji: "🌳", maxExp: 5000, color: theme.palette.success.dark, next: "Tối đa" };
  }, [initialExp, theme.palette]);

  const progressPercent = Math.min(100, (initialExp / levelConfig.maxExp) * 100);
  const expNeeded = levelConfig.maxExp - initialExp;

  return (
    <Card sx={{ 
      borderRadius: 4, 
      border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.success.main, 0.2)}`,
      background: isDark 
        ? `radial-gradient(circle at 30% 50%, ${alpha(theme.palette.success.main, 0.1)} 0%, ${theme.palette.background.paper} 80%)` 
        : `radial-gradient(circle at 30% 50%, ${alpha(theme.palette.success.light, 0.15)} 0%, ${theme.palette.background.paper} 80%)`,
      boxShadow: isDark ? 'none' : `0 8px 24px ${alpha(theme.palette.success.main, 0.05)}`,
      position: 'relative', 
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <Box sx={{
              width: 140, height: 140, borderRadius: '50%', 
              background: isDark ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.success.main, 0.1),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 0 16px ${alpha(theme.palette.success.main, 0.05)}, 0 0 40px ${alpha(levelConfig.color, 0.3)}`,
              animation: `${float} 4s ease-in-out infinite`, 
              position: 'relative',
              zIndex: 2
            }}>
              <Typography sx={{ fontSize: '5rem', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }}>
                {levelConfig.emoji}
              </Typography>
            </Box>
            <Chip 
              label={`Cấp ${levelConfig.level}`} 
              sx={{ 
                position: 'absolute', bottom: -10, 
                bgcolor: levelConfig.color, color: theme.palette.common.white, 
                fontWeight: 700, borderRadius: '8px', px: 1, py: 2, fontSize: '0.9rem',
                boxShadow: `0 4px 12px ${alpha(levelConfig.color, 0.4)}`, zIndex: 4
              }} 
            />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={700} textTransform="uppercase" sx={{ mb: 0.5 }}>
                      Tiến trình của {childName}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                      {levelConfig.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Tiến hóa thành <Typography component="span" variant="body2" fontWeight={700} color={levelConfig.color}>{levelConfig.next}</Typography>
                    </Typography>
                  </Box>
                  
                  {/* Cụm Kho Nước giống Dashboard của Học sinh */}
                  <Box sx={{ 
                    bgcolor: isDark ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.info.light, 0.15),
                    p: 1.5, borderRadius: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    minWidth: 120, textAlign: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">Kho Nước</Typography>
                    <Typography variant="h4" fontWeight={700} color="info.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                      {initialWater} <WaterDropIcon fontSize="medium" />
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary">
                    Tiến độ sinh trưởng
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">
                    Còn {expNeeded} EXP
                  </Typography>
                </Stack>
                <TreeProgress variant="determinate" value={progressPercent} />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

const StatCard = memo(({ title, value, color }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card sx={{ 
      height: "100%", borderRadius: 3, 
      boxShadow: isDark ? 'none' : `0 4px 16px ${alpha(theme.palette[color].main, 0.05)}`, 
      border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette[color].main, 0.1)}`, 
      bgcolor: isDark ? alpha(theme.palette[color].main, 0.05) : theme.palette.background.paper,
      position: 'relative', overflow: 'hidden'
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: `${color}.main` }} />
      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} color={`${color}.main`}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
});

const ParentDashboard = memo(() => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  
  const selectedChildName = useMemo(() => {
    const child = childrenList.find(c => c.uid === selectedChildId);
    if (!child || !child.user) return 'Bé';
    return [child.user.lname, child.user.mname, child.user.fname].filter(Boolean).join(" ");
  }, [childrenList, selectedChildId]);

  const [stats, setStats] = useState({ 
    latestScore: 0, totalPracticeTime: 0, numJoinClassess: 0, avgTestScore: 0, water_drops: 0, experience: 0
  });

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

  useEffect(() => {
    const fetchChildren = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await getMyChildren(token);
        const data = Array.isArray(res) ? res : res?.data || [];
        setChildrenList(data);
        if (data.length > 0) setSelectedChildId(data[0].uid);
      } catch (err) {}
    };
    fetchChildren();
  }, []);

  const fetchStats = useCallback(async () => {
    if (!selectedChildId) return;
    try {
      const token = localStorage.getItem("token");
      const data = await getStudentStats(token, selectedChildId); 
      setStats({ ...data, water_drops: data?.water_drops || 0, experience: data?.experience || 0 });
    } catch (error) {}
  }, [selectedChildId]);

  const fetchMyPlans = useCallback(async () => {
    if (!selectedChildId) return;
    try {
      const token = localStorage.getItem("token");
      const data = await getMyPlans(token, selectedChildId);
      const plans = data.map(p => ({ id: p.plan_id, name: p.title }));
      setMyPlans(plans);
      if (plans.length > 0) setSelectedPlan(plans[0].id);
      else setSelectedPlan("");
    } catch (error) {}
  }, [selectedChildId]);

  const fetchTrend = useCallback(async () => {
    if (!selectedChildId) return;
    try {
      const token = localStorage.getItem("token");
      const data = await getScoreTrend(token, selectedChildId, { group_time: progressTimeRange, exam_type: progressExamType });
      const formattedTrend = data.score_trend.map(item => ({ name: item.label, score: Number(item.averageScore).toFixed(1) }));
      setTrendData(formattedTrend);
    } catch (error) {}
  }, [selectedChildId, progressTimeRange, progressExamType]);

  const fetchRadar = useCallback(async () => {
    if (!selectedChildId || !selectedPlan) return;
    try {
      const token = localStorage.getItem("token");
      const data = await getSkillsMap(token, selectedChildId, selectedPlan);
      const formattedRadar = data.map(item => {
        const total = item.correct_cnt + item.fail_cnt;
        const percent = total === 0 ? 0 : Math.round((item.correct_cnt / total) * 100);
        return { chapter_id: item.category_id, subject: item.category_name, A: percent };
      });
      setRadarData(formattedRadar);
    } catch (error) {}
  }, [selectedChildId, selectedPlan]);

  const fetchHistory = useCallback(async () => {
    if (!selectedChildId) return;
    try {
      const token = localStorage.getItem("token");
      const params = { limit: 10, page: 1 };
      if (activityType !== 'all') params.exam_type = activityType;
      if (startDate) params.startAt = startDate;
      if (endDate) params.endAt = endDate;
      const data = await getHistory(token, selectedChildId, params);
      setHistoryData(data);
    } catch (error) {}
  }, [selectedChildId, activityType, startDate, endDate]);

  useEffect(() => {
    if (selectedChildId) {
      setLoading(true);
      Promise.all([fetchStats(), fetchMyPlans()]).then(() => setLoading(false));
    }
  }, [selectedChildId, fetchStats, fetchMyPlans]);

  useEffect(() => { if (selectedChildId) fetchTrend(); }, [fetchTrend, selectedChildId]);
  useEffect(() => { if (selectedChildId) fetchHistory(); }, [fetchHistory, selectedChildId]);
  useEffect(() => { if (selectedChildId && selectedPlan) fetchRadar(); }, [fetchRadar, selectedChildId, selectedPlan]); 

  const handleRadarClick = useCallback(async (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const chapter = data.activePayload[0].payload;
      setSelectedChapterName(chapter.subject);
      try {
        const token = localStorage.getItem("token");
        const responseData = await getSkillsMapDrillDown(token, selectedChildId, chapter.chapter_id, selectedPlan);
        const formattedDrillDown = responseData.map(item => {
          const total = item.correct_cnt + item.fail_cnt;
          return { topic: item.category_name, percent: total === 0 ? 0 : Math.round((item.correct_cnt / total) * 100) };
        });
        setDrillDownData(formattedDrillDown);
        setOpenDrillDown(true);
      } catch (error) {}
    }
  }, [selectedChildId, selectedPlan]);

  const trendInsightMessage = useMemo(() => {
    if (trendData.length < 2) return `Làm thêm bài tập để xem biểu đồ phân tích phong độ của ${selectedChildName}.`;
    const last = Number(trendData[trendData.length - 1].score);
    const prev = Number(trendData[trendData.length - 2].score);
    if (last > prev) return `Đang có đà tiến bộ! Điểm số tăng +${(last - prev).toFixed(1)} so với lần trước.`;
    if (last < prev) return `Điểm số đang chững lại. Hãy xem "Bản đồ kỹ năng" để biết điểm yếu cần khắc phục.`;
    return "Phong độ khá ổn định. Ba mẹ có thể khuyến khích con thử sức ở các bài khó hơn.";
  }, [trendData, selectedChildName]);

  const safeGetNumClasses = useCallback((dataValue) => {
    if (dataValue == null) return 0;
    if (typeof dataValue === 'object') return Number(dataValue.total_classes) || 0;
    return Number(dataValue) || 0;
  }, []);

  if (loading && childrenList.length === 0) return <LinearProgress />;

  return (
    <PageWrapper>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={4} gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">Tổng quan học tập</Typography>
          <Typography variant="body2" color="text.secondary">Theo dõi tiến độ và giám sát việc học của con.</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <Select 
            value={selectedChildId} 
            onChange={(e) => setSelectedChildId(e.target.value)}
            sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}` }}
            displayEmpty
          >
            {childrenList.length === 0 ? (
               <MenuItem value="" disabled>Chưa có thông tin con</MenuItem>
            ) : (
              childrenList.map(child => {
                const fullName = [child.user?.lname, child.user?.mname, child.user?.fname].filter(Boolean).join(" ");
                return (
                  <MenuItem key={child.uid} value={child.uid}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar src={child.user?.avata_url} sx={{ width: 26, height: 26 }}>
                        <FaceRetouchingNaturalIcon fontSize="small"/>
                      </Avatar>
                      <Typography fontWeight={600}>{fullName || 'Bé'}</Typography>
                    </Stack>
                  </MenuItem>
                );
              })
            )}
          </Select>
        </FormControl>
      </Stack>

      {selectedChildId ? (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12 }}>
              <ChildProgressWidget childName={selectedChildName} initialWater={stats.water_drops} initialExp={stats.experience} />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Điểm bài mới nhất" value={stats.latestScore || 0} color="warning" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Lớp đang tham gia" value={safeGetNumClasses(stats.numJoinClassess)} color="info" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Giờ luyện tập (Tuần)" value={`${stats.totalPracticeTime || 0}h`} color="success" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Điểm trung bình" value={stats.avgTestScore || 0} color="error" />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4, alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, lg: 8, xl: 9 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, display: "flex", flexDirection: "column", height: '100%', bgcolor: isDark ? 'background.paper' : theme.palette.background.paper }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Xu hướng điểm số</Typography>
                  <Stack direction="row" spacing={2}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
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

                <Box sx={{ mb: 3, p: 2, borderRadius: 2, borderLeft: '4px solid', borderColor: theme.palette.primary.main, bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05) }}>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    Gợi ý hệ thống:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {trendInsightMessage}
                  </Typography>
                </Box>

                <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.5)} />
                      <XAxis dataKey="name" tick={{fontSize: 12, fill: isDark ? theme.palette.text.secondary : theme.palette.text.secondary, fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                      <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{fontSize: 12, fill: isDark ? theme.palette.text.secondary : theme.palette.text.secondary, fontWeight: 600}} axisLine={false} tickLine={false} dx={-10} />
                      <RechartsTooltip contentStyle={{ backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.common.white, borderRadius: '8px', border: 'none', boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}` }} />
                      <Line type="monotone" dataKey="score" name="Điểm số" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 4, fill: theme.palette.primary.main, strokeWidth: 2, stroke: theme.palette.background.paper }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 4, xl: 3 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, display: "flex", flexDirection: "column", height: '100%', bgcolor: isDark ? 'background.paper' : theme.palette.background.paper }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Bản đồ Kỹ năng</Typography>
                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Chọn Lộ trình</InputLabel>
                  <Select value={selectedPlan} label="Chọn Lộ trình" onChange={(e) => setSelectedPlan(e.target.value)}>
                    {myPlans.length > 0 ? myPlans.map(plan => (<MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>)) : <MenuItem value="" disabled>Chưa có lộ trình</MenuItem>}
                  </Select>
                </FormControl>
                <Box sx={{ flexGrow: 1, minHeight: 250, cursor: 'pointer' }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData} onClick={handleRadarClick}>
                       <PolarGrid stroke={isDark ? alpha(theme.palette.divider, 0.2) : alpha(theme.palette.divider, 0.5)} />
                       <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: isDark ? theme.palette.text.secondary : theme.palette.text.primary, fontWeight: 700 }} />
                       <PolarRadiusAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={false} axisLine={false} />
                       <Radar name="Độ thông thạo (%)" dataKey="A" stroke={theme.palette.secondary.main} strokeWidth={2} fill={theme.palette.secondary.main} fillOpacity={isDark ? 0.3 : 0.15} />
                       <RechartsTooltip contentStyle={{ backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.common.white, borderRadius: '8px', border: 'none', boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}` }} />
                     </RadarChart>
                   </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, bgcolor: isDark ? 'background.paper' : theme.palette.background.paper, p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} mb={3}>
              <Typography variant="h6" fontWeight={700}>Hành trình học tập</Typography>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <TextField label="Từ ngày" type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <TextField label="Đến ngày" type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="practice">Luyện tập</MenuItem>
                    <MenuItem value="test">Kiểm tra</MenuItem>
                    <MenuItem value="adaptive">Thích ứng</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            <Stack spacing={2}>
              {historyData.length === 0 ? (
                <Typography align="center" color="text.secondary" py={4} fontWeight={500}>Chưa có dữ liệu hoạt động.</Typography>
              ) : (
                historyData.map((item, index) => {
                  const isTest = item.exam_type === 'test';
                  const isAdaptive = item.exam_type === 'adaptive';
                  const typeColor = isTest ? 'error' : isAdaptive ? 'secondary' : 'primary';

                  return (
                    <Box key={index} sx={{ 
                      display: 'flex', alignItems: 'center', p: 2, borderRadius: 2,
                      bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.grey[50], 0.5),
                      border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.2)}`,
                      borderLeft: `4px solid ${theme.palette[typeColor].main}`,
                      transition: 'transform 0.2s, background-color 0.2s',
                      '&:hover': { transform: 'translateX(4px)', bgcolor: isDark ? theme.palette.action.hover : alpha(theme.palette.grey[100], 0.8) }
                    }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>{item.title || 'Bài tập chưa đặt tên'}</Typography>
                        <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                          <Typography variant="caption" fontWeight={700} color={`${typeColor}.main`} textTransform="uppercase">
                            {isTest ? 'Kiểm tra' : isAdaptive ? 'Thích ứng' : 'Luyện tập'}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">•</Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>{item.subject || 'Môn học'}</Typography>
                          <Typography variant="caption" color="text.disabled">•</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(item.doneAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                          </Typography>
                        </Stack>
                      </Box>
                      <Box textAlign="right" pl={2}>
                        <Typography variant="h6" fontWeight={700} color={isTest ? 'error.main' : 'text.primary'}>
                          {item.score} <Typography component="span" variant="caption" color="text.secondary" fontWeight={700}>/ 10</Typography>
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Stack>
          </Paper>

          <Dialog open={openDrillDown} onClose={() => setOpenDrillDown(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: isDark ? 'background.paper' : theme.palette.background.paper } }}>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, pb: 1 }}>
              Chi tiết: {selectedChapterName}
              <IconButton onClick={() => setOpenDrillDown(false)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 0 }}>
              <Box sx={{ width: '100%', height: 280, mt: 2 }}>
                <ResponsiveContainer>
                  <BarChart data={drillDownData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.5)} />
                    <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: isDark ? theme.palette.text.secondary : theme.palette.text.secondary, fontWeight: 600 }} />
                    <YAxis dataKey="topic" type="category" width={110} tick={{fontSize: 12, fill: isDark ? theme.palette.text.secondary : theme.palette.text.secondary, fontWeight: 600}} />
                    <RechartsTooltip contentStyle={{ backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.common.white, borderRadius: '8px', border: 'none', boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}` }} cursor={{ fill: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.05) }}/>
                    <Bar dataKey="percent" name="Độ thông thạo (%)" fill={theme.palette.secondary.main} radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: `1px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
          <Typography variant="h6" color="text.secondary">Vui lòng thêm tài khoản con để theo dõi tiến trình học tập.</Typography>
        </Paper>
      )}
    </PageWrapper>
  );
});

export default ParentDashboard;