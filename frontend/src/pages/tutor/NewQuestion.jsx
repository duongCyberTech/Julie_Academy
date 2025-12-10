<<<<<<< HEAD
/* eslint-disable */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createQuestion } from "../../services/QuestionService";
import { getAllBooks, getAllCategories } from "../../services/CategoryService";
=======
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createQuestion } from "../../services/QuestionService";
import { getPlansByTutor, getAllCategories } from "../../services/CategoryService"; 
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
import MultipleChoiceEditor from "../../components/QuestionType/MultipleChoice";

import {
  Box, Typography, Button, FormControl, Select, MenuItem,
  Divider, useTheme, Tooltip, Paper, InputLabel, Alert,
<<<<<<< HEAD
  Collapse, Stack, CircularProgress
=======
  Collapse, Stack, CircularProgress, TextField
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
} from "@mui/material";
import RichTextEditor from "../../components/RichTextEditor";
import { jwtDecode } from 'jwt-decode';
import SaveIcon from "@mui/icons-material/Save";
import NotesIcon from "@mui/icons-material/Notes";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { v4 as uuidv4 } from 'uuid';
import AppSnackbar from '../../components/SnackBar';

import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

<<<<<<< HEAD

=======
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
const DifficultyRating = ({ value, onChange }) => {
  const theme = useTheme();
  const levels = [
    { value: 'easy', label: 'Dễ', stars: 1 },
    { value: 'medium', label: 'Trung bình', stars: 2 },
    { value: 'hard', label: 'Khó', stars: 3 },
  ];
  const currentLevel = levels.find(l => l.value === value) || levels[0];

  return (
    <Tooltip title={`Độ khó: ${currentLevel.label}`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
        {[1, 2, 3].map((star) => (
          <Box key={star} component="span" onClick={() => onChange(levels[star - 1].value)}>
            {star <= currentLevel.stars
              ? <StarIcon sx={{ color: theme.palette.warning.main, display: 'block' }} />
              : <StarBorderIcon sx={{ color: theme.palette.text.disabled, display: 'block' }} />}
          </Box>
        ))}
      </Box>
    </Tooltip>
  );
};

const EditorHeader = ({ questionType, onTypeChange, difficulty, onDifficultyChange, onSubmit, isSubmitting }) => (
  <Box
    component={Paper}
    square
    sx={{
      display: "flex", alignItems: "center", p: "8px 16px",
      borderBottom: 1, borderColor: "divider", flexShrink: 0
    }}
  >
    <FormControl size="small" sx={{ m: 1, minWidth: 220 }}>
      <Select value={questionType} onChange={onTypeChange}>
        <MenuItem value="single_choice">Nhiều lựa chọn - 1 đáp án</MenuItem>
        <MenuItem value="multiple_choice">Nhiều lựa chọn - nhiều đáp án</MenuItem>
      </Select>
    </FormControl>
    <Box sx={{ flexGrow: 1 }} />

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mx: 2 }}>
      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
        Độ khó:
      </Typography>
      <DifficultyRating value={difficulty} onChange={onDifficultyChange} />
    </Box>

    <Button
      variant="contained"
      color="primary"
      startIcon={<SaveIcon />}
      onClick={onSubmit}
      disabled={isSubmitting}
    >
      {isSubmitting ? "Đang lưu..." : "Lưu câu hỏi"}
    </Button>
  </Box>
);

const transformCategoriesForTree = (nodes) => {
  return nodes.map(node => ({
    id: node.category_id,
    label: node.category_name,
    children: Array.isArray(node.children)
      ? transformCategoriesForTree(node.children)
      : [],
  }));
};

