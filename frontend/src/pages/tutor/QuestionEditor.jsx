import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import {
  Box, Typography, Button, FormControl, Select, MenuItem, Divider,
  useTheme, Tooltip, Paper, InputLabel, Alert, Collapse, CircularProgress,
  TextField, Backdrop, Chip, Autocomplete
} from "@mui/material";
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}>
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

const EditorHeader = React.memo(({ 
  isEditMode, questionType, onTypeChange, difficulty, onDifficultyChange, onSubmit, isSubmitting, onBack 
}) => (
  <Box
    component={Paper} elevation={0} square
    sx={{
      display: "flex", alignItems: "center", p: 2,
      borderBottom: 1, borderColor: "divider", flexShrink: 0,
      bgcolor: "background.paper", position: 'sticky', top: 0, zIndex: 10
    }}
  >
    <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mr: 2, color: 'text.secondary' }}>Quay lại</Button>
    <Typography variant="h6" fontWeight="bold" sx={{ mr: 3, display: { xs: 'none', md: 'block' } }}>
      {isEditMode ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
    </Typography>
    <FormControl size="small" sx={{ minWidth: 220 }}>
      <Select value={questionType} onChange={onTypeChange} displayEmpty>
        <MenuItem value="single_choice">Trắc nghiệm - 1 đáp án</MenuItem>
        <MenuItem value="multiple_choice">Trắc nghiệm - nhiều đáp án</MenuItem>
      </Select>
    </FormControl>
    <Box sx={{ flexGrow: 1 }} />
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mx: 2 }}>
      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
        Độ khó:
      </Typography>
      <DifficultyRating value={difficulty} onChange={onDifficultyChange} />
    </Box>
    <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={onSubmit} disabled={isSubmitting} sx={{ px: 3 }}>
      {isSubmitting ? "Đang lưu..." : "Lưu"}
    </Button>
  </Box>
));

