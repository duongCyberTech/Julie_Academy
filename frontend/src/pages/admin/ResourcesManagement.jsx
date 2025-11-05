import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Box, Button, Typography, Paper, Table, TableBody, TableCell, Chip,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    TextField, InputAdornment, Grid, TablePagination, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, Stack, Snackbar, alpha, useTheme,
    Divider, Checkbox, FormControlLabel, MenuItem
} from "@mui/material";
import {
    Search as SearchIcon, Add as AddIcon, Close as CloseIcon,
    Edit as EditIcon, Delete as DeleteIcon, RemoveCircleOutline as RemoveCircleOutlineIcon
} from "@mui/icons-material";
import {
    getAllBooks, createBook, updateBook, 
    getAllCategories, createCategory, updateCategory, 
} from "../../services/CategoryService"; 
import {
    getAllQuestions, 
    getQuestionById, createQuestion, updateQuestion, deleteQuestion,
} from "../../services/QuestionService";

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}
const truncateText = (text = '', maxLength) => (text.length > maxLength ? `${text.substring(0, maxLength)}...` : text);

const bookHeadCells = [ { id: "title", label: "Tiêu đề sách", minWidth: 200 }, { id: "subject", label: "Môn học", minWidth: 100 }, { id: "grade", label: "Khối", minWidth: 80, align: 'center' }, { id: "actions", label: "Hành động", minWidth: 100, align: 'right'} ];
const categoryHeadCells = [ { id: "category_name", label: "Tên Danh mục", minWidth: 250 }, { id: "description", label: "Mô tả", minWidth: 150 }, { id: "actions", label: "Hành động", minWidth: 100, align: 'right'} ];
const questionHeadCells = [ { id: "content", label: "Nội dung", minWidth: 300 }, { id: "type", label: "Loại", minWidth: 100 }, { id: "level", label: "Độ khó", minWidth: 80 }, { id: "status", label: "Trạng thái", minWidth: 100 }, { id: "actions", label: "Hành động", minWidth: 100, align: 'right'} ];

const StatusChip = ({ status }) => {
  const color = { public: "success", private: "default", pending: "warning" }[status] || "default";
  return <Chip label={status || 'N/A'} color={color} size="small" sx={{ textTransform: 'capitalize' }} />;
};

const BookFormModal = ({ open, onClose, onSubmit, bookToEdit }) => {
    const isEditing = !!bookToEdit;
    const [formData, setFormData] = useState({ title: "", subject: "", grade: "", description: "" });
    useEffect(() => { if (open) { setFormData(isEditing && bookToEdit ? { title: bookToEdit.title || "", subject: bookToEdit.subject || "", grade: bookToEdit.grade || "", description: bookToEdit.description || "" } : { title: "", subject: "", grade: "", description: "" }); } }, [open, bookToEdit, isEditing]);
    const handleChange = (e) => { const { name, value } = e.target; const pVal = name === 'grade' ? (value === '' ? '' : parseInt(value, 10)) : value; if (name === 'grade' && value !== '' && isNaN(pVal)) return; setFormData((prev) => ({ ...prev, [name]: pVal })); };
    const handleSubmit = (e) => { e.preventDefault(); if (formData.grade === '' || !Number.isInteger(formData.grade) || formData.grade < 1 || formData.grade > 12) { alert("Khối lớp phải là số nguyên từ 1 đến 12."); return; } onSubmit(formData, bookToEdit?.book_id); };
    return ( <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth> <DialogTitle>{isEditing ? "Sửa Sách" : "Tạo Sách mới"}</DialogTitle> <form onSubmit={handleSubmit}> <DialogContent> <Grid container spacing={3} sx={{ mt: 0.5 }}> <Grid item xs={12}> <TextField name="title" label="Tiêu đề sách" value={formData.title} onChange={handleChange} fullWidth required /> </Grid> <Grid item xs={12} sm={6}> <TextField name="subject" label="Môn học" value={formData.subject} onChange={handleChange} fullWidth required /> </Grid> <Grid item xs={12} sm={6}> <TextField name="grade" label="Khối lớp (1-12)" type="number" value={formData.grade} onChange={handleChange} fullWidth required inputProps={{ min: 1, max: 12, step: 1 }}/> </Grid> <Grid item xs={12}> <TextField name="description" label="Mô tả (Tùy chọn)" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} /> </Grid> </Grid> </DialogContent> <DialogActions sx={{ p: 3, pt: 1 }}> <Button onClick={onClose} color="inherit">Hủy</Button> <Button type="submit" variant="contained">{isEditing ? "Lưu" : "Tạo mới"}</Button> </DialogActions> </form> </Dialog> );
};