const OptionsSidebar = ({
<<<<<<< HEAD
  books, selectedBookId, onBookChange, loadingBooks,
  categories, category, onCategoryChange, loadingCategories,
=======
  plans, selectedPlanId, onPlanChange, loadingPlans,
  categories, category, onCategoryChange, loadingCategories,
  accessMode, onAccessModeChange,
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
  status, onStatusChange,
  explanation, onExplanationChange
}) => {
  const [showExplanation, setShowExplanation] = useState(Boolean(explanation));
  const categoryTreeData = useMemo(() => transformCategoriesForTree(categories), [categories]);

  return (
    <Box
      component={Paper}
      square
      sx={{
        width: 320,
        borderLeft: 1,
        borderColor: "divider",
        backgroundColor: 'background.default',
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flexGrow: 1,
          overflowY: 'auto'
        }}
      >
        <Typography variant="h6" fontWeight={600}>Tùy chọn</Typography>

<<<<<<< HEAD
        {/* 1. Sách */}
        <FormControl fullWidth size="small" disabled={loadingBooks}>
          <InputLabel id="book-select-label">Sách</InputLabel>
          <Select
            labelId="book-select-label"
            value={selectedBookId}
            label="Sách"
            onChange={onBookChange}
          >
            <MenuItem value=""><em>{loadingBooks ? "Đang tải sách..." : "Chọn sách"}</em></MenuItem>
            {books.map((book) => (
              <MenuItem key={book.book_id} value={book.book_id}>
                {`${book.title} (Lớp ${book.grade})`}
=======
        <FormControl fullWidth size="small" disabled={loadingPlans}>
          <InputLabel id="plan-select-label">Giáo án</InputLabel>
          <Select
            labelId="plan-select-label"
            value={selectedPlanId}
            label="Giáo án"
            onChange={onPlanChange}
          >
            <MenuItem value=""><em>{loadingPlans ? "Đang tải giáo án..." : "Chọn giáo án"}</em></MenuItem>
            {plans.map((plan) => (
              <MenuItem key={plan.plan_id} value={plan.plan_id}>
                {`${plan.title} (Lớp ${plan.grade})`}
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
<<<<<<< HEAD
          <InputLabel id="status-select-label">Ai có thể xem?</InputLabel>
          <Select
            labelId="status-select-label"
            value={status}
            label="Ai có thể xem?"
            onChange={onStatusChange}
          >
            <MenuItem value="private">Chỉ riêng tôi</MenuItem>
            <MenuItem value="public">Với mọi người</MenuItem>
          </Select>
        </FormControl>
        <Collapse in={!!selectedBookId} sx={{ width: '100%' }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Danh mục
=======
          <InputLabel id="access-mode-select-label">Quyền xem</InputLabel>
          <Select
            labelId="access-mode-select-label"
            value={accessMode}
            label="Quyền xem"
            onChange={onAccessModeChange}
          >
            <MenuItem value="private">Riêng tư (Private)</MenuItem>
            <MenuItem value="public">Công khai (Public)</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id="status-select-label">Trạng thái</InputLabel>
          <Select
            labelId="status-select-label"
            value={status}
            label="Trạng thái"
            onChange={onStatusChange}
          >
            <MenuItem value="draft">Bản nháp (Draft)</MenuItem>
            <MenuItem value="ready">Sẵn sàng (Ready)</MenuItem>
          </Select>
        </FormControl>

        <Collapse in={!!selectedPlanId} sx={{ width: '100%' }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, mt: 1 }}>
            Chuyên đề / Danh mục
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              p: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover'
            }}
          >
            {loadingCategories ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : categoryTreeData.length > 0 ? (
              <RichTreeView
                items={categoryTreeData}
                slots={{
                  collapseIcon: ExpandMoreIcon,
                  expandIcon: ChevronRightIcon
                }}
                onSelectedItemsChange={(event, itemId) => {
                  onCategoryChange({ target: { value: itemId } });
                }}
                selectedItems={category}
              />
            ) : (
              <Typography variant="caption" sx={{ p: 2, display: 'block' }}>
<<<<<<< HEAD
                {selectedBookId ? "Sách này chưa có danh mục." : "Vui lòng chọn sách."}
=======
                {selectedPlanId ? "Giáo án này chưa có danh mục." : "Vui lòng chọn giáo án."}
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
              </Typography>
            )}
          </Paper>
        </Collapse>
      </Box>
<<<<<<< HEAD
      <Box
        sx={{
          p: 2,
          pt: 0,
          flexShrink: 0
        }}
      >
=======
      
      <Box sx={{ p: 2, pt: 0, flexShrink: 0 }}>
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
        <Divider sx={{ mb: 2 }} />
        <Button
          fullWidth
          startIcon={<NotesIcon />}
          onClick={() => setShowExplanation(!showExplanation)}
          sx={{ justifyContent: "flex-start", color: "text.secondary" }}
        >
          {showExplanation ? "Ẩn giải thích" : "Thêm giải thích"}
        </Button>
        
        <Collapse in={showExplanation}>
          <Box pt={2}>
            <RichTextEditor
              placeholder="Nhập giải thích chi tiết..."
              value={explanation}
              onChange={onExplanationChange}
              toolbarType="full"
              style={{ minHeight: '150px', display: 'flex', flexDirection: 'column' }}
            />
          </Box>
        </Collapse>
      </Box>
    </Box>
  )
};

export default function CreateNewQuestionPage() {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem('token'));

  const userInfo = useMemo(() => {
    try { return token ? jwtDecode(token) : null; }
<<<<<<< HEAD
    catch (e) { console.error("Invalid token:", e); return null; }
  }, [token]);

  const [questionType, setQuestionType] = useState("single_choice");
  const [content, setContent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [status, setStatus] = useState("private");

  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);

=======
    catch (e) { return null; }
  }, [token]);

  const [questionType, setQuestionType] = useState("single_choice");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [accessMode, setAccessMode] = useState("private");
  const [status, setStatus] = useState("ready");

  // Changed book -> plan
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [answerData, setAnswerData] = useState([]);

  useEffect(() => {
<<<<<<< HEAD
    const fetchBooks = async () => {
      if (!token) { setApiError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại."); setLoadingBooks(false); return; }
      try { setLoadingBooks(true); const allBooks = await getAllBooks(token); setBooks(Array.isArray(allBooks) ? allBooks : []); setApiError(null); }
      catch (err) { setApiError("Lỗi tải danh sách sách."); console.error(err); }
      finally { setLoadingBooks(false); }
    };
    fetchBooks();
  }, [token]);

  const handleBookChange = (e) => {
    const newBookId = e.target.value;
    setSelectedBookId(newBookId);
=======
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
      }
      catch (err) { 
        setApiError("Lỗi tải danh sách giáo án."); 
      }
      finally { setLoadingPlans(false); }
    };
    fetchPlans();
  }, [token, userInfo]);

  const handlePlanChange = (e) => {
    const newPlanId = e.target.value;
    setSelectedPlanId(newPlanId);
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
    setCategories([]);
    setSelectedCategoryId("");
  };

  useEffect(() => {
    const fetchCategories = async () => {
<<<<<<< HEAD
      if (!selectedBookId || !token) return;
=======
      if (!selectedPlanId || !token) return;
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
      try {
        setLoadingCategories(true);
        setApiError(null);
        const catData = await getAllCategories(
<<<<<<< HEAD
          { book_id: selectedBookId, mode: 'tree' },
=======
          { plan_id: selectedPlanId, mode: 'tree' }, // Dùng đúng plan_id
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
          token
        );
        setCategories(Array.isArray(catData?.data) ? catData.data : []);
      }
<<<<<<< HEAD
      catch (err) { setApiError("Lỗi tải danh mục cho sách này."); console.error(err); }
      finally { setLoadingCategories(false); }
    };
    fetchCategories();
  }, [selectedBookId, token]);