const OptionsSidebar = React.memo(({
  isEditMode, categoryName, 
  plans, selectedPlanId, onPlanChange, loadingPlans,
  categories, category, onCategoryChange, loadingCategories,
  accessMode, onAccessModeChange,
  status, onStatusChange,
  explaination, onExplainationChange,
  deferredRender 
}) => {
  const [showExplaination, setShowExplaination] = useState(false);

  useEffect(() => {
    if (explaination && explaination.trim() !== "" && explaination !== "<p><br></p>") {
      setShowExplaination(true);
    }
  }, [explaination]);

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
    if (selectedId !== category) {
        onCategoryChange(selectedId);
    }
  };

  return (
    <Box
      component={Paper} elevation={0} square
      sx={{
        width: { xs: '100%', md: 320 }, 
        borderLeft: { md: 1 }, borderTop: { xs: 1, md: 0 }, borderColor: "divider",
        bgcolor: "background.default", display: "flex", flexDirection: "column",
        height: { xs: 'auto', md: '100%' },
      }}
    >
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2.5, flexGrow: 1, overflowY: "auto" }}>
        <Typography variant="subtitle1" fontWeight={700}>Tùy chọn thiết lập</Typography>

        <FormControl fullWidth size="small" disabled={loadingPlans || isEditMode}>
            {plans.length > 50 ? (
                 <Autocomplete
                    options={plans}
                    getOptionLabel={(option) => `${option.title} ${option.grade ? `(K${option.grade})` : ""}`}
                    value={plans.find(p => p.plan_id === selectedPlanId) || null}
                    onChange={(event, newValue) => {
                         if(newValue) onPlanChange({ target: { value: newValue.plan_id } });
                         else onPlanChange({ target: { value: "" } });
                    }}
                    renderInput={(params) => <TextField {...params} label="Giáo án" size="small" />}
                    disabled={loadingPlans || isEditMode}
                 />
            ) : (
                <>
                <InputLabel>Giáo án</InputLabel>
                <Select value={selectedPlanId} label="Giáo án" onChange={onPlanChange}>
                    <MenuItem value=""><em>{loadingPlans ? "Đang tải..." : "Chọn giáo án"}</em></MenuItem>
                    {plans.map((plan) => (
                    <MenuItem key={plan.plan_id} value={plan.plan_id}>
                        {plan.title} {plan.grade ? `(K${plan.grade})` : ""}
                    </MenuItem>
                    ))}
                </Select>
                </>
            )}
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Quyền xem</InputLabel>
          <Select value={accessMode} label="Quyền xem" onChange={onAccessModeChange}>
            <MenuItem value="private">Riêng tư (Private)</MenuItem>
            <MenuItem value="public">Công khai (Public)</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Trạng thái</InputLabel>
          <Select value={status} label="Trạng thái" onChange={onStatusChange}>
            <MenuItem value="draft">Bản nháp (Draft)</MenuItem>
            <MenuItem value="ready">Sẵn sàng (Ready)</MenuItem>
          </Select>
        </FormControl>

        <Collapse in={!!selectedPlanId} sx={{ width: "100%" }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Chuyên đề / Danh mục</Typography>
          
          {/* LOGIC HIỂN THỊ QUAN TRỌNG: */}
          {/* NẾU EDIT: Chỉ hiện ô nhập liệu Read-only (Không render Tree -> Không lỗi, không chậm) */}
          {isEditMode ? (
             <TextField 
                fullWidth size="small" variant="outlined" label="Danh mục hiện tại"
                value={categoryName || "Đang tải..."} 
                InputProps={{ readOnly: true }}
                helperText="Chế độ chỉnh sửa không cho phép đổi danh mục."
             />
          ) : (
             /* NẾU CREATE: Render Tree như cũ */
             <Paper variant="outlined" sx={{ maxHeight: 350, overflowY: "auto", p: 1, bgcolor: "background.paper" }}>
                {loadingCategories ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}><CircularProgress size={24} /></Box>
                ) : categoryTreeData.length > 0 ? (
                  <RichTreeView
                    items={categoryTreeData}
                    slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
                    onSelectedItemsChange={handleTreeSelection}
                    selectedItems={category ? [String(category)] : []}
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
                    {selectedPlanId ? "Giáo án này trống hoặc chưa tải xong." : "Vui lòng chọn giáo án."}
                  </Typography>
                )}
             </Paper>
          )}
        </Collapse>
      </Box>

      <Box sx={{ p: 2, pt: 0, flexShrink: 0, bgcolor: "background.default" }}>
        <Divider sx={{ mb: 2 }} />
        <Button
          fullWidth startIcon={<NotesIcon />}
          onClick={() => setShowExplaination(!showExplaination)}
          sx={{ justifyContent: "flex-start", color: showExplaination ? "primary.main" : "text.secondary" }}
        >
          {showExplaination ? "Ẩn giải thích chi tiết" : "Thêm giải thích chi tiết"}
        </Button>
        <Collapse in={showExplaination}>
          <Box pt={2} sx={{ minHeight: "120px" }}>
            {/* LAZY LOAD CHO EDITOR GIẢI THÍCH */}
            {deferredRender ? (
                <RichTextEditor
                value={explaination} onChange={onExplainationChange} toolbarType="basic" 
                style={{ minHeight: "120px", maxHeight: "200px", display: "flex", flexDirection: "column" }}
                />
            ) : (
                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>Đang tải trình soạn thảo...</Box>
            )}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
});


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
    categoryName: "" 
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
            if (catObj.plan_id) detectedPlanId = catObj.plan_id;
            else if (catObj.structure?.[0]?.Plan?.plan_id) detectedPlanId = catObj.structure[0].Plan.plan_id;
            else if (catObj.Categories?.structure?.[0]?.Plan?.plan_id) detectedPlanId = catObj.Categories.structure[0].Plan.plan_id;

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
                categoryName: correctCategoryName 
            });
            setAnswerData(initialAnswers);
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

  const showToast = (message, severity) => setToast({ open: true, message, severity });

  const handleSubmit = async () => {
    setApiError(null);
    const { title, content, selectedPlanId, selectedCategoryId, questionType, difficulty, accessMode, status, explaination } = formData;

    if (!title.trim()) return showToast("Vui lòng nhập tiêu đề.", "warning");
    if (!content.trim() || content === "<p><br></p>") return showToast("Vui lòng nhập nội dung.", "warning");
    if (!selectedPlanId) return showToast("Vui lòng chọn giáo án.", "warning");
    if (!selectedCategoryId) return showToast("Vui lòng chọn danh mục.", "warning");
    
    const validAnswers = answerData.filter(a => a.content.trim() !== "" && a.content !== "<p><br></p>");
    if (validAnswers.length < 2) return showToast("Cần ít nhất 2 đáp án.", "warning");
    if (!validAnswers.some(a => a.isCorrect)) return showToast("Cần chọn ít nhất 1 đáp án đúng.", "warning");

    const payload = {
      title, content, explaination,
      type: questionType, level: difficulty,
      categoryId: selectedCategoryId,
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

  const onTypeChange = (e) => handleFieldChange('questionType', e.target.value);
  const onDifficultyChange = (val) => handleFieldChange('difficulty', val);
  const onAccessModeChange = (e) => handleFieldChange('accessMode', e.target.value);
  const onStatusChange = (e) => handleFieldChange('status', e.target.value);
  const onExplainationChange = (val) => handleFieldChange('explaination', val);
  const onCategoryChange = (val) => handleFieldChange('selectedCategoryId', val);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "background.default" }}>
      <EditorHeader
        isEditMode={isEditMode}
        questionType={formData.questionType}
        onTypeChange={onTypeChange}
        difficulty={formData.difficulty}
        onDifficultyChange={onDifficultyChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onBack={() => navigate(-1)}
      />
      
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden", flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3, overflowY: "auto", gap: 3 }}>
          {apiError && <Alert severity="error" onClose={() => setApiError(null)}>{apiError}</Alert>}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Tiêu đề câu hỏi" variant="outlined" fullWidth
              value={formData.title} onChange={(e) => handleFieldChange('title', e.target.value)}
            />
            <Box sx={{ minHeight: "250px" }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">Nội dung câu hỏi</Typography>
                
                {/* LAZY LOAD EDITOR CHÍNH */}
                {deferredRender ? (
                    <RichTextEditor
                        value={formData.content} onChange={(val) => handleFieldChange('content', val)}
                        toolbarType="full" style={{ minHeight: "250px", display: "flex", flexDirection: "column" }}
                    />
                ) : (
                    <Box sx={{ height: 250, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải trình soạn thảo...
                    </Box>
                )}
            </Box>
            <Divider sx={{ my: 1 }} ><Chip label="Cấu hình đáp án" size="small" /></Divider>
            
            {/* LAZY LOAD EDITOR ĐÁP ÁN */}
            {deferredRender ? (
                <MultipleChoiceEditor questionType={formData.questionType} answerData={answerData} setAnswerData={setAnswerData} />
            ) : null}
          </Paper>
        </Box>

        <OptionsSidebar
          isEditMode={isEditMode}
          categoryName={formData.categoryName}
          plans={plans} 
          selectedPlanId={formData.selectedPlanId} 
          onPlanChange={handlePlanChange}
          loadingPlans={false}
          categories={categories} 
          category={formData.selectedCategoryId} 
          onCategoryChange={onCategoryChange}
          loadingCategories={loadingCategories}
          accessMode={formData.accessMode} 
          onAccessModeChange={onAccessModeChange}
          status={formData.status} 
          onStatusChange={onStatusChange}
          explaination={formData.explaination} 
          onExplainationChange={onExplainationChange}
          deferredRender={deferredRender}
        />
      </Box>

      <AppSnackbar
        open={toast.open} message={toast.message} severity={toast.severity}
        onClose={(e, r) => r !== "clickaway" && setToast(p => ({ ...p, open: false }))}
      />
    </Box>
  );
}