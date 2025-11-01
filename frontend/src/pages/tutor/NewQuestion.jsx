import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createQuestion } from "../../services/QuestionService";
import { getAllBooks, getAllCategories } from "../../services/CategoryService";
import MultipleChoiceEditor from "../../components/QuestionType/MultipleChoice";

import {
    Box, Typography, Button, FormControl, Select, MenuItem,
    Divider, useTheme, Tooltip, Paper, InputLabel, Alert,
} from "@mui/material";
import RichTextEditor from "../../components/RichTextEditor"; 
import { jwtDecode } from 'jwt-decode'; 
import SaveIcon from "@mui/icons-material/Save";
import NotesIcon from "@mui/icons-material/Notes";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { v4 as uuidv4 } from 'uuid';
import AppSnackbar from '../../components/SnackBar'; 

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

const OptionsSidebar = ({ 
    books, selectedBookId, onBookChange, loadingBooks,
    categories, category, onCategoryChange, loadingCategories,
    status, onStatusChange,
    explanation, onExplanationChange 
}) => {
    const [showExplanation, setShowExplanation] = useState(Boolean(explanation));

    return (
        <Box
            component={Paper}
            square
            sx={{
                width: 320, p: 2, borderLeft: 1, borderColor: "divider", 
                display: "flex", flexDirection: "column", gap: 2, overflowY: 'auto', 
                backgroundColor: 'background.default' 
            }}
        >
            <Typography variant="h6" fontWeight={600}>Tùy chọn</Typography>

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
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={!selectedBookId || loadingCategories}>
                <InputLabel id="category-select-label">Danh mục</InputLabel>
                <Select
                    labelId="category-select-label"
                    value={category}
                    label="Danh mục"
                    onChange={onCategoryChange}
                >
                    <MenuItem value=""><em>{loadingCategories ? "Đang tải..." : "Chọn danh mục"}</em></MenuItem>
                    {categories.map((cat) => (
                        <MenuItem key={cat.category_id} value={cat.category_id}>
                            {cat.category_name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth size="small">
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
                <RichTextEditor
                    placeholder="Nhập giải thích chi tiết..."
                    value={explanation}
                    onChange={onExplanationChange} 
                    toolbarType="full" 
                    style={{ minHeight: '150px', display: 'flex', flexDirection: 'column' }}
                />
            )}
        </Box>
    )
};

export default function CreateNewQuestionPage() {
    const navigate = useNavigate();
    const [token] = useState(localStorage.getItem('token'));

    const userInfo = useMemo(() => {
        try { return token ? jwtDecode(token) : null; }
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
    
    // Giữ apiError cho các lỗi tải dữ liệu (trước khi submit)
    const [apiError, setApiError] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    // State cho toast/snackbar
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' }); 

    const [answerData, setAnswerData] = useState([]);

    useEffect(() => {
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
        setCategories([]); 
        setSelectedCategoryId(""); 
    };

    useEffect(() => {
        const fetchCategories = async () => {
            if (!selectedBookId || !token) return;
            try { setLoadingCategories(true); setApiError(null); const catData = await getAllCategories(selectedBookId, {}, token); setCategories(Array.isArray(catData?.data) ? catData.data : []); } 
            catch (err) { setApiError("Lỗi tải danh mục cho sách này."); console.error(err); } 
            finally { setLoadingCategories(false); }
        };
        fetchCategories();
    }, [selectedBookId, token]);

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
        if (!content.trim() || content === '<p><br></p>') {
            setToast({ open: true, message: "Vui lòng nhập nội dung câu hỏi.", severity: 'warning' });
            return;
        }
        if (!selectedBookId) {
            setToast({ open: true, message: "Vui lòng chọn sách.", severity: 'warning' });
            return;
        }
        if (!selectedCategoryId) {
            setToast({ open: true, message: "Vui lòng chọn danh mục cho câu hỏi.", severity: 'warning' });
            return;
        }

        const payload = {
            content, 
            explanation, 
            type: questionType,
            level: difficulty,
            categoryId: selectedCategoryId,
            status: status,
            tutorId: userInfo.sub, 
            answers: answerData
                .filter((a) => a.content.trim() !== "" && a.content !== '<p><br></p>')
                .map(({ id, ...rest }) => rest), 
        };

        setIsSubmitting(true); 
        try {
            await createQuestion([payload], token); 
            setToast({ open: true, message: "Tạo câu hỏi thành công!", severity: 'success' }); 
            navigate("/tutor/question");
        } catch (error) {
            console.error("Failed to create question:", error);
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
                        
                        <RichTextEditor
                            label="Nội dung câu hỏi"
                            placeholder="Nhập câu hỏi tại đây..."
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
                    books={books}
                    selectedBookId={selectedBookId}
                    onBookChange={handleBookChange} 
                    loadingBooks={loadingBooks}
                    categories={categories}
                    category={selectedCategoryId}
                    onCategoryChange={(e) => setSelectedCategoryId(e.target.value)}
                    loadingCategories={loadingCategories}
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