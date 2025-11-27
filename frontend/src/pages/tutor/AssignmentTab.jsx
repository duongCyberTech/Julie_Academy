/* eslint-disable */
import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    Box, Typography, Button, Paper, CircularProgress, Alert,
    Stack, Chip, Grid, Card, CardContent, CardActions,
    IconButton, Tooltip, SvgIcon, Dialog, DialogTitle, DialogContent,
    DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { getMyExams, createExamSession } from '../../services/ExamService';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PendingIcon from '@mui/icons-material/Pending';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const MOCK_SESSIONS = [
    {
        session_id: 1,
        exam: { exam_id: 'exam-1', title: 'Kiểm tra 15 phút - Chương 1' },
        startAt: dayjs().subtract(1, 'day').toISOString(), // Hôm qua
        expireAt: dayjs().add(1, 'day').toISOString(), // Ngày mai
        limit_taken: 1,
        exam_type: 'practice',
    },
    {
        session_id: 2,
        exam: { exam_id: 'exam-2', title: 'Kiểm tra Giữa kỳ' },
        startAt: dayjs().add(2, 'day').toISOString(), // Tương lai
        expireAt: dayjs().add(3, 'day').toISOString(), // Tương lai
        limit_taken: 1,
        exam_type: 'test',
    },
    {
        session_id: 3,
        exam: { exam_id: 'exam-1', title: 'Kiểm tra 15 phút - Chương 1 (Lần 2)' },
        startAt: dayjs().subtract(3, 'day').toISOString(), // Quá khứ
        expireAt: dayjs().subtract(2, 'day').toISOString(), // Quá khứ
        limit_taken: 2,
        exam_type: 'practice',
    }
];
// --- Kết thúc Mock Data ---


// --- Component con: Popup Giao bài (Cho 1 lớp) ---
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

    // Tải danh sách các "Đề thi gốc"
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
        if (!selectedExamId) {
            setError("Vui lòng chọn một đề thi.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const sessionData = {
            startAt: startAt.toISOString(),
            expireAt: expireAt.toISOString(),
            limit_taken: Number(limitTaken),
            exam_type: examType,
        };
        
        try {
            // Gọi API: Gán examId này cho [classId] này
            // API của bạn (`createExamSession`) nhận vào một MẢNG các lớp học
            // Vì vậy, chúng ta truyền một mảng chỉ chứa 1 classId
            await createExamSession(selectedExamId, [classId], sessionData, token);
            
            onRefresh(); // Tải lại danh sách
            onClose(); // Đóng popup
        } catch (err) {
            setError(err.response?.data?.message || "Giao bài thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Reset form khi đóng
    const handleClose = () => {
        setError(null);
        setSelectedExamId('');
        setStartAt(dayjs());
        setExpireAt(dayjs().add(1, 'hour'));
        setLimitTaken(1);
        setExamType('practice');
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
                        
                        <DateTimePicker
                            label="Thời gian bắt đầu"
                            value={startAt}
                            onChange={(newValue) => setStartAt(newValue)}
                        />
                        
                        <DateTimePicker
                            label="Thời gian kết thúc"
                            value={expireAt}
                            onChange={(newValue) => setExpireAt(newValue)}
                        />
                        
                        <TextField
                            label="Số lần làm bài tối đa"
                            name="limit_taken"
                            type="number"
                            value={limitTaken}
                            onChange={(e) => setLimitTaken(Math.max(1, parseInt(e.target.value, 10)))}
                        />

                        <FormControl fullWidth>
                            <InputLabel id="type-select-label">Loại bài</InputLabel>
                            <Select
                                labelId="type-select-label"
                                value={examType}
                                label="Loại bài"
                                onChange={(e) => setExamType(e.target.value)}
                            >
                                <MenuItem value="practice">Luyện tập</MenuItem>
                                <MenuItem value="test">Kiểm tra (tính điểm)</MenuItem>
                            </Select>
                        </FormControl>

                    </Stack>
                </LocalizationProvider>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleClose} disabled={isSubmitting}>Hủy</Button>
                <Button 
                    variant="contained" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || loadingExams}
                >
                    {isSubmitting ? "Đang giao..." : "Xác nhận giao"}
                </Button>
            </DialogActions>
        </Dialog>
    );
});


// --- Component con: Card hiển thị Session ---
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
        <Grid size={{ xs: 12 ,sm: 6, md: 4}}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Chip
                        icon={statusIcon}
                        label={status}
                        color={statusColor}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1.5 }}
                    />
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        {session.exam.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Loại: {session.exam_type === 'practice' ? 'Luyện tập' : 'Kiểm tra'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Làm tối đa: {session.limit_taken} lần
                    </Typography>
                     <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                        Bắt đầu: {start.format('HH:mm DD/MM/YYYY')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Kết thúc: {end.format('HH:mm DD/MM/YYYY')}
                    </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', p: 2, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04) }}>
                    <Box>
                        <Tooltip title="Chỉnh sửa phiên (Chưa hỗ trợ)">
                            <span>
                                <IconButton size="small" disabled><EditIcon /></IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        endIcon={<AssessmentIcon />}
                    >
                        Xem kết quả
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    );
});

// --- Component chính: AssignmentTab ---
function AssignmentTab({ classId, token }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    // Hàm tải danh sách các bài đã giao
    const fetchAssignedSessions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // *** CẢNH BÁO: BẠN CHƯA CÓ API NÀY ***
            // Bạn cần tạo API GET /exam/session/get/class/:class_id
            // const data = await getSessionsByClassId(classId, token); 
            
            // Dùng MOCK DATA
            await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập API delay
            setSessions(MOCK_SESSIONS);

        } catch (err) {
            setError('Không thể tải danh sách bài tập.');
        } finally {
            setLoading(false);
        }
    }, [classId, token]);

    useEffect(() => {
        fetchAssignedSessions();
    }, [fetchAssignedSessions]);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);
    const handleRefresh = () => fetchAssignedSessions(); // Tải lại danh sách sau khi tạo

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleOpenDialog}
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
                !loading && ( // Chỉ hiển thị khi không loading
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 4, textAlign: 'center', borderColor: 'divider',
                            backgroundColor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                        }}
                    >
                        <AssessmentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                        <Typography variant="h6" fontWeight={600}>
                            Chưa giao bài tập nào
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                            Nhấn "Giao bài mới" để chọn đề thi và gán cho lớp học này.
                        </Typography>
                    </Paper>
                )
            )}

            {/* Dialog/Popup */}
            <AssignExamDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onRefresh={handleRefresh}
                classId={classId} // Truyền classId vào popup
                token={token}
            />
        </Box>
    );
}

export default React.memo(AssignmentTab);