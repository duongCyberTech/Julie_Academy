import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, List, ListItemButton, 
    ListItemText, Dialog, DialogTitle, DialogContent, 
    DialogActions, Button, CircularProgress, Alert
} from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

// Services
import { getPlansByTutor, createBookByTutor } from '../../services/CategoryService';
import { updateClass } from '../../services/ClassService';

// Components
import CreateLessonPlanDialog from '../../components/CreatePlanDialog'; // Giả sử bạn đã tách cái này

const ResourceSetup = ({ classId, tutorId, token, onSetupComplete }) => {
    const [dialogs, setDialogs] = useState({ selectBook: false, createPlan: false });
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load danh sách giáo án cũ khi mở dialog chọn
    useEffect(() => {
        if (dialogs.selectBook) {
            setLoading(true);
            getPlansByTutor(tutorId, token)
                .then(setBooks)
                .catch(() => setError("Không tải được danh sách giáo án."))
                .finally(() => setLoading(false));
        }
    }, [dialogs.selectBook, tutorId, token]);

    // 1. Xử lý chọn giáo án có sẵn
    const handleSelectExistingBook = async (bookId) => {
        try {
            await updateClass(classId, { plan_id: bookId }, token);
            onSetupComplete(bookId); // Báo cho cha biết đã xong
        } catch (e) {
            setError('Lỗi khi cập nhật lớp học.');
        }
    };

    // 2. Xử lý tạo giáo án mới
    const handleCreateCustomPlan = async (planData) => {
        setActionLoading(true);
        try {
            // Tạo sách
            const res = await createBookByTutor(tutorId, [planData], token);
            const newPlan = res[0];
            
            if (!newPlan?.plan_id) throw new Error("Lỗi tạo giáo án");

            // Gán vào lớp
            await updateClass(classId, { plan_id: newPlan.plan_id }, token);
            
            onSetupComplete(newPlan.plan_id); // Báo cho cha biết đã xong
        } catch (e) {
            setError(e.message || 'Tạo giáo án thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <LibraryBooksIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>Cấu trúc tài liệu lớp học</Typography>
            <Typography color="text.secondary" mb={5}>
                Lớp học chưa có giáo án. Vui lòng chọn cách tổ chức tài liệu:
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={5}>
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 3, cursor: 'pointer', border: '1px solid', borderColor: 'divider',
                            transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-4px)', boxShadow: 2 } 
                        }}
                        onClick={() => setDialogs({ ...dialogs, selectBook: true })}
                    >
                        <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">📚 Chọn giáo án có sẵn</Typography>
                        <Typography variant="body2" color="text.secondary">Sử dụng cấu trúc từ thư viện của bạn.</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 3, cursor: 'pointer', border: '1px solid', borderColor: 'divider',
                            transition: 'all 0.2s', '&:hover': { borderColor: 'secondary.main', transform: 'translateY(-4px)', boxShadow: 2 } 
                        }}
                        onClick={() => setDialogs({ ...dialogs, createPlan: true })}
                    >
                        <Typography variant="h6" color="secondary" gutterBottom fontWeight="bold">✍️ Tạo giáo án mới</Typography>
                        <Typography variant="body2" color="text.secondary">Tự xây dựng lộ trình riêng cho lớp này.</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialogs */}
            <Dialog open={dialogs.selectBook} onClose={() => setDialogs({ ...dialogs, selectBook: false })}>
                <DialogTitle>Chọn giáo án có sẵn</DialogTitle>
                <DialogContent dividers>
                    {loading ? <CircularProgress /> : (
                        <List>
                            {books.map(b => (
                                <ListItemButton key={b.plan_id} onClick={() => handleSelectExistingBook(b.plan_id)}>
                                    <ListItemText primary={b.title} secondary={`Môn: ${b.subject} - Khối ${b.grade}`} />
                                </ListItemButton>
                            ))}
                            {books.length === 0 && <Typography p={2}>Chưa có giáo án nào.</Typography>}
                        </List>
                    )}
                </DialogContent>
            </Dialog>

            <CreateLessonPlanDialog 
                open={dialogs.createPlan}
                onClose={() => setDialogs({ ...dialogs, createPlan: false })}
                onSubmit={handleCreateCustomPlan}
                loading={actionLoading}
            />
        </Paper>
    );
};

export default ResourceSetup;