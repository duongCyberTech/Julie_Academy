import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Card, CardContent, CardActions, Button, Grid, Chip, Paper, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getSessionsByClass, getPendingExamTakens, getCompletedExamTakens } from '../../services/ExamService';

// Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

// Thuật toán phân loại dữ liệu từ 3 API
const filterAssignments = (sessionsData, pendingData, completedData) => {
  const now = new Date();
  const todo = [];
  const overdue = [];
  const completed = [];

  // Tạo map tra cứu nhanh (Dictionary) cho bài làm dở
  const pendingMap = {};
  pendingData.forEach(p => {
    pendingMap[`${p.exam_id}_${p.session_id}`] = p.et_id;
  });

  // Tạo map tra cứu nhanh cho bài đã hoàn thành
  const completedMap = {};
  completedData.forEach(c => {
    completedMap[`${c.exam_id}_${c.session_id}`] = c;
  });

  // Duyệt qua danh sách bài tập được giao
  sessionsData.forEach((session) => {
    const key = `${session.exam.exam_id}_${session.session_id}`;
    
    // 1. Kiểm tra xem đã nộp bài chưa
    if (completedMap[key]) {
      session.exam_taken = completedMap[key]; // Gắn thông tin điểm, ngày nộp vào session
      completed.push(session);
    } 
    // 2. Kiểm tra xem có đang làm dở không
    else if (pendingMap[key]) {
      session.pending_et_id = pendingMap[key]; // Gắn ID bài dở để đi tiếp
      todo.push(session);
    } 
    // 3. Chưa làm thì xét thời gian
    else {
      const dueDate = new Date(session.expireAt);
      if (dueDate < now) {
        overdue.push(session);
      } else {
        todo.push(session);
      }
    }
  });

  return { todo, overdue, completed };
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AssignmentCard = ({ session, status, onStart, onContinue, onView }) => {
  const { exam, exam_taken, expireAt, pending_et_id } = session;

  const cardBorderColor = status === 'todo' ? (pending_et_id ? 'warning.main' : 'primary.main') : status === 'overdue' ? 'error.main' : 'divider';

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: cardBorderColor, opacity: status === 'overdue' ? 0.7 : 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 600 }}>
              {exam.title}
              {pending_et_id && <Chip label="Đang làm dở" size="small" color="warning" sx={{ ml: 2 }} />}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
              <MenuBookIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body1">Môn: <strong>{exam.category?.subject || 'Toán'}</strong></Typography>
        
            </Box>
          </Box>
          {status === 'completed' && exam_taken && (
            <Chip
              label={`Điểm: ${exam_taken.final_score} / ${exam.total_ques}`}
              color={exam_taken.final_score / exam.total_ques >= 0.5 ? "success" : "error"}
              sx={{ fontWeight: 600, fontSize: '1rem', ml: 2 }}
            />
          )}
        </Box>

        <Grid container spacing={1} sx={{ mt: 2, color: 'text.secondary' }}>
          <Grid item xs={12} md={4}>
            {status === 'completed' ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventAvailableIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2">Đã nộp: {formatShortDate(exam_taken?.doneAt)}</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventBusyIcon fontSize="small" sx={{ mr: 1, color: status === 'overdue' ? 'error.main' : 'warning.main' }} />
                <Typography variant="body2" sx={{ color: status === 'overdue' ? 'error.main' : 'inherit' }}>
                  Hạn nộp: {formatShortDate(expireAt)}
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Thời gian: {exam.duration} phút</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <QuestionMarkIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Số câu: {exam.total_ques} câu</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 2, backgroundColor: 'grey.50' }}>
        {status === 'todo' && !pending_et_id && (
          <Button variant="contained" color="primary" onClick={() => onStart(session)}>
            Làm bài mới
          </Button>
        )}
        {status === 'todo' && pending_et_id && (
          <Button variant="contained" color="warning" onClick={() => onContinue(pending_et_id)}>
            Tiếp tục làm
          </Button>
        )}
        {status === 'overdue' && (
          <Button variant="contained" color="error" disabled>Đã quá hạn</Button>
        )}
        {status === 'completed' && (
          <Button variant="outlined" color="secondary" onClick={() => onView(session)}>
            Xem kết quả
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default function StudentAssignmentPage() {
  const [tabValue, setTabValue] = useState(0);
  const [assignments, setAssignments] = useState({ todo: [], overdue: [], completed: [] });
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { classId } = useParams(); 
  const token = localStorage.getItem('token'); 

 useEffect(() => {
    // 1. Kiểm tra ngay từ đầu, nếu thiếu thì tắt loading và báo lỗi luôn
    if (!classId || !token) {
      console.error("Lỗi: Thiếu classId trên URL hoặc chưa có token đăng nhập!");
      setLoading(false); 
      return; // Dừng lại, không chạy fetchData nữa
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionsData, pendingData, completedData] = await Promise.all([
          getSessionsByClass(classId, token),
          getPendingExamTakens(classId, token),
          getCompletedExamTakens(classId, token)
        ]);
        
        const { todo, overdue, completed } = filterAssignments(sessionsData, pendingData, completedData);
        setAssignments({ todo, overdue, completed });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bài tập:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, token]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStartAssignment = (session) => {
    navigate(`/student/assignment/class/${classId}/exam/${session.exam.exam_id}/session/${session.session_id}`);
  };

  const handleContinueAssignment = (et_id) => {
    navigate(`/student/assignment/continue/${et_id}`);
  };

  const handleViewResult = (session) => {
    // Sẽ chuyển hướng sang trang xem điểm chi tiết sau
    navigate(`/student/assignment/session/${session.session_id}/result`);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Bài tập được giao
      </Typography>

      <Paper elevation={0} variant="outlined" sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab icon={<AssignmentIcon />} iconPosition="start" label={`Cần làm (${assignments.todo.length})`} />
            <Tab icon={<AssignmentLateIcon />} iconPosition="start" label={`Quá hạn (${assignments.overdue.length})`} />
            <Tab icon={<AssignmentTurnedInIcon />} iconPosition="start" label={`Đã hoàn thành (${assignments.completed.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {assignments.todo.length > 0 ? (
            assignments.todo.map((session) => (
              <AssignmentCard 
                key={`${session.exam.exam_id}_${session.session_id}`} 
                session={session} 
                status="todo" 
                onStart={handleStartAssignment} 
                onContinue={handleContinueAssignment}
              />
            ))
          ) : <Typography sx={{ p: 2, textAlign: 'center' }}>Bạn không có bài tập nào cần làm.</Typography>}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {assignments.overdue.length > 0 ? (
            assignments.overdue.map((session) => (
              <AssignmentCard key={`${session.exam.exam_id}_${session.session_id}`} session={session} status="overdue" />
            ))
          ) : <Typography sx={{ p: 2, textAlign: 'center' }}>Không có bài tập nào quá hạn.</Typography>}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {assignments.completed.length > 0 ? (
            assignments.completed.map((session) => (
              <AssignmentCard key={`${session.exam.exam_id}_${session.session_id}`} session={session} status="completed" onView={handleViewResult} />
            ))
          ) : <Typography sx={{ p: 2, textAlign: 'center' }}>Bạn chưa hoàn thành bài tập nào.</Typography>}
        </TabPanel>
      </Paper>
    </Container>
  );
}