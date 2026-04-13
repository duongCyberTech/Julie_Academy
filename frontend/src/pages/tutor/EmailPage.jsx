import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, CircularProgress,
    Card, CardContent, Stack, Chip, Divider, Grid,
    TextField, InputAdornment, Snackbar, Alert,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import dayjs from 'dayjs';
import { getAllEmailChains } from '../../services/EmailService';

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
        [theme.breakpoints.down('md')]: {
            margin: theme.spacing(1),
            padding: theme.spacing(2),
        }
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

const EmailCard = styled(Card)(({ theme }) => {
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
        cursor: 'pointer',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: isDark
                ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`
                : '0px 12px 24px rgba(0,0,0,0.06)',
            borderColor: theme.palette.primary.main,
        }
    };
});

const TypeChip = memo(({ useTemplate }) => {
    const label = useTemplate ? "Mẫu có sẵn" : "Tùy chỉnh";
    const color = useTemplate ? "info" : "primary";
    return <Chip label={label} color={color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
});

function EmailPage() {
    const navigate = useNavigate();
    const { class_id } = useParams();
    const theme = useTheme();
    
    const [token] = useState(() => localStorage.getItem('token'));
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'info' });

    const fetchEmails = useCallback(async () => {
        if (!token || !class_id) return;
        setLoading(true);
        try {
            const res = await getAllEmailChains(class_id, token);
            setEmails(Array.isArray(res) ? res : (res?.data || []));
        } catch (err) {
            setToast({ open: true, msg: "Lỗi tải cấu hình email", severity: "error" });
        } finally {
            setLoading(false);
        }
    }, [token, class_id]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    const processedEmails = useMemo(() => {
        let result = [...emails];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(e => (e.subject || e.config_id).toLowerCase().includes(lowerTerm));
        }

        if (filterType !== "all") {
            const isTemplate = filterType === "template";
            result = result.filter(e => e.use_template === isTemplate);
        }

        result.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            
            switch (sortBy) {
                case 'oldest': return dateA - dateB;
                case 'newest':
                default: return dateB - dateA;
            }
        });

        return result;
    }, [emails, searchTerm, filterType, sortBy]);

    const handleToastClose = useCallback(() => setToast(prev => ({ ...prev, open: false })), []);

    return (
        <PageWrapper>
            <HeaderBar>
                <Box>
                    <Typography variant="h4" fontWeight="700" color="text.primary">
                        Cấu hình Email
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
                        Quản lý chuỗi thông báo email cho lớp học
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => navigate(`/tutor/class/${class_id}/email/create`)}
                    sx={{ borderRadius: "12px", fontWeight: 700, px: 3, py: 1 }}
                >
                    Tạo cấu hình
                </Button>
            </HeaderBar>

            <Paper
                elevation={0}
                sx={{
                    p: 2.5, mb: 4,
                    flexShrink: 0,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    border: '1px solid', borderColor: 'divider', borderRadius: 3
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Tìm kiếm cấu hình..."
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
                            <InputLabel>Loại cấu hình</InputLabel>
                            <Select
                                value={filterType}
                                label="Loại cấu hình"
                                onChange={(e) => setFilterType(e.target.value)}
                                startAdornment={<InputAdornment position="start"><FilterListIcon fontSize="small" /></InputAdornment>}
                            >
                                <MenuItem value="all">Tất cả</MenuItem>
                                <MenuItem value="template">Mẫu có sẵn</MenuItem>
                                <MenuItem value="custom">Tùy chỉnh</MenuItem>
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
                ) : processedEmails.length === 0 ? (
                    <Paper elevation={0} sx={{
                        flexGrow: 1, minHeight: '400px', p: { xs: 3, md: 6 },
                        textAlign: 'center', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        border: '2px dashed', borderColor: 'divider',
                        backgroundColor: 'transparent', borderRadius: 3, mt: 2
                    }}>
                        <EmailIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight={600} mt={2}>
                            Chưa có cấu hình email nào
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mt: 1, mb: 3 }}>
                            Thêm email chain mới để gửi thông báo tự động cho lớp học.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate(`/tutor/class/${class_id}/email/create`)}
                            startIcon={<AddCircleOutlineIcon />}
                            sx={{ fontWeight: 700, px: 4, py: 1.5, borderRadius: '12px' }}
                        >
                            Tạo cấu hình ngay
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3} sx={{ pt: 1, pb: 2 }}>
                        {processedEmails.map((email) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={email.config_id}>
                                <EmailCard onClick={() => navigate(`/tutor/class/${class_id}/email/${email.config_id}`)}>
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                            <TypeChip useTemplate={email.use_template} />
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                {email.createdAt ? dayjs(email.createdAt).format('DD/MM/YYYY') : ''}
                                            </Typography>
                                        </Stack>

                                        <Typography variant="h6" fontWeight="700" noWrap title={email.subject || email.config_id} sx={{ mb: 1 }} color="text.primary">
                                            {email.subject || "No Subject"}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{
                                            mb: 2, flexGrow: 1, minHeight: '40px',
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5
                                        }}>
                                            {email.body ? String(email.body).replace(/<[^>]+>/g, '') : "Chưa có nội dung thiết lập."}
                                        </Typography>

                                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            ID: {String(email.config_id).slice(-8).toUpperCase()}
                                        </Typography>
                                    </CardContent>
                                </EmailCard>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </ScrollableContent>

            <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleToastClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={handleToastClose} severity={toast.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
                    {toast.msg}
                </Alert>
            </Snackbar>
        </PageWrapper>
    );
}

export default memo(EmailPage);