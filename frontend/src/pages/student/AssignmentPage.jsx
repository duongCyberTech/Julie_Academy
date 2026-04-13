import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Typography, Box, Tabs, Tab, Paper, CircularProgress, Pagination, Grid, useTheme 
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { getAllAssignmentsForStudent } from '../../services/ExamService';
import AssignmentCard from '../../components/AssignmentCard';

// Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import UpdateIcon from '@mui/icons-material/Update';
import ContentPasteOffIcon from '@mui/icons-material/ContentPasteOff';

// --- Styled Components ---
const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
  };
});

const HeaderBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  flexShrink: 0,
}));

// --- Logic Data ---
const mergeData = (...arrays) => {
  const map = new Map();
  arrays.flat().forEach(item => {
    map.set(`${item.exam.exam_id}_${item.session_id}`, item);
  });
  return Array.from(map.values());
};

const filterAssignments = (sessionsData) => {
  const now = new Date();
  const upcoming = [], todo = [], overdue = [], completed = [];

  sessionsData.forEach((session) => {
    const start = new Date(session.startAt);
    const expire = new Date(session.expireAt); 
    const examTakensArray = session.exam_takens || [];
    session.examTakens = examTakensArray; 
    
    const pendingHistory = examTakensArray.find(et => et && !et.isDone);
    const completedHistories = examTakensArray.filter(et => et && et.isDone);
    
    if (pendingHistory) session.pending_et_id = pendingHistory.et_id;

    // Đã làm >= 1 lần -> Hoàn thành
    if (completedHistories.length > 0) {
        completed.push(session);
    } else if (start > now) {
        upcoming.push(session);
    } else if (expire < now) {
        overdue.push(session);
    } else {
        todo.push(session);
    }
  });

  const sortByExpire = (a, b) => new Date(a.expireAt) - new Date(b.expireAt);
  
  upcoming.sort((a, b) => new Date(a.startAt) - new Date(b.startAt)); 
  todo.sort(sortByExpire);
  overdue.sort((a, b) => new Date(b.expireAt) - new Date(a.expireAt)); // Quá hạn gần nhất lên đầu
  completed.sort((a, b) => new Date(b.expireAt) - new Date(a.expireAt)); 

  return { upcoming, todo, overdue, completed };
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ flexGrow: 1 }}>
      {value === index && (
        <Box sx={{ 
          pt: 4, 
          pb: 8, 
          backgroundColor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.primary.main, 0.01), 
          minHeight: '50vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <Box sx={{ width: '100%', maxWidth: 1200, px: { xs: 2, md: 4 } }}>
            {children}
          </Box>
        </Box>
      )}
    </div>
  );
}

