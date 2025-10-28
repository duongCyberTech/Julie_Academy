import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyClasses, deleteClass } from '../../services/ClassService';

// --- Material-UI Imports ---
import {
    Box, Typography, Button, Paper, Grid, CircularProgress,
    Alert, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Card, CardContent, CardActions, IconButton, Tooltip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// --- Icons ---
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// --- Styled Components ---
const PageWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
}));

const Header = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
});

const ClassCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
    }
}));

// =======================
// === Main Component ====
// =======================
export default function ClassPage() {
    const navigate = useNavigate();
    const [token] = useState(() => localStorage.getItem('token'));

    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchClasses = async () => {
            if (!token) {
                setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await getMyClasses(token);
                setClasses(Array.isArray(response) ? response : []);
            } catch (err) {
                setError("Không thể tải danh sách lớp học.");
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, [token]);

    // --- Handlers ---
    const handleNavigateToDetail = (classId) => navigate(`/tutor/classes/${classId}`);
    const handleOpenDeleteDialog = (classInfo) => {
        setClassToDelete(classInfo);
        setOpenDeleteDialog(true);
    };
    const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);

    const handleConfirmDelete = async () => {
        if (!classToDelete || !token) return;
        try {
            await deleteClass(classToDelete.class_id, token);
            setClasses(prev => prev.filter(c => c.class_id !== classToDelete.class_id));
            handleCloseDeleteDialog();
        } catch (err) {
            setError("Xóa lớp học thất bại.");
            handleCloseDeleteDialog();
        }
    };
    
    // --- Render Logic ---
    const renderContent = () => {
        if (loading) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
        }
        if (error) {
            return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
        }
        if (classes.length === 0) {
            return (
                <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                    Bạn chưa có lớp học nào. Hãy tạo một lớp học mới!
                </Typography>
            );
        }
        return (
            <Grid container spacing={3}>
                {classes.map((classItem) => (
                    <Grid xs={12} sm={6} md={4} key={classItem.class_id}>
                        <ClassCard variant="outlined">
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" component="h2" gutterBottom>
                                    {classItem.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                                    {classItem.studentCount || 0} học viên
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                <Box>
                                    <Tooltip title="Chỉnh sửa">
                                        <IconButton size="small"><EditIcon /></IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa">
                                        <IconButton size="small" onClick={() => handleOpenDeleteDialog(classItem)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Button
                                    size="small"
                                    variant="contained"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => handleNavigateToDetail(classItem.class_id)}
                                >
                                    Chi tiết
                                </Button>
                            </CardActions>
                        </ClassCard>
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <PageWrapper>
            <Header>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Quản lý Lớp học
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    // onClick={() => setOpenCreateDialog(true)} // Sẽ cần dialog tạo lớp học
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ fontWeight: 'bold' }}
                >
                    Tạo lớp học mới
                </Button>
            </Header>

            {renderContent()}

            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Xác nhận xóa lớp học?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa lớp học "{classToDelete?.name}" không? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>Xóa</Button>
                </DialogActions>
            </Dialog>
            
            {/* Thêm component Dialog để tạo lớp học ở đây */}
            {/* <CreateClassDialog open={openCreateDialog} onClose={handleCloseCreateDialog} /> */}
        </PageWrapper>
    );
}