import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
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
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// Icons
import SendIcon from "@mui/icons-material/Send";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PercentIcon from "@mui/icons-material/Percent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { getMyExams, createExamSession } from "../../services/ExamService";
import { getClassesByTutor } from "../../services/ClassService";

// --- STYLED COMPONENTS ---

const RootContainer = styled(Box)(({ theme }) => ({
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "transparent",
  overflow: "hidden",
}));

const HeaderBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2),
  backgroundColor: "transparent",
  flexShrink: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const MainContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 10),
  flexGrow: 1,
  maxWidth: 1800,
  margin: "0 auto",
  width: "100%",
}));

const ColumnCard = styled(Paper)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 16,
  border: `2px solid ${theme.palette.divider}`,
  boxShadow: "0px 4px 12px rgba(0,0,0,0.06)",
  transition: "all 0.3s",
  overflow: "hidden",
  "&:hover": {
    boxShadow: "0px 12px 24px rgba(0,0,0,0.12)",
    borderColor: theme.palette.primary.main,
    transform: "translateY(-2px)",
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `2px solid ${theme.palette.divider}`,
  backgroundColor: alpha("#f5f5f5", 0.5),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  flexShrink: 0,
}));

const CardBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  flexGrow: 1,
  overflowY: "auto",
  backgroundColor: "#fff",
  display: "flex",
  flexDirection: "column",
  "&::-webkit-scrollbar": { width: "8px" },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f1f1f1",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#c1c1c1",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#a8a8a8",
    },
  },
}));

const CardFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2.5),
  borderTop: `2px solid ${theme.palette.divider}`,
  backgroundColor: alpha("#fafafa", 0.8),
  flexShrink: 0,
  marginTop: "auto",
}));

const StepBadge = styled(Box)(({ theme, active }) => ({
  width: 36,
  height: 36,
  borderRadius: "10px",
  backgroundColor: active
    ? theme.palette.primary.main
    : theme.palette.grey[200],
  color: active ? "#fff" : theme.palette.text.disabled,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "1rem",
  flexShrink: 0,
  boxShadow: active ? "0 4px 8px rgba(25, 118, 210, 0.3)" : "none",
}));

const SectionDivider = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  margin: theme.spacing(1, 0),
  "&::before, &::after": {
    content: '""',
    flex: 1,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const OuterWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor:
    theme.palette.mode === "light"
      ? theme.palette.grey[50]
      : theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  width: "100%",
  minHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  flex: 1,
}));

