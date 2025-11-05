import {
  PrismaClient,
  QuestionType,
  DifficultyLevel,
  QuestionStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// Hàm trợ giúp để định dạng nội dung giống ReactQuill
function formatQuillContent(text) {
  if (!text) return null;
  // Thay thế $...$ bằng <span class="ql-formula">...</span>
  let html = text.replace(/\$(.*?)\$/g, (match, latexCode) => {
    return `<span class="ql-formula" data-value="${latexCode.replace(/"/g, '&quot;')}">${latexCode}</span>`;
  });
  // Bọc trong <p> nếu chưa có
  if (!html.startsWith('<p>') && !html.endsWith('</p>')) {
    html = `<p>${html}</p>`;
  }
  return html;
}

const createAnswersData = (answers) => {
  return answers.map((ans, index) => ({
    aid: index + 1,
    content: formatQuillContent(ans.content), 
    is_correct: ans.is_correct,
    explaination: ans.explaination ? formatQuillContent(ans.explanation) : null,
  }));
};

async function main() {
  console.log(`Bắt đầu seeding Questions và Answers cho Toán 9...`);

  const tutor = await prisma.user.findFirst({
    where: { email: 'system.tutor@julie.com' },
  });

  const category1 = await prisma.categories.findUnique({
    where: {
      category_name: '§1. Phương trình quy về phương trình bậc nhất một ẩn',
    },
  });
  const category2 = await prisma.categories.findUnique({
    where: {
      category_name:
        '§2. Phương trình bậc nhất hai ẩn. Hệ hai phương trình bậc nhất hai ẩn',
    },
  });
  const category3 = await prisma.categories.findUnique({
    where: { category_name: '§3. Giải hệ hai phương trình bậc nhất hai ẩn' },
  });

  if (!tutor) {
    throw new Error(
      "Không thể seed Questions: Tutor hệ thống 'system.tutor@julie.com' không tồn tại.",
    );
  }
  if (!category1 || !category2 || !category3) {
    throw new Error(
      'Không thể seed Questions: Cần Categories của Toán 9 tồn tại.',
    );
  }
  console.log(
    `Đã tìm thấy Tutor Hệ thống: ${tutor.email} và các Categories cần thiết.`,
  );

  // --- Dữ liệu câu hỏi & trả lời (Định dạng HTML) ---
  // Mảng này chứa TẤT CẢ 27 câu hỏi
  const questionsData = [
    // ============================================
    // === §1. Phương trình quy về PT bậc nhất 1 ẩn (9 câu) ===
    // ============================================
    // --- Easy ---
    {
      content: 'Phương trình $(x - 5)(3x + 9) = 0$ có tập nghiệm là:',
      explaination:
        'Để giải phương trình tích $(ax+b)(cx+d)=0$, ta giải $ax+b=0$ và $cx+d=0$. Nghiệm là tập hợp các giá trị tìm được.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$S = \\{5\\}$', is_correct: false },
        { content: '$S = \\{-3\\}$', is_correct: false },
        {
          content: '$S = \\{5; -3\\}$',
          is_correct: true,
          explaination:
            'Giải $x-5=0 \\implies x=5$. Giải $3x+9=0 \\implies 3x=-9 \\implies x=-3$.',
        },
        { content: '$S = \\{-5; 3\\}$', is_correct: false },
      ],
    },
    {
      content:
        'Điều kiện xác định của phương trình $\\frac{2}{5x-3} = 1 + \\frac{1}{x+2}$ là gì?',
      explaination:
        'Điều kiện xác định của phương trình chứa ẩn ở mẫu là điều kiện để tất cả các mẫu thức khác 0.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x \\ne \\frac{3}{5}$',
          is_correct: false,
          explaination: 'Thiếu điều kiện cho mẫu $x+2$.',
        },
        {
          content: '$x \\ne -2$',
          is_correct: false,
          explaination: 'Thiếu điều kiện cho mẫu $5x-3$.',
        },
        {
          content: '$x \\ne \\frac{3}{5}$ và $x \\ne -2$',
          is_correct: true,
          explaination:
            'Mẫu $5x-3 \\ne 0 \\implies x \\ne 3/5$. Mẫu $x+2 \\ne 0 \\implies x \\ne -2$.',
        },
        {
          content: '$x \\ne 0$',
          is_correct: false,
          explaination: 'Mẫu số không phải là x.',
        },
      ],
    },
    {
      content:
        'Phương trình nào sau đây có thể quy về phương trình bậc nhất một ẩn?',
      explaination:
        'Phương trình bậc nhất một ẩn có dạng $ax+b=0$ ($a \\ne 0$). Một số phương trình có thể biến đổi về dạng này.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x^2 - 1 = 0$',
          is_correct: false,
          explaination: 'Đây là phương trình bậc hai.',
        },
        {
          content: '$\\frac{1}{x} = 5$',
          is_correct: true,
          explaination:
            'ĐKXĐ $x \\ne 0$. Quy đồng: $1 = 5x \\implies 5x - 1 = 0$, là phương trình bậc nhất.',
        },
        {
          content: '$x^3 = 8$',
          is_correct: false,
          explaination: 'Đây là phương trình bậc ba.',
        },
        {
          content: '$0x = 0$',
          is_correct: false,
          explaination:
            'Đây là phương trình có vô số nghiệm, không phải bậc nhất.',
        },
      ],
    },
    // --- Medium ---
    {
      content: 'Tìm tập nghiệm của phương trình $4x^2 - 16 = 5(x + 2)$.',
      explaination:
        'Phân tích vế trái thành $4(x-2)(x+2)$, chuyển vế và đặt nhân tử chung $(x+2)$ để đưa về phương trình tích.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$S = \\{2; -\\frac{13}{4}\\}$',
          is_correct: false,
          explaination: 'Kiểm tra lại phép tính.',
        },
        {
          content: '$S = \\{-2; \\frac{13}{4}\\}$',
          is_correct: true,
          explaination:
            '$4(x-2)(x+2) - 5(x+2) = 0 \\implies (x+2)[4(x-2)-5] = 0 \\implies (x+2)(4x-8-5)=0 \\implies (x+2)(4x-13)=0$. Vậy $x=-2$ hoặc $x=13/4$.',
        },
        {
          content: '$S = \\{-2\\}$',
          is_correct: false,
          explaination: 'Thiếu nghiệm $x=13/4$.',
        },
        {
          content: '$S = \\{\\frac{13}{4}\\}$',
          is_correct: false,
          explaination: 'Thiếu nghiệm $x=-2$.',
        },
      ],
    },
    {
      content: 'Giải phương trình $\\frac{x^2 - 6}{x} = x + \\frac{3}{2}$.',
      explaination:
        'Tìm ĐKXĐ, quy đồng khử mẫu, giải phương trình hệ quả, sau đó kiểm tra nghiệm với ĐKXĐ.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x = 4$',
          is_correct: false,
          explaination: 'Kiểm tra lại phép tính.',
        },
        {
          content: '$x = -4$',
          is_correct: true,
          explaination:
            'ĐKXĐ: $x \\ne 0$. Quy đồng mẫu chung là $2x$. Khử mẫu: $2(x^2 - 6) = 2x(x) + x(3) \\implies 2x^2 - 12 = 2x^2 + 3x \\implies -12 = 3x \\implies x = -4$. Nghiệm $x=-4$ thỏa mãn ĐKXĐ.',
        },
        {
          content: 'Phương trình vô nghiệm',
          is_correct: false,
          explaination: 'Phương trình có nghiệm $x=-4$.',
        },
        {
          content: '$x = 0$',
          is_correct: false,
          explaination: 'Nghiệm này vi phạm ĐKXĐ.',
        },
      ],
    },
    {
      content:
        'Giải phương trình $\\frac{4}{x(x-1)} + \\frac{3}{x} = \\frac{4}{x-1}$.',
      explaination:
        'Tìm ĐKXĐ, quy đồng mẫu thức rồi khử mẫu, giải phương trình hệ quả và đối chiếu với ĐKXĐ.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x = 1$',
          is_correct: false,
          explaination: 'Nghiệm này vi phạm điều kiện xác định.',
        },
        {
          content: '$x = 0$',
          is_correct: false,
          explaination: 'Nghiệm này vi phạm điều kiện xác định.',
        },
        {
          content: 'Phương trình có nghiệm $x=1$',
          is_correct: false,
          explaination: 'Nghiệm $x=1$ không thỏa mãn ĐKXĐ.',
        },
        {
          content: 'Phương trình vô nghiệm',
          is_correct: true,
          explaination:
            'ĐKXĐ: $x \\ne 0$ và $x \\ne 1$. Quy đồng và khử mẫu: $4 + 3(x-1) = 4x \\implies 4 + 3x - 3 = 4x \\implies 3x + 1 = 4x \\implies x = 1$. Tuy nhiên, $x=1$ không thỏa mãn ĐKXĐ nên phương trình vô nghiệm.',
        },
      ],
    },
    {
      content:
        'Phương trình $x^2 - 4 + (x+2)(2x-1) = 0$ tương đương với phương trình nào sau đây? (Chọn các đáp án đúng)',
      explaination:
        'Phân tích $x^2-4$ thành $(x-2)(x+2)$, sau đó đặt nhân tử chung $(x+2)$ để đưa về phương trình tích.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: category1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$(x+2)(3x-3) = 0$',
          is_correct: true,
          explaination:
            'PT $\\iff (x-2)(x+2) + (x+2)(2x-1) = 0 \\iff (x+2)[(x-2)+(2x-1)]=0 \\iff (x+2)(3x-3)=0$. Đây là dạng tương đương.',
        },
        {
          content: '$3(x+2)(x-1) = 0$',
          is_correct: true,
          explaination:
            'Từ $(x+2)(3x-3)=0$, đặt nhân tử chung 3: $3(x+2)(x-1)=0$. Đây cũng là dạng tương đương.',
        },
        {
          content: '$3x^2 + 3x - 6 = 0$',
          is_correct: true,
          explaination:
            'Khai triển $(x+2)(3x-3) = 3x^2 - 3x + 6x - 6 = 3x^2 + 3x - 6$. Đây cũng là dạng tương đương.',
        },
        {
          content: '$(x+2)(x-3) = 0$',
          is_correct: false,
          explaination: 'Sai khi cộng các hạng tử trong ngoặc vuông.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Một mảnh đất hình chữ nhật có chu vi 52m. Làm vườn rau hình chữ nhật bên trong, diện tích 112 $m^2$, lối đi xung quanh rộng 1m. Tính chiều dài mảnh đất ban đầu.',
      explaination:
        'Gọi chiều dài và chiều rộng mảnh đất là $L, W$. Ta có $2(L+W)=52$. Kích thước vườn rau là $(L-2), (W-2)$. Lập phương trình diện tích vườn rau $(L-2)(W-2)=112$. Giải hệ phương trình này.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '16 m',
          is_correct: true,
          explaination:
            'Từ chu vi, $L+W=26 \\implies W=26-L$. Thay vào PT diện tích vườn: $(L-2)( (26-L)-2 ) = 112 \\implies (L-2)(24-L) = 112 \\implies 24L - L^2 - 48 + 2L = 112 \\implies -L^2 + 26L - 160 = 0 \\implies L^2 - 26L + 160 = 0$. Giải PT bậc hai: $\\Delta = (-26)^2 - 4(1)(160) = 676 - 640 = 36$. Nghiệm $L = (26 \\pm \\sqrt{36})/2 = (26 \\pm 6)/2$. Vậy $L=16$ hoặc $L=10$. Vì L là chiều dài nên $L=16$m (khi đó $W=10$m).',
        },
        {
          content: '10 m',
          is_correct: false,
          explaination: 'Đây là chiều rộng mảnh đất.',
        },
        {
          content: '14 m',
          is_correct: false,
          explaination: 'Đây là chiều dài vườn rau.',
        },
        {
          content: '8 m',
          is_correct: false,
          explaination: 'Đây là chiều rộng vườn rau.',
        },
      ],
    },
    {
      content:
        'Hoa dự định mua một số áo đồng giá hết 600 nghìn. Cửa hàng giảm 30 nghìn/chiếc nên Hoa mua được gấp 1.25 lần số lượng dự định. Tính giá tiền mỗi chiếc áo Hoa đã mua (giá sau giảm).',
      explaination:
        'Gọi giá dự định là $x$ (nghìn đồng/chiếc), $x>30$. Lập phương trình dựa trên mối quan hệ về số lượng mua được trước và sau khi giảm giá.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '150 nghìn đồng',
          is_correct: false,
          explaination: 'Đây là giá dự định.',
        },
        {
          content: '120 nghìn đồng',
          is_correct: true,
          explaination:
            'Gọi giá dự định là $x$ (nghìn), $x>30$. Số lượng dự định: $600/x$. Giá sau giảm: $x-30$. Số lượng mua được: $600/(x-30)$. Ta có: $600/(x-30) = 1.25 \\times (600/x)$. ĐKXĐ $x>30$. Rút gọn: $1/(x-30) = 1.25/x \\implies x = 1.25(x-30) \\implies x = 1.25x - 37.5 \\implies 0.25x = 37.5 \\implies x = 37.5 / 0.25 = 150$. Giá dự định là 150 nghìn. Giá đã mua (sau giảm) là $150 - 30 = 120$ nghìn.',
        },
        {
          content: '100 nghìn đồng',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '180 nghìn đồng',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },

    // =================================================================
    // === §2. PT bậc nhất 2 ẩn. Hệ hai PT bậc nhất 2 ẩn (9 câu) ===
    // =================================================================
    // --- Easy ---
    {
      content: 'Phương trình nào sau đây là phương trình bậc nhất hai ẩn x, y?',
      explaination:
        'Phương trình bậc nhất hai ẩn x, y có dạng $ax+by=c$, trong đó a, b, c là các số cho trước, với điều kiện $a \\ne 0$ hoặc $b \\ne 0$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$2x^2 - y = 1$',
          is_correct: false,
          explaination: 'Có chứa $x^2$.',
        },
        {
          content: '$0x + 3y = 9$',
          is_correct: true,
          explaination:
            'Có dạng $ax+by=c$ với $a=0, b=3, c=9$. Vì $b \\ne 0$ nên đây là PT bậc nhất hai ẩn.',
        },
        {
          content: '$xy = 5$',
          is_correct: false,
          explaination: 'Có chứa tích $xy$.',
        },
        {
          content: '$x + y + z = 10$',
          is_correct: false,
          explaination: 'Đây là phương trình bậc nhất ba ẩn.',
        },
      ],
    },
    {
      content:
        'Cặp số nào sau đây là một nghiệm của phương trình $2x - 3y = 5$?',
      explaination:
        'Một cặp số $(x_0; y_0)$ là nghiệm của phương trình $ax+by=c$ nếu $ax_0 + by_0 = c$ là một khẳng định đúng.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '(1; 1)',
          is_correct: false,
          explaination:
            'Thay $x=1, y=1$ vào PT: $2(1) - 3(1) = 2 - 3 = -1 \\ne 5$.',
        },
        {
          content: '(0; 5)',
          is_correct: false,
          explaination:
            'Thay $x=0, y=5$ vào PT: $2(0) - 3(5) = 0 - 15 = -15 \\ne 5$.',
        },
        {
          content: '(4; 1)',
          is_correct: true,
          explaination:
            'Thay $x=4, y=1$ vào PT: $2(4) - 3(1) = 8 - 3 = 5$. Khẳng định đúng.',
        },
        {
          content: '(-1; 1)',
          is_correct: false,
          explaination:
            'Thay $x=-1, y=1$ vào PT: $2(-1) - 3(1) = -2 - 3 = -5 \\ne 5$.',
        },
      ],
    },
    {
      content:
        'Cho hệ phương trình $\\begin{cases} x+2y=1 \\\\ 3x-2y=3 \\end{cases}$. Cặp số nào là nghiệm của hệ?',
      explaination:
        'Cặp số $(x_0; y_0)$ là nghiệm của hệ nếu nó là nghiệm của từng phương trình trong hệ.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '(3; -1)',
          is_correct: false,
          explaination:
            'Thay vào PT(1): $3 + 2(-1) = 1$ (đúng). Thay vào PT(2): $3(3) - 2(-1) = 9 + 2 = 11 \\ne 3$ (sai).',
        },
        {
          content: '(1; 0)',
          is_correct: true,
          explaination:
            'Thay vào PT(1): $1 + 2(0) = 1$ (đúng). Thay vào PT(2): $3(1) - 2(0) = 3$ (đúng).',
        },
        {
          content: '(-1; 1)',
          is_correct: false,
          explaination:
            'Thay vào PT(1): $-1 + 2(1) = 1$ (đúng). Thay vào PT(2): $3(-1) - 2(1) = -3 - 2 = -5 \\ne 3$ (sai).',
        },
        {
          content: '(0; 1/2)',
          is_correct: false,
          explaination:
            'Thay vào PT(1): $0 + 2(1/2) = 1$ (đúng). Thay vào PT(2): $3(0) - 2(1/2) = -1 \\ne 3$ (sai).',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Một lạng thịt bò chứa 26g protein, một lạng thịt cá chứa 22g protein. Gọi x, y lần lượt là số lạng thịt bò và thịt cá ăn trong ngày. Viết phương trình biểu thị việc bổ sung đủ 70g protein từ hai loại thịt này.',
      explaination:
        'Tổng lượng protein từ x lạng thịt bò và y lạng thịt cá phải bằng 70g.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x + y = 70$',
          is_correct: false,
          explaination:
            'Đây là phương trình về tổng khối lượng, không phải protein.',
        },
        {
          content: '$26x = 70$',
          is_correct: false,
          explaination: 'Thiếu lượng protein từ thịt cá.',
        },
        {
          content: '$22y = 70$',
          is_correct: false,
          explaination: 'Thiếu lượng protein từ thịt bò.',
        },
        {
          content: '$26x + 22y = 70$',
          is_correct: true,
          explaination:
            'Lượng protein từ thịt bò là $26x$, từ thịt cá là $22y$. Tổng là $26x + 22y = 70$.',
        },
      ],
    },
    {
      content:
        'Biết (1; -1) là một nghiệm của phương trình $2x - 3y = 5$. Tìm một nghiệm khác của phương trình này.',
      explaination:
        'Phương trình bậc nhất hai ẩn có vô số nghiệm. Có thể cho x một giá trị bất kỳ và tìm y tương ứng (hoặc ngược lại).',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '(0; 0)',
          is_correct: false,
          explaination: 'Thay $x=0, y=0$ vào PT: $2(0) - 3(0) = 0 \\ne 5$.',
        },
        {
          content: '(2.5; 0)',
          is_correct: true,
          explaination:
            'Thay $x=2.5, y=0$ vào PT: $2(2.5) - 3(0) = 5 - 0 = 5$. Khẳng định đúng.',
        },
        {
          content: '(1; 1)',
          is_correct: false,
          explaination: 'Thay $x=1, y=1$ vào PT: $2(1) - 3(1) = -1 \\ne 5$.',
        },
        {
          content: '(0; -1.5)',
          is_correct: false,
          explaination:
            'Thay $x=0, y=-1.5$ vào PT: $2(0) - 3(-1.5) = 4.5 \\ne 5$.',
        },
      ],
    },
    {
      content:
        'Hệ phương trình nào sau đây KHÔNG phải là hệ hai phương trình bậc nhất hai ẩn?',
      explaination:
        'Hệ hai phương trình bậc nhất hai ẩn gồm hai phương trình có dạng $ax+by=c$ ($a \\ne 0$ hoặc $b \\ne 0$).',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content:
            '$\\begin{cases} 2x - 3y = 5 \\\\ x + 3y = -11 \\end{cases}$',
          is_correct: false,
          explaination: 'Cả hai phương trình đều là bậc nhất hai ẩn.',
        },
        {
          content: '$\\begin{cases} 2x - 3y = 5 \\\\ 3x = -6 \\end{cases}$',
          is_correct: false,
          explaination:
            'Phương trình thứ hai là $3x + 0y = -6$, cũng là bậc nhất hai ẩn.',
        },
        {
          content: '$\\begin{cases} 9y = -27 \\\\ x + 3y = -11 \\end{cases}$',
          is_correct: false,
          explaination:
            'Phương trình thứ nhất là $0x + 9y = -27$, cũng là bậc nhất hai ẩn.',
        },
        {
          content:
            '$\\begin{cases} x^2 + y^2 = 121 \\\\ x + 3y = -11 \\end{cases}$',
          is_correct: true,
          explaination:
            'Phương trình đầu tiên $x^2 + y^2 = 121$ không phải là phương trình bậc nhất.',
        },
      ],
    },
    {
      content:
        'Dũng mua 5 vở, 3 bút hết 39 nghìn. Huy mua 6 vở, 2 bút hết 42 nghìn. Gọi x, y là giá vở và bút (nghìn đồng). Hệ phương trình biểu thị bài toán là?',
      explaination:
        'Lập phương trình tổng số tiền cho mỗi bạn Dũng và Huy dựa vào số lượng và giá tiền x, y.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content:
            '$\\begin{cases} 5x + 6y = 39 \\\\ 3x + 2y = 42 \\end{cases}$',
          is_correct: false,
          explaination: 'Sai hệ số.',
        },
        {
          content: '$\\begin{cases} x + y = 8 \\\\ x + y = 8 \\end{cases}$',
          is_correct: false,
          explaination: 'Sai phương trình.',
        },
        {
          content:
            '$\\begin{cases} 5x + 3y = 39 \\\\ 6x + 2y = 42 \\end{cases}$',
          is_correct: true,
          explaination: 'Tiền Dũng trả: $5x+3y=39$. Tiền Huy trả: $6x+2y=42$.',
        },
        {
          content:
            '$\\begin{cases} 3x + 5y = 39 \\\\ 2x + 6y = 42 \\end{cases}$',
          is_correct: false,
          explaination: 'Sai hệ số.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Cô Hạnh có hai khoản đầu tư lãi suất 8%/năm và 10%/năm. Tổng tiền lãi hàng năm là 160 triệu đồng. Gọi x, y là số tiền đầu tư (triệu đồng) tương ứng. Phương trình nào biểu diễn đúng mối quan hệ?',
      explaination:
        'Tổng tiền lãi từ khoản thứ nhất (8% của x) và khoản thứ hai (10% của y) bằng 160 triệu.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x + y = 160$',
          is_correct: false,
          explaination: 'Đây là tổng số vốn nếu tổng vốn là 160 triệu.',
        },
        {
          content: '$8x + 10y = 160$',
          is_correct: false,
          explaination: 'Sai cách tính phần trăm lãi suất.',
        },
        {
          content: '$0.08x + 0.10y = 160$',
          is_correct: true,
          explaination:
            'Tiền lãi khoản 1: $8\\%x = 0.08x$. Tiền lãi khoản 2: $10\\%y = 0.10y$. Tổng lãi: $0.08x + 0.10y = 160$. Có thể viết lại thành $\\frac{2x}{25} + \\frac{y}{10} = 160$ hoặc $4x + 5y = 8000$.',
        },
        {
          content: '$0.8x + y = 160$',
          is_correct: false,
          explaination: 'Sai cách tính phần trăm lãi suất.',
        },
      ],
    },
    {
      content:
        'Tập hợp các điểm $(x; y)$ trong mặt phẳng tọa độ Oxy biểu diễn các nghiệm của phương trình $0x + 2y = 4$ là đường thẳng nào?',
      explaination:
        'Phương trình $0x+by=c$ ($b \\ne 0$) có nghiệm là các cặp $(x_0; c/b)$ với $x_0$ bất kỳ. Tập hợp các điểm này tạo thành đường thẳng $y = c/b$, song song hoặc trùng với trục Ox.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đường thẳng $x = 2$',
          is_correct: false,
          explaination:
            'Đây là đường thẳng biểu diễn nghiệm của phương trình $ax + 0y = c$.',
        },
        {
          content: 'Đường thẳng $y = 4$',
          is_correct: false,
          explaination: 'Chia sai $c/b$.',
        },
        {
          content: 'Đường thẳng $y = 2$',
          is_correct: true,
          explaination:
            'Phương trình $0x+2y=4 \\implies 2y=4 \\implies y=2$. Đây là đường thẳng song song với trục Ox và cắt trục Oy tại điểm (0; 2).',
        },
        {
          content: 'Đường thẳng $y = -2x + 2$',
          is_correct: false,
          explaination:
            'Đây là dạng $y = mx+n$, tương ứng với phương trình $ax+by=c$ khi $a,b \\ne 0$.',
        },
      ],
    },

    // ======================================================
    // === §3. Giải hệ hai PT bậc nhất hai ẩn (9 câu) ===
    // ======================================================
    // --- Easy ---
    {
      content:
        'Hệ phương trình $\\begin{cases} x+y=7 \\\\ x-y=1 \\end{cases}$ có nghiệm là:',
      explaination:
        'Cộng vế theo vế hai phương trình để khử y, tìm x. Sau đó thay x vào một trong hai phương trình để tìm y.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '(x; y) = (3; 4)',
          is_correct: false,
          explaination: 'Thay vào PT(2): $3 - 4 = -1 \\ne 1$.',
        },
        {
          content: '(x; y) = (4; 3)',
          is_correct: true,
          explaination:
            'Cộng hai PT: $(x+y)+(x-y)=7+1 \\implies 2x=8 \\implies x=4$. Thay vào PT(1): $4+y=7 \\implies y=3$.',
        },
        {
          content: '(x; y) = (1; 6)',
          is_correct: false,
          explaination: 'Thay vào PT(2): $1 - 6 = -5 \\ne 1$.',
        },
        {
          content: '(x; y) = (6; 1)',
          is_correct: false,
          explaination:
            'Thay vào PT(1): $6 + 1 = 7$ (đúng), nhưng thay vào PT(2): $6 - 1 = 5 \\ne 1$.',
        },
      ],
    },
    {
      content:
        'Giải hệ phương trình $\\begin{cases} y = 2x \\\\ x + y = 9 \\end{cases}$ bằng phương pháp thế.',
      explaination:
        'Thế biểu thức $y=2x$ từ phương trình thứ nhất vào phương trình thứ hai để tìm x. Sau đó tìm y.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '(x; y) = (6; 3)',
          is_correct: false,
          explaination: '$y=3 \\ne 2x=2(6)=12$.',
        },
        {
          content: '(x; y) = (3; 6)',
          is_correct: true,
          explaination:
            'Thế $y=2x$ vào PT(2): $x + 2x = 9 \\implies 3x=9 \\implies x=3$. Suy ra $y = 2x = 2(3) = 6$.',
        },
        {
          content: '(x; y) = (1; 8)',
          is_correct: false,
          explaination: '$y=8 \\ne 2x=2(1)=2$.',
        },
        {
          content: '(x; y) = (9; 0)',
          is_correct: false,
          explaination: '$y=0 \\ne 2x=2(9)=18$.',
        },
      ],
    },
    {
      content: 'Hệ phương trình nào sau đây vô nghiệm?',
      explaination:
        "Hệ $\\begin{cases} ax+by=c \\\\ a''x+b''y=c'' \\end{cases}$ vô nghiệm nếu $\\frac{a}{a''} = \\frac{b}{b''} \\ne \\frac{c}{c''}$.",
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\begin{cases} x+y=2 \\\\ 2x+2y=4 \\end{cases}$',
          is_correct: false,
          explaination:
            'Hệ này có vô số nghiệm vì $\\frac{1}{2} = \\frac{1}{2} = \\frac{2}{4}$.',
        },
        {
          content: '$\\begin{cases} x+y=2 \\\\ x-y=0 \\end{cases}$',
          is_correct: false,
          explaination:
            'Hệ này có nghiệm duy nhất vì $\\frac{1}{1} \\ne \\frac{1}{-1}$.',
        },
        {
          content: '$\\begin{cases} x+y=2 \\\\ 2x+2y=5 \\end{cases}$',
          is_correct: true,
          explaination:
            'Vì $\\frac{1}{2} = \\frac{1}{2} \\ne \\frac{2}{5}$, hệ vô nghiệm.',
        },
        {
          content: '$\\begin{cases} x+y=2 \\\\ 2x+y=3 \\end{cases}$',
          is_correct: false,
          explaination:
            'Hệ này có nghiệm duy nhất vì $\\frac{1}{2} \\ne \\frac{1}{1}$.',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Giải hệ phương trình $\\begin{cases} 2x+y=5 \\\\ 3x-2y=11 \\end{cases}$.',
      explaination:
        'Từ phương trình (1), rút $y = 5-2x$. Thế vào phương trình (2) để tìm x, sau đó tìm y.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '(x; y) = (1; 3)',
          is_correct: false,
          explaination: 'Thay vào PT(2): $3(1) - 2(3) = 3 - 6 = -3 \\ne 11$.',
        },
        {
          content: '(x; y) = (3; -1)',
          is_correct: true,
          explaination:
            'Từ PT(1): $y = 5-2x$. Thế vào PT(2): $3x - 2(5-2x) = 11 \\implies 3x - 10 + 4x = 11 \\implies 7x = 21 \\implies x=3$. Suy ra $y = 5 - 2(3) = 5 - 6 = -1$.',
        },
        {
          content: '(x; y) = (-1; 7)',
          is_correct: false,
          explaination:
            'Thay vào PT(2): $3(-1) - 2(7) = -3 - 14 = -17 \\ne 11$.',
        },
        {
          content: '(x; y) = (2; 1)',
          is_correct: false,
          explaination: 'Thay vào PT(2): $3(2) - 2(1) = 6 - 2 = 4 \\ne 11$.',
        },
      ],
    },
    {
      content:
        'Tìm nghiệm của hệ phương trình $\\begin{cases} 3x+2y=4 \\\\ -2x+3y=-7 \\end{cases}$.',
      explaination:
        'Nhân PT(1) với 2 và PT(2) với 3 để hệ số của x đối nhau. Cộng vế theo vế để tìm y, sau đó tìm x.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '(x; y) = (2; -1)',
          is_correct: true,
          explaination:
            'Nhân PT(1) với 2: $6x+4y=8$. Nhân PT(2) với 3: $-6x+9y=-21$. Cộng lại: $13y = -13 \\implies y=-1$. Thay vào PT(1): $3x + 2(-1) = 4 \\implies 3x - 2 = 4 \\implies 3x = 6 \\implies x=2$.',
        },
        {
          content: '(x; y) = (-1; 2)',
          is_correct: false,
          explaination: 'Thay vào PT(1): $3(-1)+2(2) = -3+4 = 1 \\ne 4$.',
        },
        {
          content: '(x; y) = (1; 1/2)',
          is_correct: false,
          explaination:
            'Thay vào PT(2): $-2(1)+3(1/2) = -2+1.5 = -0.5 \\ne -7$.',
        },
        {
          content: '(x; y) = (0; 2)',
          is_correct: false,
          explaination: 'Thay vào PT(2): $-2(0)+3(2) = 6 \\ne -7$.',
        },
      ],
    },
    {
      content:
        'Hệ phương trình $\\begin{cases} 12x-4y=-16 \\\\ 3x-y=-4 \\end{cases}$ có bao nhiêu nghiệm?',
      explaination:
        "Quan sát tỉ lệ các hệ số. Nếu $\\frac{a}{a''} = \\frac{b}{b''} = \\frac{c}{c''}$ thì hệ có vô số nghiệm.",
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Vô nghiệm',
          is_correct: false,
          explaination: 'Kiểm tra lại tỉ lệ hệ số.',
        },
        {
          content: 'Một nghiệm duy nhất',
          is_correct: false,
          explaination: 'Kiểm tra lại tỉ lệ hệ số.',
        },
        {
          content: 'Vô số nghiệm',
          is_correct: true,
          explaination:
            'Ta có $\\frac{12}{3} = 4$, $\\frac{-4}{-1} = 4$, $\\frac{-16}{-4} = 4$. Vì các tỉ lệ bằng nhau nên hệ có vô số nghiệm.',
        },
        {
          content: 'Hai nghiệm',
          is_correct: false,
          explaination:
            'Hệ PT bậc nhất hai ẩn chỉ có thể vô nghiệm, 1 nghiệm hoặc vô số nghiệm.',
        },
      ],
    },
    {
      content:
        'Giải hệ phương trình $\\begin{cases} -\\frac{3}{4}x+\\frac{1}{2}y=-2 \\\\ \\frac{3}{2}x-y=0 \\end{cases}$.',
      explaination:
        'Có thể nhân hai vế của mỗi phương trình với một số thích hợp để khử mẫu số trước khi giải bằng phương pháp thế hoặc cộng đại số.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Hệ vô nghiệm',
          is_correct: true,
          explaination:
            'Nhân PT(1) với 4: $-3x+2y=-8$. Nhân PT(2) với 2: $3x-2y=0$. Cộng hai phương trình mới: $(-3x+2y) + (3x-2y) = -8 + 0 \\implies 0x + 0y = -8$. Đây là phương trình vô nghiệm, do đó hệ ban đầu vô nghiệm.',
        },
        {
          content: 'Hệ có vô số nghiệm',
          is_correct: false,
          explaination: 'Phương trình cuối cùng là $0 = -8$, không phải $0=0$.',
        },
        {
          content: '(x; y) = (2; 3)',
          is_correct: false,
          explaination:
            'Thay vào PT(2): $3/2 * 2 - 3 = 3 - 3 = 0$ (đúng). Thay vào PT(1): $-3/4 * 2 + 1/2 * 3 = -3/2 + 3/2 = 0 \\ne -2$ (sai).',
        },
        {
          content: '(x; y) = (4; 6)',
          is_correct: false,
          explaination:
            'Thay vào PT(1): $-3/4 * 4 + 1/2 * 6 = -3 + 3 = 0 \\ne -2$ (sai).',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Một trường mua 500 quyển vở loại I (8 nghìn/quyển) và loại II (9 nghìn/quyển) hết tổng cộng 4.2 triệu đồng. Hỏi trường mua bao nhiêu quyển vở loại I?',
      explaination:
        'Gọi x, y là số quyển vở loại I và loại II. Lập hệ phương trình: một phương trình về tổng số quyển vở, một phương trình về tổng số tiền. Giải hệ phương trình này.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '200 quyển',
          is_correct: false,
          explaination: 'Đây là số vở loại II.',
        },
        {
          content: '250 quyển',
          is_correct: false,
          explaination: 'Kiểm tra lại phép tính.',
        },
        {
          content: '300 quyển',
          is_correct: true,
          explaination:
            'Hệ phương trình: $\\begin{cases} x+y=500 \\\\ 8000x+9000y=4200000 \\end{cases} \\iff \\begin{cases} x+y=500 \\\\ 8x+9y=4200 \\end{cases}$. Từ PT(1) có $y=500-x$. Thế vào PT(2): $8x + 9(500-x) = 4200 \\implies 8x + 4500 - 9x = 4200 \\implies -x = -300 \\implies x=300$.',
        },
        {
          content: '350 quyển',
          is_correct: false,
          explaination: 'Kiểm tra lại phép tính.',
        },
      ],
    },
    {
      content:
        'Tìm các hệ số x, y để cân bằng phương trình phản ứng hóa học: $xFe_3O_4 + O_2 \\rightarrow yFe_2O_3$.',
      explaination:
        'Cân bằng số nguyên tử Fe và O ở hai vế để lập hệ phương trình theo x và y. Giải hệ phương trình đó.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: category3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'x = 2, y = 3',
          is_correct: false,
          explaination:
            'Cân bằng Fe: $3x=2y$. Cân bằng O: $4x+2=3y$. Thay x=2, y=3 vào PT Fe: $3(2)=6$, $2(3)=6$ (đúng). Thay vào PT O: $4(2)+2 = 10$, $3(3)=9$ (sai).',
        },
        {
          content: 'x = 3, y = 2',
          is_correct: false,
          explaination: 'Sai tỉ lệ.',
        },
        {
          content: 'x = 1, y = 3/2',
          is_correct: false,
          explaination: 'Hệ số thường là số nguyên.',
        },
        {
          content: 'x = 4, y = 6',
          is_correct: true,
          explaination:
            'Hệ phương trình: $\\begin{cases} 3x = 2y \\\\ 4x + 2 = 3y \\end{cases}$. Từ PT(1): $y = \\frac{3}{2}x$. Thế vào PT(2): $4x + 2 = 3(\\frac{3}{2}x) \\implies 4x + 2 = \\frac{9}{2}x \\implies 2 = \\frac{9}{2}x - 4x = \\frac{1}{2}x \\implies x=4$. Suy ra $y = \\frac{3}{2}(4) = 6$.',
        },
      ],
    },
  ];

  // --- Seed câu hỏi và câu trả lời ---
  console.log(
    `Đang kiểm tra và seeding ${questionsData.length} Questions và Answers (do ${tutor.email} tạo)...`,
  );
  let createdCount = 0;
  let skippedCount = 0;

  for (const qData of questionsData) {
    const formattedContent = formatQuillContent(qData.content);
    const formattedExplanation = formatQuillContent(qData.explaination);

    const existingQuestion = await prisma.questions.findFirst({
      where: {
        content: formattedContent,
        category_id: qData.category_id,
      },
    });

    if (!existingQuestion) {
      await prisma.questions.create({
        data: {
          content: formattedContent,
          explaination: formattedExplanation,
          level: qData.level,
          type: qData.type,
          category_id: qData.category_id,
          tutor_id: qData.tutor_id,
          status: qData.status,
          answers: {
            createMany: {
              data: createAnswersData(qData.answers),
            },
          },
        },
      });
      createdCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(
    `Seeding Questions và Answers hoàn tất. Đã tạo: ${createdCount}, Bỏ qua: ${skippedCount}.`,
  );
}

main()
  .catch((e) => {
    console.error('Lỗi seeding Questions/Answers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });