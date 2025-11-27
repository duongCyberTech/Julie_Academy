import React, { useState, useEffect, useCallback, memo } from 'react';
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

import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

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
    meeting_date: 2,
    startAt: '08:00',
    endAt: '09:30',
    link_meet: ''
};

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

    const handleAddSchedule = async () => {
        if (!formData.startAt || !formData.endAt) {
            showToast('Vui lòng chọn thời gian bắt đầu và kết thúc', 'warning');
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
            <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventRepeatIcon color="primary" /> Thiết lập lịch học
                </Typography>
                
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, md: 3 }}>
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
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleAddSchedule}
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} color="inherit"/> : <AddCircleOutlineIcon />}
                                sx={{ height: 40 }}
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
                                InputProps={{
                                    startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} />
                                }}
                            />
                        </Grid>
                    </Grid>
                </LocalizationProvider>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                    Lịch học hiện tại ({schedules.length})
                </Typography>
                {schedules.length > 0 && (
                    <Button 
                        color="error" 
                        size="small" 
                        startIcon={<DeleteSweepIcon />}
                        onClick={() => setDeleteDialog({ open: true, type: 'all' })}
                    >
                        Xóa tất cả
                    </Button>
                )}
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
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
                                    secondaryAction={
                                        <IconButton edge="end" onClick={() => setDeleteDialog({ open: true, type: 'single', id: item.schedule_id })}>
                                            <DeleteIcon color="action" />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                                <Chip 
                                                    label={getDayLabel(item.meeting_date)} 
                                                    color="primary" 
                                                    size="small" 
                                                    sx={{ fontWeight: 'bold', minWidth: 80 }}
                                                />
                                                <Typography variant="body1" fontWeight={500}>
                                                    {item.startAt} - {item.endAt}
                                                </Typography>
                                            </Stack>
                                        }
                                        secondary={
                                            item.link_meet ? (
                                                <Link href={item.link_meet} target="_blank" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <LinkIcon fontSize="small" /> Vào phòng học
                                                </Link>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">Chưa có link</Typography>
                                            )
                                        }
                                    />
                                </ListItem>
                                {index < schedules.length - 1 && <Divider />}
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Paper>

            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: null, id: null })}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {deleteDialog.type === 'all' 
                            ? "Bạn có chắc chắn muốn xóa toàn bộ lịch học không? Hành động này không thể hoàn tác."
                            : "Bạn có chắc chắn muốn xóa khung giờ học này không?"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, type: null, id: null })}>Hủy</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Xóa</Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={toast.open} 
                autoHideDuration={4000} 
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={toast.severity} variant="filled" onClose={() => setToast(prev => ({ ...prev, open: false }))}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default memo(ScheduleTab);