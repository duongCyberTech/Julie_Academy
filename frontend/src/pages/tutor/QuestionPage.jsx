import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuestions, deleteQuestion } from '../../services/QuestionService'; 
import QuestionPopup from '../../components/QuestionPopup'; 

import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip, CircularProgress,
    Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    TableSortLabel, TablePagination, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
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
// --- End Helper Functions ---

const headCells = [
  { id: 'content', label: 'Nội dung' },
  { id: 'difficulty', label: 'Độ khó' },
  { id: 'type', label: 'Loại' },
  { id: 'createdAt', label: 'Ngày tạo' },
  { id: 'updatedAt', label: 'Cập nhật' },
  { id: 'actions', label: 'Hành động', disableSorting: true },
];

const DifficultyChip = ({ difficulty }) => {
    const color = {
        EASY: 'success',
        MEDIUM: 'warning',
        HARD: 'error'
    }[difficulty.toUpperCase()] || 'default';
    return <Chip label={difficulty} color={color} size="small" sx={{ textTransform: 'capitalize' }}/>;
};

// =======================
// === Main Component ====
// =======================
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
    const [orderBy, setOrderBy] = useState('createdAt');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch all questions on component mount
    useEffect(() => {
        const fetchAllQuestions = async () => {
            if (!token) {
                setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await getQuestions({ limit: 1000 }, token); 
                setQuestions(response.data);
            } catch (err) {
                setError("Không thể tải danh sách câu hỏi. Vui lòng thử lại.");
                console.error("Fetch questions error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllQuestions();
    }, [token]); 

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenPopup = () => setPopupOpen(true);
    const handleClosePopup = (shouldReload = false) => {
        setPopupOpen(false);
        if (shouldReload) {
            window.location.reload();
        }
    };
    
    const handleEdit = (questionId) => navigate(`/dashboard/edit-question/${questionId}`);
    
    const handleOpenDeleteDialog = (questionId) => {
        setQuestionToDelete(questionId);
        setOpenDeleteDialog(true);
    };
    const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);

    const handleConfirmDelete = async () => {
        if (!questionToDelete || !token) return;
        try {
            await deleteQuestion(questionToDelete, token);
            setQuestions(prev => prev.filter(q => q.id !== questionToDelete));
            handleCloseDeleteDialog();
        } catch (err) {
            setError("Xóa câu hỏi thất bại. Vui lòng thử lại.");
            console.error("Delete question error:", err);
            handleCloseDeleteDialog();
        }
    };

    const visibleRows = useMemo(
        () => stableSort(questions, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        ),
        [questions, order, orderBy, page, rowsPerPage],
    );

    const renderContent = () => {
        if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
        if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

        return (
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        sortDirection={orderBy === headCell.id ? order : false}
                                        align={headCell.id === 'actions' ? 'right' : 'left'}
                                    >
                                        {headCell.disableSorting ? (
                                            headCell.label
                                        ) : (
                                            <TableSortLabel
                                                active={orderBy === headCell.id}
                                                direction={orderBy === headCell.id ? order : 'asc'}
                                                onClick={() => handleRequestSort(headCell.id)}
                                            >
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
                                    <TableRow key={q.id} hover>
                                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.content}</TableCell>
                                        <TableCell><DifficultyChip difficulty={q.difficulty} /></TableCell>
                                        <TableCell>{q.type}</TableCell>
                                        <TableCell>{new Date(q.createdAt).toLocaleString('vi-VN')}</TableCell>
                                        <TableCell>{new Date(q.updatedAt).toLocaleString('vi-VN')}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => handleEdit(q.id)} color="primary"><EditIcon /></IconButton></Tooltip>
                                            <Tooltip title="Xóa"><IconButton size="small" onClick={() => handleOpenDeleteDialog(q.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={headCells.length} align="center">Không có câu hỏi nào.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={questions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số hàng mỗi trang:"
                />
            </Paper>
        );
    };

    return (
        <PageWrapper>
            <Header>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Thư viện câu hỏi
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleOpenPopup}
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ fontWeight: 'bold' }}
                >
                    Tạo câu hỏi mới
                </Button>
            </Header>
            
            {renderContent()}

            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Xác nhận xóa câu hỏi?</DialogTitle>
                <DialogContent><DialogContentText>Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa câu hỏi này không?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>Xóa</Button>
                </DialogActions>
            </Dialog>

            <QuestionPopup isOpen={isPopupOpen} onClose={handleClosePopup} />
        </PageWrapper>
    );
}
