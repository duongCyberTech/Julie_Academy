import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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


//Mock Data danh sách
const mockApiData = [
  // --- 1. Bài tập "Cần làm" ---
  {
    sessionId: 'session_1',
    exam: {
      exam_id: 'exam_1',
      title: 'Kiểm tra 15 phút - Chương 1 (Bài 1)',
      duration: 15,
      total_question: 9,
      class: { classname: 'Lớp hè 9A1' },
      category: { subject: 'Toán' },
    },
    exam_taken: null,
    expire_at: '2025-11-30T23:59:00Z',
  },
  {
    sessionId: 'session_4',
    exam: {
      exam_id: 'exam_4',
      title: 'Bài tập Chương 2 (Bài 2)',
      duration: 45,
      total_question: 3,
      class: { classname: 'Lớp hè 9A1' },
      category: { subject: 'Toán' },
    },
    exam_taken: null,
    expire_at: '2025-12-01T23:59:00Z',
  },

  // --- 2. Bài tập "Quá hạn" ---
  {
    sessionId: 'session_2',
    exam: {
      exam_id: 'exam_2',
      title: 'Kiểm tra giữa kỳ (Đã quá hạn)',
      duration: 45,
      total_question: 25,
      class: { classname: 'Lớp hè 9A1' },
      category: { subject: 'Toán' },
    },
    exam_taken: null,
    expire_at: '2025-11-01T23:59:00Z',
  },
  {
    sessionId: 'session_5',
    exam: {
      exam_id: 'exam_5',
      title: 'Bài tập Chương 1 (Đã quá hạn)',
      duration: 20,
      total_question: 10,
      class: { classname: 'Lớp chuyên Toán' },
      category: { subject: 'Toán' },
    },
    exam_taken: null,
    expire_at: '2025-11-05T23:59:00Z',
  },

  // --- 3. Bài tập "Đã hoàn thành" ---
  {
    sessionId: 'session_3',
    exam: {
      exam_id: 'exam_3',
      title: 'Bài tập về nhà - Căn bậc hai',
      duration: 30,
      total_question: 15, // 15 câu
      class: { classname: 'Lớp chuyên Toán' },
      category: { subject: 'Toán' },
    },
    exam_taken: {
      et_id: 'taken_1',
      final_score: 8.5,
      done_time: '2025-11-05T10:30:00Z',
    },
    expire_at: '2025-11-06T23:59:00Z',
  },
  {
    sessionId: 'session_6',
    exam: {
      exam_id: 'exam_6',
      title: 'Kiểm tra 15 phút (Đã làm)',
      duration: 15,
      total_question: 10,
      class: { classname: 'Lớp hè 9A1' },
      category: { subject: 'Toán' },
    },
    exam_taken: {
      et_id: 'taken_2',
      final_score: 5.0,
      done_time: '2025-11-04T15:00:00Z',
    },
    expire_at: '2025-11-05T23:59:00Z',
  },
];

// Mock dữ liệu câu hỏi cho các bài tập đã hoàn thành
const MOCK_QUESTIONS_DATA = {
    // Dữ liệu giả cho bài tập session_3 
    'session_3': Array.from({ length: 15 }, (_, i) => ({
        questionId: `q${i + 1}`,
        content: `Câu hỏi số ${i + 1}: Tìm căn bậc hai của ${ (i + 1) * 2 }?`,
        type: 'SINGLE_CHOICE',
        explanation: 'Đây là lời giải chi tiết cho câu hỏi này.',
        answers: [
            { answerId: 'a', content: 'Đáp án A', is_correct: true },
            { answerId: 'b', content: 'Đáp án B', is_correct: false },
            { answerId: 'c', content: 'Đáp án C', is_correct: false },
            { answerId: 'd', content: 'Đáp án D', is_correct: false },
        ]
    })),
    // Dữ liệu giả cho bài tập session_6 (10 câu)
    'session_6': Array.from({ length: 10 }, (_, i) => ({
        questionId: `q6_${i + 1}`,
        content: `Câu hỏi kiểm tra số ${i + 1}?`,
        type: 'SINGLE_CHOICE',
        explanation: 'Giải thích...',
        answers: [
            { answerId: 'a', content: 'Đáp án Đúng', is_correct: true },
            { answerId: 'b', content: 'Đáp án Sai', is_correct: false },
        ]
    }))
};

const filterAssignments = (data) => {
  const now = new Date();
  const todo = [];
  const overdue = [];
  const completed = [];

  data.forEach((session) => {
    if (session.exam_taken) {
      completed.push(session);
    } else {
      const dueDate = new Date(session.expire_at);
      if (dueDate < now) {
        overdue.push(session);
      } else {
        todo.push(session);
      }
    }
  });
  return { todo, overdue, completed };
};


