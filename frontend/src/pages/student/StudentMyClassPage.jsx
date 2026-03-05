import React, { useState, useEffect } from "react";
<<<<<<< HEAD
=======
import axios from "axios";
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Snackbar,
  Alert,
  Avatar,
  Tooltip,
<<<<<<< HEAD
  CircularProgress,
  Tabs,
  Tab,
  Stack
=======
  CircularProgress
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { jwtDecode } from "jwt-decode";
import GroupIcon from '@mui/icons-material/Group';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import { getAllClasses } from '../../services/ClassService';

=======

// Icons
import GroupIcon from '@mui/icons-material/Group';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Import hình ảnh
import AvatarTutor from "../../assets/images/Avatar.jpg"; 
import ClassBg1 from "../../assets/images/homepage1.webp"; 
import ClassBg2 from "../../assets/images/homepage2.webp"; 
import ClassBg3 from "../../assets/images/homepage3.webp";

// --- DỮ LIỆU MẪU (MOCK DATA) ---
const mockClassList = [
  { 
    id: 'cls_001', 
    name: 'Toán 9A1 - Sách Cánh Diều', 
    description: 'Lớp học bám sát chương trình, tập trung vào kiến thức nền tảng và giải bài tập SGK.', 
    tutor_name: 'ThS. Lê Thị Bảo Thu', 
    tutor_avatar: AvatarTutor, 
    student_count: 4, 
    next_session: 'Thứ 4, 19:00', 
    thumbnail_url: ClassBg1
  },
  { 
    id: 'cls_002', 
    name: 'Toán 9A2 (Nâng cao)', 
    description: 'Lớp chuyên sâu ôn tập, luyện giải các dạng đề thi và các bài toán vận dụng cao.',
    tutor_name: 'ThS. Lê Thị Bảo Thu',
    tutor_avatar: AvatarTutor,
    student_count: 8,
    next_session: 'Thứ 6, 20:00',
    thumbnail_url: ClassBg2
  },
  { 
    id: 'cls_003', 
    name: 'Toán 9 - Luyện đề Tổng hợp', 
    description: 'Tổng ôn toàn bộ kiến thức và luyện đề thi thử hàng tuần, chuẩn bị cho kỳ thi tuyển sinh.',
    tutor_name: 'ThS. Lê Thị Bảo Thu',
    tutor_avatar: AvatarTutor,
    student_count: 25,
    next_session: 'Chủ Nhật, 09:00',
    thumbnail_url: ClassBg3
  },
];

// --- STYLED COMPONENTS ---
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
const StyledClassCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  transition: 'all 0.3s ease',
   '&:hover': {
     transform: 'translateY(-4px)',
     boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)',
     borderColor: theme.palette.primary.main,
  }
}));

const TutorInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

<<<<<<< HEAD
const formatSchedule = (scheduleData) => {
    if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) return "Chưa xếp lịch";
    
    const daysStr = scheduleData.map(s => {
        const dayVal = s.meeting_date ?? s.day ?? s.day_of_week;
        const dayMap = { '2': 'T2', '3': 'T3', '4': 'T4', '5': 'T5', '6': 'T6', '7': 'T7', '8': 'CN', '1': 'CN', '0': 'CN' };
        return dayMap[String(dayVal)] || '?'; 
    }).join(', ');

    const first = scheduleData[0];
    const timeVal = first.startAt ?? first.startTime ?? '';
    const timeStr = timeVal.length > 5 ? timeVal.substring(0, 5) : timeVal;

    return `${daysStr} ${timeStr ? `(${timeStr})` : ''}`;
};

