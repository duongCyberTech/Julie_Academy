import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
    Box, Typography, Paper, Button, Avatar, Chip, Stack, TextField, InputAdornment, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Checkbox, List, ListItem, ListItemButton, ListItemAvatar, 
    ListItemText, CircularProgress, Alert, Snackbar, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    FormControl, InputLabel, Select, MenuItem, TableSortLabel, Tooltip
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
<<<<<<< HEAD
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

=======
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Icon xem chi tiết

// Import Component Mới
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
import ClassDetailDrawer from './ClassDetailDrawer';

import { getAllClasses, requestEnrollment } from '../../services/ClassService';
import { getMyChildren } from '../../services/UserService'; 

<<<<<<< HEAD
// ==========================================
// STYLED COMPONENTS (SOFT UI)
// ==========================================
const PageWrapper = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
    padding: theme.spacing(4),
    backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.paper,
    borderRadius: '24px',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
=======
// --- STYLED COMPONENTS (Giữ nguyên) ---
const PageContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: '#F4F6F8',
    minHeight: '100vh',
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
}));

const FilterBar = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    borderRadius: '16px',
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none'
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    flexGrow: 1, 
    overflowY: "auto",
    "&::-webkit-scrollbar": { width: "6px", height: "6px" },
    "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: alpha(theme.palette.grey[400], 0.5),
      borderRadius: "10px",
    },
    '& .MuiTableCell-head': {
        backgroundColor: alpha(theme.palette.grey[100], 0.8),
        backdropFilter: 'blur(8px)',
        fontWeight: 700,
        color: theme.palette.text.primary,
        borderBottom: `2px solid ${theme.palette.divider}`
    },
    '& .MuiTableRow-root:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
<<<<<<< HEAD
        cursor: 'pointer'
    }
}));

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
=======
        cursor: 'pointer' // Thêm con trỏ để biết click được
    }
}));

// --- HELPER FUNCTIONS ---
function descendingComparator(a, b, orderBy) {
    if (orderBy === 'startat') {
        return new Date(b.startat) - new Date(a.startat);
    }
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// Hàm format lịch học cho gọn để hiển thị ở bảng (VD: T2, T4 | 19:00)
const formatShortSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return "Chưa có lịch";
    // Nhóm theo giờ
    const days = schedule.map(s => {
        const dayMap = {2:'T2', 3:'T3', 4:'T4', 5:'T5', 6:'T6', 7:'T7', 8:'CN'};
        return dayMap[s.meeting_date];
    }).join(', ');
    
    // Lấy giờ của buổi đầu tiên làm mẫu (thường lịch học giờ giống nhau)
    const time = `${schedule[0].startAt}`;
    return `${days} (${time})`;
};

// --- MAIN COMPONENT ---
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4

function ParentEnrollPage() {
    const [classes, setClasses] = useState([]);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [filterSubject, setFilterSubject] = useState('all');
    const [filterGrade, setFilterGrade] = useState('all');
    const [filterDate, setFilterDate] = useState(null); 

    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('createdAt'); 
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

<<<<<<< HEAD
    const [dialogOpen, setDialogOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false); 
=======
    // Dialog & Drawer State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false); // State cho Drawer
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedChildIds, setSelectedChildIds] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'info' });

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoading(true);
        try {
            const [classRes, childRes] = await Promise.all([
                getAllClasses({ limit: 200 }, token), 
                getMyChildren(token)
            ]);

            const allList = Array.isArray(classRes) ? classRes : (classRes?.data || []);
            // Lọc lớp Pending và Ongoing (như logic backend)
            const validClasses = allList.filter(c => c.status === 'pending' || c.status === 'ongoing');

            setClasses(validClasses);
            setChildren(Array.isArray(childRes) ? childRes : (childRes?.data || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

<<<<<<< HEAD
=======
    // --- LOGIC FILTER & SORT ---
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
            const s = search.toLowerCase();
            const tutorName = [cls.tutor?.user?.lname, cls.tutor?.user?.mname, cls.tutor?.user?.fname].filter(Boolean).join(" ").toLowerCase();
            const matchSearch = cls.classname.toLowerCase().includes(s) || tutorName.includes(s);
            const matchSubject = filterSubject === 'all' || cls.subject === filterSubject;
            const matchGrade = filterGrade === 'all' || cls.grade === filterGrade;
            
            let matchDate = true;
            if (filterDate && cls.startat) {
                matchDate = dayjs(cls.startat).isSame(dayjs(filterDate), 'day') || 
                            dayjs(cls.startat).isAfter(dayjs(filterDate), 'day');
            }
            return matchSearch && matchSubject && matchGrade && matchDate;
        });
    }, [classes, search, filterSubject, filterGrade, filterDate]);

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
    const uniqueSubjects = useMemo(() => [...new Set(classes.map(c => c.subject))].filter(Boolean), [classes]);
    const uniqueGrades = useMemo(() => [...new Set(classes.map(c => c.grade))].filter(Boolean).sort((a,b)=>a-b), [classes]);

