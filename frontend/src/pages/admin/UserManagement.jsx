import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Chip,
  TextField, InputAdornment, Grid, Select, MenuItem, InputLabel, FormControl,
  TablePagination, TableSortLabel, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText, Stack,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  MoreVert as MoreVertIcon, Block as BlockIcon, CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
    getAllUsers, createUser, updateUser, updateUserStatus
} from '../../services/UserService';
import ActionMenu from '../../components/ActionMenu'; 

// --- Helper Functions ---
function descendingComparator(a, b, orderBy) {
  const valA = a[orderBy] ?? '';
  const valB = b[orderBy] ?? '';
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}
const handleOpenCreate = () => {
    setEditingUser(null); 
    setIsModalOpen(true); 
  };
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

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Head Cells ---
const headCells = [
    { id: 'fname', label: 'Họ tên', minWidth: 170 },
    { id: 'email', label: 'Email', minWidth: 150 },
    { id: 'role', label: 'Vai trò', minWidth: 100 },
    { id: 'status', label: 'Trạng thái', minWidth: 100 },
    { id: 'actions', label: 'Hành động', disableSorting: true, align: 'right' },
];

// --- Chip Components ---
const RoleChip = ({ role }) => {
    const color = { admin: 'error', tutor: 'info', parents: 'warning', student: 'secondary' }[role] || 'default';
    return <Chip label={role} color={color} size="small" sx={{ textTransform: 'capitalize' }} />;
};

const StatusChip = ({ status }) => {
    const color = { active: 'success', inactive: 'error', pending: 'warning' }[status] || 'default';
    return <Chip label={status} color={color} size="small" sx={{ textTransform: 'capitalize' }} />;
};

