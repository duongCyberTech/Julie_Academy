import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getClassDetails } from '../../services/ClassService';

import {
    Box, Typography, Paper, Alert, Tabs, Tab, Container,
    Stack, Chip, Skeleton, Avatar, IconButton, Tooltip, Breadcrumbs, Link, Button
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { styled, alpha } from '@mui/material/styles';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'dayjs/locale/vi';

import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'; 
import TimelapseOutlinedIcon from '@mui/icons-material/TimelapseOutlined'; 
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import PendingActionsIcon from '@mui/icons-material/PendingActions';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'; 
import TimelapseOutlinedIcon from '@mui/icons-material/TimelapseOutlined'; 
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import StudentsTab from './StudentTab'; 
import ScheduleTab from './ScheduleTab'; 
import ResourceTab from './ResourceTab';
import AssignmentTab from './AssignmentTab';


const PageContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(5),
    minHeight: '100vh',
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none', 
    marginBottom: theme.spacing(3),
    background: '#fff',
    position: 'relative',
    overflow: 'hidden'
}));

const StatBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : alpha(theme.palette.common.white, 0.05),
    border: `1px solid ${theme.palette.divider}`,
    minWidth: 160,
    flex: '1 1 auto'
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    minHeight: 48,
    marginRight: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    '&.Mui-selected': {
        color: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
    }
}));

