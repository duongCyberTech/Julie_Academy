<<<<<<< HEAD
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllQuestions,
  getMyQuestions,
  deleteQuestion,
} from "../../services/QuestionService";
import { getAllBooks, getAllCategories } from "../../services/CategoryService";
import QuestionPopup from "../../components/QuestionPopup";
import ActionMenu from "../../components/ActionMenu";
import AppSnackbar from "../../components/Snackbar";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TableSortLabel,
  TablePagination,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Stack,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import QuestionContentRenderer from "../../components/QuestionContentRenderer";
import FilterListIcon from "@mui/icons-material/FilterList";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { alpha } from "@mui/material/styles";

const PageWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor:
    theme.palette.mode === "light"
      ? theme.palette.grey[50]
      : theme.palette.background.paper,
=======
import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import katex from 'katex';
import 'katex/dist/katex.min.css';

import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  CircularProgress, Alert, TablePagination, Chip, ToggleButtonGroup,
  ToggleButton, Grid, TextField, FormControl, InputLabel, Select,
  MenuItem, Collapse, Stack
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

// Icons
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Services
import { getAllQuestions, getMyQuestions } from "../../services/QuestionService";
import { getAllCategories, getPlansByTutor } from "../../services/CategoryService";

// --- SUB-COMPONENT: LATEX PREVIEW ---
const LatexPreview = ({ content, noWrap = false }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && content) {
            // Render nội dung HTML đơn giản để preview
            containerRef.current.innerHTML = content;
        }
    }, [content]);

    return (
        <div 
            ref={containerRef} 
            style={{ 
                whiteSpace: noWrap ? 'nowrap' : 'normal', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                maxHeight: '3em'
            }} 
        />
    );
};

// --- STYLED COMPONENTS ---
const PageWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[50] : theme.palette.background.paper,
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
}));

const Header = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
});

<<<<<<< HEAD
const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    borderRadius: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
    "&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused": {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
      color: theme.palette.primary.dark,
    },
  },
  [`& .${treeItemClasses.label}`]: {
    fontWeight: "500",
  },
}));

const difficultyOrder = { EASY: 1, MEDIUM: 2, HARD: 3 };
function descendingComparator(a, b, orderBy) {
  let valA = a[orderBy] ?? "";
  let valB = b[orderBy] ?? "";
  if (orderBy === "level") {
    valA = difficultyOrder[String(valA).toUpperCase()] || 0;
    valB = difficultyOrder[String(valB).toUpperCase()] || 0;
  }
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === "desc"
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
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
const headCells = [
  { id: "content", label: "Nội dung", minWidth: 250 },
  { id: "level", label: "Độ khó", minWidth: 100 },
  { id: "type", label: "Loại", minWidth: 120 },
  { id: "category", label: "Dạng bài", minWidth: 170, disableSorting: true },
  { id: "book", label: "Sách", minWidth: 170, disableSorting: true },
  {
    id: "actions",
    label: "Hành động",
    minWidth: 100,
    disableSorting: true,
    align: "right",
  },
];
const difficultyMap = {
=======
// --- CONSTANTS ---
const HEAD_CELLS = [
  { id: "title", label: "Tiêu đề", minWidth: 200 }, 
  { id: "level", label: "Độ khó", minWidth: 100 },
  { id: "category", label: "Chuyên đề", minWidth: 150 },
  { id: "book", label: "Giáo án", minWidth: 150 },
  { id: "actions", label: "Chi tiết", minWidth: 80, align: "center" },
];

const DIFFICULTY_MAP = {
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
  EASY: { text: "Dễ", color: "success" },
  MEDIUM: { text: "Trung bình", color: "warning" },
  HARD: { text: "Khó", color: "error" },
};
<<<<<<< HEAD
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
                <MenuItem key={option.book_id} value={option.book_id}>
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

export default function QuestionManagementPage() {
  const navigate = useNavigate();
  const [token] = useState(() => localStorage.getItem("token"));
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("createAt");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState("public");
  const [filters, setFilters] = useState({
    search: "",
    level: "",
    type: "",
    bookId: "",
    categoryId: "",
  });
  const debouncedSearch = useDebounce(filters.search, 500);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const userInfo = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch (e) {
      console.error("Invalid token:", e);
      return null;
    }
  }, [token]);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!token) return;
      setLoadingBooks(true);
      try {
        const allBooks = await getAllBooks(token);
        setBooks(Array.isArray(allBooks) ? allBooks : []);
      } catch (err) {
        console.error("Error fetching books for filter:", err);
        setError("Lỗi tải danh sách sách.");
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchBooks();
  }, [token]);