const CategoryFormModal = ({ open, onClose, onSubmit, categoryToEdit }) => {
     const isEditing = !!categoryToEdit;
    const [formData, setFormData] = useState({ category_name: "", description: "" });
    useEffect(() => { if (open) { setFormData(isEditing && categoryToEdit ? { category_name: categoryToEdit.category_name || "", description: categoryToEdit.description || "" } : { category_name: "", description: "" }); } }, [open, categoryToEdit, isEditing]);
    const handleChange = (e) => { const { name, value } = e.target; setFormData((prev) => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData, categoryToEdit?.category_id); };
    return ( <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth> <DialogTitle>{isEditing ? "Sửa Danh mục" : "Tạo Danh mục mới"}</DialogTitle> <form onSubmit={handleSubmit}> <DialogContent> <Stack spacing={2} sx={{ mt: 1 }}> <TextField name="category_name" label="Tên danh mục" value={formData.category_name} onChange={handleChange} fullWidth required /> <TextField name="description" label="Mô tả (Tùy chọn)" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} /> </Stack> </DialogContent> <DialogActions sx={{ p: 3, pt: 0 }}> <Button onClick={onClose} color="inherit">Hủy</Button> <Button type="submit" variant="contained">{isEditing ? "Lưu" : "Tạo"}</Button> </DialogActions> </form> </Dialog> );
};

