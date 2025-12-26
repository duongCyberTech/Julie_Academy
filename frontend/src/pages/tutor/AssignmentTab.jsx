/* eslint-disable */
import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    Box, Typography, Button, Paper, CircularProgress, Alert,
    Stack, Chip, Grid, Card, CardContent, CardActions,
    IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
    DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { getMyExams, createExamSession, getSessionsByClass } from '../../services/ExamService';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PendingIcon from '@mui/icons-material/Pending';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// --- COMPONENT CON: SESSION CARD ---
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

// --- COMPONENT CON: POPUP GIAO BÀI ---
const AssignExamDialog = memo(({ open, onClose, onRefresh, classId, token }) => {
    const [availableExams, setAvailableExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [selectedExamId, setSelectedExamId] = useState('');
    const [startAt, setStartAt] = useState(dayjs());
    const [expireAt, setExpireAt] = useState(dayjs().add(1, 'hour'));
    const [limitTaken, setLimitTaken] = useState(1);
    const [examType, setExamType] = useState('practice');

    useEffect(() => {
        if (!open) return;
        const fetchMasterExams = async () => {
            setLoadingExams(true);
            try {
                const exams = await getMyExams(token);
                setAvailableExams(Array.isArray(exams) ? exams : []);
            } catch (err) {
                setError("Không thể tải danh sách đề thi.");
            } finally {
                setLoadingExams(false);
            }
        };
        fetchMasterExams();
    }, [open, token]);

    const handleSubmit = async () => {
        if (!selectedExamId) return setError("Vui lòng chọn một đề thi.");
        setIsSubmitting(true);
        setError(null);

        const sessionData = {
            startAt: startAt.toISOString(),
            expireAt: expireAt.toISOString(),
            limit_taken: Number(limitTaken),
            exam_type: examType,
        };
        
        try {
            await createExamSession(selectedExamId, [classId], sessionData, token);
            onRefresh();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Giao bài thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
        setError(null); setSelectedExamId(''); setStartAt(dayjs()); 
        setExpireAt(dayjs().add(1, 'hour')); setLimitTaken(1); setExamType('practice');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle fontWeight={600}>Giao bài mới cho lớp này</DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
                        
                        <FormControl fullWidth disabled={loadingExams}>
                            <InputLabel id="exam-select-label">Chọn đề thi gốc</InputLabel>
                            <Select
                                labelId="exam-select-label"
                                value={selectedExamId}
                                label="Chọn đề thi gốc"
                                onChange={(e) => setSelectedExamId(e.target.value)}
                            >
                                {loadingExams ? (
                                    <MenuItem disabled><em>Đang tải đề thi...</em></MenuItem>
                                ) : (
                                    availableExams.map(exam => (
                                        <MenuItem key={exam.exam_id} value={exam.exam_id}>
                                            {exam.title} ({exam.total_ques} câu)
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                        
                        <DateTimePicker label="Thời gian bắt đầu" value={startAt} onChange={(n) => setStartAt(n)} />
                        <DateTimePicker label="Thời gian kết thúc" value={expireAt} onChange={(n) => setExpireAt(n)} />
                        <TextField
                            label="Số lần làm bài tối đa" type="number" value={limitTaken}
                            onChange={(e) => setLimitTaken(Math.max(1, parseInt(e.target.value, 10)))}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Loại bài</InputLabel>
                            <Select value={examType} label="Loại bài" onChange={(e) => setExamType(e.target.value)}>
                                <MenuItem value="practice">Luyện tập</MenuItem>
                                <MenuItem value="test">Kiểm tra (tính điểm)</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </LocalizationProvider>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} disabled={isSubmitting}>Hủy</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting || loadingExams}>
                    {isSubmitting ? "Đang giao..." : "Xác nhận giao"}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

// --- COMPONENT CHÍNH ---
function AssignmentTab({ classId, token }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

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

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenDialog(true)}>
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

            <AssignExamDialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)} 
                onRefresh={fetchAssignedSessions} 
                classId={classId} 
                token={token} 
            />
        </Box>
    );
}

export default React.memo(AssignmentTab);