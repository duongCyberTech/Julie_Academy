import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClassesByTutor } from '../../services/ClassService';

import {
    Box, Typography, Button, Paper, CircularProgress,
    Alert, SvgIcon, Grid, Card, CardContent, CardActions,
    IconButton, Tooltip, Chip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PendingIcon from '@mui/icons-material/Pending';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import CreateClassDialog from '../../components/CreateClassDialog';
import UpdateClassDialog from '../../components/UpdateClassDialog';

const PageWrapper = styled(Paper)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        margin: theme.spacing(3),
        padding: theme.spacing(5),
        backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
        backgroundImage: 'none',
        borderRadius: '24px',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
        boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
    };
});

const HeaderBar = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    flexShrink: 0,
}));

const ScrollableContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    paddingRight: theme.spacing(1),
    "&::-webkit-scrollbar": { width: "6px" },
    "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: alpha(theme.palette.text.secondary, 0.2),
        borderRadius: "10px",
        "&:hover": { backgroundColor: alpha(theme.palette.text.secondary, 0.4) },
    },
}));

const ClassCardStyled = styled(Card)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`,
        boxShadow: isDark ? 'none' : '0px 4px 12px rgba(0,0,0,0.02)',
        transition: 'all 0.3s',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: isDark
                ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`
                : '0px 12px 24px rgba(0,0,0,0.06)',
            borderColor: theme.palette.primary.main,
        }
    };
});

const EmptyIllustration = () => (
    <SvgIcon
        component="svg"
        viewBox="0 0 128 128"
        sx={{ width: 140, height: 140, color: 'primary.main', opacity: (t) => t.palette.mode === 'dark' ? 0.4 : 0.6 }}
    >
        <path fill="currentColor" d="M101.4 39.9H82.2V28c0-3.3-2.7-6-6-6H51.8c-3.3 0-6 2.7-6 6v11.9H26.6c-3.3 0-6 2.7-6 6v47.5c0 3.3 2.7 6 6 6h74.9c3.3 0 6-2.7 6-6V45.9c-.1-3.3-2.7-6-6.1-6zM57.8 34h12.4v5.9H57.8V34zM99.4 87.4H28.6V47.9h70.9v39.5z" />
        <path fill="currentColor" d="M64 57.5c-1.7 0-3 1.3-3 3v13.1h-13.1c-1.7 0-3 1.3-3 3s1.3 3 3 3H61v13.1c0 1.7 1.3 3 3 3s3-1.3 3-3V79.6h13.1c1.7 0 3-1.3 3-3s-1.3-3-3-3H67V60.5c0-1.7-1.3-3-3-3z" />
    </SvgIcon>
);

const RenderEmptyState = memo(({ onOpenCreateDialog }) => (
    <Paper
        elevation={0}
        sx={{
            flexGrow: 1,
            minHeight: '400px',
            p: { xs: 3, md: 6 },
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            backgroundColor: 'transparent',
            borderRadius: 3,
            mt: 2
        }}
    >
        <EmptyIllustration />
        <Typography variant="h6" color="text.secondary" fontWeight={600} mt={2}>
            Bạn chưa có lớp học nào
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1, mb: 3, maxWidth: '450px' }}>
            Hãy bắt đầu tạo lớp học đầu tiên của bạn để quản lý học sinh, giao bài tập và theo dõi tiến độ.
        </Typography>
        <Button
            variant="contained"
            onClick={onOpenCreateDialog}
            startIcon={<AddCircleOutlineIcon />}
            sx={{ fontWeight: 700, px: 4, py: 1.5, borderRadius: '12px' }}
        >
            Tạo lớp học đầu tiên
        </Button>
    </Paper>
));

