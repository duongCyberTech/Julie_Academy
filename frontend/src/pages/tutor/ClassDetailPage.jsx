import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassDetails } from '../../services/ClassService';

import {
    Box, Typography, Paper, Alert, Tabs, Tab,
    Stack, Chip, Skeleton, Avatar, Button, useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';

// Icons
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'; 
import TimelapseOutlinedIcon from '@mui/icons-material/TimelapseOutlined'; 
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';

import StudentsTab from './StudentTab'; 
import ScheduleTab from './ScheduleTab'; 
import ResourceTab from './ResourceTab';
import AssignmentTab from './AssignmentTab';
import ThreadForum from '../../components/thread/ThreadForum';

// ==========================================
// 1. PAGE WRAPPER CHUẨN DESIGN SYSTEM
// ==========================================
const PageWrapper = styled(Paper)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        margin: theme.spacing(3), 
        padding: theme.spacing(5), 
        backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
        backgroundImage: 'none',
        borderRadius: '24px',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
        boxShadow: isDark 
            ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` 
            : '0 8px 48px rgba(0,0,0,0.03)',
        minHeight: 'calc(100vh - 120px)', 
        display: 'flex',
        flexDirection: 'column',
    };
});

const PanelCard = styled(Paper)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        borderRadius: '16px',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minHeight: 0,
        overflow: 'hidden',
    };
});

const StatBox = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
        padding: theme.spacing(2, 2.5),
        borderRadius: '16px',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
        minWidth: 180,
        flex: '1 1 auto',
        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.02)'
    };
});

const StyledTab = styled(Tab)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.95rem',
        minHeight: 48,
        marginRight: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        color: theme.palette.text.secondary,
        '&.Mui-selected': {
            color: isDark ? theme.palette.primary.light : theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            color: isDark ? theme.palette.primary.light : theme.palette.primary.main,
        }
    };
});

const ScrollableContent = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        flexGrow: 1,
        overflowY: 'auto',
        backgroundColor: isDark ? alpha(theme.palette.background.default, 0.4) : '#F9FAFB',
        padding: theme.spacing(3),
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.text.secondary, 0.2),
            borderRadius: "10px",
            "&:hover": { backgroundColor: alpha(theme.palette.text.secondary, 0.4) },
        },
    };
});

// ==========================================
// COMPONENT ĐÃ ĐƯỢC MEMO HÓA & FIX BUG
// ==========================================
const StatusChip = memo(({ status }) => {
    const config = {
        pending: { label: "Chờ mở lớp", color: "warning", icon: <PendingActionsIcon fontSize="small"/> },
        ongoing: { label: "Đang diễn ra", color: "success", icon: <PlayCircleOutlineIcon fontSize="small"/> },
        // FIX LỖI Ở ĐÂY: Đổi "default" thành "secondary"
        completed: { label: "Đã kết thúc", color: "secondary", icon: <CheckCircleOutlineIcon fontSize="small"/> },
        cancelled: { label: "Đã hủy", color: "error", icon: <CancelOutlinedIcon fontSize="small"/> },
    };
    const { label, color, icon } = config[status] || config.pending;
    
    return (
        <Chip 
            icon={icon} 
            label={label} 
            color={color} 
            size="small" 
            sx={{ 
                fontWeight: 600, 
                border: '1px solid', 
                // Sử dụng optional chaining (?.) để đảm bảo không bao giờ crash nếu sai màu
                borderColor: (theme) => theme.palette[color]?.main || 'grey.500',
                bgcolor: (theme) => alpha(theme.palette[color]?.main || theme.palette.grey[500], 0.1),
                color: (theme) => theme.palette.mode === 'dark' ? (theme.palette[color]?.light || 'grey.300') : (theme.palette[color]?.dark || 'grey.800') 
            }} 
        />
    );
});

// Memoize Header Stats để không bị re-render khi chuyển tab
const ClassStatsHeader = memo(({ classData, theme }) => {
    return (
        <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            <StatBox>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 40, height: 40 }}>
                    <SchoolOutlinedIcon fontSize="small"/>
                </Avatar>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>KHỐI</Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">Lớp {classData.grade}</Typography>
                </Box>
            </StatBox>

            <StatBox>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', width: 40, height: 40 }}>
                    <MenuBookOutlinedIcon fontSize="small"/>
                </Avatar>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>MÔN HỌC</Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">{classData.subject}</Typography>
                </Box>
            </StatBox>

            <StatBox>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', width: 40, height: 40 }}>
                    <GroupOutlinedIcon fontSize="small"/>
                </Avatar>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>SĨ SỐ</Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        {classData.nb_of_student} học viên
                    </Typography>
                </Box>
            </StatBox>

            <StatBox>
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', width: 40, height: 40 }}>
                    <TimelapseOutlinedIcon fontSize="small"/>
                </Avatar>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>THỜI LƯỢNG</Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        {classData.duration_time || 0} tuần
                    </Typography>
                </Box>
            </StatBox>

            <StatBox>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', width: 40, height: 40 }}>
                    <AccessTimeOutlinedIcon fontSize="small"/>
                </Avatar>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>BẮT ĐẦU TỪ</Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        {dayjs(classData.startat).format('DD/MM/YYYY')}
                    </Typography>
                </Box>
            </StatBox>
        </Stack>
    );
});

// ==========================================
// MAIN COMPONENT
// ==========================================
function ClassDetailPage() {
    const { classId } = useParams();
    const navigate = useNavigate(); 
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    // Tối ưu: Dùng useMemo thay vì useState cho token tĩnh
    const token = useMemo(() => localStorage.getItem('token'), []);

    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentTab, setCurrentTab] = useState(() => {
        return sessionStorage.getItem(`classDetailTab_${classId}`) || 'students';
    }); 

    const fetchClassDetails = useCallback(async () => {
        if (!token || !classId) {
            setError("Thông tin truy cập không hợp lệ.");
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

    const handleChangeTab = useCallback((event, newValue) => {
        setCurrentTab(newValue);
        sessionStorage.setItem(`classDetailTab_${classId}`, newValue);
    }, [classId]);

    // Tối ưu: Render khung xương mượt mà hơn
    if (loading) {
        return (
            <PageWrapper>
                <Box sx={{ mb: 2 }}><Skeleton width={200} height={40} /></Box>
                <Box sx={{ mb: 4 }}>
                    <Skeleton width={300} height={50} />
                    <Skeleton width="60%" height={24} sx={{ mb: 3 }} />
                    <Stack direction="row" spacing={3} flexWrap="wrap">
                        {[1,2,3,4,5].map(i => <Skeleton key={i} variant="rounded" width={180} height={74} sx={{ borderRadius: 4 }} />)}
                    </Stack>
                </Box>
                <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: 4 }} />
            </PageWrapper>
        );
    }
    
    if (error) {
        return (
            <PageWrapper sx={{ alignItems: 'center', justifyContent: 'center' }}>
                <Alert severity="error" variant="filled" sx={{ borderRadius: 2, mb: 3 }}>{error}</Alert>
                <Button 
                    onClick={() => navigate('/tutor/classes')} 
                    variant="outlined" 
                    startIcon={<ArrowBackRoundedIcon />}
                    sx={{ fontWeight: 700, borderRadius: '10px' }}
                >
                    Quay lại danh sách
                </Button>
            </PageWrapper>
        );
    }

    if (!classData) return null;

    return (
        <PageWrapper>
            <Box sx={{ mb: 2, flexShrink: 0 }}>
                <Button
                    onClick={() => navigate('/tutor/classes')}
                    startIcon={<ArrowBackRoundedIcon />}
                    color="inherit"
                    sx={{ 
                        textTransform: 'none', 
                        fontWeight: 700, 
                        color: 'text.secondary',
                        borderRadius: '10px', 
                        px: 2,
                        '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08) }
                    }}
                >
                    Quay lại danh sách lớp
                </Button>
            </Box>

            <Box sx={{ mb: 4, flexShrink: 0 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="h4" fontWeight="700" color="text.primary">
                        {classData.classname}
                    </Typography>
                    <StatusChip status={classData.status} />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, mb: 3, display: "block" }}>
                    {classData.description || "Chưa có mô tả chi tiết cho lớp học này."}
                </Typography>

                {/* Gọi Component đã Memoize */}
                <ClassStatsHeader classData={classData} theme={theme} />
            </Box>

            <PanelCard>
                <Box sx={{ borderBottom: 1, borderColor: isDark ? theme.palette.midnight?.border : 'divider', px: 2, pt: 1.5, bgcolor: 'background.paper', flexShrink: 0 }}>
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
                        <StyledTab label="Diễn đàn" value="threads" icon={<MessageRoundedIcon fontSize="small"/>} iconPosition="start" />
                    </Tabs>
                </Box>

                <ScrollableContent>
                    {/* Tối ưu render tab: React chỉ render component bên trong khi biểu thức là true */}
                    {currentTab === 'students' && <StudentsTab studentsData={classData.learning} classId={classId} token={token} onRefresh={fetchClassDetails} />}
                    {currentTab === 'schedule' && <ScheduleTab classId={classId} token={token} />}
                    {currentTab === 'documents' && <ResourceTab classId={classId} token={token} />}
                    {currentTab === 'assignments' && <AssignmentTab classId={classId} token={token} />}
                    {currentTab === 'threads' && <ThreadForum class_id={classId} />}
                </ScrollableContent>
            </PanelCard>
        </PageWrapper>
    );
}

export default memo(ClassDetailPage);