function AssignmentPage() {
  const navigate = useNavigate();
  const [token] = useState(() => localStorage.getItem("token"));

  // Data
  const [masterExams, setMasterExams] = useState([]);
  const [tutorClasses, setTutorClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [startAt, setStartAt] = useState(dayjs());
  const [expireAt, setExpireAt] = useState(dayjs().add(1, "hour"));
  const [limitTaken, setLimitTaken] = useState(1);
  const [examType, setExamType] = useState("practice");
  const [ratio, setRatio] = useState(100);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [examsRes, classesRes] = await Promise.all([
        getMyExams(token),
        getClassesByTutor(token),
      ]);
      setMasterExams(Array.isArray(examsRes) ? examsRes : examsRes?.data || []);
      setTutorClasses(
        Array.isArray(classesRes) ? classesRes : classesRes?.data || []
      );
    } catch (err) {
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    setSuccess(null);
    if (!selectedExam) return setError("Vui lòng chọn đề thi ở Cột 1.");
    if (selectedClasses.length === 0)
      return setError("Vui lòng chọn lớp học ở Cột 2.");
    if (examType === "test" && (ratio < 0 || ratio > 100))
      return setError("Trọng số không hợp lệ.");

    setIsSubmitting(true);
    setError(null);

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
      setSuccess(`Đã giao thành công cho ${selectedClasses.length} lớp!`);
      setSelectedExam(null);
      setSelectedClasses([]);
    } catch (err) {
      setError(err.response?.data?.message || "Giao bài thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
  }

  return (
    <RootContainer>
      <OuterWrapper>
        <HeaderBar>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="700"
              color="text.primary"
            >
              Giao bài tập và kiểm tra
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Thiết lập phiên làm bài mới
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, maxWidth: 600, mx: 4 }}>
            {error && (
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{ py: 0.5, fontSize: "0.85rem" }}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert
                severity="success"
                onClose={() => setSuccess(null)}
                sx={{ py: 0.5, fontSize: "0.85rem" }}
              >
                {success}
              </Alert>
            )}
          </Box>
        </HeaderBar>

        <MainContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid
              container
              spacing={5}
              sx={{
                height: "100%",
                flex: 1,
                minHeight: 0,
                alignItems: "stretch",
              }}
            >
              {/* CỘT 1: CHỌN ĐỀ THI */}
              <Grid item xs={12} md={4}>
                <ColumnCard>
                  <CardHeader>
                    <StepBadge active={!!selectedExam}>1</StepBadge>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        CHỌN ĐỀ THI
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tìm kiếm đề mẫu từ thư viện
                      </Typography>
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
                          placeholder="Tìm kiếm..."
                          fullWidth
                          size="small"
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box
                          component="li"
                          {...props}
                          sx={{ display: "block !important", py: 1 }}
                        >
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {option.title}
                          </Typography>
                          <Stack direction="row" spacing={1} mt={0.5}>
                            <Chip
                              label={`${option.total_ques} câu`}
                              size="small"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                            <Chip
                              label={option.level}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          </Stack>
                        </Box>
                      )}
                    />

                    <SectionDivider>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ px: 1 }}
                      >
                        ĐỀ ĐÃ CHỌN
                      </Typography>
                    </SectionDivider>

                    {selectedExam ? (
                      <Box
                        p={1.5}
                        bgcolor="primary.lighter"
                        borderRadius={2}
                        border="1px dashed"
                        borderColor="primary.main"
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1.5}
                          mb={0.5}
                        >
                          <DescriptionOutlinedIcon
                            sx={{ fontSize: 28, color: "primary.main" }}
                          />
                          <Typography
                            variant="body1"
                            color="primary.main"
                            fontWeight={700}
                          >
                            {selectedExam.title}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip
                            icon={<AccessTimeIcon />}
                            label={`${selectedExam.duration} phút`}
                            size="small"
                          />
                          <Chip
                            label={`${selectedExam.total_ques} câu hỏi`}
                            size="small"
                          />
                          <Chip
                            label={selectedExam.level}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    ) : (
                      <Box textAlign="center" py={3} color="text.disabled">
                        <DescriptionOutlinedIcon
                          sx={{ fontSize: 40, opacity: 0.2, mb: 0.5 }}
                        />
                        <Typography variant="body2">
                          Vui lòng chọn đề thi để tiếp tục
                        </Typography>
                      </Box>
                    )}
                  </CardBody>

                  <CardFooter>
                    <Alert
                      severity={selectedExam ? "success" : "info"}
                      icon={selectedExam ? <CheckCircleIcon /> : false}
                      sx={{ py: 0.5, fontSize: "0.8rem" }}
                    >
                      {selectedExam
                        ? "Đã chọn đề thi hợp lệ."
                        : "Chưa chọn đề thi nào."}
                    </Alert>
                  </CardFooter>
                </ColumnCard>
              </Grid>

              {/* CỘT 2: CHỌN LỚP HỌC */}
              <Grid item xs={12} md={4}>
                <ColumnCard>
                  <CardHeader>
                    <StepBadge active={selectedClasses.length > 0}>2</StepBadge>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        CHỌN LỚP HỌC
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Gửi đến một hoặc nhiều lớp
                      </Typography>
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
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option.classname}
                            {...getTagProps({ index })}
                            size="small"
                            sx={{ m: 0.5 }}
                          />
                        ))
                      }
                      disableCloseOnSelect
                    />

                    <SectionDivider>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ px: 1 }}
                      >
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
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              transition: "all 0.2s",
                              "&:hover": {
                                borderColor: "primary.main",
                                bgcolor: "primary.lighter",
                              },
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "primary.light",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                              }}
                            >
                              {cls.classname.charAt(0)}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight={600}>
                                {cls.classname}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Sĩ số: {cls.nb_of_student || 0} học sinh
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Box textAlign="center" py={3} color="text.disabled">
                        <SchoolOutlinedIcon
                          sx={{ fontSize: 40, opacity: 0.2, mb: 0.5 }}
                        />
                        <Typography variant="body2">
                          Chưa có lớp nào được chọn
                        </Typography>
                      </Box>
                    )}
                  </CardBody>

                  <CardFooter>
                    <Alert
                      severity={
                        selectedClasses.length > 0 ? "success" : "warning"
                      }
                      icon={
                        selectedClasses.length > 0 ? <CheckCircleIcon /> : false
                      }
                      sx={{ py: 0.5, fontSize: "0.8rem" }}
                    >
                      {selectedClasses.length > 0
                        ? `Đã chọn ${selectedClasses.length} lớp học.`
                        : "Vui lòng chọn ít nhất 1 lớp."}
                    </Alert>
                  </CardFooter>
                </ColumnCard>
              </Grid>

              {/* CỘT 3: CẤU HÌNH */}
              <Grid item xs={12} md={4}>
                <ColumnCard
                  sx={{
                    borderColor: "primary.main",
                    borderWidth: 3,
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                  }}
                >
                  <CardHeader sx={{ bgcolor: alpha("#1976d2", 0.05) }}>
                    <StepBadge active={true}>3</StepBadge>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        CẤU HÌNH & GIAO
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Thiết lập thông số cuối cùng
                      </Typography>
                    </Box>
                  </CardHeader>

                  <CardBody>
                    <Stack spacing={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Loại bài tập</InputLabel>
                        <Select
                          value={examType}
                          label="Loại bài tập"
                          onChange={(e) => setExamType(e.target.value)}
                        >
                          <MenuItem value="practice">
                            Luyện tập (Không lấy điểm)
                          </MenuItem>
                          <MenuItem value="test">Kiểm tra (Lấy điểm)</MenuItem>
                        </Select>
                      </FormControl>

                      {examType === "test" && (
                        <TextField
                          label="Trọng số điểm"
                          type="number"
                          size="small"
                          value={ratio}
                          onChange={(e) =>
                            setRatio(
                              Math.min(
                                100,
                                Math.max(0, parseInt(e.target.value) || 0)
                              )
                            )
                          }
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <PercentIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          helperText="Điểm bài này chiếm bao nhiêu % tổng kết"
                        />
                      )}

                      <SectionDivider>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                          sx={{ px: 1 }}
                        >
                          THỜI GIAN
                        </Typography>
                      </SectionDivider>

                      <DateTimePicker
                        label="Thời gian mở đề"
                        value={startAt}
                        onChange={(n) => setStartAt(n)}
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                        }}
                      />

                      <DateTimePicker
                        label="Thời gian đóng đề"
                        value={expireAt}
                        onChange={(n) => setExpireAt(n)}
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                        }}
                      />

                      <SectionDivider sx={{ mb: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                          sx={{ px: 1 }}
                        >
                          NÂNG CAO
                        </Typography>
                      </SectionDivider>

                      <TextField
                        label="Số lần làm bài tối đa"
                        type="number"
                        size="small"
                        value={limitTaken}
                        onChange={(e) =>
                          setLimitTaken(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">lần</InputAdornment>
                          ),
                        }}
                      />
                    </Stack>
                  </CardBody>

                  <CardFooter sx={{ bgcolor: "#fff" }}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleSubmit}
                      disabled={
                        isSubmitting ||
                        !selectedExam ||
                        selectedClasses.length === 0
                      }
                      endIcon={!isSubmitting && <SendIcon />}
                      sx={{
                        py: 1,
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                        "&:hover": {
                          boxShadow: "0 6px 16px rgba(25, 118, 210, 0.5)",
                        },
                      }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "GIAO BÀI NGAY"
                      )}
                    </Button>
                  </CardFooter>
                </ColumnCard>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </MainContent>
      </OuterWrapper>
    </RootContainer>
  );
}

export default memo(AssignmentPage);
