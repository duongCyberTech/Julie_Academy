import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import {
    Box, Typography, Button, Paper, CircularProgress, Alert,
    Stack, Chip, Grid, Card, CardContent, CardActions,
    IconButton, Tooltip, Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import dayjs from 'dayjs';

import { getSessionsByClass } from '../../services/ExamService';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PendingIcon from '@mui/icons-material/Pending';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SessionCard = memo(({ session }) => {
    const now = dayjs();
    const start = dayjs(session.startAt);
    const end = dayjs(session.expireAt);
    let status, statusColor, statusIcon;

    if (now.isBefore(start)) {
        status = "Chưa mở";
        statusColor = "warning";
        statusIcon = <PendingIcon />;
    } else if (now.isAfter(end)) {
        status = "Đã kết thúc";
        statusColor = "default";
        statusIcon = <CheckCircleIcon />;
    } else {
        status = "Đang diễn ra";
        statusColor = "success";
        statusIcon = <PlayCircleOutlineIcon />;
    }

    return (
        <Grid item xs={12} sm={6} md={4}> 
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Chip
                            icon={statusIcon}
                            label={status}
                            color={statusColor}
                            size="small"
                            variant="outlined"
                        />
                        <Typography variant="caption" color="text.disabled">#{session.session_id}</Typography>
                    </Stack>
                    
                    <Typography variant="h6" fontWeight={600} gutterBottom title={session.exam?.title}>
                        {session.exam?.title || "Bài tập không tên"}
                    </Typography>
                    
                    <Stack spacing={0.5} mt={1}>
                        <Typography variant="body2" color="text.secondary">
                            Loại: <strong>{session.exam_type === 'practice' ? 'Luyện tập' : 'Kiểm tra'}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Số câu: {session.exam?.total_ques} câu
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Làm tối đa: {session.limit_taken} lần
                        </Typography>
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Stack spacing={0.5}>
                         <Typography variant="caption" color="text.secondary" display="block">
                            Bắt đầu: {start.format('HH:mm DD/MM/YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Kết thúc: {end.format('HH:mm DD/MM/YYYY')}
                        </Typography>
                    </Stack>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04) }}>
                    <Box>
                        <Tooltip title="Chỉnh sửa phiên (Chưa hỗ trợ)">
                            <span>
                                <IconButton size="small" disabled><EditIcon /></IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                    <Button size="small" variant="contained" color="primary" endIcon={<AssessmentIcon />}>
                        Xem kết quả
                    </Button>
                </CardActions>
            </Card>
        </Grid>
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
            const data = await getSessionsByClass(classId, token);
            console.log("Sessions Data:", data);
            setSessions(Array.isArray(data) ? data : []); 
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

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button 
                    variant="contained" 
                    startIcon={<AddCircleOutlineIcon />} 
                    onClick={handleNavigateAssign} 
                >
                    Giao bài mới
                </Button>
            </Box>

            {sessions.length > 0 ? (
                <Grid container spacing={3}>
                    {sessions.map(session => (
                        <SessionCard key={session.session_id} session={session} />
                    ))}
                </Grid>
            ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', backgroundColor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'grey.900' }}>
                    <AssessmentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                    <Typography variant="h6" fontWeight={600}>Chưa giao bài tập nào</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>Nhấn "Giao bài mới" để bắt đầu.</Typography>
                </Paper>
            )}
        </Box>
    );
}

export default React.memo(AssignmentTab);