// --- Main Component ---
const StudentAssignmentPage = memo(() => {
  const [tabValue, setTabValue] = useState(1); // Mặc định mở tab "Cần làm"
  const [assignments, setAssignments] = useState({ upcoming: [], todo: [], overdue: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ROWS_PER_PAGE = 12; // Cố định hiển thị 12 bài để tối ưu trải nghiệm (không bắt HS tự chọn)
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    const fetchData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        setLoading(true);
        const [openData, upcomingData, expiredData, completedData] = await Promise.all([
          getAllAssignmentsForStudent(token, { status: 'open', limit: 100 }),
          getAllAssignmentsForStudent(token, { status: 'upcoming', limit: 100 }),
          getAllAssignmentsForStudent(token, { status: 'expired', limit: 100 }),
          getAllAssignmentsForStudent(token, { status: 'completed', limit: 100 })
        ]);
        
        const allData = mergeData(openData, upcomingData, expiredData, completedData);
        setAssignments(filterAssignments(allData));
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bài tập:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  }, []);

  const handleStartAssignment = useCallback((session) => {
    const classId = session.exam_open_in[0]?.class_id;
    if (classId) navigate(`/student/assignment/class/${classId}/exam/${session.exam.exam_id}/session/${session.session_id}`);
  }, [navigate]);

  const handleContinueAssignment = useCallback((et_id) => navigate(`/student/assignment/continue/${et_id}`), [navigate]);
  
  const handleViewResult = useCallback((session) => {
    navigate(`/student/assignment/history/${session.exam.exam_id}/${session.session_id}`, { 
      state: { sessionData: session } 
    });
  }, [navigate]);

  if (loading) {
    return (
      <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={50} thickness={4} />
      </PageWrapper>
    );
  }

  // Giữ lại đủ 4 Tabs theo yêu cầu, câu văn cổ vũ tạo động lực
  const tabsConfig = [
    { key: 'upcoming', label: `Sắp Mở (${assignments.upcoming.length})`, icon: <UpdateIcon />, data: assignments.upcoming, emptyMsg: 'Chưa có bài tập mới nào sắp mở.' },
    { key: 'todo', label: `Cần Làm (${assignments.todo.length})`, icon: <AssignmentIcon />, data: assignments.todo, emptyMsg: 'Tuyệt vời! Bạn đã hoàn thành hết các nhiệm vụ hiện tại.' },
    { key: 'overdue', label: `Quá Hạn (${assignments.overdue.length})`, icon: <AssignmentLateIcon />, data: assignments.overdue, emptyMsg: 'Rất tốt! Bạn không có bài tập nào bị trễ hạn cả.' },
    { key: 'completed', label: `Hoàn Thành (${assignments.completed.length})`, icon: <AssignmentTurnedInIcon />, data: assignments.completed, emptyMsg: 'Bạn chưa hoàn thành bài tập nào. Cố lên nhé!' }
  ];

  return (
    <PageWrapper>
      <HeaderBar>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">
            Góc làm bài
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            Các bài tập ưu tiên (Sắp hết hạn) sẽ được xếp lên đầu. Hãy kiểm tra thường xuyên nhé!
          </Typography>
        </Box>
      </HeaderBar>

      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: '20px', 
          overflow: 'hidden', 
          border: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`, 
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1
        }}
      >
        <Box sx={{ borderBottom: `2px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`, backgroundColor: 'background.paper' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-flexContainer': { justifyContent: 'center', gap: { xs: 0, sm: 2, md: 4 } },
              '& .MuiTab-root': { py: 2.5, px: 3, fontWeight: 700, fontSize: '1rem', textTransform: 'none' },
              '& .MuiTabs-indicator': { height: 4, borderRadius: '4px 4px 0 0' }
            }}
          >
            {tabsConfig.map((tab) => (
              <Tab key={tab.key} icon={tab.icon} iconPosition="start" label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {tabsConfig.map((tab, index) => {
          const totalPages = Math.ceil(tab.data.length / ROWS_PER_PAGE);
          const currentData = tab.data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

          return (
            <TabPanel key={tab.key} value={tabValue} index={index}>
              {currentData.length > 0 ? (
                <>
                  <Grid container spacing={3}>
                    {currentData.map(session => (
                      <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={`${session.exam.exam_id}_${session.session_id}`}>
                        <AssignmentCard 
                          session={session} status={tab.key} isGlobal={true}
                          onStart={handleStartAssignment} onContinue={handleContinueAssignment} onView={handleViewResult}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                      <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={(event, value) => setPage(value)} 
                        color="primary" 
                        size="large"
                        sx={{
                          '& .MuiPaginationItem-root': { fontWeight: 700, fontSize: '1rem' }
                        }}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', py: 8, px: 3,
                  border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.6), borderRadius: 4,
                  backgroundColor: isDark ? 'transparent' : 'background.paper',
                  maxWidth: 500, margin: '0 auto'
                }}>
                  <ContentPasteOffIcon sx={{ fontSize: 80, opacity: 0.15, mb: 3, color: 'text.disabled' }} />
                  <Typography variant="h6" color="text.secondary" fontWeight={700}>{tab.emptyMsg}</Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 1, fontWeight: 500 }}>
                    Bạn có thể kiểm tra các tab khác để xem tiến độ của mình.
                  </Typography>
                </Box>
              )}
            </TabPanel>
          );
        })}
      </Paper>
    </PageWrapper>
  );
});

export default StudentAssignmentPage;