export default function StudentMyClassPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [activeClasses, setActiveClasses] = useState([]);
  const [pendingClasses, setPendingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(localStorage.getItem('tab') || 0);

  useEffect(() => {
    const fetchMyClasses = async () => {
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
          console.error(e);
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
              description: cls.description || "Chưa có mô tả.",
              tutor_name: cls.tutor?.user ? `${cls.tutor.user.lname} ${cls.tutor.user.fname}` : "Giáo viên",
              tutor_avatar: cls.tutor?.user?.avata_url,
              student_count: cls.nb_of_student || 0,
              next_session: formatSchedule(cls.schedule),
              thumbnail_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${cls.class_id}`,
              status: myEnrollment.status,
              grade: cls.grade,
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
=======
// --- HELPER FUNCTION: Format Lịch học ---
const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return "Chưa xếp lịch";
    const days = schedule.map(s => {
        const dayMap = {2:'T2', 3:'T3', 4:'T4', 5:'T5', 6:'T6', 7:'T7', 8:'CN'};
        return dayMap[s.meeting_date];
    }).join(', ');
    return `${days}, ${schedule[0].startAt}`;
};

// --- COMPONENT CHÍNH ---
export default function StudentMyClassPage() {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [classList, setClassList] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const API_URL = "http://localhost:4000";

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (token) {
          const response = await axios.get(`${API_URL}/classes/my-classes`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const apiData = Array.isArray(response.data) ? response.data : (response.data.data || []);
          
          const mappedApiData = apiData.map(item => ({
            id: item.class_id,
            name: item.classname,
            description: item.description || "Lớp học chưa có mô tả.",
            tutor_name: item.tutor?.user ? `${item.tutor.user.lname} ${item.tutor.user.fname}` : "Giáo viên",
            tutor_avatar: item.tutor?.user?.avata_url || AvatarTutor,
            student_count: 0, 
            next_session: formatSchedule(item.schedule), 
            student_count: item.nb_of_student || 0,
            thumbnail_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${item.class_id}`,
            isReal: true 
          }));

          setClassList([...mappedApiData, ...mockClassList]);
        } else {
          setClassList(mockClassList);
        }
      } catch (error) {
        console.error("Lỗi tải lớp:", error);
        setClassList(mockClassList);
        setToast({ open: true, message: "Không tải được dữ liệu mới, hiển thị dữ liệu mẫu.", severity: "warning" });
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
      } finally {
        setLoading(false);
      }
    };

<<<<<<< HEAD
    fetchMyClasses();
  }, []);

  const handleCloseToast = () => setToast(prev => ({ ...prev, open: false }));
=======
    fetchData();
  }, [token]);

  // Handlers
  const handleCloseToast = (event, reason) => {
      if (reason === 'clickaway') return;
      setToast(prev => ({ ...prev, open: false }));
  };
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
  
  const handleEnterClass = (classId) => {
    navigate(`/student/classes/${classId}`);
  };

<<<<<<< HEAD
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
  };

  const displayList = tabValue === 0 ? activeClasses : pendingClasses;

