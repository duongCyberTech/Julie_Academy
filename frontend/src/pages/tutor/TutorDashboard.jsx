import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useTheme, alpha, styled } from "@mui/material/styles";
import {
  Grid, Box, Typography, Card, CardContent, Stack, Avatar, List, ListItem, Tooltip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, TextField, InputAdornment, Fade
} from "@mui/material";

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import { 
  getTutorOverallStats, 
  getAttentionRequiredStudents 
} from "../../services/DashboardTutorService";

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

const DashboardWidget = styled(Card)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    height: "100%", 
    backgroundColor: theme.palette.background.paper, 
    borderRadius: '12px', 
    boxShadow: isDark ? 'none' : `0px 4px 20px ${alpha(theme.palette.common.black, 0.04)}`,
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        boxShadow: isDark ? `0 0 12px ${alpha(theme.palette.primary.main, 0.1)}` : `0px 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
    }
  };
});

const KpiCardWidget = memo(({ title, subtitle, value, subValue, icon, color = "primary" }) => {
  const theme = useTheme();
  return (
    <DashboardWidget>
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', alignItems: 'center', '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette[color].main, 0.1), color: theme.palette[color].main }}>{icon}</Avatar>
          <Box>
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <Typography variant="h5" component="div" fontWeight={700} color="text.primary">
                {value !== undefined ? value : 0}
              </Typography>
              {subValue !== undefined && (
                <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                  / {subValue}
                </Typography>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" sx={{ mt: 0.25, display: 'block' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color={alpha(theme.palette.text.secondary, 0.7)} fontWeight={600} sx={{ display: 'block', mt: -0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </DashboardWidget>
  );
});

const StudentsToWatchWidget = memo(({ students = [], loading, onApplyFilter }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [localScore, setLocalScore] = useState('1.0');
  const [localMissed, setLocalMissed] = useState('1');

  useEffect(() => {
    const handler = setTimeout(() => {
      const finalScore = (localScore === '' || isNaN(Number(localScore))) ? 1.0 : Number(localScore);
      const finalMissed = (localMissed === '' || isNaN(Number(localMissed))) ? 1 : Number(localMissed);
      onApplyFilter(finalScore, finalMissed);
    }, 600);
    return () => clearTimeout(handler);
  }, [localScore, localMissed, onApplyFilter]);

  const handleScoreChange = useCallback((e) => setLocalScore(e.target.value), []);
  const handleMissedChange = useCallback((e) => setLocalMissed(e.target.value), []);

  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
            <Box>
                <Typography variant="h6" fontWeight={700}>Học sinh cần chú ý</Typography>
                <Typography variant="body2" color="text.secondary">Danh sách cần theo dõi sát sao</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                    size="small" 
                    type="number" 
                    inputProps={{ step: "0.5", min: "0" }} 
                    value={localScore} 
                    onChange={handleScoreChange}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start">Tụt</InputAdornment>, 
                      endAdornment: <InputAdornment position="end">đ</InputAdornment> 
                    }} 
                    sx={{ width: 140 }} 
                />
                <TextField 
                    size="small" 
                    type="number" 
                    inputProps={{ min: "1" }} 
                    value={localMissed} 
                    onChange={handleMissedChange}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start">Vắng</InputAdornment>, 
                      endAdornment: <InputAdornment position="end">bài</InputAdornment> 
                    }} 
                    sx={{ width: 140 }} 
                />
            </Box>
        </Stack>

        {loading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress size={30}/></Box> : students.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2, color: theme.palette.success.main, mt: 2 }}>
                <Typography variant="body1" fontWeight={600}>Tuyệt vời! Không có học sinh nào nằm trong diện cảnh báo.</Typography>
            </Box>
        ) : (
          <TableContainer sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead>
                  <TableRow>
                      <TableCell sx={{ fontWeight: 700, borderBottom: `2px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}` }}>Học Sinh</TableCell>
                      <TableCell sx={{ fontWeight: 700, borderBottom: `2px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}` }}>Lớp</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, borderBottom: `2px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}` }}>Vấn đề</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                {students.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}` }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                                {row.name ? row.name.charAt(0).toUpperCase() : <PersonOutlineOutlinedIcon/>}
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight={600}>{row.name}</Typography>
                        </Stack>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}` }}><Typography variant="body2" color="text.secondary">{row.className}</Typography></TableCell>
                    <TableCell align="right" sx={{ borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}` }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                        {row.issues.map((issueStr, idx) => {
                            const isMissed = issueStr.includes("Vắng");
                            return (
                                <Chip 
                                    key={idx} 
                                    label={issueStr} 
                                    color={isMissed ? "error" : "warning"} 
                                    size="small" 
                                    sx={{ fontWeight: 700, borderRadius: '8px' }} 
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

const HotTopicsWidget = memo(({ topics = [], loading }) => {
  const theme = useTheme();

  const sortedTopics = useMemo(() => {
    return [...topics].sort((a, b) => {
      const rateA = (a.correct + a.fail) > 0 ? (a.fail / (a.correct + a.fail)) : 0;
      const rateB = (b.correct + b.fail) > 0 ? (b.fail / (b.correct + b.fail)) : 0;
      return rateB - rateA;
    });
  }, [topics]);

  return (
    <DashboardWidget>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Typography variant="h6" fontWeight={700} mb={3}>Lỗ hổng kiến thức</Typography>
        {loading ? <Box p={4} textAlign="center"><CircularProgress size={30}/></Box> : sortedTopics.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Học sinh đang nắm vững các chủ đề.</Typography>
        ) : (
          <List disablePadding>
            {sortedTopics.map((item) => {
               const totalAnswers = item.correct + item.fail;
               const failRate = totalAnswers > 0 ? Math.round((item.fail / totalAnswers) * 100) : 0;
               const correctRate = 100 - failRate;
               
               return (
                <ListItem key={item.id} disableGutters sx={{ display: 'block', mb: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5} alignItems="center">
                      <Typography variant="subtitle2" fontWeight={700}>{item.name}</Typography>
                      <Typography variant="caption" color="error.main" fontWeight={700}>Sai {failRate}%</Typography>
                  </Stack>
                  <Box sx={{ width: '100%', height: 6, borderRadius: '8px', display: 'flex', overflow: 'hidden', bgcolor: alpha(theme.palette.divider, 0.3) }}>
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

const ScheduleWidget = memo(({ schedules = [], loading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const currentMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  return (
    <DashboardWidget sx={{ bgcolor: isDark ? 'transparent' : alpha(theme.palette.primary.main, 0.02) }}>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Lịch dạy hôm nay</Typography>
        {loading ? <Box p={2} textAlign="center"><CircularProgress size={24}/></Box> : schedules.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Bạn không có ca dạy nào trong hôm nay.</Typography>
        ) : (
          <Grid container spacing={3}>
            {schedules.map((item) => {
              let isPast = false;
              if (item.rawEnd) {
                  const [hour, min] = item.rawEnd.split(':').map(Number);
                  if (!isNaN(hour) && !isNaN(min)) {
                      isPast = currentMinutes > (hour * 60 + min);
                  }
              }

              return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item.id}>
                  <Box sx={{ 
                      p: 2, 
                      bgcolor: isPast ? alpha(theme.palette.action.disabledBackground, 0.3) : theme.palette.background.paper, 
                      borderRadius: '12px', 
                      border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      opacity: isPast ? 0.6 : 1,
                      filter: isPast ? 'grayscale(100%)' : 'none',
                      transition: 'all 0.3s ease'
                  }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: isPast ? 'action.disabledBackground' : alpha(theme.palette.primary.main, 0.1), color: isPast ? 'text.disabled' : 'primary.main', borderRadius: '8px' }}>
                            <CalendarTodayOutlinedIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} color={isPast ? 'text.disabled' : 'text.primary'}>{item.title}</Typography>
                            <Typography variant="caption" color={isPast ? 'text.disabled' : 'text.secondary'} fontWeight={600}>{item.time}</Typography>
                        </Box>
                    </Stack>
                    {item.link && (
                        <Tooltip title={isPast ? "Đã kết thúc" : "Vào Google Meet"}>
                            <span>
                                <IconButton 
                                    color="primary" 
                                    component="a" 
                                    href={item.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    disabled={isPast}
                                >
                                    <VideoCallOutlinedIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    )}
                  </Box>
              </Grid>
            )})}
          </Grid>
        )}
      </CardContent>
    </DashboardWidget>
  );
});

function TutorDashboard() {
  const [stats, setStats] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [students, setStudents] = useState([]);

  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);

  const loadOverallStats = useCallback(async (token) => {
    try {
        const statsRes = await getTutorOverallStats(token);
        if(!statsRes) return;
        
        setStats(statsRes);
        setSchedules((statsRes.upcomingSchedules || []).map((s, i) => ({ 
            id: s.schedule_id || i, 
            title: s.classname || s.className || "Lớp học", 
            time: `${s.startAt.slice(0,5)} - ${s.endAt.slice(0,5)}`, 
            rawEnd: s.endAt,
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

  const loadStudents = useCallback(async (token, scoreThreshold, missedThreshold) => {
      setIsStudentsLoading(true);
      try {
          const res = await getAttentionRequiredStudents(token, { limit: 20, scoreThreshold, missedThreshold });
          if (!res) return setStudents([]);

          const studentMap = new Map();
          
          (res.exam_miss_report || []).forEach(st => {
            const info = st.info || {}; 
            const uid = info.uid; 
            const missedTests = st.num_test_missed || [];
            
            const maxMissed = missedTests.reduce((max, current) => Math.max(max, current.num_missed || 0), 0);
            
            if (uid && maxMissed >= missedThreshold) {
                studentMap.set(uid, { 
                    id: uid, 
                    name: [info.lname, info.mname, info.fname].filter(Boolean).join(" ") || "Học sinh", 
                    classNames: missedTests.map(c => c.classname), 
                    issues: [`Vắng ${maxMissed} bài`] 
                });
            }
          });

          (res.exam_score_report || []).forEach(st => {
            const info = st.info || {}; 
            const uid = info.uid; 
            const flaggedClasses = st.flagged_classes || [];
            
            const validDrops = flaggedClasses.filter(c => 
                c.score_diff !== null && Number(c.score_diff) <= -scoreThreshold
            );

            if (uid && validDrops.length > 0) {
              const existing = studentMap.get(uid) || { id: uid, name: [info.lname, info.mname, info.fname].filter(Boolean).join(" ") || "Học sinh", classNames: [], issues: [] };
              existing.classNames.push(...validDrops.map(c => c.classname));
              existing.issues.push(...validDrops.map(c => `Tụt ${Math.abs(c.score_diff)}đ`));
              
              studentMap.set(uid, existing);
            }
          });

          const finalStudents = Array.from(studentMap.values()).map(st => ({ 
              ...st, 
              className: Array.from(new Set(st.classNames)).join(", ") || "-" 
          })).sort((a, b) => {
              const aHasMiss = a.issues.some(i => i.includes("Vắng"));
              const bHasMiss = b.issues.some(i => i.includes("Vắng"));
              return (aHasMiss === bHasMiss) ? 0 : aHasMiss ? -1 : 1;
          });

          setStudents(finalStudents);
      } catch (e) { console.error(e); } finally { setIsStudentsLoading(false); }
  }, []);

  const handleApplyStudentFilter = useCallback((score, miss) => {
      const token = localStorage.getItem('token');
      if(token) loadStudents(token, score, miss);
  }, [loadStudents]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    loadOverallStats(token);
  }, [loadOverallStats]);

  const kpiCardsData = useMemo(() => [
    { 
        id: 'students', 
        title: "Học sinh", 
        subtitle: "Đang học / Tổng",
        value: stats?.numStudent?.ongoing, 
        subValue: stats?.numStudent?.total, 
        icon: <PeopleAltOutlinedIcon fontSize="medium" />, 
        color: "primary" 
    },
    { 
        id: 'classes', 
        title: "Lớp học", 
        subtitle: "Đang mở / Tổng",
        value: stats?.numClasses?.ongoing, 
        subValue: stats?.numClasses?.total, 
        icon: <SchoolOutlinedIcon fontSize="medium" />, 
        color: "info" 
    },
    { 
        id: 'questions', 
        title: "Câu hỏi đóng góp", 
        subtitle: "Tổng ngân hàng đề",
        value: stats?.numQuestions, 
        subValue: undefined, 
        icon: <QuizOutlinedIcon fontSize="medium" />, 
        color: "success" 
    },
  ], [stats]);

  return (
    <Fade in timeout={500}>
      <PageWrapper>
        <Grid container spacing={3}>
          {kpiCardsData.map((item) => (
            <Grid size={{ xs: 12, sm: 4 }} key={item.id}>
              <KpiCardWidget 
                  title={item.title} 
                  subtitle={item.subtitle}
                  value={item.value} 
                  subValue={item.subValue}
                  icon={item.icon} 
                  color={item.color} 
              />
            </Grid>
          ))}
          
          <Grid size={{ xs: 12, lg: 8 }}>
              <StudentsToWatchWidget students={students} loading={isStudentsLoading} onApplyFilter={handleApplyStudentFilter} />
          </Grid>
          
          <Grid size={{ xs: 12, lg: 4 }}>
              <HotTopicsWidget topics={topics} loading={isStatsLoading} />
          </Grid>

          <Grid size={{ xs: 12 }}>
              <ScheduleWidget schedules={schedules} loading={isStatsLoading} />
          </Grid>
        </Grid>
      </PageWrapper>
    </Fade>
  );
}

export default memo(TutorDashboard);