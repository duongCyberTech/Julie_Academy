import React, { useState, useEffect } from "react";
import axios from "axios";
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
  CircularProgress
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Handlers
  const handleCloseToast = (event, reason) => {
      if (reason === 'clickaway') return;
      setToast(prev => ({ ...prev, open: false }));
  };
  
  const handleEnterClass = (classId) => {
    navigate(`/student/classes/${classId}`);
  };

  const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
  };

  if (loading) return <Box height="80vh" display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>;

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Lớp học của tôi (UC_HS06)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tất cả các lớp học bạn đã đăng ký tham gia.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {classList.map((cls, index) => (
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
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "64px",
                    }}
                  >
                    {cls.name}
                  </Typography>

                  <Tooltip title={`Gia sư: ${cls.tutor_name}`}>
                    <TutorInfo>
                      <Avatar
                        src={cls.tutor_avatar}
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
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}