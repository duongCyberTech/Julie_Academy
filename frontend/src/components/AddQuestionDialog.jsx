import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
    getAllQuestions,
    getMyQuestions,
} from '../services/QuestionService'; 
import { getAllBooks, getAllCategories } from '../services/CategoryService'; 
import { addQuestionToExam } from '../services/ExamService'; 
import { jwtDecode } from "jwt-decode";
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip, CircularProgress,
    Alert, Dialog, DialogActions, DialogContent, DialogTitle,
    TablePagination, Chip, ToggleButtonGroup, ToggleButton,
    Grid, Checkbox, TextField, FormControl, InputLabel,
    Select, MenuItem, Collapse, Stack
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles'; 

import QuestionContentRenderer from './QuestionContentRenderer'; 

import FilterListIcon from "@mui/icons-material/FilterList";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const difficultyMap = {
  EASY: { text: "Dễ", color: "success" },
  MEDIUM: { text: "Trung bình", color: "warning" },
  HARD: { text: "Khó", color: "error" },
};
const DifficultyChip = ({ difficulty }) => {
  const mapping = difficultyMap[String(difficulty).toUpperCase()] || {
    text: difficulty || "N/A",
    color: "default",
  };
  return (
    <Chip
      label={mapping.text}
      color={mapping.color}
      size="small"
      sx={{ textTransform: "capitalize" }}
    />
  );
};

const questionTypeMap = {
  single_choice: "Một đáp án",
  multiple_choice: "Nhiều đáp án",
};
const formatQuestionType = (type) => {
  return questionTypeMap[type] || type?.replace("_", " ") || "N/A";
};

