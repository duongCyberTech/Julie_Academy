import React, { useState, memo } from 'react';
import { createClass } from '../services/ClassService';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, Alert, CircularProgress, Box,
    FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs'; 

const CreateClassDialog = ({ open, onClose, onRefresh }) => {
    const [token] = useState(() => localStorage.getItem('token'));
    const getInitialFormData = () => ({
        classname: '',
        description: '',
        duration_time: 12,
        nb_of_student: 40,
        grade: '', 
        subject: '', 
        status: 'pending',
        startat: dayjs(), 
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseInt(value, 10) : value;
        if (type === 'number' && val < 0) return;

        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleDateChange = (newDate) => {
        setFormData(prev => ({ ...prev, startat: newDate }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.classname) {
            setFormError('Tên lớp không được để trống.');
            return;
        }
        if (!formData.grade) {
            setFormError('Vui lòng chọn khối lớp.');
            return;
        }
        if (!formData.subject) {
            setFormError('Vui lòng chọn môn học.');
            return;
        }
        if (!formData.startat) {
            setFormError('Vui lòng chọn ngày bắt đầu.');
            return;
        }

        setIsSubmitting(true);
        setFormError('');
        try {
            await createClass({
                ...formData,
                startat: formData.startat.toISOString(), 
            }, token);
            onRefresh(); 
            handleClose(); 
        } catch (err) {
            setFormError(err.response?.data?.message || 'Tạo lớp thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
        if (isSubmitting) return; 
        setFormData(getInitialFormData()); 
        setFormError('');
        onClose();
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={600}>Tạo Lớp Học Mới</DialogTitle>
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent>
                        <Stack spacing={2.5} sx={{ pt: 1 }}>
                            {/* Hàng 1: Tên lớp */}
                            <TextField
                                autoFocus
                                required
                                name="classname"
                                label="Tên lớp học"
                                value={formData.classname}
                                onChange={handleChange}
                                fullWidth
                                helperText="Ví dụ: Lớp Toán 9A1 (2025-2026)"
                            />
                            {/* Hàng 2: Mô tả */}
                            <TextField
                                name="description"
                                label="Mô tả ngắn (Tùy chọn)"
                                value={formData.description}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                            />
                            
                            {/* Hàng 3: Khối & Môn */}
                            <Stack direction="row" spacing={2}>
                                <FormControl fullWidth required>
                                    <InputLabel id="grade-select-label">Khối lớp</InputLabel>
                                    <Select
                                        labelId="grade-select-label"
                                        name="grade"
                                        value={formData.grade}
                                        label="Khối lớp"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value=""><em>-- Chọn khối lớp --</em></MenuItem>
                                        <MenuItem value={6}>Lớp 6</MenuItem>
                                        <MenuItem value={7}>Lớp 7</MenuItem>
                                        <MenuItem value={8}>Lớp 8</MenuItem>
                                        <MenuItem value={9}>Lớp 9</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth required>
                                    <InputLabel id="subject-select-label">Môn học</InputLabel>
                                    <Select
                                        labelId="subject-select-label"
                                        name="subject"
                                        value={formData.subject}
                                        label="Môn học"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value=""><em>-- Chọn môn học --</em></MenuItem>
                                        <MenuItem value="Toán">Toán</MenuItem>
                                        <MenuItem value="Lý">Lý</MenuItem>
                                        <MenuItem value="Hóa">Hóa</MenuItem>
                                        <MenuItem value="Văn">Văn</MenuItem>
                                        <MenuItem value="Anh">Anh</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            {/* Hàng 4: Thời lượng & Sĩ số */}
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    name="duration_time"
                                    label="Thời lượng (Tuần)"
                                    type="number"
                                    value={formData.duration_time}
                                    onChange={handleChange}
                                    fullWidth
                                    InputProps={{ inputProps: { min: 1 } }}
                                />
                                <TextField
                                    name="nb_of_student"
                                    label="Sĩ số (Tối đa)"
                                    type="number"
                                    value={formData.nb_of_student}
                                    onChange={handleChange}
                                    fullWidth
                                    InputProps={{ inputProps: { min: 1 } }}
                                />
                            </Stack>
                            
                            {/* Hàng 5: Ngày bắt đầu & Trạng thái */}
                            <Stack direction="row" spacing={2}>
                                {/* BỔ SUNG: DatePicker */}
                                <DatePicker
                                    label="Ngày bắt đầu"
                                    value={formData.startat}
                                    onChange={handleDateChange}
                                    sx={{ width: '100%' }}
                                />
                                <FormControl fullWidth>
                                    <InputLabel id="status-select-label">Trạng thái</InputLabel>
                                    <Select
                                        labelId="status-select-label"
                                        name="status"
                                        value={formData.status}
                                        label="Trạng thái"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="pending">Chờ mở lớp (Pending)</MenuItem>
                                        <MenuItem value="ongoing">Đang diễn ra (Ongoing)</MenuItem>
                                        <MenuItem value="completed">Đã hoàn thành (Completed)</MenuItem>
                                        <MenuItem value="cancelled">Đã hủy (Cancelled)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                        </Stack>
                        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button onClick={handleClose} disabled={isSubmitting}>Hủy</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} /> : "Tạo lớp"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </LocalizationProvider>
    );
};

export default memo(CreateClassDialog);