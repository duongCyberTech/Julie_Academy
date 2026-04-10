import React, { memo, useState, useEffect, useCallback } from "react";
import { useTheme, alpha, styled } from "@mui/material/styles";
import {
  Grid, Box, Typography, Card, CardContent, Stack, Avatar, List, ListItem, ListItemText, ListItemAvatar, Fade, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, TextField, InputAdornment, Tooltip, IconButton
} from "@mui/material";

// --- ICONS ---
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import { 
  getTutorOverallStats, 
  getExamSessionStats, 
  getAttentionRequiredStudents 
} from "../../services/DashboardTutorService";

// --- STYLES ---
const DashboardWidget = styled(Card)(({ theme }) => ({
  height: "100%", 
  backgroundColor: theme.palette.background.paper, 
  borderRadius: theme.shape.borderRadius * 2, 
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", // Thêm shadow nhẹ để card nổi bật hơn
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column'
}));

// --- COMPONENTS ---

// 1. KPI Cards
const KpiCardWidget = memo(({ title, value, icon, color = "primary" }) => {
  const theme = useTheme();
  return (
    <DashboardWidget>
      <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(theme.palette[color].main, 0.1), color: theme.palette[color].main }}>{icon}</Avatar>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold" color="text.primary">{value || 0}</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </DashboardWidget>
  );
});