const StatusChip = memo(({ status }) => {
    const config = {
        pending: { label: "Chờ mở lớp", color: "warning", icon: <PendingActionsIcon fontSize="small"/> },
        ongoing: { label: "Đang diễn ra", color: "success", icon: <PlayCircleOutlineIcon fontSize="small"/> },
        completed: { label: "Đã kết thúc", color: "default", icon: <CheckCircleOutlineIcon fontSize="small"/> },
        cancelled: { label: "Đã hủy", color: "error", icon: <CancelOutlinedIcon fontSize="small"/> },
    const config = {
        pending: { label: "Chờ mở lớp", color: "warning", icon: <PendingActionsIcon fontSize="small"/> },
        ongoing: { label: "Đang diễn ra", color: "success", icon: <PlayCircleOutlineIcon fontSize="small"/> },
        completed: { label: "Đã kết thúc", color: "default", icon: <CheckCircleOutlineIcon fontSize="small"/> },
        cancelled: { label: "Đã hủy", color: "error", icon: <CancelOutlinedIcon fontSize="small"/> },
    };
    const { label, color, icon } = config[status] || config.pending;
    
    return (
        <Chip 
            icon={icon} 
            label={label} 
            color={color} 
            size="small" 
            variant="outlined" 
            sx={{ fontWeight: 600, border: '1px solid', bgcolor: alpha(color === 'default' ? '#000' : '#fff', 0.05) }} 
        />
    );
    const { label, color, icon } = config[status] || config.pending;
    
    return (
        <Chip 
            icon={icon} 
            label={label} 
            color={color} 
            size="small" 
            variant="outlined" 
            sx={{ fontWeight: 600, border: '1px solid', bgcolor: alpha(color === 'default' ? '#000' : '#fff', 0.05) }} 
        />
    );
});

function ClassDetailPage() {
    const { classId } = useParams();
    const [token] = useState(() => localStorage.getItem('token'));

    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState('students'); 

    const fetchClassDetails = useCallback(async () => {
        if (!token || !classId) {
            setError("Thông tin không hợp lệ.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await getClassDetails(classId, token);
            setClassData(response);
        } catch (err) {
            setError("Không thể tải chi tiết lớp học.");
        } finally {
            setLoading(false);
        }
    }, [token, classId]);

    useEffect(() => {
        fetchClassDetails();
    }, [fetchClassDetails]);

    const handleChangeTab = (event, newValue) => {
        setCurrentTab(newValue);
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 3 }}>
                <Box mb={2}><Skeleton width={200} /></Box>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 4, mb: 3 }} />
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
            </Container>
        );
        return (
            <Container maxWidth="xl" sx={{ mt: 3 }}>
                <Box mb={2}><Skeleton width={200} /></Box>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 4, mb: 3 }} />
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>{error}</Alert>
                <Button component={RouterLink} to="/tutor/classes" sx={{ mt: 2 }} variant="outlined">Quay lại danh sách</Button>
            </Container>
        );
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>{error}</Alert>
                <Button component={RouterLink} to="/tutor/classes" sx={{ mt: 2 }} variant="outlined">Quay lại danh sách</Button>
            </Container>
        );
    }

    if (!classData) return null;

    if (!classData) return null;

    return (
        <PageContainer maxWidth="xl">
            {/* 1. Breadcrumbs */}
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
                <Link component={RouterLink} to="/tutor/classes" underline="hover" color="inherit">
                    Quản lý lớp học
                </Link>
                <Typography color="text.primary" fontWeight={500}>{classData.classname}</Typography>
            </Breadcrumbs>

            {/* 2. Header Info Card */}
            <HeaderCard>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                            <Typography variant="h4" fontWeight="800" color="text.primary">
                                {classData.classname}
                            </Typography>
                            <StatusChip status={classData.status} />
                        </Stack>
                        
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px', lineHeight: 1.6, mb: 2 }}>
                            {classData.description || "Chưa có mô tả cho lớp học này."}
        <PageContainer maxWidth="xl">
            {/* 1. Breadcrumbs */}
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
                <Link component={RouterLink} to="/tutor/classes" underline="hover" color="inherit">
                    Quản lý lớp học
                </Link>
                <Typography color="text.primary" fontWeight={500}>{classData.classname}</Typography>
            </Breadcrumbs>

            {/* 2. Header Info Card */}
            <HeaderCard>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                            <Typography variant="h4" fontWeight="800" color="text.primary">
                                {classData.classname}
                            </Typography>
                            <StatusChip status={classData.status} />
                        </Stack>
                        
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px', lineHeight: 1.6, mb: 2 }}>
                            {classData.description || "Chưa có mô tả cho lớp học này."}
                        </Typography>

                        {/* Quick Stats Row */}
                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                            <StatBox>
                                <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 32, height: 32 }}>
                                    <SchoolOutlinedIcon fontSize="small"/>
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>KHỐI</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>Lớp {classData.grade}</Typography>
                                </Box>
                            </StatBox>

                            <StatBox>
                                <Avatar sx={{ bgcolor: 'info.lighter', color: 'info.main', width: 32, height: 32 }}>
                                    <MenuBookOutlinedIcon fontSize="small"/>
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>MÔN HỌC</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>{classData.subject}</Typography>
                                </Box>
                            </StatBox>

                            <StatBox>
                                <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 32, height: 32 }}>
                                    <GroupOutlinedIcon fontSize="small"/>
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>SĨ SỐ</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {classData.learning?.length || 0} / {classData.nb_of_student} học viên
                                    </Typography>
                                </Box>
                            </StatBox>
                            <StatBox>
                                <Avatar sx={{ bgcolor: 'error.lighter', color: 'error.main', width: 32, height: 32 }}>
                                    <TimelapseOutlinedIcon fontSize="small"/>
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>THỜI LƯỢNG</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {classData.duration_time || 0} tuần
                                    </Typography>
                                </Box>
                            </StatBox>

                            <StatBox>
                                <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main', width: 32, height: 32 }}>
                                    <AccessTimeOutlinedIcon fontSize="small"/>
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>BẮT ĐẦU</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {dayjs(classData.startat).format('DD/MM/YYYY')}
                                    </Typography>
                                </Box>
                            </StatBox>
                        </Stack>

                        {/* Quick Stats Row */}
                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                            <StatBox>
                                <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 32, height: 32 }}>
                                    <SchoolOutlinedIcon fontSize="small"/>
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>KHỐI</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>Lớp {classData.grade}</Typography>
                                </Box>
                            </StatBox>

                            <StatBox>
                                <Avatar sx={{ bgcolor: 'info.lighter', color: 'info.main', width: 32, height: 32 }}>
                                    <MenuBookOutlinedIcon fontSize="small"/>
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>MÔN HỌC</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>{classData.subject}</Typography>
                                </Box>
                            </StatBox>

                            <StatBox>
                                <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 32, height: 32 }}>
                                    <GroupOutlinedIcon fontSize="small"/>
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>SĨ SỐ</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {classData.learning?.length || 0} / {classData.nb_of_student} học viên
                                    </Typography>
                                </Box>
                            </StatBox>
                            <StatBox>
                                <Avatar sx={{ bgcolor: 'error.lighter', color: 'error.main', width: 32, height: 32 }}>
                                    <TimelapseOutlinedIcon fontSize="small"/>
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>THỜI LƯỢNG</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {classData.duration_time || 0} tuần
                                    </Typography>
                                </Box>
                            </StatBox>

                            <StatBox>
                                <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main', width: 32, height: 32 }}>
                                    <AccessTimeOutlinedIcon fontSize="small"/>
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>BẮT ĐẦU</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {dayjs(classData.startat).format('DD/MM/YYYY')}
                                    </Typography>
                                </Box>
                            </StatBox>
                        </Stack>
                    </Box>
                </Stack>
            </HeaderCard>

            {/* 3. Main Content Tabs */}
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#fff' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2, bgcolor: '#fff' }}>
                    <Tabs 
                        value={currentTab} 
                        onChange={handleChangeTab} 
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ minHeight: 48 }}
                    >
                        <StyledTab label="Danh sách học viên" value="students" icon={<GroupOutlinedIcon fontSize="small"/>} iconPosition="start" />
                        <StyledTab label="Lịch học" value="schedule" icon={<CalendarMonthOutlinedIcon fontSize="small"/>} iconPosition="start" />
                        <StyledTab label="Tài liệu & Giáo án" value="documents" icon={<TopicOutlinedIcon fontSize="small"/>} iconPosition="start" />
                        <StyledTab label="Bài tập & Kiểm tra" value="assignments" icon={<AssignmentOutlinedIcon fontSize="small"/>} iconPosition="start" />
                    </Tabs>
                </Box>
            </HeaderCard>

            {/* 3. Main Content Tabs */}
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#fff' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2, bgcolor: '#fff' }}>
                    <Tabs 
                        value={currentTab} 
                        onChange={handleChangeTab} 
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ minHeight: 48 }}
                    >
                        <StyledTab label="Danh sách học viên" value="students" icon={<GroupOutlinedIcon fontSize="small"/>} iconPosition="start" />
                        <StyledTab label="Lịch học" value="schedule" icon={<CalendarMonthOutlinedIcon fontSize="small"/>} iconPosition="start" />
                        <StyledTab label="Tài liệu & Giáo án" value="documents" icon={<TopicOutlinedIcon fontSize="small"/>} iconPosition="start" />
                        <StyledTab label="Bài tập & Kiểm tra" value="assignments" icon={<AssignmentOutlinedIcon fontSize="small"/>} iconPosition="start" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3, minHeight: 500, bgcolor: '#fafafa' }}>
                    {currentTab === 'students' && (
                        <StudentsTab 
                            studentsData={classData.learning} 
                            classId={classId}
                            token={token}
                            onRefresh={fetchClassDetails} 
                        />
                    )}
                    
                    {currentTab === 'schedule' && (
                        <ScheduleTab classId={classId} token={token} />
                    )}
                    
                    {currentTab === 'documents' && (
                        <ResourceTab classId={classId} token={token} />
                    )}
                    
                    {currentTab === 'assignments' && (
                        <AssignmentTab classId={classId} token={token} />  
                    )}
                </Box>
            </Paper>
        </PageContainer>
                <Box sx={{ p: 3, minHeight: 500, bgcolor: '#fafafa' }}>
                    {currentTab === 'students' && (
                        <StudentsTab 
                            studentsData={classData.learning} 
                            classId={classId}
                            token={token}
                            onRefresh={fetchClassDetails} 
                        />
                    )}
                    
                    {currentTab === 'schedule' && (
                        <ScheduleTab classId={classId} token={token} />
                    )}
                    
                    {currentTab === 'documents' && (
                        <ResourceTab classId={classId} token={token} />
                    )}
                    
                    {currentTab === 'assignments' && (
                        <AssignmentTab classId={classId} token={token} />  
                    )}
                </Box>
            </Paper>
        </PageContainer>
    );
}

export default memo(ClassDetailPage);