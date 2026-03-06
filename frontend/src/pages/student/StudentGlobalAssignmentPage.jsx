import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Card, CardContent, CardActions, Button, Grid, Chip, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllAssignmentsForStudent } from '../../services/ExamService';

// Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ClassIcon from '@mui/icons-material/Class';

const filterAssignments = (sessionsData) => {
  const now = new Date();
  const todo = [];
  const overdue = [];
  const completed = [];

  sessionsData.forEach((session) => {
    const history = session.examTakens && session.examTakens.length > 0 ? session.examTakens[0] : null;

    if (history && history.isDone) {
      // Đã nộp bài
      session.exam_taken = history;
      completed.push(session);
    } else if (history && !history.isDone) {
      // Đang làm dở
      session.pending_et_id = history.et_id;
      todo.push(session);
    } else {
      // Chưa đụng tới
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

const GlobalAssignmentCard = ({ session, status, onStart, onContinue, onView }) => {
  const { exam, exam_taken, expireAt, pending_et_id, exam_open_in } = session;
  
  // Lấy thông tin lớp học từ dữ liệu trả về
  const classNames = exam_open_in && exam_open_in.length > 0 
    ? exam_open_in.map(item => item.class.classname).join(', ') 
    : 'Lớp học không xác định';

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
              <ClassIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 500 }}>
                Lớp: {classNames}
              </Typography>
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

export default function StudentGlobalAssignmentPage() {
  const [tabValue, setTabValue] = useState(0);
  const [assignments, setAssignments] = useState({ todo: [], overdue: [], completed: [] });
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const allData = await getAllAssignmentsForStudent(token);
        const { todo, overdue, completed } = filterAssignments(allData);
        setAssignments({ todo, overdue, completed });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bài tập tổng hợp:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStartAssignment = (session) => {
    // Trích xuất classId từ session để truyền đi
    const classId = session.exam_open_in[0]?.class_id;
    if (classId) {
      navigate(`/student/assignment/class/${classId}/exam/${session.exam.exam_id}/session/${session.session_id}`);
    } else {
      console.error("Không tìm thấy classId cho bài tập này!");
    }
  };

  const handleContinueAssignment = (et_id) => {
    navigate(`/student/assignment/continue/${et_id}`);
  };

  const handleViewResult = (session) => {
    navigate(`/student/assignment/session/${session.session_id}/result`);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
        Tổng hợp Bài tập
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Tất cả bài tập từ các lớp bạn đang tham gia đều được tổng hợp tại đây.
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
              <GlobalAssignmentCard 
                key={`${session.exam.exam_id}_${session.session_id}`} 
                session={session} 
                status="todo" 
                onStart={handleStartAssignment} 
                onContinue={handleContinueAssignment}
              />
            ))
          ) : <Typography sx={{ p: 2, textAlign: 'center' }}>Tuyệt vời! Bạn không có bài tập nào đang tồn đọng.</Typography>}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {assignments.overdue.length > 0 ? (
            assignments.overdue.map((session) => (
              <GlobalAssignmentCard key={`${session.exam.exam_id}_${session.session_id}`} session={session} status="overdue" />
            ))
          ) : <Typography sx={{ p: 2, textAlign: 'center' }}>Không có bài tập nào quá hạn.</Typography>}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {assignments.completed.length > 0 ? (
            assignments.completed.map((session) => (
              <GlobalAssignmentCard key={`${session.exam.exam_id}_${session.session_id}`} session={session} status="completed" onView={handleViewResult} />
            ))
          ) : <Typography sx={{ p: 2, textAlign: 'center' }}>Bạn chưa hoàn thành bài tập nào.</Typography>}
        </TabPanel>
      </Paper>
    </Container>
  );
}