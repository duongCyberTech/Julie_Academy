import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
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
  TablePagination,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Stack,
  InputAdornment,
  TableSortLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils"; 
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { getAllQuestions, getMyQuestions } from "../../services/QuestionService";
import { getAllCategories, getPlansByTutor } from "../../services/CategoryService";

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

const HEAD_CELLS = [
  { id: "title", label: "Tiêu đề câu hỏi", minWidth: 300, sortable: true }, 
  { id: "type", label: "Loại", minWidth: 120, sortable: true },
  { id: "level", label: "Độ khó", minWidth: 100, sortable: true },
  { id: "category_id", label: "Chuyên đề", minWidth: 150, sortable: true }, 
  { id: "book", label: "Giáo án", minWidth: 150, sortable: false }, 
  { id: "actions", label: "Chi tiết", minWidth: 80, align: "center", sortable: false },
];

const DIFFICULTY_MAP = {
  EASY: { text: "Dễ", color: "success" },
  MEDIUM: { text: "Trung bình", color: "warning" },
  HARD: { text: "Khó", color: "error" },
};

const TYPE_MAP = {
  single_choice: "Trắc nghiệm (1)",
  multiple_choice: "Trắc nghiệm (N)",
  essay: "Tự luận",
  true_false: "Đúng/Sai",
};

