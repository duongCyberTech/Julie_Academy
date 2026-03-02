import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  Tooltip,
  Paper,
  InputLabel,
  Alert,
  Collapse,
  CircularProgress,
  TextField,
  Stack,
  Grid,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import SaveIcon from "@mui/icons-material/Save";
import NotesIcon from "@mui/icons-material/Notes";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { createQuestion } from "../../services/QuestionService";
import {
  getPlansByTutor,
  getAllCategories,
} from "../../services/CategoryService";
import MultipleChoiceEditor from "../../components/QuestionType/MultipleChoice";
import RichTextEditor from "../../components/RichTextEditor";
import AppSnackbar from "../../components/SnackBar";

// ==========================================
// 1. STYLED COMPONENTS (SOFT UI)
// ==========================================
const PageWrapper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(4),
  backgroundColor: theme.palette.mode === "light" ? "#ffffff" : theme.palette.background.paper,
  borderRadius: "24px",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
  minHeight: "calc(100vh - 120px)",
  display: "flex",
  flexDirection: "column",
}));

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(3),
  flexShrink: 0,
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "16px",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  backgroundColor: alpha(theme.palette.background.default, 0.6),
  marginBottom: theme.spacing(3),
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    borderColor: theme.palette.primary.light,
  },
}));

// ==========================================
// 2. CÁC COMPONENT PHỤ TRỢ
// ==========================================
const DifficultyRating = ({ value, onChange }) => {
  const theme = useTheme();
  const levels = [
    { value: "easy", label: "Dễ", stars: 1 },
    { value: "medium", label: "Trung bình", stars: 2 },
    { value: "hard", label: "Khó", stars: 3 },
  ];
  const currentLevel = levels.find((l) => l.value === value) || levels[0];

  return (
    <Tooltip title={`Độ khó: ${currentLevel.label}`}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", py: 1 }}>
        {[1, 2, 3].map((star) => (
          <Box key={star} component="span" onClick={() => onChange(levels[star - 1].value)}>
            {star <= currentLevel.stars ? (
              <StarIcon sx={{ color: theme.palette.warning.main, display: "block" }} />
            ) : (
              <StarBorderIcon sx={{ color: theme.palette.text.disabled, display: "block" }} />
            )}
          </Box>
        ))}
      </Box>
    </Tooltip>
  );
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function CreateNewQuestionPage() {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem("token"));

  const userInfo = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch (e) {
      return null;
    }
  }, [token]);

  // Form States
  const [questionType, setQuestionType] = useState("single_choice");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [accessMode, setAccessMode] = useState("private");
  const [status, setStatus] = useState("ready");

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [answerData, setAnswerData] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // Lấy danh sách Giáo án
  useEffect(() => {
    const fetchPlans = async () => {
      if (!token || !userInfo?.sub) {
        setApiError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        setLoadingPlans(false);
        return;
      }
      try {
        setLoadingPlans(true);
        const tutorPlans = await getPlansByTutor(userInfo.sub, token);
        setPlans(Array.isArray(tutorPlans) ? tutorPlans : []);
        setApiError(null);
      } catch (err) {
        setApiError("Lỗi tải danh sách giáo án.");
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [token, userInfo]);

  // Lấy danh mục khi chọn Giáo án
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedPlanId || !token) {
        setCategories([]);
        return;
      }
      try {
        setLoadingCategories(true);
        setApiError(null);
        const catData = await getAllCategories({ plan_id: selectedPlanId, mode: "tree" }, token);
        let nodes = [];
        if (Array.isArray(catData)) {
          nodes = catData;
        } else if (catData?.data) {
          nodes = Array.isArray(catData.data) ? catData.data : [catData.data];
        } else if (catData?.categories) {
          nodes = Array.isArray(catData.categories) ? catData.categories : [catData.categories];
        }
        setCategories(nodes);
      } catch (err) {
        setApiError("Lỗi tải danh mục cho giáo án này.");
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [selectedPlanId, token]);

  // Sinh cây chuyên đề
  const categoryTreeData = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const getItemId = (itm) => String(itm.id ?? itm.category_id ?? itm._id ?? "");
    const getParentId = (itm) => {
      const pid = itm.parent_id ?? itm.parentId ?? itm.parent_category_id;
      if (!pid || pid === 0 || String(pid) === "0" || String(pid) === "null") return null;
      return String(pid);
    };

    const parentMap = new Map();
    const allItemIds = new Set(categories.map(getItemId));

    categories.forEach((item) => {
      const pid = getParentId(item);
      if (pid && !allItemIds.has(pid)) {
        if (!parentMap.has(pid)) {
          parentMap.set(pid, {
            id: pid,
            category_id: pid,
            category_name: item.description || "Danh mục gốc",
            parent_id: null,
            isFake: true,
          });
        }
      }
    });

    const allNodes = [...Array.from(parentMap.values()), ...categories];

    const buildTree = (items, targetParentId = null) => {
      return items
        .filter((item) => getParentId(item) === targetParentId)
        .map((item) => {
          const itemId = getItemId(item);
          return {
            id: itemId,
            label: String(item.name ?? item.category_name ?? "No Name"),
            children: buildTree(items, itemId),
          };
        });
    };

    return buildTree(allNodes, null);
  }, [categories]);

  const handlePlanChange = (e) => {
    setSelectedPlanId(e.target.value);
    setCategories([]);
    setSelectedCategoryId("");
  };

  const handleTreeSelection = (event, selectedItems) => {
    const selectedId = Array.isArray(selectedItems)
      ? (selectedItems.length > 0 ? selectedItems[0] : "")
      : (selectedItems ?? "");
    setSelectedCategoryId(selectedId);
  };

  // Khởi tạo đáp án khi đổi loại câu hỏi
  useEffect(() => {
    const initialAnswers = Array.from({ length: 4 }, () => ({
      id: uuidv4(),
      content: "",
      isCorrect: false,
      explanation: "",
    }));
    if (["multiple_choice", "single_choice"].includes(questionType)) {
      setAnswerData(initialAnswers);
    } else {
      setAnswerData([]);
    }
  }, [questionType]);

  const handleSubmit = async () => {
    setApiError(null);
    if (!token || !userInfo?.sub) {
      setToast({ open: true, message: "Phiên đăng nhập hết hạn.", severity: "error" });
      return;
    }
    if (!title.trim()) {
      setToast({ open: true, message: "Vui lòng nhập tiêu đề câu hỏi.", severity: "warning" });
      return;
    }
    if (!content.trim() || content === "<p><br></p>") {
      setToast({ open: true, message: "Vui lòng nhập nội dung câu hỏi.", severity: "warning" });
      return;
    }
    if (!selectedPlanId) {
      setToast({ open: true, message: "Vui lòng chọn giáo án.", severity: "warning" });
      return;
    }
    if (!selectedCategoryId) {
      setToast({ open: true, message: "Vui lòng chọn chuyên đề/danh mục.", severity: "warning" });
      return;
    }

    const payload = {
      title,
      content,
      explanation,
      type: questionType,
      level: difficulty,
      categoryId: selectedCategoryId,
      accessMode: accessMode,
      status: status,
      tutorId: userInfo.sub,
      answers: answerData
        .filter((a) => a.content.trim() !== "" && a.content !== "<p><br></p>")
        .map(({ id, ...rest }) => rest),
    };

    setIsSubmitting(true);
    try {
      await createQuestion(userInfo.sub, [payload], token);
      setToast({ open: true, message: "Tạo câu hỏi thành công!", severity: "success" });
      navigate("/tutor/question");
    } catch (error) {
      const msg = "Lỗi tạo câu hỏi: " + (error.response?.data?.message || error.message);
      setApiError(msg);
      setToast({ open: true, message: "Tạo câu hỏi thất bại.", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <Header>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Tạo câu hỏi mới
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{ fontWeight: "bold", borderRadius: "10px", px: 3 }}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu câu hỏi"}
        </Button>
      </Header>

      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionPaper>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Nội dung câu hỏi
            </Typography>
            <TextField
              label="Tiêu đề câu hỏi"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề ngắn gọn..."
              sx={{ mb: 3, bgcolor: "background.paper", borderRadius: 1 }}
            />
            <Typography variant="body2" fontWeight={500} mb={1} color="text.secondary">
              Nội dung chi tiết:
            </Typography>
            <RichTextEditor
              placeholder="Nhập nội dung câu hỏi tại đây..."
              value={content}
              onChange={setContent}
              toolbarType="full"
              style={{ minHeight: "200px", display: "flex", flexDirection: "column" }}
            />
          </SectionPaper>

          <SectionPaper>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Đáp án
              </Typography>
              <FormControl size="small" sx={{ minWidth: 220, bgcolor: "background.paper" }}>
                <Select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                  <MenuItem value="single_choice">Nhiều lựa chọn - 1 đáp án</MenuItem>
                  <MenuItem value="multiple_choice">Nhiều lựa chọn - nhiều đáp án</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <MultipleChoiceEditor
              questionType={questionType}
              answerData={answerData}
              setAnswerData={setAnswerData}
            />
          </SectionPaper>

          <SectionPaper>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                Giải thích chi tiết
              </Typography>
              <Button
                startIcon={<NotesIcon />}
                onClick={() => setShowExplanation(!showExplanation)}
                color={showExplanation ? "primary" : "inherit"}
              >
                {showExplanation ? "Ẩn giải thích" : "Thêm giải thích"}
              </Button>
            </Box>
            <Collapse in={showExplanation}>
              <Box pt={3}>
                <RichTextEditor
                  placeholder="Nhập giải thích chi tiết..."
                  value={explanation}
                  onChange={setExplanation}
                  toolbarType="full"
                  style={{ minHeight: "150px", display: "flex", flexDirection: "column" }}
                />
              </Box>
            </Collapse>
          </SectionPaper>
        </Grid>

        {/* CỘT PHẢI: PHÂN LOẠI & CÀI ĐẶT */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionPaper>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Phân loại
            </Typography>
            <Stack spacing={3}>
              <FormControl fullWidth size="small" disabled={loadingPlans}>
                <InputLabel>Giáo án</InputLabel>
                <Select
                  value={selectedPlanId}
                  label="Giáo án"
                  onChange={handlePlanChange}
                  sx={{ bgcolor: "background.paper" }}
                >
                  <MenuItem value="">
                    <em>{loadingPlans ? "Đang tải giáo án..." : "Chọn giáo án"}</em>
                  </MenuItem>
                  {plans.map((plan) => (
                    <MenuItem key={plan.plan_id} value={plan.plan_id}>
                      {`${plan.title} (Lớp ${plan.grade})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Collapse in={!!selectedPlanId}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  Chuyên đề / Danh mục
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    maxHeight: 300,
                    overflowY: "auto",
                    p: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  {loadingCategories ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : categoryTreeData.length > 0 ? (
                    <RichTreeView
                      items={categoryTreeData}
                      slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
                      onSelectedItemsChange={handleTreeSelection}
                      selectedItems={selectedCategoryId ? [String(selectedCategoryId)] : []}
                      sx={{
                        "& .MuiTreeItem-content": {
                          py: 0.5,
                          borderRadius: 1,
                          "&:hover": { backgroundColor: "action.hover" },
                          "&.Mui-selected": {
                            backgroundColor: "primary.light",
                            "&:hover": { backgroundColor: "primary.light" },
                          },
                        },
                      }}
                    />
                  ) : (
                    <Typography variant="caption" sx={{ p: 2, display: "block", color: "text.secondary" }}>
                      {selectedPlanId ? "Giáo án này chưa có danh mục." : "Vui lòng chọn giáo án."}
                    </Typography>
                  )}
                </Paper>
              </Collapse>
            </Stack>
          </SectionPaper>

          <SectionPaper>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Cài đặt thuộc tính
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Độ khó
                </Typography>
                <DifficultyRating value={difficulty} onChange={setDifficulty} />
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Quyền xem</InputLabel>
                <Select
                  value={accessMode}
                  label="Quyền xem"
                  onChange={(e) => setAccessMode(e.target.value)}
                  sx={{ bgcolor: "background.paper" }}
                >
                  <MenuItem value="private">Riêng tư (Private)</MenuItem>
                  <MenuItem value="public">Công khai (Public)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={status}
                  label="Trạng thái"
                  onChange={(e) => setStatus(e.target.value)}
                  sx={{ bgcolor: "background.paper" }}
                >
                  <MenuItem value="draft">Bản nháp (Draft)</MenuItem>
                  <MenuItem value="ready">Sẵn sàng (Ready)</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </SectionPaper>
        </Grid>
      </Grid>

      <AppSnackbar
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={(e, reason) => {
          if (reason !== "clickaway") setToast((prev) => ({ ...prev, open: false }));
        }}
      />
    </PageWrapper>
  );
}