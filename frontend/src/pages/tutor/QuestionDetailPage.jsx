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
  Collapse,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import NotesIcon from "@mui/icons-material/Notes";
import InfoIcon from "@mui/icons-material/Info";

import {
  getQuestionById,
  deleteQuestion,
} from "../../services/QuestionService";
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
        "& img": { maxWidth: "100%", height: "auto" },
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
                  fontSize: 20,
                }}
              />
            ) : (
              <StarBorderIcon
                sx={{
                  color: theme.palette.text.disabled,
                  display: "block",
                  fontSize: 20,
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

const ViewHeader = ({
  onBack,
  isOwner,
  onEdit,
  onDelete,
  difficulty,
  type,
}) => (
  <Box
    component={Paper}
    elevation={0}
    square
    sx={{
      display: "flex",
      alignItems: "center",
      p: 2,
      borderBottom: 1,
      borderColor: "divider",
      flexShrink: 0,
      bgcolor: "background.paper",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}
  >
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={onBack}
      sx={{ mr: 2, color: "text.secondary" }}
    >
      Quay lại
    </Button>

    <Typography
      variant="h6"
      fontWeight="bold"
      sx={{ mr: 3, display: { xs: "none", md: "block" } }}
    >
      Chi tiết câu hỏi
    </Typography>

    <Chip
      label={typeMap[type] || type}
      variant="outlined"
      size="small"
      sx={{ mr: 2, fontWeight: 500 }}
    />

    <Box sx={{ flexGrow: 1 }} />

    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mx: 2 }}>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          fontWeight: 500,
          display: { xs: "none", sm: "block" },
        }}
      >
        Độ khó:
      </Typography>
      <DifficultyRatingDisplay value={difficulty} />
    </Box>

    {isOwner && (
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={onEdit}
          size="small"
        >
          Sửa
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          size="small"
        >
          Xóa
        </Button>
      </Stack>
    )}
  </Box>
);

const ViewSidebar = ({
  planInfo,
  categoryInfo,
  status,
  accessMode,
  tutorName,
  explaination,
}) => {
  const [showExplaination, setShowExplaination] = useState(false);
  const hasExplanation =
    explaination &&
    explaination.trim() !== "" &&
    explaination !== "<p><br></p>";
  useEffect(() => {
    if (hasExplanation) setShowExplaination(true);
  }, [hasExplanation]);

  return (
    <Box
      component={Paper}
      elevation={0}
      square
      sx={{
        width: 320,
        borderLeft: 1,
        borderColor: "divider",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          display="flex"
          alignItems="center"
          gap={1}
        >
          <InfoIcon fontSize="small" color="action" /> Thông tin chung
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Giáo án
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {planInfo?.title || "---"}{" "}
            {planInfo?.grade ? `(K${planInfo.grade})` : ""}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Chuyên đề / Danh mục
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {categoryInfo?.category_name || categoryInfo?.name || "---"}
          </Typography>
        </Box>

        <Divider />

        <Box>
          <Typography variant="caption" color="text.secondary">
            Trạng thái
          </Typography>
          <Box mt={0.5}>
            <Chip
              label={
                status === "ready" ? "Sẵn sàng (Ready)" : "Bản nháp (Draft)"
              }
              color={status === "ready" ? "success" : "default"}
              size="small"
              variant="soft"
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Quyền truy cập
          </Typography>
          <Box mt={0.5}>
            <Chip
              label={
                accessMode === "public"
                  ? "Công khai (Public)"
                  : "Riêng tư (Private)"
              }
              color="primary"
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Người tạo
          </Typography>
          <Typography variant="body2">{tutorName}</Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2, pt: 0, mt: "auto", bgcolor: "background.default" }}>
        <Divider sx={{ mb: 2 }} />
        <Button
          fullWidth
          startIcon={<NotesIcon />}
          onClick={() => setShowExplaination(!showExplaination)}
          sx={{
            justifyContent: "flex-start",
            color: showExplaination ? "primary.main" : "text.secondary",
          }}
          disabled={!hasExplanation}
        >
          {hasExplanation
            ? showExplaination
              ? "Ẩn giải thích chi tiết"
              : "Hiện giải thích chi tiết"
            : "Không có giải thích"}
        </Button>

        <Collapse in={showExplaination && hasExplanation}>
          <Paper
            variant="outlined"
            sx={{ p: 2, mt: 1, bgcolor: "#fffde7", borderColor: "#fff59d" }}
          >
            <LatexContent content={explaination} />
          </Paper>
        </Collapse>
      </Box>
    </Box>
  );
};

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    );
  if (!question) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* 1. Header giống Editor */}
      <ViewHeader
        onBack={() => navigate(-1)}
        isOwner={isOwner}
        onEdit={() => navigate(`/tutor/edit-question/${id}`)}
        onDelete={() => setDeleteDialog(true)}
        difficulty={question.level}
        type={question.type}
      />

      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* 2. Main Content (Cột trái) */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: 3,
            overflowY: "auto",
            gap: 3,
          }}
        >
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
            {/* Tiêu đề */}
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="primary.main"
            >
              {question.title || "(Không có tiêu đề)"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Nội dung câu hỏi */}
            <Box sx={{ fontSize: "1.1rem", mb: 4 }}>
              <LatexContent content={question.content} />
            </Box>

            {/* Danh sách đáp án */}
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Các lựa chọn:
            </Typography>
            <Stack spacing={1.5}>
              {question.answers?.map((ans) => (
                <Paper
                  key={ans.aid}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    transition: "all 0.2s",
                    backgroundColor: ans.is_correct
                      ? alpha("#4caf50", 0.08)
                      : "transparent",
                    borderColor: ans.is_correct ? "#4caf50" : "divider",
                    borderWidth: ans.is_correct ? 1 : 1,
                    "&:hover": {
                      borderColor: ans.is_correct ? "#4caf50" : "primary.main",
                      boxShadow: 1,
                    },
                  }}
                >
                  <Box mr={2} display="flex" alignItems="center">
                    {ans.is_correct ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon color="disabled" />
                    )}
                  </Box>
                  <Box flexGrow={1}>
                    <LatexContent content={ans.content} />
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Box>

        {/* 3. Sidebar (Cột phải) */}
        <ViewSidebar
          planInfo={planInfo}
          categoryInfo={question.category}
          status={question.status}
          accessMode={question.accessMode}
          tutorName={`${question.tutor?.user?.lname || ""} ${
            question.tutor?.user?.fname || ""
          }`}
          explaination={question.explaination}
        />
      </Box>

      {/* Dialog Confirm Delete */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể
            hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={isDeleting}>
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionDetailPage;
