import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Autocomplete,
  Grid,
  InputAdornment,
  Avatar,
  Alert,
  useTheme
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import SendIcon from "@mui/icons-material/Send";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PercentIcon from "@mui/icons-material/Percent";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { getMyExams, createExamSession } from "../../services/ExamService";
import { getClassesByTutor } from "../../services/ClassService";
import AppSnackbar from "../../components/SnackBar"; 

dayjs.extend(isSameOrAfter);

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

const HeaderBar = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  flexShrink: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));
const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  width: "100%",
  minHeight: 0, 
  display: "flex",
  flexDirection: "column",
}));

const ColumnCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    backgroundColor: theme.palette.background.paper,
    backgroundImage: 'none',
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`,
    boxShadow: isDark ? 'none' : "0px 4px 12px rgba(0,0,0,0.02)",
    transition: "all 0.3s",
    overflow: "hidden",
    "&:hover": {
      boxShadow: isDark 
        ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}` 
        : "0px 12px 24px rgba(0,0,0,0.06)",
      borderColor: theme.palette.primary.main,
      transform: "translateY(-2px)",
    },
  };
});

const CardHeader = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
    backgroundColor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexShrink: 0,
  };
});

const CardBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flexGrow: 1,
  overflowY: "auto",
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  flexDirection: "column",
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: alpha(theme.palette.text.secondary, 0.2),
    borderRadius: "10px",
    "&:hover": { backgroundColor: alpha(theme.palette.text.secondary, 0.4) },
  },
}));

const CardFooter = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    padding: theme.spacing(2, 3),
    borderTop: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
    backgroundColor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.grey[50], 0.8),
    flexShrink: 0,
    marginTop: "auto",
  };
});

const StepBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    width: 36,
    height: 36,
    borderRadius: "10px",
    backgroundColor: active 
      ? theme.palette.primary.main 
      : (isDark ? alpha(theme.palette.text.secondary, 0.2) : theme.palette.grey[200]),
    color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1rem",
    flexShrink: 0,
    boxShadow: active ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}` : "none",
  };
});

const SectionDivider = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  margin: theme.spacing(2, 0),
  "&::before, &::after": {
    content: '""',
    flex: 1,
    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.midnight?.border : theme.palette.divider}`,
  },
}));

function AssignmentPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [token] = useState(() => localStorage.getItem("token"));

  const [masterExams, setMasterExams] = useState([]);
  const [tutorClasses, setTutorClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [startAt, setStartAt] = useState(dayjs());
  const [expireAt, setExpireAt] = useState(dayjs().add(1, "hour"));
  const [limitTaken, setLimitTaken] = useState(1);
  const [examType, setExamType] = useState("practice");
  const [ratio, setRatio] = useState(100);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [examsRes, classesRes] = await Promise.all([
        getMyExams(token),
        getClassesByTutor(token),
      ]);
      setMasterExams(Array.isArray(examsRes) ? examsRes : examsRes?.data || []);
      setTutorClasses(Array.isArray(classesRes) ? classesRes : classesRes?.data || []);
    } catch (err) {
      setSnackbar({ open: true, message: "Không thể tải dữ liệu đề thi hoặc lớp học.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const timeWarning = useMemo(() => {
    if (!selectedExam || !startAt || !expireAt) return null;
    
    const minRequiredExpire = startAt.add(selectedExam.duration, 'minute');
    
    if (expireAt.isBefore(minRequiredExpire)) {
      return `Thời gian đóng đề đang sớm hơn tổng thời gian làm bài (${selectedExam.duration} phút). Học sinh sẽ không đủ thời gian hoàn thành!`;
    }
    return null;
  }, [startAt, expireAt, selectedExam]);

  const handleSubmit = async () => {
    if (!selectedExam) return setSnackbar({ open: true, message: "Vui lòng chọn đề thi ở Cột 1.", severity: "warning" });
    if (selectedClasses.length === 0) return setSnackbar({ open: true, message: "Vui lòng chọn lớp học ở Cột 2.", severity: "warning" });
    if (timeWarning) return setSnackbar({ open: true, message: "Vui lòng điều chỉnh lại thời gian đóng đề hợp lý.", severity: "error" });
    if (examType === "test" && (ratio < 0 || ratio > 100)) return setSnackbar({ open: true, message: "Trọng số không hợp lệ (0-100%).", severity: "error" });

    setIsSubmitting(true);

    const payload = {
      startAt: startAt.toISOString(),
      expireAt: expireAt.toISOString(),
      limit_taken: parseInt(limitTaken),
      exam_type: examType,
      ...(examType === "test" && { ratio: parseInt(ratio) }),
    };

    try {
      await createExamSession(
        selectedExam.exam_id,
        selectedClasses.map((c) => c.class_id),
        payload,
        token
      );
      
      setSnackbar({ open: true, message: `Giao bài thành công cho ${selectedClasses.length} lớp!`, severity: "success" });
      setSelectedExam(null);
      setSelectedClasses([]);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Giao bài thất bại. Vui lòng thử lại.", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageWrapper>
      <HeaderBar>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">
            Giao bài tập và kiểm tra
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.95rem', mt: 0.5, display: 'block' }}>
            Thiết lập phiên làm bài mới cho học sinh
          </Typography>
        </Box>
      </HeaderBar>

      <MainContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={3} sx={{ height: "100%", m: 0, width: "100%", alignItems: "stretch" }}>
            
            {/* CỘT 1: CHỌN ĐỀ THI */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pl: "0 !important", py: "0 !important" }}>
              <ColumnCard>
                <CardHeader>
                  <StepBadge active={!!selectedExam}>1</StepBadge>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">CHỌN ĐỀ THI</Typography>
                    <Typography variant="caption" color="text.secondary">Tìm kiếm đề mẫu từ thư viện</Typography>
                  </Box>
                </CardHeader>

                <CardBody>
                  <Autocomplete
                    options={masterExams}
                    getOptionLabel={(option) => option.title}
                    value={selectedExam}
                    onChange={(_, val) => setSelectedExam(val)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Nhập tên đề thi..." 
                        fullWidth 
                        size="small" 
                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: "block !important", py: 1.5 }}>
                        <Typography variant="body2" fontWeight={600} noWrap color="text.primary">{option.title}</Typography>
                        <Stack direction="row" spacing={1} mt={1}>
                          <Chip label={`${option.total_ques} câu`} size="small" sx={{ height: 22, fontSize: "0.75rem", fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} />
                          <Chip label={option.level} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.75rem", fontWeight: 600 }} />
                        </Stack>
                      </Box>
                    )}
                  />
                  <SectionDivider>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 1 }}>ĐỀ ĐÃ CHỌN</Typography>
                  </SectionDivider>
                  {selectedExam ? (
                    <Box 
                      p={2} 
                      bgcolor={alpha(theme.palette.primary.main, 0.05)} 
                      borderRadius={3} 
                      border="1px dashed" 
                      borderColor="primary.main"
                    >
                      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                        <DescriptionOutlinedIcon sx={{ fontSize: 28, color: "primary.main" }} />
                        <Typography variant="body1" color="primary.main" fontWeight={700}>{selectedExam.title}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip icon={<AccessTimeIcon />} label={`${selectedExam.duration} phút`} size="small" sx={{ bgcolor: 'background.paper', fontWeight: 600 }} />
                        <Chip label={`${selectedExam.total_ques} câu hỏi`} size="small" sx={{ bgcolor: 'background.paper', fontWeight: 600 }} />
                      </Stack>
                    </Box>
                  ) : (
                    <Box textAlign="center" py={4} color="text.disabled">
                      <DescriptionOutlinedIcon sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
                      <Typography variant="body2">Vui lòng chọn đề thi để tiếp tục</Typography>
                    </Box>
                  )}
                </CardBody>
              </ColumnCard>
            </Grid>

            {/* CỘT 2: CHỌN LỚP HỌC */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ py: "0 !important" }}>
              <ColumnCard>
                <CardHeader>
                  <StepBadge active={selectedClasses.length > 0}>2</StepBadge>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">CHỌN LỚP HỌC</Typography>
                    <Typography variant="caption" color="text.secondary">Gửi đến một hoặc nhiều lớp</Typography>
                  </Box>
                </CardHeader>

                <CardBody>
                  <Autocomplete
                    multiple
                    options={tutorClasses}
                    getOptionLabel={(option) => option.classname}
                    value={selectedClasses}
                    onChange={(_, val) => setSelectedClasses(val)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Tìm lớp học..." 
                        placeholder="Chọn lớp..." 
                        size="small" 
                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip 
                          label={option.classname} 
                          {...getTagProps({ index })} 
                          size="small" 
                          sx={{ m: 0.5, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} 
                        />
                      ))
                    }
                    disableCloseOnSelect
                  />
                  <SectionDivider>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 1 }}>
                      DANH SÁCH LỚP ({selectedClasses.length})
                    </Typography>
                  </SectionDivider>
                  {selectedClasses.length > 0 ? (
                    <Stack spacing={1.5}>
                      {selectedClasses.map((cls) => (
                        <Paper 
                          key={cls.class_id} 
                          variant="outlined" 
                          sx={{ 
                            p: 1.5, display: "flex", alignItems: "center", gap: 1.5, borderRadius: 2,
                            borderColor: isDark ? theme.palette.midnight?.border : 'divider'
                          }}
                        >
                          <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main', fontWeight: 700, fontSize: "1rem" }}>
                            {cls.classname.charAt(0)}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={600} color="text.primary">{cls.classname}</Typography>
                            <Typography variant="caption" color="text.secondary">Sĩ số: {cls.nb_of_student || 0} học sinh</Typography>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Box textAlign="center" py={4} color="text.disabled">
                      <SchoolOutlinedIcon sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
                      <Typography variant="body2">Chưa có lớp nào được chọn</Typography>
                    </Box>
                  )}
                </CardBody>
              </ColumnCard>
            </Grid>

            {/* CỘT 3: CẤU HÌNH & GIAO */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pr: "0 !important", py: "0 !important" }}>
              <ColumnCard sx={{ borderColor: "primary.main", borderWidth: isDark ? 1 : 2 }}>
                <CardHeader sx={{ bgcolor: isDark ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.05) }}>
                  <StepBadge active={true}>3</StepBadge>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary.main">CẤU HÌNH & GIAO</Typography>
                    <Typography variant="caption" color="text.secondary">Thiết lập thông số cuối cùng</Typography>
                  </Box>
                </CardHeader>

                <CardBody>
                  <Stack spacing={2.5}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                      <InputLabel>Loại bài tập</InputLabel>
                      <Select value={examType} label="Loại bài tập" onChange={(e) => setExamType(e.target.value)}>
                        <MenuItem value="practice">Luyện tập (Không lấy điểm)</MenuItem>
                        <MenuItem value="test">Kiểm tra (Lấy điểm)</MenuItem>
                      </Select>
                    </FormControl>

                    {examType === "test" && (
                      <TextField
                        label="Trọng số điểm"
                        type="number"
                        size="small"
                        value={ratio}
                        onChange={(e) => setRatio(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        InputProps={{
                          endAdornment: <InputAdornment position="end"><PercentIcon fontSize="small" /></InputAdornment>,
                        }}
                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                      />
                    )}

                    <SectionDivider><Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 1 }}>THỜI GIAN</Typography></SectionDivider>
                    
                    <DateTimePicker
                      label="Thời gian mở đề"
                      value={startAt}
                      onChange={(n) => setStartAt(n)}
                      slotProps={{ textField: { size: "small", fullWidth: true, sx: { bgcolor: 'background.paper', borderRadius: 1 } } }}
                    />
                    
                    <DateTimePicker
                      label="Thời gian đóng đề"
                      value={expireAt}
                      onChange={(n) => setExpireAt(n)}
                      slotProps={{ textField: { size: "small", fullWidth: true, sx: { bgcolor: 'background.paper', borderRadius: 1 } } }}
                    />

                    {/* HIỂN THỊ CẢNH BÁO THỜI GIAN NẾU CÓ */}
                    {timeWarning && (
                      <Alert severity="warning" sx={{ borderRadius: 2, fontWeight: 500 }}>
                        {timeWarning}
                      </Alert>
                    )}

                    <TextField
                      label="Số lần làm bài tối đa"
                      type="number"
                      size="small"
                      value={limitTaken}
                      onChange={(e) => setLimitTaken(Math.max(1, parseInt(e.target.value) || 1))}
                      InputProps={{ endAdornment: <InputAdornment position="end">lần</InputAdornment> }}
                      sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                    />
                  </Stack>
                </CardBody>

                <CardFooter>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedExam || selectedClasses.length === 0 || !!timeWarning}
                    endIcon={!isSubmitting && <SendIcon />}
                    sx={{ py: 1.5, fontWeight: 700, borderRadius: "12px" }}
                  >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "GIAO BÀI NGAY"}
                  </Button>
                </CardFooter>
              </ColumnCard>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </MainContent>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </PageWrapper>
  );
}

export default memo(AssignmentPage);