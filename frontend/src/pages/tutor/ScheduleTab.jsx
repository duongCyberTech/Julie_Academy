import React, { useState, useEffect, useCallback, memo } from 'react';
<<<<<<< HEAD
import { getScheduleByClass, createSchedule, deleteSchedule } from '../../services/ClassService';
import {
    Box, Typography, Button, Paper, CircularProgress,
    Stack, Select, MenuItem, TextField, FormControl, InputLabel,
    List, ListItem, ListItemText, IconButton, Divider, Link,
    Grid, Snackbar, Alert, Dialog, DialogTitle, DialogContent, 
    DialogContentText, DialogActions, Chip
} from '@mui/material';

// Icons
=======
import { 
    Box, Typography, Button, Paper, CircularProgress,
    Stack, Select, MenuItem, TextField, FormControl, InputLabel,
    List, ListItem, ListItemText, IconButton, Divider, Link,
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, 
    DialogContentText, DialogActions, Chip, Grid
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

<<<<<<< HEAD
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
=======
import { getScheduleByClass, createSchedule, deleteSchedule } from '../../services/ClassService';

const DAY_OPTIONS = [
    { value: 2, label: 'Thứ 2' },
    { value: 3, label: 'Thứ 3' },
    { value: 4, label: 'Thứ 4' },
    { value: 5, label: 'Thứ 5' },
    { value: 6, label: 'Thứ 6' },
    { value: 7, label: 'Thứ 7' },
    { value: 8, label: 'Chủ Nhật' }
];

const INITIAL_STATE = {
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
    meeting_date: 2,
    startAt: '08:00',
    endAt: '09:30',
    link_meet: ''
};

<<<<<<< HEAD
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
=======
const ScheduleTab = ({ classId, token }) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, id: null });

    const fetchSchedules = useCallback(async () => {
        if (!classId || !token) return;
        setLoading(true);
        try {
            const data = await getScheduleByClass(classId, token);
            const sortedData = Array.isArray(data) ? data.sort((a, b) => {
                if (a.meeting_date !== b.meeting_date) return a.meeting_date - b.meeting_date;
                return a.startAt.localeCompare(b.startAt);
            }) : [];
            setSchedules(sortedData);
        } catch (error) {
            setSchedules([]);
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
        } finally {
            setLoading(false);
        }
    }, [classId, token]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

<<<<<<< HEAD
    // --- Form Handlers ---

    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleTimeChange = (name, newValue) => {
        setFormData(prev => ({ ...prev, [name]: dayjsToString(newValue) }));
=======
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTimeChange = (name, newValue) => {
        setFormData(prev => ({ 
            ...prev, 
            [name]: newValue ? newValue.format('HH:mm') : '' 
        }));
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
    };

    const showToast = (message, severity = 'success') => {
        setToast({ open: true, message, severity });
    };

<<<<<<< HEAD
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
=======
    const handleAddSchedule = async () => {
        if (!formData.startAt || !formData.endAt) {
            showToast('Vui lòng chọn thời gian bắt đầu và kết thúc', 'warning');
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
            return;
        }

        setSubmitting(true);
        try {
            await createSchedule(classId, [formData], token);
<<<<<<< HEAD
            showToast('Thêm lịch học thành công!');
            setFormData(INITIAL_FORM_STATE);
            fetchSchedules();
        } catch (err) {
            showToast(err.message || 'Lỗi khi thêm lịch học.', 'error');
=======
            showToast('Thêm lịch học thành công');
            setFormData(INITIAL_STATE);
            fetchSchedules();
        } catch (error) {
            showToast(error.message || 'Thêm thất bại', 'error');
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
        } finally {
            setSubmitting(false);
        }
    };

<<<<<<< HEAD
    // --- Delete Handlers ---

    const openDeleteDialog = (type, id = null) => {
        setDeleteDialog({ open: true, type, id });
    };

    const handleConfirmDelete = async () => {
        const { type, id } = deleteDialog;
        setDeleteDialog({ open: false, type: null, id: null }); // Close immediately for UX
=======
    const confirmDelete = async () => {
        const { type, id } = deleteDialog;
        setDeleteDialog({ open: false, type: null, id: null });
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
        
        try {
            if (type === 'all') {
                await deleteSchedule(classId, true, [], token);
<<<<<<< HEAD
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
=======
                showToast('Đã xóa toàn bộ lịch học');
            } else {
                await deleteSchedule(classId, false, [id], token);
                showToast('Đã xóa lịch học');
            }
            fetchSchedules();
        } catch (error) {
            showToast('Xóa thất bại', 'error');
        }
    };

    const getDayLabel = (val) => DAY_OPTIONS.find(d => d.value === Number(val))?.label || 'N/A';

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventRepeatIcon color="primary" /> Thiết lập lịch học
                </Typography>
                
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, md: 3 }}>
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
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
<<<<<<< HEAD
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
=======
                        <Grid size={{ xs: 6, md: 3 }}>
                            <TimePicker
                                label="Bắt đầu"
                                value={dayjs(formData.startAt, 'HH:mm')}
                                onChange={(val) => handleTimeChange('startAt', val)}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                ampm={false}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <TimePicker
                                label="Kết thúc"
                                value={dayjs(formData.endAt, 'HH:mm')}
                                onChange={(val) => handleTimeChange('endAt', val)}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                ampm={false}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleAddSchedule}
<<<<<<< HEAD
                                startIcon={submitting ? <CircularProgress size={20} color="inherit"/> : <AddCircleOutlineIcon />}
                                disabled={submitting}
=======
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} color="inherit"/> : <AddCircleOutlineIcon />}
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                                sx={{ height: 40 }}
                            >
                                Thêm lịch
                            </Button>
                        </Grid>
<<<<<<< HEAD
                        
                        <Grid item xs={12}>
                            <TextField
                                label="Link Google Meet / Zoom (Tùy chọn)"
=======
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Link Google Meet / Zoom"
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                                name="link_meet"
                                value={formData.link_meet}
                                onChange={handleFormChange}
                                size="small"
                                fullWidth
<<<<<<< HEAD
                                placeholder="https://meet.google.com/..."
=======
                                placeholder="https://..."
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                                InputProps={{
                                    startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} />
                                }}
                            />
                        </Grid>
                    </Grid>
                </LocalizationProvider>
            </Paper>

<<<<<<< HEAD
            {/* 2. Danh sách Lịch */}
=======
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                    Lịch học hiện tại ({schedules.length})
                </Typography>
                {schedules.length > 0 && (
                    <Button 
<<<<<<< HEAD
                        size="small" 
                        color="error" 
                        startIcon={<DeleteSweepIcon />}
                        onClick={() => openDeleteDialog('all')}
                        sx={{ textTransform: 'none' }}
=======
                        color="error" 
                        size="small" 
                        startIcon={<DeleteSweepIcon />}
                        onClick={() => setDeleteDialog({ open: true, type: 'all' })}
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                    >
                        Xóa tất cả
                    </Button>
                )}
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <List disablePadding>
<<<<<<< HEAD
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
=======
                    {loading ? (
                        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : schedules.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">Chưa có lịch học nào.</Typography>
                        </Box>
                    ) : (
                        schedules.map((item, index) => (
                            <React.Fragment key={item.schedule_id}>
                                <ListItem
                                    secondaryAction={
                                        <IconButton edge="end" onClick={() => setDeleteDialog({ open: true, type: 'single', id: item.schedule_id })}>
                                            <DeleteIcon color="action" />
                                        </IconButton>
                                    }
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                                >
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                                <Chip 
<<<<<<< HEAD
                                                    label={DAY_MAP[sched.meeting_date]} 
                                                    color="primary" 
                                                    size="small" 
                                                    variant="soft" // Nếu dùng theme Joy, nếu Material thì bỏ prop này
                                                    sx={{ fontWeight: 'bold', minWidth: 60 }}
                                                />
                                                <Typography variant="body1" fontWeight={500}>
                                                    {formatTimeDisplay(sched.startAt)} - {formatTimeDisplay(sched.endAt)}
=======
                                                    label={getDayLabel(item.meeting_date)} 
                                                    color="primary" 
                                                    size="small" 
                                                    sx={{ fontWeight: 'bold', minWidth: 80 }}
                                                />
                                                <Typography variant="body1" fontWeight={500}>
                                                    {item.startAt} - {item.endAt}
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                                                </Typography>
                                            </Stack>
                                        }
                                        secondary={
<<<<<<< HEAD
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
=======
                                            item.link_meet ? (
                                                <Link href={item.link_meet} target="_blank" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <LinkIcon fontSize="small" /> Vào phòng học
                                                </Link>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">Chưa có link</Typography>
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                                            )
                                        }
                                    />
                                </ListItem>
<<<<<<< HEAD
                                {index < schedules.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                Lớp này chưa có lịch học cố định nào.
                            </Typography>
                        </Box>
=======
                                {index < schedules.length - 1 && <Divider />}
                            </React.Fragment>
                        ))
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                    )}
                </List>
            </Paper>

<<<<<<< HEAD
            {/* 3. Dialogs & Toasts */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}>
=======
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: null, id: null })}>
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {deleteDialog.type === 'all' 
<<<<<<< HEAD
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
=======
                            ? "Bạn có chắc chắn muốn xóa toàn bộ lịch học không? Hành động này không thể hoàn tác."
                            : "Bạn có chắc chắn muốn xóa khung giờ học này không?"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, type: null, id: null })}>Hủy</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Xóa</Button>
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={toast.open} 
                autoHideDuration={4000} 
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
<<<<<<< HEAD
                <Alert onClose={() => setToast(prev => ({ ...prev, open: false }))} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
=======
                <Alert severity={toast.severity} variant="filled" onClose={() => setToast(prev => ({ ...prev, open: false }))}>
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
<<<<<<< HEAD
}
=======
};
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268

export default memo(ScheduleTab);