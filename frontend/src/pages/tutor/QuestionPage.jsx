import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuestions, getMyQuestions, deleteQuestion } from '../../services/QuestionService';
import { getAllBooks, getAllCategories } from '../../services/CategoryService';
import QuestionPopup from '../../components/QuestionPopup';
import ActionMenu from '../../components/ActionMenu';
import AppSnackbar from '../../components/Snackbar'; 
import { jwtDecode } from 'jwt-decode';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip, CircularProgress,
    Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    TableSortLabel, TablePagination, Chip, ToggleButtonGroup, ToggleButton,
    Grid, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import QuestionContentRenderer from '../../components/QuestionContentRenderer';

const PageWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
}));

const Header = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
});

const difficultyOrder = { EASY: 1, MEDIUM: 2, HARD: 3 };

function descendingComparator(a, b, orderBy) {
    let valA = a[orderBy] ?? '';
    let valB = b[orderBy] ?? '';
    if (orderBy === 'level') {
        valA = difficultyOrder[String(valA).toUpperCase()] || 0;
        valB = difficultyOrder[String(valB).toUpperCase()] || 0;
    }
    if (valB < valA) return -1;
    if (valB > valA) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const headCells = [
    { id: 'content', label: 'Nội dung', minWidth: 250 },
    { id: 'level', label: 'Độ khó', minWidth: 100 },
    { id: 'type', label: 'Loại', minWidth: 120 },
    { id: 'category', label: 'Danh mục', minWidth: 170, disableSorting: true },
    { id: 'book', label: 'Sách', minWidth: 170, disableSorting: true },
    { id: 'actions', label: 'Hành động', minWidth: 100, disableSorting: true, align: 'right' },
];

const difficultyMap = {
    EASY: { text: 'Dễ', color: 'success' },
    MEDIUM: { text: 'Trung bình', color: 'warning' },
    HARD: { text: 'Khó', color: 'error' },
};
const DifficultyChip = ({ difficulty }) => {
    const mapping = difficultyMap[String(difficulty).toUpperCase()] || { text: difficulty || 'N/A', color: 'default' };
    return <Chip label={mapping.text} color={mapping.color} size="small" sx={{ textTransform: 'capitalize' }} />;
};

const questionTypeMap = {
    single_choice: 'Một đáp án',
    multiple_choice: 'Nhiều đáp án',
};
const formatQuestionType = (type) => {
    return questionTypeMap[type] || type?.replace('_', ' ') || 'N/A';
};

export default function QuestionManagementPage() {
    const navigate = useNavigate();
    const [token] = useState(() => localStorage.getItem('token'));
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('content');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState('public');
    const [filters, setFilters] = useState({ search: '', level: '', type: '', bookId: '', categoryId: '' });
    const debouncedSearch = useDebounce(filters.search, 500);
    const [reloadCounter, setReloadCounter] = useState(0);
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingBooks, setLoadingBooks] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const userInfo = useMemo(() => {
        try { return token ? jwtDecode(token) : null; }
        catch (e) { console.error("Invalid token:", e); return null; }
    }, [token]);

    useEffect(() => {
        const fetchBooks = async () => {
            if (!token) return; setLoadingBooks(true);
            try { const allBooks = await getAllBooks(token); setBooks(Array.isArray(allBooks) ? allBooks : []); }
            catch (err) { console.error("Error fetching books for filter:", err); setError("Lỗi tải danh sách sách."); }
            finally { setLoadingBooks(false); }
        };
        fetchBooks();
    }, [token]);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!filters.bookId || !token) { setCategories([]); return; }
            setLoadingCategories(true);
            try { const catData = await getAllCategories(filters.bookId, { limit: 0 }, token); setCategories(Array.isArray(catData?.data) ? catData.data : []); }
            catch (err) { console.error("Error fetching categories for filter:", err); setError("Lỗi tải danh mục."); }
            finally { setLoadingCategories(false); }
        };
        fetchCategories();
    }, [filters.bookId, token]);

    const fetchQuestions = useCallback(async () => {
        if (!token) { setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn."); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const params = { level: filters.level || undefined, type: filters.type || undefined, category_id: filters.categoryId || undefined, search: debouncedSearch || undefined };
            const response = viewMode === 'public' ? await getAllQuestions(params, token) : await getMyQuestions(params, token);
            const fetchedQuestions = Array.isArray(response) ? response : (response?.data ?? []);
            setQuestions(fetchedQuestions);
        } catch (err) { setError("Không thể tải danh sách câu hỏi. Vui lòng thử lại."); setQuestions([]); console.error("Fetch questions error:", err); }
        finally { setLoading(false); }
    }, [token, viewMode, debouncedSearch, filters.level, filters.type, filters.categoryId]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions, reloadCounter]);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc'); setOrderBy(property);
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === 'bookId') { newFilters.categoryId = ''; setCategories([]); }
            return newFilters;
        });
        setPage(0);
    };

    const handleViewModeChange = (event, newMode) => { if (newMode !== null) { setViewMode(newMode); setPage(0); } };
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleOpenPopup = () => setPopupOpen(true);
    const handleClosePopup = (shouldReload = false) => { setPopupOpen(false); if (shouldReload) { setReloadCounter(prev => prev + 1); } };
    const handleEdit = (questionId) => navigate(`/tutor/edit-question/${questionId}`);
    const handleOpenDeleteDialog = (questionId) => { setQuestionToDelete(questionId); setOpenDeleteDialog(true); };
    const handleCloseDeleteDialog = () => { setQuestionToDelete(null); setOpenDeleteDialog(false); }

    const handleConfirmDelete = async () => {
        if (!questionToDelete || !token) return;
        try {
            await deleteQuestion(questionToDelete, token);
            setQuestions(prev => prev.filter(q => q.ques_id !== questionToDelete)); 
            handleCloseDeleteDialog();
            setToast({ open: true, message: 'Xóa câu hỏi thành công!', severity: 'success' }); 
        } catch (err) { 
            setError("Xóa câu hỏi thất bại. Vui lòng thử lại."); 
            console.error("Delete question error:", err); 
            setToast({ open: true, message: 'Xóa câu hỏi thất bại.', severity: 'error' }); 
            handleCloseDeleteDialog();
        }
    };

    const handleMenuClick = (event, question) => {
        setAnchorEl(event.currentTarget);
        setSelectedQuestion(question);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedQuestion(null);
    };

    const handleMenuEdit = () => {
        handleEdit(selectedQuestion?.ques_id);
        handleMenuClose();
    };

    const handleMenuDelete = () => {
        handleMenuClose();
        handleOpenDeleteDialog(selectedQuestion?.ques_id);
    };

    const handleCloseToast = (event, reason) => {
        if (reason === 'clickaway') return;
        setToast(prev => ({ ...prev, open: false }));
    };

    const visibleRows = useMemo(
        () => stableSort(questions, getComparator(order, orderBy)).slice( page * rowsPerPage, page * rowsPerPage + rowsPerPage ),
        [questions, order, orderBy, page, rowsPerPage]
    );

    return (
        <PageWrapper>
            <Header>
                <Typography variant="h4" component="h1" fontWeight="bold">Thư viện câu hỏi</Typography>
                <Button variant="contained" color="primary" onClick={handleOpenPopup} startIcon={<AddCircleOutlineIcon />} sx={{ fontWeight: 'bold' }}>Tạo câu hỏi mới</Button>
            </Header>

            <Box sx={{ mb: 3 }}>
                <ToggleButtonGroup color="primary" value={viewMode} exclusive onChange={handleViewModeChange} aria-label="Chế độ xem câu hỏi">
                    <ToggleButton value="public" aria-label="Tất cả câu hỏi">Tất cả câu hỏi</ToggleButton>
                    <ToggleButton value="my_questions" aria-label="Câu hỏi của tôi" disabled={!userInfo}>Câu hỏi của tôi</ToggleButton>
                </ToggleButtonGroup>

                {/* SỬ DỤNG FLEXBOX GIÃN ĐỀU */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 2, 
                        mt: 2,
                        alignItems: 'flex-start'
                    }}
                > 
                    {/* 1. Tìm kiếm (Chiều rộng cố định: 250px) */}
                    <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: '40%', md: '250px' } }}>
                        <TextField fullWidth label="Tìm kiếm nội dung" variant="outlined" name="search" value={filters.search} onChange={handleFilterChange} size="small"/>
                    </Box>
                    
                    {/* 2-5. Các Select (Giãn đều không gian còn lại) */}
                    {[
                        { name: 'level', label: 'Độ khó', options: [{ value: "EASY", text: "Dễ" }, { value: "MEDIUM", text: "Trung bình" }, { value: "HARD", text: "Khó" }] },
                        { name: 'type', label: 'Loại câu hỏi', options: [{ value: "single_choice", text: "Một đáp án" }, { value: "multiple_choice", text: "Nhiều đáp án" }] },
                        { name: 'bookId', label: 'Sách', options: books.map(b => ({ value: b.book_id, text: `${b.title} (Lớp ${b.grade})` })), disabled: loadingBooks },
                        { name: 'categoryId', label: 'Danh mục', options: categories.map(c => ({ value: c.category_id, text: c.category_name })), disabled: !filters.bookId || loadingCategories },
                    ].map((item) => (
                        <Box key={item.name} sx={{ flexGrow: 1, minWidth: '150px' }}>
                            <FormControl fullWidth size="small" disabled={item.disabled}>
                                <InputLabel id={`${item.name}-filter-label`}>{item.label}</InputLabel>
                                <Select 
                                    labelId={`${item.name}-filter-label`}
                                    name={item.name} 
                                    value={filters[item.name]} 
                                    label={item.label} 
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value=""><em>Tất cả</em></MenuItem>
                                    {item.options.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.text}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    ))}
                </Box>
            </Box>

            {loading ? ( <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box> )
            : error ? ( <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>{error}</Alert> )
            : (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader size="medium">
                            <TableHead>
                                <TableRow>
                                    {headCells.map((headCell) => (
                                        <TableCell key={headCell.id} sortDirection={orderBy === headCell.id ? order : false} align={headCell.align || 'left'} sx={{ fontWeight: 'bold', bgcolor: 'grey.100', minWidth: headCell.minWidth, py: 1.5 }}>
                                            {headCell.disableSorting ? headCell.label : (
                                                <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={() => handleRequestSort(headCell.id)}>
                                                    {headCell.label}
                                                </TableSortLabel>
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visibleRows.length > 0 ? (
                                    visibleRows.map((q) => (
                                        <TableRow key={q.ques_id} hover >
                                            <TableCell sx={{ minWidth: headCells[0].minWidth, py: 1.5 }}>
                                                <QuestionContentRenderer htmlContent={q.content} />
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}><DifficultyChip difficulty={q.level} /></TableCell>
                                            <TableCell sx={{ textTransform: 'capitalize', py: 1.5 }}>{formatQuestionType(q.type)}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}><Tooltip title={q.category?.category_name || 'N/A'}><Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{q.category?.category_name || 'N/A'}</Typography></Tooltip></TableCell>
                                             <TableCell sx={{ py: 1.5 }}><Tooltip title={q.category?.Books?.title || 'N/A'}><Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{q.category?.Books?.title || 'N/A'}</Typography></Tooltip></TableCell>
                                            <TableCell align="right" sx={{ py: 1 }}>
                                                <Tooltip title="Hành động">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={(event) => handleMenuClick(event, q)} 
                                                    >
                                                        <MoreVertIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : ( <TableRow><TableCell colSpan={headCells.length} align="center" sx={{ py: 3 }}>Không có câu hỏi nào phù hợp.</TableCell></TableRow> )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={questions.length} rowsPerPage={rowsPerPage} page={page}
                        onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="Số hàng mỗi trang:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : `hơn ${to}`}`}
                    />
                </Paper>
            )}

            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                 <DialogTitle>Xác nhận xóa câu hỏi?</DialogTitle>
                <DialogContent><DialogContentText>Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa câu hỏi này không?</DialogContentText></DialogContent>
                <DialogActions><Button onClick={handleCloseDeleteDialog}>Hủy</Button><Button onClick={handleConfirmDelete} color="error" autoFocus>Xóa</Button></DialogActions>
            </Dialog>

            {isPopupOpen && userInfo && ( <QuestionPopup isOpen={isPopupOpen} onClose={handleClosePopup} tutorId={userInfo.sub}/> )}
            
            <ActionMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                selectedItem={selectedQuestion}
                onEdit={handleMenuEdit}
                onDelete={handleMenuDelete}
            />

            <AppSnackbar
                open={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={handleCloseToast}
            />
        </PageWrapper>
    );
}