// TabPanel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`assignment-tabpanel-${index}`}
      aria-labelledby={`assignment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AssignmentCard = ({ session, status, onStart, onView }) => {
  const { exam, exam_taken, expire_at } = session;

  const cardBorderColor =
    status === 'todo' ? 'primary.main' : status === 'overdue' ? 'error.main' : 'divider';

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
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
              <MenuBookIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body1">Môn: <strong>{exam.category?.subject || 'Toán'}</strong></Typography>
              <SchoolIcon fontSize="small" sx={{ mr: 1, ml: 2 }} />
              <Typography variant="body1">Lớp: <strong>{exam.class?.classname}</strong></Typography>
            </Box>
          </Box>
          {status === 'completed' && (
            <Chip
              label={`Điểm: ${exam_taken.final_score} / ${exam.total_question}`} // Hiển thị điểm số thật từ mock
              color={exam_taken.final_score / exam.total_question >= 0.5 ? "success" : "error"}
              sx={{ fontWeight: 600, fontSize: '1rem', ml: 2 }}
            />
          )}
        </Box>

        <Grid container spacing={1} sx={{ mt: 2, color: 'text.secondary' }}>
          <Grid item xs={12} md={4}>
            {status === 'completed' ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventAvailableIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2">Đã nộp: {formatShortDate(exam_taken.done_time)}</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventBusyIcon fontSize="small" sx={{ mr: 1, color: status === 'overdue' ? 'error.main' : 'warning.main' }} />
                <Typography variant="body2" sx={{ color: status === 'overdue' ? 'error.main' : 'inherit' }}>
                  Hạn nộp: {formatShortDate(expire_at)}
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
              <Typography variant="body2">Số câu: {exam.total_question} câu</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 2, backgroundColor: 'grey.50' }}>
        {status === 'todo' && (
          <Button variant="contained" color="primary" onClick={() => onStart(session.sessionId)}>
            Làm bài
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
  const navigate = useNavigate();

  useEffect(() => {
    const { todo, overdue, completed } = filterAssignments(mockApiData);
    setAssignments({ todo, overdue, completed });
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStartAssignment = (sessionId) => {
    navigate(`/student/assignment/session/${sessionId}`);
  };

// Xử lý khi bấm "Xem kết quả"
  const handleViewResult = (session) => {
    console.log(`Xem kết quả của sessionId: ${session.sessionId}`);
    
    // 1. Lấy dữ liệu câu hỏi từ Mock
    // Fallback nếu không có mock cho session này thì tạo mảng rỗng để tránh crash
    const questions = MOCK_QUESTIONS_DATA[session.sessionId] || 
                      Array.from({ length: session.exam.total_question }, (_, i) => ({
                          questionId: `q_mock_${i}`,
                          content: 'Nội dung câu hỏi mô phỏng...',
                          type: 'SINGLE_CHOICE',
                          answers: []
                      }));

    // 2. Tạo kết quả bài làm giả lập (Answers Taken)
    // Giả sử làm đúng 50% để test hiển thị
    const answersTaken = questions.map((q, index) => ({
        questionId: q.questionId,
        is_correct: index % 2 === 0, // Chẵn đúng, lẻ sai
        selected: index % 2 === 0 ? ['a'] : ['b'],
        is_skipped: false
    }));

    // 3. Object điểm số
    const scoreData = {
        correct: session.exam_taken?.final_score || 0, // Dùng điểm thật từ API mock
        total: session.exam.total_question,
        skipped: 0,
        incorrect: session.exam.total_question - (session.exam_taken?.final_score || 0)
    };

    // 4. Chuyển hướng kèm state đầy đủ
    navigate(`/student/assignment/session/${session.sessionId}/result`, {
        state: {
            score: scoreData,
            title: session.exam.title,
            subject: session.exam.category?.subject,
            questions: questions,        
            answers_taken: answersTaken  
        }
    });
  };

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
              <AssignmentCard key={session.sessionId} session={session} status="todo" onStart={handleStartAssignment} />
            ))
          ) : <Typography sx={{ p: 2, textAlign: 'center' }}>Bạn không có bài tập nào cần làm.</Typography>}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {assignments.overdue.length > 0 ? (
            assignments.overdue.map((session) => (
              <AssignmentCard key={session.sessionId} session={session} status="overdue" />
            ))
          ) : <Typography sx={{ p: 2, textAlign: 'center' }}>Không có bài tập nào quá hạn.</Typography>}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {assignments.completed.length > 0 ? (
            assignments.completed.map((session) => (
              <AssignmentCard key={session.sessionId} session={session} status="completed" onView={handleViewResult} />
            ))
          ) : <Typography sx={{ p: 2, textAlign: 'center' }}>Bạn chưa hoàn thành bài tập nào.</Typography>}
        </TabPanel>
      </Paper>
    </Container>
  );
}