=======

const DifficultyChip = ({ difficulty }) => {
  const mapping = DIFFICULTY_MAP[String(difficulty).toUpperCase()] || { text: difficulty || "N/A", color: "default" };
  return <Chip label={mapping.text} color={mapping.color} size="small" variant="outlined" />;
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- SUB-COMPONENT: FILTERS ---
const QuestionFilters = memo(({ filters, onFilterChange, onReset, books, categories, loadingBooks, loadingCategories }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'background.default' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        
        {/* 1. Tìm kiếm */}
        <TextField
          label="Tìm kiếm nội dung" variant="outlined" name="search"
          value={filters.search} onChange={onFilterChange} size="small"
          sx={{ minWidth: 200, flexGrow: 1 }}
          InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
        />

        {/* 2. Giáo án (Plan) */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Giáo án</InputLabel>
          <Select name="bookId" value={filters.bookId} label="Giáo án" onChange={onFilterChange}>
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            {books.map((b) => (
              <MenuItem key={b.plan_id} value={b.plan_id}>{`${b.title} (K${b.grade})`}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 3. Chuyên đề (Category) */}
        <FormControl size="small" sx={{ minWidth: 200 }} disabled={!filters.bookId || loadingCategories}>
             <InputLabel>Chuyên đề</InputLabel>
             <Select name="categoryId" value={filters.categoryId} label="Chuyên đề" onChange={onFilterChange}>
                <MenuItem value=""><em>Tất cả</em></MenuItem>
                {categories.map((c) => (
                    <MenuItem key={c.category_id} value={c.category_id}>{c.category_name}</MenuItem>
                ))}
             </Select>
        </FormControl>

        {/* 4. Độ khó */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Độ khó</InputLabel>
          <Select name="level" value={filters.level} label="Độ khó" onChange={onFilterChange}>
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            <MenuItem value="EASY">Dễ</MenuItem>
            <MenuItem value="MEDIUM">TB</MenuItem>
            <MenuItem value="HARD">Khó</MenuItem>
          </Select>
        </FormControl>

        {/* 5. Loại câu hỏi */}
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Loại</InputLabel>
          <Select name="type" value={filters.type} label="Loại" onChange={onFilterChange}>
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            <MenuItem value="single_choice">TN (1)</MenuItem>
            <MenuItem value="multiple_choice">TN (N)</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title="Đặt lại bộ lọc">
            <IconButton onClick={onReset} size="small"><RestartAltIcon /></IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
});

// --- MAIN COMPONENT ---
export default function QuestionPage() {
  const navigate = useNavigate();
  const [token] = useState(() => localStorage.getItem("token"));
  
  // Data
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // UI
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState(null);
  
  // Control
  const [viewMode, setViewMode] = useState("my_questions");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({ search: "", level: "", type: "", bookId: "", categoryId: "" });
  
  const debouncedSearch = useDebounce(filters.search, 500);

  const userInfo = useMemo(() => {
    try { return token ? jwtDecode(token) : null; } 
    catch (e) { return null; }
  }, [token]);

  // 1. Load Books (Giáo án)
  useEffect(() => {
    const fetchBooks = async () => {
      if (!token || !userInfo?.sub) return;
      try {
        const res = await getPlansByTutor(userInfo.sub, token); 
        setBooks(Array.isArray(res) ? res : []);
      } catch (err) { console.error(err); } 
    };
    fetchBooks();
  }, [token, userInfo]);

  // 2. Load Categories khi chọn Book
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
  useEffect(() => {
    const fetchCategories = async () => {
      if (!filters.bookId || !token) {
        setCategories([]);
<<<<<<< HEAD
        setFilters((prev) => ({ ...prev, categoryId: "" }));
=======
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
        return;
      }
      setLoadingCategories(true);
      try {
<<<<<<< HEAD
        const catData = await getAllCategories(
          { book_id: filters.bookId, mode: "tree" },
          token
        );
        setCategories(Array.isArray(catData?.data) ? catData.data : []);
      } catch (err) {
        console.error("Error fetching categories for filter:", err);
        setError("Lỗi tải danh mục.");
      } finally {
        setLoadingCategories(false);
      }
=======
        // Mode 'flat' để lấy danh sách phẳng đưa vào Select
        const catData = await getAllCategories({ plan_id: filters.bookId, mode: "flat" }, token);
        setCategories(Array.isArray(catData?.data) ? catData.data : []);
      } catch (err) { console.error(err); } 
      finally { setLoadingCategories(false); }
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
    };
    fetchCategories();
  }, [filters.bookId, token]);

<<<<<<< HEAD
  const fetchQuestions = useCallback(async () => {
    if (!token) {
      setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
      setLoading(false);
      return;
    }
=======
  // 3. Fetch Questions
  const fetchQuestions = useCallback(async () => {
    if (!token) return;
    if (viewMode === 'my_questions' && !userInfo?.sub) return;

>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        level: filters.level || undefined,
        type: filters.type || undefined,
        category_id: filters.categoryId || undefined,
<<<<<<< HEAD
        book_id: filters.bookId || undefined,
        search: debouncedSearch || undefined,
      };
      const response =
        viewMode === "public"
          ? await getAllQuestions(params, token)
          : await getMyQuestions(params, token);
=======
        plan_id: filters.plan_id || undefined, 
        search: debouncedSearch || undefined,
      };
      
      let response;
      if (viewMode === "public") {
        response = await getAllQuestions(params, token);
      } else {
        response = await getMyQuestions(userInfo.sub, params, token);
      }
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268

      setQuestions(response?.data ?? []);
      setTotalQuestions(response?.total ?? 0);
    } catch (err) {
<<<<<<< HEAD
      setError("Không thể tải danh sách câu hỏi. Vui lòng thử lại.");
      setQuestions([]);
      setTotalQuestions(0);
      console.error("Fetch questions error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, viewMode, debouncedSearch, filters, page, rowsPerPage]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions, reloadCounter]);

  const handleRequestSort = (property) => {};
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (name === "bookId") {
        newFilters.categoryId = "";
      }
=======
      setError("Không thể tải danh sách câu hỏi.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [token, viewMode, debouncedSearch, filters, page, rowsPerPage, userInfo]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === "bookId") newFilters.categoryId = ""; // Reset Category khi đổi Book
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
      return newFilters;
    });
    setPage(0);
  };

<<<<<<< HEAD
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      setPage(0);
    }
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
      setReloadCounter((prev) => prev + 1);
    }
  };
  const handleEdit = (questionId) =>
    navigate(`/tutor/edit-question/${questionId}`);
  const handleOpenDeleteDialog = (questionId) => {
    setQuestionToDelete(questionId);
    setOpenDeleteDialog(true);
  };
  const handleCloseDeleteDialog = () => {
    setQuestionToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete || !token) return;
    try {
      await deleteQuestion(questionToDelete, token);
      setReloadCounter((prev) => prev + 1);
      handleCloseDeleteDialog();
      setToast({
        open: true,
        message: "Xóa câu hỏi thành công!",
        severity: "success",
      });
    } catch (err) {
      setError("Xóa câu hỏi thất bại. Vui lòng thử lại.");
      console.error("Delete question error:", err);
      setToast({
        open: true,
        message: "Xóa câu hỏi thất bại.",
        severity: "error",
      });
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
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const visibleRows = questions;
=======
  const handleReset = () => {
      setFilters({ search: "", level: "", type: "", bookId: "", categoryId: "" });
      setPage(0);
  };

  const handleNavigateDetail = (id) => navigate(`/tutor/question/${id}`);
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268

  return (
    <PageWrapper>
      <Header>
<<<<<<< HEAD
        <Typography variant="h4" component="h1" fontWeight="bold">
          Thư viện câu hỏi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenPopup}
          startIcon={<AddCircleOutlineIcon />}
          sx={{ fontWeight: "bold" }}
        >
          Tạo câu hỏi mới
        </Button>
      </Header>

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          color="primary"
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="Chế độ xem câu hỏi"
        >
          <ToggleButton value="public" aria-label="Tất cả câu hỏi">
            Tất cả câu hỏi
          </ToggleButton>
          <ToggleButton
            value="my_questions"
            aria-label="Câu hỏi của tôi"
            disabled={!userInfo}
          >
            Câu hỏi của tôi
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8.5}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          ) : (
            <Paper
              variant="outlined"
              sx={{ borderRadius: 2, overflow: "hidden" }}
            >
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      {headCells.map((headCell) => (
                        <TableCell
                          key={headCell.id}
                          sortDirection={
                            orderBy === headCell.id ? order : false
                          }
                          align={headCell.align || "left"}
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "grey.100",
                            minWidth: headCell.minWidth,
                            py: 1.5,
                          }}
                        >
                          {headCell.disableSorting ? (
                            headCell.label
                          ) : (
                            <TableSortLabel
                              active={orderBy === headCell.id}
                              direction={
                                orderBy === headCell.id ? order : "asc"
                              }
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
                        <TableRow key={q.ques_id} hover>
                          <TableCell
                            sx={{ minWidth: headCells[0].minWidth, py: 1.5 }}
                          >
                            <QuestionContentRenderer htmlContent={q.content} />
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <DifficultyChip difficulty={q.level} />
                          </TableCell>
                          <TableCell
                            sx={{ textTransform: "capitalize", py: 1.5 }}
                          >
                            {formatQuestionType(q.type)}
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Tooltip title={q.category?.category_name || "N/A"}>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ maxWidth: 150 }}
                              >
                                {q.category?.category_name || "N/A"}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Tooltip title={q.category?.Books?.title || "N/A"}>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ maxWidth: 150 }}
                              >
                                {q.category?.Books?.title || "N/A"}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 1 }}>
                            <Tooltip title="Hành động">
                              <IconButton
                                size="small"
                                onClick={(event) => handleMenuClick(event, q)}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={headCells.length}
                          align="center"
                          sx={{ py: 3 }}
                        >
                          Không có câu hỏi nào phù hợp.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
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

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa câu hỏi?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa câu hỏi
            này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {isPopupOpen && userInfo && (
        <QuestionPopup
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          tutorId={userInfo.sub}
        />
      )}

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
=======
        <Typography variant="h4" component="h1" fontWeight="bold">Thư viện câu hỏi</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
                color="primary"
                value={viewMode}
                exclusive
                onChange={(e, newMode) => { if (newMode) { setViewMode(newMode); setPage(0); } }}
                size="small"
            >
            <ToggleButton value="my_questions">Của tôi</ToggleButton>
            <ToggleButton value="public">Công khai</ToggleButton>
            </ToggleButtonGroup>

            <Button 
                variant="contained" 
                onClick={() => navigate('/tutor/new')} 
                startIcon={<AddCircleOutlineIcon />} 
                sx={{ fontWeight: "bold" }}
            >
                Tạo mới
            </Button>
        </Stack>
      </Header>

      <QuestionFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onReset={handleReset}
        books={books} 
        categories={categories} 
        loadingCategories={loadingCategories} 
        loadingBooks={loading}
      />

      {/* Main Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={8}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {HEAD_CELLS.map((cell) => (
                    <TableCell key={cell.id} align={cell.align || "left"} sx={{ fontWeight: "bold", bgcolor: "grey.50", minWidth: cell.minWidth }}>
                      {cell.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {questions.length > 0 ? questions.map((q) => (
                  <TableRow key={q.ques_id} hover>
                    {/* 1. Tiêu đề */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ maxWidth: 300 }} title={q.title}>
                        {q.title || "Câu hỏi không tiêu đề"}
                      </Typography>
                    </TableCell>
                    
                    {/* 2. Độ khó */}
                    <TableCell sx={{ py: 1.5 }}>
                        <DifficultyChip difficulty={q.level} />
                    </TableCell>
                    
                    {/* 3. Chuyên đề */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }} title={q.category?.category_name}>
                        {q.category?.category_name || "---"}
                      </Typography>
                    </TableCell>
                    
                    {/* 4. Giáo án (Plan) */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }} title={q.category?.structure?.[0]?.Plan?.title}>
                        {/* Lấy tên Plan từ structure đầu tiên, dùng ?. để tránh crash */}
                        {q.category?.structure?.[0]?.Plan?.title || "---"}
                      </Typography>
                    </TableCell>
                    
                    {/* 5. Hành động */}
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton color="primary" size="small" onClick={() => handleNavigateDetail(q.ques_id)}>
                          <SearchIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không tìm thấy câu hỏi nào.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalQuestions}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Paper>
      )}
    </PageWrapper>
  );
}
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
