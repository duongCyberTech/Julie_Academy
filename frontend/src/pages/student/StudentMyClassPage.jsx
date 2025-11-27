import React, { useState } from "react";
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
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

// Icons
import GroupIcon from '@mui/icons-material/Group';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Import hình ảnh (Đảm bảo đường dẫn đúng)
// (Giả sử bạn có các ảnh này trong assets)
import AvatarTutor from "../../assets/images/Avatar.jpg"; // Dùng ảnh avatar mẫu
import ClassBg1 from "../../assets/images/homepage1.webp"; // Ảnh bìa mẫu 1
import ClassBg2 from "../../assets/images/homepage2.webp"; // Ảnh bìa mẫu 2
import ClassBg3 from "../../assets/images/homepage3.webp"; // Ảnh bìa mẫu 3

// --- DỮ LIỆU MẪU (API-READY VỚI CSDL migration.sql) ---

const mockClassList = [
  { 
    id: 'cls_001', // Class.class_id
    name: 'Toán 9A1 - Sách Cánh Diều', // Class.classname
    description: 'Lớp học bám sát chương trình, tập trung vào kiến thức nền tảng và giải bài tập SGK.', // Class.description
    tutor_name: 'ThS. Lê Thị Bảo Thu', // Join User.uid
    tutor_avatar: AvatarTutor, // User.avata_url
    student_count: 4, // COUNT(*) FROM Learning WHERE class_id = 'cls_001'
    next_session: 'Thứ 4, 19:00', // Join Schedule
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
// ------------------------------

// --- STYLED COMPONENTS ---
const StyledClassCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
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
// ------------------------------

// --- COMPONENT CHÍNH ---
export default function StudentMyClassPage() {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // Handlers cho Thông báo
  const handleCloseToast = (event, reason) => {
      if (reason === 'clickaway') {
          return;
      }
      setToast(prev => ({ ...prev, open: false }));
  };
  

  const handleEnterClass = (classId) => {
    navigate(`/student/classes/${classId}`); // <-- SỬA DÒNG NÀY
};

  // Hiệu ứng (Giống các trang trước)
  const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i) => ({
          opacity: 1,
          y: 0,
          transition: {
              delay: i * 0.1,
              duration: 0.5
          }
      })
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
      
      {/* === TIÊU ĐỀ TRANG === */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Lớp học của tôi (UC_HS06)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tất cả các lớp học bạn đã đăng ký tham gia.
        </Typography>
      </Box>

      {/* === DANH SÁCH LỚP HỌC === */}
      <Grid container spacing={3}>
        {mockClassList.map((cls, index) => (
          <Grid item xs={12} md={6} lg={4} key={cls.id}>
            <motion.div 
              custom={index} 
              variants={cardVariants} 
              initial="hidden" 
              animate="visible" 
              style={{ height: '100%' }}
            >
              <StyledClassCard>
                <CardMedia
                  component="img"
                  height="160"
                  image={cls.thumbnail_url}
                  alt={`Ảnh bìa lớp ${cls.name}`}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Tên lớp */}
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {cls.name}
                  </Typography>
                  
                  {/* Tên gia sư */}
                  <Tooltip title={`Gia sư: ${cls.tutor_name}`}>
                    <TutorInfo>
                        <Avatar 
                            src={cls.tutor_avatar} 
                            sx={{ width: 32, height: 32, mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            {cls.tutor_name}
                        </Typography>
                    </TutorInfo>
                  </Tooltip>

                  {/* Mô tả */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {cls.description}
                  </Typography>
                  
                  {/* Thông tin thêm */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                    />
                  </Box>

                </CardContent>
                <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleEnterClass(cls.id)}
                  >
                    Vào lớp
                  </Button>
                </CardActions>
              </StyledClassCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      
      {/* === SNACKBAR (THÔNG BÁO) === */}
      <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
          <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant="filled">
              {toast.message}
          </Alert>
      </Snackbar>

    </Container>
  );
}