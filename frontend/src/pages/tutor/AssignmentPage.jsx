import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, CircularProgress,
    Alert, Stack, FormControl, InputLabel, Select,
    MenuItem, TextField, OutlinedInput, Checkbox, ListItemText,Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { getMyExams, createExamSession } from '../../services/ExamService';
import { getClassesByTutor } from '../../services/ClassService'; 

const PageWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
}));

const Header = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function AssignmentPage() {
    const navigate = useNavigate();
    const [token] = useState(() => localStorage.getItem('token'));
    
    const [masterExams, setMasterExams] = useState([]);
    const [tutorClasses, setTutorClasses] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedClassIds, setSelectedClassIds] = useState([]);
    const [startAt, setStartAt] = useState(dayjs());
    const [expireAt, setExpireAt] = useState(dayjs().add(1, 'hour'));
    const [limitTaken, setLimitTaken] = useState(1);
    const [examType, setExamType] = useState('practice');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);


    const fetchInitialData = useCallback(async () => {
        if (!token) {
            setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
            setLoadingData(false);
            return;
        }
        setLoadingData(true);
        setError(null);
        try {
            const [examsResponse, classesResponse] = await Promise.all([
                getMyExams(token),
                getClassesByTutor(token)
            ]);

            setMasterExams(Array.isArray(examsResponse) ? examsResponse : []);
            setTutorClasses(Array.isArray(classesResponse) ? classesResponse : []);

        } catch (err) {
            setError("Không thể tải danh sách đề thi hoặc lớp học.");
        } finally {
            setLoadingData(false);
        }
    }, [token]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);


    const handleClassChange = (event) => {
        const { target: { value } } = event;
        setSelectedClassIds(
            typeof value === 'string' ? value.split(',') : value,
        );
    };
    
    const handleSubmit = async () => {
        setSuccessMessage(null);

        if (!selectedExamId) {
            setError("Vui lòng chọn một đề thi.");
            return;
        }
        if (selectedClassIds.length === 0) {
            setError("Vui lòng chọn ít nhất một lớp học.");
            return;
        }
        if (!startAt || !expireAt || expireAt.isBefore(startAt)) {
            setError("Thời gian kết thúc phải sau thời gian bắt đầu.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const sessionData = {
            startAt: startAt.toISOString(),
            expireAt: expireAt.toISOString(),
            limit_taken: Number(limitTaken),
            exam_type: examType,
        };

        try {
            await createExamSession(
                selectedExamId, 
                selectedClassIds, 
                sessionData, 
                token
            );
            
            setSuccessMessage("Giao bài thành công!");
            setSelectedExamId('');
            setSelectedClassIds([]);
            setStartAt(dayjs());
            setExpireAt(dayjs().add(1, 'hour'));
            

        } catch (err) {
            setError(err.response?.data?.message || "Giao bài thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingData) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }

    return (
        <PageWrapper>
            <Header>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Giao bài tập / Kiểm tra
                </Typography>
            </Header>

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mt: 2, maxWidth: '800px', mx: 'auto' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack spacing={3}>
                        <Typography variant="h6" fontWeight={600}>
                            1. Chọn đề thi
                        </Typography>
                        
                        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
                        {successMessage && <Alert severity="success">{successMessage}</Alert>}

                        <FormControl fullWidth>
                            <InputLabel id="exam-select-label">Chọn từ đề thi đã tạo</InputLabel>
                            <Select
                                labelId="exam-select-label"
                                value={selectedExamId}
                                label="Chọn từ đề thi đã tạo"
                                onChange={(e) => setSelectedExamId(e.target.value)}
                            >
                                {masterExams.length === 0 && (
                                    <MenuItem disabled><em>Bạn chưa tạo đề thi nào.</em></MenuItem>
                                )}
                                {masterExams.map(exam => (
                                    <MenuItem key={exam.exam_id} value={exam.exam_id}>
                                        {exam.title} ({exam.total_ques} câu)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Typography variant="h6" fontWeight={600} sx={{ pt: 1 }}>
                            2. Chọn lớp học
                        </Typography>

                        <FormControl fullWidth>
                            <InputLabel id="class-multi-select-label">Giao cho các lớp</InputLabel>
                            <Select
                                labelId="class-multi-select-label"
                                multiple
                                value={selectedClassIds}
                                onChange={handleClassChange}
                                input={<OutlinedInput label="Giao cho các lớp" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip 
                                                key={value} 
                                                label={tutorClasses.find(c => c.class_id === value)?.classname || value} 
                                            />
                                        ))}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                            >
                                {tutorClasses.length === 0 && (
                                     <MenuItem disabled><em>Bạn chưa tạo lớp học nào.</em></MenuItem>
                                )}
                                {tutorClasses.map((classItem) => (
                                    <MenuItem key={classItem.class_id} value={classItem.class_id}>
                                        <Checkbox checked={selectedClassIds.indexOf(classItem.class_id) > -1} />
                                        <ListItemText primary={classItem.classname} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <Typography variant="h6" fontWeight={600} sx={{ pt: 1 }}>
                            3. Thiết lập thông tin
                        </Typography>
                        
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <DateTimePicker
                                label="Thời gian bắt đầu"
                                value={startAt}
                                onChange={(newValue) => setStartAt(newValue)}
                                sx={{ flex: 1 }}
                            />
                            <DateTimePicker
                                label="Thời gian kết thúc"
                                value={expireAt}
                                onChange={(newValue) => setExpireAt(newValue)}
                                sx={{ flex: 1 }}
                            />
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="Số lần làm bài tối đa"
                                name="limit_taken"
                                type="number"
                                value={limitTaken}
                                onChange={(e) => setLimitTaken(Math.max(1, parseInt(e.target.value, 10)))}
                                sx={{ flex: 1 }}
                            />
                            <FormControl fullWidth sx={{ flex: 1 }}>
                                <InputLabel id="type-select-label">Loại bài</InputLabel>
                                <Select
                                    labelId="type-select-label"
                                    value={examType}
                                    label="Loại bài"
                                    onChange={(e) => setExamType(e.target.value)}
                                >
                                    <MenuItem value="practice">Luyện tập</MenuItem>
                                    <MenuItem value="test">Kiểm tra (tính điểm)</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {isSubmitting ? "Đang giao bài..." : "Xác nhận giao"}
                            </Button>
                        </Box>
                        
                    </Stack>
                </LocalizationProvider>
            </Paper>
        </PageWrapper>
    );
}

export default memo(AssignmentPage);