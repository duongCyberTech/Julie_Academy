import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyClasses, deleteClass, createClass } from '../../services/ClassService';
import {
    Box, Typography, Button, Paper, CircularProgress,
    Alert, SvgIcon, Grid, Card, CardContent, CardActions,
    IconButton, Tooltip, Stack, Chip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import PendingIcon from '@mui/icons-material/Pending';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import CreateClassDialog from '../../components/CreateClassDialog';



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

const ClassCardStyled = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
    }
}));


const EmptyIllustration = () => (
    <SvgIcon
        component="svg"
        viewBox="0 0 128 128"
        sx={{ width: 140, height: 140, color: 'primary.main', opacity: 0.6 }}
    >
        <path fill="currentColor" d="M101.4 39.9H82.2V28c0-3.3-2.7-6-6-6H51.8c-3.3 0-6 2.7-6 6v11.9H26.6c-3.3 0-6 2.7-6 6v47.5c0 3.3 2.7 6 6 6h74.9c3.3 0 6-2.7 6-6V45.9c-.1-3.3-2.7-6-6.1-6zM57.8 34h12.4v5.9H57.8V34zM99.4 87.4H28.6V47.9h70.9v39.5z" />
        <path fill="currentColor" d="M64 57.5c-1.7 0-3 1.3-3 3v13.1h-13.1c-1.7 0-3 1.3-3 3s1.3 3 3 3H61v13.1c0 1.7 1.3 3 3 3s3-1.3 3-3V79.6h13.1c1.7 0 3-1.3 3-3s-1.3-3-3-3H67V60.5c0-1.7-1.3-3-3-3z" />
    </SvgIcon>
);

const RenderEmptyState = memo(({ onOpenCreateDialog }) => {
    return (
        <Paper
            variant="outlined"
            sx={{
                mt: 4, p: { xs: 3, md: 6 }, textAlign: 'center',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderColor: 'divider',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                borderRadius: 2.5
            }}
        >
            <EmptyIllustration />
            <Typography variant="h5" component="h2" fontWeight={600} mt={2} color="text.primary">
                Bạn chưa có lớp học nào
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, mb: 3, maxWidth: '450px' }}>
                Hãy bắt đầu tạo lớp học đầu tiên của bạn để quản lý học sinh, 
                giao bài tập và theo dõi tiến độ.
            </Typography>
            <Button
                variant="contained"
                size="large"
                onClick={onOpenCreateDialog} 
                startIcon={<AddCircleOutlineIcon />}
                sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
            >
                Tạo lớp học đầu tiên
            </Button>
        </Paper>
    );
});


const StatusChip = memo(({ status }) => {
    const statusMap = {
        pending: { label: "Chờ mở lớp", color: "warning", icon: <PendingIcon /> },
        ongoing: { label: "Đang diễn ra", color: "success", icon: <PlayCircleOutlineIcon /> },
        completed: { label: "Đã kết thúc", color: "default", icon: <CheckCircleIcon /> },
        cancelled: { label: "Đã hủy", color: "error", icon: <CancelIcon /> },
    };
    const { label, color, icon } = statusMap[status] || statusMap.pending;
    return <Chip icon={icon} label={label} color={color} size="small" variant="outlined" />;
});

const RenderClassGrid = memo(({ classes, onNavigate, onDelete }) => {
    return (
        <Grid container spacing={3} sx={{ mt: 2 }}>
            {classes.map((classItem) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={classItem.class_id}>
                    <ClassCardStyled>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ mb: 1.5 }}>
                                <StatusChip status={classItem.status} />
                            </Box>
                            
                            <Typography variant="h6" component="h2" fontWeight={600} noWrap title={classItem.classname}>
                                {classItem.classname}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 0.5, mb: 2, flexGrow: 1, minHeight: '40px' }}>
                                {classItem.description || "Lớp học chưa có mô tả."}
                            </Typography>
                            
                        </CardContent>
                        
                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0, backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.04) }}>
                            <Box>
                                <Tooltip title="Chỉnh sửa (Chưa hỗ trợ)">
                                    <span>
                                        <IconButton size="small" disabled><EditIcon /></IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Xóa lớp">
                                    <IconButton size="small" onClick={() => onDelete(classItem)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Button
                                size="small"
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => onNavigate(classItem.class_id)}
                            >
                                Quản lý lớp
                            </Button>
                        </CardActions>
                    </ClassCardStyled>
                </Grid>
            ))}
        </Grid>
    );
});



function ClassPage() {
    const navigate = useNavigate();
    const [token] = useState(() => localStorage.getItem('token'));
    
    const [classes, setClasses] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);

    const fetchClasses = useCallback(async () => {
        if (!token) {
            setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await getMyClasses(token); 
            setClasses(Array.isArray(response) ? response : []);
        } catch (err) {
            setError("Không thể tải danh sách lớp học.");
        } finally {
            setLoading(false);
        }
    }, [token]); 

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const handleOpenCreateDialog = () => setOpenCreateDialog(true);
    const handleCloseCreateDialog = () => setOpenCreateDialog(false);
    
    const handleNavigateToDetail = (classId) => navigate(`/tutor/classes/${classId}`);
    const handleOpenDeleteDialog = (classInfo) => {
        setClassToDelete(classInfo);
        setOpenDeleteDialog(true);
    };
    const handleCloseDeleteDialog = () => {
        setClassToDelete(null);
        setOpenDeleteDialog(false);
    };
    
    const handleConfirmDelete = async () => {
        if (!classToDelete || !token) return;
        try {
            await deleteClass(classToDelete.class_id, token);
            fetchClasses();
            handleCloseDeleteDialog();
        } catch (err) {
            setError("Xóa lớp học thất bại. (Lưu ý: API Delete chưa tồn tại ở backend)");
            handleCloseDeleteDialog();
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }
        
        if (error) {
            return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
        }

        if (classes.length === 0) {
            return <RenderEmptyState onOpenCreateDialog={handleOpenCreateDialog} />;
        }
    
        return (
            <RenderClassGrid 
                classes={classes}
                onDelete={handleOpenDeleteDialog}
                onNavigate={handleNavigateToDetail}
            />
        );
    };

    return (
        <PageWrapper>
            <Header>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Quản lý Lớp học
                </Typography>
                {!loading && !error && classes.length > 0 && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenCreateDialog}
                        startIcon={<AddCircleOutlineIcon />}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Tạo lớp học mới
                    </Button>
                )}
            </Header>

            {renderContent()}
            <CreateClassDialog 
                open={openCreateDialog} 
                onClose={handleCloseCreateDialog} 
                onRefresh={fetchClasses} 
            />

            {/* Dialog Xóa (chỉ render khi cần) */}
            {classToDelete && (
                <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                    <DialogTitle>Xác nhận xóa lớp học?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Bạn có chắc chắn muốn xóa lớp học "{classToDelete?.classname}" không?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
                        <Button onClick={handleConfirmDelete} color="error" autoFocus>Xóa</Button>
                    </DialogActions>
                </Dialog>
            )}
        </PageWrapper>
    );
}

export default memo(ClassPage);