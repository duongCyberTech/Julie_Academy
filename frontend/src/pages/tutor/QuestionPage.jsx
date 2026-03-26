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
  useTheme
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import {
  getAllQuestions,
  getMyQuestions,
} from "../../services/QuestionService";
import {
  getAllCategories,
  getPlansByTutor,
} from "../../services/CategoryService";

// ==========================================
// 1. PAGE WRAPPER CHUẨN DESIGN SYSTEM
// ==========================================
const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5), 
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark 
      ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` 
      : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)', 
    display: 'flex',
    flexDirection: 'column',
  };
});

// ==========================================
// 2. HEADER CHUẨN DESIGN SYSTEM
// ==========================================
const HeaderBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(4), 
  flexShrink: 0,
}));

// ==========================================
// 3. CARD NỘI DUNG CHUẨN (HOVER EFFECT)
// ==========================================
const FilterCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: '16px',
    flexShrink: 0,
    backgroundColor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.primary.main, 0.02),
    border: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isDark
          ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`
          : '0px 12px 24px rgba(0,0,0,0.06)',
      border: `1px solid ${theme.palette.primary.main}`,
    }
  };
});

const HEAD_CELLS = [
  { id: "title", label: "Tiêu đề câu hỏi", minWidth: 300, sortable: true },
  { id: "type", label: "Loại", minWidth: 120, sortable: true },
  { id: "level", label: "Độ khó", minWidth: 100, sortable: true },
  { id: "category_id", label: "Chuyên đề", minWidth: 150, sortable: true },
  { id: "book", label: "Giáo án", minWidth: 150, sortable: false },
  {
    id: "actions",
    label: "Chi tiết",
    minWidth: 80,
    align: "center",
    sortable: false,
  },
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const mapping = DIFFICULTY_MAP[String(difficulty || "").toUpperCase()] || {
    text: difficulty || "N/A",
    color: "default",
  };

  if (mapping.color === "default") {
    return <Chip label={mapping.text} size="small" sx={{ fontWeight: 600, bgcolor: 'action.hover', color: 'text.secondary' }} />;
  }

  return (
    <Chip
      label={mapping.text}
      size="small"
      sx={{
        fontWeight: 700,
        border: '1.5px solid',
        borderColor: `${mapping.color}.main`,
        bgcolor: alpha(theme.palette[mapping.color].main, 0.08),
        color: isDark ? `${mapping.color}.light` : `${mapping.color}.dark`
      }}
    />
  );
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const QuestionFilters = memo(
  ({
    filters,
    onFilterChange,
    onReset,
    books,
    categories,
    loadingBooks,
    loadingCategories,
  }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const categoryTreeData = useMemo(() => {
      if (!categories || categories.length === 0) return [];

      const getItemId = (itm) =>
        String(itm.id ?? itm.category_id ?? itm._id ?? "");
      const getParentId = (itm) => {
        const pid = itm.parent_id ?? itm.parentId ?? itm.parent_category_id;
        if (!pid || pid === 0 || String(pid) === "0" || String(pid) === "null")
          return null;
        return String(pid);
      };

      const parentMap = new Map();
      const allItemIds = new Set(categories.map(getItemId));

      categories.forEach((item) => {
        const pid = getParentId(item);
        if (pid && !allItemIds.has(pid)) {
          if (!parentMap.has(pid)) {
            parentMap.set(pid, {
              id: pid,
              category_id: pid,
              category_name: item.description || "Danh mục gốc",
              parent_id: null,
              isFake: true,
            });
          }
        }
      });

      const allNodes = [...Array.from(parentMap.values()), ...categories];

      const buildTree = (items, targetParentId = null) => {
        return items
          .filter((item) => {
            const itemPid = getParentId(item);
            return itemPid === targetParentId;
          })
          .map((item) => {
            const itemId = getItemId(item);
            return {
              id: itemId,
              label: String(item.name ?? item.category_name ?? "No Name"),
              children: buildTree(items, itemId),
            };
          });
      };

      return buildTree(allNodes, null);
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
      <FilterCard elevation={0}>
        <Stack direction="column" spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems="center"
          >
            <TextField
              label="Tìm kiếm tiêu đề..."
              variant="outlined"
              name="search"
              value={filters.search}
              onChange={onFilterChange}
              size="small"
              sx={{ flexGrow: 1, minWidth: 200, bgcolor: 'background.paper', borderRadius: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Đặt lại bộ lọc">
              <Button
                variant="outlined"
                color="inherit"
                onClick={onReset}
                startIcon={<RestartAltIcon />}
                sx={{ 
                  bgcolor: 'background.paper', 
                  borderRadius: '10px', // Chuẩn Design System cho button nhỏ/vừa
                  fontWeight: 700, 
                  py: 1, 
                  px: 3,
                  color: 'text.secondary' 
                }}
              >
                Xóa lọc
              </Button>
            </Tooltip>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems="center"
          >
            <FormControl
              size="small"
              sx={{ minWidth: 200, bgcolor: 'background.paper', borderRadius: 1, flexGrow: 1 }}
              disabled={loadingBooks}
            >
              <InputLabel>Giáo án</InputLabel>
              <Select
                name="bookId"
                value={filters.bookId}
                label="Giáo án"
                onChange={onFilterChange}
              >
                <MenuItem value="">
                  <em>Tất cả giáo án</em>
                </MenuItem>
                {Array.isArray(books) &&
                  books.map((b) => (
                    <MenuItem
                      key={b.plan_id ?? b.id ?? b.planId}
                      value={b.plan_id ?? b.id ?? b.planId}
                    >
                      {`${b.title} ${b.grade ? `(K${b.grade})` : ""}`}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper', borderRadius: 1 }}>
              <InputLabel>Độ khó</InputLabel>
              <Select
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

            <FormControl size="small" sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: 1 }}>
              <InputLabel>Loại câu hỏi</InputLabel>
              <Select
                name="type"
                value={filters.type}
                label="Loại câu hỏi"
                onChange={onFilterChange}
              >
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
            <Box
              mt={1}
              p={3}
              border="1px solid"
              borderColor={isDark ? theme.palette.midnight?.border : "divider"}
              borderRadius="16px"
              bgcolor="background.paper"
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="text.secondary"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <FilterListIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} /> Chọn Chuyên đề:
              </Typography>

              {loadingCategories ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : categoryTreeData.length > 0 ? (
                <Box sx={{ maxHeight: 250, overflowY: "auto", mt: 1 }}>
                  <RichTreeView
                    items={categoryTreeData}
                    slots={{
                      collapseIcon: ExpandMoreIcon,
                      expandIcon: ChevronRightIcon,
                    }}
                    onSelectedItemsChange={handleTreeSelection}
                    selectedItems={
                      filters.categoryId ? [String(filters.categoryId)] : []
                    }
                    sx={{
                      "& .MuiTreeItem-content": {
                        py: 0.5,
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                        "&.Mui-selected": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.15),
                          color: "primary.main",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                          },
                        },
                      },
                    }}
                  />
                </Box>
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1, fontWeight: 500 }}
                >
                  Giáo án này chưa có mục lục chuyên đề.
                </Typography>
              )}
            </Box>
          </Collapse>
        </Stack>
      </FilterCard>
    );
  }
);

