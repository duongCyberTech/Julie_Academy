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

import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import ClassDetailDrawer from './ClassDetailDrawer';

import { getAllClasses, requestEnrollment } from '../../services/ClassService';
import { getMyChildren } from '../../services/UserService'; 

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

    const [dialogOpen, setDialogOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false); 
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

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const filteredClasses = useMemo(() => {
        return classes.filter((cls) => {
            const s = search.toLowerCase();
            const matchSearch = cls.classname.toLowerCase().includes(s) || 
                                cls.tutor?.user?.lname?.toLowerCase().includes(s);
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

    const handleOpenEnrollDialog = (cls) => {
        setDrawerOpen(false); 
        setSelectedClass(cls);
        setSelectedChildIds([]);
        setDialogOpen(true);
    };

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
            l.student?.uid === childId || l.student_uid === childId
        );
        return record ? record.status : null;
    };

    if (loading) return <Box height="100vh" display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>;

    return (
        <PageContainer>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="700" color="#1e3a8a">Đăng ký lớp học</Typography>
                <Typography variant="body2" color="text.secondary">Tìm kiếm lớp học và đăng ký cho con</Typography>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <FilterBar elevation={0}>
                    <TextField 
                        placeholder="Tìm lớp, giáo viên..." 
                        size="small" 
                        value={search} onChange={(e) => setSearch(e.target.value)}
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

            <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <StyledTableContainer>
                    <Table sx={{ minWidth: 750 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell width="25%"><TableSortLabel active={orderBy === 'classname'} direction={order} onClick={() => handleRequestSort('classname')}>Tên lớp học</TableSortLabel></TableCell>
                                <TableCell width="20%">Giáo viên</TableCell>
                                <TableCell width="15%">Lịch học</TableCell>
                                <TableCell width="10%">Môn/Khối</TableCell>
                                <TableCell width="15%"><TableSortLabel active={orderBy === 'startat'} direction={order} onClick={() => handleRequestSort('startat')}>Khai giảng</TableSortLabel></TableCell>
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
                                            <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
                                                <Chip label={row.status === 'pending' ? 'Tuyển sinh' : 'Đang học'} size="small" color={row.status === 'pending' ? 'success' : 'default'} sx={{height: 20, fontSize: '0.65rem', fontWeight: 600}}/>
                                                <Typography variant="caption" color="text.secondary">{row.nb_of_student} học viên</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Avatar src={row.tutor?.user?.avata_url} sx={{ width: 36, height: 36, border: '1px solid #e0e7ff' }}>{row.tutor?.user?.lname?.charAt(0)}</Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600} color="#1e293b">{row.tutor?.user?.lname} {row.tutor?.user?.fname}</Typography>
                                                    <Typography variant="caption" color="text.secondary">Gia sư</Typography>
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
                                        <TableCell align="center">
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                disableElevation
                                                startIcon={<PersonAddIcon />}
                                                onClick={(e) => { e.stopPropagation(); handleOpenEnrollDialog(row); }}
                                                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#ea580c', '&:hover': {bgcolor: '#c2410c'} }}
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
                onEnrollClick={handleOpenEnrollDialog} 
            />

            <Dialog open={dialogOpen} onClose={() => !isSubmitting && setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Chọn con để đăng ký</Typography>
                    {!isSubmitting && <IconButton onClick={() => setDialogOpen(false)} size="small"><CloseIcon/></IconButton>}
                </DialogTitle>
                <DialogContent dividers>
                    <Box mb={2} p={2} bgcolor="#fff7ed" borderRadius={2} border="1px dashed #fdba74">
                        <Typography variant="body2" color="#c2410c">
                            Lớp học: <strong>{selectedClass?.classname}</strong>
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
                                                    {userInfo.lname?.charAt(0)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={<Typography variant="subtitle2" fontWeight="bold">{userInfo.lname} {userInfo.fname}</Typography>}
                                                secondary={
                                                    <Stack spacing={0.5} mt={0.5}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <SchoolOutlinedIcon sx={{fontSize: 16}} color="action" />
                                                            <Typography variant="caption" color="text.secondary">{studentInfo.school || "Chưa cập nhật trường"}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <EmailOutlinedIcon sx={{fontSize: 16}} color="action" />
                                                            <Typography variant="caption" color="text.secondary">{userInfo.email}</Typography>
                                                        </Stack>
                                                    </Stack>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting} color="inherit" sx={{borderRadius: 2}}>Hủy</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        disabled={isSubmitting || selectedChildIds.length === 0} 
                        startIcon={isSubmitting && <CircularProgress size={20} color="inherit"/>}
                        sx={{ px: 3, borderRadius: 2, bgcolor: '#ea580c', '&:hover': {bgcolor: '#c2410c'} }}
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