const DifficultyChip = ({ difficulty }) => {
  const mapping = DIFFICULTY_MAP[String(difficulty || "").toUpperCase()] || { text: difficulty || "N/A", color: "default" };
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

const QuestionFilters = memo(({ filters, onFilterChange, onReset, books, categories, loadingBooks, loadingCategories }) => {
  const categoryTreeData = useMemo(() => {
    let flattenedCategories = [];
    if (Array.isArray(categories)) {
      categories.forEach(item => {
        if (Array.isArray(item)) {
          flattenedCategories = flattenedCategories.concat(item);
        } else if (item && (item.id || item.category_id)) {
          flattenedCategories.push(item);
        }
      });
    }
    
    if (flattenedCategories.length === 0) return [];
    
    const parentMap = new Map();
    flattenedCategories.forEach(item => {
      const parentId = item.parent_id ?? item.parentId ?? item.parent_category_id;
      const description = item.description;
      if (parentId && !parentMap.has(parentId)) {
        parentMap.set(parentId, description || 'Chưa có mô tả');
      }
    });
    
    const parentNodes = Array.from(parentMap.entries()).map(([parentId, description]) => ({
      id: parentId,
      category_id: parentId,
      category_name: description,
      parent_id: null,
      isParent: true,
    }));
    
    const allNodes = [...parentNodes, ...flattenedCategories];
    
    const buildTree = (items, parentId = null) => {
      const filtered = items.filter(item => {
        const itemParentId = item.parent_id ?? item.parentId ?? item.parent_category_id;
        if (parentId === null) {
          return itemParentId === null || itemParentId === undefined;
        }
        return String(itemParentId) === String(parentId);
      });
      
      return filtered.map(item => {
        const id = item.id ?? item.category_id;
        const name = item.name ?? item.category_name ?? "Không có tên";
        
        return {
          id: String(id),
          label: name,
          children: buildTree(items, id),
        };
      });
    };
    
    return buildTree(allNodes);
  }, [categories]);

  const handleTreeSelection = (event, selectedItems) => {
    let selectedId = "";
    if (Array.isArray(selectedItems)) {
        selectedId = selectedItems.length > 0 ? selectedItems[0] : "";
    } else {
        selectedId = selectedItems ?? "";
    }
    onFilterChange({ target: { name: "categoryId", value: selectedId } });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Stack direction="column" spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <TextField
            label="Tìm kiếm tiêu đề..."
            variant="outlined"
            name="search"
            value={filters.search}
            onChange={onFilterChange}
            size="small"
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{ 
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ) 
            }}
          />
          <Tooltip title="Đặt lại bộ lọc">
            <Button variant="outlined" color="inherit" onClick={onReset} startIcon={<RestartAltIcon />}>
              Xóa lọc
            </Button>
          </Tooltip>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }} disabled={loadingBooks}>
            <InputLabel>Giáo án</InputLabel>
            <Select name="bookId" value={filters.bookId} label="Giáo án" onChange={onFilterChange}>
              <MenuItem value="">
                <em>Tất cả giáo án</em>
              </MenuItem>
              {Array.isArray(books) &&
                books.map((b) => (
                  <MenuItem key={b.plan_id ?? b.id ?? b.planId} value={b.plan_id ?? b.id ?? b.planId}>
                    {`${b.title} ${b.grade ? `(K${b.grade})` : ""}`}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Độ khó</InputLabel>
            <Select name="level" value={filters.level} label="Độ khó" onChange={onFilterChange}>
              <MenuItem value="">
                <em>Tất cả</em>
              </MenuItem>
              <MenuItem value="EASY">Dễ</MenuItem>
              <MenuItem value="MEDIUM">Trung bình</MenuItem>
              <MenuItem value="HARD">Khó</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Loại câu hỏi</InputLabel>
            <Select name="type" value={filters.type} label="Loại câu hỏi" onChange={onFilterChange}>
              <MenuItem value="">
                <em>Tất cả</em>
              </MenuItem>
              <MenuItem value="single_choice">Trắc nghiệm (1)</MenuItem>
              <MenuItem value="multiple_choice">Trắc nghiệm (N)</MenuItem>
              <MenuItem value="essay">Tự luận</MenuItem>
              <MenuItem value="true_false">Đúng/Sai</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Collapse in={!!filters.bookId}>
          <Box mt={1} p={2} border="1px solid" borderColor="divider" borderRadius={1} bgcolor="background.paper">
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: "flex", alignItems: "center" }}>
              <FilterListIcon fontSize="small" sx={{ mr: 1 }} /> Chọn Chuyên đề:
            </Typography>

            {loadingCategories ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={20} />
              </Box>
            ) : categoryTreeData.length > 0 ? (
              <Box sx={{ maxHeight: 300, overflowY: "auto", mt: 1 }}>
                <RichTreeView
                  items={categoryTreeData}
                  slots={{ 
                    collapseIcon: ExpandMoreIcon, 
                    expandIcon: ChevronRightIcon 
                  }}
                  onSelectedItemsChange={handleTreeSelection}
                  selectedItems={filters.categoryId ? [String(filters.categoryId)] : []}
                  sx={{
                    '& .MuiTreeItem-content': {
                      py: 0.5,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    },
                  }}
                />
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Giáo án này chưa có mục lục chuyên đề.
              </Typography>
            )}
          </Box>
        </Collapse>
      </Stack>
    </Paper>
  );
});

