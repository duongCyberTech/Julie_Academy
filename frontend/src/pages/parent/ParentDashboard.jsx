import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import {
  Paper, Typography, Box, Card, CardContent, Stack, Chip,
  LinearProgress, FormControl, Select, MenuItem, InputLabel,
  Dialog, DialogTitle, DialogContent, IconButton, Grid, TextField,
  Avatar, Tooltip
} from "@mui/material";
import { styled, useTheme, alpha, keyframes } from "@mui/material/styles";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RechartsTooltip,
  BarChart, Bar
} from "recharts";

import CloseIcon from "@mui/icons-material/Close";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import QuizIcon from "@mui/icons-material/Quiz";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InsightsIcon from "@mui/icons-material/Insights";
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";

import {
  getStudentStats, getMyPlans, getScoreTrend, getSkillsMap, getSkillsMapDrillDown, getHistory
} from "../../services/DashboardParentService";
import { getMyChildren } from "../../services/UserService";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const formatPracticeTime = (decimalHours) => {
  if (!decimalHours || decimalHours <= 0) return "0 phút";
  const totalSeconds = Math.round(decimalHours * 3600);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ''}`.trim();
  } else if (minutes > 0) {
    return `${minutes} phút ${seconds > 0 ? `${seconds} giây` : ''}`.trim();
  } else {
    return `${seconds} giây`;
  }
};

// Rút gọn tên chương: "Chương II. Phương trình..." -> "Chương II"
// Lấy phần trước dấu phân tách đầu tiên (. : - – —). Không có dấu nào thì trả nguyên.
const toShortChapterName = (full) => {
  if (!full) return '';
  const m = full.match(/^([^.:\-\u2013\u2014]+?)(?=\s*[.:\-\u2013\u2014]|$)/);
  return m ? m[1].trim() : full.trim();
};

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

const CustomBarTooltip = memo(({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box sx={{ p: 2, bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" component="p" fontWeight={700} mb={1}>{data.topic}</Typography>
        <Typography variant="body2" color="primary.main" fontWeight={700}>Độ thông thạo: {data.percent}%</Typography>
        <Typography variant="body2" color="success.main" fontWeight={600} mt={0.5}>Đúng: {data.correct} câu</Typography>
        <Typography variant="body2" color="error.main" fontWeight={600}>Sai: {data.fail} câu</Typography>
      </Box>
    );
  }
  return null;
});

/**
 * Read-only Knowledge Tree widget for parent view.
 * Giữ nguyên layout của student dashboard, chỉ:
 * - Bỏ 2 nút "Tưới nước" & "Làm bài kiếm nước" (hành động chỉ thuộc về học sinh)
 * - Bỏ Dialog hướng dẫn nước (theo đó)
 * - Bỏ icon thông tin (i) bên cạnh tên cấp
 * - Đổi tiêu đề thành tên của con
 */
const KnowledgeTreeViewWidget = memo(({ childName, initialWater, initialExp }) => {
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
              <Typography component="div" sx={{ fontSize: '5rem', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }}>
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
                      Tiến trình của {childName || 'con'}
                    </Typography>
                    <Typography variant="h5" component="h2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                      {levelConfig.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Tiến hóa thành <Typography component="span" variant="body2" fontWeight={700} color={levelConfig.color}>{levelConfig.next}</Typography>
                    </Typography>
                  </Box>

                  <Box sx={{
                    bgcolor: isDark ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.info.light, 0.15),
                    p: 1.5, borderRadius: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    minWidth: 120, textAlign: 'center'
                  }}>
                    <Typography variant="caption" component="p" color="text.secondary" fontWeight={700} textTransform="uppercase">Kho Nước</Typography>
                    <Typography variant="h4" component="p" fontWeight={700} color="info.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                      {initialWater} <WaterDropIcon fontSize="medium" />
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" component="p" fontWeight={700} color="text.secondary">
                    Tiến độ sinh trưởng
                  </Typography>
                  <Typography variant="body2" component="p" fontWeight={700} color="success.main">
                    Còn {expNeeded} EXP
                  </Typography>
                </Stack>
                <TreeProgress
                  variant="determinate"
                  value={progressPercent}
                  aria-label="Tiến độ sinh trưởng"
                />
              </Box>

              {/* Khác student dashboard: không hiển thị 2 nút "Tưới Nước" và "Làm bài kiếm nước"
                  vì đây là hành động của học sinh, phụ huynh chỉ quan sát. */}
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
        <Typography variant="caption" component="h3" color="text.secondary" fontWeight={700} textTransform="uppercase" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" component="p" fontWeight={700} color={`${color}.main`}>
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

  // Parent-specific: danh sách con & con đang chọn
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");

  const [stats, setStats] = useState({
    latestScore: 0,
    totalPracticeTime: 0,
    numJoinClassess: 0,
    avgTestScore: 0,
    water_drops: 0,
    experience: 0
  });

  const [trendData, setTrendData] = useState([]);
  const [progressTimeRange, setProgressTimeRange] = useState("week");
  const [progressExamType, setProgressExamType] = useState("all");

  const [todaySchedule, setTodaySchedule] = useState([]);

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
  const [historySort, setHistorySort] = useState("newest"); // newest | oldest | highest | lowest

  const rechartsTooltipStyle = useMemo(() => ({
    backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.common.white,
    borderRadius: '8px',
    border: 'none',
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`
  }), [isDark, theme]);

  const selectedChild = useMemo(
    () => childrenList.find(c => c.uid === selectedChildId),
    [childrenList, selectedChildId]
  );

  const selectedChildName = useMemo(() => {
    if (!selectedChild) return "";
    const user = selectedChild.user || {};
    return [user.lname, user.mname, user.fname].filter(Boolean).join(" ") || "Bé";
  }, [selectedChild]);

  // 1. Load children list once
  useEffect(() => {
    const fetchChildren = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await getMyChildren(token);
        const data = Array.isArray(res) ? res : res?.data || [];
        setChildrenList(data);
        if (data.length > 0) setSelectedChildId(data[0].uid);
        else setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const fetchStats = useCallback(async () => {
    if (!selectedChildId) return;
    try {
      const token = localStorage.getItem("token");
      const data = await getStudentStats(token, selectedChildId);

      setStats({
        ...data,
        water_drops: data?.analytics?.water_drops || 0,
        experience: data?.analytics?.experience || 0
      });

      setTodaySchedule(data?.upcomingSchedules || []);
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
      // Backend mới trả về { category_id, category_name, percent, counted_subtopics }
      // percent là trung bình % các chủ điểm (subtopic) ĐÃ LÀM trong chương.
      // Trục radar dùng tên ngắn ("Chương II") để không bị chồng chéo; tên đầy đủ
      // được giữ trong fullName để hiện ở header drill-down dialog.
      const formattedRadar = data.map(item => ({
        chapter_id: item.category_id,
        subject: toShortChapterName(item.category_name),
        fullName: item.category_name,
        A: Math.round(Number(item.percent) || 0),
      }));
      setRadarData(formattedRadar);
    } catch (error) {}
  }, [selectedChildId, selectedPlan]);

  const fetchHistory = useCallback(async () => {
    if (!selectedChildId) return;
    try {
      const token = localStorage.getItem("token");
      const params = { limit: 10, page: 1, sort: historySort };
      if (activityType !== 'all') params.exam_type = activityType;
      if (startDate) params.startAt = startDate;
      if (endDate) params.endAt = endDate;
      const data = await getHistory(token, selectedChildId, params);
      setHistoryData(data);
    } catch (error) {}
  }, [selectedChildId, activityType, startDate, endDate, historySort]);

  // 2. Reload all child-scoped data khi đổi con
  useEffect(() => {
    if (!selectedChildId) return;
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchMyPlans()]);
      setLoading(false);
    };
    initData();
  }, [selectedChildId, fetchStats, fetchMyPlans]);

  useEffect(() => { if (selectedChildId) fetchTrend(); }, [fetchTrend, selectedChildId]);
  useEffect(() => { if (selectedChildId) fetchHistory(); }, [fetchHistory, selectedChildId]);
  useEffect(() => { if (selectedChildId) fetchRadar(); }, [fetchRadar, selectedChildId]);

  const handleVertexClick = useCallback(async (subjectName) => {
    const chapter = radarData.find(d => d.subject === subjectName);
    if (!chapter) return;

    // Header dialog hiện tên ĐẦY ĐỦ của chương để phụ huynh biết rõ
    setSelectedChapterName(chapter.fullName || chapter.subject);
    try {
      const token = localStorage.getItem("token");
      const responseData = await getSkillsMapDrillDown(token, selectedChildId, chapter.chapter_id, selectedPlan);

      const formattedDrillDown = responseData.map(item => {
        const total = item.correct_cnt + item.fail_cnt;
        return {
          topic: item.category_name,
          percent: total === 0 ? 0 : Math.round((item.correct_cnt / total) * 100),
          correct: item.correct_cnt,
          fail: item.fail_cnt
        };
      });
      setDrillDownData(formattedDrillDown);
      setOpenDrillDown(true);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết:", error);
    }
  }, [radarData, selectedChildId, selectedPlan]);

  const CustomRadarTick = useCallback((props) => {
    const { payload, x, y, textAnchor } = props;
    return (
      <text
        x={x}
        y={y}
        dy={textAnchor === 'start' ? 4 : textAnchor === 'end' ? 4 : 12}
        textAnchor={textAnchor}
        fill={theme.palette.primary.main}
        fontSize={13}
        fontWeight={700}
        cursor="pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleVertexClick(payload.value);
        }}
        style={{
          pointerEvents: 'auto',
          userSelect: 'none',
          transition: 'all 0.2s'
        }}
      >
        {payload.value}
      </text>
    );
  }, [handleVertexClick, theme]);

  const trendInsightMessage = useMemo(() => {
    const who = selectedChildName || 'con';
    if (trendData.length < 2) return `Làm thêm bài tập để hệ thống có thể phân tích xu hướng học tập của ${who}.`;
    const last = Number(trendData[trendData.length - 1].score);
    const prev = Number(trendData[trendData.length - 2].score);
    if (last > prev) return `Đang có đà tiến bộ! Điểm số tăng +${(last - prev).toFixed(1)} so với lần trước.`;
    if (last < prev) return `Điểm số đang chững lại. Hãy xem "Bản đồ kỹ năng" bên dưới để biết chủ đề ${who} cần khắc phục.`;
    return `Phong độ của ${who} khá ổn định. Ba mẹ có thể khuyến khích con thử sức ở các bài khó hơn.`;
  }, [trendData, selectedChildName]);

  const safeGetNumClasses = useCallback((dataValue) => {
    if (dataValue == null) return 0;
    if (typeof dataValue === 'object') return Number(dataValue.total_classes) || 0;
    return Number(dataValue) || 0;
  }, []);

  // Parent-specific: header dropdown chọn con
  const childSelector = (
    <FormControl size="small" sx={{ minWidth: 220 }}>
      <Select
        value={selectedChildId}
        onChange={(e) => setSelectedChildId(e.target.value)}
        sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}` }}
        displayEmpty
        inputProps={{ 'aria-label': 'Chọn con để xem dashboard' }}
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
                    <FaceRetouchingNaturalIcon fontSize="small" />
                  </Avatar>
                  <Typography fontWeight={600}>{fullName || 'Bé'}</Typography>
                </Stack>
              </MenuItem>
            );
          })
        )}
      </Select>
    </FormControl>
  );

  if (loading && childrenList.length === 0) {
    return <LinearProgress aria-label="Đang tải dữ liệu bảng điều khiển" />;
  }

  // Trường hợp parent chưa có con nào liên kết
  if (childrenList.length === 0) {
    return (
      <PageWrapper>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={4} gap={2}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} color="text.primary">Tổng quan học tập</Typography>
            <Typography variant="body2" color="text.secondary">Theo dõi tiến độ và giám sát việc học của con.</Typography>
          </Box>
        </Stack>
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: `1px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
          <Typography variant="h6" color="text.secondary">
            Vui lòng thêm tài khoản con để theo dõi tiến trình học tập.
          </Typography>
        </Paper>
      </PageWrapper>
    );
  }

  if (loading) return <LinearProgress aria-label="Đang tải dữ liệu bảng điều khiển" />;

  return (
    <PageWrapper>
      {/* Header với dropdown chọn con */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={4} gap={2}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} color="text.primary">Tổng quan học tập</Typography>
          <Typography variant="body2" color="text.secondary">Theo dõi tiến độ và giám sát việc học của con.</Typography>
        </Box>
        {childSelector}
      </Stack>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <KnowledgeTreeViewWidget
            childName={selectedChildName}
            initialWater={stats.water_drops ?? 0}
            initialExp={stats.experience ?? 0}
          />
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
          <StatCard title="Giờ luyện tập" value={formatPracticeTime(stats.totalPracticeTime)} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Điểm trung bình" value={stats.avgTestScore || 0} color="error" />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4, alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, display: "flex", flexDirection: "column", height: '100%', bgcolor: isDark ? 'background.paper' : theme.palette.background.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
              <Typography variant="h6" component="h2" fontWeight={700}>Xu hướng điểm số</Typography>
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="exam-type-label">Loại bài</InputLabel>
                  <Select
                    labelId="exam-type-label"
                    id="exam-type-select"
                    value={progressExamType}
                    label="Loại bài"
                    onChange={(e) => setProgressExamType(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="practice">Luyện tập</MenuItem>
                    <MenuItem value="test">Kiểm tra</MenuItem>
                    <MenuItem value="adaptive">Thích ứng</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={progressTimeRange}
                    onChange={(e) => setProgressTimeRange(e.target.value)}
                    inputProps={{ 'aria-label': 'Khoảng thời gian' }}
                  >
                    <MenuItem value="week">Tuần này</MenuItem>
                    <MenuItem value="month">Tháng này</MenuItem>
                    <MenuItem value="term">Học kỳ</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            <Box sx={{ mb: 3, p: 2, borderRadius: 2, borderLeft: '4px solid', borderColor: theme.palette.primary.main, bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="body2" component="p" fontWeight={700} color="text.primary">
                Nhận xét hệ thống:
              </Typography>
              <Typography variant="body2" component="p" color="text.secondary" sx={{ mt: 0.5 }}>
                {trendInsightMessage}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? theme.palette.text.secondary : theme.palette.text.secondary, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 12, fill: isDark ? theme.palette.text.secondary : theme.palette.text.secondary, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                  <RechartsTooltip contentStyle={rechartsTooltipStyle} />
                  <Line type="monotone" dataKey="score" name="Điểm số" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 4, fill: theme.palette.primary.main, strokeWidth: 2, stroke: theme.palette.background.paper }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, display: "flex", flexDirection: "column", height: '100%', bgcolor: isDark ? 'background.paper' : theme.palette.background.paper }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <EventNoteIcon color="primary" />
              <Typography variant="h6" component="h2" fontWeight={700}>Lịch học hôm nay</Typography>
            </Stack>

            {todaySchedule.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, p: 3, textAlign: 'center', bgcolor: isDark ? alpha(theme.palette.divider, 0.05) : alpha(theme.palette.grey[50], 0.5), borderRadius: 2 }}>
                <AutoAwesomeIcon sx={{ fontSize: 40, color: theme.palette.text.disabled, mb: 1 }} />
                <Typography variant="body2" component="p" color="text.secondary" fontWeight={500}>
                  Hôm nay {selectedChildName || 'con'} không có ca học nào.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2} sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 350, pr: 1 }}>
                {todaySchedule.map((schedule, index) => {
                  const startTime = schedule.startAt;
                  const endTime = schedule.endAt;

                  const meetLink = schedule.link_meet || schedule.class?.link_meet || schedule.link || null;

                  let isPast = false;
                  if (endTime) {
                    const now = new Date();
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    const [hour, min] = endTime.split(':').map(Number);
                    if (!isNaN(hour) && !isNaN(min)) {
                      isPast = currentMinutes > (hour * 60 + min);
                    }
                  }

                  return (
                    <Box key={index} sx={{
                      p: 2,
                      borderRadius: 2,
                      borderLeft: '4px solid',
                      borderColor: isPast ? alpha(theme.palette.action.disabled, 0.5) : theme.palette.info.main,
                      bgcolor: isDark ? alpha(theme.palette.info.main, 0.05) : alpha(theme.palette.info.light, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: isPast ? 0.6 : 1,
                      filter: isPast ? 'grayscale(100%)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      <Box>
                        <Typography variant="subtitle2" component="h3" fontWeight={700} color={isPast ? 'text.disabled' : 'text.primary'} noWrap>
                          {schedule.class?.classname || 'Lớp học'}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                          <Chip size="small" label={schedule.class?.subject || 'Môn học'} sx={{ fontWeight: 600, bgcolor: theme.palette.background.paper }} />
                          <Stack direction="row" alignItems="center" spacing={0.5} color={isPast ? 'text.disabled' : 'text.secondary'}>
                            <AccessTimeIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption" component="span" fontWeight={600}>{startTime} - {endTime}</Typography>
                          </Stack>
                        </Stack>
                      </Box>

                      <Tooltip title={isPast ? "Đã kết thúc" : (!meetLink ? "Chưa có link" : "Vào lớp học")}>
                        <span>
                          <IconButton
                            color={meetLink && !isPast ? "primary" : "default"}
                            component={meetLink && !isPast ? "a" : "button"}
                            href={meetLink && !isPast ? meetLink : undefined}
                            target={meetLink && !isPast ? "_blank" : undefined}
                            disabled={isPast || !meetLink}
                            aria-label={isPast ? "Đã kết thúc" : (!meetLink ? "Chưa có link" : "Vào lớp học")}
                            sx={{
                              bgcolor: meetLink && !isPast ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                              border: meetLink && !isPast ? `1px solid ${alpha(theme.palette.primary.main, 0.5)}` : 'none',
                              borderRadius: 2
                            }}
                          >
                            <VideoCallOutlinedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, bgcolor: isDark ? 'background.paper' : theme.palette.background.paper }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={3} spacing={2}>
              <Box>
                <Typography variant="h6" component="h2" fontWeight={700}>Bản đồ kỹ năng</Typography>
                <Typography variant="body2" component="p" color="text.secondary">Bấm trực tiếp vào các nút tên chủ đề hoặc đỉnh trên biểu đồ để xem độ thông thạo chi tiết.</Typography>
              </Box>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="plan-label">Chọn Lộ trình phân tích</InputLabel>
                <Select
                  labelId="plan-label"
                  id="plan-select"
                  value={selectedPlan}
                  label="Chọn Lộ trình phân tích"
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  {myPlans.length > 0
                    ? myPlans.map(plan => (<MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>))
                    : <MenuItem value="" disabled>Chưa có lộ trình</MenuItem>}
                </Select>
              </FormControl>
            </Stack>

            <Box sx={{ width: '100%', height: 400, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke={isDark ? alpha(theme.palette.divider, 0.2) : alpha(theme.palette.divider, 0.5)} />
                  <PolarAngleAxis dataKey="subject" tick={<CustomRadarTick />} />
                  <PolarRadiusAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Độ thông thạo (%)"
                    dataKey="A"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    fill={theme.palette.secondary.main}
                    fillOpacity={isDark ? 0.3 : 0.15}
                    activeDot={{
                      cursor: 'pointer',
                      r: 6,
                      onClick: (e, payload) => {
                        if (payload && payload.payload) {
                          handleVertexClick(payload.payload.subject);
                        }
                      }
                    }}
                  />
                  <RechartsTooltip contentStyle={rechartsTooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, bgcolor: isDark ? 'background.paper' : theme.palette.background.paper, p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} mb={3}>
          <Typography variant="h6" component="h2" fontWeight={700}>Lịch sử hoạt động</Typography>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              id="start-date"
              label="Từ ngày"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              id="end-date"
              label="Đến ngày"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                inputProps={{ 'aria-label': 'Loại hoạt động' }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="practice">Luyện tập</MenuItem>
                <MenuItem value="test">Kiểm tra</MenuItem>
                <MenuItem value="adaptive">Thích ứng</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={historySort}
                onChange={(e) => setHistorySort(e.target.value)}
                inputProps={{ 'aria-label': 'Sắp xếp' }}
              >
                <MenuItem value="newest">Mới nhất</MenuItem>
                <MenuItem value="oldest">Cũ nhất</MenuItem>
                <MenuItem value="highest">Điểm cao → thấp</MenuItem>
                <MenuItem value="lowest">Điểm thấp → cao</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Stack spacing={2}>
          {historyData.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary" fontWeight={500}>Chưa có dữ liệu hoạt động trong khoảng thời gian này.</Typography>
            </Box>
          ) : (
            historyData.map((item, index) => {
              const hasCategory = !!item.category;
              const isAdaptive = item.exam_type === 'adaptive' || hasCategory;
              const isTest = item.exam_type === 'test';

              let typeColor = 'primary';
              let ItemIcon = AssignmentTurnedInIcon;
              let typeLabel = 'Luyện tập';
              let displayTitle = item.title || 'Bài tập chưa đặt tên';

              if (isTest) {
                typeColor = 'error';
                ItemIcon = QuizIcon;
                typeLabel = 'Kiểm tra';
              } else if (isAdaptive) {
                typeColor = 'secondary';
                ItemIcon = AutoAwesomeIcon;
                typeLabel = 'Thích ứng';
                if (hasCategory) displayTitle = `Ôn tập: ${item.category}`;
              }

              return (
                <Box key={index} sx={{
                  display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, gap: 2,
                  bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.grey[50], 0.5),
                  border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.2)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    bgcolor: isDark ? theme.palette.action.hover : alpha(theme.palette.background.paper, 0.8),
                    boxShadow: `0 4px 12px ${alpha(theme.palette[typeColor].main, 0.1)}`,
                    borderColor: alpha(theme.palette[typeColor].main, 0.3)
                  }
                }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette[typeColor].main, 0.1), color: `${typeColor}.main`, width: 48, height: 48, borderRadius: 2 }}>
                    <ItemIcon />
                  </Avatar>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" component="h3" fontWeight={700} noWrap sx={{ color: 'text.primary' }}>
                      {displayTitle}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} mt={0.5} flexWrap="wrap">
                      <Chip size="small" label={typeLabel} sx={{ bgcolor: alpha(theme.palette[typeColor].main, 0.1), color: `${typeColor}.main`, fontWeight: 700, borderRadius: 1 }} />
                      <Typography variant="caption" component="span" color="text.disabled">•</Typography>
                      <Typography variant="caption" component="span" color="text.secondary" fontWeight={600}>{item.subject || 'Toán'}</Typography>
                      <Typography variant="caption" component="span" color="text.disabled">•</Typography>
                      <Typography variant="caption" component="span" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        {new Date(item.doneAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box textAlign="right" sx={{ minWidth: 80, p: 1.5, bgcolor: alpha(theme.palette[typeColor].main, 0.05), borderRadius: 2, border: `1px dashed ${alpha(theme.palette[typeColor].main, 0.3)}` }}>
                    <Typography variant="h5" component="p" fontWeight={700} color={`${typeColor}.main`} align="center">
                      {item.score}
                      <Typography component="span" variant="body2" color="text.secondary" fontWeight={700} sx={{ ml: 0.5 }}>/ 10</Typography>
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Stack>
      </Paper>

      <Dialog open={openDrillDown} onClose={() => setOpenDrillDown(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: isDark ? 'background.paper' : theme.palette.background.paper, overflow: 'hidden' } }} aria-labelledby="drilldown-dialog-title">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, pb: 2, bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.light, 0.1) }} id="drilldown-dialog-title">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <InsightsIcon color="primary" />
            <Typography variant="h6" component="h2" fontWeight={700} color="primary.main">
              Chi tiết: {selectedChapterName}
            </Typography>
          </Stack>
          <IconButton onClick={() => setOpenDrillDown(false)} aria-label="Đóng chi tiết kỹ năng" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 4 }}>
          <Box sx={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={drillDownData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.5)} />
                <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: isDark ? theme.palette.text.secondary : theme.palette.text.secondary, fontWeight: 600 }} />
                <YAxis dataKey="topic" type="category" width={160} tick={{ fontSize: 13, fill: isDark ? theme.palette.text.primary : theme.palette.text.primary, fontWeight: 600 }} />
                <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.primary.main, 0.05) }} />
                <Bar dataKey="percent" name="Độ thông thạo (%)" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
});

export default ParentDashboard;