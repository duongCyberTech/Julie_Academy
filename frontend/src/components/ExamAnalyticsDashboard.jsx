import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Stack, IconButton, Dialog, 
  AppBar, Toolbar, Grid, Slide, Chip, CircularProgress,
  Slider, FormControlLabel, Checkbox, useTheme,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Tooltip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { getExamSessionDashboard } from '../services/AnalysisService';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DashboardWrapper = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    backgroundColor: isDark ? theme.palette.background.default : '#F9FAFB',
    minHeight: '100vh',
    padding: theme.spacing(4),
    [theme.breakpoints.down('md')]: { padding: theme.spacing(2) }
  };
});

const AnalyticsCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    padding: theme.spacing(3),
    borderRadius: '16px',
    backgroundColor: theme.palette.background.paper,
    backgroundImage: 'none',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: isDark ? `0 0 20px ${alpha(theme.palette.primary.main, 0.03)}` : '0px 4px 20px rgba(0,0,0,0.02)',
  };
});

const StatCard = memo(({ icon, title, value, color }) => (
  <AnalyticsCard sx={{ p: 2.5, justifyContent: 'center' }}>
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(color, 0.1), color: color, display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>{title}</Typography>
        <Typography variant="h5" fontWeight={700} color="text.primary">{value}</Typography>
      </Box>
    </Stack>
  </AnalyticsCard>
));

