import React, { useState, useEffect, memo } from 'react';
import { updateClass } from '../services/ClassService';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, Alert, CircularProgress, Box,
    FormControl, InputLabel, Select, MenuItem, Snackbar
} from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const UpdateClassDialog = ({ open, onClose, onRefresh, initialData }) => {
    const [token] = useState(() => localStorage.getItem('token'));
    const [formData, setFormData] = useState({
        classname: '',
        description: '',
        duration_time: '',
        grade: '',
        subject: '',
        status: '',
        startat: dayjs(),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (open && initialData) {
            setFormData({
                classname: initialData.classname || '',
                description: initialData.description || '',
                duration_time: initialData.duration_time || '',
                grade: initialData.grade || '',
                subject: initialData.subject || '',
                status: initialData.status || 'pending',
                startat: initialData.startat ? dayjs(initialData.startat) : dayjs(),
            });
            setFormError('');
        }
    }, [open, initialData]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseInt(value, 10) : value;
        if (type === 'number' && val < 0) return;

        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleDateChange = (newDate) => {
        setFormData(prev => ({ ...prev, startat: newDate }));
    };

    const handleCloseToast = (event, reason) => {
        if (reason === 'clickaway') return;
        setToast({ ...toast, open: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.classname) {
            setFormError('Tên lớp không được để trống.');
            return;
        }

        setIsSubmitting(true);
        setFormError('');
        
        try {
            await updateClass(initialData.class_id, {
                ...formData,
                startat: formData.startat ? formData.startat.toISOString() : null,
            }, token);
            
            setToast({ open: true, message: 'Cập nhật lớp học thành công!', severity: 'success' });
            onRefresh();
            
            setTimeout(() => {
                onClose();
                setIsSubmitting(false);
            }, 1000);

        } catch (err) {
            setFormError(err.message || 'Cập nhật lớp thất bại.');
            setIsSubmitting(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={600}>Cập nhật thông tin lớp học</DialogTitle>
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent>
                        <Stack spacing={2.5} sx={{ pt: 1 }}>
                            <TextField
                                autoFocus
                                required
                                name="classname"
                                label="Tên lớp học"
                                value={formData.classname}
                                onChange={handleChange}
                                fullWidth
                                disabled={isSubmitting}
                            />
                            <TextField
                                name="description"
                                label="Mô tả ngắn"
                                value={formData.description}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                                disabled={isSubmitting}
                            />
                            
                            <Stack direction="row" spacing={2}>
                                <FormControl fullWidth disabled={isSubmitting}>
                                    <InputLabel id="grade-edit-label">Khối lớp</InputLabel>
                                    <Select
                                        labelId="grade-edit-label"
                                        name="grade"
                                        value={formData.grade}
                                        label="Khối lớp"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value=""><em>-- Chọn khối --</em></MenuItem>
                                        <MenuItem value={6}>Lớp 6</MenuItem>
                                        <MenuItem value={7}>Lớp 7</MenuItem>
                                        <MenuItem value={8}>Lớp 8</MenuItem>
                                        <MenuItem value={9}>Lớp 9</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth disabled={isSubmitting}>
                                    <InputLabel id="subject-edit-label">Môn học</InputLabel>
                                    <Select
                                        labelId="subject-edit-label"
                                        name="subject"
                                        value={formData.subject}
                                        label="Môn học"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value=""><em>-- Chọn môn --</em></MenuItem>
                                        <MenuItem value="Toán">Toán</MenuItem>
                                        <MenuItem value="Lý">Lý</MenuItem>
                                        <MenuItem value="Hóa">Hóa</MenuItem>
                                        <MenuItem value="Văn">Văn</MenuItem>
                                        <MenuItem value="Anh">Anh</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            <TextField
                                name="duration_time"
                                label="Thời lượng (Tuần)"
                                type="number"
                                value={formData.duration_time}
                                onChange={handleChange}
                                fullWidth
                                disabled={isSubmitting}
                                InputProps={{ inputProps: { min: 1 } }}
                            />
                            
                            <Stack direction="row" spacing={2}>
                                <DatePicker
                                    label="Ngày bắt đầu"
                                    value={formData.startat}
                                    onChange={handleDateChange}
                                    disabled={isSubmitting}
                                    sx={{ width: '100%' }}
                                />
                                <FormControl fullWidth disabled={isSubmitting}>
                                    <InputLabel id="status-edit-label">Trạng thái</InputLabel>
                                    <Select
                                        labelId="status-edit-label"
                                        name="status"
                                        value={formData.status}
                                        label="Trạng thái"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="pending">Chờ mở lớp</MenuItem>
                                        <MenuItem value="ongoing">Đang diễn ra</MenuItem>
                                        <MenuItem value="completed">Đã hoàn thành</MenuItem>
                                        <MenuItem value="cancelled">Đã hủy</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                        </Stack>
                        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button onClick={onClose} disabled={isSubmitting}>Hủy</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Lưu thay đổi"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </LocalizationProvider>
    );
};

export default memo(UpdateClassDialog);