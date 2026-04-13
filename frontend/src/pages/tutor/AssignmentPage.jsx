import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Paper, CircularProgress, Stack,
  FormControl, InputLabel, Select, MenuItem, TextField, Chip,
  Autocomplete, Grid, InputAdornment, Avatar, Alert, useTheme
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { LocalizationProvider, DesktopDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import "dayjs/locale/vi";
import SendIcon from "@mui/icons-material/Send";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PercentIcon from "@mui/icons-material/Percent";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { getMyExams, createExamSession } from "../../services/ExamService";
import { getClassesByTutor } from "../../services/ClassService";
import AppSnackbar from "../../components/SnackBar";

dayjs.extend(isSameOrAfter);
dayjs.locale("vi");

const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : "#F9FAFB",
    backgroundImage: "none",
    borderRadius: "24px",
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` : "0 8px 48px rgba(0,0,0,0.03)",
    minHeight: "calc(100vh - 120px)",
    display: "flex",
    flexDirection: "column",
  };
});

const HeaderBar = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  flexShrink: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const MainContent = styled(Box)({
  flexGrow: 1,
  width: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
});

const ColumnCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    backgroundColor: theme.palette.background.paper,
    backgroundImage: "none",
    border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.6)}`,
    boxShadow: isDark ? "none" : "0px 4px 12px rgba(0,0,0,0.02)",
    transition: "all 0.3s",
    overflow: "hidden",
    "&:hover": {
      boxShadow: isDark ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}` : "0px 12px 24px rgba(0,0,0,0.06)",
      borderColor: theme.palette.primary.main,
      transform: "translateY(-2px)",
    },
  };
});

const CardHeader = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
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
  const isDark = theme.palette.mode === "dark";
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
  const isDark = theme.palette.mode === "dark";
  return {
    width: 36,
    height: 36,
    borderRadius: "10px",
    backgroundColor: active ? theme.palette.primary.main : (isDark ? alpha(theme.palette.text.secondary, 0.2) : theme.palette.grey[200]),
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
    borderBottom: `1px solid ${theme.palette.mode === "dark" ? theme.palette.midnight?.border : theme.palette.divider}`,
  },
}));

function AssignmentPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  
  const isMountedRef = useRef(true);

  const [token] = useState(() => localStorage.getItem("token"));
  const [masterExams, setMasterExams] = useState([]);
  const [tutorClasses, setTutorClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [startAt, setStartAt] = useState(() => dayjs().startOf("minute"));
  const [expireAt, setExpireAt] = useState(() => dayjs().add(1, "hour").startOf("minute"));
  
  // Chuyển state sang chuỗi (String) để nhập liệu không bị giật/nhảy số
  const [limitTaken, setLimitTaken] = useState("1");
  const [examType, setExamType] = useState("practice");
  const [ratio, setRatio] = useState("100");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const commonInputSx = useMemo(() => ({ bgcolor: "background.paper", borderRadius: 1 }), []);

  const handleCloseSnackbar = useCallback(() => setSnackbar((prev) => ({ ...prev, open: false })), []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [examsRes, classesRes] = await Promise.all([getMyExams(token), getClassesByTutor(token)]);
        if (isMounted) {
          setMasterExams(Array.isArray(examsRes) ? examsRes : examsRes?.data || []);
          setTutorClasses(Array.isArray(classesRes) ? classesRes : classesRes?.data || []);
        }
      } catch (err) {
        if (isMounted) setSnackbar({ open: true, message: "Không thể tải dữ liệu.", severity: "error" });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initData();
    return () => { isMounted = false; };
  }, [token]);

  const handleSelectExam = useCallback((event, newValue) => {
    setSelectedExam(newValue);
    if (newValue && startAt && startAt.isValid()) {
      const minRequiredExpire = startAt.add(newValue.duration + 15, "minute");
      if (!expireAt || !expireAt.isValid() || expireAt.isBefore(minRequiredExpire)) {
        setExpireAt(minRequiredExpire);
      }
    }
  }, [startAt, expireAt]);

  const handleSelectClasses = useCallback((_, val) => {
    setSelectedClasses(val);
  }, []);

  const handleStartAtChange = useCallback((newValue) => {
    setStartAt(newValue);
    if (newValue && newValue.isValid()) {
      if (selectedExam) {
        const minRequiredExpire = newValue.add(selectedExam.duration + 15, "minute");
        if (expireAt && expireAt.isValid() && expireAt.isBefore(minRequiredExpire)) {
          setExpireAt(minRequiredExpire);
        }
      } else if (expireAt && expireAt.isValid() && expireAt.isBefore(newValue)) {
         setExpireAt(newValue.add(1, "hour"));
      }
    }
  }, [selectedExam, expireAt]);

  const handleChangeExamType = useCallback((e) => setExamType(e.target.value), []);
  const handleChangeExpireAt = useCallback((n) => setExpireAt(n), []);

  // -- SỬA LỖI NHẬP LIỆU: Tách riêng onChange (cho phép gõ tự do/xóa rỗng) và onBlur (ép số chuẩn) --
  const handleChangeRatio = useCallback((e) => {
    const val = e.target.value;
    if (val === "" || /^[0-9\b]+$/.test(val)) setRatio(val);
  }, []);

  const handleBlurRatio = useCallback(() => {
    let num = parseInt(ratio, 10);
    if (isNaN(num)) num = 100;
    setRatio(Math.min(100, Math.max(0, num)).toString());
  }, [ratio]);

  const handleChangeLimit = useCallback((e) => {
    const val = e.target.value;
    if (val === "" || /^[0-9\b]+$/.test(val)) setLimitTaken(val);
  }, []);

  const handleBlurLimit = useCallback(() => {
    let num = parseInt(limitTaken, 10);
    if (isNaN(num) || num < 1) num = 1;
    setLimitTaken(num.toString());
  }, [limitTaken]);
  // ------------------------------------------------------------------------------------------------

  const timeWarning = useMemo(() => {
    if (!selectedExam || !startAt || !startAt.isValid() || !expireAt || !expireAt.isValid()) return null;
    const minRequiredExpire = startAt.add(selectedExam.duration, "minute");
    if (expireAt.isBefore(minRequiredExpire)) {
      return `Thời gian đóng đề đang sớm hơn tổng thời gian làm bài (${selectedExam.duration} phút). Hãy điều chỉnh lại để học sinh có đủ thời gian làm bài nhé`;
    }
    return null;
  }, [startAt, expireAt, selectedExam]);

  const handleSubmit = useCallback(async () => {
    if (!selectedExam) return setSnackbar({ open: true, message: "Chọn đề thi ở Cột 1.", severity: "warning" });
    if (selectedClasses.length === 0) return setSnackbar({ open: true, message: "Chọn lớp ở Cột 2.", severity: "warning" });
    if (timeWarning) return setSnackbar({ open: true, message: "Chỉnh lại thời gian đóng đề.", severity: "error" });

    setIsSubmitting(true);
    const payload = {
      startAt: startAt.toISOString(),
      expireAt: expireAt.toISOString(),
      limit_taken: parseInt(limitTaken, 10) || 1, // Đảm bảo luôn gửi số nguyên cho API
      exam_type: examType,
      ...(examType === "test" && { ratio: parseInt(ratio, 10) || 100 }), // Đảm bảo luôn gửi số nguyên cho API
    };

    try {
      await createExamSession(selectedExam.exam_id, selectedClasses.map((c) => c.class_id), payload, token);
      if (isMountedRef.current) {
        setSnackbar({ open: true, message: `Giao bài thành công!`, severity: "success" });
        setSelectedExam(null);
        setSelectedClasses([]);
        setStartAt(dayjs().startOf("minute"));
        setExpireAt(dayjs().add(1, "hour").startOf("minute"));
      }
    } catch (err) {
      if (isMountedRef.current) {
        setSnackbar({ open: true, message: err.response?.data?.message || "Thất bại.", severity: "error" });
      }
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }, [selectedExam, selectedClasses, timeWarning, startAt, expireAt, limitTaken, examType, ratio, token]);


  return (
    <PageWrapper>
      <HeaderBar>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">Giao bài tập và kiểm tra</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>Giao các làm bài mới cho các lớp học của bạn</Typography>
        </Box>
      </HeaderBar>

      <MainContent>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
          <Grid container spacing={3} sx={{ height: "100%", m: 0, width: "100%", alignItems: "stretch" }}>
            
            {/* CỘT 1: CHỌN ĐỀ THI */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pl: "0 !important", py: "0 !important" }}>
              <ColumnCard>
                <CardHeader>
                  <StepBadge active={!!selectedExam}>1</StepBadge>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">CHỌN ĐỀ THI</Typography>
                    <Typography variant="caption" color="text.secondary">Thư viện đề</Typography>
                  </Box>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%" py={4}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : (
                    <>
                      <Autocomplete
                        options={masterExams}
                        getOptionLabel={(option) => option?.title || ""}
                        isOptionEqualToValue={(option, value) => option.exam_id === value.exam_id}
                        getOptionKey={(option) => option.exam_id} 
                        value={selectedExam}
                        onChange={handleSelectExam}
                        renderInput={(params) => <TextField {...params} label="Nhập tên đề thi..." fullWidth size="small" sx={commonInputSx} />}
                        renderOption={(props, option) => {
                          const { key, ...otherProps } = props;
                          return (
                            <Box component="li" key={key} {...otherProps} sx={{ display: "block !important", py: 1.5 }}>
                              <Typography variant="body2" fontWeight={600} noWrap color="text.primary">{option.title}</Typography>
                              <Stack direction="row" spacing={1} mt={1}>
                                <Chip label={`${option.total_ques} câu`} size="small" sx={{ height: 22, fontSize: "0.75rem", fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }} />
                                <Chip label={option.level} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.75rem", fontWeight: 600 }} />
                              </Stack>
                            </Box>
                          );
                        }}
                      />
                      <SectionDivider><Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 1 }}>ĐỀ ĐÃ CHỌN</Typography></SectionDivider>
                      {selectedExam ? (
                        <Box p={2} bgcolor={alpha(theme.palette.primary.main, 0.05)} borderRadius={3} border="1px dashed" borderColor="primary.main">
                          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                            <DescriptionOutlinedIcon sx={{ fontSize: 28, color: "primary.main" }} />
                            <Typography variant="body1" color="primary.main" fontWeight={700}>{selectedExam.title}</Typography>
                          </Box>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip icon={<AccessTimeIcon />} label={`${selectedExam.duration} phút`} size="small" sx={{ bgcolor: "background.paper", fontWeight: 600 }} />
                            <Chip label={`${selectedExam.total_ques} câu`} size="small" sx={{ bgcolor: "background.paper", fontWeight: 600 }} />
                          </Stack>
                        </Box>
                      ) : (
                        <Box textAlign="center" py={4} color="text.disabled">
                          <DescriptionOutlinedIcon sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
                          <Typography variant="body2">Chưa chọn đề</Typography>
                        </Box>
                      )}
                    </>
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
                    <Typography variant="caption" color="text.secondary">Danh sách lớp</Typography>
                  </Box>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%" py={4}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : (
                    <>
                      <Autocomplete
                        multiple
                        options={tutorClasses}
                        getOptionLabel={(option) => option?.classname || ""}
                        isOptionEqualToValue={(option, value) => option.class_id === value.class_id}
                        getOptionKey={(option) => option.class_id}
                        value={selectedClasses}
                        onChange={handleSelectClasses}
                        disableCloseOnSelect
                        renderInput={(params) => <TextField {...params} label="Tìm lớp học..." placeholder="Chọn lớp..." size="small" sx={commonInputSx} />}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                              <Chip key={key} label={option.classname} {...tagProps} size="small" sx={{ m: 0.5, fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }} />
                            );
                          })
                        }
                      />
                      <SectionDivider><Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 1 }}>DANH SÁCH ({selectedClasses.length})</Typography></SectionDivider>
                      {selectedClasses.length > 0 ? (
                        <Stack spacing={1.5}>
                          {selectedClasses.map((cls) => (
                            <Paper key={cls.class_id} variant="outlined" sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5, borderRadius: 2, borderColor: isDark ? theme.palette.midnight?.border : "divider" }}>
                              <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main", fontWeight: 700, fontSize: "1rem" }}>{cls.classname.charAt(0)}</Avatar>
                              <Box flex={1}>
                                <Typography variant="body2" fontWeight={600} color="text.primary">{cls.classname}</Typography>
                                <Typography variant="caption" color="text.secondary">Sĩ số: {cls.nb_of_student || 0}</Typography>
                              </Box>
                            </Paper>
                          ))}
                        </Stack>
                      ) : (
                        <Box textAlign="center" py={4} color="text.disabled">
                          <SchoolOutlinedIcon sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
                          <Typography variant="body2">Chưa chọn lớp</Typography>
                        </Box>
                      )}
                    </>
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
                    <Typography variant="caption" color="text.secondary">Thiết lập cấu hình</Typography>
                  </Box>
                </CardHeader>
                <CardBody>
                  <Stack spacing={2.5}>
                    <FormControl fullWidth size="small" sx={commonInputSx}>
                      <InputLabel>Loại bài tập</InputLabel>
                      <Select value={examType} label="Loại bài tập" onChange={handleChangeExamType}>
                        <MenuItem value="practice">Luyện tập</MenuItem>
                        <MenuItem value="test">Kiểm tra</MenuItem>
                      </Select>
                    </FormControl>

                    {examType === "test" && (
                      <TextField 
                        label="Trọng số điểm" 
                        type="text" 
                        size="small" 
                        value={ratio} 
                        onChange={handleChangeRatio} 
                        onBlur={handleBlurRatio} 
                        InputProps={{ endAdornment: <InputAdornment position="end"><PercentIcon fontSize="small" /></InputAdornment> }} 
                        sx={commonInputSx} 
                      />
                    )}

                    <SectionDivider><Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 1 }}>THỜI GIAN</Typography></SectionDivider>
                    
                    {/* ĐÃ CẬP NHẬT AM/PM Ở ĐÂY VÀ GIỮ NGUYÊN BỐ CỤC MẶC ĐỊNH */}
                    <DesktopDateTimePicker
                      label="Thời gian mở đề"
                      value={startAt}
                      onChange={handleStartAtChange}
                      format="DD/MM/YYYY hh:mm A"  // <-- Đổi sang 12 giờ
                      ampm={true}                  // <-- Bật AM/PM
                      slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "DD/MM/YYYY hh:mm A", inputProps: { readOnly: false }, sx: commonInputSx } }}
                    />
                    
                    <DesktopDateTimePicker
                      label="Thời gian đóng đề"
                      value={expireAt}
                      onChange={handleChangeExpireAt}
                      format="DD/MM/YYYY hh:mm A"  // <-- Đổi sang 12 giờ
                      ampm={true}                  // <-- Bật AM/PM
                      slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "DD/MM/YYYY hh:mm A", inputProps: { readOnly: false }, sx: commonInputSx } }}
                    />
                    {/* -------------------------------------------------------- */}

                    {timeWarning && <Alert severity="warning" sx={{ borderRadius: 2, fontWeight: 500 }}>{timeWarning}</Alert>}
                    
                    <TextField 
                      label="Số lần làm bài tối đa" 
                      type="text" 
                      size="small" 
                      value={limitTaken} 
                      onChange={handleChangeLimit} 
                      onBlur={handleBlurLimit} 
                      InputProps={{ endAdornment: <InputAdornment position="end">lần</InputAdornment> }} 
                      sx={commonInputSx} 
                    />
                  </Stack>
                </CardBody>
                <CardFooter>
                  <Button variant="contained" size="large" fullWidth onClick={handleSubmit} disabled={isSubmitting || !selectedExam || selectedClasses.length === 0 || !!timeWarning} endIcon={!isSubmitting && <SendIcon />} sx={{ py: 1.5, fontWeight: 700, borderRadius: "12px" }}>
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "GIAO BÀI NGAY"}
                  </Button>
                </CardFooter>
              </ColumnCard>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </MainContent>
      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleCloseSnackbar} />
    </PageWrapper>
  );
}

export default memo(AssignmentPage);