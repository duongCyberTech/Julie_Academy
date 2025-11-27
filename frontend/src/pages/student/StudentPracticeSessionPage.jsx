/*
 * File: frontend/src/pages/student/StudentPracticeSessionPage.jsx
 *
 * (CHẾ ĐỘ LUYỆN TẬP - CÓ NỘP BÀI CUỐI PHIÊN)
 *
 * Cập nhật:
 * 1. Đã sửa lỗi cú pháp trong handleSubmit.
 * 2. Hàm Nộp bài tính điểm, lưu trữ dữ liệu phiên vào sessionStorage, và chuyển hướng.
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  FormControlLabel,
  LinearProgress,
  Stepper,
  Step,
  StepButton,
  Alert, 
  Paper,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

// Import Katex
import 'katex/dist/katex.min.css';
import katex from 'katex';

import AppSnackbar from '../../components/SnackBar';

// ======================================================
// --- MOCK DATA (Giữ nguyên) ---
// ======================================================

const PRACTICE_ID_1 = 'cd-c1-s1';

const mockQuestionDatabase = [
  // --- 9 CÂU HỎI (Dùng cho Luyện tập 'cd-c1-s1') ---
  {
    questionId: 'q1',
    content: 'Phương trình $(x - 5)(3x + 9) = 0$ có tập nghiệm là:',
    explanation:
      'Để giải phương trình tích $(ax+b)(cx+d)=0$, ta giải $ax+b=0$ và $cx+d=0$. Nghiệm là tập hợp các giá trị tìm được.',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      { answerId: 'q1a1', content: '$S = \\{5\\}$', is_correct: false, explanation: 'Chỉ có nghiệm $x=5$, thiếu $x=-3$.' },
      { answerId: 'q1a2', content: '$S = \\{-3\\}$', is_correct: false, explanation: 'Chỉ có nghiệm $x=-3$, thiếu $x=5$.' },
      {
        answerId: 'q1a3',
        content: '$S = \\{5; -3\\}$',
        is_correct: true,
        explanation:
          'Giải $x-5=0 \\implies x=5$. Giải $3x+9=0 \\implies 3x=-9 \\implies x=-3$.',
      },
      { answerId: 'q1a4', content: '$S = \\{-5; 3\\}$', is_correct: false, explanation: 'Sai dấu các nghiệm.' },
    ],
  },
  {
    questionId: 'q2',
    content:
      'Điều kiện xác định của phương trình $\\frac{2}{5x-3} = 1 + \\frac{1}{x+2}$ là gì?',
    explanation:
      'Điều kiện xác định của phương trình chứa ẩn ở mẫu là điều kiện để tất cả các mẫu thức khác 0.',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      {
        answerId: 'q2a1',
        content: '$x \\ne \\frac{3}{5}$',
        is_correct: false,
        explanation: 'Thiếu điều kiện cho mẫu $x+2$.',
      },
      {
        answerId: 'q2a2',
        content: '$x \\ne -2$',
        is_correct: false,
        explanation: 'Thiếu điều kiện cho mẫu $5x-3$.',
      },
      {
        answerId: 'q2a3',
        content: '$x \\ne \\frac{3}{5}$ và $x \\ne -2$',
        is_correct: true,
        explanation:
          'Mẫu $5x-3 \\ne 0 \\implies x \\ne 3/5$. Mẫu $x+2 \\ne 0 \\implies x \\ne -2$.',
      },
      {
        answerId: 'q2a4',
        content: '$x \\ne 0$',
        is_correct: false,
        explanation: 'Mẫu số không phải là x. Cần kiểm tra tất cả các mẫu số.',
      },
    ],
  },
  {
    questionId: 'q3',
    content: 'Phương trình nào sau đây có thể quy về phương trình bậc nhất một ẩn?',
    explanation:
      'Phương trình bậc nhất một ẩn có dạng $ax+b=0$ ($a \\ne 0$). Một số phương trình có thể biến đổi về dạng này.',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      {
        answerId: 'q3a1',
        content: '$x^2 - 1 = 0$',
        is_correct: false,
        explanation: 'Đây là phương trình bậc hai, không thể quy về bậc nhất.',
      },
      {
        answerId: 'q3a2',
        content: '$\\frac{1}{x} = 5$',
        is_correct: true,
        explanation:
          'ĐKXĐ $x \\ne 0$. Quy đồng: $1 = 5x \\implies 5x - 1 = 0$, là phương trình bậc nhất.',
      },
      {
        answerId: 'q3a3',
        content: '$x^3 = 8$',
        is_correct: false,
        explanation: 'Đây là phương trình bậc ba.',
      },
      {
        answerId: 'q3a4',
        content: '$0x = 0$',
        is_correct: false,
        explanation: 'Đây là phương trình có vô số nghiệm, không phải bậc nhất ($a=0$).',
      },
    ],
  },
  {
    questionId: 'q4',
    content: 'Tìm tập nghiệm của phương trình $4x^2 - 16 = 5(x + 2)$.',
    explanation:
      'Phân tích vế trái thành $4(x-2)(x+2)$, chuyển vế và đặt nhân tử chung $(x+2)$ để đưa về phương trình tích.',
    level: 'MEDIUM',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      {
        answerId: 'q4a1',
        content: '$S = \\{2; -\\frac{13}{4}\\}$',
        is_correct: false,
        explanation: 'Nghiệm $x=2$ sai. Kết quả $4x-13=0$.',
      },
      {
        answerId: 'q4a2',
        content: '$S = \\{-2; \\frac{13}{4}\\}$',
        is_correct: true,
        explanation:
          '$4(x-2)(x+2) - 5(x+2) = 0 \\implies (x+2)[4(x-2)-5] = 0 \\implies (x+2)(4x-8-5)=0 \\implies (x+2)(4x-13)=0$. Vậy $x=-2$ hoặc $x=13/4$.',
      },
      {
        answerId: 'q4a3',
        content: '$S = \\{-2\\}$',
        is_correct: false,
        explanation: 'Thiếu nghiệm $x=13/4$.',
      },
      {
        answerId: 'q4a4',
        content: '$S = \\{\\frac{13}{4}\\}$',
        is_correct: false,
        explanation: 'Thiếu nghiệm $x=-2$.',
      },
    ],
  },
  {
    questionId: 'q5',
    content: 'Giải phương trình $\\frac{x^2 - 6}{x} = x + \\frac{3}{2}$.',
    explanation:
      'Tìm ĐKXĐ, quy đồng khử mẫu, giải phương trình hệ quả, sau đó kiểm tra nghiệm với ĐKXĐ.',
    level: 'MEDIUM',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      {
        answerId: 'q5a1',
        content: '$x = 4$',
        is_correct: false,
        explanation: 'Kết quả tính toán sai. $3x=-12$ chứ không phải $3x=12$.',
      },
      {
        answerId: 'q5a2',
        content: '$x = -4$',
        is_correct: true,
        explanation:
          'ĐKXĐ: $x \\ne 0$. Quy đồng mẫu chung là $2x$. Khử mẫu: $2(x^2 - 6) = 2x(x) + x(3) \\implies 2x^2 - 12 = 2x^2 + 3x \\implies -12 = 3x \\implies x = -4$. Nghiệm $x=-4$ thỏa mãn ĐKXĐ.',
      },
      {
        answerId: 'q5a3',
        content: 'Phương trình vô nghiệm',
        is_correct: false,
        explanation: 'Phương trình có nghiệm $x=-4$ thỏa mãn ĐKXĐ.',
      },
      {
        answerId: 'q5a4',
        content: '$x = 0$',
        is_correct: false,
        explanation: 'Nghiệm này vi phạm ĐKXĐ.',
      },
    ],
  },
  {
    questionId: 'q6',
    content: 'Giải phương trình $\\frac{4}{x(x-1)} + \\frac{3}{x} = \\frac{4}{x-1}$.',
    explanation:
      'Tìm ĐKXĐ, quy đồng mẫu thức rồi khử mẫu, giải phương trình hệ quả và đối chiếu với ĐKXĐ.',
    level: 'MEDIUM',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      {
        answerId: 'q6a1',
        content: '$x = 1$',
        is_correct: false,
        explanation: 'Nghiệm này vi phạm điều kiện xác định ($x \\ne 1$).',
      },
      {
        answerId: 'q6a2',
        content: '$x = 0$',
        is_correct: false,
        explanation: 'Nghiệm này vi phạm điều kiện xác định ($x \\ne 0$).',
      },
      {
        answerId: 'q6a3',
        content: 'Phương trình có nghiệm $x=1$',
        is_correct: false,
        explanation: 'Nghiệm $x=1$ không thỏa mãn ĐKXĐ.',
      },
      {
        answerId: 'q6a4',
        content: 'Phương trình vô nghiệm',
        is_correct: true,
        explanation:
          'ĐKXĐ: $x \\ne 0$ và $x \\ne 1$. Quy đồng và khử mẫu: $4 + 3(x-1) = 4x \\implies 4 + 3x - 3 = 4x \\implies 3x + 1 = 4x \\implies x = 1$. Tuy nhiên, $x=1$ không thỏa mãn ĐKXĐ nên phương trình vô nghiệm.',
      },
    ],
  },
  {
    questionId: 'q7_multi',
    content:
      'Phương trình $x^2 - 4 + (x+2)(2x-1) = 0$ tương đương với phương trình nào sau đây? (Chọn các đáp án đúng)',
    explanation:
      'Phân tích $x^2-4$ thành $(x-2)(x+2)$, sau đó đặt nhân tử chung $(x+2)$ để đưa về phương trình tích.',
    level: 'MEDIUM',
    type: 'MULTIPLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      {
        answerId: 'q7a1',
        content: '$(x+2)(3x-3) = 0$',
        is_correct: true,
        explanation:
          'PT $\\iff (x-2)(x+2) + (x+2)(2x-1) = 0 \\iff (x+2)[(x-2)+(2x-1)]=0 \\iff (x+2)(3x-3)=0$. Đây là dạng tương đương.',
      },
      {
        answerId: 'q7a2',
        content: '$3(x+2)(x-1) = 0$',
        is_correct: true,
        explanation:
          'Từ $(x+2)(3x-3)=0$, đặt nhân tử chung 3: $3(x+2)(x-1)=0$. Đây cũng là dạng tương đương.',
      },
      {
        answerId: 'q7a3',
        content: '$3x^2 + 3x - 6 = 0$',
        is_correct: true,
        explanation:
          'Khai triển $(x+2)(3x-3) = 3x^2 - 3x + 6x - 6 = 3x^2 + 3x - 6$. Đây cũng là dạng tương đương.',
      },
      {
        answerId: 'q7a4',
        content: '$(x+2)(x-3) = 0$',
        is_correct: false,
        explanation: 'Sai khi cộng các hạng tử trong ngoặc vuông: $(x-2) + (2x-1) = 3x - 3$.',
      },
    ],
  },
  {
    questionId: 'q8',
    content:
      'Một mảnh đất hình chữ nhật có chu vi 52m. Làm vườn rau hình chữ nhật bên trong, diện tích 112 $m^2$, lối đi xung quanh rộng 1m. Tính chiều dài mảnh đất ban đầu.',
    explanation:
      'Gọi chiều dài và chiều rộng mảnh đất là $L, W$. Ta có $2(L+W)=52$. Kích thước vườn rau là $(L-2), (W-2)$. Lập phương trình diện tích vườn rau $(L-2)(W-2)=112$. Giải hệ phương trình này.',
    level: 'HARD',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      {
        answerId: 'q8a1',
        content: '16 m',
        is_correct: true,
        explanation:
          'Từ chu vi, $L+W=26 \\implies W=26-L$. Thay vào PT diện tích vườn: $(L-2)( (26-L)-2 ) = 112 \\implies (L-2)(24-L) = 112 \\implies 24L - L^2 - 48 + 2L = 112 \\implies -L^2 + 26L - 160 = 0 \\implies L^2 - 26L + 160 = 0$. Nghiệm $L=16$ hoặc $L=10$. Chiều dài phải lớn hơn chiều rộng, nên $L=16$m.',
      },
      {
        answerId: 'q8a2',
        content: '10 m',
        is_correct: false,
        explanation: 'Đây là chiều rộng mảnh đất ($W$). Yêu cầu tính chiều dài ($L$).',
      },
      {
        answerId: 'q8a3',
        content: '14 m',
        is_correct: false,
        explanation: 'Chiều dài vườn rau là $16-2=14$m. Không phải chiều dài mảnh đất ban đầu.',
      },
      {
        answerId: 'q8a4',
        content: '8 m',
        is_correct: false,
        explanation: 'Chiều rộng vườn rau là $10-2=8$m. Không phải chiều dài mảnh đất ban đầu.',
      },
    ],
  },
  {
    questionId: 'q9',
    content:
      'Hoa dự định mua một số áo đồng giá hết 600 nghìn. Cửa hàng giảm 30 nghìn/chiếc nên Hoa mua được gấp 1.25 lần số lượng dự định. Tính giá tiền mỗi chiếc áo Hoa đã mua (giá sau giảm).',
    explanation:
      'Gọi giá dự định là $x$ (nghìn đồng/chiếc), $x>30$. Lập phương trình dựa trên mối quan hệ về số lượng mua được trước và sau khi giảm giá.',
    level: 'HARD',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      {
        answerId: 'q9a1',
        content: '150 nghìn đồng',
        is_correct: false,
        explanation: 'Đây là giá dự định ($x$). Giá đã mua là $x-30$.',
      },
      {
        answerId: 'q9a2',
        content: '120 nghìn đồng',
        is_correct: true,
        explanation:
          'Giá dự định ($x$) là 150 nghìn. Giá đã mua (sau giảm) là $150 - 30 = 120$ nghìn.',
      },
      {
        answerId: 'q9a3',
        content: '100 nghìn đồng',
        is_correct: false,
        explanation: 'Tính toán sai.',
      },
      {
        answerId: 'q9a4',
        content: '180 nghìn đồng',
        is_correct: false,
        explanation: 'Tính toán sai.',
      },
    ],
  },
];

// ======================================================
// --- END MOCK DATA ---
// ======================================================

/*
 * Component render LaTeX từ văn bản thô
 */
