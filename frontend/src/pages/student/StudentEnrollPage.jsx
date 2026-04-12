import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel,
  Tooltip,
  useTheme,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";

import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import InfoIcon from "@mui/icons-material/Info";
import SchoolIcon from "@mui/icons-material/School";
import { AccessTimeFilled as AccessTimeFilledIcon } from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import ClassDetailDrawer from "../../components/ClassDetailDrawer";
import { getAllClasses, requestEnrollment } from "../../services/ClassService";

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : "#F9FAFB",
    backgroundImage: "none",
    borderRadius: "24px",
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark
      ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}`
      : "0 8px 48px rgba(0,0,0,0.03)",
    minHeight: "calc(100vh - 120px)",
    display: "flex",
    flexDirection: "column",
  };
});

const HeaderBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(4),
  flexShrink: 0,
}));

const FilterCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    borderRadius: "16px",
    backgroundColor: isDark
      ? alpha(theme.palette.background.default, 0.4)
      : alpha(theme.palette.primary.main, 0.02),
    border: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
    transition: "all 0.3s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: isDark
        ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`
        : "0px 12px 24px rgba(0,0,0,0.06)",
      borderColor: theme.palette.primary.main,
    },
  };
});

const StyledTableContainer = styled(TableContainer)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    flexGrow: 1,
    overflowY: "auto",
    "&::-webkit-scrollbar": { width: "6px", height: "6px" },
    "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: alpha(theme.palette.text.secondary, 0.2),
      borderRadius: "10px",
      "&:hover": { backgroundColor: alpha(theme.palette.text.secondary, 0.4) },
    },
    "& .MuiTableCell-head": {
      backgroundColor: isDark
        ? alpha(theme.palette.primary.main, 0.05)
        : alpha(theme.palette.primary.main, 0.03),
      backdropFilter: "blur(8px)",
      fontWeight: 700,
      color: theme.palette.text.secondary,
      borderBottom: `2px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
    },
    "& .MuiTableRow-root:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      cursor: "pointer",
    },
  };
});

function StudentEnrollPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [currentUserId, setCurrentUserId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterDate, setFilterDate] = useState(null);

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "info",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.sub || decoded.uid || decoded.userId);
      } catch (e) {
        console.error("Token invalid");
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const response = await getAllClasses({ limit: 200 }, token);
      const allList = Array.isArray(response) ? response : response?.data || [];
      const validClasses = allList.filter(
        (c) => c.status === "pending" || c.status === "ongoing",
      );
      setClasses(validClasses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getEnrollmentStatus = (row) => {
    if (!currentUserId || !row.learning) return null;
    const myRecord = row.learning.find(
      (l) =>
        l.student?.user?.uid === currentUserId ||
        l.student?.uid === currentUserId ||
        l.student_uid === currentUserId,
    );
    return myRecord ? myRecord.status : null;
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const s = search.toLowerCase();
      const matchSearch =
        cls.classname.toLowerCase().includes(s) ||
        cls.tutor?.user?.lname?.toLowerCase().includes(s);
      const matchGrade = filterGrade === "all" || cls.grade === filterGrade;

      let matchDate = true;
      if (filterDate && cls.startat) {
        matchDate =
          dayjs(cls.startat).isSame(dayjs(filterDate), "day") ||
          dayjs(cls.startat).isAfter(dayjs(filterDate), "day");
      }
      return matchSearch && matchGrade && matchDate;
    });
  }, [classes, search, filterGrade, filterDate]);

  const sortedRows = useMemo(() => {
    const comparator = (a, b) => {
      if (orderBy === "startat")
        return new Date(b.startat) - new Date(a.startat);
      if (b[orderBy] < a[orderBy]) return -1;
      if (b[orderBy] > a[orderBy]) return 1;
      return 0;
    };
    const sorted = filteredClasses.slice().sort(comparator);
    return order === "desc" ? sorted : sorted.reverse();
  }, [filteredClasses, order, orderBy]);

  const visibleRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
  const uniqueGrades = useMemo(
    () =>
      [...new Set(classes.map((c) => c.grade))]
        .filter(Boolean)
        .sort((a, b) => a - b),
    [classes],
  );

  const handleOpenConfirm = (cls) => {
    setDrawerOpen(false);
    setSelectedClass(cls);
    setConfirmDialogOpen(true);
  };

  const handleRowClick = (row) => {
    const status = getEnrollmentStatus(row);
    if (status === "accepted") {
      navigate(`/student/classes/${row.class_id}`);
    } else {
      setSelectedClass(row);
      setDrawerOpen(true);
    }
  };

  const handleSubmitEnroll = async () => {
    const token = localStorage.getItem("token");
    if (!token || !currentUserId) return;

    setIsSubmitting(true);
    try {
      await requestEnrollment(selectedClass.class_id, [currentUserId], token);
      setToast({
        open: true,
        msg: "Gửi yêu cầu thành công!",
        severity: "success",
      });
      setConfirmDialogOpen(false);
      fetchData();
    } catch (err) {
      setToast({
        open: true,
        msg: err.response?.data?.message || "Lỗi đăng ký.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActionButton = (row) => {
    const status = getEnrollmentStatus(row);
    if (status === "accepted") {
      return (
        <Tooltip title="Nhấn vào đây để vào lớp" arrow placement="top">
          <Chip
            icon={<CheckCircleIcon />}
            label="Đã tham gia"
            color="success"
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: "success.main",
              cursor: "pointer",
            }}
          />
        </Tooltip>
      );
    }
    if (status === "pending") {
      return (
        <Chip
          icon={<HourglassEmptyIcon />}
          label="Chờ duyệt"
          color="warning"
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            color: "warning.main",
          }}
        />
      );
    }
    return (
      <Button
        variant="contained"
        size="small"
        disableElevation
        startIcon={<AddCircleOutlineIcon />}
        onClick={(e) => {
          e.stopPropagation();
          handleOpenConfirm(row);
        }}
        sx={{ borderRadius: "12px", fontWeight: 700, px: 2, py: 0.5 }}
      >
        Đăng ký
      </Button>
    );
  };

  if (loading)
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );

  return (
    <PageWrapper>
      <HeaderBar>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">
            Tìm kiếm lớp học
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}
          >
            Khám phá các khóa học mới và đăng ký tham gia
          </Typography>
        </Box>
      </HeaderBar>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FilterCard elevation={0}>
          <TextField
            placeholder="Tìm lớp, giáo viên..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", md: 280 },
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          />
          <FormControl
            size="small"
            sx={{ minWidth: 120, bgcolor: "background.paper", borderRadius: 1 }}
          >
            <InputLabel>Khối</InputLabel>
            <Select
              value={filterGrade}
              label="Khối"
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <MenuItem value="all">
                <em>Tất cả</em>
              </MenuItem>
              {uniqueGrades.map((g) => (
                <MenuItem key={g} value={g}>
                  Khối {g}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DatePicker
            label="Khai giảng từ"
            value={filterDate}
            onChange={(v) => setFilterDate(v)}
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  width: 170,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                },
              },
            }}
          />
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={() => {
              setSearch("");
              setFilterGrade("all");
              setFilterDate(null);
              setPage(0);
            }}
            sx={{
              ml: { md: "auto" },
              borderRadius: "10px",
              fontWeight: 700,
              bgcolor: "background.paper",
            }}
          >
            Đặt lại
          </Button>
        </FilterCard>
      </LocalizationProvider>

      <Paper
        sx={{
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minHeight: 0,
          boxShadow: isDark ? "none" : "0px 4px 12px rgba(0,0,0,0.02)",
        }}
      >
        <StyledTableContainer>
          <Table stickyHeader sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableCell width="25%">
                  <TableSortLabel
                    active={orderBy === "classname"}
                    direction={order}
                    onClick={() => handleRequestSort("classname")}
                  >
                    Tên lớp học
                  </TableSortLabel>
                </TableCell>
                <TableCell width="20%">Giáo viên</TableCell>
                <TableCell width="15%">Thời lượng</TableCell>
                <TableCell width="10%">Khối</TableCell>
                <TableCell width="15%">
                  <TableSortLabel
                    active={orderBy === "startat"}
                    direction={order}
                    onClick={() => handleRequestSort("startat")}
                  >
                    Khai giảng
                  </TableSortLabel>
                </TableCell>
                <TableCell width="15%" align="center">
                  Trạng thái
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      py: 6,
                      color: "text.secondary",
                      borderBottom: "none",
                    }}
                  >
                    <Box
                      sx={{
                        border: "2px dashed",
                        borderColor: "divider",
                        borderRadius: 3,
                        p: 4,
                        display: "inline-block",
                      }}
                    >
                      <SchoolIcon
                        sx={{
                          fontSize: 48,
                          opacity: 0.2,
                          mb: 1,
                          color: "text.disabled",
                        }}
                      />
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        color="text.secondary"
                      >
                        Không tìm thấy lớp học nào.
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Hãy thử thay đổi bộ lọc tìm kiếm.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => (
                  <TableRow
                    key={row.class_id}
                    hover
                    onClick={() => handleRowClick(row)}
                  >
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {row.classname}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        mt={0.5}
                        alignItems="center"
                      >
                        <Chip
                          label={
                            row.status === "pending" ? "Tuyển sinh" : "Đang học"
                          }
                          size="small"
                          color={
                            row.status === "pending" ? "success" : "default"
                          }
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {row.nb_of_student} học viên
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          src={row.tutor?.user?.avata_url}
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                            fontWeight: 700,
                          }}
                        >
                          {row.tutor?.user?.lname?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                          >
                            {row.tutor?.user?.lname} {row.tutor?.user?.fname}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Gia sư
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccessTimeFilledIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          color="text.primary"
                        >
                          {row.duration_time} tuần
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`Khối ${row.grade}`}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          fontWeight: 600,
                          border: "none",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.primary">
                        {row.startat
                          ? dayjs(row.startat).format("DD/MM/YYYY")
                          : "---"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {renderActionButton(row)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
        <TablePagination
          sx={{
            flexShrink: 0,
            borderTop: "1px solid",
            borderColor: isDark ? theme.palette.midnight?.border : "divider",
          }}
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredClasses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số dòng:"
        />
      </Paper>

      <ClassDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        classData={selectedClass}
        onEnrollClick={() => handleOpenConfirm(selectedClass)}
        isEnrolled={
          selectedClass &&
          ["pending", "accepted"].includes(getEnrollmentStatus(selectedClass))
        }
      />

      <Dialog
        open={confirmDialogOpen}
        onClose={() => !isSubmitting && setConfirmDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, backgroundImage: "none" } }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
          <HelpOutlineIcon
            sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }}
          />
          <Typography variant="h6" fontWeight="bold">
            Xác nhận đăng ký
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography textAlign="center" color="text.secondary">
            Bạn có chắc chắn muốn tham gia lớp{" "}
            <Typography component="span" fontWeight="bold" color="primary.main">
              {selectedClass?.classname}
            </Typography>
            ?
          </Typography>
          <Box
            mt={2}
            p={1.5}
            bgcolor={alpha(theme.palette.info.main, 0.1)}
            borderRadius={2}
            display="flex"
            gap={1}
            alignItems="start"
          >
            <InfoIcon fontSize="small" color="info" sx={{ mt: 0.3 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="left"
            >
              Yêu cầu sẽ được gửi đến Gia sư. Bạn sẽ nhận được thông báo khi
              được duyệt.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "center", gap: 2 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            disabled={isSubmitting}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: "10px", fontWeight: 700 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitEnroll}
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting && <CircularProgress size={20} color="inherit" />
            }
            sx={{ borderRadius: "12px", px: 3, fontWeight: 700 }}
          >
            {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
}

export default memo(StudentEnrollPage);
