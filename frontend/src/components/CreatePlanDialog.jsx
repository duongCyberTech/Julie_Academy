import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, MenuItem, CircularProgress, Alert
} from '@mui/material';

const GRADES = [6, 7, 8, 9, 10, 11, 12];

const CreateLessonPlanDialog = ({ open, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        grade: '',
        description: '',
        type: 'custom'
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.subject || !formData.grade) {
            setError('Vui lòng điền đầy đủ Tiêu đề, Môn học và Khối lớp.');
            return;
        }
        setError('');
        onSubmit({
            ...formData,
            grade: Number(formData.grade)
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Tạo Giáo Án Mới</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} pt={1}>
                    {error && <Alert severity="error">{error}</Alert>}
                    
                    <TextField
                        label="Tên giáo án"
                        name="title"
                        required
                        fullWidth
                        placeholder="Ví dụ: Giáo án Toán 9 - Luyện thi vào 10"
                        value={formData.title}
                        onChange={handleChange}
                    />
                    
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Môn học"
                            name="subject"
                            required
                            fullWidth
                            placeholder="Toán, Lý, Hóa..."
                            value={formData.subject}
                            onChange={handleChange}
                        />
                        <TextField
                            select
                            label="Khối lớp"
                            name="grade"
                            required
                            fullWidth
                            value={formData.grade}
                            onChange={handleChange}
                        >
                            {GRADES.map((g) => (
                                <MenuItem key={g} value={g}>Khối {g}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <TextField
                        label="Mô tả"
                        name="description"
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Mô tả ngắn gọn về lộ trình học..."
                        value={formData.description}
                        onChange={handleChange}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Hủy</Button>
                <Button 
                    variant="contained" 
                    onClick={handleSubmit} 
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} color="inherit"/>}
                >
                    {loading ? 'Đang tạo...' : 'Tạo Giáo Án'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateLessonPlanDialog;