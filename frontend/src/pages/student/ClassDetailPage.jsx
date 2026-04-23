import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassDetails } from '../../services/ClassService';

import {
    Box, Typography, Paper, Alert, Tabs, Tab,
    Stack, Chip, Skeleton, Avatar, Button, useTheme, Grid
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';

import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'; 
import TimelapseOutlinedIcon from '@mui/icons-material/TimelapseOutlined'; 
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import ClassmatesTab from './ClassmatesTab'; 
import StudentResourceTab from './ResourcesTab';
import StudentClassAssignmentTab from './AssignmentTab';
import ThreadForum from '../../components/thread/ThreadForum';

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
        [theme.breakpoints.down('md')]: {
            margin: theme.spacing(1),
            padding: theme.spacing(2),
        }
    };
});

const HeroBanner = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        position: 'relative',
        padding: theme.spacing(4),
        borderRadius: '24px',
        background: isDark 
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.4)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.15)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.primary.main, 0.1)}`,
        marginBottom: theme.spacing(4),
        overflow: 'hidden',
        boxShadow: isDark ? 'none' : `0 12px 32px ${alpha(theme.palette.primary.main, 0.05)}`,
    };
});

const StatCard = styled(Paper)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
        borderRadius: '16px',
        backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.6) : '#FFFFFF',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.4)}`,
        boxShadow: isDark ? 'none' : `0 4px 12px ${alpha(theme.palette.common.black, 0.02)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        height: '100%',
        backdropFilter: 'blur(8px)',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: isDark 
                ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}` 
                : `0 12px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
            borderColor: alpha(theme.palette.primary.main, 0.3),
        }
    };
});

const ContentContainer = styled(Paper)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        borderRadius: '20px',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minHeight: 0,
        overflow: 'hidden',
        boxShadow: isDark ? 'none' : `0 4px 24px ${alpha(theme.palette.common.black, 0.02)}`,
    };
});

const StyledTab = styled(Tab)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.95rem',
        minHeight: 56,
        padding: theme.spacing(0, 3),
        marginRight: theme.spacing(1),
        borderRadius: '12px 12px 0 0',
        color: theme.palette.text.secondary,
        transition: 'all 0.2s',
        '&.Mui-selected': {
            color: theme.palette.primary.main,
            backgroundColor: isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.04),
        },
        '&:hover:not(.Mui-selected)': {
            backgroundColor: isDark ? alpha(theme.palette.text.primary, 0.05) : alpha(theme.palette.primary.main, 0.02),
            color: theme.palette.text.primary,
        }
    };
});

const ScrollableContent = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        flexGrow: 1,
        overflowY: 'auto',
        backgroundColor: isDark ? alpha(theme.palette.background.default, 0.3) : '#F8FAFC',
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

const StatusChip = memo(({ status }) => {
    const theme = useTheme();
    const config = {
        pending: { label: "Chờ mở lớp", color: "warning", icon: <PendingActionsIcon fontSize="small"/> },
        ongoing: { label: "Đang diễn ra", color: "success", icon: <PlayCircleOutlineIcon fontSize="small"/> },
        // Đã sửa "default" thành "secondary" để match với palette
        completed: { label: "Đã kết thúc", color: "secondary", icon: <CheckCircleOutlineIcon fontSize="small"/> }, 
        cancelled: { label: "Đã hủy", color: "error", icon: <CancelOutlinedIcon fontSize="small"/> },
    };
    const { label, color, icon } = config[status] || config.pending;
    const isDark = theme.palette.mode === 'dark';
    
    return (
        <Chip 
            icon={icon} 
            label={label} 
            size="medium" 
            sx={{ 
                fontWeight: 700, 
                borderRadius: '10px',
                border: '1px solid', 
                borderColor: alpha(theme.palette[color].main, 0.3),
                bgcolor: alpha(theme.palette[color].main, isDark ? 0.15 : 0.1),
                color: isDark ? theme.palette[color].light : theme.palette[color].dark,
                px: 1,
                py: 2.5
            }} 
        />
    );
});

const StudentClassDetailPage = memo(() => {
    const { classId } = useParams();
    const navigate = useNavigate(); 
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    const [token] = useState(() => localStorage.getItem('token'));
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentTab, setCurrentTab] = useState(() => {
        return sessionStorage.getItem(`studentClassDetailTab_${classId}`) || 'classmates';
    }); 

    const fetchClassDetails = useCallback(async () => {
        if (!token || !classId) {
            setError("Thông tin xác thực không hợp lệ.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await getClassDetails(classId, token);
            setClassData(response);
        } catch (err) {
            setError("Không thể tải chi tiết lớp học. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }, [token, classId]);

    useEffect(() => {
        fetchClassDetails();
    }, [fetchClassDetails]);

    const handleChangeTab = useCallback((event, newValue) => {
        setCurrentTab(newValue);
        sessionStorage.setItem(`studentClassDetailTab_${classId}`, newValue);
    }, [classId]);

    const handleGoBack = useCallback(() => {
        navigate('/student/classes');
    }, [navigate]);

    if (loading) {
        return (
            <PageWrapper>
                <Box mb={2}><Skeleton width={150} height={40} sx={{ borderRadius: 2 }} /></Box>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '24px', mb: 4 }} />
                <Skeleton variant="rectangular" sx={{ flexGrow: 1, borderRadius: '20px' }} />
            </PageWrapper>
        );
    }
    
    if (error) {
        return (
            <PageWrapper sx={{ alignItems: 'center', justifyContent: 'center' }}>
                <Alert severity="error" variant="filled" sx={{ borderRadius: 3, mb: 3, px: 4, py: 2 }}>{error}</Alert>
                <Button 
                    onClick={handleGoBack} 
                    variant="outlined" 
                    startIcon={<ArrowBackRoundedIcon />}
                    sx={{ fontWeight: 700, borderRadius: '12px', px: 3 }} 
                >
                    Quay lại danh sách
                </Button>
            </PageWrapper>
        );
    }

    if (!classData) return null;

    const tutorName = classData.tutor?.user ? `${classData.tutor.user.lname || ''} ${classData.tutor.user.fname || ''}`.trim() : 'Đang cập nhật';
    const tutorAvatar = classData.tutor?.user?.avata_url || classData.tutor?.user?.avatar_url;

    return (
        <PageWrapper>
            <Box sx={{ mb: 2, flexShrink: 0 }}>
                <Button
                    onClick={handleGoBack}
                    startIcon={<ArrowBackRoundedIcon />}
                    color="inherit"
                    disableRipple
                    sx={{ 
                        textTransform: 'none', 
                        fontWeight: 700,
                        color: 'text.secondary',
                        borderRadius: '12px',
                        px: 2,
                        py: 1,
                        transition: 'all 0.2s',
                        '&:hover': { 
                            color: 'primary.main', 
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            transform: 'translateX(-4px)'
                        }
                    }}
                >
                    Danh sách lớp của tôi
                </Button>
            </Box>

            <HeroBanner>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Stack 
                        direction={{ xs: 'column', md: 'row' }} 
                        alignItems={{ xs: 'flex-start', md: 'flex-start' }} 
                        justifyContent="space-between" 
                        spacing={3} 
                        mb={4}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={2} mb={1.5}>
                                <Typography variant="h4" fontWeight="700" color="text.primary" sx={{ letterSpacing: '-0.5px' }}>
                                    {classData.classname}
                                </Typography>
                                <StatusChip status={classData.status} />
                            </Stack>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '700px', lineHeight: 1.6 }}>
                                {classData.description || "Chào mừng bạn đến với lớp học. Hãy thường xuyên kiểm tra bài tập và tài liệu nhé!"}
                            </Typography>
                        </Box>

                        <Paper
                            elevation={0}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 1.5,
                                pr: 4,
                                borderRadius: '16px',
                                background: isDark 
                                    ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)` 
                                    : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
                                border: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.2)}`,
                                boxShadow: isDark ? 'none' : `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                                backdropFilter: 'blur(12px)',
                                flexShrink: 0
                            }}
                        >
                            <Avatar 
                                src={tutorAvatar}
                                sx={{ 
                                    bgcolor: alpha(theme.palette.primary.main, 0.15), 
                                    color: 'primary.main', 
                                    width: 52, 
                                    height: 52, 
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    border: `2px solid ${theme.palette.background.paper}`
                                }}
                            >
                                {classData.tutor?.user?.fname ? classData.tutor.user.fname.charAt(0).toUpperCase() : <PersonOutlinedIcon />}
                            </Avatar>
                            <Box>
                                <Stack direction="row" alignItems="center" spacing={0.5} mb={0.25}>
                                    <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ letterSpacing: '0.5px' }}>
                                        GIÁO VIÊN PHỤ TRÁCH
                                    </Typography>
                                    <VerifiedRoundedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                </Stack>
                                <Typography variant="subtitle1" color="text.primary" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                    {tutorName}
                                </Typography>
                            </Box>
                        </Paper>
                    </Stack>

                    <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 10 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <StatCard>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 44, height: 44, borderRadius: '12px' }}>
                                    <SchoolOutlinedIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>KHỐI LỚP</Typography>
                                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">Lớp {classData.grade}</Typography>
                                </Box>
                            </StatCard>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <StatCard>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', width: 44, height: 44, borderRadius: '12px' }}>
                                    <MenuBookOutlinedIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>MÔN HỌC</Typography>
                                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">{classData.subject}</Typography>
                                </Box>
                            </StatCard>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <StatCard>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', width: 44, height: 44, borderRadius: '12px' }}>
                                    <GroupOutlinedIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>SĨ SỐ</Typography>
                                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">{classData.nb_of_student} bạn</Typography>
                                </Box>
                            </StatCard>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <StatCard>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', width: 44, height: 44, borderRadius: '12px' }}>
                                    <TimelapseOutlinedIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>THỜI LƯỢNG</Typography>
                                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">{classData.duration_time || 0} tuần</Typography>
                                </Box>
                            </StatCard>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <StatCard>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', width: 44, height: 44, borderRadius: '12px' }}>
                                    <AccessTimeOutlinedIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>KHAI GIẢNG</Typography>
                                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                        {dayjs(classData.startat).format('DD/MM/YYYY')}
                                    </Typography>
                                </Box>
                            </StatCard>
                        </Grid>
                    </Grid>
                </Box>
            </HeroBanner>

            <ContentContainer>
                <Box sx={{ 
                    borderBottom: 1, 
                    borderColor: isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6), 
                    px: 3, 
                    pt: 2, 
                    bgcolor: 'background.paper', 
                    flexShrink: 0 
                }}>
                    <Tabs 
                        value={currentTab} 
                        onChange={handleChangeTab} 
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ 
                            minHeight: 56,
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: '3px 3px 0 0'
                            }
                        }}
                    >
                        <StyledTab label="Bảng tin" value="threads" icon={<MessageRoundedIcon fontSize="small"/>} iconPosition="start" />
                        <StyledTab label="Nhiệm vụ" value="assignments" icon={<AssignmentOutlinedIcon fontSize="small"/>} iconPosition="start" />
                        <StyledTab label="Kho tài liệu" value="documents" icon={<TopicOutlinedIcon fontSize="small"/>} iconPosition="start" />
                        <StyledTab label="Bạn cùng tiến" value="classmates" icon={<GroupOutlinedIcon fontSize="small"/>} iconPosition="start" />
                    </Tabs>
                </Box>

                <ScrollableContent>
                    {currentTab === 'threads' && <ThreadForum class_id={classId} />}
                    {currentTab === 'assignments' && <StudentClassAssignmentTab classId={classId} token={token} />}
                    {currentTab === 'documents' && <StudentResourceTab classId={classId} token={token} />}
                    {currentTab === 'classmates' && <ClassmatesTab studentsData={classData.learning} />}
                </ScrollableContent>
            </ContentContainer>
        </PageWrapper>
    );
});

export default StudentClassDetailPage;