// --- Question Form Modal (Hoàn thiện hơn) ---
const QuestionFormModal = ({ open, onClose, onSubmit, questionToEdit, categoryId }) => {
    const isEditing = !!questionToEdit;
    const [formData, setFormData] = useState({ content: '', explaination: '', type: 'single_choice', level: 'easy', status: 'private' });
    const [answers, setAnswers] = useState([{ content: '', is_correct: false }]); 

    useEffect(() => {
        if (open) {
            if (isEditing && questionToEdit) {
                setFormData({
                    content: questionToEdit.content || '', explaination: questionToEdit.explaination || '',
                    type: questionToEdit.type || 'single_choice', level: questionToEdit.level || 'easy',
                    status: questionToEdit.status || 'private',
                });
                setAnswers(questionToEdit.answers?.map(a => ({ content: a.content || '', is_correct: a.is_correct ?? false, explaination: a.explaination || '' })) || [{ content: '', is_correct: false }]);
            } else {
                setFormData({ content: '', explaination: '', type: 'single_choice', level: 'easy', status: 'private' });
                setAnswers([{ content: '', is_correct: false }]);
            }
        }
    }, [open, questionToEdit, isEditing]);

    const handleChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleAnswerChange = (index, field, value) => { setAnswers(prev => prev.map((ans, i) => i === index ? { ...ans, [field]: value } : ans)); };
    const handleAnswerCorrectChange = (index, checked) => {
        if (formData.type === 'single_choice') {
            setAnswers(prev => prev.map((ans, i) => ({ ...ans, is_correct: i === index ? checked : false })));
        } else {
             handleAnswerChange(index, 'is_correct', checked);
        }
    };
    const addAnswerField = () => { setAnswers(prev => [...prev, { content: '', is_correct: false }]); };
    const removeAnswerField = (index) => { setAnswers(prev => prev.filter((_, i) => i !== index)); };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (answers.length === 0) { alert("Phải có ít nhất một câu trả lời."); return; }
        if (['single_choice', 'multiple_choice'].includes(formData.type) && !answers.some(a => a.is_correct)) {
            alert("Câu hỏi trắc nghiệm phải có ít nhất một đáp án đúng."); return;
        }
        const finalData = { 
            ...formData, 
            categoryId: categoryId, 
            answers: answers.map(a => ({ 
                content: a.content, 
                isCorrect: a.is_correct,
                explain: a.explaination || ''
            })) 
        };
        onSubmit(finalData, questionToEdit?.ques_id);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEditing ? "Sửa Câu hỏi" : "Tạo Câu hỏi mới"}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}> <TextField name="content" label="Nội dung câu hỏi" value={formData.content} onChange={handleChange} fullWidth required multiline rows={3} /> </Grid>
                        <Grid item xs={12} sm={4}> <TextField select name="type" label="Loại" value={formData.type} onChange={handleChange} fullWidth required> <MenuItem value="single_choice">Một đáp án</MenuItem> <MenuItem value="multiple_choice">Nhiều đáp án</MenuItem> <MenuItem value="true_false">Đúng/Sai</MenuItem> <MenuItem value="short_answer">Trả lời ngắn</MenuItem> <MenuItem value="essay">Tự luận</MenuItem> </TextField> </Grid>
                        <Grid item xs={12} sm={4}> <TextField select name="level" label="Độ khó" value={formData.level} onChange={handleChange} fullWidth required> <MenuItem value="easy">Dễ</MenuItem> <MenuItem value="medium">Trung bình</MenuItem> <MenuItem value="hard">Khó</MenuItem> </TextField> </Grid>
                        <Grid item xs={12} sm={4}> <TextField select name="status" label="Trạng thái" value={formData.status} onChange={handleChange} fullWidth required> <MenuItem value="public">Công khai</MenuItem> <MenuItem value="private">Riêng tư</MenuItem> <MenuItem value="pending">Chờ duyệt</MenuItem> </TextField> </Grid>
                        <Grid item xs={12}> <TextField name="explaination" label="Giải thích (Tùy chọn)" value={formData.explaination} onChange={handleChange} fullWidth multiline rows={2} /> </Grid>
                        <Grid item xs={12}><Divider sx={{ my: 1 }}><Typography variant="subtitle2">Câu trả lời</Typography></Divider></Grid>
                        {answers.map((answer, index) => (
                            <Grid item container xs={12} spacing={1} key={index} alignItems="center">
                                <Grid item xs={1}> <Typography align="right">{index + 1}.</Typography> </Grid>
                                <Grid item xs={8}> <TextField size="small" label={`Đáp án ${index + 1}`} value={answer.content} onChange={(e) => handleAnswerChange(index, 'content', e.target.value)} fullWidth required /> </Grid>
                                <Grid item xs={2}> <FormControlLabel control={<Checkbox checked={!!answer.is_correct} onChange={(e) => handleAnswerCorrectChange(index, e.target.checked)} />} label="Đúng" sx={{m:0, '& .MuiSvgIcon-root': { fontSize: 20 }}}/> </Grid>
                                <Grid item xs={1}> <IconButton size="small" onClick={() => removeAnswerField(index)} color="error" disabled={answers.length <= 1}> <RemoveCircleOutlineIcon /> </IconButton> </Grid>
                            </Grid>
                        ))}
                        <Grid item xs={12} sx={{ textAlign: 'right' }}> <Button size="small" startIcon={<AddIcon />} onClick={addAnswerField}> Thêm đáp án </Button> </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}> <Button onClick={onClose} color="inherit">Hủy</Button> <Button type="submit" variant="contained">{isEditing ? "Lưu" : "Tạo"}</Button> </DialogActions>
            </form>
        </Dialog>
    );
};

// --- Confirmation Dialog ---
const ConfirmationDialog = ({ open, onClose, onConfirm, title, message }) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
        <DialogTitle>{title || "Xác nhận"}</DialogTitle>
        <DialogContent> <Typography>{message || "Bạn có chắc chắn?"}</Typography> </DialogContent>
        <DialogActions> <Button onClick={onClose}>Hủy</Button> <Button onClick={onConfirm} color="error">Xác nhận</Button> </DialogActions>
    </Dialog>
);