const LatexRenderer = ({ content }) => {
  const renderMath = (text) => {
    if (!text) return null;
    try {
      const parts = text.split(/(\$.*?\S\$)/g);
      return parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const latex = part.substring(1, part.length - 1);
          try {
            const html = katex.renderToString(latex, {
              throwOnError: false,
              displayMode: false,
            });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) {
            return <span key={index}>{part}</span>;
          }
        }
        return <span key={index}>{part}</span>;
      });
    } catch (e) {
      return <span>{text}</span>;
    }
  };

  return <>{renderMath(content)}</>;
};

// Helper hiển thị độ khó
const getDifficultyChip = (level) => {
  const styles = {
    EASY: { label: 'Dễ', color: 'success' },
    MEDIUM: { label: 'Trung bình', color: 'warning' },
    HARD: { label: 'Khó', color: 'error' },
  };
  const style = styles[level?.toUpperCase()] || { label: level, color: 'default' };
  return <Chip label={style.label} color={style.color} size="small" />;
};

// Helper để tạo tiền tố A, B, C, D...
const getAnswerPrefix = (index) => String.fromCharCode(65 + index); // 65 là mã ASCII của 'A'

// Thêm hàm helper này vào đầu file StudentPracticeSessionPage.jsx (cùng chỗ với isQuestionCorrect)
const saveSessionState = (sessionId, answers, checkedStatus) => {
    // Lưu lại đáp án đã chọn và trạng thái check vào Session Storage
    sessionStorage.setItem(`practice_answers_${sessionId}`, JSON.stringify(answers));
    sessionStorage.setItem(`practice_checked_${sessionId}`, JSON.stringify(checkedStatus));
};
// Hàm kiểm tra đúng/sai (dùng cho Stepper và hiển thị lời giải)
const isQuestionCorrect = (q, selectedAnswers) => {
  const correctAnswers = q.answers
    .filter((a) => a.is_correct)
    .map((a) => a.answerId);
  const userAnswers = selectedAnswers[q.questionId];

  if (q.type === 'SINGLE_CHOICE') {
    return userAnswers === correctAnswers[0];
  } else if (q.type === 'MULTIPLE_CHOICE') {
    return (
      userAnswers &&
      userAnswers.length === correctAnswers.length &&
      userAnswers.every((id) => correctAnswers.includes(id))
    );
  }
  return false;
};