// 2. Lịch Hôm Nay (Thêm nút Call to Action)
const ScheduleWidget = memo(({ schedules = [], loading }) => {
  const theme = useTheme();
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Lịch hôm nay</Typography>
        {loading ? <Box p={2} textAlign="center"><CircularProgress size={24}/></Box> : schedules.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Không có lịch trình nào trong hôm nay.</Typography>
        ) : (
          <List disablePadding>
            {schedules.map((item) => (
              <ListItem 
                key={item.id} 
                disableGutters 
                sx={{ py: 1.5, borderBottom: `1px dashed ${theme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}
                secondaryAction={
                  item.link ? (
                    <Tooltip title="Tham gia lớp học (Google Meet)">
                      <IconButton edge="end" color="primary" component="a" href={item.link} target="_blank" rel="noopener noreferrer">
                        <VideoCallOutlinedIcon fontSize="large" />
                      </IconButton>
                    </Tooltip>
                  ) : null
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <CalendarTodayOutlinedIcon color="primary" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={<Typography variant="body1" fontWeight="600">{item.title}</Typography>} 
                  secondary={<Typography variant="body2" color="text.secondary">{item.time}</Typography>} 
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </DashboardWidget>
  );
});

// 3. Tiến Độ Làm Bài (Custom Horizontal Bar với Dynamic Color)
const ClassProgressWidget = memo(({ progresses = [], loading, onApplyFilter }) => {
  const [localDayRange, setLocalDayRange] = useState(7);

  useEffect(() => {
    const handler = setTimeout(() => {
      const finalDays = (localDayRange === '' || Number(localDayRange) <= 0) ? 7 : Number(localDayRange);
      onApplyFilter(finalDays);
    }, 500); 
    return () => clearTimeout(handler);
  }, [localDayRange, onApplyFilter]);

  const getProgressColor = (pct) => {
      if (pct < 50) return 'error.main';
      if (pct < 80) return 'warning.main';
      return 'success.main';
  };

  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
            <Typography variant="h6" fontWeight={700}>Tiến độ làm bài</Typography>
            <TextField 
                size="small" type="number" value={localDayRange} onChange={(e) => setLocalDayRange(e.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end">ngày</InputAdornment> }} sx={{ width: 110 }} 
            />
        </Stack>

        {loading ? <Box p={3} textAlign="center"><CircularProgress size={30}/></Box> : progresses.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Chưa có dữ liệu tiến độ.</Typography>
        ) : (
          <Stack spacing={3}>
            {progresses.map((item) => (
              <Box key={item.id}>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" fontWeight="600">{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {item.completed}/{item.total} ({item.percentage}%)
                  </Typography>
                </Stack>
                {/* Custom Bar thay thế LinearProgress cho đẹp hơn */}
                <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ 
                        width: `${item.percentage}%`, 
                        height: '100%', 
                        bgcolor: getProgressColor(item.percentage), 
                        transition: 'width 0.8s ease-in-out' 
                    }} />
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </DashboardWidget>
  );
});

// 4. Học Sinh Cần Chú Ý (Phân loại hiển thị, thêm Avatar)
const StudentsToWatchWidget = memo(({ students = [], loading, onApplyFilter }) => {
  const [localScore, setLocalScore] = useState(1.0);
  const [localMissed, setLocalMissed] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      const finalScore = (localScore === '' || Number(localScore) < 0) ? 1.0 : Number(localScore);
      const finalMissed = (localMissed === '' || Number(localMissed) < 1) ? 1 : Number(localMissed);
      onApplyFilter(finalScore, finalMissed);
    }, 500);
    return () => clearTimeout(handler);
  }, [localScore, localMissed, onApplyFilter]);

  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
            <Typography variant="h6" fontWeight={700}>Học sinh cần chú ý</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" type="number" inputProps={{ step: "0.5", min: "0" }} value={localScore} onChange={(e) => setLocalScore(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">Tụt</InputAdornment>, endAdornment: <InputAdornment position="end">đ</InputAdornment> }} sx={{ width: 120 }} />
                <TextField size="small" type="number" inputProps={{ min: "1" }} value={localMissed} onChange={(e) => setLocalMissed(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">Vắng</InputAdornment>, endAdornment: <InputAdornment position="end">bài</InputAdornment> }} sx={{ width: 130 }} />
            </Box>
        </Stack>

        {loading ? <Box display="flex" justifyContent="center" p={3}><CircularProgress size={30}/></Box> : students.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', borderRadius: 2, color: 'success.dark', mt: 2 }}>
                <Typography variant="body1" fontWeight="600">Tuyệt vời! Không có học sinh nào nằm trong diện cảnh báo.</Typography>
            </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 500 }}>
              <TableHead>
                  <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Học Sinh</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Lớp</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Cảnh báo</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                {students.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                {row.name ? row.name.charAt(0).toUpperCase() : <PersonOutlineOutlinedIcon fontSize="small"/>}
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight={600}>{row.name}</Typography>
                        </Stack>
                    </TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{row.className}</Typography></TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {row.issues.map((issueStr, idx) => {
                            const isMissed = issueStr.includes("Vắng");
                            return (
                                <Chip 
                                    key={idx} 
                                    label={issueStr} 
                                    color={isMissed ? "error" : "warning"} 
                                    size="small" 
                                    variant={isMissed ? "filled" : "outlined"} 
                                    sx={{ fontWeight: 'bold' }} 
                                />
                            )
                        })}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </DashboardWidget>
  );
});

// 5. Chủ Đề Cần Ôn Tập (Mini Stacked Bar Chart & Sort)
const HotTopicsWidget = memo(({ topics = [], loading }) => {
  // Ưu tiên đưa các chủ đề có tỷ lệ sai cao nhất lên đầu
  const sortedTopics = [...topics].sort((a, b) => {
    const rateA = (a.correct + a.fail) > 0 ? (a.fail / (a.correct + a.fail)) : 0;
    const rateB = (b.correct + b.fail) > 0 ? (b.fail / (b.correct + b.fail)) : 0;
    return rateB - rateA;
  });

  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Chủ đề đáng báo động</Typography>
        {loading ? <Box p={2} textAlign="center"><CircularProgress size={24}/></Box> : sortedTopics.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Tốt! Không có cảnh báo về chủ đề kiến thức.</Typography>
        ) : (
          <List disablePadding>
            {sortedTopics.map((item) => {
               const totalAnswers = item.correct + item.fail;
               const failRate = totalAnswers > 0 ? Math.round((item.fail / totalAnswers) * 100) : 0;
               const correctRate = 100 - failRate;
               
               return (
                <ListItem key={item.id} disableGutters sx={{ display: 'block', mb: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5} alignItems="center">
                      <Typography variant="body2" fontWeight="600">{item.name}</Typography>
                      <Typography variant="caption" color="error.main" fontWeight="bold">Sai {failRate}%</Typography>
                  </Stack>
                  {/* THANH BAR TRỰC QUAN (Mini Stacked Bar) */}
                  <Box sx={{ width: '100%', height: 8, borderRadius: 4, display: 'flex', overflow: 'hidden', bgcolor: 'grey.200' }}>
                      <Tooltip title={`Đúng: ${item.correct} câu`} arrow>
                         <Box sx={{ width: `${correctRate}%`, bgcolor: 'success.main', transition: 'width 0.5s' }} />
                      </Tooltip>
                      <Tooltip title={`Sai: ${item.fail} câu`} arrow>
                         <Box sx={{ width: `${failRate}%`, bgcolor: 'error.main', transition: 'width 0.5s' }} />
                      </Tooltip>
                  </Box>
                </ListItem>
               );
            })}
          </List>
        )}
      </CardContent>
    </DashboardWidget>
  );
});

// --- MAIN DASHBOARD TỔNG HỢP ---
function TutorDashboard() {
  const [stats, setStats] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [progresses, setProgresses] = useState([]);
  const [students, setStudents] = useState([]);

  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);

  const loadOverallStats = useCallback(async (token) => {
    try {
        const statsRes = await getTutorOverallStats(token);
        if(!statsRes) return;
        
        setStats(statsRes);
        setSchedules((statsRes.upcomingSchedules || []).map((s, i) => ({ 
            id: s.schedule_id || i, 
            title: s.classname || s.className || "Lớp học", 
            time: `${s.startAt} - ${s.endAt}`, 
            link: s.link_meet 
        })));
        
        setTopics((statsRes.noticeCategories || []).map((t, i) => ({ 
            id: t.category_id || i, 
            name: t.category_name || "Chủ đề",
            correct: Number(t.correct_cnt || 0),
            fail: Number(t.fail_cnt || 0)
        })));
    } catch (e) { console.error(e); } finally { setIsStatsLoading(false); }
  }, []);

  const loadProgress = useCallback(async (token, dayRange) => {
      setIsProgressLoading(true);
      try {
          let res = await getExamSessionStats(token, dayRange);
          let rawData = Array.isArray(res) ? res : (res?.data || []);
          setProgresses(rawData.map((p, i) => {
            const completed = p.num_students_done || p.completed || p.submitted || 0;
            const total = p.total_class_students || p.total || 1;
            return { id: p.session_id || p.id || i, name: p.classname || p.name || "Lớp", completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
          }));
      } catch (e) { console.error(e); } finally { setIsProgressLoading(false); }
  }, []);

  const loadStudents = useCallback(async (token, scoreThreshold, missedThreshold) => {
      setIsStudentsLoading(true);
      try {
          const res = await getAttentionRequiredStudents(token, { limit: 20, scoreThreshold, missedThreshold });
          if (!res) return setStudents([]);

          const studentMap = new Map();
          // Map Vắng thi
          (res.exam_miss_report || []).forEach(st => {
            const info = st.info || {}; const uid = info.uid; const missedTests = st.num_test_missed || [];
            const totalMissed = missedTests.reduce((sum, current) => sum + (current.num_missed || 0), 0);
            if (uid) studentMap.set(uid, { id: uid, name: [info.lname, info.mname, info.fname].filter(Boolean).join(" ") || "Học sinh", classNames: missedTests.map(c => c.classname), issues: totalMissed > 0 ? [`Vắng ${totalMissed} bài`] : [] });
          });

          // Map Tụt điểm
          (res.exam_score_report || []).forEach(st => {
            const info = st.info || {}; const uid = info.uid; const flaggedClasses = st.flagged_classes || [];
            if (uid) {
              const existing = studentMap.get(uid) || { id: uid, name: [info.lname, info.mname, info.fname].filter(Boolean).join(" ") || "Học sinh", classNames: [], issues: [] };
              existing.classNames.push(...flaggedClasses.map(c => c.classname));
              existing.issues.push(...flaggedClasses.map(c => `Giảm ${Math.abs(c.score_diff)} điểm`));
              studentMap.set(uid, existing);
            }
          });

          // Sắp xếp ưu tiên: Ai có issues Vắng thi lên trước
          const finalStudents = Array.from(studentMap.values()).map(st => ({ 
              ...st, 
              className: Array.from(new Set(st.classNames.flatMap(c => c?.split(", ")))).join(", ") || "-" 
          })).sort((a, b) => {
              const aHasMiss = a.issues.some(i => i.includes("Vắng"));
              const bHasMiss = b.issues.some(i => i.includes("Vắng"));
              return (aHasMiss === bHasMiss) ? 0 : aHasMiss ? -1 : 1;
          });

          setStudents(finalStudents);
      } catch (e) { console.error(e); } finally { setIsStudentsLoading(false); }
  }, []);

  const handleApplyProgressFilter = useCallback((days) => {
      const token = localStorage.getItem('token');
      if(token) loadProgress(token, days);
  }, [loadProgress]);

  const handleApplyStudentFilter = useCallback((score, miss) => {
      const token = localStorage.getItem('token');
      if(token) loadStudents(token, score, miss);
  }, [loadStudents]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    loadOverallStats(token);
  }, [loadOverallStats]);

  const kpiCardsData = [
    { id: 'students', title: "Tổng học sinh", value: stats?.numStudent, icon: <PeopleAltOutlinedIcon fontSize="large" />, color: "primary" },
    { id: 'classes', title: "Lớp phụ trách", value: stats?.numClasses, icon: <SchoolOutlinedIcon fontSize="large" />, color: "secondary" },
    { id: 'questions', title: "Câu hỏi đóng góp", value: stats?.numQuestions, icon: <QuizOutlinedIcon fontSize="large" />, color: "success" },
  ];

  return (
    <Fade in timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">Dashboard Tổng Quan</Typography>
        <Grid container spacing={3}>
          {/* KPI Cards */}
          {kpiCardsData.map((item) => (
            <Grid size={{ xs: 12, sm: 4 }} key={item.id}>
              <KpiCardWidget title={item.title} value={item.value} icon={item.icon} color={item.color} />
            </Grid>
          ))}
          
          {/* Hàng 2: Lịch & Tiến độ */}
          <Grid size={{ xs: 12, lg: 8 }}>
              <ScheduleWidget schedules={schedules} loading={isStatsLoading} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
              <ClassProgressWidget progresses={progresses} loading={isProgressLoading} onApplyFilter={handleApplyProgressFilter} />
          </Grid>
          
          {/* Hàng 3: Báo động học sinh & Chủ đề */}
          <Grid size={{ xs: 12, lg: 8 }}>
              <StudentsToWatchWidget students={students} loading={isStudentsLoading} onApplyFilter={handleApplyStudentFilter} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
              <HotTopicsWidget topics={topics} loading={isStatsLoading} />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}

export default memo(TutorDashboard);