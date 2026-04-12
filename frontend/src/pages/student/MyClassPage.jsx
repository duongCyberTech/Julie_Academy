import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Snackbar,
  Alert,
  Avatar,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
  Paper,
  Button
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

import GroupIcon from '@mui/icons-material/Group';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';

import { getAllClasses } from '../../services/ClassService';
import classBg from '../../assets/images/class.webp';

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
  };
});

const HeaderBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  flexShrink: 0,
}));

// Tối ưu hóa UI: Card trở thành nút bấm
const StyledClassCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isClickable',
})(({ theme, isClickable }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    borderRadius: '16px',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`,
    boxShadow: isDark ? 'none' : '0px 4px 12px rgba(0,0,0,0.02)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    cursor: isClickable ? 'pointer' : 'default',
    '&:hover': isClickable ? {
      transform: 'translateY(-6px)',
      boxShadow: isDark ? `0 0 24px ${alpha(theme.palette.primary.main, 0.15)}` : '0px 16px 32px rgba(0,0,0,0.08)',
      borderColor: theme.palette.primary.main,
    } : {}
  };
});

const formatSchedule = (scheduleData) => {
  if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) return "Chưa xếp lịch";
  
  return scheduleData.map(s => {
      const dayVal = s.meeting_date ?? s.day ?? s.day_of_week;
      const dayMap = { '2': 'T2', '3': 'T3', '4': 'T4', '5': 'T5', '6': 'T6', '7': 'T7', '8': 'CN', '1': 'CN', '0': 'CN' };
      const dayStr = dayMap[String(dayVal)] || '?'; 

      const startTime = s.startAt ?? s.startTime ?? '';
      const endTime = s.endAt ?? s.endTime ?? '';
      
      const timeStr = (startTime && endTime) 
        ? `(${startTime.substring(0, 5)} - ${endTime.substring(0, 5)})` 
        : (startTime ? `(${startTime.substring(0, 5)})` : '');

      return `${dayStr} ${timeStr}`.trim();
  }).join(', ');
};

function StudentMyClassPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [activeClasses, setActiveClasses] = useState([]);
  const [pendingClasses, setPendingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(Number(localStorage.getItem('tab')) || 0);

  const fetchMyClasses = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      let currentUserId = "";
      try {
        const decoded = jwtDecode(token);
        currentUserId = decoded.sub || decoded.uid || decoded.userId;
      } catch (e) {
        console.error("Token decode error", e);
      }

      setLoading(true);
      const response = await getAllClasses({ limit: 100 }, token);
      const allList = Array.isArray(response) ? response : (response?.data || []);

      const accepted = [];
      const pending = [];

      allList.forEach(cls => {
        const myEnrollment = cls.learning?.find(l => 
          l.student?.user?.uid === currentUserId || 
          l.student?.uid === currentUserId ||
          l.student_uid === currentUserId
        );

        if (myEnrollment) {
          const mappedClass = {
            id: cls.class_id,
            name: cls.classname,
            tutor_name: cls.tutor?.user ? `${cls.tutor.user.lname} ${cls.tutor.user.fname}` : "Giáo viên",
            tutor_avatar: cls.tutor?.user?.avata_url,
            student_count: cls.nb_of_student || 0,
            next_session: formatSchedule(cls.schedule),
            status: myEnrollment.status,
            subject: cls.subject
          };

          if (myEnrollment.status === 'accepted') {
            accepted.push(mappedClass);
          } else if (myEnrollment.status === 'pending') {
            pending.push(mappedClass);
          }
        }
      });

      setActiveClasses(accepted);
      setPendingClasses(pending);

    } catch (error) {
      setToast({ open: true, message: "Không tải được danh sách lớp học.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]);

  const handleCloseToast = useCallback(() => setToast(prev => ({ ...prev, open: false })), []);
  
  const handleEnterClass = useCallback((classId) => {
    navigate(`/student/classes/${classId}`);
  }, [navigate]);

  const handleChangeTab = useCallback((event, newValue) => {
    setTabValue(newValue);
    localStorage.setItem('tab', newValue);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } })
  };

  const displayList = useMemo(() => tabValue === 0 ? activeClasses : pendingClasses, [tabValue, activeClasses, pendingClasses]);

  if (loading) return <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></PageWrapper>;

  return (
    <PageWrapper>
      <HeaderBar>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">
            Lớp học của tôi
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
            Quản lý tiến độ học tập và lịch học của bạn.
          </Typography>
        </Box>
      </HeaderBar>

      <Box sx={{ borderBottom: 1, borderColor: isDark ? theme.palette.midnight?.border : 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleChangeTab} aria-label="class tabs" textColor="primary" indicatorColor="primary">
          <Tab 
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircleIcon fontSize="small" />
                <span style={{ fontWeight: 600 }}>Đang học ({activeClasses.length})</span>
              </Stack>
            } 
          />
          <Tab 
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <HourglassEmptyIcon fontSize="small" />
                <span style={{ fontWeight: 600 }}>Chờ duyệt ({pendingClasses.length})</span>
              </Stack>
            } 
          />
        </Tabs>
      </Box>

      {displayList.length === 0 && (
        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 3, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
          <SchoolIcon sx={{ fontSize: 60, opacity: 0.2, mb: 2, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            {tabValue === 0 ? "Bạn chưa tham gia lớp học nào." : "Không có yêu cầu nào đang chờ duyệt."}
          </Typography>
          {tabValue === 0 && (
            <Button variant="contained" sx={{ mt: 3, borderRadius: '12px', fontWeight: 700, px: 4, py: 1 }} onClick={() => navigate('/student/enroll')}>
              Tìm lớp học ngay
            </Button>
          )}
        </Box>
      )}

      {/* Áp dụng chuẩn MUI v6 Grid với prop size */}
      <Grid container spacing={3}>
        {displayList.map((cls, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={cls.id}>
            <motion.div
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              style={{ height: "100%", width: "100%" }}
            >
              <StyledClassCard 
                isClickable={tabValue === 0}
                onClick={() => tabValue === 0 ? handleEnterClass(cls.id) : undefined}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={classBg} 
                    alt={cls.name}
                    sx={{ 
                      objectFit: 'cover',
                      filter: isDark ? 'brightness(0.85)' : 'none' 
                    }}
                  />
                  <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)'
                  }} />
                  
                  <Stack direction="row" justifyContent="space-between" sx={{ position: 'absolute', top: 12, left: 12, right: 12 }}>
                    <Chip 
                      label={cls.subject} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(theme.palette.background.paper, 0.95), 
                        color: 'primary.main', 
                        fontWeight: 700, 
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Chip 
                      label={tabValue === 0 ? "Đang học" : "Chờ duyệt"} 
                      size="small" 
                      color={tabValue === 0 ? "success" : "warning"} 
                      sx={{ fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                    />
                  </Stack>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      lineHeight: 1.4,
                      mb: 2,
                      minHeight: "48px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {cls.name}
                  </Typography>

                  <Tooltip title={`Giáo viên phụ trách: ${cls.tutor_name}`} placement="top" arrow>
                    <Box sx={{ 
                      display: 'flex', alignItems: 'center', p: 1.2, mb: 2.5, 
                      bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.04), 
                      borderRadius: 2 
                    }}>
                      <Avatar
                        src={cls.tutor_avatar}
                        sx={{ 
                          width: 42, height: 42, mr: 1.5, 
                          border: `2px solid ${theme.palette.background.paper}`, 
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
                          bgcolor: alpha(theme.palette.primary.main, 0.2), 
                          color: 'primary.main', 
                          fontWeight: 700 
                        }}
                      >
                        {cls.tutor_name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="700" color="text.primary" noWrap>
                          {cls.tutor_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          Giáo viên phụ trách
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>

                  <Stack spacing={1.2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <GroupIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {cls.student_count} Học viên
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="flex-start" gap={1}>
                      <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.2 }} />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {cls.next_session}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StyledClassCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
}

export default memo(StudentMyClassPage);