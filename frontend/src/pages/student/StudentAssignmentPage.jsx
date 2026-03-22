import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Tabs, Tab, Paper, CircularProgress, Pagination,
  Dialog, DialogTitle, DialogContent, IconButton, List, ListItem, Divider, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getSessionsByClass, getPendingExamTakens, getCompletedExamTakens } from '../../services/ExamService';
import AssignmentCard from '../../components/AssignmentCard';

import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import UpdateIcon from '@mui/icons-material/Update';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const mergeData = (...arrays) => {
  const map = new Map();
  arrays.flat().forEach(item => {
    map.set(`${item.exam.exam_id}_${item.session_id}`, item);
  });
  return Array.from(map.values());
};

const mergeAndFilterAssignments = (sessionsData, pendingData, completedData) => {
  const pendingMap = {};
  pendingData.forEach(p => pendingMap[`${p.exam_id}_${p.session_id}`] = p);

  const completedMap = {}; 
  completedData.forEach(c => {
    const key = `${c.exam_id}_${c.session_id}`;
    if(!completedMap[key]) completedMap[key] = [];
    completedMap[key].push(c);
  });

  const normalizedSessions = sessionsData.map(session => {
    const key = `${session.exam.exam_id}_${session.session_id}`;
    const examTakens = [];
    if (completedMap[key]) examTakens.push(...completedMap[key]);
    if (pendingMap[key]) examTakens.push(pendingMap[key]);
    
    return { ...session, examTakens };
  });

  const now = new Date();
  const upcoming = [], todo = [], overdue = [], completed = [];

  normalizedSessions.forEach((session) => {
    const start = new Date(session.startAt);
    const expire = new Date(session.expireAt);
    const examTakens = session.examTakens || [];
    const limit = session.limit_taken || 1;
    
    const pendingHistory = examTakens.find(et => !et.isDone);
    const completedHistories = examTakens.filter(et => et.isDone);
    
    if (pendingHistory) session.pending_et_id = pendingHistory.et_id;

    if (start > now) upcoming.push(session);
    else if (completedHistories.length > 0 && examTakens.length >= limit) completed.push(session);
    else if (expire < now) {
      if (completedHistories.length > 0) completed.push(session);
      else overdue.push(session);
    } 
    else {
      // Chỉ cần có ít nhất 1 lần nộp thành công, cho vào tab Hoàn thành
      if (completedHistories.length > 0) completed.push(session);
      else todo.push(session);
    }
  });

  upcoming.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  todo.sort((a, b) => {
    if (a.pending_et_id && !b.pending_et_id) return -1;
    if (!a.pending_et_id && b.pending_et_id) return 1;
    return new Date(a.expireAt) - new Date(b.expireAt);
  });
  overdue.sort((a, b) => new Date(b.expireAt) - new Date(a.expireAt));
 completed.sort((a, b) => {
      // Ưu tiên đưa các bài "Đang làm dở" lên trên cùng
      if (a.pending_et_id && !b.pending_et_id) return -1;
      if (!a.pending_et_id && b.pending_et_id) return 1;

      // 2. Lấy thời gian nộp bài mới nhất của các lần đã nộp 
      const getLatestDoneTime = (session) => {
          const completedAttempts = (session.examTakens || []).filter(et => et && et.isDone);
          if (completedAttempts.length === 0) return 0;
          return Math.max(...completedAttempts.map(et => new Date(et.doneAt).getTime()));
      };

      const timeA = getLatestDoneTime(a);
      const timeB = getLatestDoneTime(b);

      return timeB - timeA; 
  });

  return { upcoming, todo, overdue, completed };
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ 
          pt: 4, 
          pb: 8, 
          backgroundColor: '#fafafa',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center' 
        }}>

          <Box sx={{ width: '100%', maxWidth: 1100, px: { xs: 2, md: 4 } }}>
            {children}
          </Box>
        </Box>
      )}
    </div>
  );
}