=======
      catch (err) { setApiError("Lỗi tải danh mục cho giáo án này."); }
      finally { setLoadingCategories(false); }
    };
    fetchCategories();
  }, [selectedPlanId, token]);
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268

  useEffect(() => {
    const initialAnswers = Array.from({ length: 4 }, () => ({
      id: uuidv4(),
      content: "",
      isCorrect: false,
      explanation: ""
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
      setToast({ open: true, message: "Phiên đăng nhập hết hạn.", severity: 'error' });
      return;
    }
<<<<<<< HEAD
=======
    if (!title.trim()) {
      setToast({ open: true, message: "Vui lòng nhập tiêu đề câu hỏi.", severity: 'warning' });
      return;
    }
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
    if (!content.trim() || content === '<p><br></p>') {
      setToast({ open: true, message: "Vui lòng nhập nội dung câu hỏi.", severity: 'warning' });
      return;
    }
<<<<<<< HEAD
    if (!selectedBookId) {
      setToast({ open: true, message: "Vui lòng chọn sách.", severity: 'warning' });
      return;
    }
    if (!selectedCategoryId) {
      setToast({ open: true, message: "Vui lòng chọn danh mục cho câu hỏi.", severity: 'warning' });
=======
    if (!selectedPlanId) {
      setToast({ open: true, message: "Vui lòng chọn giáo án.", severity: 'warning' });
      return;
    }
    if (!selectedCategoryId) {
      setToast({ open: true, message: "Vui lòng chọn chuyên đề/danh mục.", severity: 'warning' });
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
      return;
    }

    const payload = {
<<<<<<< HEAD
=======
      title,
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
      content,
      explanation,
      type: questionType,
      level: difficulty,
      categoryId: selectedCategoryId,
<<<<<<< HEAD
=======
      accessMode: accessMode,
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
      status: status,
      tutorId: userInfo.sub,
      answers: answerData
        .filter((a) => a.content.trim() !== "" && a.content !== '<p><br></p>')
        .map(({ id, ...rest }) => rest),
    };

    setIsSubmitting(true);
    try {
<<<<<<< HEAD
      await createQuestion([payload], token);
      setToast({ open: true, message: "Tạo câu hỏi thành công!", severity: 'success' });
      navigate("/tutor/question");
    } catch (error) {
      console.error("Failed to create question:", error);
=======
      await createQuestion(userInfo.sub, [payload], token);
      setToast({ open: true, message: "Tạo câu hỏi thành công!", severity: 'success' });
      navigate("/tutor/question");
    } catch (error) {
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
      const msg = "Lỗi tạo câu hỏi: " + (error.response?.data?.message || error.message);
      setApiError(msg);
      setToast({ open: true, message: "Tạo câu hỏi thất bại.", severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast(prev => ({ ...prev, open: false }));
  };

<<<<<<< HEAD

=======
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      height: '100vh',
      bgcolor: 'background.default'
    }}>
      <EditorHeader
        questionType={questionType}
        onTypeChange={(e) => setQuestionType(e.target.value)}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: { xs: 1, md: 2 }, overflowY: 'auto' }}>
          {apiError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError(null)}>{apiError}</Alert>}

          <Paper variant="outlined" sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
<<<<<<< HEAD

            <RichTextEditor
              label="Nội dung câu hỏi"
              placeholder="Nhập câu hỏi tại đây..."
=======
            <TextField
              label="Tiêu đề câu hỏi"
              variant="outlined"
              fullWidth
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề ngắn gọn..."
              sx={{ mb: 2 }}
            />

            <RichTextEditor
              label="Nội dung câu hỏi"
              placeholder="Nhập nội dung câu hỏi tại đây..."
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
              value={content}
              onChange={setContent}
              toolbarType="full"
              style={{
                flexGrow: 1,
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column'
              }}
            />

            <Box sx={{ my: 2 }} />

            <MultipleChoiceEditor
              questionType={questionType}
              answerData={answerData}
              setAnswerData={setAnswerData}
            />
          </Paper>
        </Box>
        <OptionsSidebar
<<<<<<< HEAD
          books={books}
          selectedBookId={selectedBookId}
          onBookChange={handleBookChange}
          loadingBooks={loadingBooks}
=======
          plans={plans}
          selectedPlanId={selectedPlanId}
          onPlanChange={handlePlanChange}
          loadingPlans={loadingPlans}
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
          categories={categories}
          category={selectedCategoryId}
          onCategoryChange={(e) => setSelectedCategoryId(e.target.value)}
          loadingCategories={loadingCategories}
<<<<<<< HEAD
=======
          accessMode={accessMode}
          onAccessModeChange={(e) => setAccessMode(e.target.value)}
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
          status={status}
          onStatusChange={(e) => setStatus(e.target.value)}
          explanation={explanation}
          onExplanationChange={setExplanation}
        />
      </Box>

      <AppSnackbar
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </Box>
  );
}