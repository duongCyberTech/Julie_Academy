import React, { useState, memo, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
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
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

import { enrollClass, cancelClass } from "../../services/ClassService";

const StudentsTab = ({ classId, studentsData, onRefresh }) => {
  const token = localStorage.getItem("token");
  const [email, setEmail] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
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
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };
  const handleEnroll = useCallback(async () => {
    if (!email.trim()) {
      showToast("Vui lòng nhập Gmail của học sinh.", "warning");
      return;
    }

    setLoadingAdd(true);
    try {
      await enrollClass(classId, email.trim(), token);
      showToast(`Đã thêm thành công: ${email}`);
      setEmail("");
      onRefresh();
    } catch (err) {
      showToast(err.message || "Thêm học sinh thất bại.", "error");
    } finally {
      setLoadingAdd(false);
    }
  }, [classId, email, token, onRefresh]);

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

    setLoadingDelete(true);
    try {
      await cancelClass(studentId, classId, token);
      showToast("Đã xóa học sinh khỏi lớp.", "success");
      onRefresh();
    } catch (err) {
      showToast(err.message || "Xóa thất bại.", "error");
    } finally {
      setLoadingDelete(false);
      setDeleteDialog({ open: false, studentId: null, studentName: "" });
    }
  };

  const studentList = studentsData?.map((item) => item.student) || [];

  return (
    <Box>
      {/* Section 1: Add Student */}
      <Typography variant="h6" fontWeight={600} mb={2}>
        Thêm thành viên
      </Typography>
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 4, bgcolor: "background.default" }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Nhập Gmail học sinh"
            variant="outlined"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            placeholder="example@gmail.com"
            onKeyPress={(e) => e.key === "Enter" && handleEnroll()}
          />
          <Button
            variant="contained"
            onClick={handleEnroll}
            startIcon={
              loadingAdd ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <AddIcon />
              )
            }
            disabled={loadingAdd}
            sx={{ minWidth: 120, height: 40 }}
          >
            {loadingAdd ? "Đang thêm" : "Thêm"}
          </Button>
        </Stack>
      </Paper>

      {/* Section 2: Student List Table */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Danh sách lớp
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tổng số: <strong>{studentList.length}</strong> học sinh
        </Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell>
                <strong>Học sinh</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Hành động</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentList.length > 0 ? (
              studentList.map((student) => (
                <TableRow key={student.uid} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={student.user.avata_url}
                        alt={student.user.fname}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "primary.main",
                          fontSize: 14,
                        }}
                      >
                        {student.user.fname?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {student.user.lname} {student.user.mname}{" "}
                        {student.user.fname}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{student.user.email}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Xóa khỏi lớp">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteConfirm(student)}
                      >
                        <PersonRemoveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  Lớp chưa có học sinh nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, open: false }))}
      >
        <DialogTitle>Xác nhận xóa học sinh</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn mời học sinh{" "}
            <strong>{deleteDialog.studentName}</strong> ra khỏi lớp không? Hành
            động này sẽ xóa dữ liệu học tập của học sinh trong lớp này.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialog((prev) => ({ ...prev, open: false }))
            }
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
            disabled={loadingDelete}
          >
            {loadingDelete ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default memo(StudentsTab);
