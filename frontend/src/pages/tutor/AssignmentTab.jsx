import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import {
    Box, Typography, Button, Paper, CircularProgress, Alert,
    Stack, Chip, Grid, Card, CardContent, CardActions,
    IconButton, Tooltip, Divider, LinearProgress
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import dayjs from 'dayjs';

import { getSessionsByClass } from '../../services/ExamService';
import { getExamSessionStats } from '../../services/DashboardTutorService'; // Import API tiến độ

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PendingIcon from '@mui/icons-material/Pending';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const HeaderBar = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3), 
    flexShrink: 0,
}));

const SessionCardStyled = styled(Card)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px', 
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`,
        boxShadow: isDark ? 'none' : '0px 2px 8px rgba(0,0,0,0.02)', 
        transition: 'all 0.2s',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: isDark
                ? `0 0 16px ${alpha(theme.palette.primary.main, 0.1)}`
                : '0px 8px 16px rgba(0,0,0,0.04)',
            border: `1px solid ${theme.palette.primary.main}`, 
        }
    };
});

const EmptyStatePaper = styled(Paper)(({ theme }) => ({
    flexGrow: 1,
    minHeight: '200px', 
    padding: theme.spacing(4), 
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed',
    borderColor: alpha(theme.palette.divider, 0.6),
    backgroundColor: 'transparent',
    borderRadius: '12px',
    marginTop: theme.spacing(1),
}));

const SessionCard = memo(({ session }) => {
    const now = dayjs();
    const start = dayjs(session.startAt);
    const end = dayjs(session.expireAt);
    let status, statusColor, statusIcon;

    if (now.isBefore(start)) {
        status = "Chưa mở";
        statusColor = "warning";
        statusIcon = <PendingIcon fontSize="small" sx={{ fontSize: 16 }} />;
    } else if (now.isAfter(end)) {
        status = "Đã kết thúc";
        statusColor = "default";
        statusIcon = <CheckCircleIcon fontSize="small" sx={{ fontSize: 16 }} />;
    } else {
        status = "Đang diễn ra";
        statusColor = "success";
        statusIcon = <PlayCircleOutlineIcon fontSize="small" sx={{ fontSize: 16 }} />;
    }

    const progressPercent = session.totalStudents > 0 ? (session.doneCount / session.totalStudents) * 100 : 0;
    const isCompleted = session.doneCount === session.totalStudents && session.totalStudents > 0;

    return (
        <SessionCardStyled>
            <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Chip
                        icon={statusIcon}
                        label={status}
                        color={statusColor}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, height: 24, fontSize: '0.75rem' }}
                    />
                    <Typography variant="caption" color="text.disabled" fontWeight={600}>
                        #{session.session_id}
                    </Typography>
                </Stack>
                
                <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom title={session.exam?.title} sx={{ mb: 1.5, lineHeight: 1.3 }}>
                    {session.exam?.title || "Bài tập không tên"}
                </Typography>
                
                <Stack spacing={0.5} flexGrow={1}>
                    <Typography variant="body2" color="text.secondary">
                        Loại: <Box component="span" fontWeight={600} color="text.primary">{session.exam_type === 'practice' ? 'Luyện tập' : 'Kiểm tra'}</Box>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Số câu: <Box component="span" fontWeight={600} color="text.primary">{session.exam?.total_ques} câu</Box>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Làm tối đa: <Box component="span" fontWeight={600} color="text.primary">{session.limit_taken} lần</Box>
                    </Typography>
                </Stack>

                {/* THÊM WIDGET TIẾN ĐỘ VÀO ĐÂY */}
                <Box sx={{ mt: 2, mb: 0.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            Tiến độ nộp bài
                        </Typography>
                        <Typography variant="body2" color={isCompleted ? "success.main" : "primary.main"} fontWeight={700}>
                            {session.doneCount} / {session.totalStudents}
                        </Typography>
                    </Stack>
                    <LinearProgress 
                        variant="determinate" 
                        value={progressPercent}
                        color={isCompleted ? "success" : "primary"}
                        sx={{ height: 6, borderRadius: '8px', bgcolor: (theme) => alpha(theme.palette.divider, 0.4) }}
                    />
                </Box>

                <Divider sx={{ my: 1.5, borderStyle: 'dashed', borderColor: (theme) => alpha(theme.palette.divider, 0.6) }} />

                <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight={500}>
                        Bắt đầu: {start.format('HH:mm DD/MM/YYYY')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight={500}>
                        Kết thúc: {end.format('HH:mm DD/MM/YYYY')}
                    </Typography>
                </Stack>
            </CardContent>
            
            <CardActions sx={{ 
                justifyContent: 'space-between', 
                px: 2.5, pb: 2, pt: 1.5, 
                bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.grey[50], 0.8),
                borderTop: '1px solid',
                borderColor: (theme) => alpha(theme.palette.divider, 0.6)
            }}>
                <Box>
                    <Tooltip title="Chỉnh sửa phiên (Chưa hỗ trợ)">
                        <span>
                            <IconButton size="small" disabled sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px', p: 0.5 }}>
                                <EditIcon fontSize="small" sx={{ fontSize: 18 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
                <Button 
                    size="small" 
                    variant="contained" 
                    color="primary" 
                    disableElevation
                    endIcon={<AssessmentIcon fontSize="small"/>}
                    sx={{ fontWeight: 600, borderRadius: '8px', textTransform: 'none' }}
                >
                    Xem kết quả
                </Button>
            </CardActions>
        </SessionCardStyled>
    );
});

function AssignmentTab({ classId, token }) {
    const navigate = useNavigate(); 
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssignedSessions = useCallback(async () => {
        if (!classId || !token) return;
        setLoading(true);
        setError(null);
        
        try {
            // Sử dụng Promise.allSettled để đảm bảo nếu API thống kê lỗi thì vẫn load được danh sách
            const [sessRes, progRes] = await Promise.allSettled([
                getSessionsByClass(classId, token),
                getExamSessionStats(token, classId, 365) // Set 365 ngày để lấy toàn bộ tiến độ trong 1 năm
            ]);

            let sessionData = [];
            let progressData = null;

            if (sessRes.status === 'fulfilled') sessionData = Array.isArray(sessRes.value) ? sessRes.value : [];
            else throw new Error("Không thể tải danh sách bài tập");

            if (progRes.status === 'fulfilled') progressData = progRes.value;

            // Xử lý map dữ liệu tiến độ
            const totalStudents = progressData?.total_students || 0;
            const progressMap = {};
            
            (progressData?.es_mapper || []).forEach(item => {
                if(item.exam_session?.session_id) {
                    progressMap[item.exam_session.session_id] = item.number_of_students_done || 0;
                }
            });

            // Gắn tiến độ vào từng bài tập
            const mergedSessions = sessionData.map(s => ({
                ...s,
                doneCount: progressMap[s.session_id] || 0,
                totalStudents: totalStudents
            }));

            setSessions(mergedSessions);
        } catch (err) {
            console.error("Fetch sessions error:", err);
            setError('Không thể tải danh sách bài tập.');
        } finally {
            setLoading(false);
        }
    }, [classId, token]);

    useEffect(() => { fetchAssignedSessions(); }, [fetchAssignedSessions]);
    
    const handleNavigateAssign = () => {
        navigate('/tutor/assignment');
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={30} />
        </Box>
    );

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>{error}</Alert>}

            <HeaderBar direction={{ xs: 'column', sm: 'row' }}>
                <Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                        Bài tập & Kiểm tra
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Quản lý các bài luyện tập và kiểm tra đã giao
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    size="small"
                    startIcon={<AddCircleOutlineIcon fontSize="small"/>} 
                    onClick={handleNavigateAssign}
                    sx={{ borderRadius: '8px', fontWeight: 600, px: 2, py: 1, mt: { xs: 2, sm: 0 }, textTransform: 'none' }} 
                >
                    Giao bài mới
                </Button>
            </HeaderBar>

            {sessions.length > 0 ? (
                <Grid container spacing={3} sx={{ pb: 2 }}>
                    {sessions.map(session => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={session.session_id}>
                            <SessionCard session={session} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <EmptyStatePaper elevation={0}>
                    <AssessmentIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1.5 }} />
                    <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                        Chưa giao bài tập nào
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, mb: 2.5, maxWidth: '80%' }}>
                        Lớp học này hiện tại chưa có bài kiểm tra hay luyện tập nào.
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<AddCircleOutlineIcon fontSize="small"/>} 
                        onClick={handleNavigateAssign}
                        sx={{ borderRadius: '8px', fontWeight: 600, px: 3, py: 1, textTransform: 'none' }}
                    >
                        Giao bài mới ngay
                    </Button>
                </EmptyStatePaper>
            )}
        </Box>
    );
}

export default React.memo(AssignmentTab);