// --- Component Chính ---
const ResourcesManagement = () => {
    const theme = useTheme();
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const getToken = useCallback(() => localStorage.getItem("token"), []);
    
    // States
    const [books, setBooks] = useState([]); const [loadingBooks, setLoadingBooks] = useState(true); const [bookPage, setBookPage] = useState(0); const [rowsPerBookPage, setRowsPerBookPage] = useState(5); const [bookSearchTerm, setBookSearchTerm] = useState(""); const debouncedBookSearch = useDebounce(bookSearchTerm, 300); const [isBookModalOpen, setIsBookModalOpen] = useState(false); const [editingBook, setEditingBook] = useState(null); const [selectedBook, setSelectedBook] = useState(null);
    const [categories, setCategories] = useState([]); const [totalCategories, setTotalCategories] = useState(0); const [loadingCategories, setLoadingCategories] = useState(false); const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); const [editingCategory, setEditingCategory] = useState(null); const [selectedCategory, setSelectedCategory] = useState(null);
    const [questions, setQuestions] = useState([]); const [totalQuestions, setTotalQuestions] = useState(0); const [loadingQuestions, setLoadingQuestions] = useState(false); const [questionPage, setQuestionPage] = useState(0); const [rowsPerQuestionPage, setRowsPerQuestionPage] = useState(5); const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false); const [editingQuestion, setEditingQuestion] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null); const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // --- Fetch Functions ---
    const fetchBooks = useCallback(async () => { setLoadingBooks(true); setError(null); const token = getToken(); if (!token) { setError("Chưa đăng nhập."); setLoadingBooks(false); return; } try { const res = await getAllBooks(token); setBooks(Array.isArray(res) ? res : []); } catch (err) { setError(`Lỗi tải sách: ${err.message}`); setBooks([]); } finally { setLoadingBooks(false); } }, [getToken]);
    const fetchCategories = useCallback(async () => { setCategories([]); setSelectedCategory(null); setQuestions([]); setTotalCategories(0); setTotalQuestions(0); if (!selectedBook?.book_id) return; setLoadingCategories(true); setError(null); const token = getToken(); if (!token) { setError("Chưa đăng nhập."); setLoadingCategories(false); return; } try { const res = await getAllCategories(selectedBook.book_id, {}, token); if (res && Array.isArray(res.data)) { setCategories(res.data); setTotalCategories(res.total || res.data.length); } else { setCategories([]); setTotalCategories(0); } } catch (err) { setError(`Lỗi tải danh mục: ${err.message}`); setCategories([]); setTotalCategories(0); } finally { setLoadingCategories(false); } }, [selectedBook, getToken]);
    const fetchQuestions = useCallback(async () => { setQuestions([]); setTotalQuestions(0); if (!selectedCategory?.category_id) return; setLoadingQuestions(true); setError(null); const token = getToken(); if (!token) { setError("Chưa đăng nhập."); setLoadingQuestions(false); return; } try { const params = { page: questionPage + 1, limit: rowsPerQuestionPage, category_id: selectedCategory.category_id }; const res = await getAllQuestions(params, token); if (res && Array.isArray(res.data)) { setQuestions(res.data); setTotalQuestions(res.total || 0); } else { setQuestions([]); setTotalQuestions(0); } } catch (err) { setError(`Lỗi tải câu hỏi: ${err.message}`); setQuestions([]); setTotalQuestions(0); } finally { setLoadingQuestions(false); } }, [selectedCategory, getToken, questionPage, rowsPerQuestionPage]);

    // --- Effects ---
    useEffect(() => { fetchBooks(); }, [fetchBooks]);
    useEffect(() => { fetchCategories(); }, [fetchCategories]); // Tự gọi lại khi selectedBook đổi
    useEffect(() => { fetchQuestions(); }, [fetchQuestions]); // Tự gọi lại khi selectedCategory, page, limit đổi

    // --- Lọc / Phân trang ---
    const filteredBooks = useMemo(() => { let r=[...books]; if(debouncedBookSearch){ const l=debouncedBookSearch.toLowerCase(); r=r.filter(b=>(b.title?.toLowerCase()||"").includes(l)||(b.subject?.toLowerCase()||"").includes(l)); } r.sort((a,b)=>(a.title||"").localeCompare(b.title||"")); return r; }, [books, debouncedBookSearch]);
    const paginatedBooks = useMemo(() => (filteredBooks || []).slice(bookPage * rowsPerBookPage, bookPage * rowsPerBookPage + rowsPerBookPage), [filteredBooks, bookPage, rowsPerBookPage]);
    // Không cần paginatedQuestions

    // --- Handlers ---
    const handleSelectBook = useCallback((book) => { setSelectedBook(prev => (prev?.book_id === book.book_id ? null : book)); setSelectedCategory(null); setQuestions([]); setQuestionPage(0); }, []);
    const handleSelectCategory = useCallback((category) => { setSelectedCategory(prev => (prev?.category_id === category.category_id ? null : category)); setQuestionPage(0); }, []);
    const handleOpenModal = useCallback((setter, itemToEdit = null, editSetter) => () => { if(editSetter) editSetter(itemToEdit); setter(true); }, []);
    const handleCloseModal = useCallback((setter, editSetter) => () => { if(editSetter) editSetter(null); setter(false); }, []);
    const handleOpenConfirm = useCallback((type, id, name) => { setItemToDelete({ type, id, name }); setIsConfirmOpen(true); }, []);
    const handleCloseConfirm = useCallback(() => { setItemToDelete(null); setIsConfirmOpen(false); }, []);

    // --- Submit Handlers ---
    const handleSubmitBook = useCallback(async (formData, id) => { const t = getToken(); if (!t) return; setError(null); try { const m = id ? "Sửa sách thành công!" : "Tạo sách thành công!"; if (id) { await updateBook(id, formData, t); } else { await createBook([formData], t); } setToast({ open: true, message: m, severity: "success" }); setIsBookModalOpen(false); setEditingBook(null); fetchBooks(); } catch (e) { const msg = e.response?.data?.message || `Lỗi ${id ? 'sửa' : 'tạo'} sách.`; setError(msg); setToast({ open: true, message: msg, severity: "error" }); } }, [getToken, fetchBooks]);
    const handleSubmitCategory = useCallback(async (formData, id) => { if (!selectedBook?.book_id) return; const t = getToken(); if (!t) return; setError(null); try { const m = id ? "Sửa danh mục thành công!" : "Tạo danh mục thành công!"; if(id) { await updateCategory(id, formData, t); } else { await createCategory(selectedBook.book_id, [formData], t); } setToast({ open: true, message: m, severity: "success" }); setIsCategoryModalOpen(false); setEditingCategory(null); fetchCategories(); } catch (e) { const msg = e.response?.data?.message || `Lỗi ${id ? 'sửa' : 'tạo'} danh mục.`; setError(msg); setToast({ open: true, message: msg, severity: "error" }); } }, [selectedBook, getToken, fetchCategories]);
    
    // --- ĐÃ SỬA ---
    const handleSubmitQuestion = useCallback(async (formData, id) => {
        if (!selectedCategory?.category_id ) { setError("Chưa chọn danh mục."); return; }
        const t = getToken(); if (!t) return; 
        setError(null);
        const { answers, ...questionData } = formData; 
        try { 
            const m = id ? "Sửa câu hỏi thành công!" : "Tạo câu hỏi thành công!"; 
            if (id) { 
                await updateQuestion(id, questionData, t); 
                /* TODO: Cần xem lại API updateQuestion có cần gửi cả answers không. 
                   Giả sử logic hiện tại là API updateQuestion chỉ cập nhật nội dung câu hỏi, 
                   hoặc answers được update riêng (nếu cần). 
                   Nếu API updateQuestion cần cả answers, bạn cần thay đổi payload:
                   const updatePayload = { ...questionData, answers: answers.map(a => ({ content: a.content, isCorrect: a.is_correct })) };
                   await updateQuestion(id, updatePayload, t);
                */
            } else { 
                // Admin tạo câu hỏi, không cần tutorId
                const payload = [{ 
                    ...questionData, 
                    categoryId: selectedCategory.category_id, 
                    answers: answers.map(a => ({ content: a.content, isCorrect: a.is_correct })) 
                }]; 
                await createQuestion(payload, t); // Đã loại bỏ tutorId
            } 
            setToast({ open: true, message: m, severity: "success" }); 
            setIsQuestionModalOpen(false); 
            setEditingQuestion(null); 
            fetchQuestions(); 
        } catch (e) { 
            const msg = e.response?.data?.message || `Lỗi ${id ? 'sửa' : 'tạo'} câu hỏi.`; 
            setError(msg); 
            setToast({ open: true, message: msg, severity: "error" }); 
        } 
    }, [selectedCategory, getToken, fetchQuestions]); // Đã loại bỏ tutorId khỏi dependencies
    // --- KẾT THÚC SỬA ---

    // --- Delete Handler (ĐÃ SỬA) ---
     const handleConfirmDelete = useCallback(async () => {
        if (!itemToDelete || itemToDelete.type !== 'question') { // Chỉ xử lý 'question'
            handleCloseConfirm();
            return; 
        }
        const { type, id } = itemToDelete; 
        const t = getToken(); 
        if (!t) return; 
        setError(null); 
        try { 
            let m = ""; 
            if (type === 'question') { 
                await deleteQuestion(id, t); 
                m = "Xóa câu hỏi thành công!"; 
                fetchQuestions(); 
            } 
            setToast({ open: true, message: m, severity: "success" }); 
        } catch (e) { 
            const msg = e.response?.data?.message || `Lỗi xóa ${type}.`; 
            setError(msg); 
            setToast({ open: true, message: msg, severity: "error" }); 
        } finally { 
            handleCloseConfirm(); 
        } 
    }, [itemToDelete, getToken, fetchQuestions, handleCloseConfirm]); // Bỏ fetchBooks, fetchCategories

    // --- Other Handlers ---
    const handleCloseToast = useCallback((event, reason) => { if (reason === "clickaway") return; setToast(prev => ({ ...prev, open: false })); }, []);
    const handleChangeBookPage = useCallback((event, newPage) => setBookPage(newPage), []);
    const handleChangeRowsPerBookPage = useCallback((event) => { setRowsPerBookPage(parseInt(event.target.value, 10)); setBookPage(0); }, []);
    const handleChangeQuestionPage = useCallback((event, newPage) => setQuestionPage(newPage), []);
    const handleChangeRowsPerQuestionPage = useCallback((event) => { setRowsPerQuestionPage(parseInt(event.target.value, 10)); setQuestionPage(0); }, []);

    // --- Fetch Question Detail for Editing ---
    const handleEditQuestion = useCallback(async (question) => { const t = getToken(); if (!t) return; setError(null); try { const qDetail = await getQuestionById(question.ques_id, t); setEditingQuestion(qDetail); setIsQuestionModalOpen(true); } catch(e) { const msg = `Lỗi tải chi tiết câu hỏi: ${e.message}`; setError(msg); setToast({ open: true, message: msg, severity: "error" }); } }, [getToken]);


    // --- Render ---
    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 4 }}>Quản lý tài nguyên</Typography>
            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

            <Grid container spacing={4}>
                {/* --- Cột Sách --- */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ overflow: 'hidden' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}> <Typography variant="h6">Sách</Typography> <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenModal(setIsBookModalOpen, null, setEditingBook)}> Thêm Sách </Button> </Stack>
                        <Box sx={{ p: 2 }}> <TextField fullWidth size="small" placeholder="Tìm kiếm Sách..." value={bookSearchTerm} onChange={(e) => setBookSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>), }} /> </Box>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader size="medium">
                                <TableHead> <TableRow> {bookHeadCells.map((hc) => (<TableCell key={hc.id} align={hc.align || "left"} sx={{ fontWeight: "bold", bgcolor: "action.selected", minWidth: hc.minWidth, py: 1.5, px: 2 }}> {hc.label === 'Hành động' ? '' : hc.label} </TableCell> ))} </TableRow> </TableHead> {/* Ẩn text "Hành động" */}
                                <TableBody>
                                    {loadingBooks ? ( <TableRow><TableCell colSpan={bookHeadCells.length} align="center" sx={{ py: 3 }}><CircularProgress size={24}/></TableCell></TableRow> )
                                    : paginatedBooks.length === 0 ? ( <TableRow><TableCell colSpan={bookHeadCells.length} align="center" sx={{ py: 3 }}>Không tìm thấy sách.</TableCell></TableRow> )
                                    : paginatedBooks.map((book) => (
                                        <TableRow key={book.book_id} hover onClick={() => handleSelectBook(book)} selected={selectedBook?.book_id === book.book_id} sx={{ cursor: 'pointer', "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.light, 0.15) }, "&.Mui-selected:hover": { bgcolor: alpha(theme.palette.primary.light, 0.25) } }}>
                                            <TableCell sx={{ fontWeight: 500, py: 1.5, px: 2 }}>{book.title}</TableCell>
                                            <TableCell sx={{ py: 1.5, px: 2 }}>{book.subject}</TableCell>
                                            <TableCell align="center" sx={{ py: 1.5, px: 2 }}>{book.grade}</TableCell>
                                            <TableCell align="right" sx={{ py: 1, px: 1 }}>
                                                <Tooltip title="Sửa Sách"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenModal(setIsBookModalOpen, book, setEditingBook)(); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                {/* --- NÚT XÓA SÁCH ĐÃ BỊ XÓA --- */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredBooks?.length || 0} rowsPerPage={rowsPerBookPage} page={bookPage} onPageChange={handleChangeBookPage} onRowsPerPageChange={handleChangeRowsPerBookPage} labelRowsPerPage="Sách/trang:" labelDisplayedRows={({ from, to, count }) => `${from}-${to}/${count}`} />
                    </Paper>
                </Grid>

                {/* --- Cột Category & Question --- */}
                <Grid item xs={12} md={7}>
                     <Paper sx={{ overflow: 'hidden', mb: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}> <Typography variant="h6" noWrap sx={{ maxWidth: 'calc(100% - 160px)' }}> Danh mục {selectedBook ? `của "${selectedBook.title}"` : "(Chọn sách)"} </Typography> <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenModal(setIsCategoryModalOpen, null, setEditingCategory)} disabled={!selectedBook || loadingCategories} sx={{ flexShrink: 0 }}> Thêm Danh mục </Button> </Stack>
                        <TableContainer sx={{ maxHeight: 250 }}>
                             <Table stickyHeader size="medium">
                                <TableHead> <TableRow> {categoryHeadCells.map((hc) => ( <TableCell key={hc.id} align={hc.align || "left"} sx={{ fontWeight: "bold", bgcolor: "action.selected", minWidth: hc.minWidth, py: 1.5, px: 2 }}> {hc.label === 'Hành động' ? '' : hc.label} </TableCell> ))} </TableRow> </TableHead>
                                 <TableBody>
                                    {loadingCategories ? ( <TableRow><TableCell colSpan={categoryHeadCells.length} align="center" sx={{ py: 3 }}><CircularProgress size={24}/></TableCell></TableRow> )
                                    : !selectedBook ? ( <TableRow><TableCell colSpan={categoryHeadCells.length} align="center" sx={{ py: 3, color: 'text.secondary' }}>Vui lòng chọn sách.</TableCell></TableRow> )
                                    : categories.length === 0 ? ( <TableRow><TableCell colSpan={categoryHeadCells.length} align="center" sx={{ py: 3 }}>Sách này chưa có danh mục.</TableCell></TableRow> )
                                    : categories.map((cat) => (
                                        <TableRow key={cat.category_id} hover onClick={() => handleSelectCategory(cat)} selected={selectedCategory?.category_id === cat.category_id} sx={{ cursor: 'pointer', "&.Mui-selected": { bgcolor: alpha(theme.palette.secondary.light, 0.15) }, "&.Mui-selected:hover": { bgcolor: alpha(theme.palette.secondary.light, 0.25) } }}>
                                            <TableCell sx={{ fontWeight: 500, py: 1.5, px: 2 }}>{cat.category_name}</TableCell>
                                            <TableCell sx={{ py: 1.5, px: 2 }}>{truncateText(cat.description, 50)}</TableCell>
                                            <TableCell align="right" sx={{ py: 1, px: 1 }}>
                                                 <Tooltip title="Sửa DM"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenModal(setIsCategoryModalOpen, cat, setEditingCategory)(); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                 {/* --- NÚT XÓA CATEGORY ĐÃ BỊ XÓA --- */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                         {/* Có thể thêm phân trang Category nếu nhiều */}
                    </Paper>

                    {selectedCategory && (
                         <Paper sx={{ overflow: 'hidden' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}> <Typography variant="h6" noWrap sx={{ maxWidth: 'calc(100% - 160px)' }}> Câu hỏi: {selectedCategory.category_name} </Typography> <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenModal(setIsQuestionModalOpen, null, setEditingQuestion)} disabled={loadingQuestions} sx={{ flexShrink: 0 }}> Thêm Câu hỏi </Button> </Stack>
                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table stickyHeader size="medium">
                                    <TableHead> <TableRow> {questionHeadCells.map((hc) => ( <TableCell key={hc.id} align={hc.align || "left"} sx={{ fontWeight: "bold", bgcolor: "action.selected", minWidth: hc.minWidth, py: 1.5, px: 2 }}> {hc.label === 'Hành động' ? '' : hc.label} </TableCell> ))} </TableRow> </TableHead>
                                    <TableBody>
                                        {loadingQuestions ? ( <TableRow><TableCell colSpan={questionHeadCells.length} align="center" sx={{ py: 3 }}><CircularProgress size={24}/></TableCell></TableRow> )
                                        : (questions || []).length === 0 ? ( <TableRow><TableCell colSpan={questionHeadCells.length} align="center" sx={{ py: 3 }}>Chưa có câu hỏi.</TableCell></TableRow> )
                                        : questions.map((q) => ( // Dùng questions vì fetch theo trang
                                            <TableRow key={q.ques_id} hover>
                                                <TableCell sx={{ py: 1.5, px: 2 }}>{truncateText(q.content, 60)}</TableCell>
                                                <TableCell sx={{ py: 1.5, px: 2, textTransform: 'capitalize' }}>{q.type?.replace('_', ' ')}</TableCell>
                                                <TableCell sx={{ py: 1.5, px: 2, textTransform: 'capitalize' }}>{q.level}</TableCell>
                                                 <TableCell sx={{ py: 1.5, px: 2 }}><StatusChip status={q.status} /></TableCell>
                                                <TableCell align="right" sx={{ py: 1, px: 1 }}>
                                                    <Tooltip title="Sửa CH"><IconButton size="small" onClick={() => handleEditQuestion(q)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Xóa CH"><IconButton size="small" onClick={() => handleOpenConfirm('question', q.ques_id, q.content)} color="error"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                             <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={totalQuestions} rowsPerPage={rowsPerQuestionPage} page={questionPage} onPageChange={handleChangeQuestionPage} onRowsPerPageChange={handleChangeRowsPerQuestionPage} labelRowsPerPage="Câu hỏi/trang:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : `hơn ${to}`}`} />
                        </Paper>
                    )}
                </Grid>
            </Grid>

            {isBookModalOpen && ( <BookFormModal open={isBookModalOpen} onClose={handleCloseModal(setIsBookModalOpen, setEditingBook)} onSubmit={handleSubmitBook} bookToEdit={editingBook} /> )}
            {isCategoryModalOpen && ( <CategoryFormModal open={isCategoryModalOpen} onClose={handleCloseModal(setIsCategoryModalOpen, setEditingCategory)} onSubmit={handleSubmitCategory} categoryToEdit={editingCategory} /> )}
            {isQuestionModalOpen && ( <QuestionFormModal open={isQuestionModalOpen} onClose={handleCloseModal(setIsQuestionModalOpen, setEditingQuestion)} onSubmit={handleSubmitQuestion} questionToEdit={editingQuestion} categoryId={selectedCategory?.category_id} /> )}
            {isConfirmOpen && ( <ConfirmationDialog open={isConfirmOpen} onClose={handleCloseConfirm} onConfirm={handleConfirmDelete} title={`Xác nhận xóa ${itemToDelete?.type}`} message={`Bạn chắc chắn muốn xóa "${truncateText(itemToDelete?.name, 50)}"?`} /> )}

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: "100%" }} variant="filled"> {toast.message} </Alert>
            </Snackbar>
        </Box>
    );
};

export default ResourcesManagement;
