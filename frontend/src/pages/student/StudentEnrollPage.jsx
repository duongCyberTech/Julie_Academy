import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
    Box, Typography, Paper, Button, Avatar, Chip, Stack, TextField, InputAdornment, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    CircularProgress, Alert, Snackbar, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TablePagination,
    FormControl, InputLabel, Select, MenuItem, TableSortLabel
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { jwtDecode } from "jwt-decode"; // 1. Import JWT

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SchoolIcon from '@mui/icons-material/School';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Icon đã tham gia
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; // Icon chờ

import ClassDetailDrawer from '../parent/ClassDetailDrawer';
import { getAllClasses, requestEnrollment } from '../../services/ClassService';

// ... (Giữ nguyên phần Styled Components và Helper Functions cũ) ...
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
    const [search, setSearch] = useState('');
    const [filterSubject, setFilterSubject] = useState('all');
    const [filterGrade, setFilterGrade] = useState('all');
    const [filterDate, setFilterDate] = useState(null); 
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('createdAt'); 
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // UI State
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'info' });

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await getAllClasses({ limit: 200 }, token);
            const allList = Array.isArray(response) ? response : (response?.data || []);
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

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const filteredClasses = useMemo(() => {
        return classes.filter((cls) => {
            const matchSearch = cls.classname.toLowerCase().includes(search.toLowerCase()) || 
                                cls.tutor?.user?.lname?.toLowerCase().includes(search.toLowerCase());
            const matchSubject = filterSubject === 'all' || cls.subject === filterSubject;
            const matchGrade = filterGrade === 'all' || cls.grade === filterGrade;
            let matchDate = true;
            if (filterDate && cls.startat) {
                const classDate = dayjs(cls.startat);
                const selectedDate = dayjs(filterDate);
                matchDate = classDate.isSame(selectedDate, 'day') || classDate.isAfter(selectedDate, 'day');
            }
            return matchSearch && matchSubject && matchGrade && matchDate;
        });
    }, [classes, search, filterSubject, filterGrade, filterDate]);

    const visibleRows = useMemo(() => {
        return filteredClasses.slice().sort(getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredClasses, order, orderBy, page, rowsPerPage]);

    const handleOpenConfirm = (cls) => {
        setDrawerOpen(false);
        setSelectedClass(cls);
        setConfirmDialogOpen(true);
    };

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
        } finally {
            setIsSubmitting(false);
        }
    };

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
        return (
            <Button 
                variant="contained" 
                size="small" 
                startIcon={<AddCircleOutlineIcon />}
                onClick={(e) => { e.stopPropagation(); handleOpenConfirm(row); }} 
                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb', '&:hover': {bgcolor: '#1d4ed8'}, boxShadow: 'none' }}
            >
                Đăng ký
            </Button>
        );
    };

    // ... (Phần UI Filter giữ nguyên) ...

    if (loading) return <Box height="100vh" display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>;

    return (
        <PageContainer>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="700" color="#1e3a8a">Tìm kiếm lớp học</Typography>
                <Typography variant="body2" color="text.secondary">Khám phá các khóa học mới và đăng ký tham gia</Typography>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <FilterBar elevation={0}>
                    {/* (Giữ nguyên các filter) */}
                    <TextField placeholder="Tìm lớp, thầy cô..." size="small" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action"/></InputAdornment> }} sx={{ width: 280 }} />
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
                    <DatePicker label="Khai giảng từ" value={filterDate} onChange={(v) => setFilterDate(v)} slotProps={{ textField: { size: 'small', sx: { width: 170 } } }} />
                    <Button variant="text" startIcon={<RestartAltIcon/>} onClick={() => {setSearch(''); setFilterSubject('all'); setFilterGrade('all'); setFilterDate(null); setPage(0);}} sx={{ ml: 'auto' }}>Đặt lại</Button>
                </FilterBar>
            </LocalizationProvider>

            <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <StyledTableContainer>
                    <Table sx={{ minWidth: 750 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell width="25%"><TableSortLabel active={orderBy === 'classname'} direction={orderBy === 'classname' ? order : 'asc'} onClick={() => handleRequestSort('classname')}>Tên lớp học</TableSortLabel></TableCell>
                                <TableCell width="20%">Giáo viên</TableCell>
                                <TableCell width="15%">Lịch học</TableCell>
                                <TableCell width="10%">Môn/Khối</TableCell>
                                <TableCell width="15%"><TableSortLabel active={orderBy === 'startat'} direction={orderBy === 'startat' ? order : 'asc'} onClick={() => handleRequestSort('startat')}>Khai giảng</TableSortLabel></TableCell>
                                <TableCell width="15%" align="center">Hành động</TableCell>
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
                                            <Stack direction="row" spacing={1} mt={0.5}>
                                                <Chip label={row.status === 'pending' ? 'Tuyển sinh' : 'Đang học'} size="small" color={row.status === 'pending' ? 'success' : 'default'} sx={{height: 20, fontSize: '0.65rem', fontWeight: 600}}/>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Avatar src={row.tutor?.user?.avata_url} sx={{ width: 36, height: 36, border: '1px solid #e0e7ff' }}>{row.tutor?.user?.lname?.charAt(0)}</Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600} color="#1e293b">{row.tutor?.user?.lname} {row.tutor?.user?.fname}</Typography>
                                                    <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}><SchoolIcon sx={{fontSize:12}}/> Giáo viên</Typography>
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
                                        
                                        {/* --- 4. GỌI HÀM RENDER NÚT BẤM MỚI --- */}
                                        <TableCell align="center">
                                            {renderActionButton(row)}
                                        </TableCell>
                                        {/* ------------------------------------ */}

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

            <ClassDetailDrawer 
                open={drawerOpen} 
                onClose={() => setDrawerOpen(false)} 
                classData={selectedClass} 
                onEnrollClick={handleOpenConfirm} 
            />

            <Dialog open={confirmDialogOpen} onClose={() => !isSubmitting && setConfirmDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                    <HelpOutlineIcon sx={{ fontSize: 48, color: '#2563eb', mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">Xác nhận đăng ký</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography textAlign="center" color="text.secondary">
                        Bạn có chắc chắn muốn gửi yêu cầu tham gia lớp học <strong>{selectedClass?.classname}</strong> không?
                    </Typography>
                    <Box mt={2} p={1.5} bgcolor="#eff6ff" borderRadius={2} textAlign="center">
                        <Typography variant="caption" color="primary">
                            Yêu cầu sẽ được gửi đến Giáo viên để phê duyệt.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
                    <Button onClick={() => setConfirmDialogOpen(false)} disabled={isSubmitting} variant="outlined" color="inherit" sx={{ borderRadius: 2, px: 3 }}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting} startIcon={isSubmitting && <CircularProgress size={20} color="inherit"/>} sx={{ borderRadius: 2, px: 3, bgcolor: '#2563eb' }}>{isSubmitting ? "Đang gửi..." : "Xác nhận"}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={toast.severity} variant="filled" onClose={() => setToast(prev => ({ ...prev, open: false }))}>{toast.msg}</Alert>
            </Snackbar>
        </PageContainer>
    );
}

export default memo(StudentEnrollPage);