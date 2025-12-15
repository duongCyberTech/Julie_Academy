import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
    Box, Typography, Paper, Button, Avatar, Chip, Stack, TextField, InputAdornment, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Checkbox, List, ListItem, ListItemButton, ListItemAvatar, 
    ListItemText, CircularProgress, Alert, Snackbar, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    FormControl, InputLabel, Select, MenuItem, TableSortLabel
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Services
import { getAllClasses, requestEnrollment } from '../../services/ClassService';
import { getMyChildren } from '../../services/UserService'; 

// --- STYLED COMPONENTS ---

const PageContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: '#F4F6F8',
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
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    '& .MuiTableCell-head': {
        backgroundColor: theme.palette.grey[50],
        fontWeight: 700,
        color: theme.palette.text.secondary,
        borderBottom: `2px solid ${theme.palette.divider}`
    },
    '& .MuiTableRow-root:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04)
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

// --- MAIN COMPONENT ---

function ParentEnrollPage() {
    const [token] = useState(() => localStorage.getItem('token'));
    
    // Data
    const [classes, setClasses] = useState([]);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter State
    const [search, setSearch] = useState('');
    const [filterSubject, setFilterSubject] = useState('all');
    const [filterGrade, setFilterGrade] = useState('all');
    const [filterDate, setFilterDate] = useState(null); 

    // Sort & Pagination State
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('createdAt'); 
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedChildIds, setSelectedChildIds] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'info' });

    // 1. Fetch Data
    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [classRes, childRes] = await Promise.all([
                getAllClasses({ limit: 200 }, token), 
                getMyChildren(token)
            ]);

            const allList = Array.isArray(classRes) ? classRes : (classRes?.data || []);
            const validClasses = allList.filter(c => c.status === 'pending' || c.status === 'ongoing');

            setClasses(validClasses);
            setChildren(Array.isArray(childRes) ? childRes : (childRes?.data || []));
        } catch (err) {
            setToast({ open: true, msg: "Lỗi tải dữ liệu.", severity: "error" });
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- LOGIC FILTER & SORT ---
    
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

    // --- HANDLERS ---

    const handleOpenDialog = (cls) => {
        setSelectedClass(cls);
        setSelectedChildIds([]);
        setDialogOpen(true);
    };

    const handleToggleChild = (childId) => {
        const currentIndex = selectedChildIds.indexOf(childId);
        const newChecked = [...selectedChildIds];
        currentIndex === -1 ? newChecked.push(childId) : newChecked.splice(currentIndex, 1);
        setSelectedChildIds(newChecked);
    };

    const handleSubmit = async () => {
        if (selectedChildIds.length === 0) return;
        setIsSubmitting(true);
        try {
            await requestEnrollment(selectedClass.class_id, selectedChildIds, token);
            setToast({ open: true, msg: "Đăng ký thành công! Chờ duyệt.", severity: "success" });
            setDialogOpen(false);
        } catch (err) {
            setToast({ open: true, msg: err.response?.data?.message || "Lỗi đăng ký.", severity: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetFilter = () => {
        setSearch('');
        setFilterSubject('all');
        setFilterGrade('all');
        setFilterDate(null);
        setPage(0);
    };

    if (loading) return <Box height="100vh" display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>;

    return (
        <PageContainer>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="600" color="text.primary">Đăng ký lớp học</Typography>
                <Typography variant="body2" color="text.secondary">Tìm và đăng ký lớp học phù hợp cho con</Typography>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <FilterBar elevation={0}>
                    <TextField 
                        placeholder="Tìm theo tên lớp, tên giáo viên..." 
                        size="small" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action"/></InputAdornment> }}
                        sx={{ width: 280 }}
                    />
                    
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

                    <DatePicker
                        label="Khai giảng từ"
                        value={filterDate}
                        onChange={(newValue) => setFilterDate(newValue)}
                        slotProps={{ textField: { size: 'small', sx: { width: 170 } } }}
                    />

                    <Button variant="text" startIcon={<RestartAltIcon/>} onClick={handleResetFilter} color="inherit" sx={{ ml: 'auto' }}>
                        Đặt lại
                    </Button>
                </FilterBar>
            </LocalizationProvider>

            <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                <StyledTableContainer>
                    <Table sx={{ minWidth: 750 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell width="25%">
                                    <TableSortLabel active={orderBy === 'classname'} direction={orderBy === 'classname' ? order : 'asc'} onClick={() => handleRequestSort('classname')}>
                                        Tên lớp học
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell width="20%">Giáo viên</TableCell>
                                <TableCell width="10%">Môn</TableCell>
                                <TableCell width="10%">Khối</TableCell>
                                <TableCell width="15%">
                                    <TableSortLabel active={orderBy === 'startat'} direction={orderBy === 'startat' ? order : 'asc'} onClick={() => handleRequestSort('startat')}>
                                        Khai giảng
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell width="10%">Sĩ số</TableCell>
                                <TableCell width="10%" align="center">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleRows.length === 0 ? (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không tìm thấy lớp học nào.</TableCell></TableRow>
                            ) : (
                                visibleRows.map((row) => (
                                    <TableRow key={row.class_id}>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight="bold">{row.classname}</Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 250, display: 'block' }}>
                                                {row.description || "Không có mô tả"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Avatar src={row.tutor?.user?.avata_url} sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.light' }}>
                                                    {row.tutor?.user?.lname?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {row.tutor?.user?.lname} {row.tutor?.user?.fname}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell><Chip label={row.subject} size="small" color="primary" variant="outlined" /></TableCell>
                                        <TableCell><Chip label={`K${row.grade}`} size="small" /></TableCell>
                                        <TableCell>
                                            {row.startat ? dayjs(row.startat).format('DD/MM/YYYY') : '---'}
                                        </TableCell>
                                        <TableCell>
                                            {row.nb_of_student || 0} HV
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                startIcon={<PersonAddIcon />}
                                                onClick={() => handleOpenDialog(row)}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
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
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredClasses.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    labelRowsPerPage="Số dòng:"
                />
            </Paper>

            {/* --- DIALOG CHỌN CON (ĐÃ SỬA) --- */}
            <Dialog open={dialogOpen} onClose={() => !isSubmitting && setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Chọn con để đăng ký</Typography>
                    {!isSubmitting && <IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon/></IconButton>}
                </DialogTitle>
                <DialogContent dividers>
                    <Box mb={2} p={2} bgcolor="primary.lighter" borderRadius={1} border="1px dashed" borderColor="primary.main">
                        <Typography variant="body2" color="primary.main">
                            Bạn đang đăng ký vào lớp: <strong>{selectedClass?.classname}</strong>
                        </Typography>
                    </Box>
                    {children.length === 0 ? (
                        <Box textAlign="center" py={3}>
                            <ChildCareIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                            <Typography color="text.secondary">Chưa có tài khoản học sinh nào được liên kết.</Typography>
                        </Box>
                    ) : (
                        <List>
                            {children.map((child) => {
                                // Truy cập đúng vào child.user để lấy thông tin
                                const userInfo = child.user || {};
                                const studentInfo = child.studentInfo || {};
                                const isChecked = selectedChildIds.indexOf(child.uid) !== -1;

                                return (
                                    <ListItem key={child.uid} disablePadding divider sx={{ bgcolor: isChecked ? alpha('#1976d2', 0.04) : 'inherit' }}>
                                        <ListItemButton onClick={() => handleToggleChild(child.uid)} sx={{ py: 1.5 }}>
                                            <ListItemAvatar>
                                                {/* Sửa: Lấy avatar từ userInfo.avata_url */}
                                                <Avatar 
                                                    src={userInfo.avata_url} 
                                                    sx={{ 
                                                        width: 48, height: 48, 
                                                        bgcolor: isChecked ? 'primary.main' : 'grey.300', 
                                                        color: '#fff', 
                                                        fontWeight:'bold',
                                                        border: isChecked ? '2px solid #1976d2' : 'none'
                                                    }}
                                                >
                                                    {userInfo.lname?.charAt(0)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                sx={{ ml: 2 }}
                                                primary={
                                                    // Sửa: Lấy tên từ userInfo
                                                    <Typography variant="subtitle1" fontWeight="bold" color={isChecked ? 'primary.main' : 'text.primary'}>
                                                        {userInfo.lname} {userInfo.mname} {userInfo.fname}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Stack spacing={0.5} mt={0.5}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <SchoolOutlinedIcon fontSize="small" color="action" />
                                                            {/* Sửa: Lấy trường từ studentInfo */}
                                                            <Typography variant="body2" color="text.secondary">
                                                                {studentInfo.school || "Chưa cập nhật trường"}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <EmailOutlinedIcon fontSize="small" color="action" />
                                                            {/* Sửa: Lấy email từ userInfo */}
                                                            <Typography variant="body2" color="text.secondary">
                                                                {userInfo.email || "Không có email"}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                }
                                            />
                                            <Checkbox 
                                                edge="end" 
                                                checked={isChecked} 
                                                icon={<CheckCircleIcon color="disabled" fontSize="large" />} 
                                                checkedIcon={<CheckCircleIcon color="primary" fontSize="large" />} 
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting} color="inherit">Hủy</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        disabled={isSubmitting || selectedChildIds.length === 0} 
                        startIcon={isSubmitting && <CircularProgress size={20} color="inherit"/>}
                        sx={{ px: 4, borderRadius: 2 }}
                    >
                        {isSubmitting ? "Đang xử lý..." : `Xác nhận (${selectedChildIds.length})`}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={toast.severity} variant="filled" onClose={() => setToast(prev => ({ ...prev, open: false }))}>{toast.msg}</Alert>
            </Snackbar>
        </PageContainer>
    );
}

export default memo(ParentEnrollPage);