<<<<<<< HEAD
    const handleOpenEnrollDialog = (cls) => {
=======
    // Mở Dialog Đăng ký (Từ nút hoặc từ Drawer)
    const handleOpenEnrollDialog = (cls) => {
        // Đóng drawer nếu đang mở để tập trung vào việc đăng ký
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        setDrawerOpen(false); 
        setSelectedClass(cls);
        setSelectedChildIds([]);
        setDialogOpen(true);
    };

<<<<<<< HEAD
=======
    // Mở Drawer xem chi tiết (Khi click vào tên lớp hoặc nút Info)
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    const handleOpenDrawer = (cls) => {
        setSelectedClass(cls);
        setDrawerOpen(true);
    };

    const handleToggleChild = (childId) => {
        const currentIndex = selectedChildIds.indexOf(childId);
        const newChecked = [...selectedChildIds];
        currentIndex === -1 ? newChecked.push(childId) : newChecked.splice(currentIndex, 1);
        setSelectedChildIds(newChecked);
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token || selectedChildIds.length === 0) return;
        
        setIsSubmitting(true);
        try {
            // API nhận body là mảng string[] theo đúng test Postman của bạn
            await requestEnrollment(selectedClass.class_id, selectedChildIds, token);
            setToast({ open: true, msg: "Đăng ký thành công!", severity: "success" });
            setDialogOpen(false);
            fetchData();
        } catch (err) {
            setToast({ open: true, msg: err.response?.data?.message || "Lỗi đăng ký.", severity: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getChildEnrollStatus = (childId, classData) => {
        if (!classData?.learning) return null;
        const record = classData.learning.find(l => 
            l.student?.uid === childId || l.student_uid === childId || l.student?.user?.uid === childId
        );
        return record ? record.status : null;
    };

    if (loading) return <Box height="100vh" display="flex" justifyContent="center" alignItems="center"><CircularProgress sx={{ color: '#ea580c' }} /></Box>;

    return (
        <PageWrapper>
            <Box mb={4}>
<<<<<<< HEAD
                <Typography variant="h4" fontWeight="bold" color="#1e293b">Đăng ký lớp học</Typography>
                <Typography variant="body2" color="text.secondary">Tìm kiếm lớp học và đăng ký cho con</Typography>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <FilterBar>
                    <TextField 
                        placeholder="Tìm lớp, giáo viên..." 
=======
                <Typography variant="h4" fontWeight="600" color="text.primary">Đăng ký lớp học</Typography>
                <Typography variant="body2" color="text.secondary">Tìm kiếm lớp học, xem lịch giảng dạy và đăng ký cho con</Typography>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <FilterBar elevation={0}>
                    {/* ... (Phần Filter giữ nguyên như code cũ) ... */}
                    <TextField 
                        placeholder="Tìm tên lớp, giáo viên..." 
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                        size="small" 
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action"/></InputAdornment> }}
                        sx={{ flexGrow: 1, minWidth: 250, bgcolor: 'background.paper', borderRadius: 1 }}
                    />
<<<<<<< HEAD
                    <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper', borderRadius: 1 }}>
=======
                    <FormControl size="small" sx={{ minWidth: 140 }}>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                        <InputLabel>Môn học</InputLabel>
                        <Select value={filterSubject} label="Môn học" onChange={(e) => setFilterSubject(e.target.value)}>
                            <MenuItem value="all"><em>Tất cả môn</em></MenuItem>
                            {uniqueSubjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>
<<<<<<< HEAD
                    <FormControl size="small" sx={{ minWidth: 120, bgcolor: 'background.paper', borderRadius: 1 }}>
=======
                    <FormControl size="small" sx={{ minWidth: 100 }}>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                        <InputLabel>Khối</InputLabel>
                        <Select value={filterGrade} label="Khối" onChange={(e) => setFilterGrade(e.target.value)}>
                            <MenuItem value="all"><em>Tất cả khối</em></MenuItem>
                            {uniqueGrades.map(g => <MenuItem key={g} value={g}>Khối {g}</MenuItem>)}
                        </Select>
                    </FormControl>
<<<<<<< HEAD
                    <DatePicker 
                        label="Khai giảng từ" 
                        value={filterDate} 
                        onChange={(newValue) => setFilterDate(newValue)} 
                        slotProps={{ textField: { size: 'small', sx: { minWidth: 160, bgcolor: 'background.paper', borderRadius: 1 } } }} 
                    />
                    <Button 
                        variant="outlined" 
                        color="inherit"
                        startIcon={<RestartAltIcon/>} 
                        onClick={() => {setSearch(''); setFilterSubject('all'); setFilterGrade('all'); setFilterDate(null); setPage(0);}} 
                        sx={{ bgcolor: 'background.paper' }}
                    >
                        Đặt lại
                    </Button>
=======
                    <DatePicker label="Khai giảng từ" value={filterDate} onChange={(newValue) => setFilterDate(newValue)} slotProps={{ textField: { size: 'small', sx: { width: 170 } } }} />
                    <Button variant="text" startIcon={<RestartAltIcon/>} onClick={handleResetFilter} color="inherit" sx={{ ml: 'auto' }}>Đặt lại</Button>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                </FilterBar>
            </LocalizationProvider>

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
                <StyledTableContainer>
                    <Table stickyHeader sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow>
<<<<<<< HEAD
                                <TableCell sx={{ minWidth: 200 }}><TableSortLabel active={orderBy === 'classname'} direction={order} onClick={() => handleRequestSort('classname')}>Tên lớp học</TableSortLabel></TableCell>
                                <TableCell sx={{ minWidth: 180 }}>Giáo viên</TableCell>
                                <TableCell sx={{ minWidth: 140 }}>Lịch học</TableCell>
                                <TableCell sx={{ minWidth: 120 }}>Môn/Khối</TableCell>
                                <TableCell sx={{ minWidth: 140 }}><TableSortLabel active={orderBy === 'startat'} direction={order} onClick={() => handleRequestSort('startat')}>Khai giảng</TableSortLabel></TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>Hành động</TableCell>
=======
                                <TableCell width="25%"><TableSortLabel active={orderBy === 'classname'} direction={orderBy === 'classname' ? order : 'asc'} onClick={() => handleRequestSort('classname')}>Tên lớp học</TableSortLabel></TableCell>
                                <TableCell width="20%">Giáo viên</TableCell>
                                <TableCell width="15%">Lịch học (Tóm tắt)</TableCell> {/* Cột Mới */}
                                <TableCell width="10%">Môn/Khối</TableCell>
                                <TableCell width="15%"><TableSortLabel active={orderBy === 'startat'} direction={orderBy === 'startat' ? order : 'asc'} onClick={() => handleRequestSort('startat')}>Khai giảng</TableSortLabel></TableCell>
                                <TableCell width="15%" align="center">Hành động</TableCell>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleRows.length === 0 ? (
<<<<<<< HEAD
                                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>Không tìm thấy lớp học nào.</TableCell></TableRow>
=======
                                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không tìm thấy lớp học nào.</TableCell></TableRow>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                            ) : (
                                visibleRows.map((row) => (
                                    <TableRow key={row.class_id} hover onClick={() => handleOpenDrawer(row)}>
                                        <TableCell>
<<<<<<< HEAD
                                            <Typography variant="subtitle2" fontWeight="bold" color="primary.main" sx={{ wordBreak: 'break-word' }}>
                                                {row.classname}
                                            </Typography>
                                            <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
                                                <Chip label={row.status === 'pending' ? 'Tuyển sinh' : 'Đang học'} size="small" color={row.status === 'pending' ? 'success' : 'default'} sx={{height: 20, fontSize: '0.65rem', fontWeight: 600}}/>
                                                <Typography variant="caption" color="text.secondary">{row.nb_of_student} học viên</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Avatar src={row.tutor?.user?.avata_url} sx={{ width: 36, height: 36, bgcolor: '#fdba74', color: 'white' }}>{row.tutor?.user?.lname?.charAt(0)}</Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ wordBreak: 'break-word' }}>
                                                        {[row.tutor?.user?.lname, row.tutor?.user?.mname, row.tutor?.user?.fname].filter(Boolean).join(" ")}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">Gia sư</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="600" color="text.secondary">
=======
                                            <Typography variant="subtitle2" fontWeight="bold" color="primary.main">{row.classname}</Typography>
                                            <Stack direction="row" spacing={1} mt={0.5}>
                                                <Chip label={row.status === 'pending' ? 'Sắp mở' : 'Đang học'} size="small" color={row.status === 'pending' ? 'success' : 'default'} sx={{height: 20, fontSize: '0.65rem'}}/>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Avatar src={row.tutor?.user?.avata_url} sx={{ width: 32, height: 32 }}>{row.tutor?.user?.lname?.charAt(0)}</Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>{row.tutor?.user?.lname} {row.tutor?.user?.fname}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        {/* Cột Lịch học mới */}
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="600" color="#eab308">
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                                                {formatShortSchedule(row.schedule)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
<<<<<<< HEAD
                                            <Chip label={row.subject} size="small" sx={{ fontWeight: 600, mb: 0.5 }} />
                                            <Typography variant="caption" color="text.secondary" display="block">Khối {row.grade}</Typography>
=======
                                            <Typography variant="body2">{row.subject}</Typography>
                                            <Typography variant="caption" color="text.secondary">Khối {row.grade}</Typography>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                                        </TableCell>
                                        <TableCell>{row.startat ? dayjs(row.startat).format('DD/MM/YYYY') : '---'}</TableCell>
                                        <TableCell align="center">
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                disableElevation
                                                startIcon={<PersonAddIcon />}
<<<<<<< HEAD
                                                onClick={(e) => { e.stopPropagation(); handleOpenEnrollDialog(row); }}
                                                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#ea580c', '&:hover': {bgcolor: '#c2410c'}, fontWeight: 'bold' }}
=======
                                                onClick={(e) => { e.stopPropagation(); handleOpenEnrollDialog(row); }} // Chặn sự kiện click row
                                                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#f97316', '&:hover': {bgcolor: '#ea580c'} }}
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                                            >
                                                Đăng ký
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
                <TablePagination
<<<<<<< HEAD
                    sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider' }}
=======
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                    rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredClasses.length} rowsPerPage={rowsPerPage} page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    labelRowsPerPage="Số dòng mỗi trang:"
                />
            </Paper>

<<<<<<< HEAD
=======
            {/* --- DRAWER CHI TIẾT LỚP HỌC (MỚI) --- */}
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
            <ClassDetailDrawer 
                open={drawerOpen} 
                onClose={() => setDrawerOpen(false)} 
                classData={selectedClass} 
                onEnrollClick={handleOpenEnrollDialog} 
            />

<<<<<<< HEAD
            <Dialog open={dialogOpen} onClose={() => !isSubmitting && setDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
=======
            {/* --- DIALOG CHỌN CON (GIỮ NGUYÊN LOGIC CŨ, CHỈNH LẠI UI) --- */}
            <Dialog open={dialogOpen} onClose={() => !isSubmitting && setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                    <Typography variant="h6" fontWeight="bold">Chọn con để đăng ký</Typography>
                    {!isSubmitting && <IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon/></IconButton>}
                </DialogTitle>
                <DialogContent dividers>
<<<<<<< HEAD
                    <Box mb={2} p={2} bgcolor="#fff7ed" borderRadius={2} border="1px dashed #fdba74">
                        <Typography variant="body2" color="#c2410c" sx={{ wordBreak: 'break-word' }}>
                            Đăng ký lớp học: <strong>{selectedClass?.classname}</strong>
=======
                    <Box mb={2} p={2} bgcolor="#fff7ed" borderRadius={1} border="1px dashed #fdba74">
                        <Typography variant="body2" color="#c2410c">
                            Đăng ký vào lớp: <strong>{selectedClass?.classname}</strong>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                        </Typography>
                    </Box>
                    {children.length === 0 ? (
                        <Box textAlign="center" py={4}>
                            <ChildCareIcon sx={{ fontSize: 48, color: '#9ca3af', opacity: 0.5, mb: 1 }} />
                            <Typography color="text.secondary">Chưa có tài khoản học sinh nào được liên kết.</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {children.map((child) => {
                                const userInfo = child.user || {};
                                const studentInfo = child.studentInfo || {};
                                const currentStatus = getChildEnrollStatus(child.uid, selectedClass);
                                const isEnrolled = !!currentStatus;
                                const isChecked = selectedChildIds.indexOf(child.uid) !== -1;
<<<<<<< HEAD
                                const fullName = [userInfo.lname, userInfo.mname, userInfo.fname].filter(Boolean).join(" ");
                                
                                return (
                                    <ListItem 
                                        key={child.uid} 
                                        disablePadding 
                                        divider 
                                        sx={{ 
                                            bgcolor: isChecked ? '#fff7ed' : 'inherit',
                                            opacity: isEnrolled ? 0.7 : 1
                                        }}
                                        secondaryAction={
                                            isEnrolled ? (
                                                <Chip 
                                                    size="small" 
                                                    label={currentStatus === 'accepted' ? "Đã tham gia" : "Đang chờ"} 
                                                    color={currentStatus === 'accepted' ? "success" : "warning"}
                                                    variant="outlined"
                                                    icon={currentStatus === 'accepted' ? <CheckCircleIcon/> : <HourglassEmptyIcon/>}
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            ) : (
                                                <Checkbox 
                                                    checked={isChecked} 
                                                    onChange={() => handleToggleChild(child.uid)}
                                                    icon={<CheckCircleIcon color="disabled" fontSize="medium" />} 
                                                    checkedIcon={<CheckCircleIcon sx={{color: '#ea580c'}} fontSize="medium" />} 
                                                />
                                            )
                                        }
                                    >
                                        <ListItemButton onClick={() => !isEnrolled && handleToggleChild(child.uid)} disabled={isEnrolled} sx={{ py: 1.5 }}>
                                            <ListItemAvatar>
                                                <Avatar src={userInfo.avata_url} sx={{ bgcolor: isChecked ? '#ea580c' : '#e5e7eb', color: isChecked ? '#fff' : '#4b5563', fontWeight:'bold' }}>
=======
                                return (
                                    <ListItem key={child.uid} disablePadding divider sx={{ bgcolor: isChecked ? alpha('#f97316', 0.08) : 'inherit' }}>
                                        <ListItemButton onClick={() => handleToggleChild(child.uid)} sx={{ py: 1.5 }}>
                                            <ListItemAvatar>
                                                <Avatar src={userInfo.avata_url} sx={{ bgcolor: isChecked ? '#f97316' : 'grey.300', fontWeight:'bold' }}>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                                                    {userInfo.lname?.charAt(0)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
<<<<<<< HEAD
                                                primary={<Typography variant="subtitle2" fontWeight="bold" sx={{ pr: 2, wordBreak: 'break-word' }}>{fullName}</Typography>}
                                                secondary={
                                                    <Stack spacing={0.5} mt={0.5}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <SchoolOutlinedIcon sx={{fontSize: 16}} color="action" />
                                                            <Typography variant="caption" color="text.secondary">{studentInfo.school || "Chưa cập nhật trường"}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <EmailOutlinedIcon sx={{fontSize: 16}} color="action" />
                                                            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{userInfo.email}</Typography>
=======
                                                primary={<Typography variant="subtitle1" fontWeight="bold">{userInfo.lname} {userInfo.mname} {userInfo.fname}</Typography>}
                                                secondary={
                                                    <Stack spacing={0.5} mt={0.5}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <SchoolOutlinedIcon fontSize="small" color="action" />
                                                            <Typography variant="body2" color="text.secondary">{studentInfo.school || "Chưa cập nhật trường"}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <EmailOutlinedIcon fontSize="small" color="action" />
                                                            <Typography variant="body2" color="text.secondary">{userInfo.email}</Typography>
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                                                        </Stack>
                                                    </Stack>
                                                }
                                            />
<<<<<<< HEAD
=======
                                            <Checkbox edge="end" checked={isChecked} icon={<CheckCircleIcon color="disabled" fontSize="large" />} checkedIcon={<CheckCircleIcon sx={{color: '#f97316'}} fontSize="large" />} />
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting} color="inherit" sx={{borderRadius: 2, fontWeight: 600}}>Hủy</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        disabled={isSubmitting || selectedChildIds.length === 0} 
                        startIcon={isSubmitting && <CircularProgress size={20} color="inherit"/>}
<<<<<<< HEAD
                        sx={{ px: 3, borderRadius: 2, bgcolor: '#ea580c', '&:hover': {bgcolor: '#c2410c'}, fontWeight: 'bold' }}
=======
                        sx={{ px: 4, borderRadius: 2, bgcolor: '#f97316', '&:hover': {bgcolor: '#ea580c'} }}
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
                    >
                        {isSubmitting ? "Đang xử lý..." : `Xác nhận (${selectedChildIds.length})`}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }} onClose={() => setToast(prev => ({ ...prev, open: false }))}>{toast.msg}</Alert>
            </Snackbar>
        </PageWrapper>
    );
}

export default memo(ParentEnrollPage);