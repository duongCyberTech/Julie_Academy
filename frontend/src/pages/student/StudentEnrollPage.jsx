import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
    Box, Typography, Paper, Button, Avatar, Chip, Stack, TextField, InputAdornment, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    CircularProgress, Alert, Snackbar, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TablePagination,
<<<<<<< HEAD
    FormControl, InputLabel, Select, MenuItem, TableSortLabel, Tooltip
=======
    FormControl, InputLabel, Select, MenuItem, TableSortLabel
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
<<<<<<< HEAD
import { jwtDecode } from "jwt-decode"; 
=======
import { jwtDecode } from "jwt-decode"; // 1. Import JWT
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
<<<<<<< HEAD
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SchoolIcon from '@mui/icons-material/School';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import InfoIcon from '@mui/icons-material/Info';
=======
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SchoolIcon from '@mui/icons-material/School';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Icon đã tham gia
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; // Icon chờ
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4

import ClassDetailDrawer from '../parent/ClassDetailDrawer';
import { getAllClasses, requestEnrollment } from '../../services/ClassService';

<<<<<<< HEAD
// --- STYLED COMPONENTS ---
=======
// ... (Giữ nguyên phần Styled Components và Helper Functions cũ) ...
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
const PageContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: '#F8F9FA',
    minHeight: '100vh',
}));

const FilterBar = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    '& .MuiTableCell-head': {
        backgroundColor: '#eff6ff',
        fontWeight: 700,
        color: '#1e40af',
        borderBottom: `2px solid ${theme.palette.divider}`
    },
    '& .MuiTableRow-root:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        cursor: 'pointer'
    }
}));

<<<<<<< HEAD
// --- HELPER FUNCTIONS ---
const formatShortSchedule = (scheduleData) => {
    if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) return "Chưa xếp lịch";
    
    const daysStr = scheduleData.map(s => {
        const dayVal = s.meeting_date ?? s.day ?? s.day_of_week;
        const dayMap = { '2': 'T2', '3': 'T3', '4': 'T4', '5': 'T5', '6': 'T6', '7': 'T7', '8': 'CN', '1': 'CN', '0': 'CN' };
        return dayMap[String(dayVal)] || '?'; 
    }).join(', ');

    const first = scheduleData[0];
    const timeVal = first.startAt ?? first.startTime ?? '';
    const timeStr = timeVal.length > 5 ? timeVal.substring(0, 5) : timeVal;

    return `${daysStr} ${timeStr ? `(${timeStr})` : ''}`;
};

function StudentEnrollPage() {
    // --- STATE ---
    const [currentUserId, setCurrentUserId] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter
=======
function descendingComparator(a, b, orderBy) {
    if (orderBy === 'startat') return new Date(b.startat) - new Date(a.startat);
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

const formatShortSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return "Chưa xếp lịch";
    const days = schedule.map(s => {
        const dayMap = {2:'T2', 3:'T3', 4:'T4', 5:'T5', 6:'T6', 7:'T7', 8:'CN'};
        return dayMap[s.meeting_date];
    }).join(', ');
    return `${days} (${schedule[0].startAt})`;
};

// --- MAIN COMPONENT ---

function StudentEnrollPage() {
    const token = localStorage.getItem('token');
    
    // 2. Lấy UID của học sinh hiện tại để so sánh
    let currentStudentId = null;
    if (token) {
        try {
            const decoded = jwtDecode(token);
            currentStudentId = decoded.sub || decoded.uid;
        } catch (e) {}
    }

    // Data State
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter & Sort State
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    const [search, setSearch] = useState('');
    const [filterSubject, setFilterSubject] = useState('all');
    const [filterGrade, setFilterGrade] = useState('all');
    const [filterDate, setFilterDate] = useState(null); 
<<<<<<< HEAD
    
    // Pagination & Sort
=======
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('createdAt'); 
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

<<<<<<< HEAD
    // Dialogs
=======
    // UI State
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'info' });

