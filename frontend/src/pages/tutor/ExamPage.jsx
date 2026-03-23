import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, CircularProgress,
    Card, CardContent, Stack, Chip, Divider, Grid,
    TextField, InputAdornment, Snackbar, Alert,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import SearchIcon from '@mui/icons-material/Search';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

import dayjs from 'dayjs';
import { getMyExams } from '../../services/ExamService';
import CreateExamDialog from '../../components/CreateExamDialog';

// --- STYLED COMPONENTS (Tuân thủ Design System) ---

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
    marginBottom: theme.spacing(4), // Chuẩn khoảng cách spacing(4) Header
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

const ExamCard = styled(Card)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px', // Bo góc Card 16px
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`,
        boxShadow: isDark ? 'none' : '0px 4px 12px rgba(0,0,0,0.02)',
        transition: 'all 0.3s',
        cursor: 'pointer',
        '&:hover': {
            transform: 'translateY(-2px)', // Hiệu ứng nảy nhẹ chuẩn UX
            boxShadow: isDark
                ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`
                : '0px 12px 24px rgba(0,0,0,0.06)',
            borderColor: theme.palette.primary.main, // Đổi màu viền khi hover
        }
    };
});

const LevelChip = memo(({ level }) => {
    const map = {
        EASY: { label: "Dễ", color: "success" },
        MEDIUM: { label: "Trung bình", color: "warning" },
        HARD: { label: "Khó", color: "error" }
    };
    const conf = map[String(level).toUpperCase()] || { label: "N/A", color: "default" };
    return <Chip icon={<StarBorderIcon />} label={conf.label} color={conf.color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
});

// --- MAIN COMPONENT ---

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
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            
            switch (sortBy) {
                case 'name_asc': return a.title.localeCompare(b.title);
                case 'name_desc': return b.title.localeCompare(a.title);
                case 'oldest': return dateA - dateB;
                case 'newest':
                default: return dateB - dateA;
            }
        });

        return result;
    }, [exams, searchTerm, filterLevel, sortBy]);

    const handleToastClose = useCallback(() => setToast(prev => ({ ...prev, open: false })), []);

    return (
        <PageWrapper>
            <HeaderBar>
                <Box>
                    <Typography variant="h4" fontWeight="700" color="text.primary">
                        Quản lý đề thi
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
                        Danh sách các bộ đề thi trắc nghiệm của bạn
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => setOpenCreate(true)}
                    sx={{ borderRadius: "12px", fontWeight: 700, px: 3, py: 1 }} // Button bo góc lớn, in đậm
                >
                    Tạo đề mới
                </Button>
            </HeaderBar>

            <Paper
                elevation={0}
                sx={{
                    p: 2.5, mb: 4, // mb={4} chuẩn spacing Bar đến Nội dung
                    flexShrink: 0,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                    border: '1px solid', borderColor: 'divider', borderRadius: 3
                }}
            >
                {/* Sử dụng chuẩn Grid v2 của MUIv6: spacing={3} (24px) */}
                <Grid container spacing={3} alignItems="center">
                    {/* Sử dụng prop size={{ ... }} thay vì xs, md trực tiếp */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                            fullWidth
                            size="small" // Chuẩn size="small" Form
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
                    // Empty state tuân thủ Card design và bo góc lớn
                    <Paper elevation={0} sx={{
                        flexGrow: 1, minHeight: '400px', p: { xs: 3, md: 6 },
                        textAlign: 'center', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        border: '2px dashed', borderColor: 'divider',
                        backgroundColor: 'transparent', borderRadius: 3, mt: 2
                    }}>
                        <QuizIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight={600} mt={2}>
                            Không tìm thấy đề thi nào
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mt: 1, mb: 3 }}>
                            Hãy thử thay đổi bộ lọc hoặc tạo mới một đề thi.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setOpenCreate(true)}
                            startIcon={<AddCircleOutlineIcon />}
                            sx={{ fontWeight: 700, px: 4, py: 1.5, borderRadius: '12px' }}
                        >
                            Tạo đề mới ngay
                        </Button>
                    </Paper>
                ) : (
                    // SỬA LỖI TẠI ĐÂY: Thêm pt: 1 (khoảng 8px đệm phía trên)
                    // để khi Card nhô lên (translateY(-2px)), mép trên không chạm vào vạch kẻ của Bar
                    <Grid container spacing={3} sx={{ pt: 1, pb: 2 }}>
                        {processedExams.map((exam) => (
                            // Loại bỏ prop 'item' cũ, dùng size={{ ... }} chuẩn MUIv6
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={exam.exam_id}>
                                <ExamCard onClick={() => navigate(`/tutor/exam/${exam.exam_id}`)}>
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}> {/* p={3} chuẩn spacing bên trong */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                            <LevelChip level={exam.level} />
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                {exam.createdAt ? dayjs(exam.createdAt).format('DD/MM/YYYY') : ''}
                                            </Typography>
                                        </Stack>

                                        <Typography variant="h6" fontWeight="700" noWrap title={exam.title} sx={{ mb: 1 }} color="text.primary">
                                            {exam.title}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{
                                            mb: 2, flexGrow: 1, minHeight: '40px',
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5
                                        }}>
                                            {exam.description || "Chưa có mô tả cho đề thi này."}
                                        </Typography>

                                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

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
                                </ExamCard>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </ScrollableContent>

            <CreateExamDialog open={openCreate} onClose={() => setOpenCreate(false)} onRefresh={fetchExams} />

            <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleToastClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={handleToastClose} severity={toast.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
                    {toast.msg}
                </Alert>
            </Snackbar>
        </PageWrapper>
    );
}

export default memo(ExamPage);