=======
  const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
  };

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
  if (loading) return <Box height="80vh" display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>;

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
<<<<<<< HEAD
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
          Lớp học của tôi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý tiến độ học tập và lịch học của bạn.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleChangeTab} aria-label="class tabs">
          <Tab 
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircleIcon fontSize="small" />
                <span>Đang học ({activeClasses.length})</span>
              </Stack>
            } 
          />
          <Tab 
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <HourglassEmptyIcon fontSize="small" />
                <span>Chờ duyệt ({pendingClasses.length})</span>
              </Stack>
            } 
          />
        </Tabs>
      </Box>

      {displayList.length === 0 && (
        <Box textAlign="center" py={8} bgcolor="#f8fafc" borderRadius={4} border="1px dashed #cbd5e1">
          <SchoolIcon sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {tabValue === 0 ? "Bạn chưa tham gia lớp học nào." : "Không có yêu cầu nào đang chờ duyệt."}
          </Typography>
          {tabValue === 0 && (
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/student/enroll')}>
              Tìm lớp học ngay
            </Button>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        {displayList.map((cls, index) => (
=======
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Lớp học của tôi 
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tất cả các lớp học bạn đã đăng ký tham gia.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {classList.map((cls, index) => (
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
          <Grid item xs={12} md={6} lg={4} key={cls.id}>
            <motion.div
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              style={{ height: "100%", width: "100%" }}
            >
              <StyledClassCard>
                <CardMedia
                  component="img"
<<<<<<< HEAD
                  height="140"
                  image={cls.thumbnail_url}
                  alt={cls.name}
                  sx={{ bgcolor: "#e0f2fe" }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start" mb={1}>
                    <Chip 
                      label={cls.subject} 
                      size="small" 
                      sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }} 
                    />
                    <Chip 
                      label={tabValue === 0 ? "Đang học" : "Chờ duyệt"} 
                      size="small" 
                      color={tabValue === 0 ? "success" : "warning"} 
                      variant="outlined"
                    />
                  </Stack>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      minHeight: "56px",
=======
                  height="160"
                  image={cls.thumbnail_url}
                  alt={`Ảnh bìa lớp ${cls.name}`}
                  sx={{ bgcolor: cls.isReal ? "#e0f2fe" : "transparent" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
<<<<<<< HEAD
=======
                      minHeight: "64px",
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                    }}
                  >
                    {cls.name}
                  </Typography>

                  <Tooltip title={`Gia sư: ${cls.tutor_name}`}>
                    <TutorInfo>
                      <Avatar
                        src={cls.tutor_avatar}
<<<<<<< HEAD
                        sx={{ width: 32, height: 32, mr: 1, border: "1px solid #e2e8f0" }}
                      >
                        {cls.tutor_name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600" color="#334155">
                          {cls.tutor_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Giáo viên
                        </Typography>
                      </Box>
                    </TutorInfo>
                  </Tooltip>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                    <Chip
                      icon={<GroupIcon sx={{fontSize: 16}}/>}
                      label={`${cls.student_count} HS`}
                      variant="outlined"
                      size="small"
                      sx={{border: 'none', bgcolor: '#f1f5f9'}}
                    />
                    <Chip
                      icon={<ScheduleIcon sx={{fontSize: 16}}/>}
                      label={cls.next_session}
                      variant="outlined"
                      size="small"
                      sx={{border: 'none', bgcolor: '#fff7ed', color: '#c2410c', '& .MuiChip-icon': {color: '#c2410c'}}}
                    />
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  {tabValue === 0 ? (
                    <Button
                      fullWidth
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => handleEnterClass(cls.id)}
                      sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: '#2563eb',
                      '&:hover': { bgcolor: '#1d4ed8' }
                      }}
                    >
                      Vào lớp học
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled
                      startIcon={<HourglassEmptyIcon />}
                      sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      }}
                    >
                      Đang chờ giáo viên duyệt
                    </Button>
                  )}
=======
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 1,
                          border: "1px solid #eee",
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight="500"
                      >
                        {cls.tutor_name}
                      </Typography>
                    </TutorInfo>
                  </Tooltip>

                  {/* === PHẦN SỬA ĐỔI CHÍNH TẠI ĐÂY === */}
                  <Tooltip title={cls.description}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        height: "40px", // Giữ chiều cao cố định để thẻ không bị lệch
                        overflow: "hidden",
                      }}
                    >
                      {/* Cắt chuỗi nếu dài hơn 60 ký tự */}
                      {cls.description.length > 45
                        ? cls.description.slice(0, 45) + "..."
                        : cls.description}
                    </Typography>
                  </Tooltip>
                  {/* ================================== */}

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      icon={<GroupIcon />}
                      label={`${cls.student_count} học sinh`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      icon={<ScheduleIcon />}
                      label={cls.next_session}
                      variant="outlined"
                      size="small"
                      color="primary"
                      sx={{ bgcolor: "#eff6ff", border: "none" }}
                    />
                  </Box>
                </CardContent>
                <CardActions
                  sx={{
                    p: 2,
                    justifyContent: "flex-end",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleEnterClass(cls.id)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Vào lớp
                  </Button>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                </CardActions>
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
<<<<<<< HEAD
        <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled">
=======
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}