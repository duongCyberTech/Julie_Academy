/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import { getScheduleByClass, createSchedule, deleteSchedule } from '../../services/ClassService';
import {
    Box, Typography, Button, Paper, CircularProgress, Alert,
    Stack, Select, MenuItem, TextField, FormControl, InputLabel,
    List, ListItem, ListItemText, IconButton, Divider, Link
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LinkIcon from '@mui/icons-material/Link'; // Thêm icon link

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

// --- Helpers (Giữ nguyên) ---

const dayMap = {
    2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7', 8: 'Chủ Nhật'
};
const dayOptions = Object.entries(dayMap).map(([value, label]) => ({
    value: parseInt(value, 10), label
}));

const formatTimeToAMPM = (timeString) => {
    if (!timeString) return '';
    try {
        const [hours, minutes] = timeString.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        let hours12 = hours % 12;
        if (hours12 === 0) hours12 = 12;
        const paddedMinutes = String(minutes).padStart(2, '0');
        return `${hours12}:${paddedMinutes} ${ampm}`;
    } catch (e) { return timeString; }
};

const stringToDayjs = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    return dayjs().hour(hours).minute(minutes);
};

const dayjsToString = (dayjsObject) => {
    if (!dayjsObject) return null;
    return dayjsObject.format('HH:mm');
};

// SỬA 1: Thêm link_meet vào trạng thái ban đầu
const initialState = {
    meeting_date: 2, 
    startAt: '08:00', 
    endAt: '09:00',
    link_meet: '' // Thêm trường link_meet
};

// --- Component ---

function ScheduleTab({ classId, token }) {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [newEntry, setNewEntry] = useState(initialState);

    const fetchSchedules = useCallback(async () => {
        if (!token || !classId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getScheduleByClass(classId, token);
            setSchedules(data || []);
        } catch (err) {
            setError('Không thể tải lịch học của lớp.');
        } finally {
            setLoading(false);
        }
    }, [classId, token]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    // SỬA 2: Hàm này sẽ tự động xử lý link_meet
    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setNewEntry(prev => ({ ...prev, [name]: value }));
    };
    
    const handleTimeChange = (name, dayjsValue) => {
        setNewEntry(prev => ({
            ...prev,
            [name]: dayjsToString(dayjsValue)
        }));
    };

    // SỬA 3: Hàm này đã bao gồm link_meet khi gửi
    const handleAddSchedule = async () => {
        if (!newEntry.startAt || !newEntry.endAt) {
            setError("Vui lòng nhập giờ bắt đầu và kết thúc.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            // newEntry (từ state) đã chứa link_meet
            await createSchedule(classId, [newEntry], token);
            setNewEntry(initialState); // Reset form (bao gồm cả link_meet)
            await fetchSchedules();
        } catch (err) {
            setError('Lỗi khi thêm lịch học mới.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSchedule = async (scheduleIdToDelete) => {
        if (!window.confirm("Bạn có chắc muốn xóa lịch học này?")) {
            return;
        }
        setError(null);
        try {
            await deleteSchedule(classId, false, [scheduleIdToDelete], token);
            await fetchSchedules();
        } catch (err) {
            setError('Lỗi khi xóa lịch học.');
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Paper sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                    Thêm buổi học cố định
                </Typography>
                
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
                        
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id="day-select-label">Ngày trong tuần</InputLabel>
                            <Select
                                labelId="day-select-label"
                                label="Ngày trong tuần"
                                name="meeting_date"
                                value={newEntry.meeting_date}
                                onChange={handleFormChange}
                            >
                                {dayOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <TimePicker
                            label="Giờ bắt đầu"
                            value={stringToDayjs(newEntry.startAt)}
                            onChange={(newValue) => handleTimeChange('startAt', newValue)}
                            ampm={true}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                        
                        <TimePicker
                            label="Giờ kết thúc"
                            value={stringToDayjs(newEntry.endAt)}
                            onChange={(newValue) => handleTimeChange('endAt', newValue)}
                            ampm={true}
                            slotProps={{ textField: { size: 'small' } }}
                        />

                        <Button
                            variant="contained"
                            onClick={handleAddSchedule}
                            startIcon={<AddCircleOutlineIcon />}
                            disabled={submitting}
                            sx={{ minWidth: 100 }}
                        >
                            {submitting ? <CircularProgress size={24} /> : "Thêm"}
                        </Button>
                    </Stack>

                    {/* SỬA 4: Thêm TextField cho link_meet */}
                    <TextField
                        label="Link Google Meet"
                        name="link_meet"
                        value={newEntry.link_meet}
                        onChange={handleFormChange}
                        size="small"
                        fullWidth
                        sx={{ mt: 2 }} // Đặt ở hàng riêng cho đẹp
                    />

                </LocalizationProvider>
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Lịch học hiện tại
            </Typography>
            <Paper variant="outlined">
                <List disablePadding>
                    {schedules.length > 0 ? (
                        schedules.map((sched, index) => (
                            <React.Fragment key={sched.schedule_id}>
                                <ListItem
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="xóa" onClick={() => handleDeleteSchedule(sched.schedule_id)}>
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    }
                                >
                                    {/* SỬA 5: Cập nhật ListItemText để hiển thị link */}
                                    <ListItemText
                                        primary={`Buổi ${sched.schedule_id}: ${dayMap[sched.meeting_date] || 'Không rõ'}`}
                                        secondary={
                                            <Box component="span">
                                                <Typography component="span" variant="body2" display="block">
                                                    Thời gian: {formatTimeToAMPM(sched.startAt)} - {formatTimeToAMPM(sched.endAt)}
                                                </Typography>
                                                {sched.link_meet && (
                                                    <Link
                                                        href={sched.link_meet}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        variant="body2"
                                                        sx={{ display: 'flex', alignItems: 'center', mt: 0.5, fontWeight: 500 }}
                                                    >
                                                        <LinkIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                        Link buổi học
                                                    </Link>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < schedules.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="Lớp học này chưa có lịch học cố định." />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Box>
    );
}

export default React.memo(ScheduleTab);