const ExamAnalyticsDashboard = ({ open, onClose, classId, examId, sessionId, examTitle, token }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  const [scoreRange, setScoreRange] = useState([0, 10]);
  const [timeRange, setTimeRange] = useState([0, 120]);
  const [statusFilter, setStatusFilter] = useState({ submitted: true, pending: true, notStarted: true });
  
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('score');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getExamSessionDashboard(classId, examId, sessionId, token);
      setData(res);
      if (res?.student_list) {
        const maxTime = Math.max(...res.student_list.map(s => s.time_spent || 0), 30);
        setTimeRange([0, Math.ceil(maxTime / 10) * 10]); 
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [classId, examId, sessionId, token]);

  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  const handleViewQuestionDetail = useCallback((quesId) => {
    if (!quesId) return;
    onClose();
    setTimeout(() => {
        navigate(`/tutor/question/${quesId}`);
    }, 150);
  }, [navigate, onClose]);

  const handleRequestSort = useCallback((property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const filteredStudents = useMemo(() => {
    if (!data?.student_list) return [];
    return data.student_list.filter(s => {
      const score = s.score ?? -1;
      const time = s.time_spent ?? 0;
      const inScoreRange = score === -1 ? true : (score >= scoreRange[0] && score <= scoreRange[1]);
      const inTimeRange = time >= timeRange[0] && time <= timeRange[1];
      let inStatus = false;
      if (s.status === 'Đã nộp' && statusFilter.submitted) inStatus = true;
      if (s.status === 'Đang làm' && statusFilter.pending) inStatus = true;
      if (s.status === 'Chưa làm' && statusFilter.notStarted) inStatus = true;
      return inScoreRange && inStatus && inTimeRange;
    });
  }, [data, scoreRange, timeRange, statusFilter]);

  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];
      
      if (orderBy === 'score') {
        aValue = aValue !== null ? Number(aValue) : -1;
        bValue = bValue !== null ? Number(bValue) : -1;
      }
      
      if (bValue < aValue) return order === 'asc' ? 1 : -1;
      if (bValue > aValue) return order === 'asc' ? -1 : 1;
      return 0;
    });
  }, [filteredStudents, order, orderBy]);

  const dynamicScoreChartData = useMemo(() => {
    const dist = { '0-2': 0, '2-4': 0, '4-6': 0, '6-8': 0, '8-10': 0 };
    filteredStudents.forEach(s => {
      if (s.score === null) return;
      if (s.score < 2) dist['0-2']++;
      else if (s.score < 4) dist['2-4']++;
      else if (s.score < 6) dist['4-6']++;
      else if (s.score < 8) dist['6-8']++;
      else dist['8-10']++;
    });
    return Object.entries(dist).map(([label, value]) => ({ label, value }));
  }, [filteredStudents]);

  const difficultyData = useMemo(() => {
    if (!data?.charts?.accuracy_by_difficulty) return [];
    const levelMap = { 'easy': 'Mức Dễ', 'medium': 'Mức TB', 'hard': 'Mức Khó' };
    return data.charts.accuracy_by_difficulty.map(d => ({
      level: levelMap[d.level] || d.level,
      accuracy: d.accuracy,
      fill: d.level === 'easy' ? theme.palette.success.main : d.level === 'medium' ? theme.palette.warning.main : theme.palette.error.main
    }));
  }, [data, theme]);

  const customTooltipStyle = useMemo(() => ({
    borderRadius: '12px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: isDark ? 'none' : '0px 8px 24px rgba(0,0,0,0.1)',
    color: theme.palette.text.primary,
    fontWeight: 700
  }), [isDark, theme]);

  if (loading && !data) return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.paper' }}><CircularProgress /></Box>
    </Dialog>
  );

  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
      <AppBar elevation={0} sx={{ position: 'relative', bgcolor: 'background.paper', borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}` }}>
        <Toolbar>
          <IconButton edge="start" onClick={onClose} sx={{ color: 'text.primary', mr: 2 }}><CloseIcon /></IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={700} color="text.primary">{examTitle}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Báo cáo chi tiết kết quả phân tích</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <DashboardWrapper>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="ĐIỂM TRUNG BÌNH" value={data?.overview.average_score} icon={<TrendingUpIcon />} color={theme.palette.primary.main} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="ĐIỂM CAO NHẤT" value={data?.overview.max_score} icon={<EmojiEventsIcon />} color={theme.palette.success.main} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="ĐÃ NỘP BÀI" value={`${data?.overview.submitted_count}/${data?.overview.total_enrolled}`} icon={<PeopleIcon />} color={theme.palette.info.main} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="THỜI GIAN TB" value={`${Math.round(filteredStudents.filter(s => s.status === 'Đã nộp').reduce((acc, curr) => acc + curr.time_spent, 0) / (filteredStudents.filter(s => s.status === 'Đã nộp').length || 1))} phút`} icon={<TimerIcon />} color={theme.palette.warning.main} /></Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard>
              <Typography variant="subtitle2" fontWeight={700} mb={3} color="text.secondary">PHỔ ĐIỂM (THEO BỘ LỌC)</Typography>
              <Box sx={{ height: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicScoreChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.4)} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 600, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fontWeight: 600, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: alpha(theme.palette.action.hover, 0.1) }} contentStyle={customTooltipStyle} itemStyle={{ color: theme.palette.text.primary }} />
                    <Bar dataKey="value" name="Số HS" fill={alpha(theme.palette.primary.main, 0.8)} radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </AnalyticsCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard>
              <Typography variant="subtitle2" fontWeight={700} mb={3} color="text.secondary">TỶ LỆ ĐÚNG THEO ĐỘ KHÓ</Typography>
              <Box sx={{ height: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={alpha(theme.palette.divider, 0.4)} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} tick={{ fontSize: 12, fontWeight: 600, fill: theme.palette.text.secondary }} />
                    <YAxis type="category" dataKey="level" tick={{ fontSize: 12, fontWeight: 700, fill: theme.palette.text.primary }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: alpha(theme.palette.action.hover, 0.1) }} contentStyle={customTooltipStyle} formatter={(value) => [`${value}% Tỷ lệ đúng`]} />
                    <Bar dataKey="accuracy" name="Tỷ lệ đúng" radius={[0, 6, 6, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </AnalyticsCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsCard>
              <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary">TOP CÂU HỎI SAI NHIỀU NHẤT</Typography>
              <Stack spacing={2} sx={{ overflowY: 'auto', flexGrow: 1, pr: 1 }}>
                {data?.charts.hardest_questions.length > 0 ? data.charts.hardest_questions.map((q, idx) => (
                  <Box key={q.ques_id || idx} sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.error.main, 0.03), border: `1px solid ${alpha(theme.palette.error.main, 0.1)}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="body2" fontWeight={700} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', pr: 1, lineHeight: 1.4 }}>
                        {q.title}
                      </Typography>
                      <Tooltip title="Xem nội dung chi tiết và sửa câu hỏi">
                        <IconButton size="small" color="primary" onClick={() => handleViewQuestionDetail(q.ques_id)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
                          <OpenInNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ height: 6, flexGrow: 1, bgcolor: alpha(theme.palette.divider, 0.4), borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${q.fail_rate}%`, bgcolor: 'error.main', borderRadius: 3 }} />
                      </Box>
                      <Typography variant="caption" color="error.main" fontWeight={700}>{q.fail_rate}% Sai</Typography>
                    </Stack>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>Chưa đủ dữ liệu thống kê câu hỏi.</Typography>
                )}
              </Stack>
            </AnalyticsCard>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <AnalyticsCard sx={{ overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.primary.main, 0.02), borderRadius: '12px', mb: 2, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.primary.main, 0.1)}` }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                  <Box sx={{ flexGrow: 1, width: '100%' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">KHOẢNG ĐIỂM SỐ ({scoreRange[0]} - {scoreRange[1]})</Typography>
                    <Slider size="small" value={scoreRange} onChange={(e, val) => setScoreRange(val)} min={0} max={10} step={0.5} sx={{ mt: 1 }} />
                  </Box>
                  <Box sx={{ flexGrow: 1, width: '100%' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">THỜI GIAN LÀM ({timeRange[0]}p - {timeRange[1]}p)</Typography>
                    <Slider size="small" value={timeRange} onChange={(e, val) => setTimeRange(val)} min={0} max={120} step={5} color="secondary" sx={{ mt: 1 }} />
                  </Box>
                  <Box sx={{ minWidth: 300 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>TRẠNG THÁI NỘP BÀI</Typography>
                    <Stack direction="row" spacing={1}>
                      <FormControlLabel control={<Checkbox size="small" checked={statusFilter.submitted} onChange={e => setStatusFilter({...statusFilter, submitted: e.target.checked})} />} label={<Typography variant="body2" fontWeight={600}>Đã nộp</Typography>} />
                      <FormControlLabel control={<Checkbox size="small" checked={statusFilter.pending} onChange={e => setStatusFilter({...statusFilter, pending: e.target.checked})} />} label={<Typography variant="body2" fontWeight={600}>Đang làm</Typography>} />
                      <FormControlLabel control={<Checkbox size="small" checked={statusFilter.notStarted} onChange={e => setStatusFilter({...statusFilter, notStarted: e.target.checked})} />} label={<Typography variant="body2" fontWeight={600}>Chưa bắt đầu</Typography>} />
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>Danh sách chi tiết ({sortedStudents.length})</Typography>
                <Button variant="outlined" startIcon={<FilterAltIcon />} sx={{ borderRadius: '8px', fontWeight: 600 }}>Xuất báo cáo</Button>
              </Stack>
              
              <TableContainer sx={{ maxHeight: 400, border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, borderRadius: '12px' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                        <TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleRequestSort('name')}>HỌ VÀ TÊN</TableSortLabel>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                        <TableSortLabel active={orderBy === 'score'} direction={orderBy === 'score' ? order : 'asc'} onClick={() => handleRequestSort('score')}>ĐIỂM SỐ</TableSortLabel>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                        <TableSortLabel active={orderBy === 'time_spent'} direction={orderBy === 'time_spent' ? order : 'asc'} onClick={() => handleRequestSort('time_spent')}>THỜI GIAN</TableSortLabel>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                        <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleRequestSort('status')}>TRẠNG THÁI</TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedStudents.length > 0 ? sortedStudents.map((student) => (
                      <TableRow key={student.uid} hover>
                        <TableCell><Typography variant="body2" fontWeight={700}>{student.name}</Typography></TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={700} color={student.score >= 5 ? 'success.main' : (student.score === null ? 'text.disabled' : 'error.main')}>
                            {student.score !== null ? student.score : '--'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center"><Typography variant="body2" fontWeight={600} color="text.secondary">{student.time_spent > 0 ? `${student.time_spent} phút` : '--'}</Typography></TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={student.status} 
                            size="small" 
                            color={student.status === 'Đã nộp' ? 'success' : (student.status === 'Đang làm' ? 'warning' : 'default')} 
                            variant={student.status === 'Chưa làm' ? 'outlined' : 'filled'}
                            sx={{ fontWeight: 700, borderRadius: '8px' }} 
                          />
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary" fontWeight={600}>Không tìm thấy học sinh phù hợp với bộ lọc.</Typography></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </AnalyticsCard>
          </Grid>
        </Grid>
      </DashboardWrapper>
    </Dialog>
  );
};

export default memo(ExamAnalyticsDashboard);