<<<<<<< HEAD
    // --- EFFECT: GET USER ID ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Lấy UID từ token (thường là 'sub' hoặc 'uid' hoặc 'userId')
                setCurrentUserId(decoded.sub || decoded.uid || decoded.userId);
            } catch (e) {
                console.error("Token invalid");
            }
        }
    }, []);

    // --- EFFECT: FETCH DATA ---
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
=======
    const fetchData = useCallback(async () => {
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        if (!token) return;
        setLoading(true);
        try {
            const response = await getAllClasses({ limit: 200 }, token);
            const allList = Array.isArray(response) ? response : (response?.data || []);
<<<<<<< HEAD
            // Chỉ lấy lớp Pending (Tuyển sinh) hoặc Ongoing (Đang dạy)
            const validClasses = allList.filter(c => c.status === 'pending' || c.status === 'ongoing');
            setClasses(validClasses);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- LOGIC: KIỂM TRA TRẠNG THÁI ĐĂNG KÝ ---
    const getEnrollmentStatus = (row) => {
        if (!currentUserId || !row.learning) return null;
        // Tìm xem user hiện tại có trong danh sách learning của lớp không
        // Cần check kỹ cấu trúc trả về từ backend (thường là learning[].student.user.uid)
        const myRecord = row.learning.find(l => 
            l.student?.user?.uid === currentUserId || 
            l.student?.uid === currentUserId ||
            l.student_uid === currentUserId
        );
        return myRecord ? myRecord.status : null; // 'pending' | 'accepted' | 'cancelled' | null
    };

    // --- LOGIC: FILTER & SORT ---
=======
            const validClasses = allList.filter(c => c.status === 'pending' || c.status === 'ongoing');
            setClasses(validClasses);
        } catch (err) {
            setToast({ open: true, msg: "Lỗi tải danh sách lớp.", severity: "error" });
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ... (Logic Filter & Sort giữ nguyên) ...
    const uniqueSubjects = useMemo(() => [...new Set(classes.map(c => c.subject))].filter(Boolean), [classes]);
    const uniqueGrades = useMemo(() => [...new Set(classes.map(c => c.grade))].filter(Boolean).sort((a,b)=>a-b), [classes]);

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const filteredClasses = useMemo(() => {
        return classes.filter((cls) => {
<<<<<<< HEAD
            const s = search.toLowerCase();
            const matchSearch = cls.classname.toLowerCase().includes(s) || 
                                cls.tutor?.user?.lname?.toLowerCase().includes(s);
            const matchSubject = filterSubject === 'all' || cls.subject === filterSubject;
            const matchGrade = filterGrade === 'all' || cls.grade === filterGrade;
            
            let matchDate = true;
            if (filterDate && cls.startat) {
                matchDate = dayjs(cls.startat).isSame(dayjs(filterDate), 'day') || 
                            dayjs(cls.startat).isAfter(dayjs(filterDate), 'day');
=======
            const matchSearch = cls.classname.toLowerCase().includes(search.toLowerCase()) || 
                                cls.tutor?.user?.lname?.toLowerCase().includes(search.toLowerCase());
            const matchSubject = filterSubject === 'all' || cls.subject === filterSubject;
            const matchGrade = filterGrade === 'all' || cls.grade === filterGrade;
            let matchDate = true;
            if (filterDate && cls.startat) {
                const classDate = dayjs(cls.startat);
                const selectedDate = dayjs(filterDate);
                matchDate = classDate.isSame(selectedDate, 'day') || classDate.isAfter(selectedDate, 'day');
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
            }
            return matchSearch && matchSubject && matchGrade && matchDate;
        });
    }, [classes, search, filterSubject, filterGrade, filterDate]);

<<<<<<< HEAD
    const sortedRows = useMemo(() => {
        const comparator = (a, b) => {
            if (orderBy === 'startat') return new Date(b.startat) - new Date(a.startat);
            if (b[orderBy] < a[orderBy]) return -1;
            if (b[orderBy] > a[orderBy]) return 1;
            return 0;
        };
        const sorted = filteredClasses.slice().sort(comparator);
        return order === 'desc' ? sorted : sorted.reverse();
    }, [filteredClasses, order, orderBy]);

    const visibleRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // --- UNIQUE LISTS FOR SELECT ---
    const uniqueSubjects = useMemo(() => [...new Set(classes.map(c => c.subject))].filter(Boolean), [classes]);
    const uniqueGrades = useMemo(() => [...new Set(classes.map(c => c.grade))].filter(Boolean).sort((a,b)=>a-b), [classes]);

    // --- HANDLERS ---
=======
    const visibleRows = useMemo(() => {
        return filteredClasses.slice().sort(getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredClasses, order, orderBy, page, rowsPerPage]);

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    const handleOpenConfirm = (cls) => {
        setDrawerOpen(false);
        setSelectedClass(cls);
        setConfirmDialogOpen(true);
    };

<<<<<<< HEAD
    const handleSubmitEnroll = async () => {
        const token = localStorage.getItem('token');
        if (!token || !currentUserId) return;
        
        setIsSubmitting(true);
        try {
            // Gọi API request enroll
            // Lưu ý: API requestEnrollment nhận mảng student_ids
            await requestEnrollment(selectedClass.class_id, [currentUserId], token);
            
            setToast({ open: true, msg: "Gửi yêu cầu thành công!", severity: "success" });
            setConfirmDialogOpen(false);
            fetchData(); // Reload lại bảng
        } catch (err) {
            setToast({ open: true, msg: err.response?.data?.message || "Lỗi đăng ký.", severity: "error" });
=======
    const handleOpenDrawer = (cls) => {
        setSelectedClass(cls);
        setDrawerOpen(true);
    };

    const handleSubmit = async () => {
        if (!token) return;
        setIsSubmitting(true);
        try {
            await requestEnrollment(selectedClass.class_id, [currentStudentId], token);
            setToast({ open: true, msg: "Đăng ký thành công! Vui lòng chờ Gia sư duyệt.", severity: "success" });
            setConfirmDialogOpen(false);
            fetchData(); // Reload lại dữ liệu để cập nhật trạng thái nút
        } catch (err) {
            setToast({ open: true, msg: err.response?.data?.message || "Đăng ký thất bại.", severity: "error" });
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        } finally {
            setIsSubmitting(false);
        }
    };

<<<<<<< HEAD
    // --- RENDER ACTION BUTTON ---
    const renderActionButton = (row) => {
        const status = getEnrollmentStatus(row);

        if (status === 'accepted') {
            return (
                <Chip 
                    icon={<CheckCircleIcon />} 
                    label="Đã tham gia" 
                    color="success" 
                    variant="outlined" 
                    sx={{ fontWeight: 600, bgcolor: '#ecfdf5', border: 'none', color: '#059669' }} 
                />
            );
        }
        if (status === 'pending') {
            return (
                <Chip 
                    icon={<HourglassEmptyIcon />} 
                    label="Chờ duyệt" 
                    color="warning" 
                    variant="outlined" 
                    sx={{ fontWeight: 600, bgcolor: '#fffbeb', border: 'none', color: '#d97706' }} 
                />
            );
        }

        // Nếu chưa đăng ký
=======
    // --- 3. HÀM RENDER NÚT BẤM (MỚI) ---
    const renderActionButton = (row) => {
        // Tìm xem học sinh này có trong danh sách learning của lớp không
        const myRecord = row.learning?.find(l => l.student?.user?.uid === currentStudentId);
        const status = myRecord?.status;

        // Case: Đang chờ duyệt
        if (status === 'pending') {
            return (
                <Button 
                    variant="outlined" 
                    size="small" 
                    color="warning"
                    startIcon={<HourglassEmptyIcon />}
                    disabled
                    sx={{ textTransform: 'none', borderRadius: 2, color: '#f59e0b', borderColor: '#f59e0b' }}
                >
                    Đang chờ duyệt
                </Button>
            );
        }

        // Case: Đã tham gia
        if (status === 'accepted') {
            return (
                <Button 
                    variant="contained" 
                    size="small" 
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    disabled
                    sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#dcfce7', color: '#166534', '&:disabled': {bgcolor: '#dcfce7', color: '#166534'} }}
                >
                    Đã tham gia
                </Button>
            );
        }

        // Case: Chưa đăng ký -> Nút bấm bình thường
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        return (
            <Button 
                variant="contained" 
                size="small" 
<<<<<<< HEAD
                disableElevation
                startIcon={<AddCircleOutlineIcon />}
                onClick={(e) => { e.stopPropagation(); handleOpenConfirm(row); }} 
                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb', '&:hover': {bgcolor: '#1d4ed8'} }}
=======
                startIcon={<AddCircleOutlineIcon />}
                onClick={(e) => { e.stopPropagation(); handleOpenConfirm(row); }} 
                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb', '&:hover': {bgcolor: '#1d4ed8'}, boxShadow: 'none' }}
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
            >
                Đăng ký
            </Button>
        );
    };

<<<<<<< HEAD
=======
    // ... (Phần UI Filter giữ nguyên) ...

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    if (loading) return <Box height="100vh" display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>;

    return (
        <PageContainer>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="700" color="#1e3a8a">Tìm kiếm lớp học</Typography>
                <Typography variant="body2" color="text.secondary">Khám phá các khóa học mới và đăng ký tham gia</Typography>
            </Box>

<<<<<<< HEAD
            {/* --- FILTER BAR --- */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <FilterBar elevation={0}>
                    <TextField 
                        placeholder="Tìm lớp, giáo viên..." 
                        size="small" 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action"/></InputAdornment> }} 
                        sx={{ width: 280 }} 
                    />
=======
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <FilterBar elevation={0}>
                    {/* (Giữ nguyên các filter) */}
                    <TextField placeholder="Tìm lớp, thầy cô..." size="small" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action"/></InputAdornment> }} sx={{ width: 280 }} />
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Môn học</InputLabel>
                        <Select value={filterSubject} label="Môn học" onChange={(e) => setFilterSubject(e.target.value)}>
                            <MenuItem value="all"><em>Tất cả</em></MenuItem>
                            {uniqueSubjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Khối</InputLabel>
                        <Select value={filterGrade} label="Khối" onChange={(e) => setFilterGrade(e.target.value)}>
                            <MenuItem value="all"><em>Tất cả</em></MenuItem>
                            {uniqueGrades.map(g => <MenuItem key={g} value={g}>Khối {g}</MenuItem>)}
                        </Select>
                    </FormControl>
<<<<<<< HEAD
                    <DatePicker 
                        label="Khai giảng từ" 
                        value={filterDate} 
                        onChange={(v) => setFilterDate(v)} 
                        slotProps={{ textField: { size: 'small', sx: { width: 170 } } }} 
                    />
                    <Button 
                        variant="text" 
                        color="inherit"
                        startIcon={<RestartAltIcon/>} 
                        onClick={() => {setSearch(''); setFilterSubject('all'); setFilterGrade('all'); setFilterDate(null); setPage(0);}} 
                        sx={{ ml: 'auto' }}
                    >
                        Đặt lại
                    </Button>
                </FilterBar>
            </LocalizationProvider>

            {/* --- TABLE --- */}
=======
                    <DatePicker label="Khai giảng từ" value={filterDate} onChange={(v) => setFilterDate(v)} slotProps={{ textField: { size: 'small', sx: { width: 170 } } }} />
                    <Button variant="text" startIcon={<RestartAltIcon/>} onClick={() => {setSearch(''); setFilterSubject('all'); setFilterGrade('all'); setFilterDate(null); setPage(0);}} sx={{ ml: 'auto' }}>Đặt lại</Button>
                </FilterBar>
            </LocalizationProvider>

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
            <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <StyledTableContainer>
                    <Table sx={{ minWidth: 750 }}>
                        <TableHead>
                            <TableRow>
<<<<<<< HEAD
                                <TableCell width="25%"><TableSortLabel active={orderBy === 'classname'} direction={order} onClick={() => handleRequestSort('classname')}>Tên lớp học</TableSortLabel></TableCell>
                                <TableCell width="20%">Giáo viên</TableCell>
                                <TableCell width="15%">Lịch học</TableCell>
                                <TableCell width="10%">Môn/Khối</TableCell>
                                <TableCell width="15%"><TableSortLabel active={orderBy === 'startat'} direction={order} onClick={() => handleRequestSort('startat')}>Khai giảng</TableSortLabel></TableCell>
                                <TableCell width="15%" align="center">Trạng thái</TableCell>
=======
                                <TableCell width="25%"><TableSortLabel active={orderBy === 'classname'} direction={orderBy === 'classname' ? order : 'asc'} onClick={() => handleRequestSort('classname')}>Tên lớp học</TableSortLabel></TableCell>
                                <TableCell width="20%">Giáo viên</TableCell>
                                <TableCell width="15%">Lịch học</TableCell>
                                <TableCell width="10%">Môn/Khối</TableCell>
                                <TableCell width="15%"><TableSortLabel active={orderBy === 'startat'} direction={orderBy === 'startat' ? order : 'asc'} onClick={() => handleRequestSort('startat')}>Khai giảng</TableSortLabel></TableCell>
                                <TableCell width="15%" align="center">Hành động</TableCell>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleRows.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không tìm thấy lớp học nào.</TableCell></TableRow>
                            ) : (
                                visibleRows.map((row) => (
                                    <TableRow key={row.class_id} hover onClick={() => handleOpenDrawer(row)}>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight="bold" color="#1d4ed8">{row.classname}</Typography>
<<<<<<< HEAD
                                            <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
                                                <Chip label={row.status === 'pending' ? 'Tuyển sinh' : 'Đang học'} size="small" color={row.status === 'pending' ? 'success' : 'default'} sx={{height: 20, fontSize: '0.65rem', fontWeight: 600}}/>
                                                <Typography variant="caption" color="text.secondary">{row.nb_of_student} học viên</Typography>
=======
                                            <Stack direction="row" spacing={1} mt={0.5}>
                                                <Chip label={row.status === 'pending' ? 'Tuyển sinh' : 'Đang học'} size="small" color={row.status === 'pending' ? 'success' : 'default'} sx={{height: 20, fontSize: '0.65rem', fontWeight: 600}}/>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Avatar src={row.tutor?.user?.avata_url} sx={{ width: 36, height: 36, border: '1px solid #e0e7ff' }}>{row.tutor?.user?.lname?.charAt(0)}</Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600} color="#1e293b">{row.tutor?.user?.lname} {row.tutor?.user?.fname}</Typography>
<<<<<<< HEAD
                                                    <Typography variant="caption" color="text.secondary">Gia sư</Typography>
=======
                                                    <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}><SchoolIcon sx={{fontSize:12}}/> Giáo viên</Typography>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="600" color="#b45309">
                                                {formatShortSchedule(row.schedule)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={row.subject} size="small" sx={{bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: 'none'}} />
                                            <Typography variant="caption" color="text.secondary" ml={1}>K{row.grade}</Typography>
                                        </TableCell>
                                        <TableCell>{row.startat ? dayjs(row.startat).format('DD/MM/YYYY') : '---'}</TableCell>
                                        
<<<<<<< HEAD
                                        <TableCell align="center">
                                            {renderActionButton(row)}
                                        </TableCell>
=======
                                        {/* --- 4. GỌI HÀM RENDER NÚT BẤM MỚI --- */}
                                        <TableCell align="center">
                                            {renderActionButton(row)}
                                        </TableCell>
                                        {/* ------------------------------------ */}

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredClasses.length} rowsPerPage={rowsPerPage} page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    labelRowsPerPage="Số dòng:"
                />
            </Paper>

<<<<<<< HEAD
            {/* --- DRAWER CHI TIẾT --- */}
=======
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
            <ClassDetailDrawer 
                open={drawerOpen} 
                onClose={() => setDrawerOpen(false)} 
                classData={selectedClass} 
<<<<<<< HEAD
                onEnrollClick={() => handleOpenConfirm(selectedClass)}
                // Truyền trạng thái vào drawer để ẩn nút đăng ký nếu đã tham gia
                isEnrolled={selectedClass && ['pending', 'accepted'].includes(getEnrollmentStatus(selectedClass))}
            />

            {/* --- CONFIRM DIALOG --- */}
=======
                onEnrollClick={handleOpenConfirm} 
            />

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
            <Dialog open={confirmDialogOpen} onClose={() => !isSubmitting && setConfirmDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                    <HelpOutlineIcon sx={{ fontSize: 48, color: '#2563eb', mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Xác nhận đăng ký</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography textAlign="center" color="text.secondary">
<<<<<<< HEAD
                        Bạn có chắc chắn muốn tham gia lớp <strong>{selectedClass?.classname}</strong>?
                    </Typography>
                    <Box mt={2} p={1.5} bgcolor="#eff6ff" borderRadius={2} display="flex" gap={1} alignItems="start">
                        <InfoIcon fontSize="small" color="info" sx={{mt:0.3}} />
                        <Typography variant="caption" color="text.secondary" textAlign="left">
                            Yêu cầu sẽ được gửi đến Gia sư. Bạn sẽ nhận được thông báo khi được duyệt.
=======
                        Bạn có chắc chắn muốn gửi yêu cầu tham gia lớp học <strong>{selectedClass?.classname}</strong> không?
                    </Typography>
                    <Box mt={2} p={1.5} bgcolor="#eff6ff" borderRadius={2} textAlign="center">
                        <Typography variant="caption" color="primary">
                            Yêu cầu sẽ được gửi đến Giáo viên để phê duyệt.
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
<<<<<<< HEAD
                    <Button onClick={() => setConfirmDialogOpen(false)} disabled={isSubmitting} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>Hủy</Button>
                    <Button onClick={handleSubmitEnroll} variant="contained" disabled={isSubmitting} startIcon={isSubmitting && <CircularProgress size={20} color="inherit"/>} sx={{ borderRadius: 2, px: 3 }}>
                        {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- TOAST --- */}
=======
                    <Button onClick={() => setConfirmDialogOpen(false)} disabled={isSubmitting} variant="outlined" color="inherit" sx={{ borderRadius: 2, px: 3 }}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting} startIcon={isSubmitting && <CircularProgress size={20} color="inherit"/>} sx={{ borderRadius: 2, px: 3, bgcolor: '#2563eb' }}>{isSubmitting ? "Đang gửi..." : "Xác nhận"}</Button>
                </DialogActions>
            </Dialog>

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={toast.severity} variant="filled" onClose={() => setToast(prev => ({ ...prev, open: false }))}>{toast.msg}</Alert>
            </Snackbar>
        </PageContainer>
    );
}

export default memo(StudentEnrollPage);