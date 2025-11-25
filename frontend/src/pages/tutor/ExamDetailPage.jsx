/* eslint-disable */
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    getExamDetail, 
    getQuestionsOfExam, 
    removeQuestionFromExam 
} from '../../services/ExamService';

// Import component thật (có trong QuestionPage.jsx)
import QuestionContentRenderer from '../../components/QuestionContentRenderer';

import {
    Box, Typography, Button, Paper, CircularProgress, Alert, 
    Stack, Chip, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { styled } from '@mui/material/styles';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// Import Dialog thêm câu hỏi
import AddQuestionDialog from '../../components/AddQuestionDialog'; 

// --- START: Code copy từ QuestionPage.jsx ---
const PageWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
}));

const difficultyMap = {
  EASY: { text: "Dễ", color: "success" },
  MEDIUM: { text: "Trung bình", color: "warning" },
  HARD: { text: "Khó", color: "error" },
};
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

const LevelChip = memo(({ level }) => {
    const levelMap = {
        EASY: { label: "Dễ", color: "success" },
        MEDIUM: { label: "Trung bình", color: "warning" },
        HARD: { label: "Khó", color: "error" },
    };
    const { label, color } = levelMap[level] || { label: level, color: "default" };
    return <Chip icon={<StarBorderIcon />} label={label} color={color} size="small" variant="outlined" />;
});
// --- END: Code copy từ QuestionPage.jsx ---


// Bảng hiển thị câu hỏi
const headCells = [
  { id: 'content', label: 'Nội dung', minWidth: 250 },
  { id: 'level', label: 'Độ khó', minWidth: 100 },
  { id: 'type', label: 'Loại', minWidth: 120 },
  { id: 'actions', label: 'Xóa', minWidth: 80, align: 'right' },
];

function ExamDetailPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [token] = useState(() => localStorage.getItem('token'));

    const [examData, setExamData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);

    const fetchData = useCallback(async () => {
        if (!token || !examId) {
            setError("Không tìm thấy ID đề thi hoặc token.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [detailsResponse, questionsResponse] = await Promise.all([
                getExamDetail(examId, token),
                getQuestionsOfExam(examId, token)
            ]);
            setExamData(detailsResponse);
            setQuestions(Array.isArray(questionsResponse) ? questionsResponse : []);
        } catch (err) {
            setError("Không thể tải chi tiết đề thi.");
        } finally {
            setLoading(false);
        }
    }, [token, examId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenDeleteDialog = (question) => {
        setQuestionToDelete(question);
    };
    const handleCloseDeleteDialog = () => {
        setQuestionToDelete(null);
    };
    
    const handleConfirmDelete = async () => {
        if (!questionToDelete) return;
        try {
            await removeQuestionFromExam(examId, questionToDelete.ques_id, token);
            setQuestionToDelete(null);
            await fetchData(); 
        } catch (err) {
            setError("Xóa câu hỏi thất bại.");
        }
    };
    
    const handleOpenAddDialog = () => setOpenAddDialog(true);
    const handleCloseAddDialog = () => setOpenAddDialog(false);
    const handleRefreshData = () => fetchData();

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }
    
    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    if (!examData) {
        return <Alert severity="warning" sx={{ mt: 2 }}>Không tìm thấy dữ liệu đề thi.</Alert>;
    }

    return (
        <PageWrapper>
            {/* 1. Thông tin chung */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        {examData.title}
                    </Typography>
                    <LevelChip level={examData.level} />
                    <Tooltip title="Chỉnh sửa thông tin (Chưa hỗ trợ)">
                        <span>
                            <IconButton disabled><EditIcon /></IconButton>
                        </span>
                    </Tooltip>
                </Stack>

                <Stack direction="row" spacing={3} color="text.secondary" mt={1.5} flexWrap="wrap">
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                        <QuizIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                            {examData.total_ques} câu hỏi
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                        <TimerIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                            {examData.duration} phút
                        </Typography>
                    </Box>
                </Stack>
                
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    {examData.description || "Đề thi chưa có mô tả."}
                </Typography>
            </Box>

            {/* 2. Thanh công cụ Câu hỏi */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight={600}>
                    Danh sách câu hỏi
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleOpenAddDialog}
                >
                    Thêm câu hỏi
                </Button>
            </Box>
            
            {/* 3. Bảng Câu hỏi */}
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader size="medium">
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        align={headCell.align || "left"}
                                        sx={{
                                            fontWeight: "bold",
                                            bgcolor: "grey.100",
                                            minWidth: headCell.minWidth,
                                            py: 1.5,
                                        }}
                                    >
                                        {headCell.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {questions.length > 0 ? (
                                questions.map((q) => (
                                    <TableRow key={q.ques_id} hover>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <QuestionContentRenderer htmlContent={q.content} />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <DifficultyChip difficulty={q.level} />
                                        </TableCell>
                                        <TableCell sx={{ textTransform: "capitalize", py: 1.5 }}>
                                            {formatQuestionType(q.type)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 1 }}>
                                            <Tooltip title="Xóa khỏi đề thi">
                                                <IconButton size="small" onClick={() => handleOpenDeleteDialog(q)}>
                                                    <DeleteIcon color="error" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={headCells.length} align="center" sx={{ py: 4 }}>
                                        Đề thi này chưa có câu hỏi nào.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialog Thêm câu hỏi */}
            {openAddDialog && (
                <AddQuestionDialog
                    open={openAddDialog}
                    onClose={handleCloseAddDialog}
                    onRefresh={handleRefreshData}
                    examId={examId}
                    existingQuestionIds={questions.map(q => q.ques_id)} 
                />
            )}

            {/* Dialog Xác nhận xóa */}
            {questionToDelete && (
                <Dialog open={true} onClose={handleCloseDeleteDialog}>
                    <DialogTitle>Xác nhận xóa câu hỏi?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Bạn có chắc muốn xóa câu hỏi này khỏi đề thi không? (Câu hỏi vẫn còn trong thư viện).
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
                        <Button onClick={handleConfirmDelete} color="error" autoFocus>Xóa</Button>
                    </DialogActions>
                </Dialog>
            )}

        </PageWrapper>
    );
}

export default memo(ExamDetailPage);