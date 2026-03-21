import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyExams } from '../../services/ExamService';
import {
    Box, Typography, Button, Paper, CircularProgress,
    Card, CardContent, CardActions,
    IconButton, Stack, Chip, Divider, Grid,
    TextField, InputAdornment, Snackbar, Alert,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

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
    margin: theme.spacing(2),
    padding: theme.spacing(4),
    backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.paper,
    borderRadius: '24px',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
    height: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
}));

const ScrollableContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    paddingRight: theme.spacing(1),
    "&::-webkit-scrollbar": { width: "6px" },
    "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: alpha(theme.palette.grey[400], 0.5),
        borderRadius: "10px",
        "&:hover": { backgroundColor: theme.palette.grey[500] },
    },
}));

const ExamCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    transition: 'all 0.3s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
        borderColor: theme.palette.primary.main
    }
}));

const LevelChip = memo(({ level }) => {
    const map = {
        EASY: { label: "Dễ", color: "success" },
        MEDIUM: { label: "Trung bình", color: "warning" },
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
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={3} flexShrink={0}>
                <Box>
                    <Typography variant="h4" fontWeight="700">Quản lý đề thi</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Danh sách các bộ đề thi trắc nghiệm của bạn
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => setOpenCreate(true)}
                    sx={{ borderRadius: "10px", fontWeight: 600 }}
                >
                    Tạo đề mới
                </Button>
            </Stack>

            <Paper
                elevation={0}
                flexShrink={0}
                sx={{
                    p: 2.5, mb: 3,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                    border: '1px solid', borderColor: 'divider', borderRadius: 3
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Tìm kiếm đề thi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <FormControl fullWidth size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                            <InputLabel>Cấp độ</InputLabel>
                            <Select
                                value={filterLevel}
                                label="Cấp độ"
                                onChange={(e) => setFilterLevel(e.target.value)}
                                startAdornment={<InputAdornment position="start"><FilterListIcon fontSize="small" /></InputAdornment>}
                            >
                                <MenuItem value="all">Tất cả</MenuItem>
                                <MenuItem value="easy">Dễ</MenuItem>
                                <MenuItem value="medium">Trung bình</MenuItem>
                                <MenuItem value="hard">Khó</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, md: 4 }}>
                        <FormControl fullWidth size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                            <InputLabel>Sắp xếp</InputLabel>
                            <Select
                                value={sortBy}
                                label="Sắp xếp"
                                onChange={(e) => setSortBy(e.target.value)}
                                startAdornment={<InputAdornment position="start"><SortIcon fontSize="small" /></InputAdornment>}
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

            <ScrollableContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                    </Box>
                ) : processedExams.length === 0 ? (
                    <Paper elevation={0} sx={{
                        p: 8, textAlign: 'center', bgcolor: 'transparent',
                        border: '2px dashed', borderColor: 'divider', borderRadius: 3,
                        mt: 2
                    }}>
                        <QuizIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight={600}>
                            Không tìm thấy đề thi nào
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                            Hãy thử thay đổi bộ lọc hoặc tạo mới một đề thi
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3} sx={{ pb: 2, pt: 2 }}>
                        {processedExams.map((exam) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={exam.exam_id}>
                                <ExamCard>
                                    <CardContent sx={{ flexGrow: 1, pb: 1, p: 2.5 }}>
                                        <Stack direction="row" justifyContent="space-between" mb={1.5}>
                                            <LevelChip level={exam.level} />
                                        </Stack>

                                        <Typography variant="h6" fontWeight="bold" noWrap title={exam.title} sx={{ mb: 1 }}>
                                            {exam.title}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{
                                            mb: 2, height: 40, overflow: 'hidden',
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                            lineHeight: 1.5
                                        }}>
                                            {exam.description || "Chưa có mô tả cho đề thi này."}
                                        </Typography>

                                        <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                                        <Stack direction="row" justifyContent="space-between" color="text.secondary">
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <QuizIcon fontSize="small" color="primary" sx={{ opacity: 0.7 }} />
                                                <Typography variant="caption" fontWeight={600}>{exam.total_ques} câu</Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <TimerIcon fontSize="small" color="primary" sx={{ opacity: 0.7 }} />
                                                <Typography variant="caption" fontWeight={600}>{exam.duration} phút</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                    <CardActions sx={{
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                                        justifyContent: 'space-between',
                                        px: 2.5, py: 1.5,
                                        borderTop: '1px solid', borderColor: 'divider'
                                    }}>
                                        <IconButton size="small" disabled sx={{ color: 'error.main', opacity: 0.5 }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            disableElevation
                                            endIcon={<ArrowForwardIcon />}
                                            onClick={() => navigate(`/tutor/exam/${exam.exam_id}`)}
                                            sx={{ fontWeight: 600, borderRadius: '8px' }}
                                        >
                                            Chi tiết
                                        </Button>
                                    </CardActions>
                                </ExamCard>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </ScrollableContent>

            <CreateExamDialog open={openCreate} onClose={() => setOpenCreate(false)} onRefresh={fetchExams} />

            <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleToastClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={handleToastClose} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
            </Snackbar>
        </PageWrapper>
    );
}

export default memo(ExamPage);