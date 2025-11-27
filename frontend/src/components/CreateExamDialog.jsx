import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, CircularProgress, Alert,
    FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import { createExam } from '../services/ExamService'; 

const initialState = {
    title: '',
    description: '',
    duration: 15, 
    total_score: 10, 
    level: 'medium',
    questionLst: [] 
};

function CreateExamDialog({ open, onClose, onRefresh }) {
    const [token] = useState(() => localStorage.getItem('token'));
    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: Math.max(0, parseInt(value, 10) || 0) }));
    };

    const handleSubmit = async () => {
        if (!formData.title) {
            setError("Vui lòng nhập Tiêu đề đề thi.");
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            await createExam(formData, token);
            onRefresh(); 
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || "Tạo đề thi thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData(initialState); 
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle fontWeight={600}>Tạo đề thi mới</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate sx={{ mt: 1 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="title"
                        label="Tiêu đề đề thi"
                        name="title"
                        autoFocus
                        value={formData.title}
                        onChange={handleChange}
                    />
                    
                    <TextField
                        margin="normal"
                        fullWidth
                        id="description"
                        label="Mô tả (Không bắt buộc)"
                        name="description"
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                    />

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="level-label">Cấp độ</InputLabel>
                                <Select
                                    labelId="level-label"
                                    id="level"
                                    name="level"
                                    label="Cấp độ"
                                    value={formData.level}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="easy">Dễ</MenuItem>
                                    <MenuItem value="medium">Trung bình</MenuItem>
                                    <MenuItem value="hard">Khó</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <TextField
                                label="Thời lượng (phút)"
                                name="duration"
                                type="number"
                                size="small"
                                fullWidth
                                value={formData.duration}
                                onChange={handleNumberChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Tổng điểm (ví dụ: 10)"
                                name="total_score"
                                type="number"
                                size="small"
                                fullWidth
                                value={formData.total_score}
                                onChange={handleNumberChange}
                            />
                        </Grid>
                    </Grid>

                </Box>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleClose} disabled={isSubmitting}>Hủy</Button>
                <Button 
                    variant="contained" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isSubmitting ? "Đang tạo..." : "Tạo đề thi"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateExamDialog;