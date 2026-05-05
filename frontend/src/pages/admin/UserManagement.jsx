import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  Chip, TextField, InputAdornment, Grid, Select, MenuItem,
  InputLabel, FormControl, TablePagination, TableSortLabel,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, useTheme
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Search as SearchIcon, Add as AddIcon, MoreVert as MoreVertIcon
} from "@mui/icons-material";
import {
  getAllUsers, createUser, updateUser, updateUserStatus
} from "../../services/UserService";
import ActionMenu from "../../components/ActionMenu";
import AppSnackbar from "../../components/SnackBar";

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
    }
  };
});

const HeaderBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(4),
  flexShrink: 0,
}));

const StyledCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    borderRadius: '16px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    backgroundColor: theme.palette.background.paper,
    backgroundImage: 'none',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    transition: 'all 0.3s ease',
    boxShadow: isDark ? 'none' : '0px 2px 8px rgba(0,0,0,0.02)',
    '&:hover': {
      transform: 'translateY(-2px)',
      borderColor: theme.palette.primary.main,
      boxShadow: isDark
        ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`
        : '0px 12px 24px rgba(0,0,0,0.06)',
    }
  };
});

const descendingComparator = (a, b, orderBy) => {
  const valA = a[orderBy] ?? "";
  const valB = b[orderBy] ?? "";
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const headCells = [
  { id: "fname", label: "Họ tên", minWidth: 170 },
  { id: "email", label: "Email", minWidth: 150 },
  { id: "role", label: "Vai trò", minWidth: 100 },
  { id: "status", label: "Trạng thái", minWidth: 100 },
  { id: "actions", label: "Hành động", disableSorting: true, align: "right" },
];

const RoleChip = memo(({ role }) => {
  const config = {
    tutor: { color: "info", label: "Gia sư" },
    parents: { color: "warning", label: "Phụ huynh" },
    student: { color: "secondary", label: "Học sinh" },
    admin: { color: "error", label: "Quản trị viên" }
  }[role] || { color: "default", label: role };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ textTransform: "capitalize", fontWeight: 600, borderRadius: '8px' }}
    />
  );
});

const StatusChip = memo(({ status }) => {
  const config = {
    active: { color: "success", label: "Đang hoạt động" },
    inactive: { color: "error", label: "Ngừng hoạt động" },
    pending: { color: "warning", label: "Chờ duyệt" }
  }[status] || { color: "default", label: status };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ textTransform: "capitalize", fontWeight: 600, borderRadius: '8px' }}
    />
  );
});

const UserFormModal = memo(({ open, onClose, onSubmit, userToEdit }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [formData, setFormData] = useState({
    username: "", email: "", password: "", role: "student",
    status: "active", fname: "", lname: "", mname: "",
    school: "", dob: "", phone_number: "", experiences: "",
  });

  const isEditing = useMemo(() => Boolean(userToEdit?.uid), [userToEdit]);

  useEffect(() => {
    const resetForm = () => setFormData({
      username: "", email: "", password: "", role: "student", status: "active",
      fname: "", mname: "", lname: "", school: "", dob: "", phone_number: "", experiences: "",
    });

    if (userToEdit) {
      setFormData({
        username: userToEdit.username || "",
        email: userToEdit.email || "",
        role: userToEdit.role || "student",
        status: userToEdit.status || "active",
        fname: userToEdit.fname || "",
        mname: userToEdit.mname || "",
        lname: userToEdit.lname || "",
        password: "",
        school: userToEdit.student?.school || "",
        dob: userToEdit.student?.dob ? new Date(userToEdit.student.dob).toISOString().split("T")[0] : "",
        phone_number: userToEdit.tutor?.phone_number || userToEdit.parents?.phone_number || "",
        experiences: userToEdit.tutor?.experiences || "",
      });
    } else {
      resetForm();
    }
  }, [userToEdit, open]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const dataToSend = { ...formData };
    if (isEditing && !dataToSend.password) delete dataToSend.password;
    onSubmit(dataToSend, userToEdit?.uid);
  }, [formData, isEditing, onSubmit, userToEdit]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', backgroundImage: 'none', border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.1)}` } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? "Cập nhật người dùng" : "Tạo người dùng mới"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="fname" label="Họ" value={formData.fname} onChange={handleChange} fullWidth size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="mname" label="Tên đệm" value={formData.mname} onChange={handleChange} fullWidth size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="lname" label="Tên" value={formData.lname} onChange={handleChange} fullWidth required size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField name="username" label="Tên đăng nhập" value={formData.username} onChange={handleChange} fullWidth required size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} fullWidth required size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField name="password" label="Mật khẩu" type="password" value={formData.password} onChange={handleChange} fullWidth placeholder={isEditing ? "Bỏ trống nếu không đổi" : ""} required={!isEditing} size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }}>
                <InputLabel>Vai trò</InputLabel>
                <Select name="role" value={formData.role} label="Vai trò" onChange={handleChange}>
                  <MenuItem value="student">Học sinh</MenuItem>
                  <MenuItem value="tutor">Gia sư</MenuItem>
                  <MenuItem value="parents">Phụ huynh</MenuItem>
                  <MenuItem value="admin">Quản trị viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select name="status" value={formData.status} label="Trạng thái" onChange={handleChange}>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.role === "student" && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField name="school" label="Trường học" value={formData.school} onChange={handleChange} fullWidth size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField name="dob" label="Ngày sinh" type="date" value={formData.dob} onChange={handleChange} fullWidth size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }} InputLabelProps={{ shrink: true }} />
                </Grid>
              </>
            )}
            {formData.role === "tutor" && (
              <>
                <Grid size={{ xs: 12 }}>
                  <TextField name="phone_number" label="Số điện thoại" value={formData.phone_number} onChange={handleChange} fullWidth size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField name="experiences" label="Kinh nghiệm" value={formData.experiences} onChange={handleChange} fullWidth multiline rows={3} size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }} />
                </Grid>
              </>
            )}
            {formData.role === "parents" && (
              <Grid size={{ xs: 12 }}>
                <TextField name="phone_number" label="Số điện thoại" value={formData.phone_number} onChange={handleChange} fullWidth size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }} />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700, borderRadius: '10px' }}>Hủy</Button>
          <Button type="submit" variant="contained" sx={{ fontWeight: 700, borderRadius: '10px', boxShadow: 'none' }}>
            {isEditing ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

const UserManagement = memo(() => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("fname");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const handleCloseToast = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const getToken = useCallback(() => localStorage.getItem("token"), []);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError("Chưa đăng nhập.");
      setLoading(false);
      return;
    }

    try {
      const params = { page: 1, limit: 1000, role: "all", status: "all", filter: "" };
      const response = await getAllUsers(params, token);
      if (response && Array.isArray(response.data)) {
        setAllUsers(response.data);
      } else if (Array.isArray(response)) {
        setAllUsers(response);
      } else {
        throw new Error("Dữ liệu API không hợp lệ");
      }
    } catch (err) {
      setAllUsers([]);
      setError(`Lỗi tải danh sách: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchAllUsers(); }, [fetchAllUsers]);

  useEffect(() => {
    let result = [...allUsers];
    if (roleFilter) result = result.filter((user) => user.role === roleFilter);
    if (statusFilter) result = result.filter((user) => user.status === statusFilter);
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(
        (user) =>
          (user.fname?.toLowerCase() || "").includes(lowerSearch) ||
          (user.mname?.toLowerCase() || "").includes(lowerSearch) ||
          (user.lname?.toLowerCase() || "").includes(lowerSearch) ||
          (user.username?.toLowerCase() || "").includes(lowerSearch) ||
          (user.email?.toLowerCase() || "").includes(lowerSearch)
      );
    }
    result = stableSort(result, getComparator(order, orderBy));
    setFilteredUsers(result);
    setPage(0);
  }, [allUsers, roleFilter, statusFilter, debouncedSearch, order, orderBy]);

  const handleRequestSort = useCallback((property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  }, [order, orderBy]);

  const handleFilterChange = useCallback((event) => {
    const { name, value } = event.target;
    if (name === "role-filter") setRoleFilter(value);
    if (name === "status-filter") setStatusFilter(value);
  }, []);

  const handleSearchChange = useCallback((event) => setSearchTerm(event.target.value), []);
  const handleChangePage = useCallback((event, newPage) => setPage(newPage), []);
  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleOpenMenu = useCallback((event, user) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedUser(user);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuAnchorEl(null);
    setSelectedUser(null);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingUser(null);
    setIsModalOpen(true);
  }, []);

  const handleEditAction = useCallback(() => {
    setEditingUser(selectedUser);
    setIsModalOpen(true);
    handleCloseMenu();
  }, [selectedUser, handleCloseMenu]);

  const handleToggleStatusAction = useCallback(async () => {
    if (!selectedUser) return;
    const token = getToken();
    if (!token) {
      setToast({ open: true, message: "Phiên đăng nhập hết hạn.", severity: "error" });
      return;
    }
    const newStatus = selectedUser.status === "active" ? "inactive" : "active";
    setError(null);
    handleCloseMenu();

    try {
      await updateUserStatus(selectedUser.uid, newStatus, token);
      setAllUsers((prev) => prev.map((u) => u.uid === selectedUser.uid ? { ...u, status: newStatus } : u));
      setToast({ open: true, message: `Cập nhật trạng thái thành công!`, severity: "success" });
    } catch (err) {
      const errorMessage = `Lỗi cập nhật trạng thái: ${err.response?.data?.message || err.message}`;
      setToast({ open: true, message: errorMessage, severity: "error" });
      setError(errorMessage);
    }
  }, [selectedUser, getToken, handleCloseMenu]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
  }, []);

  const handleSubmitForm = useCallback(async (formData, userId) => {
    const token = getToken();
    if (!token) {
      setToast({ open: true, message: "Phiên đăng nhập hết hạn.", severity: "error" });
      return;
    }
    setError(null);
    try {
      let message = "";
      if (userId) {
        await updateUser(userId, formData, token);
        message = "Cập nhật người dùng thành công!";
      } else {
        await createUser(formData, token);
        message = "Tạo mới người dùng thành công!";
      }
      setToast({ open: true, message: message, severity: "success" });
      handleCloseModal();
      fetchAllUsers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || (userId ? "Lỗi cập nhật." : "Lỗi tạo mới.");
      setToast({ open: true, message: errorMessage, severity: "error" });
      setError(errorMessage);
    }
  }, [getToken, fetchAllUsers, handleCloseModal]);

  const visibleRows = useMemo(() => 
    filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredUsers, page, rowsPerPage]
  );

  return (
    <PageWrapper>
      <HeaderBar sx={{ flexDirection: { xs: "column", sm: "row" } }}>
        <Box mb={{ xs: 2, sm: 0 }}>
          <Typography variant="h4" fontWeight="700" color="text.primary">
            Quản lý người dùng
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
            Quản lý danh sách, phân quyền và trạng thái hoạt động của người dùng
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          disableElevation
          sx={{ flexShrink: 0, borderRadius: '12px', fontWeight: 700, px: 3, py: 1.5 }}
        >
          Thêm người dùng
        </Button>
      </HeaderBar>

      <StyledCard elevation={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth variant="outlined" size="small" placeholder="Tìm kiếm theo tên, username, email..."
              value={searchTerm} onChange={handleSearchChange} inputProps={{ maxLength: 50 }} 
              sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                sx: { height: "44px", "& .MuiInputBase-input": { textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", maxWidth: "calc(100% - 40px)" } }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }}>
              <InputLabel id="role-filter-label">Vai trò</InputLabel>
              <Select
                labelId="role-filter-label" name="role-filter" value={roleFilter} label="Vai trò" onChange={handleFilterChange}
                sx={{ height: "44px", "& .MuiSelect-select": { textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", minWidth: "80px" } }}
              >
                <MenuItem value="">Tất cả vai trò</MenuItem>
                <MenuItem value="student">Học sinh</MenuItem>
                <MenuItem value="tutor">Gia sư</MenuItem>
                <MenuItem value="parents">Phụ huynh</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small" sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'background.paper', borderRadius: 1 }}>
              <InputLabel id="status-filter-label">Trạng thái</InputLabel>
              <Select
                labelId="status-filter-label" name="status-filter" value={statusFilter} label="Trạng thái" onChange={handleFilterChange}
                sx={{ height: "44px", "& .MuiSelect-select": { textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", minWidth: "80px" } }}
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </StyledCard>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: '16px', 
          border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`, 
          overflow: "hidden",
          transition: 'all 0.3s ease',
          bgcolor: 'transparent',
          '&:hover': {
             boxShadow: isDark 
               ? `0 0 16px ${alpha(theme.palette.primary.main, 0.05)}` 
               : '0px 8px 16px rgba(0,0,0,0.03)',
          }
        }}
      >
        <TableContainer>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sortDirection={orderBy === headCell.id ? order : false}
                    align={headCell.align || "left"}
                    sx={{
                      fontWeight: 700,
                      bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.primary.main, 0.03),
                      color: 'text.secondary',
                      minWidth: headCell.minWidth || 120,
                      whiteSpace: "nowrap",
                      py: 1.5
                    }}
                  >
                    {headCell.disableSorting ? (
                      headCell.label
                    ) : (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
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
              {loading && (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}
              {!loading && visibleRows.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    <Typography variant="body1" fontWeight={600}>Không có người dùng nào khớp.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                visibleRows.map((user) =>
                  user && user.uid ? (
                    <TableRow key={user.uid} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {`${user.fname || ""} ${user.mname || ""} ${user.lname || ""}`.replace(/\s+/g, " ").trim() || user.username}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}><RoleChip role={user.role} /></TableCell>
                      <TableCell sx={{ py: 2 }}><StatusChip status={user.status} /></TableCell>
                      <TableCell align="right" sx={{ py: 2 }}>
                        <Tooltip title="Tùy chọn">
                          <IconButton size="small" onClick={(e) => handleOpenMenu(e, user)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ) : null
                )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          sx={{ borderTop: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}` }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>

      <ActionMenu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        selectedItem={selectedUser}
        onEdit={handleEditAction}
        onToggleStatus={handleToggleStatusAction}
      />

      {isModalOpen && (
        <UserFormModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitForm}
          userToEdit={editingUser}
        />
      )}

      <AppSnackbar open={toast.open} message={toast.message} severity={toast.severity} onClose={handleCloseToast} />
    </PageWrapper>
  );
});

export default UserManagement;