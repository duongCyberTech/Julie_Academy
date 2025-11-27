/*
 * File: frontend/src/pages/student/StudentAssignmentSessionPage.jsx
 *
 * (CHẾ ĐỘ BÀI TẬP VỀ NHÀ - CÓ CHUYỂN HƯỚNG VÀ TRUYỀN KẾT QUẢ CHI TIẾT)
 *
 * Cập nhật:
 * 1. Cập nhật hàm handleSubmit để tính toán và lưu trữ detailedResults (kết quả chi tiết từng câu).
 * 2. Sử dụng navigate với state để truyền finalScore và detailedResults tới trang kết quả.
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
  Card,
  CardContent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';

// Import Katex
import 'katex/dist/katex.min.css';
import katex from 'katex';

import AppSnackbar from '../../components/SnackBar';

// ======================================================
// --- MOCK DATA (Giữ nguyên) ---
// ======================================================

const PRACTICE_ID_1 = 'cd-c1-s1';
const ASSIGNMENT_ID_1 = 'session_1';
const ASSIGNMENT_ID_4 = 'session_4';

// CSDL giả
const mockQuestionDatabase = [
  // --- 9 CÂU HỎI (Dùng cho Assignment 'session_1') ---
  {
    questionId: 'q1',
    content: 'Phương trình $(x - 5)(3x + 9) = 0$ có tập nghiệm là:',
    explanation:
      'Để giải phương trình tích $(ax+b)(cx+d)=0$, ta giải $ax+b=0$ và $cx+d=0$. Nghiệm là tập hợp các giá trị tìm được.',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
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
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
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
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
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
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
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
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
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
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
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
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
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
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
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
    assignTo: [PRACTICE_ID_1, ASSIGNMENT_ID_1],
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
  // --- 3 CÂU HỎI (Dùng cho Assignment 'session_4') ---
  {
    questionId: 'q10',
    content: 'Câu hỏi 1 (cho Bài tập 2): $1+1 = ?$ (ID: session_4)',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [ASSIGNMENT_ID_4],
    explanation: 'Đây là phép cộng cơ bản.',
    answers: [
      { answerId: 'q10a1', content: '$2$', is_correct: true, explanation: '1 + 1 = 2.' },
      { answerId: 'q10a2', content: '$3$', is_correct: false, explanation: 'Sai, 1 + 1 phải bằng 2.' },
    ],
  },
  {
    questionId: 'q11',
    content: 'Câu hỏi 2 (cho Bài tập 2): $10-5 = ?$ (ID: session_4)',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [ASSIGNMENT_ID_4],
    explanation: 'Đây là phép trừ cơ bản.',
    answers: [
      { answerId: 'q11a1', content: '$5$', is_correct: true, explanation: '10 - 5 = 5.' },
      { answerId: 'q11a2', content: '$4$', is_correct: false, explanation: 'Sai, 10 - 5 phải bằng 5.' },
    ],
  },
  {
    questionId: 'q12',
    content: 'Câu hỏi 3 (cho Bài tập 2): $2 \\times 3 = ?$ (ID: session_4)',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [ASSIGNMENT_ID_4],
    explanation: 'Đây là phép nhân cơ bản.',
    answers: [
      { answerId: 'q12a1', content: '$6$', is_correct: true, explanation: '2 x 3 = 6.' },
      { answerId: 'q12a2', content: '$5$', is_correct: false, explanation: 'Sai, 2 x 3 phải bằng 6.' },
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

// Helper để tạo tiền tố A, B, C, D...
const getAnswerPrefix = (index) => String.fromCharCode(65 + index); // 65 là mã ASCII của 'A'

// Hàm kiểm tra đúng/sai (dùng cho Stepper và hiển thị lời giải)
const isQuestionCorrect = (q, selectedAnswers) => {
  const correctAnswers = q.answers
    .filter((a) => a.is_correct)
    .map((a) => a.answerId);
  const userAnswers = selectedAnswers[q.questionId];

  if (q.type === 'SINGLE_CHOICE') {
    return userAnswers === correctAnswers[0];
  } else if (q.type === 'MULTIPLE_CHOICE') {
    // Nếu không chọn gì (bỏ qua) thì không tính đúng
    if (!userAnswers || userAnswers.length === 0) return false; 
      
    return (
      userAnswers.length === correctAnswers.length &&
      userAnswers.every((id) => correctAnswers.includes(id))
    );
  }
  return false;
};


export default function StudentAssignmentSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(null);

  // Ở trang này, isPracticeMode luôn là false
  const isPracticeMode = false;

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // 1. Tải câu hỏi khi trang được mở
  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      // Lọc câu hỏi CHỈ dành cho Assignment (Mock logic)
      const fetchedQuestions = mockQuestionDatabase.filter(
        (q) => q.assignTo && q.assignTo.includes(sessionId) && (q.assignTo.includes(ASSIGNMENT_ID_1) || q.assignTo.includes(ASSIGNMENT_ID_4))
      );

      setQuestions(fetchedQuestions);
      setIsLoading(false);
      setIsFinished(false);
      setScore(null);
      setActiveStep(0);
      setSelectedAnswers({});
    }, 500);
  }, [sessionId]);

  const currentQuestion = questions[activeStep];
  const currentQId = currentQuestion?.questionId;


  // 2. Xử lý khi chọn đáp án
  const handleAnswerChange = (questionId, answerId, isMultiChoice) => {
    // Chỉ cho phép thay đổi khi chưa nộp bài
    if (isFinished) {
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
  };

  // 3. Điều hướng
  const handleStepClick = (step) => {
    // Cho phép chuyển step bất cứ lúc nào trong Bài tập
    setActiveStep(step);
  };

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // 4. Các hàm SnackBar
  const showSnackBar = (message, severity) => {
    setSnackbarState({ open: true, message, severity });
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  // 5. Xử lý Nộp bài và CHUYỂN HƯỚNG (ĐÃ SỬA)
  const handleSubmit = () => {
    let correctCount = 0;
    const totalQuestions = questions.length;
    let totalSkipped = 0;
    
    // TÍNH ĐIỂM VÀ TẠO KẾT QUẢ CHI TIẾT
    const detailedResults = questions.map((q) => {
      const isCorrect = isQuestionCorrect(q, selectedAnswers);
      const userAnswers = selectedAnswers[q.questionId] || [];
      const hasAnswered = userAnswers.length > 0;
      
      if (isCorrect) {
        correctCount++;
      } else if (!hasAnswered) {
        totalSkipped++;
      }
      
      return {
        questionId: q.questionId,
        is_correct: isCorrect,
        selected: userAnswers,
        is_skipped: !hasAnswered,
      };
    });

    const finalScore = { 
        correct: correctCount, 
        total: totalQuestions,
        skipped: totalSkipped,
        incorrect: totalQuestions - correctCount - totalSkipped
    };

    setScore(finalScore);
    setIsFinished(true); 
    
    // Đảm bảo có thể hiển thị kết quả tổng quan ngay trên session page (tùy chọn)
    showSnackBar(`Hoàn thành! Bạn đúng ${finalScore.correct} / ${finalScore.total} câu.`, 'success');

    // CHUYỂN HƯỚNG TỚI TRANG KẾT QUẢ CHI TIẾT
    // Route: /student/assignment/session/:sessionId/result
    navigate(`/student/assignment/session/${sessionId}/result`, { 
        state: { 
            score: finalScore,
            questions: questions, // Dữ liệu câu hỏi gốc
            answers_taken: detailedResults, // Kết quả chi tiết của học sinh
        } 
    });
  };
  
  // 6. Làm lại (Chuyển hướng về trang danh sách Assignment)
  const handleRetry = () => {
    // Tạm thời: Quay về trang Bài tập
    navigate('/student/assignment'); 
  }

  // --- Render ---

  if (isLoading) {
    return <Container><LinearProgress sx={{ mt: 4 }} /></Container>;
  }

  if (questions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Không tìm thấy Bài tập
        </Typography>
        <Typography color="text.secondary">
          Không tìm thấy bài tập cho ID: {sessionId}.
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 3 }}
          onClick={() => navigate('/student/assignment')}
        >
          Quay lại Trang Bài tập
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

  const isDisabled = isFinished;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Bài tập về nhà: {sessionId}
      </Typography>

      {/* 1. Thanh Stepper */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, overflowX: 'auto' }}>
        <Stepper nonLinear activeStep={activeStep} sx={{ minWidth: '600px' }}>
          {questions.map((q, index) => {
            const isCorrect = isQuestionCorrect(q, selectedAnswers);
            const hasAnswered = (selectedAnswers[q.questionId] || []).length > 0;
            
            return (
              <Step key={q.questionId} completed={hasAnswered}>
                <StepButton 
                  color="inherit" 
                  onClick={() => handleStepClick(index)}
                  // Chỉ hiển thị đúng/sai sau khi nộp
                  icon={
                    isFinished 
                    ? (isCorrect ? <CheckCircleIcon color="success" /> : <CloseIcon color="error" />)
                    : (index + 1)
                  }
                />
              </Step>
            )
          })}
        </Stepper>
      </Paper>
      
      {/* 2. Khung hiển thị kết quả (sau khi nộp) - Tùy chọn */}
      {isFinished && score && (
        <Alert 
          severity={score.correct / score.total > 0.5 ? "success" : "warning"}
          sx={{ mb: 3, '.MuiAlert-message': { width: '100%' } }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Button color="inherit" size="small" onClick={() => navigate(`/student/assignment/session/${sessionId}/result`)}>
                Xem kết quả chi tiết
              </Button>
                <Button color="inherit" size="small" onClick={handleRetry} startIcon={<ReplayIcon />}>
                Về trang Bài tập
              </Button>
            </Box>
          }
        >
          <Typography variant="h6">
            Kết quả: {score.correct} / {score.total} (Đúng/Tổng)
          </Typography>
        </Alert>
      )}

      {/* 3. Thẻ câu hỏi và đáp án (Giữ nguyên logic render) */}
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" gutterBottom component="h2" sx={{ mb: 0, mr: 2 }}>
              Câu {activeStep + 1}:
            </Typography>
             {/* KHÔNG HIỂN THỊ ĐỘ KHÓ */}
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
                        // Highlight chỉ sau khi nộp
                        ...(isFinished &&
                          answer.is_correct && {
                            borderColor: 'success.main',
                            backgroundColor: 'success.lighter',
                          }),
                        ...(isFinished &&
                          !answer.is_correct &&
                          isSelected && {
                            borderColor: 'error.main',
                            backgroundColor: 'error.lighter',
                          }),
                      }}
                    />
                  );
                })}
              </FormGroup>
            )}

          </Box>

          {/* HIỂN THỊ LỜI GIẢI (CHỈ SAU KHI NỘP) */}
          {isFinished && currentQuestion.explanation && (
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
                        {getAnswerPrefix(index)}. {ans.is_correct ? 'Đáp án ĐÚNG (Chi tiết):' : 'Đáp án SAI (Phân tích):'}
                      </Typography>
                      <LatexRenderer content={ans.explanation} />
                    </Box>
                  );
                })}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 4. Thanh điều hướng */}
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

        {/* Nút Nộp bài */}
        {activeStep === questions.length - 1 && !isFinished && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<CheckCircleIcon />}
            onClick={handleSubmit}
          >
            Nộp bài
          </Button>
        )}

        {/* Nút Câu sau */}
        {activeStep < questions.length - 1 && (
          <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext}>
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