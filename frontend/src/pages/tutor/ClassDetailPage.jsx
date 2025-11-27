/* eslint-disable */
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams } from 'react-router-dom';
import { getClassDetails } from '../../services/ClassService';

import {
    Box, Typography, Paper, CircularProgress, Alert, Tabs, Tab, Container,
    Stack, Chip 
} from '@mui/material';
import { styled } from '@mui/material/styles';

import dayjs from 'dayjs';
import EventNoteIcon from '@mui/icons-material/EventNote'; 

import GroupIcon from '@mui/icons-material/Group';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TopicIcon from '@mui/icons-material/Topic';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import SubjectIcon from '@mui/icons-material/Subject';
import PendingIcon from '@mui/icons-material/Pending';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import StudentsTab from './StudentTab'; 
import ScheduleTab from './ScheduleTab'; 
import ResourceTab from './ResourceTab';
import AssignmentTab from './AssignmentTab';
const PageWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    minHeight: '80vh',
}));

const StatusChip = memo(({ status }) => {
    const statusMap = {
        pending: { label: "Chờ mở lớp", color: "warning", icon: <PendingIcon /> },
        ongoing: { label: "Đang diễn ra", color: "success", icon: <PlayCircleOutlineIcon /> },
        completed: { label: "Đã kết thúc", color: "default", icon: <CheckCircleIcon /> },
        cancelled: { label: "Đã hủy", color: "error", icon: <CancelIcon /> },
    };
    const { label, color, icon } = statusMap[status] || statusMap.pending;
    return <Chip icon={icon} label={label} color={color} size="small" />;
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
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }
    
    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    if (!classData) {
        return <Alert severity="warning" sx={{ mt: 2 }}>Không tìm thấy dữ liệu lớp.</Alert>;
    }

    return (
        <PageWrapper>
            <Box>
                <Stack 
                    direction={{ xs: 'column', md: 'row' }} 
                    spacing={2} 
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    mb={1}
                >
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        {classData.classname}
                    </Typography>
                    <StatusChip status={classData.status} />
                </Stack>
                
                <Stack direction="row" spacing={3} color="text.secondary" mt={1.5} flexWrap="wrap">
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                        <SchoolIcon fontSize="small" sx={{ mr: 1, opacity: 0.8 }} />
                        <Typography variant="body1">
                            Khối {classData.grade}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                        <SubjectIcon fontSize="small" sx={{ mr: 1, opacity: 0.8 }} />
                        <Typography variant="body1">
                            Môn {classData.subject}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                        <GroupIcon fontSize="small" sx={{ mr: 1, opacity: 0.8 }} />
                        <Typography variant="body1">
                            {classData.learning?.length || 0} / {classData.nb_of_student} học viên
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={3} color="text.secondary" mt={1.5} flexWrap="wrap">
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                        <EventNoteIcon fontSize="small" sx={{ mr: 1, opacity: 0.8 }} />
                        <Typography variant="body1">
                            Ngày tạo: {dayjs(classData.createdAt).format('DD/MM/YYYY')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                        <EventNoteIcon fontSize="small" sx={{ mr: 1, opacity: 0.8, color: 'success.main' }} />
                        <Typography variant="body1" fontWeight={500}>
                            Bắt đầu: {dayjs(classData.startat).format('DD/MM/YYYY')}
                        </Typography>
                    </Box>
                </Stack>
                
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    {classData.description}
                </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 2 }}>
                <Tabs value={currentTab} onChange={handleChangeTab} aria-label="Class Details Tabs">
                    <Tab label="Thành viên" value="students" icon={<GroupIcon />} iconPosition="start" />
                    <Tab label="Lịch học" value="schedule" icon={<CalendarMonthIcon />} iconPosition="start" />
                    <Tab label="Tài liệu" value="documents" icon={<TopicIcon />} iconPosition="start" />
                    <Tab label="Bài tập" value="assignments" icon={<AssignmentIcon />} iconPosition="start" />
                </Tabs>
            </Box>

            <Container maxWidth="lg" disableGutters>
                {currentTab === 'students' && (
                    <StudentsTab 
                        studentsData={classData.learning} 
                        classId={classId}
                        token={token}
                        onRefresh={fetchClassDetails} 
                    />
                )}
                
                {/* THAY THẾ PHẦN NÀY */}
                {currentTab === 'schedule' && (
                    <ScheduleTab 
                        classId={classId} 
                        token={token} 
                    />
                )}
                
                {currentTab === 'documents' && (
                    <ResourceTab 
                        classId={classId} 
                        token={token} 
                    />
                )}
                {currentTab === 'assignments' && (
                    <AssignmentTab 
                        classId={classId} 
                        token={token} 
                    />  
                )}
            </Container>

        </PageWrapper>
    );
}

export default memo(ClassDetailPage);