export default function QuestionPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
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

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("created_at");

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
        const booksData = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];
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
        const catData = await getAllCategories(
          { plan_id: filters.bookId, mode: "tree" },
          token
        );
        let nodes = [];
        if (Array.isArray(catData)) {
          nodes = catData;
        } else if (catData?.data) {
          nodes = Array.isArray(catData.data) ? catData.data : [catData.data];
        } else if (catData?.categories) {
          nodes = Array.isArray(catData.categories)
            ? catData.categories
            : [catData.categories];
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
  }, [
    token,
    viewMode,
    debouncedSearch,
    filters,
    page,
    rowsPerPage,
    userInfo,
    order,
    orderBy,
  ]);
  
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
    setOrderBy("created_at");
    setOrder("desc");
  };
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
  };

  return (
    <PageWrapper>
      {/* Header trang chuẩn Design System */}
      <HeaderBar direction={{ xs: 'column', sm: 'row' }}>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">
            Thư viện câu hỏi
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
            Quản lý và tra cứu kho câu hỏi
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: { xs: 2, sm: 0 } }}>
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
            sx={{ bgcolor: 'background.paper', borderRadius: '10px' }}
          >
            <ToggleButton value="my_questions" sx={{ fontWeight: 600, px: 2 }}>Của tôi</ToggleButton>
            <ToggleButton value="public" sx={{ fontWeight: 600, px: 2 }}>Công khai</ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/tutor/new")}
            startIcon={<AddCircleOutlineIcon />}
            sx={{ fontWeight: 700, borderRadius: "12px", px: 3, py: 1 }}
          >
            Tạo mới
          </Button>
        </Stack>
      </HeaderBar>

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
        <Box display="flex" flexGrow={1} justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ flexShrink: 0, borderRadius: '12px' }}>{error}</Alert>
      ) : (
        <Paper 
          variant="outlined" 
          sx={{ 
            borderRadius: '16px', // Chuẩn bo góc cho bảng
            overflow: "hidden", 
            display: 'flex', 
            flexDirection: 'column', 
            flexGrow: 1, 
            minHeight: 0, 
            borderColor: isDark ? theme.palette.midnight?.border : 'divider',
            transition: 'all 0.3s',
            // Thêm nhẹ hover effect cho bảng nếu muốn đồng bộ cảm giác tương tác
            '&:hover': {
              boxShadow: isDark 
                ? `0 0 16px ${alpha(theme.palette.primary.main, 0.05)}` 
                : '0px 8px 16px rgba(0,0,0,0.03)',
            }
          }}
        >
          <TableContainer 
            sx={{ 
              flexGrow: 1, 
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: "6px", height: "6px" },
              "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: alpha(theme.palette.text.secondary, 0.2),
                borderRadius: "10px",
                "&:hover": { backgroundColor: alpha(theme.palette.text.secondary, 0.4) },
              }
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {HEAD_CELLS.map((cell) => (
                    <TableCell
                      key={cell.id}
                      align={cell.align || "left"}
                      sx={{
                        fontWeight: 700,
                        color: 'text.secondary',
                        bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.03),
                        backdropFilter: 'blur(8px)',
                        minWidth: cell.minWidth,
                      }}
                      sortDirection={orderBy === cell.id ? order : false}
                    >
                      {cell.sortable ? (
                        <TableSortLabel
                          active={orderBy === cell.id}
                          direction={orderBy === cell.id ? order : "asc"}
                          onClick={() => handleRequestSort(cell.id)}
                        >
                          {cell.label}
                          {orderBy === cell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === "desc"
                                ? "sorted descending"
                                : "sorted ascending"}
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
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color="text.primary"
                          sx={{
                            maxWidth: 400,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            lineHeight: 1.5
                          }}
                        >
                          {q.title || "(Không có tiêu đề)"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Chip 
                          label={TYPE_MAP[q.type] || q.type} 
                          size="small" 
                          sx={{ 
                            borderRadius: 1.5, fontWeight: 600,
                            bgcolor: alpha(theme.palette.primary.main, 0.08), 
                            color: isDark ? 'primary.light' : 'primary.dark',
                            border: '1px dashed', borderColor: 'primary.main'
                          }} 
                        />
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <DifficultyChip difficulty={q.level} />
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: 150 }}
                          title={q.category?.category_name ?? q.category?.name}
                        >
                          {q.category?.category_name ??
                            q.category?.name ??
                            "---"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: 150 }}
                          title={
                            q.category?.structure?.[0]?.Plan?.title ??
                            q.category?.Categories?.structure?.[0]?.Plan?.title
                          }
                        >
                          {q.category?.structure?.[0]?.Plan?.title ||
                            q.category?.Categories?.structure?.[0]?.Plan
                              ?.title ||
                            "---"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ py: 1 }}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/tutor/question/${q.ques_id}`)
                            }
                            sx={{ 
                              color: 'primary.main',
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                            }}
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 6, color: "text.secondary" }}
                    >
                      <Typography variant="body1">Không tìm thấy câu hỏi nào.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: isDark ? theme.palette.midnight?.border : 'divider' }}
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
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trong ${count}`
            }
          />
        </Paper>
      )}
    </PageWrapper>
  );
}