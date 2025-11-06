/*
 * File: frontend/src/pages/student/StudentAssignmentPage.jsx
 *
 * (PHIÊN BẢN NÂNG CẤP - NHIỀU MẪU HƠN)
 *
 * Cập nhật:
 * 1. Mock data đã được mở rộng (6 bài tập)
 * cho cả 3 tab "Cần làm", "Quá hạn", "Đã hoàn thành".
 */

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
import AssignmentIcon from '@mui/icons-material/Assignment'; // Cần làm
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'; // Quá hạn
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'; // Đã HT
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// ======================================================
// --- MOCK DATA (Nâng cấp với 6 mẫu) ---
// ======================================================

const mockApiData = [
  // --- 1. Bài tập "Cần làm" (Chưa làm, còn hạn) ---
  {
    sessionId: 'session_1', // ExamSession.session_id
    exam: {
      exam_id: 'exam_1',
      title: 'Kiểm tra 15 phút - Chương 1 (Bài 1)',
      duration: 15,
      total_question: 9, // Khớp với 9 câu
      class: { classname: 'Lớp hè 9A1' },
      category: { subject: 'Toán' },
    },
    exam_taken: null,
    expire_at: '2025-11-30T23:59:00Z', // Còn hạn
  },
  {
    sessionId: 'session_4', // Mẫu Cần làm thứ 2
    exam: {
      exam_id: 'exam_4',
      title: 'Bài tập Chương 2 (Bài 2)',
      duration: 45,
      total_question: 3, // Sẽ dùng 3 câu
      class: { classname: 'Lớp hè 9A1' },
      category: { subject: 'Toán' },
    },
    exam_taken: null,
    expire_at: '2025-12-01T23:59:00Z', // Còn hạn
  },

  // --- 2. Bài tập "Quá hạn" (Chưa làm, hết hạn) ---
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
    expire_at: '2025-11-01T23:59:00Z', // Đã quá hạn
  },
  {
    sessionId: 'session_5', // Mẫu Quá hạn thứ 2
    exam: {
      exam_id: 'exam_5',
      title: 'Bài tập Chương 1 (Đã quá hạn)',
      duration: 20,
      total_question: 10,
      class: { classname: 'Lớp chuyên Toán' },
      category: { subject: 'Toán' },
    },
    exam_taken: null,
    expire_at: '2025-11-05T23:59:00Z', // Đã quá hạn
  },

  // --- 3. Bài tập "Đã hoàn thành" (Đã làm, có điểm) ---
  {
    sessionId: 'session_3',
    exam: {
      exam_id: 'exam_3',
      title: 'Bài tập về nhà - Căn bậc hai',
      duration: 30,
      total_question: 15,
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
    sessionId: 'session_6', // Mẫu Đã hoàn thành thứ 2
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

// Hàm xử lý logic phân loại
const filterAssignments = (data) => {
  const now = new Date(); // Thời gian hiện tại
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

// ======================================================
// --- END MOCK DATA ---
// ======================================================

/*
 * Component TabPanel (Hàm trợ giúp của Material-UI)
 */
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

/*
 * Component Thẻ Bài tập (Chung cho cả 3 trạng thái)
 */
const AssignmentCard = ({ session, status, onStart, onView }) => {
  const { exam, exam_taken, expire_at } = session;

  const cardBorderColor =
    status === 'todo'
      ? 'primary.main'
      : status === 'overdue'
      ? 'error.main'
      : 'divider';

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: cardBorderColor,
        opacity: status === 'overdue' ? 0.7 : 1,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {/* Thông tin chính */}
          <Box>
            <Typography
              variant="h5"
              component="div"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              {exam.title}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
                color: 'text.secondary',
              }}
            >
              <MenuBookIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body1">
                Môn: <strong>{exam.category?.subject || 'Toán'}</strong>
              </Typography>
              <SchoolIcon fontSize="small" sx={{ mr: 1, ml: 2 }} />
              <Typography variant="body1">
                Lớp: <strong>{exam.class?.classname}</strong>
              </Typography>
            </Box>
          </Box>
          {/* Điểm số (nếu đã hoàn thành) */}
          {status === 'completed' && (
            <Chip
              label={`Điểm: ${exam_taken.final_score} / ${exam.total_question}`}
              color={exam_taken.final_score / exam.total_question >= 0.5 ? "success" : "error"}
              sx={{ fontWeight: 600, fontSize: '1rem', ml: 2 }}
            />
          )}
        </Box>

        <Grid container spacing={1} sx={{ mt: 2, color: 'text.secondary' }}>
          {/* Hạn nộp / Ngày nộp */}
          <Grid item xs={12} md={4}>
            {status === 'completed' ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventAvailableIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2">
                  Đã nộp: {formatShortDate(exam_taken.done_time)}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventBusyIcon
                  fontSize="small"
                  sx={{
                    mr: 1,
                    color: status === 'overdue' ? 'error.main' : 'warning.main',
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: status === 'overdue' ? 'error.main' : 'inherit' }}
                >
                  Hạn nộp: {formatShortDate(expire_at)}
                </Typography>
              </Box>
            )}
          </Grid>
          {/* Thời gian */}
          <Grid item xs={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Thời gian: {exam.duration} phút
              </Typography>
            </Box>
          </Grid>
          {/* Số câu */}
          <Grid item xs={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <QuestionMarkIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Số câu: {exam.total_question} câu
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      {/* Nút hành động */}
      <CardActions
        sx={{
          justifyContent: 'flex-end',
          p: 2,
          backgroundColor: 'grey.50',
        }}
      >
        {status === 'todo' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onStart(session.sessionId)}
          >
            Làm bài
          </Button>
        )}
        {status === 'overdue' && (
          <Button variant="contained" color="error" disabled>
            Đã quá hạn
          </Button>
        )}
        {status === 'completed' && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => onView(session.sessionId)}
          >
            Xem kết quả
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

/**
 * Component chính: Trang Bài tập được giao
 */
export default function StudentAssignmentPage() {
  const [tabValue, setTabValue] = useState(0);
  const [assignments, setAssignments] = useState({
    todo: [],
    overdue: [],
    completed: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const { todo, overdue, completed } = filterAssignments(mockApiData);
    setAssignments({ todo, overdue, completed });
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStartAssignment = (sessionId) => {
    console.log(`Bắt đầu làm bài tập có sessionId: ${sessionId}`);
    navigate(`/student/practice/session/${sessionId}`);
  };

  const handleViewResult = (sessionId) => {
    console.log(`Xem kết quả của sessionId: ${sessionId}`);
    navigate(`/student/assignment/result/${sessionId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Bài tập được giao
      </Typography>

      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="tabs bài tập"
            variant="fullWidth"
          >
            <Tab
              icon={<AssignmentIcon />}
              iconPosition="start"
              label={`Cần làm (${assignments.todo.length})`}
              id="assignment-tab-0"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab
              icon={<AssignmentLateIcon />}
              iconPosition="start"
              label={`Quá hạn (${assignments.overdue.length})`}
              id="assignment-tab-1"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab
              icon={<AssignmentTurnedInIcon />}
              iconPosition="start"
              label={`Đã hoàn thành (${assignments.completed.length})`}
              id="assignment-tab-2"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
          </Tabs>
        </Box>

        {/* Tab "Cần làm" */}
        <TabPanel value={tabValue} index={0}>
          {assignments.todo.length > 0 ? (
            assignments.todo.map((session) => (
              <AssignmentCard
                key={session.sessionId}
                session={session}
                status="todo"
                onStart={handleStartAssignment}
              />
            ))
          ) : (
            <Typography sx={{ p: 2, textAlign: 'center' }}>
              Bạn không có bài tập nào cần làm.
            </Typography>
          )}
        </TabPanel>

        {/* Tab "Quá hạn" */}
        <TabPanel value={tabValue} index={1}>
          {assignments.overdue.length > 0 ? (
            assignments.overdue.map((session) => (
              <AssignmentCard
                key={session.sessionId}
                session={session}
                status="overdue"
              />
            ))
          ) : (
            <Typography sx={{ p: 2, textAlign: 'center' }}>
              Không có bài tập nào quá hạn.
            </Typography>
          )}
        </TabPanel>

        {/* Tab "Đã hoàn thành" */}
        <TabPanel value={tabValue} index={2}>
          {assignments.completed.length > 0 ? (
            assignments.completed.map((session) => (
              <AssignmentCard
                key={session.sessionId}
                session={session}
                status="completed"
                onView={handleViewResult}
              />
            ))
          ) : (
            <Typography sx={{ p: 2, textAlign: 'center' }}>
              Bạn chưa hoàn thành bài tập nào.
            </Typography>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
}