import React, { useState, useEffect, useCallback, memo } from 'react';
import { getScheduleByClass, createSchedule, deleteSchedule } from '../../services/ClassService';
import {
    Box, Typography, Button, Paper, CircularProgress,
    Stack, Select, MenuItem, TextField, FormControl, InputLabel,
    List, ListItem, ListItemText, IconButton, Divider, Link,
    Grid, Snackbar, Alert, Dialog, DialogTitle, DialogContent, 
    DialogContentText, DialogActions, Chip
} from '@mui/material';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

// Date Utils
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

// --- Constants & Helpers ---
const DAY_MAP = {
    2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7', 8: 'Chủ Nhật'
};

const DAY_OPTIONS = Object.entries(DAY_MAP).map(([value, label]) => ({
    value: parseInt(value, 10), label
}));

const INITIAL_FORM_STATE = {
    meeting_date: 2,
    startAt: '08:00',
    endAt: '09:30',
    link_meet: ''
};

// Helper chuyển đổi giờ
const stringToDayjs = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    return dayjs().hour(hours).minute(minutes);
};

const dayjsToString = (dayjsObject) => {
    return dayjsObject ? dayjsObject.format('HH:mm') : '';
};

const formatTimeDisplay = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
};

// --- Main Component ---

const ScheduleTab = ({ classId, token }) => {
    // Data States
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // UI States
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, id: null }); // type: 'single' | 'all'

    // --- API Handlers ---

    const fetchSchedules = useCallback(async () => {
        if (!token || !classId) return;
        try {
            const data = await getScheduleByClass(classId, token);
            // Sắp xếp lịch theo thứ tự ngày trong tuần -> giờ bắt đầu
            const sorted = (data || []).sort((a, b) => {
                if (a.meeting_date !== b.meeting_date) return a.meeting_date - b.meeting_date;
                return a.startAt.localeCompare(b.startAt);
            });
            setSchedules(sorted);
        } catch (err) {
            showToast('Không thể tải lịch học.', 'error');
        } finally {
            setLoading(false);
        }
    }, [classId, token]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    // --- Form Handlers ---

    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleTimeChange = (name, newValue) => {
        setFormData(prev => ({ ...prev, [name]: dayjsToString(newValue) }));
    };

    const showToast = (message, severity = 'success') => {
        setToast({ open: true, message, severity });
    };

    const validateForm = () => {
        const start = stringToDayjs(formData.startAt);
        const end = stringToDayjs(formData.endAt);
        
        if (!start || !end) return "Vui lòng chọn giờ bắt đầu và kết thúc.";
        if (end.isBefore(start) || end.isSame(start)) return "Giờ kết thúc phải sau giờ bắt đầu.";
        return null;
    };

    const handleAddSchedule = async () => {
        const errorMsg = validateForm();
        if (errorMsg) {
            showToast(errorMsg, 'warning');
            return;
        }

        setSubmitting(true);
        try {
            await createSchedule(classId, [formData], token);
            showToast('Thêm lịch học thành công!');
            setFormData(INITIAL_FORM_STATE);
            fetchSchedules();
        } catch (err) {
            showToast(err.message || 'Lỗi khi thêm lịch học.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // --- Delete Handlers ---

    const openDeleteDialog = (type, id = null) => {
        setDeleteDialog({ open: true, type, id });
    };

    const handleConfirmDelete = async () => {
        const { type, id } = deleteDialog;
        setDeleteDialog({ open: false, type: null, id: null }); // Close immediately for UX
        
        try {
            if (type === 'all') {
                await deleteSchedule(classId, true, [], token);
                showToast('Đã xóa toàn bộ lịch học.', 'success');
            } else {
                await deleteSchedule(classId, false, [id], token);
                showToast('Đã xóa lịch học.', 'success');
            }
            fetchSchedules();
        } catch (err) {
            showToast('Xóa thất bại.', 'error');
        }
    };

    // --- Render ---

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            {/* 1. Form Thêm Lịch */}
            <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'background.default' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventRepeatIcon color="primary" /> Thiết lập lịch học
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Thêm các khung giờ học cố định hàng tuần cho lớp này.
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Ngày trong tuần</InputLabel>
                                <Select
                                    name="meeting_date"
                                    value={formData.meeting_date}
                                    label="Ngày trong tuần"
                                    onChange={handleFormChange}
                                >
                                    {DAY_OPTIONS.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TimePicker
                                label="Giờ bắt đầu"
                                value={stringToDayjs(formData.startAt)}
                                onChange={(val) => handleTimeChange('startAt', val)}
                                ampm={false} // Dùng định dạng 24h cho gọn
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TimePicker
                                label="Giờ kết thúc"
                                value={stringToDayjs(formData.endAt)}
                                onChange={(val) => handleTimeChange('endAt', val)}
                                ampm={false}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleAddSchedule}
                                startIcon={submitting ? <CircularProgress size={20} color="inherit"/> : <AddCircleOutlineIcon />}
                                disabled={submitting}
                                sx={{ height: 40 }}
                            >
                                Thêm lịch
                            </Button>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                label="Link Google Meet / Zoom (Tùy chọn)"
                                name="link_meet"
                                value={formData.link_meet}
                                onChange={handleFormChange}
                                size="small"
                                fullWidth
                                placeholder="https://meet.google.com/..."
                                InputProps={{
                                    startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} />
                                }}
                            />
                        </Grid>
                    </Grid>
                </LocalizationProvider>
            </Paper>

            {/* 2. Danh sách Lịch */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                    Lịch học hiện tại ({schedules.length})
                </Typography>
                {schedules.length > 0 && (
                    <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteSweepIcon />}
                        onClick={() => openDeleteDialog('all')}
                        sx={{ textTransform: 'none' }}
                    >
                        Xóa tất cả
                    </Button>
                )}
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <List disablePadding>
                    {schedules.length > 0 ? (
                        schedules.map((sched, index) => (
                            <React.Fragment key={sched.schedule_id}>
                                <ListItem
                                    secondaryAction={
                                        <IconButton edge="end" color="default" onClick={() => openDeleteDialog('single', sched.schedule_id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    }
                                    sx={{ py: 1.5 }}
                                >
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                                <Chip 
                                                    label={DAY_MAP[sched.meeting_date]} 
                                                    color="primary" 
                                                    size="small" 
                                                    variant="soft" // Nếu dùng theme Joy, nếu Material thì bỏ prop này
                                                    sx={{ fontWeight: 'bold', minWidth: 60 }}
                                                />
                                                <Typography variant="body1" fontWeight={500}>
                                                    {formatTimeDisplay(sched.startAt)} - {formatTimeDisplay(sched.endAt)}
                                                </Typography>
                                            </Stack>
                                        }
                                        secondary={
                                            sched.link_meet ? (
                                                <Link
                                                    href={sched.link_meet}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    underline="hover"
                                                    sx={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem', mt: 0.5 }}
                                                >
                                                    <LinkIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                    Vào phòng học
                                                </Link>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                                    Chưa cập nhật link phòng học
                                                </Typography>
                                            )
                                        }
                                    />
                                </ListItem>
                                {index < schedules.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                Lớp này chưa có lịch học cố định nào.
                            </Typography>
                        </Box>
                    )}
                </List>
            </Paper>

            {/* 3. Dialogs & Toasts */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {deleteDialog.type === 'all' 
                            ? "Bạn có chắc chắn muốn xóa TOÀN BỘ lịch học của lớp này? Hành động này không thể hoàn tác."
                            : "Bạn có chắc chắn muốn xóa khung giờ học này không?"
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>Hủy</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={toast.open} 
                autoHideDuration={4000} 
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setToast(prev => ({ ...prev, open: false }))} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default memo(ScheduleTab);