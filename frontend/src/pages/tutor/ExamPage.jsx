import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyExams } from '../../services/ExamService';
import {
    Box, Typography, Button, Paper, CircularProgress,
    Grid, Card, CardContent, CardActions,
    IconButton, Stack, Chip, Divider, 
    TextField, InputAdornment, Snackbar, Alert,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import SearchIcon from '@mui/icons-material/Search';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

import CreateExamDialog from '../../components/CreateExamDialog';

const PageWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : theme.palette.background.paper,
    minHeight: '85vh',
    boxShadow: 'none',
}));

const ExamCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    transition: 'all 0.2s',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: theme.shadows[3],
        borderColor: theme.palette.primary.main
    }
}));

const LevelChip = memo(({ level }) => {
    const map = { 
        EASY: { label: "Dễ", color: "success" }, 
        MEDIUM: { label: "TB", color: "warning" }, 
        HARD: { label: "Khó", color: "error" } 
    };
    const conf = map[String(level).toUpperCase()] || { label: "N/A", color: "default" };
    return <Chip icon={<StarBorderIcon />} label={conf.label} color={conf.color} size="small" variant="outlined" />;
});

function ExamPage() {
    const navigate = useNavigate();
    const [token] = useState(() => localStorage.getItem('token'));
    
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLevel, setFilterLevel] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    
    const [openCreate, setOpenCreate] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'info' });

    const fetchExams = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await getMyExams(token);
            setExams(Array.isArray(res) ? res : (res?.data || []));
        } catch (err) {
            setToast({ open: true, msg: "Lỗi tải danh sách đề thi", severity: "error" });
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    const processedExams = useMemo(() => {
        let result = [...exams];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(e => e.title.toLowerCase().includes(lowerTerm));
        }

        if (filterLevel !== "all") {
            result = result.filter(e => String(e.level).toLowerCase() === filterLevel);
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case 'name_asc': return a.title.localeCompare(b.title);
                case 'name_desc': return b.title.localeCompare(a.title);
                case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
                case 'newest': 
                default: return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return result;
    }, [exams, searchTerm, filterLevel, sortBy]);

    const handleToastClose = () => setToast(prev => ({ ...prev, open: false }));

    return (
        <PageWrapper>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={3} spacing={2}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Quản lý đề thi</Typography>
                    <Typography variant="body2" color="text.secondary">Danh sách các bộ đề thi trắc nghiệm của bạn</Typography>
                </Box>
                <Button variant="contained" size="large" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenCreate(true)}>
                    Tạo đề mới
                </Button>
            </Stack>

            <Paper elevation={0} sx={{ p: 2, mb: 4, bgcolor: 'background.paper', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Tìm kiếm đề thi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ 
                                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> 
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Cấp độ</InputLabel>
                            <Select
                                value={filterLevel}
                                label="Cấp độ"
                                onChange={(e) => setFilterLevel(e.target.value)}
                                startAdornment={<InputAdornment position="start"><FilterListIcon fontSize="small"/></InputAdornment>}
                            >
                                <MenuItem value="all">Tất cả</MenuItem>
                                <MenuItem value="easy">Dễ</MenuItem>
                                <MenuItem value="medium">Trung bình</MenuItem>
                                <MenuItem value="hard">Khó</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={4}>
                         <FormControl fullWidth size="small">
                            <InputLabel>Sắp xếp</InputLabel>
                            <Select
                                value={sortBy}
                                label="Sắp xếp"
                                onChange={(e) => setSortBy(e.target.value)}
                                startAdornment={<InputAdornment position="start"><SortIcon fontSize="small"/></InputAdornment>}
                            >
                                <MenuItem value="newest">Mới nhất</MenuItem>
                                <MenuItem value="oldest">Cũ nhất</MenuItem>
                                <MenuItem value="name_asc">Tên (A-Z)</MenuItem>
                                <MenuItem value="name_desc">Tên (Z-A)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
            ) : processedExams.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 8, textAlign: 'center', bgcolor: 'white', borderStyle: 'dashed', borderRadius: 2 }}>
                    <QuizIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">Không tìm thấy đề thi nào</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {processedExams.map((exam) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={exam.exam_id}>
                            <ExamCard>
                                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                                    <Stack direction="row" justifyContent="space-between" mb={1}>
                                        <LevelChip level={exam.level} />
                                    </Stack>
                                    
                                    <Typography variant="h6" fontWeight="bold" noWrap title={exam.title} gutterBottom>
                                        {exam.title}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                        mb: 2, height: 40, overflow: 'hidden', 
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                                    }}>
                                        {exam.description || "Không có mô tả"}
                                    </Typography>
                                    
                                    <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                                    
                                    <Stack direction="row" justifyContent="space-between" color="text.secondary" sx={{ px: 1 }}>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <QuizIcon fontSize="small" color="action" /> 
                                            <Typography variant="caption" fontWeight="medium">{exam.total_ques} câu</Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <TimerIcon fontSize="small" color="action" /> 
                                            <Typography variant="caption" fontWeight="medium">{exam.duration}p</Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                                <CardActions sx={{ bgcolor: 'action.hover', justifyContent: 'space-between', px: 2, py: 1 }}>
                                    <IconButton size="small" disabled sx={{ color: 'error.main' }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                    <Button 
                                        size="small" 
                                        endIcon={<ArrowForwardIcon />} 
                                        onClick={() => navigate(`/tutor/exam/${exam.exam_id}`)}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Chi tiết
                                    </Button>
                                </CardActions>
                            </ExamCard>
                        </Grid>
                    ))}
                </Grid>
            )}

            <CreateExamDialog open={openCreate} onClose={() => setOpenCreate(false)} onRefresh={fetchExams} />
            
            <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleToastClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={handleToastClose} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
            </Snackbar>
        </PageWrapper>
    );
}

export default memo(ExamPage);