export default function StudentPracticeSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // States mới cho luồng nộp bài cuối cùng
  const [isFinished, setIsFinished] = useState(false); 
  const [score, setScore] = useState(null); 

  // LUÔN LUÔN là Practice Mode cho file này
  const isPracticeMode = true; 
  const [practiceAnswerChecked, setPracticeAnswerChecked] = useState({}); 

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // 1. Tải câu hỏi khi trang được mở
  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      // Lọc câu hỏi CHỈ dành cho Practice (cd-c1-s1)
      const fetchedQuestions = mockQuestionDatabase.filter(
        (q) => q.assignTo && q.assignTo.includes(sessionId) && q.assignTo.includes(PRACTICE_ID_1)
      );

      setQuestions(fetchedQuestions);
      setIsLoading(false);
      setActiveStep(0);
      setSelectedAnswers({});
      setPracticeAnswerChecked({});
      setIsFinished(false); // Đảm bảo bắt đầu chưa nộp
    }, 500);
  }, [sessionId]);

  const currentQuestion = questions[activeStep];
  const currentQId = currentQuestion?.questionId;


  // 2. Xử lý khi chọn đáp án
  const handleAnswerChange = (questionId, answerId, isMultiChoice) => {
    
    // Khóa đáp án nếu đã check HOẶC ĐÃ NỘP BÀI
    if (isFinished || practiceAnswerChecked[questionId]) {
      return;
    }

    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };

      if (isMultiChoice) {
        const currentSelections = prev[questionId] || [];
        if (currentSelections.includes(answerId)) {
          newAnswers[questionId] = currentSelections.filter((id) => id !== answerId);
        } else {
          newAnswers[questionId] = [...currentSelections, answerId];
        }
      } else {
        newAnswers[questionId] = answerId;
      }
      return newAnswers;
    });

    // Logic cho SINGLE_CHOICE: Hiển thị đáp án ngay khi chọn
    if (!isMultiChoice) {
      const question = questions.find((q) => q.questionId === questionId);
      const answer = question.answers.find((a) => a.answerId === answerId);

      if (answer.is_correct) {
        showSnackBar('Chính xác!', 'success');
      } else {
        showSnackBar('Chưa đúng. Xem lời giải nhé.', 'error');
      }

      setPracticeAnswerChecked((prev) => ({ ...prev, [questionId]: true }));
    }
  };

  // Hàm check cho Luyện tập (MULTIPLE_CHOICE)
  const handlePracticeCheckMulti = (q) => {
    const isCorrect = isQuestionCorrect(q, selectedAnswers);

    if (isCorrect) {
      showSnackBar('Chính xác!', 'success');
    } else {
      showSnackBar('Chưa đúng. Xem lời giải nhé.', 'error');
    }
    setPracticeAnswerChecked((prev) => ({ ...prev, [q.questionId]: true }));
  };

  // 3. Hàm NỘP BÀI và CHUYỂN HƯỚNG
  const handleSubmit = () => {
    let correctCount = 0;
    
    questions.forEach((q) => {
        if (isQuestionCorrect(q, selectedAnswers)) {
            correctCount++;
        }
    });

    const finalScore = { correct: correctCount, total: questions.length };
    setScore(finalScore);
    setIsFinished(true); 

    saveSessionState(sessionId, selectedAnswers, practiceAnswerChecked);
    navigate(`/student/practice/result/${sessionId}`, { state: { score: finalScore } });
};

  // 4. Điều hướng
  const handleStepClick = (step) => {
    // Luôn cho phép chuyển step trong Practice (dù đã nộp hay chưa)
    setActiveStep(step);
  };

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // 5. Các hàm SnackBar
  const showSnackBar = (message, severity) => {
    setSnackbarState({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  // --- Render ---

  if (isLoading) {
    return <Container><LinearProgress sx={{ mt: 4 }} /></Container>;
  }

  if (questions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Không tìm thấy chủ đề
        </Typography>
        <Typography color="text.secondary">
          Không tìm thấy câu hỏi cho chủ đề: {sessionId}.
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 3 }}
          onClick={() => navigate('/student/practice')}
        >
          Quay lại Thư viện
        </Button>
          <AppSnackbar
            open={snackbarState.open}
            message={snackbarState.message}
            severity={snackbarState.severity}
            onClose={handleCloseSnackbar}
          />
      </Container>
    );
  }

  const isCheckedPractice = practiceAnswerChecked[currentQId];
  const isDisabled = isFinished || isCheckedPractice; 

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Phiên Luyện tập
      </Typography>

      {/* 1. Thanh Stepper */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, overflowX: 'auto' }}>
        <Stepper nonLinear activeStep={activeStep} sx={{ minWidth: '600px' }}>
          {questions.map((q, index) => {
            const isCorrectPractice = isQuestionCorrect(q, selectedAnswers);
            
            return (
              <Step key={q.questionId} completed={selectedAnswers[q.questionId] !== undefined}>
                <StepButton 
                  color="inherit" 
                  onClick={() => handleStepClick(index)}
                  icon={
                    isCheckedPractice 
                    ? (isCorrectPractice ? <CheckCircleIcon color="success" /> : <CloseIcon color="error" />)
                    : (index + 1)
                  }
                />
              </Step>
            )
          })}
        </Stepper>
      </Paper>
      
      {/* 2. Thẻ câu hỏi và đáp án */}
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {/* Hiển thị độ khó */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" gutterBottom component="h2" sx={{ mb: 0, mr: 2 }}>
              Câu {activeStep + 1}:
            </Typography>
            {getDifficultyChip(currentQuestion.level)}
          </Box>
          
          <Box sx={{ my: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, minHeight: 100, fontSize: '1.1rem' }}>
            <LatexRenderer content={currentQuestion.content} />
          </Box>

          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>Chọn đáp án:</Typography>
            
            {/* --- Single Choice & Multiple Choice Logic --- */}
            {(currentQuestion.type === 'SINGLE_CHOICE' || currentQuestion.type === 'MULTIPLE_CHOICE') && (
              <FormGroup>
                {currentQuestion.answers.map((answer, index) => {
                  const isSelected = currentQuestion.type === 'SINGLE_CHOICE' 
                    ? selectedAnswers[currentQId] === answer.answerId
                    : (selectedAnswers[currentQId] || []).includes(answer.answerId);

                  return (
                    <FormControlLabel
                      key={answer.answerId}
                      value={answer.answerId}
                      disabled={isDisabled}
                      control={currentQuestion.type === 'SINGLE_CHOICE' ? <Radio /> : <Checkbox checked={isSelected} />}
                      label={
                        <Box sx={{ display: 'flex' }}>
                            <Typography sx={{ mr: 1, fontWeight: 'bold' }}>{getAnswerPrefix(index)}.</Typography>
                            <LatexRenderer content={answer.content} />
                        </Box>
                      }
                      onChange={currentQuestion.type === 'SINGLE_CHOICE' 
                        ? (e) => handleAnswerChange(currentQId, e.target.value, false) 
                        : () => handleAnswerChange(currentQId, answer.answerId, true)
                      }
                      sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        ml: 0,
                        // Highlight khi đã check (Luyện tập)
                        ...(isCheckedPractice &&
                          answer.is_correct && {
                            borderColor: 'success.main',
                            backgroundColor: 'success.lighter',
                          }),
                        ...(isCheckedPractice &&
                          !answer.is_correct &&
                          isSelected && {
                            borderColor: 'error.main',
                            backgroundColor: 'error.lighter',
                          }),
                      }}
                    />
                  );
                })}

                {/* Nút Check cho Luyện tập (Multi-choice) */}
                {currentQuestion.type === 'MULTIPLE_CHOICE' && !isCheckedPractice && (
                  <Button
                    onClick={() => handlePracticeCheckMulti(currentQuestion)}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2, alignSelf: 'flex-start' }}
                    startIcon={<CheckCircleIcon />}
                  >
                    Kiểm tra
                  </Button>
                )}
              </FormGroup>
            )}
          </Box>

          {/* HIỂN THỊ LỜI GIẢI (CHỈ SAU KHI CHECK) */}
          {isCheckedPractice && currentQuestion.explanation && (
            <Alert severity="success" icon={false} sx={{ mt: 3, '.MuiAlert-icon': { display: 'none' } }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'success.darker', fontWeight: 700 }}>
                🎉 Lời giải
              </Typography>

              {/* 1. Lời giải chung của Câu hỏi */}
              <Box sx={{ mb: 2, color: 'success.darker' }}>
                <LatexRenderer content={currentQuestion.explanation} />
              </Box>

              {/* 2. Lời giải chi tiết cho TẤT CẢ đáp án có explanation (CÓ A/B/C/D) */}
              {currentQuestion.answers
                .map((ans, index) => {
                  if (!ans.explanation) return null; // Chỉ hiển thị nếu có explanation

                  return (
                    <Box
                      key={index}
                      sx={{
                        borderTop: '1px dashed',
                        borderColor: 'success.main',
                        pt: 1,
                        mt: 1,
                        color: 'success.darker',
                      }}
                    >
                      <Typography variant="body2" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {getAnswerPrefix(index)}. {ans.is_correct ? 'Đúng' : 'Sai'}
                      </Typography>
                      <LatexRenderer content={ans.explanation} />
                    </Box>
                  );
                })}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 4. Thanh điều hướng (ĐÃ SỬA LOGIC NỘP BÀI) */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          p: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Câu trước
        </Button>

        {activeStep === questions.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<CheckCircleIcon />}
            onClick={handleSubmit} // Nút Nộp bài cuối cùng
            disabled={isFinished}
          >
            Nộp bài & Kết thúc
          </Button>
        ) : (
          <Button 
            variant="contained" 
            endIcon={<ArrowForwardIcon />} 
            onClick={handleNext}
          >
            Câu sau
          </Button>
        )}
      </Box>

      {/* 5. SnackBar */}
      <AppSnackbar
        open={snackbarState.open}
        message={snackbarState.message}
        severity={snackbarState.severity}
        onClose={handleCloseSnackbar}
      />
    </Container>
  );
}