import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createQuestion } from "../../services/questionService";
import MultipleChoiceEditor from "../../components/QuestionType/MultipleChoice";

import {
  Box, Typography, Button, FormControl, Select, MenuItem, TextField,
  Divider, useTheme, Tooltip, Paper, InputLabel
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import NotesIcon from "@mui/icons-material/Notes";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// --- Các Component con (Có thể tách ra file riêng để clean hơn) ---

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

const EditorHeader = ({ questionType, onTypeChange, difficulty, onDifficultyChange, onSubmit }) => (
  <Box
    component={Paper}
    elevation={0}
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
    <DifficultyRating value={difficulty} onChange={onDifficultyChange} />
    <Button size="small" startIcon={<TimerOutlinedIcon />} sx={{ color: "text.secondary", mx: 2 }}>
      30 giây
    </Button>
    <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={onSubmit}>
      Lưu câu hỏi
    </Button>
  </Box>
);

const OptionsSidebar = ({ category, onCategoryChange, categories, explanation, onExplanationChange }) => {
  const [showExplanation, setShowExplanation] = useState(Boolean(explanation));

  return (
    <Box
      component={Paper}
      elevation={0}
      square
      sx={{
        width: 320, p: 2.5, borderLeft: 1, borderColor: "divider",
        display: "flex", flexDirection: "column", gap: 3, overflowY: 'auto'
      }}
    >
      <Typography variant="h6" fontWeight={600}>Tùy chọn</Typography>
      <FormControl fullWidth size="small">
        <InputLabel id="category-select-label">Danh mục</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={category}
          label="Danh mục"
          onChange={onCategoryChange}
        >
          {categories.map((cat) => (
            <MenuItem key={cat.category_id} value={cat.category_id}>
              {cat.category_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider />
      <Button
        fullWidth
        startIcon={<NotesIcon />}
        onClick={() => setShowExplanation(!showExplanation)}
        sx={{ justifyContent: "flex-start", color: "text.secondary" }}
      >
        {showExplanation ? "Ẩn giải thích" : "Thêm giải thích"}
      </Button>
      {showExplanation && (
        <TextField
          fullWidth
          label="Giải thích đáp án"
          multiline
          rows={4}
          value={explanation}
          onChange={onExplanationChange}
          size="small"
        />
      )}
    </Box>
  )
};

// Dữ liệu giả định cho categories
const mockCategories = [
  { category_id: 'cat-1', category_name: 'Hệ thức lượng trong tam giác vuông', subject: 'Toán học', grades: 9 },
  { category_id: 'cat-2', category_name: 'Đường tròn', subject: 'Toán học', grades: 9 },
  { category_id: 'cat-3', category_name: 'Hàm số bậc nhất', subject: 'Toán học', grades: 9 },
  { category_id: 'cat-4', category_name: 'Hệ phương trình bậc nhất hai ẩn', subject: 'Toán học', grades: 9 },
  { category_id: 'cat-5', category_name: 'Phương trình bậc hai một ẩn', subject: 'Toán học', grades: 9 },
  { category_id: 'cat-6', category_name: 'Góc với đường tròn', subject: 'Toán học', grades: 9 },
];

// --- Component chính của trang ---
export default function CreateNewQuestionPage() {
  const navigate = useNavigate();

  const [questionType, setQuestionType] = useState("single_choice");
  const [content, setContent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [answerData, setAnswerData] = useState([]);

  useEffect(() => {
    setCategories(mockCategories);
    if (mockCategories.length > 0) {
      setSelectedCategoryId(mockCategories[0].category_id);
    }
  }, []);

  useEffect(() => {
    const defaultAnswers = [
      { content: "", isCorrect: false }, { content: "", isCorrect: false },
      { content: "", isCorrect: false }, { content: "", isCorrect: false },
    ];
    if (questionType === "multiple_choice" || questionType === "single_choice") {
      setAnswerData(defaultAnswers);
    } else {
      setAnswerData([]);
    }
  }, [questionType]);

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.");
      return;
    }

    if (!content.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi.");
      return;
    }
    if (!selectedCategoryId) {
      alert("Vui lòng chọn danh mục cho câu hỏi.");
      return;
    }

    const payload = {
      content,
      explanation,
      type: questionType,
      level: difficulty,
      categoryId: selectedCategoryId,
      answers: answerData.filter((a) => a.content.trim() !== ""),
    };

    try {
      await createQuestion(payload, token);
      alert("Tạo câu hỏi thành công!");
      navigate("/tutor/question");
    } catch (error) {
      console.error("Failed to create question:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

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
      />
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: { xs: 2, md: 4 }, overflowY: 'auto' }}>
          <Paper variant="outlined" sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <TextField
              variant="standard"
              placeholder="Nhập câu hỏi tại đây..."
              multiline
              fullWidth
              value={content}
              onChange={(e) => setContent(e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: { xs: '1.5rem', md: '2rem' }, textAlign: "center",
                  color: "text.primary", fontWeight: 700, lineHeight: 1.4,
                  minHeight: '150px', display: 'flex', alignItems: 'center',
                },
              }}
              sx={{ flexShrink: 0, mb: 4 }}
            />
            <MultipleChoiceEditor
              questionType={questionType}
              answerData={answerData}
              setAnswerData={setAnswerData}
            />
          </Paper>
        </Box>
        <OptionsSidebar
          categories={categories}
          category={selectedCategoryId}
          onCategoryChange={(e) => setSelectedCategoryId(e.target.value)}
          explanation={explanation}
          onExplanationChange={(e) => setExplanation(e.target.value)}
        />
      </Box>
    </Box>
  );
}