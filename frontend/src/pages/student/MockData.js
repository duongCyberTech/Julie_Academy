/*
 * File: frontend/src/pages/student/MockData.js
 *
 * (Dữ liệu giả lập dùng chung cho Session và Review Page)
 */

export const PRACTICE_ID_1 = 'cd-c1-s1';

export const mockQuestionDatabase = [
  // Câu 1
  {
    questionId: 'q1',
    content: 'Phương trình $(x - 5)(3x + 9) = 0$ có tập nghiệm là:',
    explanation: 'Để giải phương trình tích $(ax+b)(cx+d)=0$, ta giải $ax+b=0$ và $cx+d=0$.',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      { answerId: 'q1a1', content: '$S = \\{5\\}$', is_correct: false, explanation: 'Thiếu nghiệm $x=-3$.' },
      { answerId: 'q1a2', content: '$S = \\{-3\\}$', is_correct: false, explanation: 'Thiếu nghiệm $x=5$.' },
      { answerId: 'q1a3', content: '$S = \\{5; -3\\}$', is_correct: true, explanation: 'Chính xác! $x-5=0 \\Rightarrow x=5$; $3x+9=0 \\Rightarrow x=-3$.' },
      { answerId: 'q1a4', content: '$S = \\{-5; 3\\}$', is_correct: false, explanation: 'Sai dấu.' },
    ],
  },
  // Câu 2
  {
    questionId: 'q2',
    content: 'Điều kiện xác định của phương trình $\\frac{2}{5x-3} = 1 + \\frac{1}{x+2}$ là gì?',
    explanation: 'Mẫu thức phải khác 0: $5x-3 \\ne 0$ và $x+2 \\ne 0$.',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      { answerId: 'q2a1', content: '$x \\ne \\frac{3}{5}$', is_correct: false, explanation: 'Thiếu điều kiện $x \\ne -2$.' },
      { answerId: 'q2a2', content: '$x \\ne -2$', is_correct: false, explanation: 'Thiếu điều kiện $x \\ne 3/5$.' },
      { answerId: 'q2a3', content: '$x \\ne \\frac{3}{5}$ và $x \\ne -2$', is_correct: true, explanation: 'Đúng. Cả 2 mẫu phải khác 0.' },
      { answerId: 'q2a4', content: '$x \\ne 0$', is_correct: false, explanation: 'Sai.' },
    ],
  },
  // Câu 3
  {
    questionId: 'q3',
    content: 'Phương trình nào sau đây có thể quy về phương trình bậc nhất một ẩn?',
    explanation: 'Phương trình dạng $ax+b=0$ ($a \\ne 0$).',
    level: 'EASY',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      { answerId: 'q3a1', content: '$x^2 - 1 = 0$', is_correct: false, explanation: 'Đây là PT bậc 2.' },
      { answerId: 'q3a2', content: '$\\frac{1}{x} = 5$', is_correct: true, explanation: 'Quy đồng ta được $1=5x \\Leftrightarrow 5x-1=0$.' },
      { answerId: 'q3a3', content: '$x^3 = 8$', is_correct: false, explanation: 'Đây là PT bậc 3.' },
      { answerId: 'q3a4', content: '$0x = 0$', is_correct: false, explanation: 'Vô số nghiệm, không phải bậc nhất.' },
    ],
  },
  // Câu 4
  {
    questionId: 'q4',
    content: 'Tìm tập nghiệm của phương trình $4x^2 - 16 = 5(x + 2)$.',
    explanation: 'Phân tích $4x^2-16 = 4(x-2)(x+2)$, chuyển vế đặt nhân tử chung.',
    level: 'MEDIUM',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      { answerId: 'q4a1', content: '$S = \\{2; -\\frac{13}{4}\\}$', is_correct: false, explanation: 'Sai nghiệm.' },
      { answerId: 'q4a2', content: '$S = \\{-2; \\frac{13}{4}\\}$', is_correct: true, explanation: '$(x+2)(4(x-2)-5)=0 \\Leftrightarrow (x+2)(4x-13)=0$.' },
      { answerId: 'q4a3', content: '$S = \\{-2\\}$', is_correct: false, explanation: 'Thiếu nghiệm.' },
      { answerId: 'q4a4', content: '$S = \\{\\frac{13}{4}\\}$', is_correct: false, explanation: 'Thiếu nghiệm.' },
    ],
  },
  // Câu 5
  {
    questionId: 'q5',
    content: 'Giải phương trình $\\frac{x^2 - 6}{x} = x + \\frac{3}{2}$.',
    explanation: 'ĐKXĐ: $x \\ne 0$. Quy đồng mẫu chung $2x$.',
    level: 'MEDIUM',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      { answerId: 'q5a1', content: '$x = 4$', is_correct: false, explanation: 'Sai dấu.' },
      { answerId: 'q5a2', content: '$x = -4$', is_correct: true, explanation: '$2(x^2-6) = 2x^2 + 3x \\Leftrightarrow 2x^2-12=2x^2+3x \\Leftrightarrow 3x=-12 \\Leftrightarrow x=-4$.' },
      { answerId: 'q5a3', content: 'Vô nghiệm', is_correct: false, explanation: 'Có nghiệm x=-4.' },
      { answerId: 'q5a4', content: '$x = 0$', is_correct: false, explanation: 'Vi phạm ĐKXĐ.' },
    ],
  },
  // Câu 6
  {
    questionId: 'q6',
    content: 'Giải phương trình $\\frac{4}{x(x-1)} + \\frac{3}{x} = \\frac{4}{x-1}$.',
    explanation: 'ĐKXĐ: $x \\ne 0, x \\ne 1$.',
    level: 'MEDIUM',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      { answerId: 'q6a1', content: '$x = 1$', is_correct: false, explanation: 'Vi phạm ĐKXĐ.' },
      { answerId: 'q6a2', content: '$x = 0$', is_correct: false, explanation: 'Vi phạm ĐKXĐ.' },
      { answerId: 'q6a3', content: 'Có nghiệm x=1', is_correct: false, explanation: 'Sai.' },
      { answerId: 'q6a4', content: 'Vô nghiệm', is_correct: true, explanation: 'Giải ra $x=1$ nhưng vi phạm ĐKXĐ nên vô nghiệm.' },
    ],
  },
  // Câu 7 (Multi)
  {
    questionId: 'q7_multi',
    content: 'Phương trình $x^2 - 4 + (x+2)(2x-1) = 0$ tương đương với phương trình nào?',
    explanation: 'Phân tích nhân tử chung $(x+2)$.',
    level: 'MEDIUM',
    type: 'MULTIPLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      { answerId: 'q7a1', content: '$(x+2)(3x-3) = 0$', is_correct: true, explanation: 'Đúng. $(x-2)(x+2) + (x+2)(2x-1) = (x+2)(x-2+2x-1)$.' },
      { answerId: 'q7a2', content: '$3(x+2)(x-1) = 0$', is_correct: true, explanation: 'Đúng (rút gọn từ câu trên).' },
      { answerId: 'q7a3', content: '$3x^2 + 3x - 6 = 0$', is_correct: true, explanation: 'Đúng (khai triển).' },
      { answerId: 'q7a4', content: '$(x+2)(x-3) = 0$', is_correct: false, explanation: 'Sai.' },
    ],
  },
  // Câu 8
  {
    questionId: 'q8',
    content: 'Mảnh đất HCN chu vi 52m. Làm vườn rau bên trong diện tích 112m², lối đi 1m. Tính chiều dài ban đầu.',
    explanation: 'Gọi chiều dài L, rộng W. Hệ: $L+W=26$ và $(L-2)(W-2)=112$.',
    level: 'HARD',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      { answerId: 'q8a1', content: '16 m', is_correct: true, explanation: 'Giải ra L=16, W=10.' },
      { answerId: 'q8a2', content: '10 m', is_correct: false, explanation: 'Đây là chiều rộng.' },
      { answerId: 'q8a3', content: '14 m', is_correct: false, explanation: 'Sai.' },
      { answerId: 'q8a4', content: '8 m', is_correct: false, explanation: 'Sai.' },
    ],
  },
  // Câu 9
  {
    questionId: 'q9',
    content: 'Hoa mua áo hết 600k. Giảm 30k/chiếc nên mua được gấp 1.25 lần dự định. Tính giá đã mua.',
    explanation: 'Gọi giá dự định là x. $600/(x-30) = 1.25 * (600/x)$.',
    level: 'HARD',
    type: 'SINGLE_CHOICE',
    assignTo: [PRACTICE_ID_1],
    answers: [
      { answerId: 'q9a1', content: '150 nghìn', is_correct: false, explanation: 'Đây là giá dự định.' },
      { answerId: 'q9a2', content: '120 nghìn', is_correct: true, explanation: 'Giá dự định 150k, giảm 30k còn 120k.' },
      { answerId: 'q9a3', content: '100 nghìn', is_correct: false, explanation: 'Sai.' },
      { answerId: 'q9a4', content: '180 nghìn', is_correct: false, explanation: 'Sai.' },
    ],
  },
];