// Component QuestionFilters (copy từ QuestionPage.jsx)
const QuestionFilters = memo(
  ({
    filters,
    onFilterChange,
    books,
    categories,
    loadingBooks,
    loadingCategories,
  }) => {
    const theme = useTheme();

    const transformCategoriesForTree = (nodes) => {
      return nodes.map((node) => ({
        id: node.category_id,
        label: node.category_name,
        children: Array.isArray(node.children)
          ? transformCategoriesForTree(node.children)
          : [],
      }));
    };

    const categoryTreeData = useMemo(
      () => transformCategoriesForTree(categories),
      [categories]
    );

    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          height: "100%",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <FilterListIcon sx={{ mr: 1, color: "primary.main" }} />
          Bộ lọc câu hỏi
        </Typography>
        <Stack spacing={2.5} mt={2}>
          <TextField
            fullWidth
            label="Tìm kiếm nội dung"
            variant="outlined"
            name="search"
            value={filters.search}
            onChange={onFilterChange}
            size="small"
          />
          <FormControl fullWidth size="small" disabled={loadingBooks}>
            <InputLabel id="book-filter-label">Chọn Sách</InputLabel>
            <Select
              labelId="book-filter-label"
              name="bookId"
              value={filters.bookId}
              label="Chọn Sách"
              onChange={onFilterChange}
            >
              <MenuItem value="">
                <em>Tất cả Sách</em>
              </MenuItem>
              {books.map((option) => (
                <MenuItem key={option.plan_id} value={option.planid}>
                  {`${option.title} (Lớp ${option.grade})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Collapse in={!!filters.bookId}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Chọn dạng bài
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                maxHeight: 300,
                overflowY: "auto",
                p: 1,
                borderColor: "divider",
                bgcolor: "action.hover",
              }}
            >
              {loadingCategories ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : categoryTreeData.length > 0 ? (
                <RichTreeView
                  items={categoryTreeData}
                  slots={{
                    collapseIcon: ExpandMoreIcon,
                    expandIcon: ChevronRightIcon,
                  }}
                  onSelectedItemsChange={(event, itemId) =>
                    onFilterChange({
                      target: { name: "categoryId", value: itemId },
                    })
                  }
                  selectedItems={filters.categoryId}
                />
              ) : (
                <Typography variant="caption" sx={{ p: 2, display: "block" }}>
                  Sách này chưa có danh mục.
                </Typography>
              )}
            </Paper>
          </Collapse>
          <FormControl fullWidth size="small">
            <InputLabel id="level-filter-label">Độ khó</InputLabel>
            <Select
              labelId="level-filter-label"
              name="level"
              value={filters.level}
              label="Độ khó"
              onChange={onFilterChange}
            >
              <MenuItem value="">
                <em>Tất cả</em>
              </MenuItem>
              <MenuItem value="EASY">Dễ</MenuItem>
              <MenuItem value="MEDIUM">Trung bình</MenuItem>
              <MenuItem value="HARD">Khó</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="type-filter-label">Loại câu hỏi</InputLabel>
            <Select
              labelId="type-filter-label"
              name="type"
              value={filters.type}
              label="Loại câu hỏi"
              onChange={onFilterChange}
            >
              <MenuItem value="">
                <em>Tất cả</em>
              </MenuItem>
              <MenuItem value="single_choice">Một đáp án</MenuItem>
              <MenuItem value="multiple_choice">Nhiều đáp án</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>
    );
  }
);
// --- END: Code copy từ QuestionPage.jsx ---


// Tiêu đề bảng
const headCells = [
  { id: 'select', label: 'Chọn', minWidth: 50 },
  { id: 'content', label: 'Nội dung', minWidth: 250 },
  { id: 'level', label: 'Độ khó', minWidth: 100 },
  { id: 'type', label: 'Loại', minWidth: 120 },
  { id: 'category', label: 'Dạng bài', minWidth: 170 },
  { id: 'book', label: 'Sách', minWidth: 170 },
];

function AddQuestionDialog({ open, onClose, onRefresh, examId, existingQuestionIds = [] }) {
  const [token] = useState(() => localStorage.getItem("token"));
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState("public");
  const [filters, setFilters] = useState({
    search: "", level: "", type: "", bookId: "", categoryId: "",
  });
  const debouncedSearch = useDebounce(filters.search, 500);
  
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const [selected, setSelected] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userInfo = useMemo(() => {
    try { return token ? jwtDecode(token) : null; } 
    catch (e) { return null; }
  }, [token]);

  // Logic Fetch (Copy từ QuestionPage)
  useEffect(() => {
    const fetchBooks = async () => {
        if (!token) return;
        setLoadingBooks(true);
        try {
            const allBooks = await getAllBooks(token);
            setBooks(Array.isArray(allBooks) ? allBooks : []);
        } catch (err) {
            console.error("Error fetching books for filter:", err);
            // Không set lỗi chính để tránh che lỗi tải câu hỏi
        } finally {
            setLoadingBooks(false);
        }
    };
    fetchBooks();
  }, [token]);

  useEffect(() => {
    const fetchCategories = async () => {
        if (!filters.bookId || !token) {
            setCategories([]);
            setFilters((prev) => ({ ...prev, categoryId: "" }));
            return;
        }
        setLoadingCategories(true);
        try {
            const catData = await getAllCategories(
                { plan_id: filters.bookId, mode: "tree" },
                token
            );
            setCategories(Array.isArray(catData?.data) ? catData.data : []);
        } catch (err) {
            console.error("Error fetching categories for filter:", err);
        } finally {
            setLoadingCategories(false);
        }
    };
    fetchCategories();
  }, [filters.bookId, token]);

  const fetchQuestions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        level: filters.level || undefined,
        type: filters.type || undefined,
        category_id: filters.categoryId || undefined,
        plan_id: filters.plan_id || undefined,
        search: debouncedSearch || undefined,
      };
      const response =
        viewMode === "public"
          ? await getAllQuestions(params, token)
          : await getMyQuestions(params, token);
      
      setQuestions(response?.data ?? []);
      setTotalQuestions(response?.total ?? 0);
    } catch (err) {
      setError("Không thể tải danh sách câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, [token, viewMode, debouncedSearch, filters, page, rowsPerPage]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Logic Xử lý (Copy từ QuestionPage)
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (name === "bookId") newFilters.categoryId = "";
      return newFilters;
    });
    setPage(0);
  };
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) { setViewMode(newMode); setPage(0); }
  };
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Logic Chọn (Mới)
  const handleSelectClick = (ques_id) => {
    setSelected(prev => {
        const newSelected = {...prev};
        if (newSelected[ques_id]) {
            delete newSelected[ques_id];
        } else {
            newSelected[ques_id] = true;
        }
        return newSelected;
    });
  };
  
  const selectedCount = Object.keys(selected).length;

  // Logic Submit (Mới)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
        const selectedIds = Object.keys(selected);
        await addQuestionToExam(examId, selectedIds, token);
        onRefresh();
        onClose();
    } catch (err) {
        setError("Lỗi khi thêm câu hỏi vào đề thi.");
        setIsSubmitting(false); // Chỉ dừng nếu có lỗi
    }
    // Không set isSubmitting = false ở đây nếu thành công, vì dialog sẽ đóng
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle fontWeight={600}>
        Thêm câu hỏi từ thư viện
        {selectedCount > 0 && ` (Đã chọn ${selectedCount} câu)`}
      </DialogTitle>
      
      <DialogContent sx={{ p: {xs: 1, md: 3}, bgcolor: 'grey.50' }}>
        {/* Hiển thị lỗi submit ở đây */}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            color="primary" value={viewMode} exclusive
            onChange={handleViewModeChange} size="small"
          >
            <ToggleButton value="public">Tất cả câu hỏi</ToggleButton>
            <ToggleButton value="my_questions" disabled={!userInfo}>
              Câu hỏi của tôi
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8.5}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        {headCells.map((headCell) => (
                          <TableCell
                            key={headCell.id}
                            align={headCell.align || "left"}
                            sx={{ fontWeight: "bold", bgcolor: "grey.100" }}
                          >
                            {headCell.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {questions.map((q) => {
                        const isSelected = !!selected[q.ques_id];
                        const isExisting = existingQuestionIds.includes(q.ques_id); 
                        
                        return (
                          <TableRow 
                            key={q.ques_id} 
                            hover 
                            onClick={() => !isExisting && handleSelectClick(q.ques_id)}
                            role="checkbox"
                            selected={isSelected}
                            sx={{ 
                                cursor: isExisting ? 'not-allowed' : 'pointer',
                                opacity: isExisting ? 0.5 : 1,
                                // Làm mờ nếu đã tồn tại
                                ...(isExisting && {
                                    backgroundColor: (theme) => alpha(theme.palette.action.disabledBackground, 0.3)
                                })
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={isSelected}
                                disabled={isExisting}
                                // Tooltip giải thích vì sao bị disable
                                title={isExisting ? "Câu hỏi này đã có trong đề" : "Chọn câu hỏi"}
                              />
                            </TableCell>
                            <TableCell>
                              <QuestionContentRenderer htmlContent={q.content} />
                            </TableCell>
                            <TableCell><DifficultyChip difficulty={q.level} /></TableCell>
                            <TableCell>{formatQuestionType(q.type)}</TableCell>
                            <TableCell>{q.category?.category_name || "N/A"}</TableCell>
                            <TableCell>{q.category?.Books?.title || "N/A"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={totalQuestions}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Số hàng mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} / ${count !== -1 ? count : `hơn ${to}`}`
                  }
                />
              </Paper>
            )}
          </Grid>

          <Grid item xs={12} md={3.5}>
            <QuestionFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              books={books}
              categories={categories}
              loadingBooks={loadingBooks}
              loadingCategories={loadingCategories}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} disabled={isSubmitting}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || selectedCount === 0}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? "Đang thêm..." : `Thêm ${selectedCount} câu hỏi`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(AddQuestionDialog);