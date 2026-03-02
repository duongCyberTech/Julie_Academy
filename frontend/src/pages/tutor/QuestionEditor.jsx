import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import {
  Box, Typography, Button, FormControl, Select, MenuItem, Divider,
  useTheme, Tooltip, Paper, InputLabel, Alert, Collapse, CircularProgress,
  TextField, Backdrop, Autocomplete, Stack, Grid
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import NotesIcon from "@mui/icons-material/Notes";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import { createQuestion, getQuestionById, updateQuestion } from "../../services/QuestionService";
import { getPlansByTutor, getAllCategories } from "../../services/CategoryService";

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
// 2. PHỤ TRỢ COMPONENTS
// ==========================================
const DifficultyRating = React.memo(({ value, onChange }) => {
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
});

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function QuestionEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [token] = useState(() => localStorage.getItem("token"));
  const userInfo = useMemo(() => (token ? jwtDecode(token) : null), [token]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    explaination: "",
    difficulty: "easy",
    questionType: "single_choice",
    accessMode: "private",
    status: "ready",
    selectedPlanId: "",
    selectedCategoryId: "",
    categoryName: "",
    planName: "" // Lưu tên giáo án để hiển thị siêu tốc
  });
  
  const [answerData, setAnswerData] = useState([]);
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [deferredRender, setDeferredRender] = useState(false);
  const [showExplaination, setShowExplaination] = useState(false);

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => {
        if (prev[field] === value) return prev;
        return { ...prev, [field]: value };
    });
  }, []);

  const fetchCategoriesByPlan = useCallback(async (planId) => {
    if (!planId || !token) return;
    setLoadingCategories(true);
    try {
      const res = await getAllCategories({ plan_id: planId, mode: "tree" }, token);
      let nodes = [];
      if (Array.isArray(res)) nodes = res;
      else if (res?.data) nodes = Array.isArray(res.data) ? res.data : [res.data];
      setCategories(nodes); 
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [token]);

  useEffect(() => {
    const initPageData = async () => {
      if (!token || !userInfo?.sub) return;
      setIsInitializing(true);
      setDeferredRender(false); 

      try {
        const plansPromise = getPlansByTutor(userInfo.sub, token);
        const questionPromise = isEditMode ? getQuestionById(id, token) : Promise.resolve(null);
        
        const [plansRes, questionData] = await Promise.all([plansPromise, questionPromise]);

        const plansList = Array.isArray(plansRes) ? plansRes : plansRes?.data || [];
        setPlans(plansList);

        if (questionData) {
            const catObj = questionData.category || {};
            const correctCategoryId = catObj.category_id || questionData.category_id || "";
            const correctCategoryName = catObj.category_name || catObj.name || "Danh mục cũ";

            let detectedPlanId = "";
            let extractedPlanName = "Đang tải...";

            // Bắt chước logic lấy cục Plan siêu nhanh từ QuestionDetailPage
            let structures = catObj.structure;
            if (!structures || (Array.isArray(structures) && structures.length === 0)) {
              structures = catObj.Categories?.structure;
            }
            if (Array.isArray(structures) && structures.length > 0 && structures[0].Plan) {
              const planData = structures[0].Plan;
              detectedPlanId = planData.plan_id;
              extractedPlanName = `${planData.title} ${planData.grade ? `(K${planData.grade})` : ""}`;
            } else if (catObj.plan_id) {
              detectedPlanId = catObj.plan_id;
            }

            let initialAnswers = [];
            if (questionData.answers && Array.isArray(questionData.answers)) {
                initialAnswers = questionData.answers.map(ans => ({
                    id: ans.aid || ans.id || uuidv4(),
                    content: ans.content || "",
                    isCorrect: ans.is_correct,
                    explaination: ans.explaination || ""
                }));
            }

            setFormData({
                title: questionData.title || "",
                content: questionData.content || "",
                explaination: questionData.explaination || "",
                difficulty: questionData.level || "easy",
                questionType: questionData.type || "single_choice",
                accessMode: questionData.accessMode || "private",
                status: questionData.status || "ready",
                selectedPlanId: detectedPlanId || "",
                selectedCategoryId: correctCategoryId ? String(correctCategoryId) : "",
                categoryName: correctCategoryName,
                planName: extractedPlanName // Gán tên giáo án lấy trực tiếp từ data câu hỏi
            });
            
            setAnswerData(initialAnswers);
            
            if (questionData.explaination && questionData.explaination.trim() !== "" && questionData.explaination !== "<p><br></p>") {
                setShowExplaination(true);
            }
        } else {
            setAnswerData(Array.from({ length: 4 }, () => ({
                id: uuidv4(), content: "", isCorrect: false, explaination: ""
            })));
        }
      } catch (err) {
        console.error("Init Error:", err);
        setApiError("Không thể tải dữ liệu.");
      } finally {
        setIsInitializing(false);
        setTimeout(() => setDeferredRender(true), 100);
      }
    };

    initPageData();
  }, [token, userInfo, isEditMode, id, fetchCategoriesByPlan]);

  const handlePlanChange = useCallback((e) => {
    const newPlanId = e.target.value;
    handleFieldChange('selectedPlanId', newPlanId);
    handleFieldChange('selectedCategoryId', "");
    setCategories([]);
    if (newPlanId) fetchCategoriesByPlan(newPlanId);
  }, [handleFieldChange, fetchCategoriesByPlan]);

  const categoryTreeData = useMemo(() => {
    if (isEditMode) return [];

    let flattenedCategories = [];
    if (Array.isArray(categories)) {
      categories.forEach(item => {
        if (Array.isArray(item)) flattenedCategories = flattenedCategories.concat(item);
        else if (item && (item.id || item.category_id)) flattenedCategories.push(item);
      });
    }
    if (flattenedCategories.length === 0) return [];
    
    const parentMap = new Map();
    flattenedCategories.forEach(item => {
      const parentId = item.parent_id ?? item.parentId ?? item.parent_category_id;
      const description = item.description;
      if (parentId && !parentMap.has(parentId)) {
        const exists = flattenedCategories.some(cat => String(cat.id ?? cat.category_id) === String(parentId));
        if (!exists) parentMap.set(parentId, description || 'Danh mục cha');
      }
    });
    
    const parentNodes = Array.from(parentMap.entries()).map(([parentId, description]) => ({
      id: String(parentId), category_id: String(parentId), category_name: description, parent_id: null, isParent: true,
    }));
  
    const allNodes = [...parentNodes, ...flattenedCategories];
    const buildTree = (items, parentId = null) => {
      const filtered = items.filter(item => {
        const itemParentId = item.parent_id ?? item.parentId ?? item.parent_category_id;
        if (parentId === null) return itemParentId === null || itemParentId === undefined;
        return String(itemParentId) === String(parentId);
      });
      return filtered.map(item => {
        const id = item.id ?? item.category_id;
        const name = item.name ?? item.category_name ?? "Không có tên";
        return { id: String(id), label: name, children: buildTree(items, id) };
      });
    };
    return buildTree(allNodes);
  }, [categories, isEditMode]); 

  const handleTreeSelection = (event, selectedItems) => {
    const selectedId = Array.isArray(selectedItems) ? (selectedItems[0] || "") : (selectedItems || "");
    if (selectedId !== formData.selectedCategoryId) {
        handleFieldChange('selectedCategoryId', selectedId);
    }
  };

  const showToast = (message, severity) => setToast({ open: true, message, severity });

  const handleSubmit = async () => {
    setApiError(null);
    const { title, content, selectedPlanId, selectedCategoryId, questionType, difficulty, accessMode, status, explaination } = formData;

    if (!title.trim()) return showToast("Vui lòng nhập tiêu đề.", "warning");
    if (!content.trim() || content === "<p><br></p>") return showToast("Vui lòng nhập nội dung.", "warning");
    if (!isEditMode) {
        if (!selectedPlanId) return showToast("Vui lòng chọn giáo án.", "warning");
        if (!selectedCategoryId) return showToast("Vui lòng chọn danh mục.", "warning");
    }
    
    const validAnswers = answerData.filter(a => a.content.trim() !== "" && a.content !== "<p><br></p>");
    if (validAnswers.length < 2) return showToast("Cần ít nhất 2 đáp án.", "warning");
    if (!validAnswers.some(a => a.isCorrect)) return showToast("Cần chọn ít nhất 1 đáp án đúng.", "warning");

    const payload = {
      title, content, explaination,
      type: questionType, level: difficulty,
      categoryId: selectedCategoryId || undefined, 
      accessMode, status,
      tutorId: userInfo.sub,
      answers: validAnswers.map(a => ({
        id: a.id, content: a.content, isCorrect: a.isCorrect, explaination: a.explaination
      })),
    };

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateQuestion(id, payload, token);
        showToast("Cập nhật thành công!", "success");
      } else {
        await createQuestion(userInfo.sub, [payload], token);
        showToast("Tạo mới thành công!", "success");
      }
      setTimeout(() => {
          if(isEditMode) navigate(`/tutor/question/${id}`);
          else navigate("/tutor/question");
      }, 1000);
    } catch (error) {
      setApiError(error.response?.data?.message || "Có lỗi xảy ra.");
      showToast("Lưu thất bại.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
      return (
          <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
              <CircularProgress color="inherit" />
          </Backdrop>
      );
  }

  return (
    <PageWrapper>
      {/* HEADER */}
      <Header>
        <Box display="flex" alignItems="center" gap={2}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} color="inherit">
            Quay lại
          </Button>
          <Typography variant="h5" fontWeight="bold" sx={{ display: { xs: 'none', md: 'block' } }}>
            {isEditMode ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
          </Typography>
        </Box>
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

      {apiError && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError(null)}>{apiError}</Alert>}

      <Grid container spacing={3}>
        {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
        <Grid size={{ xs: 12, md: 8 }}>
          
          <SectionPaper>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Nội dung câu hỏi
            </Typography>
            <TextField
              label="Tiêu đề câu hỏi" variant="outlined" fullWidth
              value={formData.title} onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Nhập tiêu đề ngắn gọn..."
              sx={{ mb: 3, bgcolor: "background.paper", borderRadius: 1 }}
            />
            <Box sx={{ minHeight: "250px" }}>
                <Typography variant="body2" fontWeight={500} mb={1} color="text.secondary">Nội dung chi tiết:</Typography>
                {deferredRender ? (
                    <RichTextEditor
                        value={formData.content} onChange={(val) => handleFieldChange('content', val)}
                        toolbarType="full" style={{ minHeight: "250px", display: "flex", flexDirection: "column" }}
                    />
                ) : (
                    <Box sx={{ height: 250, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải trình soạn thảo...
                    </Box>
                )}
            </Box>
          </SectionPaper>

          <SectionPaper>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Cấu hình đáp án
              </Typography>
              <FormControl size="small" sx={{ minWidth: 220, bgcolor: "background.paper" }}>
                <Select value={formData.questionType} onChange={(e) => handleFieldChange('questionType', e.target.value)} displayEmpty>
                  <MenuItem value="single_choice">Trắc nghiệm - 1 đáp án</MenuItem>
                  <MenuItem value="multiple_choice">Trắc nghiệm - nhiều đáp án</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {deferredRender ? (
                <MultipleChoiceEditor questionType={formData.questionType} answerData={answerData} setAnswerData={setAnswerData} />
            ) : null}
          </SectionPaper>

          <SectionPaper>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                Giải thích chi tiết
              </Typography>
              <Button
                startIcon={<NotesIcon />}
                onClick={() => setShowExplaination(!showExplaination)}
                color={showExplaination ? "primary" : "inherit"}
              >
                {showExplaination ? "Ẩn giải thích" : "Thêm giải thích"}
              </Button>
            </Box>
            <Collapse in={showExplaination}>
              <Box pt={3} sx={{ minHeight: "120px" }}>
                {deferredRender ? (
                    <RichTextEditor
                      placeholder="Nhập giải thích chi tiết..."
                      value={formData.explaination} onChange={(val) => handleFieldChange('explaination', val)} toolbarType="full" 
                      style={{ minHeight: "150px", display: "flex", flexDirection: "column" }}
                    />
                ) : (
                    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>Đang tải trình soạn thảo...</Box>
                )}
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
              
              {/* GIÁO ÁN */}
              {isEditMode ? (
                <TextField 
                    fullWidth size="small" variant="outlined" label="Giáo án hiện tại"
                    value={formData.planName || "Đang tải..."} 
                    InputProps={{ readOnly: true }}
                    helperText="Chế độ chỉnh sửa không cho phép đổi giáo án."
                    sx={{ bgcolor: "background.paper" }}
                />
              ) : (
                <FormControl fullWidth size="small">
                    {plans.length > 50 ? (
                        <Autocomplete
                            options={plans}
                            getOptionLabel={(option) => `${option.title} ${option.grade ? `(K${option.grade})` : ""}`}
                            value={plans.find(p => p.plan_id === formData.selectedPlanId) || null}
                            onChange={(event, newValue) => {
                                if(newValue) handlePlanChange({ target: { value: newValue.plan_id } });
                                else handlePlanChange({ target: { value: "" } });
                            }}
                            renderInput={(params) => <TextField {...params} label="Giáo án" size="small" sx={{ bgcolor: "background.paper" }}/>}
                        />
                    ) : (
                        <>
                        <InputLabel>Giáo án</InputLabel>
                        <Select value={formData.selectedPlanId} label="Giáo án" onChange={handlePlanChange} sx={{ bgcolor: "background.paper" }}>
                            <MenuItem value=""><em>Chọn giáo án</em></MenuItem>
                            {plans.map((plan) => (
                            <MenuItem key={plan.plan_id} value={plan.plan_id}>
                                {plan.title} {plan.grade ? `(K${plan.grade})` : ""}
                            </MenuItem>
                            ))}
                        </Select>
                        </>
                    )}
                </FormControl>
              )}

              <Collapse in={!!formData.selectedPlanId}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>Chuyên đề / Danh mục</Typography>
                
                {isEditMode ? (
                  <TextField 
                      fullWidth size="small" variant="outlined" label="Danh mục hiện tại"
                      value={formData.categoryName || "Đang tải..."} 
                      InputProps={{ readOnly: true }}
                      helperText="Chế độ chỉnh sửa không cho phép đổi danh mục."
                      sx={{ bgcolor: "background.paper" }}
                  />
                ) : (
                  <Paper variant="outlined" sx={{ maxHeight: 350, overflowY: "auto", p: 1, bgcolor: "background.paper" }}>
                      {loadingCategories ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}><CircularProgress size={24} /></Box>
                      ) : categoryTreeData.length > 0 ? (
                        <RichTreeView
                          items={categoryTreeData}
                          slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
                          onSelectedItemsChange={handleTreeSelection}
                          selectedItems={formData.selectedCategoryId ? [String(formData.selectedCategoryId)] : []}
                          sx={{
                              '& .MuiTreeItem-content': {
                                py: 0.5, borderRadius: 1,
                                '&:hover': { bgcolor: 'action.hover' },
                                '&.Mui-selected': { bgcolor: 'primary.lighter', color: 'primary.main', fontWeight: 'bold' },
                              },
                            }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: "block" }}>
                          {formData.selectedPlanId ? "Giáo án này trống hoặc chưa tải xong." : "Vui lòng chọn giáo án."}
                        </Typography>
                      )}
                  </Paper>
                )}
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
                <DifficultyRating value={formData.difficulty} onChange={(val) => handleFieldChange('difficulty', val)} />
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Quyền xem</InputLabel>
                <Select value={formData.accessMode} label="Quyền xem" onChange={(e) => handleFieldChange('accessMode', e.target.value)} sx={{ bgcolor: "background.paper" }}>
                  <MenuItem value="private">Riêng tư (Private)</MenuItem>
                  <MenuItem value="public">Công khai (Public)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select value={formData.status} label="Trạng thái" onChange={(e) => handleFieldChange('status', e.target.value)} sx={{ bgcolor: "background.paper" }}>
                  <MenuItem value="draft">Bản nháp (Draft)</MenuItem>
                  <MenuItem value="ready">Sẵn sàng (Ready)</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </SectionPaper>
        </Grid>
      </Grid>

      <AppSnackbar
        open={toast.open} message={toast.message} severity={toast.severity}
        onClose={(e, r) => r !== "clickaway" && setToast(p => ({ ...p, open: false }))}
      />
    </PageWrapper>
  );
}