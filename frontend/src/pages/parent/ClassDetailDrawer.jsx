import React from 'react';
import { jwtDecode } from "jwt-decode";
import {
<<<<<<< HEAD
  Drawer, Box, Typography, IconButton, Avatar, Chip, Button, Divider, Stack, Paper
} from '@mui/material';
import { alpha } from "@mui/material/styles";
import {
  Close, CalendarToday, AccessTime, School, Star,
  MenuBook, ClassOutlined, Phone, InfoOutlined
} from '@mui/icons-material';
import dayjs from 'dayjs';

=======
  Drawer, Box, Typography, IconButton, Avatar, Chip, Button, Divider, Stack, Grid
} from '@mui/material';
import {
  Close, CalendarToday, AccessTime, School, Person, Star, VerifiedUser,
  MenuBook, ClassOutlined, Phone
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Helper: Chuyển đổi số thứ trong tuần (2-8) sang chữ
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
const getDayName = (num) => {
  const days = { 2: "Thứ 2", 3: "Thứ 3", 4: "Thứ 4", 5: "Thứ 5", 6: "Thứ 6", 7: "Thứ 7", 8: "Chủ Nhật" };
  return days[num] || "Chưa xếp lịch";
};

const ClassDetailDrawer = ({ open, onClose, classData, onEnrollClick }) => {
  if (!classData) return null;

<<<<<<< HEAD
  const { classname, description, subject, grade, status, nb_of_student, startat, tutor, schedule, learning } = classData;
  const tutorUser = tutor?.user || {};

  let enrollmentStatus = null; 
=======
  // --- SỬA LỖI TẠI ĐÂY: Đã thêm 'learning' vào danh sách biến ---
  const { classname, description, subject, grade, status, nb_of_student, startat, tutor, schedule, learning } = classData;
  const tutorUser = tutor?.user || {};

  // --- LOGIC CHECK TRẠNG THÁI ---
  let enrollmentStatus = null; // null | 'pending' | 'accepted' | 'cancelled'
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
  let isParent = false;

  const token = localStorage.getItem('token');
  if (token) {
      try {
          const decoded = jwtDecode(token);
          const currentUid = decoded.sub || decoded.uid;
          const role = decoded.role;
          
          if (role === 'parents') {
              isParent = true;
          } else if (role === 'student') {
<<<<<<< HEAD
=======
              // Bây giờ biến 'learning' đã có dữ liệu, hàm find sẽ chạy đúng
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
              const myRecord = learning?.find(l => l.student.user.uid === currentUid);
              if (myRecord) {
                  enrollmentStatus = myRecord.status;
              }
          }
      } catch (e) {}
  }

<<<<<<< HEAD
  const renderActionButton = () => {
      if (status === 'completed' || status === 'cancelled') {
          return <Button variant="contained" disabled fullWidth sx={{ py: 1.5, borderRadius: 2 }}>Lớp đã đóng</Button>;
      }
      if (enrollmentStatus === 'pending') {
          return (
              <Button variant="outlined" disabled fullWidth sx={{ py: 1.5, borderColor: '#f59e0b', color: '#f59e0b !important', borderRadius: 2, fontWeight: 'bold' }}>
=======
  // Helper render nút bấm
  const renderActionButton = () => {
      // Case 1: Lớp đã kết thúc hoặc hủy
      if (status === 'completed' || status === 'cancelled') {
          return <Button variant="contained" disabled fullWidth sx={{ py: 1.5 }}>Lớp đã đóng</Button>;
      }

      // Case 2: Đang chờ duyệt
      if (enrollmentStatus === 'pending') {
          return (
              <Button variant="outlined" disabled fullWidth sx={{ py: 1.5, borderColor: '#f59e0b', color: '#f59e0b !important' }}>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                  Đang chờ duyệt...
              </Button>
          );
      }
<<<<<<< HEAD
      if (enrollmentStatus === 'accepted') {
          return (
              <Button variant="contained" color="success" disabled fullWidth sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
=======

      // Case 3: Đã tham gia
      if (enrollmentStatus === 'accepted') {
          return (
              <Button variant="contained" color="success" disabled fullWidth sx={{ py: 1.5 }}>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                  Đã tham gia lớp này
              </Button>
          );
      }
<<<<<<< HEAD
      return (
          <Button 
            variant="contained" fullWidth size="large" onClick={() => onEnrollClick(classData)}
            sx={{ 
              bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' },
              py: 1.5, fontSize: '1rem', fontWeight: 'bold', borderRadius: 2,
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
=======

      // Case 4: Chưa đăng ký (hoặc là Phụ huynh)
      return (
          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={() => onEnrollClick(classData)}
            sx={{ 
              bgcolor: '#f97316', 
              '&:hover': { bgcolor: '#ea580c' },
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: 2
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
            }}
          >
            {isParent ? "Đăng ký cho con" : "Đăng ký học ngay"}
          </Button>
      );
  };

  return (
    <Drawer
<<<<<<< HEAD
      anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", md: 450 }, p: 0, bgcolor: "background.default" } }}
    >
      {/* HEADER TÍCH HỢP TRONG DRAWER */}
      <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: 'divider', bgcolor: "background.paper", position: 'sticky', top: 0, zIndex: 1 }}>
=======
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", md: 500 }, p: 0 } }}
    >
      {/* --- HEADER --- */}
      <Box sx={{ p: 3, borderBottom: "1px solid #eee", bgcolor: "#f8fafc", pb: 0 }}>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Chip
              label={status === "pending" ? "Đang tuyển sinh" : "Đang diễn ra"}
              color={status === "pending" ? "success" : "primary"}
<<<<<<< HEAD
              size="small" variant="filled" sx={{ mb: 1.5, fontWeight: 600, borderRadius: '8px' }}
            />
            <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ lineHeight: 1.3 }}>
              {classname}
            </Typography>
            <Stack direction="row" spacing={1} mt={1.5}>
              <Chip icon={<MenuBook fontSize="small" />} label={subject} size="small" variant="outlined" sx={{ borderRadius: '8px', bgcolor: 'background.default' }} />
              <Chip icon={<ClassOutlined fontSize="small" />} label={`Khối ${grade}`} size="small" variant="outlined" sx={{ borderRadius: '8px', bgcolor: 'background.default' }} />
            </Stack>
          </Box>
          <IconButton onClick={onClose} sx={{ bgcolor: 'action.hover' }}><Close /></IconButton>
        </Stack>
      </Box>

      {/* BODY DRAWER */}
      <Box sx={{ p: 3, overflowY: "auto", height: "calc(100vh - 170px)", display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* LỊCH HỌC */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: '#fed7aa', bgcolor: '#fff7ed' }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: "#ea580c" }}>
            <CalendarToday fontSize="small" /> Lịch học chi tiết
          </Typography>
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, color: 'text.secondary' }}>
            <strong>Khai giảng:</strong> <Chip size="small" label={dayjs(startat).format("DD/MM/YYYY")} sx={{ bgcolor: 'white', fontWeight: 600 }} />
          </Typography>
          <Divider sx={{ my: 1.5, borderColor: alpha('#ea580c', 0.2) }} />
          
          {schedule && schedule.length > 0 ? (
            <Stack spacing={1.5}>
              {schedule.map((slot) => (
                <Box key={slot.schedule_id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#fff", p: 1.5, borderRadius: 2, border: '1px solid', borderColor: '#ffedd5' }}>
                  <Typography fontWeight="600" color="#c2410c">{getDayName(slot.meeting_date)}</Typography>
                  <Chip icon={<AccessTime fontSize="small" />} label={`${slot.startAt} - ${slot.endAt}`} size="small" sx={{ bgcolor: "#ffedd5", color: "#c2410c", fontWeight: 600, borderRadius: '6px' }} />
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" fontStyle="italic" color="text.secondary">Chưa cập nhật lịch học cụ thể.</Typography>
          )}
        </Paper>

        {/* THÔNG TIN GIA SƯ */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: "#059669", mb: 2 }}>
            <School fontSize="small" /> Thông tin Gia sư
          </Typography>
          
          <Box sx={{ display: "flex", gap: 2.5, alignItems: "center", mb: 2 }}>
            <Avatar src={tutorUser.avata_url} sx={{ width: 64, height: 64, border: "2px solid #ecfdf5", boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              {tutorUser.lname?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                {[tutorUser.lname, tutorUser.mname, tutorUser.fname].filter(Boolean).join(" ")}
              </Typography>
              {tutor?.phone_number && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, mt: 0.5 }}>
                  <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="body2" fontWeight="500" color="text.secondary">{tutor.phone_number}</Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                <Star sx={{ fontSize: 16, color: "#eab308" }} />
                <Typography variant="caption" fontWeight="600" color="text.secondary">Gia sư uy tín</Typography>
              </Stack>
            </Box>
          </Box>

          {/* HIỂN THỊ KINH NGHIỆM VÀ GIỚI THIỆU LẤY TỪ tutor.experiences */}
          {tutor?.experiences && (
            <Box sx={{ bgcolor: alpha('#10b981', 0.05), p: 2, borderRadius: 2, border: '1px solid', borderColor: alpha('#10b981', 0.1) }}>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line", color: "#065f46", lineHeight: 1.6 }}>
                <Typography component="span" fontWeight="bold" display="block" mb={0.5}>Giới thiệu & Kinh nghiệm:</Typography>
=======
              size="small"
              sx={{ mb: 1, fontWeight: 600 }}
            />
            <Typography variant="h5" fontWeight="bold" color="#1e293b">
              {classname}
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip icon={<MenuBook fontSize="small" />} label={subject} size="small" variant="outlined" />
              <Chip icon={<ClassOutlined fontSize="small" />} label={`Khối ${grade}`} size="small" variant="outlined" />
            </Stack>
          </Box>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Stack>
      </Box>

      <Box sx={{ p: 3, overflowY: "auto", height: "calc(100vh - 80px)", pb: 15 }}>
        
        {/* --- 1. LỊCH HỌC --- */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: "#f97316" }}>
            <CalendarToday fontSize="small" /> Lịch học chi tiết
          </Typography>
          <Box sx={{ bgcolor: "#fff7ed", p: 2, borderRadius: 2, border: "1px border #ffedd5" }}>
            <Typography variant="body2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <strong>Khai giảng:</strong> {dayjs(startat).format("DD/MM/YYYY")}
            </Typography>
            <Divider sx={{ my: 1, borderColor: "#fed7aa" }} />
            {schedule && schedule.length > 0 ? (
              <Grid container spacing={1}>
                {schedule.map((slot) => (
                  <Grid item xs={12} key={slot.schedule_id}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#fff", p: 1.5, borderRadius: 1, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                      <Typography fontWeight="600" color="#c2410c">{getDayName(slot.meeting_date)}</Typography>
                      <Chip icon={<AccessTime fontSize="small" />} label={`${slot.startAt} - ${slot.endAt}`} size="small" sx={{ bgcolor: "#ffedd5", color: "#c2410c", fontWeight: 600 }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" fontStyle="italic" color="text.secondary">Chưa cập nhật lịch học cụ thể.</Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* --- 2. THÔNG TIN GIA SƯ --- */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: "#059669" }}>
            <School fontSize="small" /> Thông tin Gia sư
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
            <Avatar src={tutorUser.avata_url} sx={{ width: 64, height: 64, border: "3px solid #ecfdf5" }}>
              {tutorUser.lname?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {tutorUser.lname} {tutorUser.mname} {tutorUser.fname}
              </Typography>
              {tutor?.phone_number && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Phone sx={{ fontSize: 16, color: "#f97316" }} />
                  <Typography variant="body2" fontWeight="600" color="#c2410c">{tutor.phone_number}</Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={1} alignItems="center">
                <Star sx={{ fontSize: 16, color: "#eab308" }} />
                <Typography variant="caption" color="text.secondary">Gia sư uy tín</Typography>
              </Stack>
            </Box>
          </Box>
          {tutor?.experiences && (
            <Box sx={{ bgcolor: "#f0fdf4", p: 2, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ whiteSpace: "pre-line", color: "#166534", lineHeight: 1.6 }}>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                {tutor.experiences}
              </Typography>
            </Box>
          )}
<<<<<<< HEAD
        </Paper>

        {/* MÔ TẢ LỚP HỌC */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}>
             <InfoOutlined fontSize="small" /> Mô tả lớp học
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
            {description || "Giáo viên chưa cập nhật mô tả chi tiết cho lớp học này."}
          </Typography>
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2, display: 'inline-flex' }}>
             <Typography variant="body2" fontWeight={500}>
                Sĩ số hiện tại: <Typography component="span" fontWeight="bold" color="primary">{nb_of_student}</Typography> học viên
             </Typography>
          </Box>
        </Paper>
      </Box>

      {/* FOOTER ACTION */}
      <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', position: 'absolute', bottom: 0, width: '100%', zIndex: 10 }}>
=======
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* --- 3. MÔ TẢ --- */}
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Mô tả lớp học</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {description || "Giáo viên chưa cập nhật mô tả chi tiết cho lớp học này."}
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
             <Typography variant="body2">
                <strong>Sĩ số hiện tại:</strong> {nb_of_student} học viên
             </Typography>
          </Box>
        </Box>
      </Box>

      {/* --- FOOTER: NÚT BẤM --- */}
      <Box sx={{ p: 2, borderTop: '1px solid #eee', position: 'absolute', bottom: 0, width: '100%', bgcolor: '#fff', zIndex: 10 }}>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        {renderActionButton()}
      </Box>
    </Drawer>
  );
};

export default ClassDetailDrawer;