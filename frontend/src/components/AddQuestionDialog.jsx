import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, TextField, FormControl,
    InputLabel, Select, MenuItem, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, Checkbox, Chip, Stack, CircularProgress,
    IconButton, Paper, Divider, ToggleButtonGroup, ToggleButton, Collapse, Tooltip
} from '@mui/material';
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityIcon from '@mui/icons-material/Visibility';
import FolderIcon from '@mui/icons-material/Folder';

import { getAllQuestions, getMyQuestions } from '../services/QuestionService';
import { getPlansByTutor, getAllCategories } from '../services/CategoryService';
import { addQuestionToExam } from '../services/ExamService';

const DIFFICULTY_MAP = {
    EASY: { text: "Dễ", color: "success" },
    MEDIUM: { text: "TB", color: "warning" },
    HARD: { text: "Khó", color: "error" },
};

const TYPE_MAP = {
    single_choice: "TN (1)",
    multiple_choice: "TN (N)",
    essay: "Tự luận",
    true_false: "Đúng/Sai",
};

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function AddQuestionDialog({ open = false, onClose, onRefresh, examId, existingQuestionIds = [] }) {
    const [token] = useState(() => localStorage.getItem('token'));
    const userInfo = useMemo(() => (token ? jwtDecode(token) : null), [token]);

    const [questions, setQuestions] = useState([]);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [plans, setPlans] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState("my_questions");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [filters, setFilters] = useState({
        search: "",
        level: "",
        type: "",
        bookId: "", 
        categoryId: "",
    });
    
    const debouncedSearch = useDebounce(filters.search, 500);

    const categoryTreeData = useMemo(() => {
        let flattened = [];
        if (Array.isArray(categories)) {
            categories.forEach(item => {
                if (Array.isArray(item)) flattened = flattened.concat(item);
                else if (item && (item.id || item.category_id)) flattened.push(item);
            });
        }
        if (flattened.length === 0) return [];

        const parentMap = new Map();
        flattened.forEach(item => {
            const parentId = item.parent_id ?? item.parentId ?? item.parent_category_id;
            const description = item.description;
            if (parentId && !parentMap.has(parentId)) {
                const exists = flattened.some(c => String(c.id ?? c.category_id) === String(parentId));
                if(!exists) parentMap.set(parentId, description || 'Danh mục cha');
            }
        });

        const parentNodes = Array.from(parentMap.entries()).map(([pid, desc]) => ({
            id: pid, category_id: pid, category_name: desc, parent_id: null, isParent: true,
        }));

        const allNodes = [...parentNodes, ...flattened];

        const buildTree = (items, parentId = null) => {
            const filtered = items.filter(item => {
                const pId = item.parent_id ?? item.parentId ?? item.parent_category_id;
                if (parentId === null) return pId == null;
                return String(pId) === String(parentId);
            });
            return filtered.map(item => {
                const id = item.id ?? item.category_id;
                const name = item.name ?? item.category_name ?? "Không có tên";
                return { id: String(id), label: name, children: buildTree(items, id) };
            });
        };
        return buildTree(allNodes);
    }, [categories]);

    useEffect(() => {
        if (open && userInfo?.sub) {
            getPlansByTutor(userInfo.sub, token).then(res => setPlans(Array.isArray(res) ? res : [])).catch(console.error);
        }
    }, [open, userInfo, token]);

    useEffect(() => {
        if (filters.bookId) {
            setLoadingCategories(true);
            getAllCategories({ plan_id: filters.bookId, mode: "tree" }, token)
                .then(res => {
                    let nodes = [];
                    if (Array.isArray(res)) nodes = res;
                    else if (res?.data) nodes = Array.isArray(res.data) ? res.data : [res.data];
                    else if (res?.categories) nodes = Array.isArray(res.categories) ? res.categories : [res.categories];
                    setCategories(nodes);
                })
                .catch(() => setCategories([]))
                .finally(() => setLoadingCategories(false));
        } else {
            setCategories([]);
        }
    }, [filters.bookId, token]);

    const fetchQuestions = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                level: filters.level || undefined,
                type: filters.type || undefined,
                category_id: filters.categoryId || undefined,
                plan_id: filters.bookId || undefined,
                search: debouncedSearch || undefined,
            };

            let response;
            if (viewMode === "public") response = await getAllQuestions(params, token);
            else {
                if (!userInfo?.sub) return;
                response = await getMyQuestions(userInfo.sub, params, token);
            }
            
            setQuestions(response?.data || []);
            setTotalQuestions(response?.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token, userInfo, viewMode, page, rowsPerPage, filters, debouncedSearch]);

    useEffect(() => { if (open) fetchQuestions(); }, [fetchQuestions, open]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === "bookId") newFilters.categoryId = "";
            return newFilters;
        });
        setPage(0);
    };

    const handleTreeSelection = (event, selectedItems) => {
        const selectedId = Array.isArray(selectedItems) ? (selectedItems[0] || "") : (selectedItems || "");
        setFilters(prev => ({ ...prev, categoryId: selectedId }));
        setPage(0);
    };

    const handleToggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const validIds = questions
                .filter(q => !existingQuestionIds.includes(q.ques_id))
                .map(q => q.ques_id);
            
            setSelectedIds(prev => [...new Set([...prev, ...validIds])]);
        } else {
            const pageIds = questions.map(q => q.ques_id);
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        }
    }

    const handleSubmit = async () => {
        if (selectedIds.length === 0) return;
        setSubmitting(true);
        try {
            await addQuestionToExam(examId, selectedIds, token);
            onRefresh();
            onClose();
            setSelectedIds([]);
        } catch (error) {
            alert("Lỗi: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewDetail = (qId) => {
        window.open(`/tutor/question/${qId}`, '_blank');
    };

    const isAllSelected = questions.length > 0 && questions.every(q => selectedIds.includes(q.ques_id) || existingQuestionIds.includes(q.ques_id));
    const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

    return (
        <Dialog 
            open={!!open} 
            onClose={onClose} 
            maxWidth="xl" 
            fullWidth 
            PaperProps={{ sx: { height: '90vh', display: 'flex', flexDirection: 'column' } }}
        >
            {/* 1. HEADER */}
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', py: 1.5, px: 3, flexShrink: 0 }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Thêm câu hỏi vào đề thi</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Đã chọn: <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{selectedIds.length}</span> câu
                    </Typography>
                </Box>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            {/* 2. BODY */}
            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
                
                {/* --- SIDEBAR --- */}
                <Box sx={{ width: 320, borderRight: 1, borderColor: 'divider', bgcolor: '#fcfcfc', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            <FilterListIcon fontSize="small" sx={{ mr: 1 }} /> Bộ lọc
                        </Typography>

                        <Stack spacing={2.5}>
                            <FormControl fullWidth size="small">
                                <Typography variant="caption" color="text.secondary" gutterBottom>Nguồn dữ liệu</Typography>
                                <ToggleButtonGroup
                                    color="primary"
                                    value={viewMode}
                                    exclusive
                                    onChange={(e, newMode) => { if(newMode) { setViewMode(newMode); setPage(0); } }}
                                    size="small"
                                    fullWidth
                                >
                                    <ToggleButton value="my_questions">Của tôi</ToggleButton>
                                    <ToggleButton value="public">Công khai</ToggleButton>
                                </ToggleButtonGroup>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel>Giáo án</InputLabel>
                                <Select name="bookId" value={filters.bookId} label="Giáo án" onChange={handleFilterChange}>
                                    <MenuItem value=""><em>Tất cả giáo án</em></MenuItem>
                                    {plans.map(p => <MenuItem key={p.plan_id} value={p.plan_id}>{p.title}</MenuItem>)}
                                </Select>
                            </FormControl>

                            {filters.bookId && (
                                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1, bgcolor: '#fff' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <FolderIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} /> Chọn chuyên đề:
                                    </Typography>
                                    
                                    {loadingCategories ? (
                                        <Box display="flex" justifyContent="center" p={2}><CircularProgress size={20} /></Box>
                                    ) : categoryTreeData.length > 0 ? (
                                        <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                                            <RichTreeView
                                                items={categoryTreeData}
                                                slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
                                                onSelectedItemsChange={handleTreeSelection}
                                                selectedItems={filters.categoryId ? [String(filters.categoryId)] : []}
                                                sx={{ '& .MuiTreeItem-content': { py: 0.5, borderRadius: 1, '&.Mui-selected': { bgcolor: 'primary.lighter', color: 'primary.main', fontWeight: 'bold' } } }}
                                            />
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                                            (Trống)
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            <Stack direction="row" spacing={1}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Độ khó</InputLabel>
                                    <Select name="level" value={filters.level} label="Độ khó" onChange={handleFilterChange}>
                                        <MenuItem value=""><em>Tất cả</em></MenuItem>
                                        <MenuItem value="EASY">Dễ</MenuItem>
                                        <MenuItem value="MEDIUM">Trung bình</MenuItem>
                                        <MenuItem value="HARD">Khó</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <InputLabel>Loại</InputLabel>
                                    <Select name="type" value={filters.type} label="Loại" onChange={handleFilterChange}>
                                        <MenuItem value=""><em>Tất cả</em></MenuItem>
                                        <MenuItem value="single_choice">TN (1)</MenuItem>
                                        <MenuItem value="multiple_choice">TN (N)</MenuItem>
                                        <MenuItem value="essay">Tự luận</MenuItem>
                                        <MenuItem value="true_false">Đúng/Sai</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Button 
                                variant="outlined" 
                                color="inherit" 
                                size="small" 
                                startIcon={<RestartAltIcon />} 
                                onClick={() => { setFilters({ search: "", level: "", type: "", bookId: "", categoryId: "" }); setPage(0); }}
                            >
                                Xóa bộ lọc
                            </Button>
                        </Stack>
                    </Box>
                </Box>

                {/* --- MAIN (Bảng câu hỏi) --- */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5', p: 2, overflow: 'hidden' }}>
                    
                    <Box sx={{ mb: 2, bgcolor: '#fff', p: 1, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <TextField
                            placeholder="Nhập từ khóa tiêu đề..."
                            size="small"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            fullWidth
                            InputProps={{ 
                                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                                sx: { bgcolor: '#f9f9f9' }
                            }}
                        />
                    </Box>

                    <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 1 }}>
                        <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox" sx={{ bgcolor: '#eee', width: 50 }}>
                                            <Checkbox 
                                                onChange={handleSelectAll}
                                                checked={isAllSelected}
                                                indeterminate={isIndeterminate}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ bgcolor: '#eee', fontWeight: 'bold' }}>Tiêu đề câu hỏi</TableCell>
                                        <TableCell sx={{ bgcolor: '#eee', fontWeight: 'bold', width: 100 }}>Loại</TableCell>
                                        <TableCell sx={{ bgcolor: '#eee', fontWeight: 'bold', width: 100 }}>Độ khó</TableCell>
                                        <TableCell sx={{ bgcolor: '#eee', fontWeight: 'bold', width: 60, textAlign: 'center' }}>Xem</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={30} sx={{ my: 4 }} /></TableCell></TableRow>
                                    ) : questions.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không tìm thấy câu hỏi nào.</TableCell></TableRow>
                                    ) : (
                                        questions.map((q) => {
                                            const isExists = existingQuestionIds.includes(q.ques_id);
                                            const isSelected = selectedIds.includes(q.ques_id);
                                            return (
                                                <TableRow 
                                                    key={q.ques_id} 
                                                    hover 
                                                    selected={isSelected}
                                                    sx={{ 
                                                        opacity: isExists ? 0.6 : 1, 
                                                        bgcolor: isExists ? '#f0f0f0' : 'inherit',
                                                        cursor: isExists ? 'default' : 'pointer'
                                                    }}
                                                    onClick={() => !isExists && handleToggleSelect(q.ques_id)}
                                                >
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={isSelected || isExists}
                                                            disabled={isExists}
                                                            onClick={(e) => e.stopPropagation()} 
                                                            onChange={() => handleToggleSelect(q.ques_id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {/* CHỈ HIỆN TIÊU ĐỀ */}
                                                        <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.5 }}>
                                                            {q.title || "(Câu hỏi chưa có tiêu đề)"}
                                                        </Typography>
                                                        
                                                        {isExists && <Chip label="Đã có trong đề" size="small" color="default" sx={{ mt: 0.5, height: 20, fontSize: 10 }} />}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={TYPE_MAP[q.type] || q.type} size="small" variant="outlined" sx={{borderRadius: 1}} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={DIFFICULTY_MAP[q.level]?.text || q.level} 
                                                            color={DIFFICULTY_MAP[q.level]?.color || "default"} 
                                                            size="small" variant="filled" sx={{ width: '100%' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="Xem chi tiết">
                                                            <IconButton 
                                                                size="small" 
                                                                color="primary" 
                                                                onClick={(e) => { e.stopPropagation(); handleViewDetail(q.ques_id); }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Divider />
                        <TablePagination
                            component="div"
                            count={totalQuestions}
                            page={page}
                            onPageChange={(e, p) => setPage(p)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            rowsPerPageOptions={[10, 25, 50]}
                            labelRowsPerPage="Dòng:"
                        />
                    </Paper>
                </Box>
            </DialogContent>

            {/* 3. FOOTER */}
            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
                <Button onClick={onClose} color="inherit" size="large">Hủy bỏ</Button>
                <Button 
                    variant="contained" 
                    onClick={handleSubmit} 
                    disabled={submitting || selectedIds.length === 0}
                    size="large"
                    sx={{ px: 4 }}
                >
                    {submitting ? "Đang xử lý..." : `Thêm ${selectedIds.length} câu hỏi`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}