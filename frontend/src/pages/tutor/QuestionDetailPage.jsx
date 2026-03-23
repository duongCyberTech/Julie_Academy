import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import katex from "katex";
import "katex/dist/katex.min.css";
import renderMathInElement from "katex/dist/contrib/auto-render";

import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Chip,
  useTheme,
  Grid,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import InfoIcon from "@mui/icons-material/Info";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";

import {
  getQuestionById,
  deleteQuestion,
} from "../../services/QuestionService";

// ==========================================
// 1. STYLED COMPONENTS (CHUẨN DESIGN SYSTEM)
// ==========================================
const PageWrapper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    margin: theme.spacing(3),
    padding: theme.spacing(5),
    backgroundColor: isDark ? theme.palette.background.paper : '#F9FAFB',
    backgroundImage: 'none',
    borderRadius: '24px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border || alpha(theme.palette.divider, 0.3) : alpha(theme.palette.divider, 0.3)}`,
    boxShadow: isDark 
      ? `0 0 40px ${alpha(theme.palette.primary.main, 0.03)}` 
      : '0 8px 48px rgba(0,0,0,0.03)',
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
  };
});

const HeaderBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(4),
  flexShrink: 0,
}));

const SectionPaper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    padding: theme.spacing(3),
    borderRadius: '16px',
    border: `1px solid ${isDark ? theme.palette.midnight?.border || alpha(theme.palette.divider, 0.6) : theme.palette.divider}`,
    backgroundColor: isDark ? alpha(theme.palette.background.default, 0.4) : theme.palette.background.paper,
    backgroundImage: 'none',
    marginBottom: theme.spacing(3),
    transition: "all 0.3s ease",
    boxShadow: isDark ? 'none' : '0px 2px 8px rgba(0,0,0,0.02)',
    "&:hover": {
      transform: 'translateY(-2px)',
      boxShadow: isDark
        ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`
        : '0px 12px 24px rgba(0,0,0,0.06)',
      borderColor: theme.palette.primary.main,
    },
  };
});

// ==========================================
// 2. PHỤ TRỢ COMPONENTS
// ==========================================
const LatexContent = ({ content, className }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && content) {
      containerRef.current.innerHTML = content;
      const quillFormulas =
        containerRef.current.querySelectorAll(".ql-formula");
      quillFormulas.forEach((span) => {
        const latex = span.getAttribute("data-value");
        if (latex) {
          try {
            katex.render(latex, span, {
              throwOnError: false,
              errorColor: "#cc0000",
            });
          } catch (e) {
            console.error(e);
          }
        }
      });
      try {
        renderMathInElement(containerRef.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
          ],
          throwOnError: false,
          errorColor: "#cc0000",
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: 1.6,
        fontSize: "1rem",
        wordBreak: "break-word",
        "& img": { maxWidth: "100%", height: "auto", borderRadius: "8px" },
      }}
    />
  );
};

const DifficultyRatingDisplay = ({ value }) => {
  const theme = useTheme();
  const levels = [
    { value: "easy", label: "Dễ", stars: 1 },
    { value: "medium", label: "Trung bình", stars: 2 },
    { value: "hard", label: "Khó", stars: 3 },
  ];
  const normalizedValue = String(value).toLowerCase();
  const currentLevel =
    levels.find((l) => l.value === normalizedValue) || levels[0];

  return (
    <Tooltip title={`Độ khó: ${currentLevel.label}`}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {[1, 2, 3].map((star) => (
          <Box key={star} component="span">
            {star <= currentLevel.stars ? (
              <StarIcon
                sx={{
                  color: theme.palette.warning.main,
                  display: "block",
                  fontSize: 24,
                }}
              />
            ) : (
              <StarBorderIcon
                sx={{
                  color: theme.palette.text.disabled,
                  display: "block",
                  fontSize: 24,
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Tooltip>
  );
};

const typeMap = {
  single_choice: "Trắc nghiệm (1 đáp án)",
  multiple_choice: "Trắc nghiệm (N đáp án)",
  essay: "Tự luận",
  true_false: "Đúng / Sai",
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [token] = useState(localStorage.getItem("token"));

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const userInfo = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch (e) {
      return null;
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await getQuestionById(id, token);
        setQuestion(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải chi tiết câu hỏi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  const isOwner = useMemo(() => {
    if (!question || !userInfo) return false;
    const ownerId = question.tutor?.user?.uid || question.tutor_id;
    return ownerId === userInfo.sub;
  }, [question, userInfo]);

  const planInfo = useMemo(() => {
    if (!question?.category) return null;
    let structures = question.category.structure;
    if (!structures || (Array.isArray(structures) && structures.length === 0)) {
      structures = question.category.Categories?.structure;
    }
    if (Array.isArray(structures) && structures.length > 0) {
      return structures[0].Plan;
    }
    return null;
  }, [question]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteQuestion(id, token);
      navigate("/tutor/question");
    } catch (err) {
      alert("Xóa thất bại: " + (err.message || "Lỗi không xác định"));
      setDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading)
    return (
      <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2, fontWeight: 700 }}>
          Quay lại
        </Button>
      </Box>
    );

  if (!question) return null;

  const hasExplanation =
    question.explaination &&
    question.explaination.trim() !== "" &&
    question.explaination !== "<p><br></p>";

  return (
    <PageWrapper>
      {/* HEADER */}
      <HeaderBar direction={{ xs: 'column', md: 'row' }}>
        <Box mb={{ xs: 2, md: 0 }}>
          <Typography variant="h4" fontWeight="700" color="text.primary">
            Chi tiết câu hỏi
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.95rem", mt: 0.5, display: "block" }}>
            Xem lại nội dung và cấu hình của câu hỏi
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            color="inherit"
            sx={{ borderRadius: "10px", fontWeight: 700 }}
          >
            Quay lại
          </Button>

          {isOwner && (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/tutor/edit-question/${id}`)}
                sx={{ borderRadius: "12px", fontWeight: 700 }}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialog(true)}
                sx={{ borderRadius: "12px", fontWeight: 700 }}
              >
                Xóa
              </Button>
            </>
          )}
        </Stack>
      </HeaderBar>

      <Grid container spacing={3}>
        {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* NỘI DUNG CÂU HỎI */}
          <SectionPaper>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={2}
            >
              <Typography variant="h5" fontWeight="700" color="primary.main">
                {question.title || "(Không có tiêu đề)"}
              </Typography>
              <Chip
                label={typeMap[question.type] || question.type}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600, borderRadius: '8px' }}
              />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ fontSize: "1.1rem" }}>
              <LatexContent content={question.content} />
            </Box>
          </SectionPaper>

          {/* ĐÁP ÁN */}
          <SectionPaper>
            <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mb: 2 }}>
              Các lựa chọn đáp án
            </Typography>
            <Stack spacing={2}>
              {question.answers?.map((ans) => (
                <Paper
                  key={ans.aid}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "12px",
                    backgroundColor: ans.is_correct
                      ? alpha(theme.palette.success.main, 0.08)
                      : "background.paper",
                    borderColor: ans.is_correct ? "success.main" : "divider",
                    borderWidth: ans.is_correct ? 2 : 1,
                  }}
                >
                  <Box mr={2} display="flex" alignItems="center">
                    {ans.is_correct ? (
                      <CheckCircleIcon color="success" fontSize="large" />
                    ) : (
                      <RadioButtonUncheckedIcon
                        color="disabled"
                        fontSize="large"
                      />
                    )}
                  </Box>
                  <Box flexGrow={1}>
                    <LatexContent content={ans.content} />
                  </Box>
                </Paper>
              ))}
            </Stack>
          </SectionPaper>

          {/* GIẢI THÍCH (Nếu có) */}
          {hasExplanation && (
            <SectionPaper sx={{ 
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.1) : "#fffde7", 
              borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.3) : "#fff59d" 
            }}>
              <Typography
                variant="h6"
                fontWeight="700"
                gutterBottom
                color="text.secondary"
              >
                Giải thích chi tiết
              </Typography>
              <Box mt={2}>
                <LatexContent content={question.explaination} />
              </Box>
            </SectionPaper>
          )}
        </Grid>

        {/* CỘT PHẢI: THÔNG TIN VÀ CÀI ĐẶT */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* THÔNG TIN CHUNG */}
          <SectionPaper>
            <Typography
              variant="h6"
              fontWeight={700}
              display="flex"
              alignItems="center"
              gap={1}
              mb={3}
            >
              <InfoIcon color="primary" /> Thông tin chung
            </Typography>
            <Stack spacing={3}>
              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <MenuBookIcon color="action" />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Giáo án
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {planInfo?.title || "---"}{" "}
                    {planInfo?.grade ? `(K${planInfo.grade})` : ""}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <CategoryIcon color="action" />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Chuyên đề / Danh mục
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {question.category?.category_name ||
                      question.category?.name ||
                      "---"}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <PersonIcon color="action" />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Người tạo
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {[
                      question.tutor?.user?.lname,
                      question.tutor?.user?.mname,
                      question.tutor?.user?.fname,
                    ]
                      .filter(Boolean)
                      .join(" ") || "---"}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </SectionPaper>

          {/* THUỘC TÍNH */}
          <SectionPaper>
            <Typography variant="h6" fontWeight={700} mb={3}>
              Thuộc tính câu hỏi
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={0.5}
                >
                  Độ khó
                </Typography>
                <DifficultyRatingDisplay value={question.level} />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Trạng thái
                </Typography>
                <Chip
                  label={
                    question.status === "ready"
                      ? "Sẵn sàng (Ready)"
                      : "Bản nháp (Draft)"
                  }
                  color={question.status === "ready" ? "success" : "default"}
                  variant="filled"
                  sx={{ fontWeight: 600, borderRadius: "8px" }}
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Quyền truy cập
                </Typography>
                <Chip
                  label={
                    question.accessMode === "public"
                      ? "Công khai (Public)"
                      : "Riêng tư (Private)"
                  }
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    borderRadius: "8px",
                    bgcolor: "background.paper",
                  }}
                />
              </Box>
            </Stack>
          </SectionPaper>
        </Grid>
      </Grid>

      {/* DIALOG XÁC NHẬN XÓA */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
            disabled={isDeleting}
            sx={{ fontWeight: 700, borderRadius: '10px' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            sx={{ borderRadius: "10px", fontWeight: 700 }}
          >
            {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};

export default QuestionDetailPage;