import React, { useState, memo } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Avatar,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from "@mui/material";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import {
  cancelClass,
  acceptEnrollRequest,
  rejectEnrollRequest,
} from "../../services/ClassService";

const StudentsTab = ({ classId, studentsData, onRefresh }) => {
  console.log("Dữ liệu học sinh nhận được:", studentsData);
  const token = localStorage.getItem("token");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    studentId: null,
    studentName: "",
  });
  const [loadingAction, setLoadingAction] = useState(false);

  const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  // --- LOGIC LỌC DANH SÁCH ---
  // Đảm bảo studentsData là mảng trước khi filter
  const safeData = Array.isArray(studentsData) ? studentsData : [];
  
  const pendingStudents = safeData.filter((item) => item.status === "pending");
  const enrolledStudents = safeData.filter((item) => item.status === "accepted");

  // --- HANDLERS ---
  const handleAccept = async (studentId) => {
    setLoadingAction(true);
    try {
      await acceptEnrollRequest(classId, studentId, token);
      showToast("Đã chấp nhận học sinh vào lớp.");
      onRefresh();
    } catch (err) {
      showToast(err.message || "Thao tác thất bại.", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async (studentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối học sinh này?")) return;
    setLoadingAction(true);
    try {
      await rejectEnrollRequest(classId, studentId, token);
      showToast("Đã từ chối yêu cầu.");
      onRefresh();
    } catch (err) {
      showToast(err.message || "Thao tác thất bại.", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const openDeleteConfirm = (student) => {
    setDeleteDialog({
      open: true,
      studentId: student.uid,
      studentName: `${student.user.lname} ${student.user.mname} ${student.user.fname}`,
    });
  };

  const handleConfirmDelete = async () => {
    const { studentId } = deleteDialog;
    if (!studentId) return;

    setLoadingAction(true);
    try {
      await cancelClass(studentId, classId, token);
      showToast("Đã xóa học sinh khỏi lớp.", "success");
      onRefresh();
    } catch (err) {
      showToast(err.message || "Xóa thất bại.", "error");
    } finally {
      setLoadingAction(false);
      setDeleteDialog({ open: false, studentId: null, studentName: "" });
    }
  };

  return (
    <Box>
      {/* --- PHẦN 1: DANH SÁCH CHỜ DUYỆT (PENDING) --- */}
      {pendingStudents.length > 0 && (
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600} color="warning.main">
              Yêu cầu tham gia
            </Typography>
            <Chip 
              label={pendingStudents.length} 
              size="small" 
              color="warning" 
              sx={{ ml: 1, fontWeight: 'bold' }} 
            />
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: "#fff8e1" }}>
                <TableRow>
                  <TableCell><strong>Học sinh</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell align="center"><strong>Thao tác</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingStudents.map((item) => {
                  const student = item.student;
                  const user = student?.user || {}; // Đảm bảo không lỗi nếu thiếu user

                  return (
                    <TableRow key={student?.uid} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={user.avata_url}
                            alt={user.fname}
                            sx={{ width: 32, height: 32 }}
                          >
                            {user.fname?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {user.lname} {user.mname} {user.fname}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Chấp nhận">
                            <IconButton
                              color="success"
                              onClick={() => handleAccept(student.uid)}
                              disabled={loadingAction}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Từ chối">
                            <IconButton
                              color="error"
                              onClick={() => handleReject(student.uid)}
                              disabled={loadingAction}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* --- PHẦN 2: DANH SÁCH CHÍNH THỨC (ACCEPTED) --- */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Danh sách lớp chính thức
        </Typography>
        <Chip
          label={`${enrolledStudents.length} học sinh`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell><strong>Học sinh</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell align="center"><strong>Hành động</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enrolledStudents.length > 0 ? (
              enrolledStudents.map((item) => {
                const student = item.student;
                const user = student?.user || {};

                return (
                  <TableRow key={student?.uid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={user.avata_url}
                          alt={user.fname}
                          sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}
                        >
                          {user.fname?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {user.lname} {user.mname} {user.fname}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xóa khỏi lớp">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteConfirm(student)}
                          disabled={loadingAction}
                        >
                          <PersonRemoveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Lớp chưa có học sinh chính thức nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Confirm Delete */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog((prev) => ({ ...prev, open: false }))}>
        <DialogTitle>Xác nhận xóa học sinh</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn mời học sinh <strong>{deleteDialog.studentName}</strong> ra khỏi lớp không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog((prev) => ({ ...prev, open: false }))} color="inherit">Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus disabled={loadingAction}>
            {loadingAction ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ width: "100%" }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default memo(StudentsTab);