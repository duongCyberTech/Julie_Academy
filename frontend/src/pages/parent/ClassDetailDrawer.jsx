import React from 'react';
import { jwtDecode } from "jwt-decode";
import {
  Drawer, Box, Typography, IconButton, Avatar, Chip, Button, Divider, Stack, Paper
} from '@mui/material';
import { alpha } from "@mui/material/styles";
import {
  Close, CalendarToday, AccessTime, School, Star,
  MenuBook, ClassOutlined, Phone, InfoOutlined
} from '@mui/icons-material';
import dayjs from 'dayjs';

const getDayName = (num) => {
  const days = { 2: "Thứ 2", 3: "Thứ 3", 4: "Thứ 4", 5: "Thứ 5", 6: "Thứ 6", 7: "Thứ 7", 8: "Chủ Nhật" };
  return days[num] || "Chưa xếp lịch";
};

const ClassDetailDrawer = ({ open, onClose, classData, onEnrollClick }) => {
  if (!classData) return null;

  const { classname, description, subject, grade, status, nb_of_student, startat, tutor, schedule, learning } = classData;
  const tutorUser = tutor?.user || {};

  let enrollmentStatus = null; 
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
              const myRecord = learning?.find(l => l.student.user.uid === currentUid);
              if (myRecord) {
                  enrollmentStatus = myRecord.status;
              }
          }
      } catch (e) {}
  }

  const renderActionButton = () => {
      if (status === 'completed' || status === 'cancelled') {
          return <Button variant="contained" disabled fullWidth sx={{ py: 1.5, borderRadius: 2 }}>Lớp đã đóng</Button>;
      }
      if (enrollmentStatus === 'pending') {
          return (
              <Button variant="outlined" disabled fullWidth sx={{ py: 1.5, borderColor: '#f59e0b', color: '#f59e0b !important', borderRadius: 2, fontWeight: 'bold' }}>
                  Đang chờ duyệt...
              </Button>
          );
      }
      if (enrollmentStatus === 'accepted') {
          return (
              <Button variant="contained" color="success" disabled fullWidth sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
                  Đã tham gia lớp này
              </Button>
          );
      }
      return (
          <Button 
            variant="contained" fullWidth size="large" onClick={() => onEnrollClick(classData)}
            sx={{ 
              bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' },
              py: 1.5, fontSize: '1rem', fontWeight: 'bold', borderRadius: 2,
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
            }}
          >
            {isParent ? "Đăng ký cho con" : "Đăng ký học ngay"}
          </Button>
      );
  };

  return (
    <Drawer
      anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", md: 450 }, p: 0, bgcolor: "background.default" } }}
    >
      {/* HEADER TÍCH HỢP TRONG DRAWER */}
      <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: 'divider', bgcolor: "background.paper", position: 'sticky', top: 0, zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Chip
              label={status === "pending" ? "Đang tuyển sinh" : "Đang diễn ra"}
              color={status === "pending" ? "success" : "primary"}
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
                {tutor.experiences}
              </Typography>
            </Box>
          )}
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
        {renderActionButton()}
      </Box>
    </Drawer>
  );
};

export default ClassDetailDrawer;