// --- UserFormModal ---
const UserFormModal = ({ open, onClose, onSubmit, userToEdit }) => {
  const [formData, setFormData] = useState({
      username: '', email: '', password: '', role: 'student', status: 'active',
      fname: '', lname: '', school: '', dob: '', phone_number: '', experiences: '',
  });
  const isEditing = useMemo(() => Boolean(userToEdit?.uid), [userToEdit]);

  useEffect(() => {
      const resetForm = () => setFormData({
        username: '', email: '', password: '', role: 'student', status: 'active',
        fname: '', lname: '', school: '', dob: '', phone_number: '', experiences: '',
      });
      if (userToEdit) { setFormData({
        username: userToEdit.username || '', email: userToEdit.email || '', role: userToEdit.role || 'student',
        status: userToEdit.status || 'active', fname: userToEdit.fname || '', lname: userToEdit.lname || '', password: '',
        school: userToEdit.student?.school || '',
        dob: userToEdit.student?.dob ? new Date(userToEdit.student.dob).toISOString().split('T')[0] : '',
        phone_number: userToEdit.tutor?.phone_number || userToEdit.parents?.phone_number || '',
        experiences: userToEdit.tutor?.experiences || '',
      }); } else { resetForm(); }
  }, [userToEdit, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
   };
  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };
    if (isEditing && !dataToSend.password) { delete dataToSend.password; }
    onSubmit(dataToSend, userToEdit?.uid);
   };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Cập nhật người dùng' : 'Tạo người dùng mới'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField name="fname" label="Họ" value={formData.fname} onChange={handleChange} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField name="lname" label="Tên" value={formData.lname} onChange={handleChange} fullWidth required /></Grid>
            <Grid size={12}><TextField name="username" label="Tên đăng nhập" value={formData.username} onChange={handleChange} fullWidth required /></Grid>
            <Grid size={12}><TextField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} fullWidth required /></Grid>
            <Grid size={12}><TextField name="password" label="Mật khẩu" type="password" value={formData.password} onChange={handleChange} fullWidth placeholder={isEditing ? 'Bỏ trống nếu không đổi' : ''} required={!isEditing} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><FormControl fullWidth required><InputLabel>Vai trò</InputLabel><Select name="role" value={formData.role} label="Vai trò" onChange={handleChange}><MenuItem value="student">Student</MenuItem><MenuItem value="tutor">Tutor</MenuItem><MenuItem value="admin">Admin</MenuItem><MenuItem value="parents">Parents</MenuItem></Select></FormControl></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><FormControl fullWidth required><InputLabel>Trạng thái</InputLabel><Select name="status" value={formData.status} label="Trạng thái" onChange={handleChange}><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem></Select></FormControl></Grid>
            {formData.role === 'student' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}><TextField name="school" label="Trường học" value={formData.school} onChange={handleChange} fullWidth /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField name="dob" label="Ngày sinh" type="date" value={formData.dob} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
              </>
            )}
            {formData.role === 'tutor' && (
              <>
                <Grid size={12}><TextField name="phone_number" label="Số điện thoại" value={formData.phone_number} onChange={handleChange} fullWidth /></Grid>
                <Grid size={12}><TextField name="experiences" label="Kinh nghiệm" value={formData.experiences} onChange={handleChange} fullWidth multiline rows={3} /></Grid>
              </>
            )}
            {formData.role === 'parents' && (
              <Grid size={12}><TextField name="phone_number" label="Số điện thoại" value={formData.phone_number} onChange={handleChange} fullWidth /></Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} color="inherit">Hủy</Button>
          <Button type="submit" variant="contained">{isEditing ? 'Lưu thay đổi' : 'Tạo mới'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};


// --- Main UserManagement Component ---
const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('fname');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const getToken = useCallback(() => localStorage.getItem('token'), []);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) { setError("Chưa đăng nhập."); setLoading(false); return; }

    try {
       const params = { page: 1, limit: 1000, role: 'all', status: 'all', filter: '' };
       const response = await getAllUsers(params, token);
       if (response && Array.isArray(response.data)) { setAllUsers(response.data); }
       else if (Array.isArray(response)) { setAllUsers(response); }
       else { throw new Error("Dữ liệu API không hợp lệ"); }
    } catch (err) {
      setError(`Lỗi tải danh sách: ${err.response?.data?.message || err.message}`);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchAllUsers(); }, [fetchAllUsers]);

  useEffect(() => {
    let result = [...allUsers];
    if (roleFilter) { result = result.filter(user => user.role === roleFilter); }
    if (statusFilter) { result = result.filter(user => user.status === statusFilter); }
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(user =>
        (user.fname?.toLowerCase() || '').includes(lowerSearch) ||
        (user.lname?.toLowerCase() || '').includes(lowerSearch) ||
        (user.username?.toLowerCase() || '').includes(lowerSearch) ||
        (user.email?.toLowerCase() || '').includes(lowerSearch)
      );
    }
    result = stableSort(result, getComparator(order, orderBy));
    setFilteredUsers(result);
    setPage(0);
  }, [allUsers, roleFilter, statusFilter, debouncedSearch, order, orderBy]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'role-filter') setRoleFilter(value);
    if (name === 'status-filter') setStatusFilter(value);
  };
  const handleSearchChange = (event) => { setSearchTerm(event.target.value); };
  const handleChangePage = (event, newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  const handleOpenMenu = (event, user) => { setMenuAnchorEl(event.currentTarget); setSelectedUser(user); };
  const handleCloseMenu = () => { setMenuAnchorEl(null); setSelectedUser(null); };

  // --- Hàm xử lý hành động ---
  const handleEditAction = () => { setEditingUser(selectedUser); setIsModalOpen(true); };
  const handleToggleStatusAction = async () => {
    if (!selectedUser) return;
    const token = getToken(); if (!token) { setError("Chưa đăng nhập."); return; }
    const newStatus = selectedUser.status === 'active' ? 'inactive' : 'active';
    setError(null);
    try {
      await updateUserStatus(selectedUser.uid, newStatus, token);
      setAllUsers(prev => prev.map(u => u.uid === selectedUser.uid ? { ...u, status: newStatus } : u));
    } catch (err) { setError(`Lỗi cập nhật trạng thái: ${err.response?.data?.message || err.message}`); }
  };
  const handleDeleteAction = () => { setOpenDeleteDialog(true); };

  // --- Hàm xử lý Modal và Dialog ---
  const handleCloseModal = () => { setIsModalOpen(false); setEditingUser(null); };
  const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    const token = getToken(); if (!token) { setError("Chưa đăng nhập."); return; }
    const userId = selectedUser.uid;
    setError(null);
    try {
      await deleteUser(userId, token);
      setAllUsers(prev => prev.filter(u => u.uid !== userId));
    } catch (err) { setError(`Lỗi xóa user: ${err.response?.data?.message || err.message}`); }
    finally { handleCloseDeleteDialog(); }
  };

  const handleSubmitForm = async (formData, userId) => {
    const token = getToken(); if (!token) { setError("Chưa đăng nhập."); return; }
    setError(null);
    try {
      if (userId) { await updateUser(userId, formData, token); }
      else { await createUser(formData, token); }
      handleCloseModal();
      fetchAllUsers();
    } catch (err) { setError(err.response?.data?.message || (userId ? 'Lỗi cập nhật.' : 'Lỗi tạo mới.')); }
  };

  const visibleRows = useMemo(() => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredUsers, page, rowsPerPage]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={3} spacing={2}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>Quản lý người dùng</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ flexShrink: 0 }}>Thêm người dùng</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth size="small" variant="outlined" placeholder="Tìm kiếm..." value={searchTerm} onChange={handleSearchChange} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)}} />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small"><InputLabel>Vai trò</InputLabel><Select name="role-filter" value={roleFilter} label="Vai trò" onChange={handleFilterChange}><MenuItem value="">Tất cả</MenuItem><MenuItem value="student">Student</MenuItem><MenuItem value="tutor">Tutor</MenuItem><MenuItem value="admin">Admin</MenuItem><MenuItem value="parents">Parents</MenuItem></Select></FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small"><InputLabel>Trạng thái</InputLabel><Select name="status-filter" value={statusFilter} label="Trạng thái" onChange={handleFilterChange}><MenuItem value="">Tất cả</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem></Select></FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sortDirection={orderBy === headCell.id ? order : false}
                    align={headCell.align || 'left'}
                    sx={{ fontWeight: 'bold', bgcolor: 'action.hover', minWidth: headCell.minWidth || 120, whiteSpace: 'nowrap' }}
                  >
                    {headCell.disableSorting ? headCell.label : (
                      <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={() => handleRequestSort(headCell.id)}>
                        {headCell.label}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (<TableRow><TableCell colSpan={headCells.length} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>)}
              {!loading && visibleRows.length === 0 && !error && (<TableRow><TableCell colSpan={headCells.length} align="center" sx={{ py: 5 }}>Không có người dùng nào khớp.</TableCell></TableRow>)}
              {!loading && visibleRows.map((user) => (
                user && user.uid ? (
                  <TableRow key={user.uid} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell><Typography variant="body2" noWrap>{`${user.fname || ''} ${user.lname || ''}`.trim() || user.username}</Typography></TableCell>
                    <TableCell><Typography variant="body2" noWrap>{user.email}</Typography></TableCell>
                    <TableCell><RoleChip role={user.role} /></TableCell>
                    <TableCell><StatusChip status={user.status} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Tùy chọn">
                        <IconButton size="small" onClick={(e) => handleOpenMenu(e, user)}><MoreVertIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ) : null
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={filteredUsers.length}
            rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="Số dòng:"
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
        onDelete={handleDeleteAction} // Truyền hàm xử lý Delete (mở dialog)
      />

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa?</DialogTitle>
        <DialogContent><DialogContentText>Xóa người dùng "{selectedUser?.username}"?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>Xóa</Button>
        </DialogActions>
      </Dialog>

      {isModalOpen && (<UserFormModal open={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmitForm} userToEdit={editingUser}/>)}
    </Box>
  );
};

export default UserManagement;