export default function QuestionPage() {
  const navigate = useNavigate();
  const [token] = useState(() => localStorage.getItem("token"));

  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState("my_questions");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [order, setOrder] = useState('desc'); 
  const [orderBy, setOrderBy] = useState('created_at'); 

  const [filters, setFilters] = useState({
    search: "",
    level: "",
    type: "",
    bookId: "",
    categoryId: "",
  });
  const debouncedSearch = useDebounce(filters.search, 500);

  const userInfo = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!token || !userInfo?.sub) return;
      setLoadingBooks(true);
      try {
        const res = await getPlansByTutor(userInfo.sub, token);
        const booksData = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setBooks(booksData);
      } catch (err) {
        setBooks([]);
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchBooks();
  }, [token, userInfo]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!filters.bookId || !token) {
        setCategories([]);
        return;
      }
      setLoadingCategories(true);
      try {
        const catData = await getAllCategories({ plan_id: filters.bookId, mode: "tree" }, token);
        let nodes = [];
        if (Array.isArray(catData)) {
          nodes = catData;
        } else if (catData?.data) {
          nodes = Array.isArray(catData.data) ? catData.data : [catData.data];
        } else if (catData?.categories) {
          nodes = Array.isArray(catData.categories) ? catData.categories : [catData.categories];
        }
        setCategories(nodes);
      } catch (err) {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [filters.bookId, token]);

  const fetchQuestions = useCallback(async () => {
    if (!token) return;
    if (viewMode === "my_questions" && !userInfo?.sub) return;

    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        level: filters.level || undefined,
        type: filters.type || undefined,
        category_id: filters.categoryId || undefined,
        plan_id: filters.bookId || undefined,
        search: debouncedSearch || undefined,
        sortBy: orderBy, 
        sortDirection: order, 
      };

      let response;
      if (viewMode === "public") {
        response = await getAllQuestions(params, token);
      } else {
        response = await getMyQuestions(userInfo.sub, params, token);
      }
      setQuestions(response?.data ?? response ?? []);
      setTotalQuestions(response?.total ?? 0);
    } catch (err) {
      setError("Không thể tải danh sách câu hỏi.");
      setQuestions([]);
      setTotalQuestions(0);
    } finally {
      setLoading(false);
    }
  }, [token, viewMode, debouncedSearch, filters, page, rowsPerPage, userInfo, order, orderBy]);  
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target ?? {};
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (name === "bookId") {
        newFilters.categoryId = "";
      }
      return newFilters;
    });
    setPage(0);
  };

  const handleReset = () => {
    setFilters({ 
      search: "", 
      level: "", 
      type: "", 
      bookId: "", 
      categoryId: "", 
    });
    setPage(0);
    setOrderBy('created_at');
    setOrder('desc');
  };
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); 
  };

  return (
    <PageWrapper>
      <Header>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Thư viện câu hỏi
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            color="primary"
            value={viewMode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode) {
                setViewMode(newMode);
                setPage(0);
              }
            }}
            size="small"
          >
            <ToggleButton value="my_questions">Của tôi</ToggleButton>
            <ToggleButton value="public">Công khai</ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            onClick={() => navigate("/tutor/new")}
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
        loadingBooks={loadingBooks}
        loadingCategories={loadingCategories}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {HEAD_CELLS.map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      align={cell.align || "left"} 
                      sx={{ 
                        fontWeight: "bold", 
                        bgcolor: "grey.50", 
                        minWidth: cell.minWidth 
                      }}
                      sortDirection={orderBy === cell.id ? order : false}
                    >
                      {/* Logic hiển thị Sort Label */}
                      {cell.sortable ? (
                        <TableSortLabel
                          active={orderBy === cell.id}
                          direction={orderBy === cell.id ? order : 'asc'}
                          onClick={() => handleRequestSort(cell.id)}
                        >
                          {cell.label}
                          {orderBy === cell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      ) : (
                        cell.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {Array.isArray(questions) && questions.length > 0 ? (
                  questions.map((q) => (
                    <TableRow key={q.ques_id ?? q.id ?? Math.random()} hover>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{
                            maxWidth: 400,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {q.title || "(Không có tiêu đề)"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2">{TYPE_MAP[q.type] || q.type}</Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <DifficultyChip difficulty={q.level} />
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography 
                          variant="body2" 
                          noWrap 
                          sx={{ maxWidth: 150 }} 
                          title={q.category?.category_name ?? q.category?.name}
                        >
                          {q.category?.category_name ?? q.category?.name ?? "---"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography 
                          variant="body2" 
                          noWrap 
                          sx={{ maxWidth: 150 }} 
                          title={q.category?.structure?.[0]?.Plan?.title ?? q.category?.Categories?.structure?.[0]?.Plan?.title}
                        >
                          {q.category?.structure?.[0]?.Plan?.title || q.category?.Categories?.structure?.[0]?.Plan?.title || "---"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ py: 1 }}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton 
                            color="primary" 
                            size="small" 
                            onClick={() => navigate(`/tutor/question/${q.ques_id}`)}
                          >
                            <SearchIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      Không tìm thấy câu hỏi nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={Number(totalQuestions ?? 0)}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
          />
        </Paper>
      )}
    </PageWrapper>
  );
}