export default function StudentAssignmentPage() {
  const [tabValue, setTabValue] = useState(1);
  const [assignments, setAssignments] = useState({ upcoming: [], todo: [], overdue: [], completed: [] });
  const [loading, setLoading] = useState(true);
  
  // State phân trang
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5; 

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedSessionHistory, setSelectedSessionHistory] = useState(null);

  const navigate = useNavigate();
  const { classId } = useParams(); 
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    if (!classId || !token) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [openData, upcomingData, expiredData, pendingData, completedData] = await Promise.all([
          getSessionsByClass(classId, token, { status: 'open', limit: 100 }),
          getSessionsByClass(classId, token, { status: 'upcoming', limit: 100 }),
          getSessionsByClass(classId, token, { status: 'expired', limit: 100 }),
          getPendingExamTakens(classId, token),
          getCompletedExamTakens(classId, token)
        ]);
        
        const sessionsData = mergeData(openData, upcomingData, expiredData);
        setAssignments(mergeAndFilterAssignments(sessionsData, pendingData, completedData));
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
    setPage(1); 
  };

  const handleStartAssignment = (session) => navigate(`/student/assignment/class/${classId}/exam/${session.exam.exam_id}/session/${session.session_id}`);
  const handleContinueAssignment = (et_id) => navigate(`/student/assignment/continue/${et_id}`);
  

  const handleViewResult = (session) => {
    navigate(`/student/assignment/history/${session.exam.exam_id}/${session.session_id}`, { 
      state: { sessionData: session } 
    });
  };
  
  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

 const formatScore = (rawScore, maxPossible) => {
    return Number(rawScore).toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1');
  };

 const formatDuration = (start, end) => {
    if (!start || !end) return '-';
    const diff = new Date(end) - new Date(start);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes === 0) return `${seconds} giây`;
    return `${minutes} phút ${seconds} giây`;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress size={50} thickness={4}/></Box>;

  const tabsConfig = [
    { key: 'upcoming', label: `Sắp tới (${assignments.upcoming.length})`, icon: <UpdateIcon />, data: assignments.upcoming, emptyMsg: 'Chưa có bài tập nào sắp diễn ra.' },
    { key: 'todo', label: `Cần làm (${assignments.todo.length})`, icon: <AssignmentIcon />, data: assignments.todo, emptyMsg: 'Tuyệt vời! Bạn không có bài tập nào đang tồn đọng.' },
    { key: 'overdue', label: `Quá hạn (${assignments.overdue.length})`, icon: <AssignmentLateIcon />, data: assignments.overdue, emptyMsg: 'Không có bài tập nào quá hạn.' },
    { key: 'completed', label: `Hoàn thành (${assignments.completed.length})`, icon: <AssignmentTurnedInIcon />, data: assignments.completed, emptyMsg: 'Bạn chưa hoàn thành bài tập nào.' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.5px' }}>
          Bài tập Lớp học
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Danh sách các bài tập được giao riêng cho lớp này.
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'grey.200', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#fff' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-flexContainer': { justifyContent: 'center', flexWrap: 'wrap' },
              '& .MuiTab-root': { py: 2.5, px: 3, fontWeight: 600, fontSize: '0.95rem', textTransform: 'none' }
            }}
          >
            {tabsConfig.map((tab) => (
              <Tab key={tab.key} icon={tab.icon} iconPosition="start" label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {tabsConfig.map((tab, index) => {
          const totalPages = Math.ceil(tab.data.length / ITEMS_PER_PAGE);
          const currentData = tab.data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

          return (
            <TabPanel key={tab.key} value={tabValue} index={index}>
              {currentData.length > 0 ? (
                <>
                  {currentData.map(session => (
                    <AssignmentCard 
                      key={`${session.exam.exam_id}_${session.session_id}`} 
                      session={session} 
                      status={tab.key}
                      isGlobal={false} 
                      onStart={handleStartAssignment} 
                      onContinue={handleContinueAssignment}
                      onView={handleViewResult}
                    />
                  ))}

                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={(event, value) => setPage(value)} 
                        color="primary" 
                        size="large"
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box component="img" src="https://cdn-icons-png.flaticon.com/512/7486/7486831.png" alt="Empty State" sx={{ width: 120, opacity: 0.3, mb: 3 }} />
                  <Typography variant="h6" color="text.secondary" fontWeight={500}>{tab.emptyMsg}</Typography>
                </Box>
              )}
            </TabPanel>
          );
        })}
      </Paper>
    </Container>
  );
}