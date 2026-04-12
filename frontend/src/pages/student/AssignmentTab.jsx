import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { 
  Typography, Box, Tabs, Tab, Paper, CircularProgress, Pagination, useTheme, Alert , Grid
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import { getSessionsByClass } from '../../services/ExamService';
import AssignmentCard from '../../components/AssignmentCard';

import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import UpdateIcon from '@mui/icons-material/Update';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const TabWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const SegmentedTabsContainer = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
    position: 'sticky',
    top: 0,
    zIndex: 10,
    padding: theme.spacing(1, 0),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
  };
});

const StyledTabs = styled(Tabs)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    minHeight: 48,
    backgroundColor: isDark ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.primary.main, 0.05),
    borderRadius: '24px',
    padding: '4px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.primary.main, 0.1)}`,
    '& .MuiTabs-indicator': {
      height: '100%',
      borderRadius: '20px',
      backgroundColor: theme.palette.primary.main,
      boxShadow: isDark ? 'none' : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
      zIndex: 0,
    },
    '& .MuiTabs-flexContainer': {
      gap: '4px',
    }
  };
});

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '0.9rem',
  minHeight: 40,
  borderRadius: '20px',
  zIndex: 1,
  color: theme.palette.text.secondary,
  padding: theme.spacing(0, 3),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&.Mui-selected': {
    color: '#ffffff',
  },
  '&:hover:not(.Mui-selected)': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  }
}));

const EmptyStateCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    padding: theme.spacing(8, 4),
    textAlign: 'center',
    borderRadius: '24px',
    backgroundColor: isDark ? alpha(theme.palette.background.default, 0.4) : '#ffffff',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.4)}`,
    boxShadow: isDark ? 'none' : `0 8px 32px ${alpha(theme.palette.primary.main, 0.04)}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
  };
});

const filterAssignments = (sessionsData) => {
  const now = new Date();
  const upcoming = [];
  const todo = [];
  const overdue = [];
  const completed = [];

  sessionsData.forEach((session) => {
    const start = new Date(session.startAt);
    const expire = new Date(session.expireAt); 
    const examTakensArray = session.exam_takens || [];
    session.examTakens = examTakensArray; 
    
    const pendingHistory = examTakensArray.find(et => et && !et.isDone);
    const completedHistories = examTakensArray.filter(et => et && et.isDone);
    
    if (pendingHistory) session.pending_et_id = pendingHistory.et_id;

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
  overdue.sort((a, b) => new Date(b.expireAt) - new Date(a.expireAt)); 
  completed.sort((a, b) => new Date(b.expireAt) - new Date(a.expireAt)); 

  return { upcoming, todo, overdue, completed };
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ flexGrow: 1 }}>
      {value === index && (
        <Box sx={{ pt: 2, pb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ width: '100%' }}>
            {children}
          </Box>
        </Box>
      )}
    </div>
  );
}

const StudentClassAssignmentTab = memo(({ classId }) => {
  const [tabValue, setTabValue] = useState(1); 
  const [assignments, setAssignments] = useState({ upcoming: [], todo: [], overdue: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const ROWS_PER_PAGE = 8;
  
  const navigate = useNavigate();
  const theme = useTheme();
  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchClassAssignments = useCallback(async () => {
    if (!classId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSessionsByClass(classId, token);
      const safeData = Array.isArray(data) ? data : [];
      setAssignments(filterAssignments(safeData));
    } catch (err) {
      setError('Không thể tải danh sách nhiệm vụ. Hãy thử lại nhé!');
    } finally {
      setLoading(false);
    }
  }, [classId, token]);

  useEffect(() => {
    fetchClassAssignments();
  }, [fetchClassAssignments]);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  }, []);

  const handleStartAssignment = useCallback((session) => {
    navigate(`/student/assignment/class/${classId}/exam/${session.exam.exam_id}/session/${session.session_id}`);
  }, [navigate, classId]);

  const handleContinueAssignment = useCallback((et_id) => {
    navigate(`/student/assignment/continue/${et_id}`);
  }, [navigate]);
  
  const handleViewResult = useCallback((session) => {
    navigate(`/student/assignment/history/${session.exam.exam_id}/${session.session_id}`, { 
      state: { sessionData: session } 
    });
  }, [navigate]);

  const tabsConfig = useMemo(() => [
    { key: 'upcoming', label: `Sắp Mở (${assignments.upcoming.length})`, icon: <UpdateIcon fontSize="small" />, data: assignments.upcoming, emptyMsg: 'Chưa có nhiệm vụ mới nào sắp mở.' },
    { key: 'todo', label: `Cần Làm (${assignments.todo.length})`, icon: <AssignmentIcon fontSize="small" />, data: assignments.todo, emptyMsg: 'Tuyệt vời! Bạn đã hoàn thành hết nhiệm vụ.' },
    { key: 'overdue', label: `Quá Hạn (${assignments.overdue.length})`, icon: <AssignmentLateIcon fontSize="small" />, data: assignments.overdue, emptyMsg: 'Phong độ đỉnh cao! Không có bài tập nào bị trễ.' },
    { key: 'completed', label: `Hoàn Thành (${assignments.completed.length})`, icon: <AssignmentTurnedInIcon fontSize="small" />, data: assignments.completed, emptyMsg: 'Bạn chưa hoàn thành bài nào. Cố lên nhé!' }
  ], [assignments]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={48} thickness={4} />
      </Box>
    );
  }

  return (
    <TabWrapper>
      {error && <Alert severity="error" sx={{ borderRadius: '16px' }}>{error}</Alert>}

      <SegmentedTabsContainer>
        <StyledTabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabsConfig.map((tab) => (
            <StyledTab 
              key={tab.key} 
              icon={tab.icon} 
              iconPosition="start" 
              label={tab.label} 
              disableRipple
            />
          ))}
        </StyledTabs>
      </SegmentedTabsContainer>

      <Box>
        {tabsConfig.map((tab, index) => {
          const totalPages = Math.ceil(tab.data.length / ROWS_PER_PAGE);
          const currentData = tab.data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

          return (
            <TabPanel key={tab.key} value={tabValue} index={index}>
              {currentData.length > 0 ? (
                <>
                  <Grid container spacing={3}>
                    {currentData.map(session => (
                      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`${session.exam?.exam_id}_${session.session_id}`}>
                        <AssignmentCard 
                          session={session} 
                          status={tab.key} 
                          isGlobal={false} 
                          onStart={() => handleStartAssignment(session)} 
                          onContinue={() => handleContinueAssignment(session.pending_et_id)} 
                          onView={() => handleViewResult(session)}
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
                          '& .MuiPaginationItem-root': { fontWeight: 700, borderRadius: '12px' } 
                        }}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <EmptyStateCard elevation={0}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    mb: 1
                  }}>
                    <SentimentVerySatisfiedIcon sx={{ fontSize: 56 }} />
                  </Box>
                  <Typography variant="h6" color="text.primary" fontWeight={700}>
                    {tab.emptyMsg}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Hãy thử kiểm tra các mục khác trên thanh điều hướng nhé!
                  </Typography>
                </EmptyStateCard>
              )}
            </TabPanel>
          );
        })}
      </Box>
    </TabWrapper>
  );
});

export default StudentClassAssignmentTab;