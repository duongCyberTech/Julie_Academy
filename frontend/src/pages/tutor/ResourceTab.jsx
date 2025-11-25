/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import {
    Box, Typography, Button, Paper, CircularProgress, Alert,
    Stack, Select, MenuItem, TextField, FormControl, InputLabel,
    List, ListItem, ListItemText, IconButton, Divider, Link,
    ListItemIcon
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideocamIcon from '@mui/icons-material/Videocam';

// --- Mock Data (Dữ liệu giả) ---
// (API thật sẽ thay thế cái này)
const MOCK_DATA = [
    { 
        id: 'res-1', 
        title: 'Đề cương ôn tập Chương 1', 
        type: 'PDF', 
        url: 'https://example.com/on-tap-chuong-1.pdf', 
        createdAt: '2025-11-05T10:30:00Z' 
    },
    { 
        id: 'res-2', 
        title: 'Video bài giảng: Tích phân', 
        type: 'Video', 
        url: 'https://www.youtube.com/watch?v=example', 
        createdAt: '2025-11-04T14:00:00Z' 
    },
    { 
        id: 'res-3', 
        title: 'Bài tập về nhà (Google Doc)', 
        type: 'Link', 
        url: 'https://docs.google.com/document/d/example', 
        createdAt: '2025-11-03T08:00:00Z' 
    },
];

const initialState = {
    title: '',
    url: '',
    type: 'Link' // Giá trị mặc định
};

// Helper để chọn icon
const getIconForType = (type) => {
    switch (type) {
        case 'PDF':
            return <PictureAsPdfIcon color="error" />;
        case 'Video':
            return <VideocamIcon color="primary" />;
        case 'Link':
        default:
            return <LinkIcon color="action" />;
    }
};

function ResourceTab({ classId, token }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [newResource, setNewResource] = useState(initialState);

    // 1. LẤY DỮ LIỆU (Đang dùng Mock)
    const fetchResources = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // == API THẬT SẼ GỌI Ở ĐÂY ==
            // const data = await getResourcesByClass(classId, token);
            
            // Mô phỏng độ trễ API
            await new Promise(resolve => setTimeout(resolve, 500));
            setResources(MOCK_DATA);

        } catch (err) {
            setError('Không thể tải tài liệu của lớp.');
        } finally {
            setLoading(false);
        }
    }, [classId, token]); // Giữ props để dùng khi có API

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    // 2. XỬ LÝ FORM
    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setNewResource(prev => ({ ...prev, [name]: value }));
    };

    // 3. THÊM MỚI (Đang dùng Mock)
    const handleAddResource = async () => {
        if (!newResource.title || !newResource.url) {
            setError("Vui lòng nhập Tiêu đề và Đường dẫn.");
            return;
        }
        
        setSubmitting(true);
        setError(null);
        try {
            const newMockResource = {
                ...newResource,
                id: `res-${Math.random().toString(36).substr(2, 9)}`, // ID giả
                createdAt: new Date().toISOString() // Ngày giờ hiện tại
            };

            // == API THẬT SẼ GỌI Ở ĐÂY ==
            // await createResource(classId, newResource, token);

            // Mô phỏng độ trễ API
            await new Promise(resolve => setTimeout(resolve, 300));

            // Cập nhật UI (Mock)
            setResources(prev => [newMockResource, ...prev]);
            setNewResource(initialState); // Reset form

        } catch (err) {
            setError('Lỗi khi thêm tài liệu mới.');
        } finally {
            setSubmitting(false);
        }
    };

    // 4. XÓA (Đang dùng Mock)
    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm("Bạn có chắc muốn xóa tài liệu này?")) {
            return;
        }
        setError(null);
        try {
            // == API THẬT SẼ GỌI Ở ĐÂY ==
            // await deleteResource(classId, resourceId, token);

            // Mô phỏng độ trễ API
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Cập nhật UI (Mock)
            setResources(prev => prev.filter(res => res.id !== resourceId));

        } catch (err) {
            setError('Lỗi khi xóa tài liệu.');
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            {/* --- Form Thêm Mới --- */}
            <Paper sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }} variant="outlined">
                <Typography variant="h6" gutterBottom>
                    Thêm tài liệu mới
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Tiêu đề tài liệu"
                        name="title"
                        value={newResource.title}
                        onChange={handleFormChange}
                        size="small"
                        fullWidth
                    />
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                            label="Đường dẫn (URL)"
                            name="url"
                            value={newResource.url}
                            onChange={handleFormChange}
                            size="small"
                            fullWidth
                        />
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id="type-select-label">Loại</InputLabel>
                            <Select
                                labelId="type-select-label"
                                label="Loại"
                                name="type"
                                value={newResource.type}
                                onChange={handleFormChange}
                            >
                                <MenuItem value="Link">Link (Chung)</MenuItem>
                                <MenuItem value="PDF">PDF</MenuItem>
                                <MenuItem value="Video">Video</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                    <Box sx={{ textAlign: 'right' }}>
                        <Button
                            variant="contained"
                            onClick={handleAddResource}
                            startIcon={<AddCircleOutlineIcon />}
                            disabled={submitting}
                            sx={{ minWidth: 100 }}
                        >
                            {submitting ? <CircularProgress size={24} /> : "Thêm"}
                        </Button>
                    </Box>
                </Stack>
            </Paper>

            {/* --- Danh Sách Tài Liệu --- */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Tài liệu của lớp
            </Typography>
            <Paper variant="outlined">
                <List disablePadding>
                    {resources.length > 0 ? (
                        resources.map((res, index) => (
                            <React.Fragment key={res.id}>
                                <ListItem
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="xóa" onClick={() => handleDeleteResource(res.id)}>
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    }
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        {getIconForType(res.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Link href={res.url} target="_blank" rel="noopener noreferrer" variant="body1" fontWeight={500} underline="hover">
                                                {res.title}
                                            </Link>
                                        }
                                        secondary={`Loại: ${res.type} - Đăng ngày: ${dayjs(res.createdAt).format('DD/MM/YYYY')}`}
                                    />
                                </ListItem>
                                {index < resources.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="Chưa có tài liệu nào cho lớp học này." />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Box>
    );
}

export default React.memo(ResourceTab);