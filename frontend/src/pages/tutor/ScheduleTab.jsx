import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
    Box, Typography, Button, Paper, CircularProgress,
    Stack, Select, MenuItem, TextField, FormControl, InputLabel,
    List, ListItem, ListItemText, IconButton, Divider, Link,
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, 
    DialogContentText, DialogActions, Chip, Grid, useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

import { getScheduleByClass, createSchedule, deleteSchedule } from '../../services/ClassService';

// Mở rộng dayjs để kiểm tra thời gian
dayjs.extend(isSameOrBefore);

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
    meeting_date: 2,
    startAt: '08:00',
    endAt: '09:30',
    link_meet: ''
};

const ScheduleTab = ({ classId, token }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

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
        } finally {
            setLoading(false);
        }
    }, [classId, token]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTimeChange = (name, newValue) => {
        setFormData(prev => ({ 
            ...prev, 
            [name]: newValue ? newValue.format('HH:mm') : '' 
        }));
    };

    const showToast = (message, severity = 'success') => {
        setToast({ open: true, message, severity });
    };

    // LOGIC KIỂM TRA THỜI GIAN ĐƯỢC THÊM VÀO ĐÂY
    const handleAddSchedule = async () => {
        if (!formData.startAt || !formData.endAt) {
            showToast('Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc', 'warning');
            return;
        }

        const startTime = dayjs(formData.startAt, 'HH:mm');
        const endTime = dayjs(formData.endAt, 'HH:mm');

        if (endTime.isSameOrBefore(startTime)) {
            showToast('Thời gian kết thúc phải lớn hơn thời gian bắt đầu!', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await createSchedule(classId, [formData], token);
            showToast('Thêm lịch học thành công');
            setFormData(INITIAL_STATE);
            fetchSchedules();
        } catch (error) {
            showToast(error.message || 'Thêm thất bại', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        const { type, id } = deleteDialog;
        setDeleteDialog({ open: false, type: null, id: null });
        
        try {
            if (type === 'all') {
                await deleteSchedule(classId, true, [], token);
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
            {/* FORM THÊM LỊCH HỌC */}
            <Paper 
                variant="outlined" 
                sx={{ 
                    p: 3, mb: 4, borderRadius: 3, 
                    bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.primary.main, 0.02),
                    borderColor: isDark ? theme.palette.midnight?.border : 'divider'
                }}
            >
                <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventRepeatIcon /> Thiết lập lịch học
                </Typography>
                
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                                <InputLabel>Ngày trong tuần</InputLabel>
                                <Select
                                    name="meeting_date"
                                    value={formData.meeting_date}
                                    label="Ngày trong tuần"
                                    onChange={handleFormChange}
                                >
                                    {DAY_OPTIONS.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value} sx={{ fontWeight: 500 }}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <TimePicker
                                label="Bắt đầu"
                                value={dayjs(formData.startAt, 'HH:mm')}
                                onChange={(val) => handleTimeChange('startAt', val)}
                                slotProps={{ textField: { size: 'small', fullWidth: true, sx: { bgcolor: 'background.paper', borderRadius: 1 } } }}
                                ampm={false}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <TimePicker
                                label="Kết thúc"
                                value={dayjs(formData.endAt, 'HH:mm')}
                                onChange={(val) => handleTimeChange('endAt', val)}
                                slotProps={{ textField: { size: 'small', fullWidth: true, sx: { bgcolor: 'background.paper', borderRadius: 1 } } }}
                                ampm={false}
                                minTime={dayjs(formData.startAt, 'HH:mm').add(1, 'minute')} // Tự động chặn chọn giờ nhỏ hơn trên UI
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleAddSchedule}
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} color="inherit"/> : <AddCircleOutlineIcon />}
                                sx={{ height: 40, borderRadius: 2, fontWeight: 700 }}
                            >
                                Thêm lịch
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Link Google Meet / Zoom"
                                name="link_meet"
                                value={formData.link_meet}
                                onChange={handleFormChange}
                                size="small"
                                fullWidth
                                placeholder="https://..."
                                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                                InputProps={{
                                    startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} />
                                }}
                            />
                        </Grid>
                    </Grid>
                </LocalizationProvider>
            </Paper>

            {/* DANH SÁCH LỊCH HỌC */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                    Lịch học hiện tại ({schedules.length})
                </Typography>
                {schedules.length > 0 && (
                    <Button 
                        color="error" 
                        size="small" 
                        startIcon={<DeleteSweepIcon />}
                        onClick={() => setDeleteDialog({ open: true, type: 'all' })}
                        sx={{ fontWeight: 600, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.08) }}
                    >
                        Xóa tất cả
                    </Button>
                )}
            </Box>

            <Paper 
                variant="outlined" 
                sx={{ 
                    borderRadius: 3, 
                    borderColor: isDark ? theme.palette.midnight?.border : 'divider',
                    bgcolor: 'background.paper',
                    overflow: 'hidden'
                }}
            >
                <List disablePadding>
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
                                    sx={{ 
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02) }
                                    }}
                                    secondaryAction={
                                        <IconButton 
                                            edge="end" 
                                            onClick={() => setDeleteDialog({ open: true, type: 'single', id: item.schedule_id })}
                                            sx={{ color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                                                <Chip 
                                                    label={getDayLabel(item.meeting_date)} 
                                                    color="primary" 
                                                    size="small" 
                                                    sx={{ fontWeight: 700, minWidth: 80, borderRadius: 1.5 }}
                                                />
                                                <Typography variant="body1" fontWeight={600} color="text.primary">
                                                    {item.startAt} - {item.endAt}
                                                </Typography>
                                            </Stack>
                                        }
                                        secondary={
                                            item.link_meet ? (
                                                <Link href={item.link_meet} target="_blank" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5, fontWeight: 500 }}>
                                                    <LinkIcon fontSize="small" /> Vào phòng học
                                                </Link>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled" sx={{ display: 'inline-block', mt: 0.5 }}>Chưa có link cuộc họp</Typography>
                                            )
                                        }
                                    />
                                </ListItem>
                                {index < schedules.length - 1 && <Divider sx={{ borderColor: isDark ? theme.palette.midnight?.border : 'divider' }} />}
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Paper>

            {/* DIALOG XÁC NHẬN XÓA */}
            <Dialog 
                open={deleteDialog.open} 
                onClose={() => setDeleteDialog({ open: false, type: null, id: null })}
                PaperProps={{ sx: { borderRadius: 3, p: 1, bgcolor: 'background.paper', backgroundImage: 'none' } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {deleteDialog.type === 'all' 
                            ? "Bạn có chắc chắn muốn xóa toàn bộ lịch học không? Hành động này không thể hoàn tác."
                            : "Bạn có chắc chắn muốn xóa khung giờ học này không?"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, type: null, id: null })} color="inherit" sx={{ fontWeight: 600 }}>Hủy</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" disableElevation sx={{ borderRadius: 2, fontWeight: 700 }}>Xóa</Button>
                </DialogActions>
            </Dialog>

            {/* TOAST THÔNG BÁO */}
            <Snackbar 
                open={toast.open} 
                autoHideDuration={4000} 
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={toast.severity} variant="filled" onClose={() => setToast(prev => ({ ...prev, open: false }))} sx={{ borderRadius: 2 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default memo(ScheduleTab);