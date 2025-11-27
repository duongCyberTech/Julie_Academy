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

// --- CONSTANTS ---
const HEAD_CELLS = [
  { id: "title", label: "Tiêu đề", minWidth: 200 }, 
  { id: "level", label: "Độ khó", minWidth: 100 },
  { id: "category", label: "Chuyên đề", minWidth: 150 },
  { id: "book", label: "Giáo án", minWidth: 150 },
  { id: "actions", label: "Chi tiết", minWidth: 80, align: "center" },
];

const DIFFICULTY_MAP = {
  EASY: { text: "Dễ", color: "success" },
  MEDIUM: { text: "Trung bình", color: "warning" },
  HARD: { text: "Khó", color: "error" },
};

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
  useEffect(() => {
    const fetchCategories = async () => {
      if (!filters.bookId || !token) {
        setCategories([]);
        return;
      }
      setLoadingCategories(true);
      try {
        // Mode 'flat' để lấy danh sách phẳng đưa vào Select
        const catData = await getAllCategories({ plan_id: filters.bookId, mode: "flat" }, token);
        setCategories(Array.isArray(catData?.data) ? catData.data : []);
      } catch (err) { console.error(err); } 
      finally { setLoadingCategories(false); }
    };
    fetchCategories();
  }, [filters.bookId, token]);

  // 3. Fetch Questions
  const fetchQuestions = useCallback(async () => {
    if (!token) return;
    if (viewMode === 'my_questions' && !userInfo?.sub) return;

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
      
      let response;
      if (viewMode === "public") {
        response = await getAllQuestions(params, token);
      } else {
        response = await getMyQuestions(userInfo.sub, params, token);
      }

      setQuestions(response?.data ?? []);
      setTotalQuestions(response?.total ?? 0);
    } catch (err) {
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
      return newFilters;
    });
    setPage(0);
  };

  const handleReset = () => {
      setFilters({ search: "", level: "", type: "", bookId: "", categoryId: "" });
      setPage(0);
  };

  const handleNavigateDetail = (id) => navigate(`/tutor/question/${id}`);

  return (
    <PageWrapper>
      <Header>
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