const StatusChip = memo(({ status }) => {
    const statusMap = {
        pending: { label: "Chờ mở lớp", color: "warning", icon: <PendingIcon /> },
        ongoing: { label: "Đang diễn ra", color: "success", icon: <PlayCircleOutlineIcon /> },
        completed: { label: "Đã kết thúc", color: "default", icon: <CheckCircleIcon /> },
        cancelled: { label: "Đã hủy", color: "error", icon: <CancelIcon /> },
    };
    const { label, color, icon } = statusMap[status] || statusMap.pending;
    return <Chip icon={icon} label={label} color={color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
});

const RenderClassGrid = memo(({ classes, onNavigate, onEdit }) => (
    <Grid container spacing={3} sx={{ pb: 2, pt: 2 }}>
        {classes.map((classItem) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={classItem.class_id}>
                <ClassCardStyled>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <StatusChip status={classItem.status} />
                        </Box>
                        
                        <Typography variant="h6" fontWeight="700" noWrap title={classItem.classname} sx={{ mb: 1 }} color="text.primary">
                            {classItem.classname}
                        </Typography>
                        
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                                mb: 2, 
                                flexGrow: 1, 
                                minHeight: '40px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.5
                            }}
                        >
                            {classItem.description || "Chưa có mô tả cho lớp học này."}
                        </Typography>
                        
                        <Box display="flex" flexDirection="column" gap={0.5}>
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                Môn học: <Box component="span" fontWeight={700} color="text.primary">{classItem.subject || 'N/A'}</Box>
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                Khối lớp: <Box component="span" fontWeight={700} color="text.primary">{classItem.grade || 'N/A'}</Box>
                            </Typography>
                        </Box>
                    </CardContent>
                    
                    <CardActions sx={{ 
                        justifyContent: 'space-between', 
                        px: 3, pb: 2.5, pt: 2, 
                        backgroundColor: (theme) => theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.background.default, 0.4) 
                            : alpha(theme.palette.grey[50], 0.8),
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Tooltip title="Chỉnh sửa thông tin">
                            <IconButton size="small" onClick={() => onEdit(classItem)} color="inherit" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            disableElevation
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => onNavigate(classItem.class_id)}
                            sx={{ fontWeight: 700, borderRadius: '10px' }}
                        >
                            Chi tiết
                        </Button>
                    </CardActions>
                </ClassCardStyled>
            </Grid>
        ))}
    </Grid>
));

function ClassPage() {
    const navigate = useNavigate();
    
    const [classes, setClasses] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    const token = localStorage.getItem('token');

    const fetchClasses = useCallback(async () => {
        if (!token) {
            setError("Vui lòng đăng nhập lại.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await getClassesByTutor(token); 
            setClasses(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error(err);
            setError("Không thể tải danh sách lớp học. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [token]); 

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const handleNavigateToDetail = (classId) => navigate(`/tutor/classes/${classId}`);
    
    const handleOpenEdit = (classInfo) => {
        setSelectedClass(classInfo);
        setOpenEditDialog(true);
    };

    const handleCloseEdit = () => {
        setOpenEditDialog(false);
        setSelectedClass(null);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, my: 8 }}>
                    <CircularProgress />
                </Box>
            );
        }
        
        if (error) {
            return (
                <Alert severity="error" sx={{ mt: 2, flexShrink: 0, borderRadius: 2 }} action={
                    <Button color="inherit" size="small" onClick={fetchClasses} sx={{ fontWeight: 700 }}>Thử lại</Button>
                }>
                    {error}
                </Alert>
            );
        }

        if (classes.length === 0) {
            return <RenderEmptyState onOpenCreateDialog={() => setOpenCreateDialog(true)} />;
        }
    
        return (
            <RenderClassGrid 
                classes={classes}
                onEdit={handleOpenEdit}
                onNavigate={handleNavigateToDetail}
            />
        );
    };

    return (
        <PageWrapper>
            <HeaderBar>
                <Box>
                    <Typography variant="h4" fontWeight="700" color="text.primary">
                        Lớp học của tôi
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
                        Quản lý danh sách lớp học và học viên
                    </Typography>
                </Box>
                {!loading && !error && classes.length > 0 && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenCreateDialog(true)}
                        startIcon={<AddCircleOutlineIcon />}
                        sx={{ fontWeight: 700, borderRadius: '12px', px: 3, py: 1 }}
                    >
                        Tạo lớp mới
                    </Button>
                )}
            </HeaderBar>

            <ScrollableContent>
                {renderContent()}
            </ScrollableContent>

            <CreateClassDialog 
                open={openCreateDialog} 
                onClose={() => setOpenCreateDialog(false)} 
                onRefresh={fetchClasses} 
            />
            <UpdateClassDialog
                open={openEditDialog}
                onClose={handleCloseEdit}
                onRefresh={fetchClasses}
                initialData={selectedClass}
            />
        </PageWrapper>
    );
}

export default memo(ClassPage);