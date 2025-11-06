import React, { useState, memo } from 'react';
import { 
    Box, Typography, Button, TextField, Stack, Alert, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    IconButton, Tooltip, Avatar, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { enrollStudentToClass } from '../../services/ClassService';

/**
 * Nội dung cho Tab "Thành viên"
 * @param {object} props
 * @param {string} props.classId - ID của lớp học hiện tại
 * @param {Array} props.studentsData - Mảng học sinh (từ classData.learning)
 * @param {function} props.onRefresh - Hàm để gọi lại API getDetailedClass
 */
const StudentsTab = ({ classId, studentsData, onRefresh }) => {
    const [token] = useState(() => localStorage.getItem('token'));
    const [studentId, setStudentId] = useState(''); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleEnroll = async () => {
        if (!studentId) {
            setError('Vui lòng nhập ID của học sinh.');
            return;
        }
        setError('');
        setSuccess('');
        try {
            await enrollStudentToClass(classId, studentId, token);
            setSuccess(`Đã thêm học sinh ${studentId} vào lớp.`);
            setStudentId(''); 
            onRefresh();
        } catch (err) {
            setError(err.response?.data?.message || 'Thêm học sinh thất bại.');
        }
    };

    const studentList = (studentsData || []).map(item => item.student);

    return (
        <Box>
            <Typography variant="h6" component="h3" fontWeight={600} mb={2}>
                Thêm thành viên
            </Typography>
            <Stack direction="row" spacing={2} mb={2}>
                <TextField
                    label="Nhập ID học sinh"
                    variant="outlined"
                    size="small"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    variant="contained"
                    onClick={handleEnroll}
                    startIcon={<AddIcon />}
                >
                    Thêm
                </Button>
            </Stack>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* 2. Bảng Danh Sách Học Sinh */}
            <Typography variant="h6" component="h3" fontWeight={600} mb={2} mt={4}>
                Danh sách lớp ({studentList.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Học sinh</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {studentList.map((student) => (
                            <TableRow key={student.uid}>
                                <TableCell>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar 
                                            src={student.user.avata_url || ''} 
                                            sx={{ width: 32, height: 32 }}
                                        >
                                            {student.user.fname.charAt(0)}
                                        </Avatar>
                                        <Typography variant="body2" fontWeight={500}>
                                            {student.user.lname} {student.user.mname} {student.user.fname}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>{student.user.email}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Xóa khỏi lớp (Chưa có API)">
                                        <span>
                                        <IconButton size="small" color="error" disabled>
                                            <DeleteIcon />
                                        </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default memo(StudentsTab);