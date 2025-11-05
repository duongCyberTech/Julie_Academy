import {
  PrismaClient,
  QuestionType,
  DifficultyLevel,
  QuestionStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

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
  console.log('Đang xóa dữ liệu Answers cũ...');
  await prisma.answers.deleteMany(); 
  console.log('Đang xóa dữ liệu Questions cũ...');
  await prisma.questions.deleteMany();
  console.log('Đã xóa xong dữ liệu cũ.');

  console.log(`Bắt đầu seeding Questions và Answers cho Toán 9...`);

  const tutor = await prisma.user.findFirst({
    where: { email: 'tutor@gmail.com' },
  });
  

  // ======================================================
  // === CÁNH DIỀU ===
  // ======================================================
  // === CHƯƠNG 1: Phương trình và hệ phương trình bậc nhất ===
  const cd_cat1_s1 = await prisma.categories.findUnique({
    where: {
      category_name: '§1. Phương trình quy về phương trình bậc nhất một ẩn',
    },
  });
  const cd_cat1_s2 = await prisma.categories.findUnique({
    where: {
      category_name:
        '§2. Phương trình bậc nhất hai ẩn. Hệ hai phương trình bậc nhất hai ẩn',
    },
  });
  const cd_cat1_s3 = await prisma.categories.findUnique({
    where: { category_name: '§3. Giải hệ hai phương trình bậc nhất hai ẩn' },
  });

  // === CHƯƠNG 2: Bất đẳng thức. Bất phương trình bậc nhất một ẩn ===
  const cd_cat2_s1 = await prisma.categories.findUnique({
    where: { category_name: '§1. Bất đẳng thức' },
  });
  const cd_cat2_s2 = await prisma.categories.findUnique({
    where: { category_name: '§2. Bất phương trình bậc nhất một ẩn' },
  });

  // === CHƯƠNG 3: CĂN THỨC ===
  const cd_cat3_s1 = await prisma.categories.findUnique({
    where: {
      category_name: '§1. Căn bậc hai và căn bậc ba của số thực',
    },
  });
  const cd_cat3_s2 = await prisma.categories.findUnique({
    where: {
      category_name: '§2. Một số phép tính về căn bậc hai của số thực',
    },
  });
  const cd_cat3_s3 = await prisma.categories.findUnique({
    where: {
      category_name: '§3. Căn thức bậc hai và căn thức bậc ba của biểu thức đại số',
    },
  });
  const cd_cat3_s4 = await prisma.categories.findUnique({
    where: {
      category_name: '§4. Một số phép biến đổi căn thức bậc hai của biểu thức đại số',
    },
  });

  // === CHƯƠNG 4: HỆ THỨC LƯỢNG ===
  const cd_cat4_s1 = await prisma.categories.findUnique({
    where: { category_name: '§1. Tỉ số lượng giác của góc nhọn' },
  });
  const cd_cat4_s2 = await prisma.categories.findUnique({
    where: {
      category_name: '§2. Một số hệ thức về cạnh và góc trong tam giác vuông',
    },
  });
  const cd_cat4_s3 = await prisma.categories.findUnique({
    where: { category_name: '§3. Ứng dụng của tỉ số lượng giác của góc nhọn' },
  });

  // === CHƯƠNG 5: ĐƯỜNG TRÒN ===
  const cd_cat5_s1 = await prisma.categories.findUnique({
    where: {
      category_name: '§1. Đường tròn. Vị trí tương đối của hai đường tròn',
    },
  });
  const cd_cat5_s2 = await prisma.categories.findUnique({
    where: {
      category_name: '§2. Vị trí tương đối của đường thẳng và đường tròn',
    },
  });
  const cd_cat5_s3 = await prisma.categories.findUnique({
    where: { category_name: '§3. Tiếp tuyến của đường tròn' },
  });
  const cd_cat5_s4 = await prisma.categories.findUnique({
    where: { category_name: '§4. Góc ở tâm. Góc nội tiếp' },
  });
  const cd_cat5_s5 = await prisma.categories.findUnique({
    where: {
      category_name:
        '§5. Độ dài cung tròn, diện tích hình quạt tròn, diện tích hình vành khuyên',
    },
  });

  // === CHƯƠNG 6: THỐNG KÊ VÀ XÁC SUẤT ===
  const cd_cat6_s1 = await prisma.categories.findUnique({
    where: {
      category_name: '§1. Mô tả và biểu diễn dữ liệu trên các bảng, biểu đồ',
    },
  });
  const cd_cat6_s2 = await prisma.categories.findUnique({
    where: { category_name: '§2. Tần số. Tần số tương đối' },
  });
  const cd_cat6_s3 = await prisma.categories.findUnique({
    where: { category_name: '§3. Tần số ghép nhóm. Tần số tương đối ghép nhóm' },
  });
  const cd_cat6_s4 = await prisma.categories.findUnique({
    where: {
      category_name: '§4. Phép thử ngẫu nhiên và không gian mẫu. Xác suất của biến cố',
    },
  });

  // === CHƯƠNG 7: HÀM SỐ VÀ PHƯƠNG TRÌNH BẬC HAI ===
  const cd_cat7_s1 = await prisma.categories.findUnique({
    where: { category_name: '§1. Hàm số y = ax^2 (a \\ne 0)' },
  });
  const cd_cat7_s2 = await prisma.categories.findUnique({
    where: { category_name: '§2. Phương trình bậc hai một ẩn' },
  });
  const cd_cat7_s3 = await prisma.categories.findUnique({
    where: { category_name: '§3. Định lí Viète' },
  });

  // === CHƯƠNG 8: ĐƯỜNG TRÒN NGOẠI TIẾP/NỘI TIẾP ===
  const cd_cat8_s1 = await prisma.categories.findUnique({
    where: {
      category_name: '§1. Đường tròn ngoại tiếp tam giác. Đường tròn nội tiếp tam giác',
    },
  });
  const cd_cat8_s2 = await prisma.categories.findUnique({
    where: { category_name: '§2. Tứ giác nội tiếp đường tròn' },
  });

  // === CHƯƠNG 9: ĐA GIÁC ĐỀU ===
  const cd_cat9_s1 = await prisma.categories.findUnique({
    where: { category_name: '§1. Đa giác đều. Hình đa giác đều trong thực tiễn' },
  });
  const cd_cat9_s2 = await prisma.categories.findUnique({
    where: { category_name: '§2. Phép quay' },
  });

  // === CHƯƠNG 10: HÌNH HỌC TRỰC QUAN ===
  const cd_cat10_s1 = await prisma.categories.findUnique({
    where: { category_name: '§1. Hình trụ' },
  });
  const cd_cat10_s2 = await prisma.categories.findUnique({
    where: { category_name: '§2. Hình nón' },
  });
  const cd_cat10_s3 = await prisma.categories.findUnique({
    where: { category_name: '§3. Hình cầu' },
  });



  // ======================================================
  // === SÁCH CHÂN TRỜI SÁNG TẠO (TẬP 1) ===
  // ======================================================

  // --- CHƯƠNG 1: PHƯƠNG TRÌNH VÀ HỆ PHƯƠNG TRÌNH ---
  const ctst_cat1_s1 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 1. Phương trình quy về phương trình bậc nhất một ẩn',
    },
  });
  const ctst_cat1_s2 = await prisma.categories.findUnique({
    where: {
      category_name:
        'Bài 2. Phương trình bậc nhất hai ẩn và hệ hai phương trình bậc nhất hai ẩn',
    },
  });
  const ctst_cat1_s3 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 3. Giải hệ hai phương trình bậc nhất hai ẩn',
    },
  });

  // --- CHƯƠNG 2: BẤT ĐẲNG THỨC. BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN ---
  const ctst_cat2_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 1. Bất đẳng thức' },
  });
  const ctst_cat2_s2 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 2. Bất phương trình bậc nhất một ẩn' },
  });

  // --- CHƯƠNG 3: CĂN THỨC ---
  const ctst_cat3_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 1. Căn bậc hai' },
  });
  const ctst_cat3_s2 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 2. Căn bậc ba' },
  });
  const ctst_cat3_s3 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 3. Tính chất của phép khai phương' },
  });
  const ctst_cat3_s4 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 4. Biến đổi đơn giản biểu thức chứa căn thức bậc hai',
    },
  });

  // --- CHƯƠNG 4: HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG ---
  const ctst_cat4_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 1. Tỉ số lượng giác của góc nhọn' },
  });
  const ctst_cat4_s2 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 2. Hệ thức giữa cạnh và góc của tam giác vuông',
    },
  });

  // --- CHƯƠNG 5: ĐƯỜNG TRÒN ---
  const ctst_cat5_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 1. Đường tròn' },
  });
  const ctst_cat5_s2 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 2. Tiếp tuyến của đường tròn' },
  });
  const ctst_cat5_s3 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 3. Góc ở tâm, góc nội tiếp' },
  });
  const ctst_cat5_s4 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 4. Hình quạt tròn và hình vành khuyên' },
  });

  // ======================================================
  // === SÁCH CHÂN TRỜI SÁNG TẠO (TẬP 2) ===
  // ======================================================

  // --- CHƯƠNG 6: HÀM SỐ y = ax^2 (a ≠ 0) VÀ PHƯƠNG TRÌNH BẬC HAI MỘT ẨN ---
  const ctst_cat6_s1 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 1. Hàm số và đồ thị của hàm số y = ax^2 (a ≠ 0)',
    },
  });
  const ctst_cat6_s2 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 2. Phương trình bậc hai một ẩn' },
  });
  const ctst_cat6_s3 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 3. Định lí Viète' },
  });

  // --- CHƯƠNG 7: MỘT SỐ YẾU TỐ THỐNG KÊ ---
  const ctst_cat7_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 1. Bảng tần số và biểu đồ tần số' },
  });
  const ctst_cat7_s2 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 2. Bảng tần số tương đối và biểu đồ tần số tương đối',
    },
  });
  const ctst_cat7_s3 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 3. Biểu diễn số liệu ghép nhóm' },
  });

  // --- CHƯƠNG 8: MỘT SỐ YẾU TỐ XÁC SUẤT ---
  const ctst_cat8_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 1. Không gian mẫu và biến cố' },
  });
  const ctst_cat8_s2 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 2. Xác suất của biến cố' },
  });

  // --- CHƯƠNG 9: TỨ GIÁC NỘI TIẾP. ĐA GIÁC ĐỀU ---
  const ctst_cat9_s1 = await prisma.categories.findUnique({
    where: {
      category_name:
        'Bài 1. Đường tròn ngoại tiếp tam giác. Đường tròn nội tiếp tam giác',
    },
  });
  const ctst_cat9_s2 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 2. Tứ giác nội tiếp' },
  });
  const ctst_cat9_s3 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 3. Đa giác đều và phép quay' },
  });

  // --- CHƯƠNG 10: CÁC HÌNH KHỐI TRONG THỰC TIỄN ---
  const ctst_cat10_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 1. Hình trụ' },
  });
  const ctst_cat10_s2 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 2. Hình nón' },
  });
  const ctst_cat10_s3 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 3. Hình cầu' },
  });



  // ======================================================
  // === SÁCH KẾT NỐI TRI THỨC (TẬP 1) ===
  // ======================================================

  // --- Chương 1. PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN ---
  const kntt_cat1_s1 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 1. Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn',
    },
  });
  const kntt_cat1_s2 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 2. Giải hệ hai phương trình bậc nhất hai ẩn',
    },
  });
  const kntt_cat1_s3 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 3. Giải bài toán bằng cách lập hệ phương trình',
    },
  });

  // --- Chương II. PHƯƠNG TRÌNH VÀ BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN ---
  const kntt_cat2_s1 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 4. Phương trình quy về phương trình bậc nhất một ẩn',
    },
  });
  const kntt_cat2_s2 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 5. Bất đẳng thức và tính chất' },
  });
  const kntt_cat2_s3 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 6. Bất phương trình bậc nhất một ẩn' },
  });

  // --- Chương III. CĂN BẬC HAI VÀ CĂN BẬC BA ---
  const kntt_cat3_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 7. Căn bậc hai và căn thức bậc hai' },
  });
  const kntt_cat3_s2 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 8. Khai căn bậc hai với phép nhân và phép chia',
    },
  });
  const kntt_cat3_s3 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 9. Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai',
    },
  });
  const kntt_cat3_s4 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 10. Căn bậc ba và căn thức bậc ba' },
  });

  // --- Chương IV. HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG ---
  const kntt_cat4_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 11. Tỉ số lượng giác của góc nhọn' },
  });
  const kntt_cat4_s2 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 12. Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng',
    },
  });

  // --- Chương V. ĐƯỜNG TRÒN ---
  const kntt_cat5_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 13. Mở đầu về đường tròn' },
  });
  const kntt_cat5_s2 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 14. Cung và dây của một đường tròn' },
  });
  const kntt_cat5_s3 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 15. Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên',
    },
  });
  const kntt_cat5_s4 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 16. Vị trí tương đối của đường thẳng và đường tròn',
    },
  });
  const kntt_cat5_s5 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 17. Vị trí tương đối của hai đường tròn' },
  });

  // ======================================================
  // === SÁCH KẾT NỐI TRI THỨC (TẬP 2) ===
  // ======================================================

  // --- Chương VI. HÀM SỐ y = ax^2 (a ≠ 0). PHƯƠNG TRÌNH BẬC HAI MỘT ẨN ---
  const kntt_cat6_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 18. Hàm số y = ax^2 (a ≠ 0)' },
  });
  const kntt_cat6_s2 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 19. Phương trình bậc hai một ẩn' },
  });
  const kntt_cat6_s3 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 20. Định lí Viète và ứng dụng' },
  });
  const kntt_cat6_s4 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 21. Giải bài toán bằng cách lập phương trình',
    },
  });

  // --- Chương VII. TẦN SỐ VÀ TẦN SỐ TƯƠNG ĐỐI ---
  const kntt_cat7_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 22. Bảng tần số và biểu đồ tần số' },
  });
  const kntt_cat7_s2 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 23. Bảng tần số tương đối và biểu đồ tần số tương đối',
    },
  });
  const kntt_cat7_s3 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 24. Bảng tần số, tần số tương đối ghép nhóm và biểu đồ',
    },
  });

  // --- Chương VIII. XÁC SUẤT CỦA BIẾN CỐ TRONG MỘT SỐ MÔ HÌNH XÁC SUẤT ĐƠN GIẢN ---
  const kntt_cat8_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 25. Phép thử ngẫu nhiên và không gian mẫu' },
  });
  const kntt_cat8_s2 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 26. Xác suất của biến cố liên quan tới phép thử',
    },
  });

  // --- Chương IX. ĐƯỜNG TRÒN NGOẠI TIẾP VÀ ĐƯỜNG TRÒN NỘI TIẾP ---
  const kntt_cat9_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 27. Góc nội tiếp' },
  });
  const kntt_cat9_s2 = await prisma.categories.findUnique({
    where: {
      category_name: 'Bài 28. Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác',
    },
  });
  const kntt_cat9_s3 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 29. Tứ giác nội tiếp' },
  });
  const kntt_cat9_s4 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 30. Đa giác đều' },
  });

  // --- Chương X. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN ---
  const kntt_cat10_s1 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 31. Hình trụ và hình nón' },
  });
  const kntt_cat10_s2 = await prisma.categories.findUnique({
    where: { category_name: 'Bài 32. Hình cầu' },
  });
  

  if (!tutor) {
    throw new Error(
      "Không thể seed Questions: Tutor hệ thống 'system.tutor@julie.com' không tồn tại.",
    );
  }
  if (!cd_cat1_s1 || !cd_cat1_s2 || !cd_cat1_s3) {
    throw new Error(
      'Không thể seed Questions: Cần Categories của Toán 9 tồn tại.',
    );
  }
  console.log(
    `Đã tìm thấy Tutor Hệ thống: ${tutor.email} và các Categories cần thiết.`,
  );


  const questionsData = [
    // Cánh Diều - Toán 9
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
      category_id: cd_cat1_s1.category_id,
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
      category_id: cd_cat1_s1.category_id,
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
      category_id: cd_cat1_s1.category_id,
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
      category_id: cd_cat1_s1.category_id,
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
      category_id: cd_cat1_s1.category_id,
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
      category_id: cd_cat1_s1.category_id,
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
      category_id: cd_cat1_s1.category_id,
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
      category_id: cd_cat1_s1.category_id,
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
      category_id: cd_cat1_s1.category_id,
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
      category_id: cd_cat1_s2.category_id,
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
      category_id: cd_cat1_s2.category_id,
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
      category_id: cd_cat1_s2.category_id,
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
      category_id: cd_cat1_s2.category_id,
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
      category_id: cd_cat1_s2.category_id,
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
      category_id: cd_cat1_s2.category_id,
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
      category_id: cd_cat1_s2.category_id,
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
      category_id: cd_cat1_s2.category_id,
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
      category_id: cd_cat1_s2.category_id,
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
      category_id: cd_cat1_s3.category_id,
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
      category_id: cd_cat1_s3.category_id,
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
      category_id: cd_cat1_s3.category_id,
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
      category_id: cd_cat1_s3.category_id,
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
      category_id: cd_cat1_s3.category_id,
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
      category_id: cd_cat1_s3.category_id,
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
      category_id: cd_cat1_s3.category_id,
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
      category_id: cd_cat1_s3.category_id,
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
      category_id: cd_cat1_s3.category_id,
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

    // =================================================================
    // === CHƯƠNG 2 - §1. Bất đẳng thức (9 câu) ===
    // =================================================================
    // --- Easy ---
    {
      content: 'Hệ thức $a \\ge b$ được đọc đọc được là gì?',
      explaination: 'Đây là ký hiệu toán học cơ bản cho bất đẳng thức không nghiêm ngặt.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$a$ lớn hơn $b$', is_correct: false },
        { content: '$a$ nhỏ hơn hoặc bằng $b$', is_correct: false },
        { content: '$a$ không lớn hơn $b$', is_correct: false },
        { content: '$a$ lớn hơn hoặc bằng $b$', is_correct: true, explaination: 'Ký hiệu $\\ge$ có nghĩa là "lớn hơn hoặc bằng", hay còn gọi là "không nhỏ hơn".' },
      ],
    },
    {
      content: 'Cho bất đẳng thức $a < b$. Khẳng định nào sau đây là <b>đúng</b> khi cộng số $c$ vào hai vế?',
      explaination: 'Theo tính chất liên hệ giữa thứ tự và phép cộng, khi cộng cùng một số vào hai vế, ta được BĐT mới cùng chiều.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$a+c > b+c$', is_correct: false, explaination: 'Bất đẳng thức đã bị đổi chiều.' },
        { content: '$a+c < b+c$', is_correct: true, explaination: 'BĐT mới cùng chiều với BĐT đã cho.' },
        { content: '$a+c = b+c$', is_correct: false, explaination: 'Chỉ xảy ra khi $a=b$.' },
        { content: '$a+c \\ge b+c$', is_correct: false, explaination: 'Sai ký hiệu.' },
      ],
    },
    {
      content: 'Cho $x > 10$. So sánh $x+5$ và $15$.',
      explaination: 'Cộng 5 vào cả hai vế của bất đẳng thức $x > 10$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x+5 > 15$', is_correct: true, explaination: 'Vì $x > 10 \\implies x+5 > 10+5 \\implies x+5 > 15$.' },
        { content: '$x+5 < 15$', is_correct: false },
        { content: '$x+5 = 15$', is_correct: false },
        { content: '$x+5 \\le 15$', is_correct: false },
      ],
    },
    // --- Medium ---
    {
      content: 'Cho $a < b$. Khẳng định nào sau đây là <b>sai</b>?',
      explaination: 'Khi nhân cả hai vế của BĐT với một số âm, ta phải đổi chiều BĐT.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$a-2 < b-2$', is_correct: false, explaination: 'Đúng, vì cộng hai vế với -2.' },
        { content: '$5a < 5b$', is_correct: false, explaination: 'Đúng, vì nhân hai vế với 5 (số dương).' },
        { content: '$-3a > -3b$', is_correct: false, explaination: 'Đúng, vì nhân hai vế với -3 (số âm) và đổi chiều BĐT.' },
        { content: '$-a < -b$', is_correct: true, explaination: 'Sai. Vì $a < b$, nhân hai vế với -1 phải đổi chiều thành $-a > -b$.' },
      ],
    },
    {
      content: 'So sánh $A = \\frac{2024}{2023}$ và $B = \\frac{2025}{2024}$.',
      explaination: 'Ta có $A = 1 + \\frac{1}{2023}$ và $B = 1 + \\frac{1}{2024}$. So sánh hai phân số $\\frac{1}{2023}$ và $\\frac{1}{2024}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$A < B$', is_correct: false, explaination: 'Phân số có mẫu nhỏ hơn thì lớn hơn.' },
        { content: '$A > B$', is_correct: true, explaination: 'Vì $2023 < 2024 \\implies \\frac{1}{2023} > \\frac{1}{2024} \\implies 1 + \\frac{1}{2023} > 1 + \\frac{1}{2024} \\implies A > B$.' },
        { content: '$A = B$', is_correct: false },
        { content: 'Không thể so sánh', is_correct: false },
      ],
    },
    {
      content: 'Cho $a > b$. Chọn các khẳng định <b>đúng</b> (chọn nhiều đáp án).',
      explaination: 'Áp dụng các tính chất liên hệ giữa thứ tự và phép cộng/nhân.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$a+c > b+c$', is_correct: true, explaination: 'Tính chất liên hệ với phép cộng.' },
        { content: '$a-b > 0$', is_correct: true, explaination: 'Định nghĩa của bất đẳng thức $a > b$.' },
        { content: '$2a > 2b$', is_correct: true, explaination: 'Nhân hai vế với 2 (số dương).' },
        { content: '$-a > -b$', is_correct: false, explaination: 'Nhân với -1 (số âm) phải đổi chiều BĐT thành $-a < -b$.' },
      ],
    },
    // --- Hard ---
    {
      content: 'Bất đẳng thức $x^2 + y^2 \\ge 2xy$ đúng với mọi $x, y$. Dấu "=" (bằng) xảy ra khi nào?',
      explaination: 'BĐT tương đương $(x-y)^2 \\ge 0$. Dấu "=" xảy ra khi $(x-y)^2 = 0$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x > y$', is_correct: false },
        { content: '$x < y$', is_correct: false },
        { content: '$x = y$', is_correct: true, explaination: 'Dấu "=" xảy ra khi $x-y=0$, tức là $x=y$.' },
        { content: '$x = 0$ và $y = 0$', is_correct: false, explaination: 'Đây là trường hợp riêng, $x=y=3$ vẫn đúng.' },
      ],
    },
    {
      content: 'Cho $a > b > 0$. Khẳng định nào sau đây là <b>đúng</b>?',
      explaination: 'So sánh hai phân số dương có cùng tử số.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$\\frac{1}{a} > \\frac{1}{b}$', is_correct: false, explaination: 'Vì $a > b > 0$, nhân hai vế với $\\frac{1}{ab} > 0$ ta được $\\frac{a}{ab} > \\frac{b}{ab} \\implies \\frac{1}{b} > \\frac{1}{a}$.' },
        { content: '$\\frac{1}{a} < \\frac{1}{b}$', is_correct: true, explaination: 'Vì $a > b > 0$, áp dụng tính chất $a > b \\implies \\frac{1}{a} < \\frac{1}{b}$ (với a, b cùng dương).' },
        { content: '$\\frac{1}{a} = \\frac{1}{b}$', is_correct: false },
        { content: '$a^2 < b^2$', is_correct: false, explaination: 'Nhân hai vế $a>b$ với $a>0$ ta được $a^2 > ab$. Nhân hai vế $a>b$ với $b>0$ ta được $ab > b^2$. Theo tính chất bắc cầu: $a^2 > ab > b^2 \\implies a^2 > b^2$.' },
      ],
    },
    {
      content: 'Cho $a \\ge 2b$. Chọn các khẳng định <b>sai</b> (chọn nhiều đáp án).',
      explaination: 'Áp dụng các tính chất BĐT để kiểm tra từng khẳng định.',
      level: DifficultyLevel.hard,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$2a-1 \\ge a+2b-1$', is_correct: false, explaination: 'Đúng. Vì $a \\ge 2b \\implies a+a-1 \\ge 2b+a-1 \\implies 2a-1 \\ge a+2b-1$.' },
        { content: '$4b \\le 2a$', is_correct: false, explaination: 'Đúng. $a \\ge 2b \\implies 2a \\ge 4b$.' },
        { content: '$4b+4a \\le 5a+2b$', is_correct: false, explaination: 'Đúng. $4b+4a \\le 5a+2b \\iff 2b \\le a$. Điều này đúng vì $a \\ge 2b$.' },
        { content: '$a \\le 2b$', is_correct: true, explaination: 'Sai. Đề bài cho $a \\ge 2b$. Dấu bằng có thể xảy ra, nhưng BĐT này ngược dấu.' },
        { content: '$a-2b < 0$', is_correct: true, explaination: 'Sai. Vì $a \\ge 2b \\implies a-2b \\ge 0$.' },
      ],
    },

    // =================================================================
    // === CHƯƠNG 2 - §2. Bất phương trình bậc nhất một ẩn (9 câu) ===
    // =================================================================
    // --- Easy ---
    {
      content: 'Bất phương trình nào sau đây là bất phương trình bậc nhất một ẩn?',
      explaination: 'Bất phương trình bậc nhất một ẩn có dạng $ax+b>0$ (hoặc $<, \\ge, \\le$) với $a \\ne 0$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$3x - 6 > 0$', is_correct: true, explaination: 'Đây là dạng $ax+b>0$ với $a=3, b=-6$.' },
        { content: '$x^2 - 19 \\le 0$', is_correct: false, explaination: 'Đây là bất phương trình bậc hai.' },
        { content: '$0x - 5 < 0$', is_correct: false, explaination: 'Bất phương trình này có $a=0$.' },
        { content: '$5x + 4 > 4x - 12$', is_correct: false, explaination: 'Đây là BPT có thể đưa về dạng bậc nhất, nhưng BPT bậc nhất 1 ẩn gốc có dạng $ax+b>0$.' },
      ],
    },
    {
      content: 'Giá trị $x = 3$ là nghiệm của bất phương trình nào sau đây?',
      explaination: 'Thay $x=3$ vào từng bất phương trình, BPT nào cho một khẳng định đúng thì $x=3$ là nghiệm của BPT đó.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$5x + 4 > 4x - 12$', is_correct: true, explaination: 'Thay $x=3$ ta được $5(3)+4 > 4(3)-12 \\implies 19 > 0$, là một khẳng định <b>đúng</b>.' },
        { content: '$x - 2 \\le 0$', is_correct: false, explaination: 'Thay $x=3$ ta được $3-2 \\le 0 \\implies 1 \\le 0$, là một khẳng định <b>sai</b>.' },
        { content: '$2x + 15 < 0$', is_correct: false, explaination: 'Thay $x=3$ ta được $2(3)+15 < 0 \\implies 21 < 0$, là một khẳng định <b>sai</b>.' },
        { content: '$x^2 - 3x + 5 \\le 4$', is_correct: false, explaination: 'Thay $x=3$ ta được $3^2 - 3(3) + 5 \\le 4 \\implies 5 \\le 4$, là một khẳng định <b>sai</b>.' },
      ],
    },
    {
      content: 'Giải bất phương trình $4x - 32 < 0$.',
      explaination: 'Sử dụng quy tắc chuyển vế và quy tắc nhân.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x < 8$', is_correct: true, explaination: '$4x - 32 < 0 \\implies 4x < 32 \\implies x < 8$.' },
        { content: '$x > 8$', is_correct: false, explaination: 'Sai dấu do không đổi chiều BĐT.' },
        { content: '$x < -8$', is_correct: false },
        { content: '$x > -8$', is_correct: false },
      ],
    },
    // --- Medium ---
    {
      content: 'Giải bất phương trình $-0.3x + 12 > 0$.',
      explaination: 'Khi nhân (hoặc chia) hai vế của BĐT với một số âm, ta phải đổi chiều BĐT.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x > 40$', is_correct: false, explaination: '<b>Sai</b>. Khi chia cho -0.3 (số âm) phải đổi chiều BĐT.' },
        { content: '$x < 40$', is_correct: true, explaination: '$-0.3x > -12 \\implies x < \\frac{-12}{-0.3} \\implies x < 40$.' },
        { content: '$x > -40$', is_correct: false },
        { content: '$x < -40$', is_correct: false },
      ],
    },
    {
      content: 'Giải bất phương trình $3x - (6+2x) \\le 3(x+4)$.',
      explaination: 'Bỏ dấu ngoặc, chuyển các hạng tử chứa x về một vế, các hằng số về vế còn lại.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x \\ge 9$', is_correct: false },
        { content: '$x \\le 9$', is_correct: false },
        { content: '$x \\ge -9$', is_correct: true, explaination: '$3x-6-2x \\le 3x+12 \\implies x-6 \\le 3x+12 \\implies -6-12 \\le 3x-x \\implies -18 \\le 2x \\implies -9 \\le x$.' },
        { content: '$x \\le -9$', is_correct: false, explaination: 'Sai dấu khi chuyển vế.' },
      ],
    },
    {
      content: 'Tìm lỗi <b>sai</b> trong lời giải: $3x - 5 - 2x > 25 + 4x \\implies 3x - 2x - 4x > 25 + 5 \\implies -3x > 30 \\implies x > -10$.',
      explaination: 'Phép giải trên <b>sai</b> ở bước cuối cùng.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '<b>Sai</b> ở bước chuyển vế đầu tiên.', is_correct: false },
        { content: '<b>Sai</b> ở bước rút gọn vế trái.', is_correct: false },
        { content: '<b>Sai</b> ở bước cuối: chia cho số âm mà không đổi chiều BĐT.', is_correct: true, explaination: 'Khi nhân hoặc chia hai vế cho số âm (-3), phải đổi chiều bất phương trình. Lời giải <b>đúng</b> là $x < -10$.' },
        { content: 'Lời giải trên là <b>đúng</b>.', is_correct: false },
      ],
    },
    {
      content: 'Một kho chứa 100 tấn xi măng, mỗi ngày xuất đi 20 tấn. Tìm $x$ (số ngày) sao cho khối lượng còn lại trong kho ít nhất là 10 tấn.',
      explaination: 'Lượng xi măng còn lại sau $x$ ngày là $100 - 20x$. Lập BPT $100 - 20x \ge 10$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x \\le 4.5$', is_correct: true, explaination: 'Lượng còn lại: $100 - 20x$. Điều kiện: $100 - 20x \\ge 10 \\implies 90 \\ge 20x \\implies 4.5 \\ge x$ hay $x \\le 4.5$.' },
        { content: '$x \\ge 4.5$', is_correct: false, explaination: 'Đọc <b>sai</b> điều kiện "ít nhất".' },
        { content: '$x \\le 5.5$', is_correct: false },
        { content: '$x = 4.5$', is_correct: false, explaination: 'Đây là trường hợp "bằng", BPT cho phép cả trường hợp "nhỏ hơn".' },
      ],
    },
    // --- Hard ---
    {
      content: 'Bác Ngọc gửi tiết kiệm $x$ đồng, lãi suất 7.2%/năm. Bác muốn tổng tiền (cả gốc lẫn lãi) sau 12 tháng ít nhất là 214,400,000 đồng. Bác Ngọc phải gửi ít nhất bao nhiêu tiền?',
      explaination: 'Lập BPT: Gốc + Lãi $\ge$ 214,400,000. $x + 0.072x \ge 214400000$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '200,000,000 đồng', is_correct: true, explaination: '$x(1 + 0.072) \\ge 214400000 \\implies 1.072x \\ge 214400000 \\implies x \\ge 214400000 / 1.072 \\implies x \\ge 200000000$.' },
        { content: '214,400,000 đồng', is_correct: false, explaination: 'Đây là số tiền muốn nhận được.' },
        { content: '190,000,000 đồng', is_correct: false },
        { content: '210,000,000 đồng', is_correct: false },
      ],
    },
    {
      content: 'Giải BPT $\\frac{8-3x}{2} - x < 5$.',
      explaination: 'Quy đồng mẫu số (nhân hai vế với 2) để khử mẫu, sau đó giải BPT bậc nhất thu được.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat2_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x < -0.4$', is_correct: false, explaination: 'Kiểm tra lại phép tính.' },
        { content: '$x > 0.4$', is_correct: false, explaination: 'Kiểm tra lại phép tính.' },
        { content: '$x > -0.4$', is_correct: true, explaination: 'Nhân 2 vế: $(8-3x) - 2x < 10 \\implies 8 - 5x < 10 \\implies -5x < 2 \\implies x > -\\frac{2}{5} \\implies x > -0.4$.' },
        { content: '$x < 0.4$', is_correct: false, explaination: 'Nhân/chia cho số âm phải đổi chiều BĐT.' },
      ],
    },

    // =================================================================
    // === CHƯƠNG 3 - §1. Căn bậc hai và căn bậc ba của số thực (9 câu) ===
    // =================================================================
    // --- Easy ---
    {
      content: 'Tìm các căn bậc hai của 64.',
      explaination: 'Một số dương $a$ có đúng hai căn bậc hai là hai số đối nhau: $\\sqrt{a}$ và $-\\sqrt{a}$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '8', is_correct: false, explaination: 'Đây là căn bậc hai số học, chưa đủ.' },
        { content: '-8', is_correct: false, explaination: 'Đây là một căn bậc hai, chưa đủ.' },
        { content: '8 và -8', is_correct: true, explaination: 'Vì $8^2 = 64$ và $(-8)^2 = 64$.' },
        { content: '32', is_correct: false, explaination: 'Đây là phép chia 64 cho 2.' },
      ],
    },
    {
      content: 'Tính giá trị của $\\sqrt[3]{1000}$.',
      explaination: 'Căn bậc ba của a là số x sao cho $x^3 = a$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '100', is_correct: false, explaination: '$100^3$ không bằng 1000.' },
        { content: '10', is_correct: true, explaination: 'Vì $10^3 = 10 \\times 10 \\times 10 = 1000$.' },
        { content: '333.33', is_correct: false, explaination: 'Đây là phép chia cho 3.' },
        { content: '10 và -10', is_correct: false, explaination: 'Nhầm lẫn với căn bậc hai.' },
      ],
    },
    {
      content: 'Số nào sau đây <b>không<b/> có căn bậc hai?',
      explaination: 'Số âm không có căn bậc hai.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '144', is_correct: false, explaination: 'Số 144 có hai căn bậc hai là 12 và -12.' },
        { content: '0', is_correct: false, explaination: 'Số 0 có một căn bậc hai là 0.' },
        { content: '0.25', is_correct: false, explaination: 'Số 0.25 có hai căn bậc hai là 0.5 và -0.5.' },
        { content: '-4', is_correct: true, explaination: 'Số âm không có căn bậc hai.' },
      ],
    },
    // --- Medium ---
    {
      content: 'So sánh $3$ và $\\sqrt{10}$.',
      explaination: 'Đưa 3 vào trong dấu căn bậc hai: $3 = \\sqrt{9}$. Sau đó so sánh $\\sqrt{9}$ và $\\sqrt{10}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$3 > \\sqrt{10}$', is_correct: false, explaination: 'Vì $9 < 10$.' },
        { content: '$3 < \\sqrt{10}$', is_correct: true, explaination: 'Ta có $3 = \\sqrt{9}$. Vì $9 < 10$ nên $\\sqrt{9} < \\sqrt{10}$, hay $3 < \\sqrt{10}$.' },
        { content: '$3 = \\sqrt{10}$', is_correct: false },
        { content: 'Không so sánh được', is_correct: false },
      ],
    },
    {
      content: 'Tính giá trị biểu thức $A = (\\sqrt[3]{2}+1)[(\\sqrt[3]{2})^2 - \\sqrt[3]{2} + 1]$.',
      explaination: 'Áp dụng hằng đẳng thức tổng hai lập phương: $(a+b)(a^2-ab+b^2) = a^3 + b^3$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '1', is_correct: false },
        { content: '2', is_correct: false },
        { content: '3', is_correct: true, explaination: 'Áp dụng HĐT $a^3+b^3$ với $a = \\sqrt[3]{2}$ và $b = 1$. Ta có $A = (\\sqrt[3]{2})^3 + 1^3 = 2 + 1 = 3$.' },
        { content: '$\\sqrt[3]{2}$', is_correct: false },
      ],
    },
    {
      content: 'So sánh $-10$ và $\\sqrt[3]{-999}$.',
      explaination: 'Đưa -10 vào trong dấu căn bậc ba: $-10 = \\sqrt[3]{(-10)^3} = \\sqrt[3]{-1000}$. So sánh $-1000$ và $-999$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$-10 < \\sqrt[3]{-999}$', is_correct: true, explaination: 'Ta có $-10 = \\sqrt[3]{-1000}$. Vì $-1000 < -999$ nên $\\sqrt[3]{-1000} < \\sqrt[3]{-999}$, hay $-10 < \\sqrt[3]{-999}$.' },
        { content: '$-10 > \\sqrt[3]{-999}$', is_correct: false },
        { content: '$-10 = \\sqrt[3]{-999}$', is_correct: false },
      ],
    },
    // --- Hard ---
    {
      content: 'Chọn các khẳng định <b>ĐÚNG</b> (chọn nhiều đáp án).',
      explaination: 'Kiểm tra từng phát biểu về tính chất của căn bậc hai và căn bậc ba.',
      level: DifficultyLevel.hard,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: 'Mỗi số dương có đúng hai căn bậc hai là hai số đối nhau.', is_correct: true, explaination: '<b>Đúng</b> theo định nghĩa.' },
        { content: 'Số âm không có căn bậc ba.', is_correct: false, explaination: '<b>Sai</b>. Số âm có căn bậc ba là một số âm. Ví dụ $\\sqrt[3]{-8} = -2$.' },
        { content: 'Mỗi số thực a đều có duy nhất một căn bậc ba.', is_correct: true, explaination: '<b>Đúng</b> theo tính chất của căn bậc ba.' },
        { content: 'Số 0 có hai căn bậc hai là 0 và -0.', is_correct: false, explaination: '<b>Sai</b>. Số 0 chỉ có một căn bậc hai duy nhất là 0.' },
        { content: 'Căn bậc ba của một số âm là số âm.', is_correct: true, explaination: '<b>Đúng</b>. Ví dụ $\\sqrt[3]{-27} = -3$.' },
      ],
    },
    {
      content: 'Một vật rơi tự do từ độ cao 80 m. Quãng đường dịch chuyển h (mét) được cho bởi công thức $h = 5t^2$ với t là thời gian (giây). Hỏi sau bao lâu vật chạm đất?',
      explaination: 'Thay $h = 80$ vào công thức, ta giải phương trình $80 = 5t^2$ để tìm $t$. Lưu ý $t > 0$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '16 giây', is_correct: false, explaination: '$t^2 = 16$, bạn chưa khai căn.' },
        { content: '4 giây', is_correct: true, explaination: '$80 = 5t^2 \\implies t^2 = 16$. Do $t>0$ nên $t = \\sqrt{16} = 4$ (giây).' },
        { content: '8 giây', is_correct: false },
        { content: 'Không xác định được', is_correct: false },
      ],
    },
    {
      content: 'Thể tích của một khối bê tông hình lập phương là khoảng 220,348 cm³. Độ dài cạnh của khối bê tông đó là bao nhiêu cm (làm tròn đến hàng phần mười)?',
      explaination: 'Nếu cạnh là $a$ thì thể tích là $V = a^3$. Vậy $a = \\sqrt[3]{V}$. Sử dụng máy tính cầm tay.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '6.0 cm', is_correct: true, explaination: '$a = \\sqrt[3]{220.348}$. Sử dụng máy tính ta được $a \\approx 6.040...$ Làm tròn đến hàng phần mười ta được 6.0 cm.' },
        { content: '6.04 cm', is_correct: false, explaination: 'Đây là làm tròn đến hàng phần trăm.' },
        { content: '73.4 cm', is_correct: false, explaination: 'Đây là phép chia cho 3.' },
        { content: '14.8 cm', is_correct: false, explaination: 'Đây là phép khai căn bậc hai.' },
      ],
    },

    // =================================================================
    // === CHƯƠNG 3 - §2. Một số phép tính về căn bậc hai của số thực (9 câu) ===
    // =================================================================
    // --- Easy ---
    {
      content: 'Tính giá trị của $\\sqrt{(-8)^2}$.',
      explaination: 'Áp dụng hằng đẳng thức $\\sqrt{A^2} = |A|$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '-8', is_correct: false, explaination: '$\\sqrt{A^2}$ luôn là số không âm.' },
        { content: '8', is_correct: true, explaination: '$\\sqrt{(-8)^2} = |-8| = 8$.' },
        { content: '64', is_correct: false, explaination: 'Đây là giá trị của $(-8)^2$.' },
        { content: '4', is_correct: false },
      ],
    },
    {
      content: 'Tính $\\sqrt{81 \\cdot 49}$.',
      explaination: 'Áp dụng quy tắc khai phương một tích: $\\sqrt{A \\cdot B} = \\sqrt{A} \\cdot \\sqrt{B}$ (với $A, B \\ge 0$).',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '3969', is_correct: false, explaination: 'Đây là kết quả của $81 \\times 49$.' },
        { content: '63', is_correct: true, explaination: '$\\sqrt{81 \\cdot 49} = \\sqrt{81} \\cdot \\sqrt{49} = 9 \\cdot 7 = 63$.' },
        { content: '130', is_correct: false, explaination: 'Đây là kết quả của $81 + 49$.' },
        { content: '16', is_correct: false, explaination: 'Đây là $9+7$.' },
      ],
    },
    {
      content: 'Tính $\\sqrt{\\frac{16}{25}}$.',
      explaination: 'Áp dụng quy tắc khai phương một thương: $\\sqrt{\\frac{A}{B}} = \\frac{\\sqrt{A}}{\\sqrt{B}}$ (với $A \\ge 0, B > 0$).',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$\\frac{4}{5}$', is_correct: true, explaination: '$\\sqrt{\\frac{16}{25}} = \\frac{\\sqrt{16}}{\\sqrt{25}} = \\frac{4}{5}$.' },
        { content: '$\\frac{16}{5}$', is_correct: false },
        { content: '$\\frac{4}{25}$', is_correct: false },
        { content: '$\\frac{16}{25}$', is_correct: false },
      ],
    },
    // --- Medium ---
    {
      content: 'Đưa thừa số ra ngoài dấu căn: $\\sqrt{50}$.',
      explaination: 'Tách 50 thành tích của một số chính phương và một số khác. $50 = 25 \\cdot 2 = 5^2 \\cdot 2$. Áp dụng $\\sqrt{A^2 B} = |A|\\sqrt{B}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$2\\sqrt{5}$', is_correct: false },
        { content: '$5\\sqrt{2}$', is_correct: true, explaination: '$\\sqrt{50} = \\sqrt{25 \\cdot 2} = \\sqrt{5^2 \\cdot 2} = 5\\sqrt{2}$.' },
        { content: '$10\\sqrt{5}$', is_correct: false },
        { content: '$2\\sqrt{25}$', is_correct: false },
      ],
    },
    {
      content: 'Đưa thừa số vào trong dấu căn: $-5\\sqrt{2}$.',
      explaination: 'Áp dụng quy tắc: Với $a < 0$ và $b \\ge 0$, ta có $a\\sqrt{b} = -\\sqrt{a^2 b}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$\\sqrt{50}$', is_correct: false, explaination: 'Đây là kết quả của $5\\sqrt{2}$.' },
        { content: '$\\sqrt{-50}$', is_correct: false, explaination: 'Biểu thức dưới dấu căn không thể âm.' },
        { content: '$-\\sqrt{50}$', is_correct: true, explaination: 'Vì $-5 < 0$, nên $-5\\sqrt{2} = -\\sqrt{(-5)^2 \\cdot 2} = -\\sqrt{25 \\cdot 2} = -\\sqrt{50}$.' },
        { content: '$-\\sqrt{20}$', is_correct: false },
      ],
    },
    {
      content: 'Rút gọn biểu thức $\\sqrt{20} - \\sqrt{5}$.',
      explaination: 'Đưa thừa số $\\sqrt{20}$ ra ngoài dấu căn, sau đó thực hiện phép trừ các căn thức đồng dạng.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$\\sqrt{15}$', is_correct: false, explaination: 'Không thể trừ trực tiếp hai số dưới dấu căn.' },
        { content: '$\\sqrt{5}$', is_correct: true, explaination: '$\\sqrt{20} - \\sqrt{5} = \\sqrt{4 \\cdot 5} - \\sqrt{5} = 2\\sqrt{5} - \\sqrt{5} = (2-1)\\sqrt{5} = \\sqrt{5}$.' },
        { content: '$2\\sqrt{5}$', is_correct: false },
        { content: '$-\\sqrt{5}$', is_correct: false },
      ],
    },
    // --- Hard ---
    {
      content: 'Rút gọn biểu thức $A = \\sqrt{12} - \\sqrt{27} + \\sqrt{75}$.',
      explaination: 'Đưa thừa số ra ngoài dấu căn của cả ba hạng tử, sau đó cộng/trừ các căn thức đồng dạng.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$4\\sqrt{3}$', is_correct: true, explaination: '$A = \\sqrt{4 \\cdot 3} - \\sqrt{9 \\cdot 3} + \\sqrt{25 \\cdot 3} = 2\\sqrt{3} - 3\\sqrt{3} + 5\\sqrt{3} = (2 - 3 + 5)\\sqrt{3} = 4\\sqrt{3}$.' },
        { content: '$\\sqrt{60}$', is_correct: false, explaination: 'Không thể cộng/trừ các số dưới dấu căn.' },
        { content: '$10\\sqrt{3}$', is_correct: false, explaination: 'Sai dấu khi tính toán.' },
        { content: '$2\\sqrt{3}$', is_correct: false, explaination: 'Tính toán sai.' },
      ],
    },
    {
      content: 'Tính $(2\\sqrt{3} + \\sqrt{11})(\\sqrt{12} - \\sqrt{11})$.',
      explaination: 'Đưa thừa số $\\sqrt{12}$ ra ngoài dấu căn để xuất hiện hằng đẳng thức $(a+b)(a-b) = a^2 - b^2$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '23', is_correct: false },
        { content: '$2\\sqrt{33}$', is_correct: false },
        { content: '1', is_correct: true, explaination: 'Ta có $\\sqrt{12} = \\sqrt{4 \\cdot 3} = 2\\sqrt{3}$. Biểu thức trở thành $(2\\sqrt{3} + \\sqrt{11})(2\\sqrt{3} - \\sqrt{11}) = (2\\sqrt{3})^2 - (\\sqrt{11})^2 = (4 \\cdot 3) - 11 = 12 - 11 = 1$.' },
        { content: '13', is_correct: false },
      ],
    },
    {
      content: 'Một bếp điện có điện trở $R = 80 \\Omega$. Tính cường độ dòng điện $I$ (Ampe) chạy qua, biết nhiệt lượng $Q$ toả ra trong 1 giây ($t=1$) là 500 J. Dùng công thức $Q = I^2Rt$.',
      explaination: 'Thay các giá trị $Q=500, R=80, t=1$ vào công thức và giải $I$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '2.5 A', is_correct: true, explaination: '$500 = I^2 \\cdot 80 \\cdot 1 \\implies I^2 = \\frac{500}{80} = \\frac{50}{8} = 6.25$. Vì $I > 0$, ta có $I = \\sqrt{6.25} = 2.5$ A.' },
        { content: '6.25 A', is_correct: false, explaination: 'Đây là giá trị của $I^2$.' },
        { content: '3.125 A', is_correct: false, explaination: 'Đây là kết quả $Q / (R \\cdot t \\cdot 2)$.' },
        { content: '40000 A', is_correct: false, explaination: 'Đây là $Q \\times R$.' },
      ],
    },

    // =================================================================
    // === CHƯƠNG 3 - §3. Căn thức bậc hai và căn thức bậc ba của biểu thức đại số (9 câu) ===
    // =================================================================
    // --- Easy ---
    {
      content: 'Biểu thức $\\sqrt{A}$ được gọi là căn thức bậc hai của A khi nào?',
      explaination: 'Đây là định nghĩa của căn thức bậc hai.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: 'A là một số thực bất kỳ', is_correct: false },
        { content: 'A là một biểu thức đại số', is_correct: true, explaination: 'Theo định nghĩa, A là một biểu thức đại số.' },
        { content: 'A là một số thực không âm', is_correct: false, explaination: 'Đây là điều kiện xác định, không phải định nghĩa.' },
        { content: 'A là một biểu thức đại số luôn dương', is_correct: false },
      ],
    },
    {
      content: 'Tìm điều kiện xác định cho căn thức bậc hai $\\sqrt{x-3}$.',
      explaination: 'Căn thức bậc hai $\\sqrt{A}$ xác định khi $A \\ge 0$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x > 3$', is_correct: false },
        { content: '$x \\ge 3$', is_correct: true, explaination: 'Biểu thức xác định khi $x-3 \\ge 0 \\implies x \\ge 3$.' },
        { content: '$x < 3$', is_correct: false },
        { content: '$x \\ne 3$', is_correct: false },
      ],
    },
    {
      content: 'Tìm điều kiện xác định cho căn thức bậc ba $\\sqrt[3]{\\frac{1}{x-9}}$.',
      explaination: 'Căn thức bậc ba $\\sqrt[3]{A}$ xác định khi biểu thức A xác định. Biểu thức $\\frac{1}{x-9}$ xác định khi mẫu khác 0.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x > 9$', is_correct: false, explaination: 'Căn bậc ba không yêu cầu biểu thức bên trong phải không âm.' },
        { content: '$x \\ge 9$', is_correct: false },
        { content: '$x \\ne 9$', is_correct: true, explaination: 'Căn thức bậc ba $\\sqrt[3]{A}$ xác định khi A xác định. $A = \\frac{1}{x-9}$ xác định khi $x-9 \\ne 0 \\implies x \\ne 9$.' },
        { content: 'Với mọi $x \\in \\mathbb{R}$', is_correct: false },
      ],
    },
    // --- Medium ---
    {
      content: 'Tính giá trị của $\\sqrt{x^2 - 9}$ tại $x = \\sqrt{10}$.',
      explaination: 'Thay $x = \\sqrt{10}$ vào biểu thức và tính toán.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '1', is_correct: true, explaination: '$\\sqrt{(\\sqrt{10})^2 - 9} = \\sqrt{10 - 9} = \\sqrt{1} = 1$.' },
        { content: '$\\sqrt{1}$', is_correct: false, explaination: 'Kết quả này có thể rút gọn thêm.' },
        { content: '19', is_correct: false },
        { content: 'Không xác định', is_correct: false, explaination: 'Biểu thức xác định vì $10 > 9$.' },
      ],
    },
    {
      content: 'Tìm điều kiện xác định cho căn thức $\\sqrt{x^2 + 1}$.',
      explaination: 'Biểu thức $\\sqrt{A}$ xác định khi $A \\ge 0$. Xét dấu của biểu thức $x^2 + 1$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x \\ge -1$', is_correct: false },
        { content: '$x \\ge 0$', is_correct: false },
        { content: '$x \\ne 0$', is_correct: false },
        { content: 'Với mọi $x \\in \\mathbb{R}$', is_correct: true, explaination: 'Ta có $x^2 \\ge 0$ với mọi $x$. Do đó $x^2 + 1 \\ge 1 > 0$ với mọi $x$. Vậy biểu thức luôn xác định.' },
      ],
    },
    {
      content: 'Tính giá trị của căn thức $\\sqrt[3]{2x - 7}$ tại $x = -10$.',
      explaination: 'Thay giá trị $x = -10$ vào biểu thức và tính toán.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '3', is_correct: false },
        { content: '-3', is_correct: true, explaination: '$\\sqrt[3]{2(-10) - 7} = \\sqrt[3]{-20 - 7} = \\sqrt[3]{-27} = -3$.' },
        { content: 'Không xác định', is_correct: false, explaination: 'Căn bậc ba xác định với cả số âm.' },
        { content: '27', is_correct: false },
      ],
    },
    // --- Hard ---
    {
      content: 'Cho công thức $v = \\sqrt{rg\\mu}$. Tính tốc độ tối đa $v$ (m/s) khi $g=9.8$, $r=400$m và $\\mu=0.12$ (làm tròn đến hàng phần mười).',
      explaination: 'Thay các giá trị $r=400, g=9.8, \\mu=0.12$ vào công thức và dùng máy tính để tính toán.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '21.7 m/s', is_correct: true, explaination: '$v = \\sqrt{400 \\times 9.8 \\times 0.12} = \\sqrt{470.4} \\approx 21.688...$ Làm tròn đến hàng phần mười ta được 21.7 m/s.' },
        { content: '470.4 m/s', is_correct: false, explaination: 'Bạn chưa khai căn.' },
        { content: '21.69 m/s', is_correct: false, explaination: '<b>Sai</b> yêu cầu làm tròn (đây là hàng phần trăm).' },
        { content: '47.0 m/s', is_correct: false },
      ],
    },
    {
      content: 'Một con hươu cao cổ nặng 180 kg. Dùng công thức $h = 0.4 \\cdot \\sqrt[3]{x}$ (với $x$ là cân nặng) để tính chiều cao $h$ (mét) của nó (làm tròn đến hàng phần trăm).',
      explaination: 'Thay $x = 180$ vào công thức $h = 0.4 \\cdot \\sqrt[3]{180}$ và dùng máy tính để tính.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '2.26 m', is_correct: true, explaination: '$h = 0.4 \\cdot \\sqrt[3]{180} \\approx 0.4 \\cdot 5.646... \\approx 2.258...$ Làm tròn đến hàng phần trăm ta được 2.26 m.' },
        { content: '5.65 m', is_correct: false, explaination: 'Đây là giá trị của $\\sqrt[3]{180}$, chưa nhân 0.4.' },
        { content: '2.3 m', is_correct: false, explaination: 'Đây là làm tròn đến hàng phần mười.' },
        { content: '72 m', is_correct: false, explaination: 'Đây là $180 \\times 0.4$.' },
      ],
    },
    {
      content: 'Tìm điều kiện xác định của biểu thức $\\sqrt{\\frac{-5}{x-2}}$',
      explaination: 'Biểu thức $\\sqrt{A}$ xác định khi $A \\ge 0$. Do đó, $\\frac{-5}{x-2} \\ge 0$. Vì tử số -5 là số âm, nên mẫu số $x-2$ cũng phải là số âm (và khác 0) để thương là số dương.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x > 2$', is_correct: false, explaination: 'Nếu $x > 2$ thì $x-2 > 0$. (Số âm) / (Số dương) = (Số âm), vi phạm ĐKXĐ.' },
        { content: '$x \\ge 2$', is_correct: false, explaination: 'Vi phạm ĐKXĐ và $x=2$ làm mẫu bằng 0.' },
        { content: '$x < 2$', is_correct: true, explaination: 'Ta cần $\\frac{-5}{x-2} \\ge 0$. Vì $-5 < 0$, ta phải có $x-2 < 0$ (mẫu không được bằng 0). Do đó, $x < 2$.' },
        { content: '$x \\ne 2$', is_correct: false, explaination: 'Chưa đủ, $x=3$ làm biểu thức âm.' },
      ],
    },

    // =================================================================
    // === CHƯƠNG 3 - §4. Một số phép biến đổi căn thức bậc hai của biểu thức đại số (9 câu) ===
    // =================================================================
    // --- Easy ---
    {
      content: 'Rút gọn biểu thức $\\sqrt{(x-2)^2}$ với $x \\ge 2$.',
      explaination: 'Áp dụng hằng đẳng thức $\\sqrt{A^2} = |A|$. Vì $x \\ge 2$ nên $x-2 \\ge 0$, do đó $|x-2| = x-2$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x-2$', is_correct: true, explaination: '$\\sqrt{(x-2)^2} = |x-2| = x-2$ (vì $x \\ge 2$).' },
        { content: '$2-x$', is_correct: false, explaination: 'Đây là kết quả khi $x < 2$.' },
        { content: '$\\pm(x-2)$', is_correct: false },
        { content: '$x+2$', is_correct: false },
      ],
    },
    {
      content: 'Rút gọn biểu thức $\\sqrt{4a^2}$ với $a \\ge 0$.',
      explaination: 'Áp dụng quy tắc khai phương một tích $\\sqrt{A \\cdot B} = \\sqrt{A} \\cdot \\sqrt{B}$ và hằng đẳng thức $\\sqrt{A^2} = |A|$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$4a$', is_correct: false },
        { content: '$2a$', is_correct: true, explaination: '$\\sqrt{4a^2} = \\sqrt{4} \\cdot \\sqrt{a^2} = 2|a| = 2a$ (vì $a \\ge 0$).' },
        { content: '$-2a$', is_correct: false, explaination: 'Đây là kết quả khi $a < 0$.' },
        { content: '$2|a|$', is_correct: false, explaination: 'Kết quả này có thể rút gọn thêm vì đã cho $a \\ge 0$.' },
      ],
    },
    {
      content: 'Trục căn thức ở mẫu của $\\frac{5}{\\sqrt{3}}$.',
      explaination: 'Nhân cả tử và mẫu với $\\sqrt{3}$. Ta có $\\frac{A}{\\sqrt{B}} = \\frac{A\\sqrt{B}}{B}$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$\\frac{5\\sqrt{3}}{3}$', is_correct: true, explaination: '$\\frac{5}{\\sqrt{3}} = \\frac{5 \\cdot \\sqrt{3}}{\\sqrt{3} \\cdot \\sqrt{3}} = \\frac{5\\sqrt{3}}{3}$.' },
        { content: '$\\frac{\\sqrt{15}}{3}$', is_correct: false },
        { content: '$\\frac{5\\sqrt{3}}{9}$', is_correct: false },
        { content: '$5\\sqrt{3}$', is_correct: false },
      ],
    },
    // --- Medium ---
    {
      content: 'Rút gọn biểu thức $\\sqrt{x^2+6x+9}$ với $x < -3$.',
      explaination: 'Đưa biểu thức dưới dấu căn về dạng bình phương của một tổng: $(x+3)^2$. Áp dụng $\\sqrt{A^2} = |A|$ và xét dấu của $x+3$ khi $x < -3$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$x+3$', is_correct: false, explaination: '<b>Sai</b>. Vì $x < -3$ nên $x+3 < 0$, do đó $|x+3| = -(x+3)$.' },
        { content: '$-(x+3)$', is_correct: true, explaination: '$\\sqrt{(x+3)^2} = |x+3|$. Vì $x < -3$ nên $x+3$ là số âm, do đó $|x+3| = -(x+3) = -x-3$.' },
        { content: '$x-3$', is_correct: false },
        { content: '$(x+3)^2$', is_correct: false },
      ],
    },
    {
      content: 'Trục căn thức ở mẫu của $\\frac{5}{2+\\sqrt{3}}$.',
      explaination: 'Nhân cả tử và mẫu với biểu thức liên hợp của $2+\\sqrt{3}$ là $2-\\sqrt{3}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$5(2-\\sqrt{3})$', is_correct: true, explaination: '$\\frac{5(2-\\sqrt{3})}{(2+\\sqrt{3})(2-\\sqrt{3})} = \\frac{5(2-\\sqrt{3})}{2^2 - (\\sqrt{3})^2} = \\frac{5(2-\\sqrt{3})}{4-3} = 5(2-\\sqrt{3})$.' },
        { content: '$5(2+\\sqrt{3})$', is_correct: false, explaination: 'Nhân sai biểu thức liên hợp.' },
        { content: '$\\frac{5(2-\\sqrt{3})}{7}$', is_correct: false, explaination: 'Sai hằng đẳng thức $a^2-b^2$.' },
        { content: '$10- \\sqrt{3}$', is_correct: false, explaination: 'Sai phép nhân.' },
      ],
    },
    {
      content: 'Rút gọn biểu thức $\\sqrt{2a} \\cdot \\sqrt{8a}$ với $a \\ge 0$.',
      explaination: 'Áp dụng quy tắc nhân hai căn thức bậc hai: $\\sqrt{A} \\cdot \\sqrt{B} = \\sqrt{AB}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$4a$', is_correct: true, explaination: '$\\sqrt{2a \\cdot 8a} = \\sqrt{16a^2} = \\sqrt{16} \\cdot \\sqrt{a^2} = 4|a| = 4a$ (vì $a \\ge 0$).' },
        { content: '$\\sqrt{16a}$', is_correct: false },
        { content: '$4|a|$', is_correct: false, explaination: 'Kết quả này có thể rút gọn thêm vì $a \\ge 0$.' },
        { content: '$16a$', is_correct: false },
      ],
    },
    {
      content: 'Rút gọn biểu thức $\\sqrt{\\frac{4a^2}{25}}$ với $a < 0$.',
      explaination: 'Áp dụng quy tắc khai phương một thương $\\sqrt{A/B} = \\sqrt{A}/\\sqrt{B}$ và hằng đẳng thức $\\sqrt{A^2} = |A|$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$\\frac{2a}{5}$', is_correct: false, explaination: '<b>Sai</b>. Vì $a < 0$ nên $|a| = -a$.' },
        { content: '$\\frac{4a}{5}$', is_correct: false },
        { content: '$\\frac{-2a}{5}$', is_correct: true, explaination: '$\\sqrt{\\frac{4a^2}{25}} = \\frac{\\sqrt{4a^2}}{\\sqrt{25}} = \\frac{\\sqrt{4} \\cdot \\sqrt{a^2}}{5} = \\frac{2|a|}{5}$. Vì $a < 0$ nên $|a| = -a$. Kết quả là $\\frac{-2a}{5}$.' },
        { content: '$\\frac{2|a|}{25}$', is_correct: false },
      ],
    },
    // --- Hard ---
    {
      content: 'Trục căn thức ở mẫu của $\\frac{1}{\\sqrt{x+1} - \\sqrt{x}}$ (với $x \\ge 0$).',
      explaination: 'Nhân cả tử và mẫu với biểu thức liên hợp là $\\sqrt{x+1} + \\sqrt{x}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$\\sqrt{x+1} + \\sqrt{x}$', is_correct: true, explaination: '$\\frac{1 \\cdot (\\sqrt{x+1} + \\sqrt{x})}{(\\sqrt{x+1} - \\sqrt{x})(\\sqrt{x+1} + \\sqrt{x})} = \\frac{\\sqrt{x+1} + \\sqrt{x}}{(\\sqrt{x+1})^2 - (\\sqrt{x})^2} = \\frac{\\sqrt{x+1} + \\sqrt{x}}{(x+1) - x} = \\frac{\\sqrt{x+1} + \\sqrt{x}}{1}$.' },
        { content: '$\\sqrt{x+1} - \\sqrt{x}$', is_correct: false },
        { content: '1', is_correct: false, explaination: 'Đây là kết quả của mẫu số.' },
        { content: '-1', is_correct: false },
      ],
    },
    {
      content: 'Rút gọn biểu thức $P = \\frac{\\sqrt{a}}{\\sqrt{a}-\\sqrt{b}} - \\frac{\\sqrt{b}}{\\sqrt{a}+\\sqrt{b}} - \\frac{2b}{a-b}$ (với $a \\ge 0, b \\ge 0, a \\ne b$).',
      explaination: 'Quy đồng mẫu số. Mẫu số chung là $a-b = (\\sqrt{a}-\\sqrt{b})(\\sqrt{a}+\\sqrt{b})$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '1', is_correct: true, explaination: 'Quy đồng ta được: $P = \\frac{\\sqrt{a}(\\sqrt{a}+\\sqrt{b}) - \\sqrt{b}(\\sqrt{a}-\\sqrt{b}) - 2b}{a-b} = \\frac{a+\\sqrt{ab} - \\sqrt{ab}+b - 2b}{a-b} = \\frac{a-b}{a-b} = 1$.' },
        { content: '$\\frac{a+b}{a-b}$', is_correct: false, explaination: 'Đây là kết quả của 2 hạng tử đầu tiên, chưa trừ $\\frac{2b}{a-b}$.' },
        { content: '$\\frac{a-b}{a+b}$', is_correct: false },
        { content: '$\\frac{a-3b}{a-b}$', is_correct: false },
      ],
    },
    {
      content: 'Bất đẳng thức Cauchy (AM-GM) cho hai số không âm $a$ và $b$ là gì?',
      explaination: 'Đây là bất đẳng thức giữa trung bình cộng và trung bình nhân.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat3_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$a+b \\ge 2\\sqrt{ab}$', is_correct: false, explaination: 'Đây là một dạng tương đương, nhưng dạng chuẩn là so sánh trung bình cộng và trung bình nhân.' },
        { content: '$\\frac{a+b}{2} \\ge \\sqrt{ab}$', is_correct: true, explaination: 'Bất đẳng thức Cauchy (AM-GM) cho hai số $a, b \\ge 0$ là $\\frac{a+b}{2} \\ge \\sqrt{ab}$.' },
        { content: '$\\frac{a+b}{2} \\le \\sqrt{ab}$', is_correct: false, explaination: 'Ngược dấu.' },
        { content: '$(\\sqrt{a}-\\sqrt{b})^2 \\ge 0$', is_correct: false, explaination: 'Đây là BĐT dùng để chứng minh BĐT Cauchy.' },
      ],
    },

    // =================================================================
    // === CHƯƠNG 4 - §1. Tỉ số lượng giác của góc nhọn (10 câu) ===
    // =================================================================
    // --- Easy ---
    {
      content: 'Trong một tam giác vuông, tỉ số giữa cạnh đối và cạnh huyền của một góc nhọn $\\alpha$ được gọi là gì?',
      explaination: 'Đây là định nghĩa của $sin \\alpha$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$sin \\alpha$', is_correct: true, explaination: '$sin \\alpha = \\frac{\\text{Cạnh đối}}{\\text{Cạnh huyền}}$.' },
        { content: '$cos \\alpha$', is_correct: false, explaination: '$cos \\alpha = \\frac{\\text{Cạnh kề}}{\\text{Cạnh huyền}}$.' },
        { content: '$tan \\alpha$', is_correct: false, explaination: '$tan \\alpha = \\frac{\\text{Cạnh đối}}{\\text{Cạnh kề}}$.' },
        { content: '$cot \\alpha$', is_correct: false, explaination: '$cot \\alpha = \\frac{\\text{Cạnh kề}}{\\text{Cạnh đối}}$.' },
      ],
    },
    {
      content: 'Tỉ số $tan \\alpha$ của góc nhọn $\\alpha$ trong tam giác vuông bằng:',
      explaination: 'Đây là định nghĩa của $tan \\alpha$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$\\frac{\\text{Cạnh kề}}{\\text{Cạnh huyền}}$', is_correct: false, explaination: 'Đây là $cos \\alpha$.' },
        { content: '$\\frac{\\text{Cạnh đối}}{\\text{Cạnh huyền}}$', is_correct: false, explaination: 'Đây là $sin \\alpha$.' },
        { content: '$\\frac{\\text{Cạnh kề}}{\\text{Cạnh đối}}$', is_correct: false, explaination: 'Đây là $cot \\alpha$.' },
        { content: '$\\frac{\\text{Cạnh đối}}{\\text{Cạnh kề}}$', is_correct: true, explaination: '$tan \\alpha = \\frac{\\text{Cạnh đối}}{\\text{Cạnh kề}}$.' },
      ],
    },
    {
      content: 'Nếu $\\alpha$ và $\\beta$ là hai góc phụ nhau ( $\\alpha + \\beta = 90^{\\circ}$ ) thì khẳng định nào sau đây là <b>ĐÚNG</b>?',
      explaination: 'Nếu hai góc phụ nhau thì sin góc này bằng côsin góc kia, tang góc này bằng côtang góc kia.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$sin \\alpha = sin \\beta$', is_correct: false },
        { content: '$sin \\alpha = cos \\beta$', is_correct: true, explaination: 'Với hai góc phụ nhau, sin góc này bằng côsin góc kia.' },
        { content: '$tan \\alpha = tan \\beta$', is_correct: false },
        { content: '$cos \\alpha = cos \\beta$', is_correct: false },
      ],
    },
    // --- Medium ---
    {
      content: 'Cho tam giác ABC vuông tại A, có $AC = 4$ cm, $BC = 5$ cm. Tính $sin B$.',
      explaination: '$sin B = \\frac{\\text{Cạnh đối}}{\\text{Cạnh huyền}} = \\frac{AC}{BC}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$\\frac{3}{5} = 0.6$', is_correct: false, explaination: 'Đây là $cos B$.' },
        { content: '$\\frac{4}{5} = 0.8$', is_correct: true, explaination: '$sin B = \\frac{AC}{BC} = \\frac{4}{5} = 0.8$.' },
        { content: '$\\frac{4}{3}$', is_correct: false, explaination: 'Đây là $tan B$.' },
        { content: '$\\frac{5}{4}$', is_correct: false },
      ],
    },
    {
      content: 'Tính giá trị của $cos 30^{\\circ}$.',
      explaination: 'Đây là giá trị tỉ số lượng giác của góc đặc biệt.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$\\frac{1}{2}$', is_correct: false, explaination: 'Đây là $sin 30^{\\circ}$ hoặc $cos 60^{\\circ}$.' },
        { content: '$\\frac{\\sqrt{3}}{2}$', is_correct: true, explaination: 'Theo bảng giá trị đặc biệt, $cos 30^{\\circ} = \\frac{\\sqrt{3}}{2}$.' },
        { content: '$\\frac{\\sqrt{2}}{2}$', is_correct: false, explaination: 'Đây là $cos 45^{\\circ}$.' },
        { content: '$\\sqrt{3}$', is_correct: false, explaination: 'Đây là $cot 30^{\\circ}$.' },
      ],
    },
    {
      content: 'Cho tam giác MNP vuông tại M, $MN = 3$ cm, $MP = 4$ cm. Chọn các khẳng định <b>ĐÚNG</b> (chọn nhiều đáp án).',
      explaination: 'Đầu tiên, dùng định lý Pytago để tìm cạnh huyền $NP = \\sqrt{MN^2 + MP^2} = \\sqrt{3^2 + 4^2} = 5$ cm. Sau đó tính các tỉ số lượng giác của góc P.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$sin P = \\frac{3}{5}$', is_correct: true, explaination: '<b>Đúng</b>. $sin P = \\frac{\\text{Đối}}{\\text{Huyền}} = \\frac{MN}{NP} = \\frac{3}{5}$.' },
        { content: '$cos P = \\frac{4}{5}$', is_correct: true, explaination: '<b>Đúng</b>. $cos P = \\frac{\\text{Kề}}{\\text{Huyền}} = \\frac{MP}{NP} = \\frac{4}{5}$.' },
        { content: '$tan P = \\frac{3}{4}$', is_correct: true, explaination: '<b>Đúng</b>. $tan P = \\frac{\\text{Đối}}{\\text{Kề}} = \\frac{MN}{MP} = \\frac{3}{4}$.' },
        { content: '$cot P = \\frac{5}{3}$', is_correct: false, explaination: '<b>Sai</b>. $cot P = \\frac{\\text{Kề}}{\\text{Đối}} = \\frac{MP}{MN} = \\frac{4}{3}$.' },
      ],
    },
    // --- Hard ---
    {
      content: 'Tính giá trị biểu thức $A = sin 25^{\\circ} + cos 25^{\\circ} - sin 65^{\\circ} - cos 65^{\\circ}$.',
      explaination: 'Sử dụng tỉ số lượng giác của hai góc phụ nhau ($25^{\\circ}$ và $65^{\\circ}$). $sin 65^{\\circ} = cos(90^{\\circ}-65^{\\circ}) = cos 25^{\\circ}$ và $cos 65^{\\circ} = sin(90^{\\circ}-65^{\\circ}) = sin 25^{\\circ}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '1', is_correct: false },
        { content: '0', is_correct: true, explaination: '$A = sin 25^{\\circ} + cos 25^{\\circ} - (sin 65^{\\circ}) - (cos 65^{\\circ}) = sin 25^{\\circ} + cos 25^{\\circ} - (cos 25^{\\circ}) - (sin 25^{\\circ}) = (sin 25^{\\circ} - sin 25^{\\circ}) + (cos 25^{\\circ} - cos 25^{\\circ}) = 0$.' },
        { content: '2', is_correct: false },
        { content: '$-1$', is_correct: false },
      ],
    },
    {
      content: 'Cho góc nhọn $\\alpha$. Khẳng định nào sau đây là <b>SAI</b>?',
      explaination: 'Kiểm tra các hệ thức lượng giác cơ bản.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$sin^2 \\alpha + cos^2 \\alpha = 1$', is_correct: false, explaination: 'Đây là hệ thức lượng giác cơ bản, luôn <b>đúng</b>.' },
        { content: '$tan \\alpha = \\frac{sin \\alpha}{cos \\alpha}$', is_correct: false, explaination: 'Đây là hệ thức lượng giác cơ bản, luôn <b>đúng</b>.' },
        { content: '$tan \\alpha \\cdot cot \\alpha = 1$', is_correct: false, explaination: 'Đây là hệ thức lượng giác cơ bản, luôn <b>đúng</b>.' },
        { content: '$sin \\alpha + cos \\alpha = 1$', is_correct: true, explaination: 'Đây là khẳng định <b>sai</b>. Chỉ có $sin^2 \\alpha + cos^2 \\alpha = 1$.' },
      ],
    },
    {
      content: 'Một cái thang dài 12m đặt dựa vào tường. Chân thang cách tường 7m. Tính góc $\\alpha$ tạo bởi thang và <b>tường</b> (làm tròn đến độ).',
      explaination: 'Vẽ tam giác vuông, 12m là cạnh huyền, 7m là cạnh đối của góc $\\alpha$ (góc giữa thang và tường).',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$36^{\\circ}$', is_correct: true, explaination: 'Gọi tam giác vuông là ABC (vuông tại A), AB là tường, AC là mặt đất. Thang là BC=12m. Chân thang cách tường AC=7m. Góc $\\alpha$ giữa thang (BC) và tường (AB) là góc $\\hat{B}$. Ta có $sin B = \\frac{AC}{BC} = \\frac{7}{12} \\approx 0.5833$. Dùng máy tính: $sin^{-1}(7/12) \\approx 35.68...^{\\circ} \\approx 36^{\\circ}$.' },
        { content: '$54^{\\circ}$', is_correct: false, explaination: 'Đây là góc tạo bởi thang và mặt đất ($cos C = 7/12$).' },
        { content: '$30^{\\circ}$', is_correct: false },
        { content: '$60^{\\circ}$', is_correct: false },
      ],
    },
    {
      content: 'Cho tam giác ABC vuông tại A. Chọn các hệ thức <b>ĐÚNG</b> (chọn nhiều đáp án).',
      explaination: 'Kiểm tra các hệ thức cơ bản dựa trên định nghĩa tỉ số lượng giác.',
      level: DifficultyLevel.hard,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$tan B = \\frac{AC}{AB}$', is_correct: true, explaination: '<b>Đúng</b>. $tan = \\frac{\\text{Đối}}{\\text{Kề}}$.' },
        { content: '$sin B = cos C$', is_correct: true, explaination: '<b>Đúng</b>. Vì B và C là hai góc phụ nhau.' },
        { content: '$cos B = \\frac{AC}{BC}$', is_correct: false, explaination: '<b>Sai</b>. Đây là $sin B$. $cos B$ phải là $\\frac{AB}{BC}$.' },
        { content: '$cot C = \\frac{AC}{AB}$', is_correct: true, explaination: '<b>Đúng</b>. $cot C = \\frac{\\text{Kề (với góc C)}}{\\text{Đối (với góc C)}} = \\frac{AC}{AB}$.' },
      ],
    },
    
    // =================================================================
    // === CHƯƠNG 4 - §2. Một số hệ thức về cạnh và góc trong tam giác vuông (9 câu) ===
    // =================================================================
    // --- Easy ---
    {
      content: 'Cho tam giác ABC vuông tại A, hệ thức nào sau đây là <b>ĐÚNG</b>?',
      explaination: 'Trong tam giác vuông, mỗi cạnh góc vuông bằng cạnh huyền nhân với sin góc đối hoặc nhân với côsin góc kề.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$AB = BC \\cdot sin C$', is_correct: true, explaination: '<b>Đúng</b>. Cạnh góc vuông (AB) bằng cạnh huyền (BC) nhân sin góc đối (sin C).' },
        { content: '$AB = BC \\cdot sin B$', is_correct: false, explaination: '<b>Sai</b>. Phải là $AB = BC \\cdot cos B$ (nhân với cosin góc kề).' },
        { content: '$AC = BC \\cdot cos C$', is_correct: false, explaination: '<b>Sai</b>. Phải là $AC = BC \\cdot sin B$ (nhân với sin góc đối).' },
        { content: '$AB = AC \\cdot sin C$', is_correct: false, explaination: '<b>Sai</b>. Đây là hệ thức giữa hai cạnh góc vuông, không phải với cạnh huyền.' },
      ],
    },
    {
      content: 'Trong tam giác ABC vuông tại A, hệ thức nào sau đây là <b>ĐÚNG</b>?',
      explaination: 'Trong tam giác vuông, mỗi cạnh góc vuông bằng cạnh góc vuông kia nhân với tang góc đối hoặc nhân với côtang góc kề.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$AC = AB \\cdot tan C$', is_correct: false, explaination: '<b>Sai</b>. Phải là $AC = AB \\cdot cot B$ (nhân với cotang góc kề).' },
        { content: '$AC = AB \\cdot cot C$', is_correct: false, explaination: '<b>Sai</b>. Phải là $AC = AB \\cdot tan B$ (nhân với tang góc đối).' },
        { content: '$AB = AC \\cdot tan B$', is_correct: false, explaination: '<b>Sai</b>. Phải là $AB = AC \\cdot cot B$ (nhân với cotang góc kề).' },
        { content: '$AB = AC \\cdot tan C$', is_correct: true, explaination: '<b>Đúng</b>. Cạnh góc vuông (AB) bằng cạnh góc vuông kia (AC) nhân tang góc đối (tan C).' },
      ],
    },
    {
      content: 'Cho tam giác ABC vuông tại A. "Giải tam giác vuông" là gì?',
      explaination: 'Đây là định nghĩa của bài toán "Giải tam giác vuông".',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: 'Chỉ tìm độ dài 3 cạnh.', is_correct: false },
        { content: 'Chỉ tìm số đo 2 góc nhọn.', is_correct: false },
        { content: 'Tìm độ dài các cạnh và số đo các góc còn lại của tam giác vuông đó', is_correct: true, explaination: '<b>Đúng</b>, đây là định nghĩa.' },
        { content: 'Chứng minh tam giác đó vuông.', is_correct: false, explaination: 'Tam giác đã cho là vuông rồi.' },
      ],
    },
    // --- Medium ---
    {
      content: 'Cho tam giác ABC vuông tại A, $BC = 20$ cm và $\\hat{B} = 22^{\\circ}$. Tính độ dài cạnh $AB$ (làm tròn đến hàng phần mười).',
      explaination: 'Sử dụng hệ thức: Cạnh góc vuông (AB) = Cạnh huyền (BC) $\\times$ cosin góc kề (cos B). $AB = 20 \\cdot cos(22^{\\circ})$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '7.5 cm', is_correct: false, explaination: 'Đây là $20 \\cdot sin(22^{\\circ})$, là độ dài cạnh AC.' },
        { content: '18.5 cm', is_correct: true, explaination: '$AB = 20 \\cdot cos(22^{\\circ}) \\approx 20 \\cdot 0.927 \\approx 18.54$ cm. Làm tròn là 18.5 cm.' },
        { content: '8.1 cm', is_correct: false, explaination: 'Đây là $20 \\cdot tan(22^{\\circ})$.' },
        { content: '19.4 cm', is_correct: false, explaination: 'Đây là $20 \\cdot sin(68^{\\circ})$.' },
      ],
    },
    {
      content: 'Một cột cờ cao $h$ (m). Tại một thời điểm, bóng của cột cờ trên mặt đất dài 12m và góc tạo bởi tia nắng mặt trời với mặt đất là $40^{\\circ}$. Tính $h$ (làm tròn đến hàng phần mười).',
      explaination: 'Chiều cao cột cờ là cạnh đối, bóng là cạnh kề của góc $40^{\\circ}$. Dùng $h = 12 \\cdot tan(40^{\\circ})$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '14.3 m', is_correct: false, explaination: 'Đây là $12 / cos(40^{\\circ})$.' },
        { content: '9.2 m', is_correct: false, explaination: 'Đây là $12 \\cdot sin(40^{\\circ})$.' },
        { content: '10.1 m', is_correct: true, explaination: '$h = 12 \\cdot tan(40^{\\circ}) \\approx 12 \\cdot 0.839 \\approx 10.068$ m. Làm tròn là 10.1 m.' },
        { content: '7.7 m', is_correct: false, explaination: 'Đây là $12 \\cdot cos(40^{\\circ})$.' },
      ],
    },
    {
      content: 'Giải tam giác ABC vuông tại A, biết $AB = 4$ cm và $AC = 6$ cm. (Làm tròn góc đến độ).',
      explaination: 'Dùng Pytago tìm BC. Dùng $tan B = \\frac{AC}{AB}$ để tìm góc B. Dùng $\\hat{C} = 90^{\\circ} - \\hat{B}$ để tìm góc C.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$BC \\approx 7.2$ cm, $\\hat{B} \\approx 34^{\\circ}$, $\\hat{C} \\approx 56^{\\circ}$', is_correct: false, explaination: '<b>Sai</b>. $tan B = \\frac{AC}{AB} = \\frac{6}{4} = 1.5$, do đó $\\hat{B}$ phải lớn hơn $45^{\\circ}$.' },
        { content: '$BC \\approx 7.2$ cm, $\\hat{B} \\approx 56^{\\circ}$, $\\hat{C} \\approx 34^{\\circ}$', is_correct: true, explaination: '$BC = \\sqrt{4^2 + 6^2} = \\sqrt{16+36} = \\sqrt{52} \\approx 7.2$ cm. $tan B = \\frac{AC}{AB} = \\frac{6}{4} = 1.5 \\implies \\hat{B} \\approx 56^{\\circ}$. $\\hat{C} = 90^{\\circ} - 56^{\\circ} = 34^{\\circ}$.' },
        { content: '$BC = 10$ cm, $\\hat{B} \\approx 53^{\\circ}$, $\\hat{C} \\approx 37^{\\circ}$', is_correct: false, explaination: 'Nhầm lẫn với tam giác 3-4-5.' },
        { content: '$BC \\approx 7.2$ cm, $\\hat{B} \\approx 48^{\\circ}$, $\\hat{C} \\approx 42^{\\circ}$', is_correct: false },
      ],
    },
    // --- Hard ---
    {
      content: 'Cho tam giác nhọn ABC, đường cao AH. Khẳng định nào sau đây là <b>ĐÚNG</b>?',
      explaination: 'Xét tam giác vuông ABH và tam giác vuông ACH. Viết $AH$ theo hai cách.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$AH = AC \\cdot cos C$', is_correct: false, explaination: '<b>Sai</b>. $AH$ là cạnh đối của góc C, nên $AH = AC \\cdot sin C$.' },
        { content: '$AH = AB \\cdot sin B$', is_correct: true, explaination: '<b>Đúng</b>. Trong tam giác vuông ABH, $AH$ là cạnh đối của góc B, nên $AH = AB \\cdot sin B$.' },
        { content: '$AH = BC \\cdot sin B$', is_correct: false, explaination: '<b>Sai</b>. BC không phải là cạnh huyền của tam giác ABH.' },
        { content: '$AH = AB \\cdot cos B$', is_correct: false, explaination: '<b>Sai</b>. Đây là công thức tính $BH$.' },
      ],
    },
    {
      content: 'Từ vị trí A cao 68m, bác Duy nhìn thấy chân tháp (B) và đỉnh tháp (C) với các góc hạ và góc nâng lần lượt là $28^{\\circ}$ và $43^{\\circ}$. Tính chiều cao BC của tháp (làm tròn hàng phần mười).',
      explaination: 'Gọi H là điểm trên tháp ngang với A. Tính khoảng cách ngang $AH = BD$ qua $\\Delta ABH$. Sau đó dùng $AH$ để tính $CH$ trong $\\Delta ACH$. Chiều cao tháp $BC = CH + HB$ (với $HB = AD = 68$m).',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$128.2$ m', is_correct: false, explaination: '<b>Sai</b>. $AH = AD / tan(28^{\\circ}) = 68 / tan(28^{\\circ}) \\approx 127.9$m. $CH = AH \\cdot tan(43^{\\circ}) \\approx 127.9 \\cdot 0.9325 \\approx 119.3$m. $BC = CH + HB = 119.3 + 68 = 187.3$m.' },
        { content: '$119.3$ m', is_correct: false, explaination: 'Đây chỉ là độ cao $CH$ từ điểm A lên đỉnh C.' },
        { content: '$187.3$ m', is_correct: true, explaination: 'Khoảng cách ngang $AH = 68 / tan(28^{\\circ}) \\approx 127.9$ m. Chiều cao $CH = AH \\cdot tan(43^{\\circ}) \\approx 127.9 \\cdot 0.9325 \\approx 119.3$ m. Tổng chiều cao $BC = CH + AD = 119.3 + 68 = 187.3$ m.' },
        { content: '$127.9$ m', is_correct: false, explaination: 'Đây là khoảng cách ngang $AH$ (hay BD).' },
      ],
    },
    {
      content: 'Chọn các hệ thức <b>ĐÚNG</b> để giải tam giác ABC vuông tại A, biết $AC = 7$ cm và $\\hat{B} = 55^{\\circ}$. (Chọn nhiều đáp án)',
      explaination: 'Áp dụng các hệ thức lượng trong tam giác vuông. Cạnh AC là cạnh đối của góc B.',
      level: DifficultyLevel.hard,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$\\hat{C} = 35^{\\circ}$', is_correct: true, explaination: '<b>Đúng</b>. $\\hat{C} = 90^{\\circ} - \\hat{B} = 90^{\\circ} - 55^{\\circ} = 35^{\\circ}$.' },
        { content: '$AB = 7 \\cdot tan(55^{\\circ})$', is_correct: false, explaination: '<b>Sai</b>. Phải là $AB = AC \\cdot cot(B) = 7 \\cdot cot(55^{\\circ})$.' },
        { content: '$AB = 7 \\cdot cot(55^{\\circ})$', is_correct: true, explaination: '<b>Đúng</b>. Cạnh góc vuông (AB) = Cạnh góc vuông kia (AC) $\\times$ cotang góc kề (cot B).' },
        { content: '$BC = \\frac{7}{cos(55^{\\circ})}$', is_correct: false, explaination: '<b>Sai</b>. Phải là $BC = \\frac{AC}{sin B} = \\frac{7}{sin(55^{\\circ})}$.' },
        { content: '$BC = \\frac{7}{sin(55^{\\circ})}$', is_correct: true, explaination: '<b>Đúng</b>. Cạnh góc vuông (AC) = Cạnh huyền (BC) $\\times$ sin góc đối (sin B) $\\implies BC = AC / sin B$.' },
      ],
    },

    // =================================================================
    // === CHƯƠNG 4 - §3. Ứng dụng của tỉ số lượng giác của góc nhọn (9 câu) ===
    // =================================================================
    // --- Easy ---
    {
      content: 'Trong đo đạc, "góc nâng" (góc nghiêng lên) là góc tạo bởi...',
      explaination: 'Đây là định nghĩa về góc nâng (góc nghiêng lên).',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: 'Tia nhìn xuống dưới và phương thẳng đứng.', is_correct: false },
        { content: 'Tia nhìn lên trên và phương thẳng đứng.', is_correct: false },
        { content: 'Tia nhìn lên trên và phương nằm ngang.', is_correct: true, explaination: 'Góc nâng là góc tạo bởi tia nhìn lên (ví dụ: nhìn đỉnh tháp) và tia nằm ngang (hướng nhìn ngang của mắt).' },
        { content: 'Tia nhìn xuống dưới và phương nằm ngang.', is_correct: false, explaination: 'Đây là định nghĩa góc hạ (góc nghiêng xuống).' },
      ],
    },
    {
      content: 'Trong đo đạc, "góc hạ" (góc nghiêng xuống) là góc tạo bởi...',
      explaination: 'Đây là định nghĩa về góc hạ (góc nghiêng xuống).',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: 'Tia nhìn xuống dưới và phương nằm ngang.', is_correct: true, explaination: 'Góc hạ là góc tạo bởi tia nhìn xuống (ví dụ: nhìn chân tháp) và tia nằm ngang (hướng nhìn ngang của mắt).' },
        { content: 'Tia nhìn lên trên và phương nằm ngang.', is_correct: false, explaination: 'Đây là định nghĩa góc nâng (góc nghiêng lên).' },
        { content: 'Tia nhìn xuống dưới và phương thẳng đứng.', is_correct: false },
        { content: 'Tia nhìn lên trên và phương thẳng đứng.', is_correct: false },
      ],
    },
    // --- Medium ---
    {
      content: 'Một máy bay cất cánh, bay lên theo đường thẳng AB tạo với phương ngang $AC$ một góc $20^{\\circ}$. Sau 5 giây, máy bay ở độ cao $BC = 110$ m. Tính quãng đường AB máy bay đã bay (làm tròn đến mét).',
      explaination: 'Xét tam giác ABC vuông tại C. Ta có $BC$ là cạnh đối, $AB$ là cạnh huyền của góc $20^{\\circ}$. Dùng $sin(20^{\\circ}) = \\frac{BC}{AB}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '322 m', is_correct: true, explaination: 'Ta có $sin(20^{\\circ}) = \\frac{BC}{AB} \\implies AB = \\frac{BC}{sin(20^{\\circ})} = \\frac{110}{sin(20^{\\circ})} \\approx \\frac{110}{0.342} \\approx 321.6$ m. Làm tròn là 322 m.' },
        { content: '302 m', is_correct: false, explaination: 'Bạn có thể đã dùng $AB = \\frac{BC}{tan(20^{\\circ})}$.' },
        { content: '117 m', is_correct: false, explaination: 'Bạn có thể đã dùng $AB = \\frac{BC}{cos(20^{\\circ})}$.' },
        { content: '40 m', is_correct: false, explaination: 'Bạn có thể đã dùng $AB = BC \\cdot tan(20^{\\circ})$.' },
      ],
    },
    {
      content: 'Để đo chiều cao một cái cây, bạn Hoàng đứng cách cây 6m và đo được góc nâng (góc nhìn lên đỉnh cây) là $38^{\\circ}$. Biết mắt bạn Hoàng cách mặt đất 1.64m. Tính chiều cao của cây (làm tròn hàng phần trăm).',
      explaination: 'Gọi chiều cao cây là $AH = AD + DH$. Ta có $DH = 1.64$m. $AD$ là cạnh đối của góc $38^{\\circ}$ trong tam giác vuông ADC, với cạnh kề $CD = 6$m. $AD = CD \\cdot tan(38^{\\circ})$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '4.69 m', is_correct: false, explaination: 'Đây là chiều cao $AD$ từ tầm mắt lên đỉnh cây.' },
        { content: '7.64 m', is_correct: false, explaination: 'Bạn đã cộng <b>sai</b> $6 + 1.64$.' },
        { content: '6.33 m', is_correct: true, explaination: 'Chiều cao $AD = 6 \\cdot tan(38^{\\circ}) \\approx 6 \\cdot 0.7813 \\approx 4.6878$ m. Chiều cao cây $AH = AD + 1.64 \\approx 4.6878 + 1.64 = 6.3278$ m. Làm tròn là 6.33 m.' },
        { content: '4.72 m', is_correct: false, explaination: 'Bạn đã dùng $AD = 6 \\cdot sin(38^{\\circ})$.' },
      ],
    },
    {
      content: 'Một con sông rộng 100m. Một chiếc thuyền đi thẳng từ bờ B sang bờ C, bị dòng nước đẩy xiên một góc $35^{\\circ}$ (góc $\\hat{ABC}$). Tính quãng đường $BC$ thuyền đã đi (làm tròn hàng phần mười).',
      explaination: 'Xét tam giác ABC vuông tại A (với AB là chiều rộng sông). $AB$ là cạnh kề, $BC$ là cạnh huyền của góc $\\hat{ABC} = 35^{\\circ}$. Ta có $cos(35^{\\circ}) = \\frac{AB}{BC}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '174.3 m', is_correct: false, explaination: 'Bạn đã dùng $BC = AB / sin(35^{\\circ})$.' },
        { content: '122.1 m', is_correct: true, explaination: '$cos(35^{\\circ}) = \\frac{AB}{BC} \\implies BC = \\frac{AB}{cos(35^{\\circ})} = \\frac{100}{cos(35^{\\circ})} \\approx \\frac{100}{0.819} \\approx 122.07$ m. Làm tròn là 122.1 m.' },
        { content: '70.0 m', is_correct: false, explaination: 'Bạn đã dùng $BC = AB \\cdot tan(35^{\\circ})$.' },
        { content: '81.9 m', is_correct: false, explaination: 'Bạn đã dùng $BC = AB \\cdot cos(35^{\\circ})$.' },
      ],
    },
    {
      content: 'Để đo khoảng cách giữa hai điểm B và C qua một cái hồ (không đo trực tiếp được), người ta chọn điểm A sao cho $\\hat{ACB}$ là góc vuông và đo được $AC = 4$m, $\\hat{BAC} = 81^{\\circ}$. Khoảng cách BC là:',
      explaination: 'Xét tam giác ABC vuông tại C. $BC$ là cạnh đối, $AC$ là cạnh kề của góc $\\hat{BAC} = 81^{\\circ}$. Ta dùng $tan(A) = \\frac{BC}{AC}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$4 \\cdot sin(81^{\\circ}) \\approx 3.95$ m', is_correct: false },
        { content: '$4 \\cdot cos(81^{\\circ}) \\approx 0.63$ m', is_correct: false },
        { content: '$4 \\cdot tan(81^{\\circ}) \\approx 25.26$ m', is_correct: true, explaination: '$BC = AC \\cdot tan(A) = 4 \\cdot tan(81^{\\circ}) \\approx 4 \\cdot 6.3138 \\approx 25.26$ m.' },
        { content: '$4 / tan(81^{\\circ}) \\approx 0.63$ m', is_correct: false },
      ],
    },
    // --- Hard ---
    {
      content: 'Từ đỉnh tháp hải đăng cao 149m, một người quan sát thấy du thuyền ở góc hạ $27^{\\circ}$. Hỏi thuyền cách chân hải đăng bao nhiêu mét? (làm tròn hàng đơn vị)',
      explaination: 'Góc hạ $27^{\\circ}$ bằng góc nâng từ thuyền lên đỉnh tháp (so le trong). Gọi $h=149$m là chiều cao (cạnh đối), $d$ là khoảng cách (cạnh kề). Ta có $tan(27^{\\circ}) = \\frac{h}{d}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '76 m', is_correct: false, explaination: 'Bạn đã dùng $d = h \\cdot tan(27^{\\circ})$.' },
        { content: '328 m', is_correct: false, explaination: 'Bạn đã dùng $d = h / sin(27^{\\circ})$.' },
        { content: '167 m', is_correct: false, explaination: 'Bạn đã dùng $d = h / cos(27^{\\circ})$.' },
        { content: '292 m', is_correct: true, explaination: '$d = \\frac{h}{tan(27^{\\circ})} = \\frac{149}{tan(27^{\\circ})} \\approx \\frac{149}{0.5095} \\approx 292.44$ m. Làm tròn là 292 m.' },
      ],
    },
    {
      content: 'Để đo chiều cao tháp Eiffel, người ta đo tại hai điểm A, B cách nhau 101m (B gần tháp hơn) và thẳng hàng với chân tháp C. Góc nâng tới đỉnh tháp D từ A là $60^{\\circ}$, từ B là $75^{\\circ}$. Tính chiều cao $h=CD$ (làm tròn hàng đơn vị).',
      explaination: 'Đặt $BC = x$. Ta có $h = x \\cdot tan(75^{\\circ})$ và $h = (x+101) \\cdot tan(60^{\\circ})$. Giải hệ phương trình này để tìm $h$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '282 m', is_correct: false },
        { content: '326 m', is_correct: true, explaination: 'Ta có $x = \\frac{h}{tan(75^{\\circ})}$ và $x+101 = \\frac{h}{tan(60^{\\circ})}$. Trừ hai vế: $(x+101) - x = \\frac{h}{tan(60^{\\circ})} - \\frac{h}{tan(75^{\\circ})} \\implies 101 = h(\\frac{1}{tan(60^{\\circ})} - \\frac{1}{tan(75^{\\circ})})$. Vậy $h = \\frac{101}{\\frac{1}{tan(60^{\\circ})} - \\frac{1}{tan(75^{\\circ})}} = \\frac{101}{cot(60^{\\circ}) - cot(75^{\\circ})} \\approx \\frac{101}{0.577 - 0.268} \\approx \\frac{101}{0.309} \\approx 326.8$ m. Làm tròn là 326 m.' },
        { content: '175 m', is_correct: false },
        { content: '301 m', is_correct: false },
      ],
    },
    {
      content: 'Để đo chiều cao $AD$ của một ngọn tháp (như Hình 32, CD_1.pdf), người ta đo khoảng cách đến chân tháp $a = OB$, chiều cao giác kế $b = OC$ và góc nâng $\\alpha = \\hat{AOB}$. Công thức nào sau đây tính chiều cao $AD$ là <b>ĐÚNG</b>?',
      explaination: 'Chiều cao tháp $AD$ bằng tổng của phần $AB$ (tính được từ tam giác vuông OAB) và chiều cao giác kế $b = BD$ (lưu ý $BD = OC$). Ta có $AB = OB \\cdot tan(\\alpha) = a \\cdot tan(\\alpha)$. Vậy $AD = AB + BD = a \\cdot tan(\\alpha) + b$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat4_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$AD = a \\cdot tan(\\alpha) + b$', is_correct: true, explaination: '<b>Đúng</b>. $AD = AB + BD = (a \\cdot tan(\\alpha)) + b$.' },
        { content: '$AD = a \\cdot tan(\\alpha)$', is_correct: false, explaination: '<b>Sai</b>. Đây mới chỉ là $AB$, chưa cộng chiều cao giác kế $b$.' },
        { content: '$AD = a \\cdot sin(\\alpha) + b$', is_correct: false, explaination: '<b>Sai</b>. Dùng $tan$ chứ không phải $sin$.' },
        { content: '$AD = b \\cdot tan(\\alpha) + a$', is_correct: false, explaination: '<b>Sai</b>. Nhầm lẫn giữa $a$ và $b$.' },
  ],
    },

    // ===================================================================
    // === CHƯƠNG 5 - §1. Đường tròn. Vị trí tương đối của hai đường tròn ===
    // ===================================================================
    // --- Easy ---
    {
      content:
        'Trong mặt phẳng, tập hợp các điểm cách điểm $O$ cố định một khoảng $R > 0$ được gọi là:',
      explaination:
        'Đây là định nghĩa cơ bản của đường tròn tâm O, bán kính R, kí hiệu là (O; R).',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đường tròn tâm $O$, bán kính $R$',
          is_correct: true,
        },
        {
          content: 'Hình tròn tâm $O$, bán kính $R$',
          is_correct: false,
          explaination:
            'Hình tròn bao gồm các điểm nằm bên trong và trên đường tròn (tức là cách O một khoảng $\\le R$).',
        },
        {
          content: 'Hình cầu tâm $O$, bán kính $R$',
          is_correct: false,
          explaination: 'Hình cầu là khái niệm trong không gian 3 chiều.',
        },
        {
          content: 'Một đoạn thẳng có độ dài $R$',
          is_correct: false,
          explaination: 'Đoạn thẳng chỉ là tập hợp điểm trên 1 đường thẳng.',
        },
      ],
    },
    {
      content:
        'Cho đường tròn (O; 5 cm) và điểm N. Biết $ON = 4.5$ cm. Vị trí của điểm N là:',
      explaination:
        'So sánh khoảng cách ON với bán kính R (5 cm) để xác định vị trí tương đối của điểm N.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Điểm N nằm bên trong đường tròn (O)',
          is_correct: true,
          explaination: 'Vì $ON = 4.5$ cm < $R = 5$ cm.',
        },
        {
          content: 'Điểm N nằm trên đường tròn (O)',
          is_correct: false,
          explaination: 'Nếu N nằm trên, $ON = R = 5$ cm.',
        },
        {
          content: 'Điểm N nằm bên ngoài đường tròn (O)',
          is_correct: false,
          explaination: 'Nếu N nằm ngoài, $ON > R = 5$ cm.',
        },
        {
          content: 'Điểm N trùng với tâm O',
          is_correct: false,
          explaination: 'Nếu N trùng O, $ON = 0$ cm.',
        },
      ],
    },
    {
      content: 'Trong các dây của một đường tròn, dây lớn nhất là:',
      explaination:
        'Dây đi qua tâm được gọi là đường kính. Trong các dây của đường tròn, dây lớn nhất là đường kính.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đường kính',
          is_correct: true,
        },
        {
          content: 'Bán kính',
          is_correct: false,
          explaination: 'Bán kính không phải là dây cung.',
        },
        {
          content: 'Dây không đi qua tâm',
          is_correct: false,
          explaination: 'Dây không đi qua tâm luôn nhỏ hơn đường kính.',
        },
        {
          content: 'Tiếp tuyến',
          is_correct: false,
          explaination: 'Tiếp tuyến là đường thẳng.',
        },
      ],
    },
    // --- Medium ---
    {
      content: 'Đường tròn (O) có bao nhiêu trục đối xứng?',
      explaination:
        'Đường tròn là hình có trục đối xứng. Mỗi đường thẳng đi qua tâm là một trục đối xứng của đường tròn đó. Vì có vô số đường thẳng đi qua tâm O, nên có vô số trục đối xứng.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '0',
          is_correct: false,
          explaination: 'Sai, đường tròn có trục đối xứng.',
        },
        {
          content: '1',
          is_correct: false,
          explaination: 'Sai, đường tròn có nhiều hơn 1 trục đối xứng.',
        },
        {
          content: '2',
          is_correct: false,
          explaination: 'Sai, đường tròn có nhiều hơn 2 trục đối xứng.',
        },
        {
          content: 'Vô số',
          is_correct: true,
          explaination:
            'Mỗi đường thẳng đi qua tâm O đều là một trục đối xứng.',
        },
      ],
    },
    {
      content:
        'Cho hai đường tròn (O; 5 cm) và (O\'; 3 cm). Biết $OO\' = 6$ cm. Vị trí tương đối của chúng là:',
      explaination:
        'Ta có $R=5, r=3$. Tính $R-r = 2$ và $R+r = 8$. So sánh $OO\'=6$ với hai giá trị này.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Cắt nhau',
          is_correct: true,
          explaination:
            'Vì $R-r < OO\' < R+r$ (cụ thể là $2 < 6 < 8$), nên hai đường tròn cắt nhau.',
        },
        {
          content: 'Tiếp xúc trong',
          is_correct: false,
          explaination: 'Tiếp xúc trong nếu $OO\' = R-r = 2$ cm.',
        },
        {
          content: 'Tiếp xúc ngoài',
          is_correct: false,
          explaination: 'Tiếp xúc ngoài nếu $OO\' = R+r = 8$ cm.',
        },
        {
          content: 'Ở ngoài nhau',
          is_correct: false,
          explaination: 'Ở ngoài nhau nếu $OO\' > R+r = 8$ cm.',
        },
      ],
    },
    {
      content:
        'Cho hai đường tròn (O; 4 cm) và (O\'; 2 cm). Biết $OO\' = 6$ cm. Vị trí tương đối của chúng là:',
      explaination:
        'Ta có $R=4, r=2$. Tính $R+r = 4+2 = 6$ cm. So sánh $OO\'$ với $R+r$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Cắt nhau',
          is_correct: false,
          explaination: 'Cắt nhau nếu $2 < OO\' < 6$.',
        },
        {
          content: 'Tiếp xúc trong',
          is_correct: false,
          explaination: 'Tiếp xúc trong nếu $OO\' = R-r = 2$ cm.',
        },
        {
          content: 'Tiếp xúc ngoài',
          is_correct: true,
          explaination:
            'Vì $OO\' = 6$ cm và $R+r = 4+2 = 6$ cm, nên $OO\' = R+r$. Hai đường tròn tiếp xúc ngoài.',
        },
        {
          content: 'Đựng nhau',
          is_correct: false,
          explaination: 'Đựng nhau nếu $OO\' < R-r = 2$ cm.',
        },
      ],
    },
    {
      content:
        'Cho hai đường tròn (O; 10 cm) và (O\'; 3 cm). Biết $OO\' = 7$ cm. Vị trí tương đối của chúng là:',
      explaination:
        'Ta có $R=10, r=3$. Tính $R-r = 10-3 = 7$ cm. So sánh $OO\'$ với $R-r$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Cắt nhau',
          is_correct: false,
          explaination: 'Cắt nhau nếu $7 < OO\' < 13$.',
        },
        {
          content: 'Tiếp xúc trong',
          is_correct: true,
          explaination:
            'Vì $OO\' = 7$ cm và $R-r = 10-3 = 7$ cm, nên $OO\' = R-r$. Hai đường tròn tiếp xúc trong.',
        },
        {
          content: 'Tiếp xúc ngoài',
          is_correct: false,
          explaination: 'Tiếp xúc ngoài nếu $OO\' = R+r = 13$ cm.',
        },
        {
          content: 'Đựng nhau',
          is_correct: false,
          explaination: 'Đựng nhau nếu $OO\' < R-r = 7$ cm.',
        },
      ],
    },
    {
      content:
        'Cho hai đường tròn (O; 6 cm) và (O\'; 2 cm). Biết $OO\' = 9$ cm. Vị trí tương đối của chúng là:',
      explaination:
        'Ta có $R=6, r=2$. Tính $R+r = 6+2 = 8$ cm. So sánh $OO\'=9$ cm với $R+r$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Ở ngoài nhau',
          is_correct: true,
          explaination:
            'Vì $OO\' = 9$ cm > $R+r = 8$ cm, nên hai đường tròn ở ngoài nhau (không giao nhau).',
        },
        {
          content: 'Cắt nhau',
          is_correct: false,
          explaination: 'Cắt nhau nếu $4 < OO\' < 8$.',
        },
        {
          content: 'Tiếp xúc ngoài',
          is_correct: false,
          explaination: 'Tiếp xúc ngoài nếu $OO\' = 8$ cm.',
        },
        {
          content: 'Đựng nhau',
          is_correct: false,
          explaination: 'Đựng nhau nếu $OO\' < R-r = 4$ cm.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Một đường tròn có bán kính 20 m. Độ dài lớn nhất có thể của một dây cung AB trên đường tròn đó là bao nhiêu?',
      explaination:
        'Trong một đường tròn, dây lớn nhất là đường kính. Đường kính bằng hai lần bán kính.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '20 m',
          is_correct: false,
          explaination: 'Đây là độ dài bán kính.',
        },
        {
          content: '30 m',
          is_correct: false,
          explaination: 'Độ dài dây cung không vượt quá đường kính.',
        },
        {
          content: '40 m',
          is_correct: true,
          explaination:
            'Độ dài lớn nhất của dây cung là đường kính. $d = 2R = 2 \\times 20 = 40$ m.',
        },
        {
          content: '41 m',
          is_correct: false,
          explaination:
            'Độ dài dây cung không thể lớn hơn đường kính (40 m).',
        },
      ],
    },
    {
      content:
        'Cho hai đường tròn (O; 9 cm) và (O\'; 3 cm) có $OO\' = 5$ cm. Vị trí tương đối của chúng là:',
      explaination:
        'Ta có $R=9, r=3$. Tính $R-r = 9-3 = 6$ cm. So sánh $OO\'=5$ cm với $R-r$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Hai đường tròn ở ngoài nhau',
          is_correct: false,
          explaination: 'Sai. $R+r = 12$. $OO\' < R+r$.',
        },
        {
          content: 'Hai đường tròn cắt nhau',
          is_correct: false,
          explaination: 'Sai. $R-r = 6$. $OO\' < R-r$.',
        },
        {
          content: 'Hai đường tròn tiếp xúc trong',
          is_correct: false,
          explaination: 'Sai. $R-r = 6 \\ne 5$.',
        },
        {
          content: 'Đường tròn (O) đựng đường tròn (O\')',
          is_correct: true,
          explaination:
            'Vì $OO\' = 5$ cm < $R-r = 6$ cm, nên đường tròn (O) đựng đường tròn (O\') (và chúng không giao nhau).',
        },
      ],
    },

    // =========================================================================
    // === CHƯƠNG 5 - §2. Vị trí tương đối của đường thẳng và đường tròn ===
    // =========================================================================
    // --- Easy ---
    {
      content:
        'Đường thẳng $a$ được gọi là tiếp tuyến của đường tròn (O; R) nếu chúng có:',
      explaination:
        'Theo định nghĩa, đường thẳng $a$ tiếp xúc với đường tròn (O) nếu chúng có đúng 1 điểm chung. Điểm chung đó gọi là tiếp điểm.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '0 điểm chung',
          is_correct: false,
          explaination: 'Trường hợp này $a$ và (O) không giao nhau.',
        },
        {
          content: '1 điểm chung',
          is_correct: true,
          explaination: 'Đúng, $a$ là tiếp tuyến và điểm chung là tiếp điểm.',
        },
        {
          content: '2 điểm chung',
          is_correct: false,
          explaination: 'Trường hợp này $a$ và (O) cắt nhau.',
        },
        {
          content: 'Vô số điểm chung',
          is_correct: false,
          explaination: 'Không thể xảy ra giữa đường thẳng và đường tròn.',
        },
      ],
    },
    {
      content:
        'Cho đường tròn (O; R) có bán kính 10 cm. Đường thẳng $a$ cách O một khoảng $d = 12$ cm. Vị trí tương đối của $a$ và (O) là:',
      explaination:
        'So sánh khoảng cách $d$ từ tâm O đến $a$ với bán kính R. Ở đây $R=10$ cm và $d=12$ cm.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Cắt nhau',
          is_correct: false,
          explaination: 'Cắt nhau khi $d < R$. Ở đây $12 \\not< 10$.',
        },
        {
          content: 'Tiếp xúc nhau',
          is_correct: false,
          explaination: 'Tiếp xúc khi $d = R$. Ở đây $12 \\ne 10$.',
        },
        {
          content: 'Không giao nhau',
          is_correct: true,
          explaination:
            'Vì $d > R$ (cụ thể là $12 > 10$), nên đường thẳng $a$ và đường tròn (O) không giao nhau.',
        },
        {
          content: 'Đi qua tâm',
          is_correct: false,
          explaination: 'Đi qua tâm khi $d = 0$.',
        },
      ],
    },
    {
      content:
        'Đường thẳng $a$ và đường tròn (O; R) cắt nhau. Khẳng định nào sau đây đúng về khoảng cách $d$ từ O đến $a$?',
      explaination:
        'Đường thẳng $a$ và đường tròn (O) cắt nhau khi chúng có 2 điểm chung. Điều này xảy ra khi khoảng cách $d$ từ tâm O đến $a$ nhỏ hơn bán kính R.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$d < R$',
          is_correct: true,
          explaination: 'Đây là điều kiện để đường thẳng và đường tròn cắt nhau.',
        },
        {
          content: '$d = R$',
          is_correct: false,
          explaination: 'Đây là điều kiện để tiếp xúc nhau.',
        },
        {
          content: '$d > R$',
          is_correct: false,
          explaination: 'Đây là điều kiện để không giao nhau.',
        },
        {
          content: '$d = 0$',
          is_correct: false,
          explaination:
            'Đây là trường hợp đặc biệt của cắt nhau (đường thẳng đi qua tâm), nhưng $d < R$ là khẳng định tổng quát hơn.',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Một đường tròn (O; 10 cm) cắt đường thẳng $a$ tại hai điểm A và B. Biết độ dài dây cung $AB = 16$ cm. Tính khoảng cách $d$ từ O đến đường thẳng $a$.',
      explaination:
        'Gọi H là hình chiếu của O lên $a$ (H là trung điểm AB). $d = OH$. Áp dụng định lí Pythagore trong tam giác vuông OHA: $OH^2 = OA^2 - AH^2$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '6 cm',
          is_correct: true,
          explaination:
            '$R = OA = 10$ cm. $AH = AB/2 = 16/2 = 8$ cm. $d = OH = \\sqrt{OA^2 - AH^2} = \\sqrt{10^2 - 8^2} = \\sqrt{100 - 64} = \\sqrt{36} = 6$ cm.',
        },
        {
          content: '8 cm',
          is_correct: false,
          explaination: 'Đây là độ dài $AH$.',
        },
        {
          content: '$\\sqrt{36}$ cm',
          is_correct: false,
          explaination: 'Cách viết khác của 6 cm, nhưng thường chọn số nguyên.',
        },
        {
          content: '12 cm',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },
    {
      content:
        'Cho đường thẳng $a$ và đường tròn (O; R) có 1 điểm chung duy nhất là A. Khẳng định nào sau đây là ĐÚNG? (Chọn nhiều đáp án)',
      explaination:
        'Nếu $a$ và (O) có 1 điểm chung A, thì $a$ là tiếp tuyến của (O) tại A. Khi đó, $d=R$ và tiếp tuyến vuông góc với bán kính tại tiếp điểm.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$a$ được gọi là tiếp tuyến của (O).',
          is_correct: true,
          explaination: 'Đây là định nghĩa đường thẳng tiếp xúc.',
        },
        {
          content: 'A được gọi là tiếp điểm.',
          is_correct: true,
          explaination: 'Đây là định nghĩa điểm chung duy nhất.',
        },
        {
          content: 'Khoảng cách $d$ từ O đến $a$ bằng $R$.',
          is_correct: true,
          explaination: 'Đây là điều kiện cần và đủ để tiếp xúc.',
        },
        {
          content: 'Đường thẳng $a$ vuông góc với bán kính $OA$.',
          is_correct: true,
          explaination: 'Đây là tính chất của tiếp tuyến.',
        },
      ],
    },
    {
      content:
        'Cho đường tròn (O; 5 cm) và đường thẳng $a$. Biết khoảng cách $d$ từ O đến $a$ là 3 cm. Độ dài dây cung AB mà $a$ cắt đường tròn là:',
      explaination:
        'Gọi A, B là giao điểm. Gọi H là hình chiếu của O lên $a$. $d = OH = 3$ cm, $R = OA = 5$ cm. Tam giác OHA vuông tại H. $AH = \\sqrt{OA^2 - OH^2} = \\sqrt{5^2 - 3^2} = \\sqrt{16} = 4$ cm. Dây cung $AB = 2 \\times AH$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '4 cm',
          is_correct: false,
          explaination: 'Đây là độ dài nửa dây cung $AH$.',
        },
        {
          content: '8 cm',
          is_correct: true,
          explaination: 'Dây cung $AB = 2 \\times AH = 2 \\times 4 = 8$ cm.',
        },
        {
          content: '$\\sqrt{34}$ cm',
          is_correct: false,
          explaination: 'Sai. Bạn đã tính $\\sqrt{5^2 + 3^2}$.',
        },
        {
          content: '6 cm',
          is_correct: false,
          explaination: 'Đây là $3+3$, không liên quan.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Cho đường thẳng $a$ cắt đường tròn (O; R) tại A và B. Biết $AB = 24$ cm và khoảng cách $d$ từ O đến $a$ là 5 cm. Tính bán kính R.',
      explaination:
        'Gọi H là hình chiếu của O lên $a$. $d = OH = 5$ cm. H là trung điểm của AB, nên $AH = AB/2 = 12$ cm. Áp dụng định lí Pythagore cho tam giác vuông OHA: $R = OA = \\sqrt{OH^2 + AH^2}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '13 cm',
          is_correct: true,
          explaination:
            '$AH = 24/2 = 12$ cm. $R = \\sqrt{d^2 + AH^2} = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$ cm.',
        },
        {
          content: '17 cm',
          is_correct: false,
          explaination: 'Bạn nhầm với bộ ba Pythagore (8, 15, 17).',
        },
        {
          content: '$\\sqrt{119}$ cm',
          is_correct: false,
          explaination: 'Bạn đã tính $\\sqrt{12^2 - 5^2}$.',
        },
        {
          content: '29 cm',
          is_correct: false,
          explaination: 'Bạn đã cộng $5+24$.',
        },
      ],
    },
    {
      content:
        'Cho tam giác ABC vuông tại A. Vẽ đường tròn (B; BA). Vị trí tương đối của đường thẳng AC và đường tròn (B; BA) là:',
      explaination:
        'Đường tròn (B; BA) có tâm B và bán kính $R = BA$. Đường thẳng AC là đường thẳng đi qua A. Ta cần tìm khoảng cách $d$ từ tâm B đến đường thẳng AC. Vì tam giác ABC vuông tại A, $AC \\perp AB$ tại A. Khoảng cách từ B đến đường thẳng AC chính là độ dài đoạn $BA$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Cắt nhau',
          is_correct: false,
          explaination: 'Xảy ra nếu $d < R$. Ở đây $d = BA = R$.',
        },
        {
          content: 'Tiếp xúc nhau',
          is_correct: true,
          explaination:
            'Khoảng cách từ tâm B đến đường thẳng AC là $d = BA$. Bán kính đường tròn là $R = BA$. Vì $d = R$, nên AC tiếp xúc với đường tròn (B; BA) tại A.',
        },
        {
          content: 'Không giao nhau',
          is_correct: false,
          explaination: 'Xảy ra nếu $d > R$.',
        },
        {
          content: 'Không xác định được',
          is_correct: false,
          explaination: 'Xác định được dựa trên tính chất tam giác vuông.',
        },
      ],
    },
    {
      content:
        'Cho đường tròn (O; 5 cm) và dây cung AB = 8 cm. Một đường thẳng $a$ song song với AB và cách AB một khoảng 7 cm. Vị trí tương đối của $a$ và (O) là:',
      explaination:
        'Bước 1: Tính khoảng cách $d_1$ từ O đến AB. $d_1 = \\sqrt{R^2 - (AB/2)^2} = \\sqrt{5^2 - 4^2} = 3$ cm. Bước 2: $a$ song song với AB, cách AB 7 cm. Có 2 trường hợp. TH1 (O, $a$ khác phía so với AB): $d_a = d_1 + 7 = 3+7=10$ cm. TH2 (O, $a$ cùng phía so với AB): $d_a = 7 - d_1 = 7-3=4$ cm.',
      level: DifficultyLevel.hard,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Cắt nhau',
          is_correct: true,
          explaination:
            'TH2: Khoảng cách từ O đến $a$ là $d_a = 4$ cm. Vì $d_a = 4 < R = 5$, nên $a$ cắt đường tròn.',
        },
        {
          content: 'Tiếp xúc nhau',
          is_correct: false,
          explaination: 'Không xảy ra trường hợp $d_a = 5$ cm.',
        },
        {
          content: 'Không giao nhau',
          is_correct: true,
          explaination:
            'TH1: Khoảng cách từ O đến $a$ là $d_a = 10$ cm. Vì $d_a = 10 > R = 5$, nên $a$ không giao đường tròn.',
        },
        {
          content: 'Chắc chắn cắt nhau',
          is_correct: false,
          explaination: 'Không chắc chắn, vì có 1 trường hợp không giao nhau.',
        },
      ],
    },

    // ========================================================
    // === CHƯƠNG 5 - §3. Tiếp tuyến của đường tròn ===
    // ========================================================
    // --- Easy ---
    {
      content:
        'Đường thẳng $a$ là tiếp tuyến của đường tròn (O; R) tại tiếp điểm H. Khẳng định nào sau đây là đúng?',
      explaination:
        'Tính chất cơ bản của tiếp tuyến: Một đường thẳng là tiếp tuyến của đường tròn thì nó vuông góc với bán kính đi qua tiếp điểm.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$a$ song song với $OH$.',
          is_correct: false,
          explaination: 'Sai, tiếp tuyến phải vuông góc.',
        },
        {
          content: '$a$ vuông góc với $OH$ tại $H$.',
          is_correct: true,
          explaination: 'Theo tính chất, $a \\perp OH$ tại H.',
        },
        {
          content: '$a$ cắt đường tròn tại 2 điểm.',
          is_correct: false,
          explaination: 'Tiếp tuyến chỉ có 1 điểm chung.',
        },
        {
          content: 'Khoảng cách từ O đến $a$ nhỏ hơn $R$.',
          is_correct: false,
          explaination: 'Khoảng cách $d=R$.',
        },
      ],
    },
    {
      content:
        'Đường tròn nội tiếp tam giác là đường tròn:',
      explaination:
        'Theo định nghĩa, đường tròn nội tiếp tam giác là đường tròn tiếp xúc với ba cạnh của tam giác.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đi qua ba đỉnh của tam giác.',
          is_correct: false,
          explaination: 'Đây là đường tròn ngoại tiếp.',
        },
        {
          content: 'Tiếp xúc với ba cạnh của tam giác.',
          is_correct: true,
          explaination: 'Tâm của nó là giao điểm ba đường phân giác trong.',
        },
        {
          content: 'Tiếp xúc với một cạnh của tam giác.',
          is_correct: false,
          explaination: 'Không đủ.',
        },
        {
          content: 'Lớn hơn tam giác.',
          is_correct: false,
          explaination: 'Nó nằm bên trong tam giác.',
        },
      ],
    },
    {
      content:
        'Cho điểm A nằm ngoài đường tròn (O). Kẻ hai tiếp tuyến AM và AN đến (O) (M, N là tiếp điểm). Khẳng định nào sau đây là SAI?',
      explaination:
        'Theo tính chất hai tiếp tuyến cắt nhau: AM = AN, AO là phân giác góc MAN, OA là phân giác góc MON.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$AM = AN$',
          is_correct: false,
          explaination: 'Đây là khẳng định đúng.',
        },
        {
          content: '$AO$ là tia phân giác của $\\widehat{MAN}$',
          is_correct: false,
          explaination: 'Đây là khẳng định đúng.',
        },
        {
          content: '$OA$ là tia phân giác của $\\widehat{MON}$',
          is_correct: false,
          explaination: 'Đây là khẳng định đúng.',
        },
        {
          content: '$AM = OM$',
          is_correct: true,
          explaination:
            'Khẳng định này sai. $OM=R$ (bán kính), $AM$ là độ dài tiếp tuyến. Chúng chỉ bằng nhau trong trường hợp đặc biệt.',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Cho đường tròn (O; 3 cm) và điểm A cách O một khoảng 5 cm. Kẻ tiếp tuyến AM với đường tròn (M là tiếp điểm). Tính độ dài AM.',
      explaination:
        'Vì AM là tiếp tuyến, $AM \\perp OM$ tại M. Tam giác OMA vuông tại M. Áp dụng định lí Pythagore: $OA^2 = OM^2 + AM^2$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '4 cm',
          is_correct: true,
          explaination:
            '$AM = \\sqrt{OA^2 - OM^2} = \\sqrt{5^2 - 3^2} = \\sqrt{25 - 9} = \\sqrt{16} = 4$ cm.',
        },
        {
          content: '$\\sqrt{34}$ cm',
          is_correct: false,
          explaination: 'Bạn đã tính $AM = \\sqrt{5^2 + 3^2}$ (sai).',
        },
        {
          content: '8 cm',
          is_correct: false,
          explaination: 'Đây là $5+3$ (sai).',
        },
        {
          content: '2 cm',
          is_correct: false,
          explaination: 'Đây là $5-3$ (sai).',
        },
      ],
    },
    {
      content:
        'Dấu hiệu nào sau đây dùng để nhận biết một đường thẳng $a$ là tiếp tuyến của đường tròn (O; R)? (Chọn nhiều đáp án)',
      explaination:
        'Có hai dấu hiệu nhận biết chính: 1. Dựa vào số điểm chung (1 điểm). 2. Dựa vào khoảng cách $d=R$. 3. Dựa vào tính chất vuông góc với bán kính tại một điểm trên đường tròn.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đường thẳng $a$ và (O) chỉ có 1 điểm chung.',
          is_correct: true,
          explaination: 'Đây là định nghĩa.',
        },
        {
          content: 'Khoảng cách từ tâm O đến $a$ bằng $R$.',
          is_correct: true,
          explaination: 'Đây là dấu hiệu về khoảng cách $d=R$.',
        },
        {
          content:
            'Đường thẳng $a$ đi qua điểm H thuộc (O) và $a$ vuông góc với $OH$.',
          is_correct: true,
          explaination:
            'Đây là dấu hiệu nhận biết thường dùng để chứng minh tiếp tuyến.',
        },
        {
          content: 'Đường thẳng $a$ vuông góc với một bán kính bất kỳ của (O).',
          is_correct: false,
          explaination:
            'Phải vuông góc với bán kính tại tiếp điểm (điểm thuộc đường tròn).',
        },
      ],
    },
    {
      content:
        'Cho tam giác ABC ngoại tiếp đường tròn (I). Biết $AB=10, BC=11, AC=9$. Gọi M, N, P lần lượt là tiếp điểm trên AB, BC, AC. Tính $AM$.',
      explaination:
        'Sử dụng tính chất hai tiếp tuyến cắt nhau: $AM=AP, BM=BN, CN=CP$. Đặt $AM=x$. Ta có $AP=x, BM = 10-x, CP = 9-x$. Từ $BC = BN + NC = BM + CP$, ta có $11 = (10-x) + (9-x)$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '3',
          is_correct: false,
          explaination: 'Kiểm tra lại phép tính.',
        },
        {
          content: '4',
          is_correct: true,
          explaination:
            'Đặt $AM=x$. Ta có $AP=x$. $BM = AB - AM = 10 - x$. $CP = AC - AP = 9 - x$. $BN = BM = 10 - x$. $CN = CP = 9 - x$. Ta có $BC = BN + CN = (10 - x) + (9 - x) = 19 - 2x$. Mà $BC = 11$, nên $19 - 2x = 11 \\implies 2x = 8 \\implies x = 4$.',
        },
        {
          content: '6',
          is_correct: false,
          explaination: 'Đây là độ dài $BN$.',
        },
        {
          content: '5',
          is_correct: false,
          explaination: 'Đây là độ dài $CP$.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Cho đường tròn (O; R) và điểm A ngoài (O). Kẻ hai tiếp tuyến AM, AN (M, N là tiếp điểm). Biết $AM = R$. Tính số đo $\\widehat{MAN}$.',
      explaination:
        'Xét tam giác OMA vuông tại M, có $OM = R$ và $AM = R$. Đây là tam giác vuông cân. Tính $\\widehat{MAO}$, sau đó $\\widehat{MAN} = 2 \\times \\widehat{MAO}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$45^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là số đo của $\\widehat{MAO}$.',
        },
        {
          content: '$60^{\\circ}$',
          is_correct: false,
          explaination: 'Sai. $\\tan(\\widehat{MAO}) = 1$.',
        },
        {
          content: '$90^{\\circ}$',
          is_correct: true,
          explaination:
            'Tam giác OMA vuông tại M có $OM = AM = R$ nên là tam giác vuông cân. Suy ra $\\widehat{MAO} = 45^{\\circ}$. Theo tính chất hai tiếp tuyến cắt nhau, AO là phân giác $\\widehat{MAN}$, vậy $\\widehat{MAN} = 2 \\times \\widehat{MAO} = 2 \\times 45^{\\circ} = 90^{\\circ}$.',
        },
        {
          content: '$120^{\\circ}$',
          is_correct: false,
          explaination: 'Sai, đây có thể là $\\widehat{MON}$.',
        },
      ],
    },
    {
      content:
        'Cho đường tròn (O; 2 cm). Từ điểm A ngoài (O) kẻ hai tiếp tuyến AM, AN sao cho $\\widehat{MAN} = 60^{\\circ}$. Tính độ dài $OA$.',
      explaination:
        'Theo tính chất hai tiếp tuyến cắt nhau, AO là phân giác $\\widehat{MAN}$, nên $\\widehat{MAO} = 30^{\\circ}$. Xét tam giác OMA vuông tại M. Ta có $OM = 2$ cm (bán kính).',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '2 cm',
          is_correct: false,
          explaination: 'Đây là bán kính OM.',
        },
        {
          content: '$2\\sqrt{3}$ cm',
          is_correct: false,
          explaination: 'Đây là độ dài tiếp tuyến AM.',
        },
        {
          content: '4 cm',
          is_correct: true,
          explaination:
            'Trong tam giác vuông OMA, $\\sin(\\widehat{MAO}) = \\frac{OM}{OA}$. $\\sin(30^{\\circ}) = \\frac{2}{OA} \\implies \\frac{1}{2} = \\frac{2}{OA} \\implies OA = 4$ cm.',
        },
        {
          content: '1 cm',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },
    {
      content:
        'Tâm I của đường tròn nội tiếp tam giác ABC là giao điểm của:',
      explaination:
        'Tâm của đường tròn nội tiếp tam giác cách đều ba cạnh của tam giác. Giao điểm của ba đường phân giác trong là điểm cách đều ba cạnh.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Ba đường cao',
          is_correct: false,
          explaination: 'Đây là trực tâm của tam giác.',
        },
        {
          content: 'Ba đường trung tuyến',
          is_correct: false,
          explaination: 'Đây là trọng tâm của tam giác.',
        },
        {
          content: 'Ba đường trung trực',
          is_correct: false,
          explaination: 'Đây là tâm đường tròn ngoại tiếp tam giác.',
        },
        {
          content: 'Ba đường phân giác trong',
          is_correct: true,
          explaination:
            'Điểm này cách đều 3 cạnh, do đó là tâm của đường tròn tiếp xúc với 3 cạnh.',
        },
      ],
    },
    
    // ========================================================
    // === CHƯƠNG 5 - §4. Góc ở tâm. Góc nội tiếp ===
    // ========================================================
    // --- Easy ---
    {
      content: 'Góc có đỉnh trùng với tâm đường tròn được gọi là:',
      explaination:
        'Theo định nghĩa, góc ở tâm là góc có đỉnh trùng với tâm của đường tròn.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Góc nội tiếp',
          is_correct: false,
          explaination: 'Góc nội tiếp có đỉnh nằm trên đường tròn.',
        },
        {
          content: 'Góc ở tâm',
          is_correct: true,
        },
        {
          content: 'Góc vuông',
          is_correct: false,
          explaination: 'Góc vuông là góc $90^{\\circ}$, không phụ thuộc vị trí đỉnh.',
        },
        {
          content: 'Góc có đỉnh bên trong đường tròn',
          is_correct: false,
          explaination: 'Đây là loại góc khác, không nhất thiết phải ở tâm.',
        },
      ],
    },
    {
      content:
        'Cho đường tròn (O) và góc ở tâm $\\widehat{AOB} = 80^{\\circ}$. Số đo cung nhỏ $\\overparen{AB}$ là:',
      explaination:
        'Số đo của cung nhỏ bằng số đo của góc ở tâm chắn cung đó.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$40^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là số đo góc nội tiếp chắn cung AB.',
        },
        {
          content: '$80^{\\circ}$',
          is_correct: true,
          explaination: '$\\text{sđ } \\overparen{AB} = \\widehat{AOB} = 80^{\\circ}$.',
        },
        {
          content: '$160^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là $2 \\times 80^{\\circ}$.',
        },
        {
          content: '$280^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là số đo cung lớn AB ($360^{\\circ} - 80^{\\circ}$).',
        },
      ],
    },
    {
      content:
        'Góc nội tiếp của đường tròn (O) là góc có:',
      explaination:
        'Theo định nghĩa, góc nội tiếp là góc có đỉnh nằm trên đường tròn và hai cạnh chứa hai dây cung của đường tròn đó.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đỉnh nằm trên đường tròn và hai cạnh chứa hai dây cung.',
          is_correct: true,
        },
        {
          content: 'Đỉnh trùng với tâm đường tròn.',
          is_correct: false,
          explaination: 'Đây là góc ở tâm.',
        },
        {
          content: 'Đỉnh nằm bên trong đường tròn.',
          is_correct: false,
          explaination: 'Đây là góc có đỉnh bên trong đường tròn.',
        },
        {
          content: 'Hai cạnh là hai tiếp tuyến.',
          is_correct: false,
          explaination: 'Đây là góc tạo bởi 2 tiếp tuyến cắt nhau.',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Trên đường tròn (O), cho góc nội tiếp $\\widehat{BAC}$ chắn cung $\\overparen{BC}$. Biết $\\text{sđ } \\overparen{BC} = 120^{\\circ}$. Tính số đo $\\widehat{BAC}$.',
      explaination:
        'Số đo của góc nội tiếp bằng nửa số đo của cung bị chắn.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$120^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là số đo cung bị chắn.',
        },
        {
          content: '$240^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là số đo cung lớn BC.',
        },
        {
          content: '$60^{\\circ}$',
          is_correct: true,
          explaination:
            '$\\widehat{BAC} = \\frac{1}{2} \\text{sđ } \\overparen{BC} = \\frac{1}{2} \\times 120^{\\circ} = 60^{\\circ}$.',
        },
        {
          content: '$30^{\\circ}$',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },
    {
      content:
        'Cho (O) và 3 điểm A, B, C trên đường tròn. Biết $\\text{sđ } \\overparen{AB} = 50^{\\circ}$ và $\\text{sđ } \\overparen{BC} = 70^{\\circ}$. Điểm B nằm trên cung nhỏ AC. Tính $\\text{sđ } \\overparen{AC}$.',
      explaination:
        'Áp dụng tính chất cộng cung: Nếu B là một điểm nằm trên cung AC thì $\\text{sđ } \\overparen{AC} = \\text{sđ } \\overparen{AB} + \\text{sđ } \\overparen{BC}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$120^{\\circ}$',
          is_correct: true,
          explaination:
            'Vì B nằm trên cung AC, ta có: $\\text{sđ } \\overparen{AC} = 50^{\\circ} + 70^{\\circ} = 120^{\\circ}$.',
        },
        {
          content: '$20^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là $70^{\\circ} - 50^{\\circ}$.',
        },
        {
          content: '$240^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là số đo cung lớn AC ($360^{\\circ} - 120^{\\circ}$).',
        },
        {
          content: '$60^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là số đo góc nội tiếp chắn cung AC.',
        },
      ],
    },
    {
      content:
        'Cho đường tròn (O) và cung $\\overparen{MN}$. Góc ở tâm chắn cung này là $\\widehat{MON} = 100^{\\circ}$. Các khẳng định nào sau đây là ĐÚNG? (Chọn nhiều đáp án)',
      explaination:
        'Sử dụng mối quan hệ giữa góc ở tâm, số đo cung và góc nội tiếp cùng chắn một cung.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Số đo cung nhỏ $\\overparen{MN}$ bằng $100^{\\circ}$.',
          is_correct: true,
          explaination: 'Số đo cung nhỏ bằng số đo góc ở tâm.',
        },
        {
          content: 'Số đo cung lớn $\\overparen{MN}$ bằng $260^{\\circ}$.',
          is_correct: true,
          explaination: 'Số đo cung lớn = $360^{\\circ} - 100^{\\circ} = 260^{\\circ}$.',
        },
        {
          content:
            'Mọi góc nội tiếp chắn cung nhỏ $\\overparen{MN}$ đều bằng $50^{\\circ}$.',
          is_correct: true,
          explaination:
            'Góc nội tiếp = 1/2 số đo cung bị chắn = $100^{\\circ} / 2 = 50^{\\circ}$.',
        },
        {
          content: 'Góc nội tiếp $\\widehat{MPN}$ (P thuộc cung nhỏ) bằng $50^{\\circ}$.',
          is_correct: false,
          explaination:
            'Nếu P thuộc cung nhỏ MN, thì góc $\\widehat{MPN}$ sẽ chắn cung lớn MN ($260^{\\circ}$). Số đo góc đó là $130^{\\circ}$.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Cho tam giác ABC nội tiếp đường tròn (O) có AB là đường kính. Khẳng định nào sau đây là đúng?',
      explaination:
        'Nếu AB là đường kính, thì $\\widehat{ACB}$ là góc nội tiếp chắn nửa đường tròn (chắn cung $\\overparen{AB}$ có số đo $180^{\\circ}$).',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Tam giác ABC là tam giác đều.',
          is_correct: false,
          explaination: 'Chỉ đúng nếu $C=60^{\\circ}$, nhưng ở đây $C=90^{\\circ}$.',
        },
        {
          content: 'Tam giác ABC vuông tại C.',
          is_correct: true,
          explaination:
            'Hệ quả: Góc nội tiếp chắn nửa đường tròn là góc vuông. $\\widehat{ACB}$ chắn nửa đường tròn đường kính AB nên $\\widehat{ACB} = 90^{\\circ}$.',
        },
        {
          content: 'Tam giác ABC cân tại O.',
          is_correct: false,
          explaination: 'O là tâm, O, A, B thẳng hàng. OAC và OBC là tam giác cân.',
        },
        {
          content: 'Tam giác ABC vuông tại A.',
          is_correct: false,
          explaination: 'Góc vuông là C, không phải A.',
        },
      ],
    },
    {
      content:
        'Cho tam giác đều ABC nội tiếp đường tròn (O). Tính số đo cung nhỏ $\\overparen{BC}$.',
      explaination:
        'Tam giác ABC đều nên $AB = BC = CA$. Trong một đường tròn, các dây bằng nhau căng các cung bằng nhau. Ba cung $\\overparen{AB}, \\overparen{BC}, \\overparen{CA}$ bằng nhau và tổng của chúng là $360^{\\circ}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$60^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là số đo của góc $\\widehat{BAC}$.',
        },
        {
          content: '$90^{\\circ}$',
          is_correct: false,
          explaination: 'Sai.',
        },
        {
          content: '$120^{\\circ}$',
          is_correct: true,
          explaination:
            '$\\text{sđ } \\overparen{AB} = \\text{sđ } \\overparen{BC} = \\text{sđ } \\overparen{CA} = 360^{\\circ} / 3 = 120^{\\circ}$.',
        },
        {
          content: '$180^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là số đo nửa đường tròn.',
        },
      ],
    },
    {
      content:
        'Trên đường tròn (O), cho góc nội tiếp $\\widehat{MBN} = 35^{\\circ}$ (B thuộc cung lớn MN). Tính số đo góc ở tâm $\\widehat{MON}$ (chắn cung nhỏ MN).',
      explaination:
        'Góc nội tiếp $\\widehat{MBN}$ chắn cung nhỏ $\\overparen{MN}$. Số đo góc ở tâm $\\widehat{MON}$ cũng bằng số đo cung nhỏ $\\overparen{MN}$. Ta có $\\widehat{MON} = \\text{sđ } \\overparen{MN} = 2 \\times \\widehat{MBN}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$35^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là số đo góc nội tiếp.',
        },
        {
          content: '$70^{\\circ}$',
          is_correct: true,
          explaination:
            'Góc ở tâm bằng hai lần góc nội tiếp cùng chắn một cung. $\\widehat{MON} = 2 \\times 35^{\\circ} = 70^{\\circ}$.',
        },
        {
          content: '$17.5^{\\circ}$',
          is_correct: false,
          explaination: 'Bạn đã chia 2 thay vì nhân 2.',
        },
        {
          content: '$145^{\\circ}$',
          is_correct: false,
          explaination: 'Sai.',
        },
      ],
    },
    {
      content:
        'Cho đường tròn (O) và hai dây cung $AB \\perp CD$ tại H (H nằm trong đường tròn). Khẳng định nào sau đây là đúng?',
      explaination:
        'Xét tam giác AHC. $\\widehat{HAC} + \\widehat{HCA} = 90^{\\circ}$. $\\widehat{HAC}$ (hay $\\widehat{DAC}$) là góc nội tiếp chắn cung $\\overparen{DC}$. $\\widehat{HCA}$ (hay $\\widehat{BCA}$) là góc nội tiếp chắn cung $\\overparen{BA}$. ... (Lỗi suy luận). Thử cách khác: $\\widehat{ADC}$ chắn cung $\\overparen{AC}$, $\\widehat{DAB}$ chắn cung $\\overparen{DB}$. Trong tam giác vuông ADH, $\\widehat{ADC} + \\widehat{DAB} = 90^{\\circ}$. Do đó $\\frac{1}{2}\\text{sđ } \\overparen{AC} + \\frac{1}{2}\\text{sđ } \\overparen{DB} = 90^{\\circ}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\text{sđ } \\overparen{AC} + \\text{sđ } \\overparen{BD} = 180^{\\circ}$',
          is_correct: true,
          explaination:
            'Xét góc nội tiếp $\\widehat{ADC}$ (chắn $\\overparen{AC}$) và $\\widehat{DAB}$ (chắn $\\overparen{DB}$). Trong tam giác vuông ADH (vuông tại H), ta có $\\widehat{ADC} + \\widehat{DAB} = 90^{\\circ}$. Theo định lí góc nội tiếp: $\\frac{1}{2}\\text{sđ } \\overparen{AC} + \\frac{1}{2}\\text{sđ } \\overparen{DB} = 90^{\\circ}$. Nhân 2 vế ta được $\\text{sđ } \\overparen{AC} + \\text{sđ } \\overparen{BD} = 180^{\\circ}$.',
        },
        {
          content: '$\\text{sđ } \\overparen{AC} = \\text{sđ } \\overparen{BD}$',
          is_correct: false,
          explaination: 'Chỉ đúng khi $AB=CD$ hoặc H là tâm.',
        },
        {
          content: '$\\text{sđ } \\overparen{AC} + \\text{sđ } \\overparen{BD} = 90^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là tổng của hai góc nội tiếp, không phải tổng cung.',
        },
        {
          content: '$AB = CD$',
          is_correct: false,
          explaination: 'Hai dây vuông góc không nhất thiết bằng nhau.',
        },
      ],
    },

    // =========================================================================================
    // === CHƯƠNG 5 - §5. Độ dài cung tròn, diện tích hình quạt tròn, diện tích hình vành khuyên ===
    // =========================================================================================
    // --- Easy ---
    {
      content:
        'Công thức tính độ dài $l$ của cung tròn $n^{\\circ}$ của đường tròn bán kính $R$ là:',
      explaination:
        'Độ dài $l$ của cung $n^{\\circ}$ được tính bằng công thức $l = \\frac{\\pi R n}{180}$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s5.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$l = \\frac{\\pi R n}{180}$',
          is_correct: true,
        },
        {
          content: '$l = \\frac{\\pi R n}{360}$',
          is_correct: false,
          explaination: 'Đây là công thức sai.',
        },
        {
          content: '$l = \\frac{\\pi R^2 n}{180}$',
          is_correct: false,
          explaination: 'Đây là công thức sai, $R^2$ dùng để tính diện tích.',
        },
        {
          content: '$l = \\frac{\\pi R^2 n}{360}$',
          is_correct: false,
          explaination: 'Đây là công thức tính diện tích hình quạt tròn.',
        },
      ],
    },
    {
      content:
        'Công thức tính diện tích $S$ của hình quạt tròn bán kính $R$, ứng với cung $n^{\\circ}$ là:',
      explaination:
        'Diện tích $S$ của hình quạt tròn $n^{\\circ}$ được tính bằng công thức $S = \\frac{\\pi R^2 n}{360}$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s5.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$S = \\frac{\\pi R^2 n}{180}$',
          is_correct: false,
          explaination: 'Công thức này sẽ cho kết quả gấp đôi diện tích đúng.',
        },
        {
          content: '$S = \\frac{\\pi R n}{360}$',
          is_correct: false,
          explaination: 'Đây là công thức sai, $R$ phải là $R^2$.',
        },
        {
          content: '$S = \\frac{\\pi R^2 n}{360}$',
          is_correct: true,
        },
        {
          content: '$S = \\frac{\\pi R n}{180}$',
          is_correct: false,
          explaination: 'Đây là công thức tính độ dài cung $l$.',
        },
      ],
    },
    {
      content:
        'Tính diện tích $S$ của hình vành khuyên giới hạn bởi hai đường tròn đồng tâm có bán kính $R_1 = 10$ cm và $R_2 = 6$ cm.',
      explaination:
        'Công thức tính diện tích hình vành khuyên là $S_{vk} = \\pi(R_1^2 - R_2^2)$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s5.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$4\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Sai. Bạn đã tính $\\pi(R_1 - R_2)$.',
        },
        {
          content: '$136\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Sai. Bạn đã tính $\\pi(R_1^2 + R_2^2)$.',
        },
        {
          content: '$64\\pi \\text{ cm}^2$',
          is_correct: true,
          explaination:
            '$S = \\pi(10^2 - 6^2) = \\pi(100 - 36) = 64\\pi \\text{ cm}^2$.',
        },
        {
          content: '$16\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Sai. Bạn đã tính $\\pi(R_1 - R_2)^2$.',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Tính độ dài cung tròn $60^{\\circ}$ của một đường tròn có bán kính $R = 12$ cm.',
      explaination:
        'Áp dụng công thức $l = \\frac{\\pi R n}{180}$ với $R=12$ và $n=60$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s5.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$4\\pi$ cm',
          is_correct: true,
          explaination:
            '$l = \\frac{\\pi \\times 12 \\times 60}{180} = \\frac{12\\pi}{3} = 4\\pi$ cm.',
        },
        {
          content: '$8\\pi$ cm',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '$12\\pi$ cm',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '$2\\pi$ cm',
          is_correct: false,
          explaination: 'Bạn nhầm với $n=30^{\\circ}$.',
        },
      ],
    },
    {
      content:
        'Một hình quạt tròn (O; 5 cm) có diện tích là $5\\pi$ cm². Số đo $n$ của cung tròn tương ứng là:',
      explaination:
        'Áp dụng công thức $S = \\frac{\\pi R^2 n}{360}$. Ta có $5\\pi = \\frac{\\pi \\times 5^2 \\times n}{360}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s5.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$36^{\\circ}$',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '$72^{\\circ}$',
          is_correct: true,
          explaination:
            '$5\\pi = \\frac{25\\pi n}{360} \\implies 5 = \\frac{25n}{360} \\implies n = \\frac{5 \\times 360}{25} = \\frac{360}{5} = 72^{\\circ}$.',
        },
        {
          content: '$60^{\\circ}$',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '$90^{\\circ}$',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },
    {
      content:
        'Một hình quạt tròn có độ dài cung $l = 15$ cm và bán kính $R = 6$ cm. Diện tích $S$ của nó là:',
      explaination:
        'Khi biết độ dài cung $l$ và bán kính $R$, ta có thể dùng công thức $S = \\frac{lR}{2}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s5.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$90 \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Bạn quên chia 2.',
        },
        {
          content: '$45 \\text{ cm}^2$',
          is_correct: true,
          explaination: '$S = \\frac{15 \\times 6}{2} = \\frac{90}{2} = 45 \\text{ cm}^2$.',
        },
        {
          content: '$2.5 \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Bạn đã tính $l/R$.',
        },
        {
          content: '$180 \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },
    {
      content:
        'Cho đường tròn (O; R) và góc ở tâm $\\widehat{AOB} = n^{\\circ}$. Cung nhỏ $\\overparen{AB}$ có độ dài $l$. Khẳng định nào sau đây là ĐÚNG? (Chọn nhiều đáp án)',
      explaination:
        'Kiểm tra các công thức tính độ dài cung và diện tích hình quạt tròn.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s5.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Độ dài $l = \\frac{\\pi R n}{180}$',
          is_correct: true,
          explaination: 'Đây là công thức đúng.',
        },
        {
          content: 'Diện tích quạt tròn OAB là $S = \\frac{\\pi R^2 n}{360}$',
          is_correct: true,
          explaination: 'Đây là công thức đúng.',
        },
        {
          content: 'Diện tích quạt tròn OAB là $S = \\frac{lR}{2}$',
          is_correct: true,
          explaination:
            'Đây cũng là công thức đúng, $S = \\frac{(\\pi R n / 180) \\times R}{2} = \\frac{\\pi R^2 n}{360}$.',
        },
        {
          content: 'Độ dài $l = \\frac{\\pi R n}{360}$',
          is_correct: false,
          explaination: 'Công thức này sai (thiếu hệ số 2).',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Một hình vành khuyên có diện tích $20\pi \\text{ cm}^2$ và bán kính đường tròn lớn là $R_1 = 6$ cm. Bán kính đường tròn nhỏ $R_2$ là:',
      explaination:
        'Áp dụng công thức $S_{vk} = \\pi(R_1^2 - R_2^2)$. Ta có $20\\pi = \\pi(6^2 - R_2^2)$. Giải phương trình tìm $R_2$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s5.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '16 cm',
          is_correct: false,
          explaination: 'Đây là $R_2^2$.',
        },
        {
          content: '4 cm',
          is_correct: true,
          explaination:
            '$20\\pi = \\pi(36 - R_2^2) \\implies 20 = 36 - R_2^2 \\implies R_2^2 = 16 \\implies R_2 = 4$ cm (vì $R_2 > 0$).',
        },
        {
          content: '$\\sqrt{56}$ cm',
          is_correct: false,
          explaination: 'Bạn đã tính $R_2^2 = 36 + 20$.',
        },
        {
          content: '2 cm',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },
    {
      content:
        'Một chiếc bánh pizza hình tròn bán kính 15 cm được cắt thành 6 miếng hình quạt tròn bằng nhau. Diện tích của một miếng bánh là:',
      explaination:
        'Toàn bộ bánh là $360^{\\circ}$. Cắt thành 6 miếng bằng nhau, mỗi miếng có góc ở tâm $n = 360^{\\circ} / 6 = 60^{\\circ}$. Bán kính $R = 15$ cm. Tính diện tích quạt tròn.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s5.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$15\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '$225\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Đây là diện tích cả chiếc bánh.',
        },
        {
          content: '$37.5\\pi \\text{ cm}^2$',
          is_correct: true,
          explaination:
            '$S = \\frac{\\pi R^2 n}{360} = \\frac{\\pi \\times 15^2 \\times 60}{360} = \\frac{225\\pi}{6} = 37.5\\pi \\text{ cm}^2$.',
        },
        {
          content: '$60\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },
    {
      content:
        'Mặt đồng hồ có kim phút dài 12 cm. Khi kim phút di chuyển trong 20 phút, đầu mút của kim phút vạch nên một cung tròn có độ dài là bao nhiêu?',
      explaination:
        'Kim phút quay $360^{\\circ}$ trong 60 phút. Vậy trong 20 phút, nó quay được một góc $n = (20/60) \\times 360^{\\circ} = 120^{\\circ}$. Bán kính $R = 12$ cm. Tính độ dài cung $l$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat5_s5.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$12\\pi$ cm',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '$4\\pi$ cm',
          is_correct: false,
          explaination: 'Bạn có thể nhầm $R=6$ hoặc $n=60$.',
        },
        {
          content: '$120\\pi$ cm',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '$8\\pi$ cm',
          is_correct: true,
          explaination:
            '$l = \\frac{\\pi R n}{180} = \\frac{\\pi \\times 12 \\times 120}{180} = \\frac{1440\\pi}{180} = 8\\pi$ cm.',
        },
      ],
    },

    // =================================================================
    // === CHƯƠNG 6 - §1. Mô tả và biểu diễn dữ liệu trên các bảng, biểu đồ (9 câu) ===
    // =================================================================
    // --- Easy ---
    {
      content: 'Loại biểu đồ nào thích hợp nhất để biểu diễn tỉ lệ phần trăm của các phần trong một tổng thể?',
      explaination: 'Biểu đồ hình quạt tròn được thiết kế để thể hiện tỉ lệ của từng phần so với tổng thể (100%).',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: 'Biểu đồ cột', is_correct: false, explaination: 'Biểu đồ cột thường dùng để so sánh độ lớn giữa các đại lượng.' },
        { content: 'Biểu đồ đoạn thẳng', is_correct: false, explaination: 'Biểu đồ đoạn thẳng thường dùng để thể hiện xu hướng thay đổi theo thời gian.' },
        { content: 'Biểu đồ hình quạt tròn', is_correct: true, explaination: '<b>Đúng</b>. Biểu đồ hình quạt tròn (pie chart) chia hình tròn thành các phần, mỗi phần biểu thị một tỉ lệ phần trăm của tổng thể.' },
        { content: 'Bảng dữ liệu', is_correct: false, explaination: 'Bảng dữ liệu dùng để liệt kê số liệu thô, không phải biểu diễn tỉ lệ một cách trực quan.' },
      ],
    },
    {
      content: 'Biểu đồ cột (bar chart) thường được sử dụng để làm gì?',
      explaination: 'Mục đích chính của biểu đồ cột là so sánh giá trị của các hạng mục khác nhau một cách trực quan.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: 'Thể hiện xu hướng tăng/giảm theo thời gian', is_correct: false, explaination: 'Đây là công dụng chính của biểu đồ đoạn thẳng.' },
        { content: 'So sánh độ lớn của các đại lượng', is_correct: true, explaination: '<b>Đúng</b>. Độ cao của các cột cho phép so sánh trực quan xem đại lượng nào lớn hơn hay nhỏ hơn.' },
        { content: 'Biểu diễn tỉ lệ phần trăm của tổng thể', is_correct: false, explaination: 'Đây là công dụng chính của biểu đồ hình quạt tròn.' },
        { content: 'Liệt kê chi tiết từng số liệu', is_correct: false, explaination: 'Đây là công dụng của bảng thống kê.' },
      ],
    },
    {
      content: 'Loại biểu đồ nào phù hợp để biểu diễn sự thay đổi của nhiệt độ theo thời gian (ví dụ: trong 7 ngày)?',
      explaination: 'Biểu đồ đoạn thẳng (line chart) rất hiệu quả trong việc thể hiện xu hướng (trend) của dữ liệu theo một chuỗi thời gian.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: 'Biểu đồ hình quạt tròn', is_correct: false, explaination: 'Không phù hợp để biểu diễn sự thay đổi liên tục.' },
        { content: 'Biểu đồ cột kép', is_correct: false, explaination: 'Dùng để so sánh 2 bộ dữ liệu song song, không phải xu hướng.' },
        { content: 'Biểu đồ đoạn thẳng', is_correct: true, explaination: '<b>Đúng</b>. Biểu đồ đoạn thẳng nối các điểm dữ liệu theo thời gian, cho thấy rõ sự tăng/giảm.' },
        { content: 'Bảng tần số', is_correct: false, explaination: 'Bảng tần số chỉ cho biết số lần xuất hiện, không thể hiện xu hướng.' },
      ],
    },
    // --- Medium ---
    {
      content: 'Một biểu đồ hình quạt tròn biểu diễn tỉ lệ học lực của lớp 9A. Biết 50% là học lực Tốt, 30% là Khá, 20% là Trung bình. Góc ở tâm của hình quạt biểu diễn học lực Khá là bao nhiêu độ?',
      explaination: 'Một vòng tròn đầy đủ là $360^{\\circ}$. Góc ở tâm tương ứng với 30% là $30\\% \\times 360^{\\circ}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '$30^{\\circ}$', is_correct: false, explaination: 'Đây là tỉ lệ phần trăm, không phải số đo góc.' },
        { content: '$180^{\\circ}$', is_correct: false, explaination: 'Đây là góc của học lực Tốt (50%).' },
        { content: '$72^{\\circ}$', is_correct: false, explaination: 'Đây là góc của học lực Trung bình (20%).' },
        { content: '$108^{\\circ}$', is_correct: true, explaination: 'Góc ở tâm = $30\\% \\times 360^{\\circ} = 0.3 \\times 360^{\\circ} = 108^{\\circ}$.' },
      ],
    },
    {
      content: 'Biểu đồ cột dưới đây cho thấy số lượng học sinh tham gia 4 câu lạc bộ: Toán (30), Anh (50), Nhạc (40), Thể thao (30). Chọn các nhận xét <b>ĐÚNG</b> (chọn nhiều đáp án).',
      explaination: 'Phân tích số liệu từ mô tả của biểu đồ cột.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: 'CLB Anh có nhiều học sinh tham gia nhất.', is_correct: true, explaination: '<b>Đúng</b>. CLB Anh có 50 HS, cao nhất.' },
        { content: 'CLB Toán và Thể thao có số lượng HS bằng nhau.', is_correct: true, explaination: '<b>Đúng</b>. Cả hai CLB đều có 30 HS.' },
        { content: 'CLB Nhạc có ít học sinh tham gia nhất.', is_correct: false, explaination: '<b>Sai</b>. CLB Nhạc (40 HS) nhiều hơn Toán và Thể thao (30 HS).' },
        { content: 'Tổng số học sinh tham gia là 100.', is_correct: false, explaination: '<b>Sai</b>. Tổng là $30 + 50 + 40 + 30 = 150$ HS.' },
      ],
    },
    {
      content: 'Bảng thống kê điểm kiểm tra Toán của tổ 1: { 7, 8, 8, 9, 10, 7, 6, 8 }. Mốt (Mode) của mẫu số liệu này là gì?',
      explaination: 'Mốt (Mode) của mẫu số liệu là giá trị có tần số xuất hiện cao nhất trong mẫu.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '10', is_correct: false, explaination: 'Điểm 10 chỉ xuất hiện 1 lần.' },
        { content: '8', is_correct: true, explaination: 'Điểm 6 (1 lần), Điểm 7 (2 lần), Điểm 8 (3 lần), Điểm 9 (1 lần), Điểm 10 (1 lần). Giá trị 8 xuất hiện nhiều nhất (3 lần).' },
        { content: '7.5', is_correct: false, explaination: 'Đây là giá trị trung bình (Mean).' },
        { content: '3', is_correct: false, explaination: 'Đây là tần số của mốt, không phải giá trị mốt.' },
      ],
    },
    // --- Hard ---
    {
      content: 'Bảng thống kê cho biết lớp 9A có 40 học sinh. Biểu đồ quạt biểu diễn tỉ lệ xếp loại học lực, trong đó học lực Tốt chiếm $108^{\\circ}$. Lớp 9A có bao nhiêu học sinh học lực Tốt?',
      explaination: 'Tỉ lệ % của học lực Tốt = $\\frac{\\text{Góc ở tâm}}{360^{\\circ}}$. Số học sinh = Tỉ lệ % $\times$ Tổng số học sinh.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '10 học sinh', is_correct: false, explaination: 'Kiểm tra lại phép tính tỉ lệ.' },
        { content: '12 học sinh', is_correct: true, explaination: 'Tỉ lệ % học lực Tốt = $\\frac{108^{\\circ}}{360^{\\circ}} = 0.3 = 30\\%$. Số học sinh Tốt = $30\\% \\times 40 = 0.3 \\times 40 = 12$ học sinh.' },
        { content: '15 học sinh', is_correct: false, explaination: 'Kiểm tra lại phép tính tỉ lệ.' },
        { content: '30 học sinh', is_correct: false, explaination: 'Đây là tỉ lệ phần trăm (30%).' },
      ],
    },
    {
      content: 'Biểu đồ đoạn thẳng cho thấy nhiệt độ các ngày trong tuần: T2(28), T3(30), T4(29), T5(32), T6(31), T7(33), CN(32). Chọn các nhận xét <b>ĐÚNG</b> (chọn nhiều đáp án).',
      explaination: 'Phân tích dữ liệu để tìm xu hướng tăng/giảm và giá trị lớn nhất/nhỏ nhất.',
      level: DifficultyLevel.hard,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: 'Nhiệt độ có xu hướng tăng dần trong tuần.', is_correct: true, explaination: '<b>Đúng</b>. Mặc dù có giảm nhẹ vào T4, xu hướng chung là tăng từ 28 (T2) lên 33 (T7).' },
        { content: 'Ngày nóng nhất là Chủ Nhật.', is_correct: false, explaination: '<b>Sai</b>. Ngày nóng nhất là Thứ Bảy (33 độ).' },
        { content: 'Nhiệt độ T5 tăng $3^{\\circ}$C so với T4.', is_correct: true, explaination: '<b>Đúng</b>. Nhiệt độ T5 là $32^{\\circ}$, T4 là $29^{\\circ}$. $32 - 29 = 3$.' },
        { content: 'Ngày mát nhất là Thứ Hai.', is_correct: true, explaination: '<b>Đúng</b>. Thứ Hai có nhiệt độ thấp nhất là $28^{\\circ}$.' },
      ],
    },
    {
      content: 'Biểu đồ cột kép cho thấy số học sinh Nam và Nữ của hai lớp 9A và 9B. 9A (Nam: 20, Nữ: 25), 9B (Nam: 24, Nữ: 20). Tổng số học sinh của hai lớp là bao nhiêu?',
      explaination: 'Cần cộng tất cả học sinh (cả Nam và Nữ) của cả hai lớp lại.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        { content: '45', is_correct: false, explaination: 'Đây là tổng số học sinh lớp 9A.' },
        { content: '44', is_correct: false, explaination: 'Đây là tổng số học sinh lớp 9B.' },
        { content: '89', is_correct: true, explaination: 'Tổng số HS = (HS 9A) + (HS 9B) = (20 + 25) + (24 + 20) = 45 + 44 = 89.' },
        { content: '44 (Nam) và 45 (Nữ)', is_correct: false, explaination: 'Đây là tổng số Nam và Nữ, không phải tổng chung.' },
      ],
    },

    // ========================================================
    // === CHƯƠNG 6 - §2. Tần số. Tần số tương đối ===
    // ========================================================
    // --- Easy ---
    {
      content: 'Số lần xuất hiện của một giá trị trong mẫu dữ liệu thống kê được gọi là gì?',
      explaination:
        'Theo định nghĩa, số lần xuất hiện của một giá trị trong mẫu dữ liệu thống kê được gọi là tần số của giá trị đó.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Tần số (n)',
          is_correct: true,
          explaination: 'Đây là định nghĩa chính xác của tần số.',
        },
        {
          content: 'Tần số tương đối (f)',
          is_correct: false,
          explaination:
            'Tần số tương đối là tỉ số giữa tần số và kích thước mẫu.',
        },
        {
          content: 'Kích thước mẫu (N)',
          is_correct: false,
          explaination: 'Kích thước mẫu là tổng số phần tử của mẫu.',
        },
        {
          content: 'Giá trị (x)',
          is_correct: false,
          explaination: 'Giá trị là dữ liệu thu thập được.',
        },
      ],
    },
    {
      content:
        'Tần số tương đối $f_i$ của một giá trị $x_i$ được tính bằng công thức nào (với $n_i$ là tần số của $x_i$ và $N$ là kích thước mẫu)?',
      explaination:
        'Tần số tương đối $f_i$ là tỉ số giữa tần số $n_i$ và kích thước mẫu $N$. Ta thường viết dưới dạng phần trăm, $f_i = \\frac{n_i}{N} \\times 100\\%$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$f_i = n_i \\times N$',
          is_correct: false,
        },
        {
          content: '$f_i = \\frac{N}{n_i}$',
          is_correct: false,
        },
        {
          content: '$f_i = \\frac{n_i}{N}$',
          is_correct: true,
          explaination: 'Công thức đúng là $f_i = n_i / N$.',
        },
        {
          content: '$f_i = n_i + N$',
          is_correct: false,
        },
      ],
    },
    {
      content:
        'Trong một mẫu số liệu, tổng tất cả các tần số $n_i$ bằng:',
      explaination:
        'Tổng tần số của tất cả các giá trị khác nhau chính bằng tổng số phần tử của mẫu, tức là kích thước mẫu $N$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Kích thước mẫu (N)',
          is_correct: true,
          explaination: 'Ví dụ: Lớp 9C có $N=40$ học sinh, và $n_1+...+n_5 = 6+8+10+12+4 = 40$.',
        },
        {
          content: '100',
          is_correct: false,
          explaination: 'Tổng các tần số tương đối (dạng %) bằng 100%.',
        },
        {
          content: 'Tần số lớn nhất',
          is_correct: false,
        },
        {
          content: '1',
          is_correct: false,
          explaination: 'Tổng các tần số tương đối (dạng số thập phân) bằng 1.',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Thống kê điểm kiểm tra của 40 học sinh lớp 9C, có 10 học sinh được 7 điểm. Tần số tương đối của giá trị "Điểm 7" là bao nhiêu?',
      explaination:
        'Ta có giá trị $x=7$ có tần số $n=10$. Kích thước mẫu $N=40$. Tính $f = (n/N) \\times 100\\%$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '10%',
          is_correct: false,
          explaination: 'Đây là tần số $n$, không phải $f$.',
        },
        {
          content: '25%',
          is_correct: true,
          explaination:
            '$f = (10 / 40) \\times 100\\% = 0.25 \\times 100\\% = 25\\%$.',
        },
        {
          content: '30%',
          is_correct: false,
          explaination: 'Đây là tần số tương đối của Điểm 8.',
        },
        {
          content: '40%',
          is_correct: false,
          explaination: '40 là kích thước mẫu N.',
        },
      ],
    },
    {
      content:
        'Biểu đồ tần số (Hình 15) cho biết lượng hàng tồn kho của 30 mặt hàng. Mặt hàng có số lượng tồn kho là 4 sản phẩm có tần số là bao nhiêu?',
      explaination:
        'Đọc biểu đồ cột tại vị trí "4 Số sản phẩm" trên trục hoành và gióng sang trục tung "Tần số (n)".',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '5',
          is_correct: false,
          explaination: 'Đây là tần số của 2 sản phẩm.',
        },
        {
          content: '11',
          is_correct: false,
          explaination: 'Đây là tần số của 3 sản phẩm.',
        },
        {
          content: '6',
          is_correct: true,
          explaination: 'Cột tại vị trí số 4 có chiều cao ứng với tần số n=6.',
        },
        {
          content: '8',
          is_correct: false,
          explaination: 'Đây là tần số của 5 sản phẩm.',
        },
      ],
    },
    {
      content:
        'Cho mẫu số liệu về thâm niên công tác của 33 nhân viên: 7, 2, 5, 9, 7, 4, 3, 8, 10, 4, 4, 2, 4, 4, 5, 6, 7, 7, 5, 4, 1, 8, 9, 4, 2, 8, 5, 5, 7, 3, 1, 4, 8. Các khẳng định nào sau đây là đúng? (Chọn nhiều đáp án)',
      explaination:
        'Đếm số lần xuất hiện của từng giá trị (1, 2, 3, 4, 5, 6, 7, 8, 9, 10) trong 33 nhân viên. $N=33$.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Giá trị 4 có tần số $n=8$.',
          is_correct: true,
          explaination: 'Đếm dữ liệu gốc, giá trị 4 xuất hiện 8 lần.',
        },
        {
          content: 'Giá trị 5 có tần số $n=5$.',
          is_correct: true,
          explaination: 'Đếm dữ liệu gốc, giá trị 5 xuất hiện 5 lần.',
        },
        {
          content: 'Giá trị 7 có tần số $n=4$.',
          is_correct: false,
          explaination: 'Đếm dữ liệu gốc, giá trị 7 xuất hiện 5 lần.',
        },
        {
          content: 'Giá trị 8 có tần số $n=4$.',
          is_correct: true,
          explaination: 'Đếm dữ liệu gốc, giá trị 8 xuất hiện 4 lần.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Một bảng tần số tương đối cho biết giá trị $x=5$ có tần số tương đối là $20\\%$. Nếu kích thước mẫu là $N=30$, thì tần số $n$ của giá trị $x=5$ là bao nhiêu?',
      explaination:
        'Ta có $f = 20\\%$ và $N=30$. Tần số $n = f \\times N$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '20',
          is_correct: false,
          explaination: 'Đây là tần số tương đối (20%).',
        },
        {
          content: '5',
          is_correct: false,
          explaination: 'Đây là giá trị x.',
        },
        {
          content: '6',
          is_correct: true,
          explaination: '$n = 20\\% \\times 30 = 0.2 \\times 30 = 6$.',
        },
        {
          content: '10',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },
    {
      content:
        'Biểu đồ Hình 16 (biểu đồ tần số tương đối) cho thấy điểm số của 40 học sinh. Số học sinh đạt điểm 8 là bao nhiêu?',
      explaination:
        'Từ biểu đồ, "Điểm 8" có tần số tương đối $f = 30\\%$. Kích thước mẫu $N=40$. Tần số $n = f \\times N$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '30 học sinh',
          is_correct: false,
          explaination: 'Đây là tần số tương đối (30%).',
        },
        {
          content: '10 học sinh',
          is_correct: false,
          explaination: 'Đây là số học sinh đạt điểm 7 ($25\\% \\times 40$).',
        },
        {
          content: '12 học sinh',
          is_correct: true,
          explaination:
            'Số học sinh đạt điểm 8 là: $n_8 = 30\\% \\times 40 = 0.3 \\times 40 = 12$ (học sinh).',
        },
        {
          content: '4 học sinh',
          is_correct: false,
          explaination: 'Đây là số học sinh đạt điểm 9 ($10\\% \\times 40$).',
        },
      ],
    },
    {
      content:
        'Gieo một xúc xắc 32 lần (Bài tập 2, trang 23), giá trị "4 chấm" xuất hiện 8 lần. Tần số tương đối của giá trị "4 chấm" là:',
      explaination:
        'Giá trị $x=4$ có tần số $n=8$. Kích thước mẫu $N=32$. Tính $f = (n/N) \\times 100\\%$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '8%',
          is_correct: false,
          explaination: 'Đây là tần số n.',
        },
        {
          content: '20%',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '25%',
          is_correct: true,
          explaination:
            '$f = (8 / 32) \\times 100\\% = (1/4) \\times 100\\% = 25\\%$.',
        },
        {
          content: '32%',
          is_correct: false,
          explaination: 'Đây là kích thước mẫu N.',
        },
      ],
    },
    {
      content:
        'Trong Bảng 25 (đánh giá 40 sản phẩm), có 16 sản phẩm được "Điểm 9". Tần số tương đối $f$ của "Điểm 9" và góc ở tâm $n^{\\circ}$ tương ứng khi vẽ biểu đồ hình quạt tròn là:',
      explaination:
        '$N=40, n=16$. $f = (16/40) \\times 100\\% = 0.4 \\times 100\\% = 40\\%$. Góc ở tâm $n^{\\circ} = f \\times 360^{\\circ} = 0.4 \\times 360^{\\circ}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$f = 16\\%, n = 57.6^{\\circ}$',
          is_correct: false,
          explaination: '16 là tần số n, không phải f.',
        },
        {
          content: '$f = 40\\%, n = 144^{\\circ}$',
          is_correct: true,
          explaination:
            '$f = (16/40) \\times 100\\% = 40\\%$. Góc $n^{\\circ} = 40\\% \\times 360^{\\circ} = 0.4 \\times 360^{\\circ} = 144^{\\circ}$.',
        },
        {
          content: '$f = 40\\%, n = 40^{\\circ}$',
          is_correct: false,
          explaination: 'Sai cách tính góc ở tâm.',
        },
        {
          content: '$f = 35\\%, n = 126^{\\circ}$',
          is_correct: false,
          explaination: 'Đây là của "Điểm 8" (n=14).',
        },
      ],
    },

    

    // =================================================================================
    // === CHƯƠNG 6 - §4. Phép thử ngẫu nhiên và không gian mẫu. Xác suất của biến cố ===
    // =================================================================================
    // --- Easy ---
    {
      content:
        'Tung một đồng xu một lần. Tập hợp $\\Omega = \\{S; N\\}$ được gọi là gì?',
      explaination:
        'Tập hợp tất cả các kết quả có thể xảy ra của một phép thử ngẫu nhiên được gọi là không gian mẫu của phép thử đó, kí hiệu là $\\Omega$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Không gian mẫu',
          is_correct: true,
        },
        {
          content: 'Biến cố',
          is_correct: false,
          explaination: 'Biến cố là một tập con của không gian mẫu.',
        },
        {
          content: 'Phép thử ngẫu nhiên',
          is_correct: false,
          explaination: 'Tung đồng xu là phép thử, $\\Omega$ là tập kết quả.',
        },
        {
          content: 'Xác suất',
          is_correct: false,
          explaination: 'Xác suất là một con số đo khả năng xảy ra biến cố.',
        },
      ],
    },
    {
      content:
        'Gieo một con xúc xắc 6 mặt một lần. Không gian mẫu $\\Omega$ có bao nhiêu phần tử?',
      explaination:
        'Không gian mẫu là tập hợp các kết quả có thể xảy ra. Con xúc xắc có 6 mặt, nên $\\Omega = \\{1; 2; 3; 4; 5; 6\\}$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '1',
          is_correct: false,
          explaination: 'Phép thử có nhiều hơn 1 kết quả có thể.',
        },
        {
          content: '6',
          is_correct: true,
          explaination: 'Có 6 kết quả có thể xảy ra, tương ứng 6 mặt.',
        },
        {
          content: '12',
          is_correct: false,
          explaination: 'Đây có thể là khi gieo 2 con xúc xắc (tổng).',
        },
        {
          content: '3',
          is_correct: false,
          explaination: 'Sai.',
        },
      ],
    },
    {
      content:
        'Một hộp có 12 thẻ (1 đến 12). Rút ngẫu nhiên 1 thẻ. Biến cố A: "Số xuất hiện trên thẻ là số nguyên tố". Kết quả nào sau đây KHÔNG thuận lợi cho A?',
      explaination:
        'Kết quả thuận lợi cho A là các số nguyên tố từ 1 đến 12, bao gồm: {2, 3, 5, 7, 11}.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Rút được thẻ số 2',
          is_correct: false,
          explaination: 'Số 2 là số nguyên tố.',
        },
        {
          content: 'Rút được thẻ số 7',
          is_correct: false,
          explaination: 'Số 7 là số nguyên tố.',
        },
        {
          content: 'Rút được thẻ số 9',
          is_correct: true,
          explaination: 'Số 9 không phải là số nguyên tố ($9 = 3 \\times 3$).',
        },
        {
          content: 'Rút được thẻ số 11',
          is_correct: false,
          explaination: 'Số 11 là số nguyên tố.',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Gieo một con xúc xắc cân đối. Tính xác suất của biến cố A: "Mặt xuất hiện có số chấm chia hết cho 3".',
      explaination:
        'Tổng số kết quả có thể xảy ra $N(\\Omega) = 6$. Các kết quả thuận lợi cho A (số chấm chia hết cho 3) là {3; 6}. Số kết quả thuận lợi là 2.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$P(A) = \\frac{1}{2}$',
          is_correct: false,
          explaination: 'Sai. Đây là xác suất ra mặt chẵn.',
        },
        {
          content: '$P(A) = \\frac{1}{6}$',
          is_correct: false,
          explaination: 'Sai. Có 2 kết quả thuận lợi, không phải 1.',
        },
        {
          content: '$P(A) = \\frac{1}{3}$',
          is_correct: true,
          explaination: '$P(A) = \\frac{2}{6} = \\frac{1}{3}$.',
        },
        {
          content: '$P(A) = \\frac{2}{3}$',
          is_correct: false,
          explaination: 'Sai. Đây là xác suất của biến cố đối.',
        },
      ],
    },
    {
      content:
        'Một hộp có 20 viên bi (đánh số 1-20). Lấy ngẫu nhiên 1 viên. Tính xác suất của biến cố: "Số xuất hiện trên viên bi chia cho 7 dư 1".',
      explaination:
        'Không gian mẫu $N(\\Omega) = 20$. Các số từ 1 đến 20 chia cho 7 dư 1 bao gồm: 1 ($0 \\times 7 + 1$), 8 ($1 \\times 7 + 1$), 15 ($2 \\times 7 + 1$). Có 3 kết quả thuận lợi.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\frac{1}{20}$',
          is_correct: false,
        },
        {
          content: '$\\frac{2}{20} = \\frac{1}{10}$',
          is_correct: false,
          explaination: 'Các số chia 7 dư 1 là {1, 8, 15}.',
        },
        {
          content: '$\\frac{3}{20}$',
          is_correct: true,
          explaination: 'Các kết quả thuận lợi là {1, 8, 15}.',
        },
        {
          content: '$\\frac{4}{20} = \\frac{1}{5}$',
          is_correct: false,
        },
      ],
    },
    {
      content:
        'Viết ngẫu nhiên một số tự nhiên lẻ có hai chữ số. Không gian mẫu có bao nhiêu phần tử?',
      explaination:
        'Các số tự nhiên lẻ có hai chữ số là: 11, 13, 15, ..., 99. Đây là một dãy số cách đều 2 đơn vị. Số phần tử = (Số cuối - Số đầu) / khoảng cách + 1.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '90',
          is_correct: false,
          explaination: 'Đây là tổng số các số có 2 chữ số (từ 10 đến 99).',
        },
        {
          content: '50',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '45',
          is_correct: true,
          explaination:
            'Số phần tử = $\\frac{99 - 11}{2} + 1 = \\frac{88}{2} + 1 = 44 + 1 = 45$.',
        },
        {
          content: '44',
          is_correct: false,
          explaination: 'Bạn quên cộng 1.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Nhóm văn nghệ có 3 nam (Hùng, Dũng, Việt) và 3 nữ (An, Châu, Hương). Chọn ngẫu nhiên 2 bạn hát song ca. Tính xác suất biến cố A: "Hai bạn được chọn đều là nam".',
      explaination:
        'Bước 1: Liệt kê không gian mẫu (tất cả các cách chọn 2 bạn từ 6 bạn). Bước 2: Liệt kê các kết quả thuận lợi cho A (2 bạn đều là nam).',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\frac{3}{15} = \\frac{1}{5}$',
          is_correct: true,
          explaination:
            'Tổng số cách chọn 2 bạn từ 6 bạn là 15. Các kết quả thuận lợi (2 nam) là 3: (Hùng, Dũng), (Hùng, Việt), (Dũng, Việt). $P(A) = \\frac{3}{15} = \\frac{1}{5}$.',
        },
        {
          content: '$\\frac{1}{2}$',
          is_correct: false,
          explaination: 'Sai. Đây là xác suất chọn được 1 nam/1 nữ.',
        },
        {
          content: '$\\frac{9}{15} = \\frac{3}{5}$',
          is_correct: false,
          explaination: 'Đây là xác suất chọn được 1 nam và 1 nữ.',
        },
        {
          content: '$\\frac{6}{15} = \\frac{2}{5}$',
          is_correct: false,
          explaination: 'Đây là tổng xác suất (2 nam) + (2 nữ).',
        },
      ],
    },
    {
      content:
        'Viết ngẫu nhiên một số tự nhiên lớn hơn 499 và nhỏ hơn 1000. Tính xác suất của biến cố B: "Số tự nhiên được viết ra là lập phương của một số tự nhiên".',
      explaination:
        'Các số tự nhiên từ 500 đến 999. $N(\\Omega) = 999 - 500 + 1 = 500$. Ta tìm $x$ sao cho $500 \\le x^3 \\le 999$. $7^3 = 343$ (loại). $8^3 = 512$ (nhận). $9^3 = 729$ (nhận). $10^3 = 1000$ (loại). Có 2 kết quả thuận lợi.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\frac{1}{250}$',
          is_correct: true,
          explaination:
            'Số phần tử không gian mẫu $N(\\Omega) = 500$. Các kết quả thuận lợi là {512, 729}. Số kết quả thuận lợi là 2. $P(B) = \\frac{2}{500} = \\frac{1}{250}$.',
        },
        {
          content: '$\\frac{3}{500}$',
          is_correct: false,
          explaination: 'Chỉ có 2 lập phương trong khoảng này.',
        },
        {
          content: '$\\frac{1}{500}$',
          is_correct: false,
          explaination: 'Bạn bỏ sót 1 trường hợp.',
        },
        {
          content: '$\\frac{5}{500} = \\frac{1}{100}$',
          is_correct: false,
          explaination: 'Sai. Đây là số các số chia hết cho 100.',
        },
      ],
    },
    {
      content:
        'Một bó hoa gồm 3 bông đỏ và 1 bông vàng. Linh chọn ngẫu nhiên 2 bông. Tính xác suất của biến cố R: "Trong 2 bông được chọn, có đúng 1 bông màu đỏ".',
      explaination:
        'Gọi 3 bông đỏ là $D_1, D_2, D_3$ và bông vàng là $V$. Không gian mẫu (chọn 2) $N(\\Omega) = 6$: $(D_1,D_2), (D_1,D_3), (D_2,D_3), (D_1,V), (D_2,V), (D_3,V)$. Kết quả thuận lợi cho R (1 đỏ, 1 vàng) là: $(D_1,V), (D_2,V), (D_3,V)$. Số kết quả thuận lợi là 3.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\frac{3}{6} = \\frac{1}{2}$',
          is_correct: true,
          explaination:
            'Tổng số cách chọn 2 bông từ 4 bông là 6. Số cách chọn 1 đỏ (từ 3 đỏ) và 1 vàng (từ 1 vàng) là 3. $P(R) = \\frac{3}{6} = \\frac{1}{2}$.',
        },
        {
          content: '$\\frac{1}{4}$',
          is_correct: false,
          explaination: 'Sai.',
        },
        {
          content: '$\\frac{3}{4}$',
          is_correct: false,
          explaination: 'Đây là xác suất của biến cố "có ít nhất 1 bông đỏ".',
        },
        {
          content: '$\\frac{1}{6}$',
          is_correct: false,
          explaination: 'Sai.',
        },
      ],
    },
    {
      content:
        'Từ biểu đồ Hình 28 (trang 42), chọn ngẫu nhiên 1 học sinh tham gia thi đấu. Tính xác suất của biến cố C: "Học sinh được chọn là nữ và không thuộc khối 9".',
      explaination:
        'Bước 1: Tính tổng số học sinh (N). $N = (7+9) + (9+7) + (9+8) + (9+8) = 16+16+17+17 = 66$. Bước 2: Tìm số kết quả thuận lợi (Nữ VÀ không thuộc khối 9). $n_C = (Nữ K6) + (Nữ K7) + (Nữ K8) = 9 + 7 + 8 = 24$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat6_s4.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\frac{32}{66} = \\frac{16}{33}$',
          is_correct: false,
          explaination: 'Đây là xác suất chọn được học sinh Nữ (tổng 32 bạn).',
        },
        {
          content: '$\\frac{24}{66} = \\frac{4}{11}$',
          is_correct: true,
          explaination:
            'Tổng số học sinh $N=66$. Số học sinh Nữ không thuộc K9 là $9 (K6) + 7 (K7) + 8 (K8) = 24$. $P(C) = \\frac{24}{66} = \\frac{4}{11}$.',
        },
        {
          content: '$\\frac{49}{66}$',
          is_correct: false,
          explaination: 'Đây là xác suất học sinh không thuộc K9 (49 bạn).',
        },
        {
          content: '$\\frac{8}{66} = \\frac{4}{33}$',
          is_correct: false,
          explaination: 'Đây là xác suất học sinh Nữ K9.',
        },
      ],
    },

    // ========================================================
    // === CHƯƠNG 7 - §1. Hàm số y = ax^2 (a \ne 0) ===
    // ========================================================
    // --- Easy ---
    {
      content: 'Trong các hàm số sau, hàm số nào có dạng $y = ax^2$ ($a \\ne 0$) với $a = \\frac{1}{3}$?',
      explaination:
        'Tìm hàm số chỉ chứa $x^2$ và xác định hệ số $a$ của nó.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$y = 3x^2$',
          is_correct: false,
          explaination: 'Hàm số này có hệ số $a = 3$, không phải $a = 1/3$.',
        },
        {
          content: '$y = \\frac{x^2}{3}$',
          is_correct: true,
          explaination: 'Hàm số này có thể viết là $y = \\frac{1}{3}x^2$, có hệ số $a = 1/3$.',
        },
        {
          content: '$y = x^2 + \\frac{1}{3}$',
          is_correct: false,
          explaination: 'Đây không phải là hàm số dạng $y = ax^2$ do có hằng số tự do.',
        },
        {
          content: '$y = \\frac{1}{3}x$',
          is_correct: false,
          explaination: 'Đây là hàm số bậc nhất, không phải $y = ax^2$.',
        },
      ],
    },
    {
      content: 'Cho hàm số $y = -4x^2$. Giá trị của $y$ khi $x = -2$ là:',
      explaination:
        'Thay $x = -2$ vào hàm số $y = -4x^2$. Chú ý $x^2 = (-2)^2 = 4$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '16',
          is_correct: false,
          explaination: 'Bạn có thể đã quên dấu âm của hệ số $a$. $y = -4(4) = -16$.',
        },
        {
          content: '32',
          is_correct: false,
          explaination: 'Kết quả $y = -4 \\times 4 = -16$.',
        },
        {
          content: '-32',
          is_correct: false,
          explaination: 'Bạn có thể đã nhầm lẫn khi tính $x^2$.',
        },
        {
          content: '-16',
          is_correct: true,
          explaination: 'Thay $x = -2$ vào, ta có $y = -4(-2)^2 = -4(4) = -16$.',
        },
      ],
    },
    {
      content: 'Đồ thị của hàm số $y = ax^2$ ($a \\ne 0$) là một đường parabol luôn đi qua điểm nào?',
      explaination:
        'Để tìm điểm cố định, ta thử thay $x=0$ vào phương trình hàm số.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Gốc tọa độ $O(0, 0)$',
          is_correct: true,
          explaination: 'Khi $x = 0$, ta luôn có $y = a(0)^2 = 0$, bất kể giá trị $a$.',
        },
        {
          content: 'Điểm $(1, 1)$',
          is_correct: false,
          explaination: 'Điểm này chỉ thuộc đồ thị khi $a=1$.',
        },
        {
          content: 'Điểm $(1, a)$',
          is_correct: false,
          explaination: 'Điểm này thuộc đồ thị, nhưng không phải là điểm *luôn* đi qua cho mọi $a$ (ví dụ $a$ thay đổi thì điểm này thay đổi).',
        },
        {
          content: 'Điểm $(0, a)$',
          is_correct: false,
          explaination: 'Khi $x = 0$, $y = 0$, không phải $a$.',
        },
      ],
    },
    // --- Medium ---
    {
      content: 'Cho hàm số $y = 0.5x^2$. Kết luận nào sau đây là đúng?',
      explaination:
        'Xét dấu của hệ số $a$ (ở đây $a = 0.5$) để xác định hình dạng (bề lõm) và vị trí (trên/dưới trục hoành) của parabol.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đồ thị nằm phía dưới trục hoành.',
          is_correct: false,
          explaination: 'Hệ số $a = 0.5 > 0$ nên đồ thị nằm phía trên trục hoành.',
        },
        {
          content: 'Gốc tọa độ O là điểm cao nhất của đồ thị.',
          is_correct: false,
          explaination: 'Vì $a > 0$, đồ thị quay bề lõm lên trên, nên O là điểm thấp nhất.',
        },
        {
          content: 'Đồ thị nằm phía trên trục hoành.',
          is_correct: true,
          explaination: 'Hệ số $a = 0.5 > 0$, và $x^2 \\ge 0$, nên $y = 0.5x^2 \\ge 0$ với mọi $x$.',
        },
        {
          content: 'Đồ thị không đối xứng qua trục Oy.',
          is_correct: false,
          explaination: 'Đồ thị hàm số $y=ax^2$ luôn nhận trục Oy làm trục đối xứng.',
        },
      ],
    },
    {
      content: 'Đồ thị (P) của hàm số $y = ax^2$ đi qua điểm $M(2, -8)$. Hệ số $a$ bằng:',
      explaination:
        'Điểm $M(2, -8)$ thuộc đồ thị nên tọa độ của nó thỏa mãn phương trình hàm số. Thay $x=2$ và $y=-8$ vào $y=ax^2$ để tìm $a$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '2',
          is_correct: false,
          explaination: 'Thay vào ta có: $-8 = a(2)^2 \\implies -8 = 4a \\implies a = -2$.',
        },
        {
          content: '-2',
          is_correct: true,
          explaination: 'Từ $-8 = 4a$, ta suy ra $a = -8 / 4 = -2$.',
        },
        {
          content: '-4',
          is_correct: false,
          explaination: 'Bạn có thể đã nhầm $x^2 = 2$.',
        },
        {
          content: '4',
          is_correct: false,
          explaination: 'Bạn có thể đã nhầm lẫn về dấu.',
        },
      ],
    },
    {
      content:
        'Đồ thị hàm số $y = -3x^2$ đi qua điểm $A(-1, -3)$. Điểm nào sau đây cũng thuộc đồ thị hàm số?',
      explaination:
        'Đồ thị hàm số $y=ax^2$ có tính chất đối xứng qua trục Oy. Một điểm $M(x_0, y_0)$ thuộc đồ thị thì điểm $N(-x_0, y_0)$ cũng thuộc đồ thị.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$B(1, 3)$',
          is_correct: false,
          explaination: 'Nếu $x=1$, $y = -3(1)^2 = -3$. Điểm $(1, -3)$ mới thuộc đồ thị.',
        },
        {
          content: '$C(-1, 3)$',
          is_correct: false,
          explaination: 'Điểm $A(-1, -3)$ đã thuộc đồ thị, điểm này có cùng hoành độ nhưng khác tung độ.',
        },
        {
          content: '$D(1, -3)$',
          is_correct: true,
          explaination: 'Do đồ thị đối xứng qua trục Oy, điểm $A(-1, -3)$ thuộc đồ thị thì điểm $D(1, -3)$ (là điểm đối xứng của A qua Oy) cũng thuộc đồ thị.',
        },
        {
          content: '$E(3, -9)$',
          is_correct: false,
          explaination: 'Nếu $x=3$, $y = -3(3)^2 = -27$. Điểm $(3, -27)$ mới thuộc đồ thị.',
        },
      ],
    },
    {
      content:
        'Cho hàm số $y = \\frac{1}{2}x^2$. Những điểm nào sau đây thuộc đồ thị của hàm số? (Chọn các đáp án đúng)',
      explaination:
        'Một điểm thuộc đồ thị hàm số nếu tọa độ của nó thỏa mãn phương trình hàm số. Thay $x$ và $y$ của từng điểm vào phương trình $y = \\frac{1}{2}x^2$ để kiểm tra.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$M(2, 2)$',
          is_correct: true,
          explaination: 'Thay $x=2$: $y = \\frac{1}{2}(2)^2 = \\frac{1}{2}(4) = 2$. Tọa độ $(2, 2)$ thỏa mãn. Điểm $M(2, 2)$ thuộc đồ thị.',
        },
        {
          content: '$N(-1, \\frac{1}{2})$',
          is_correct: true,
          explaination: 'Thay $x=-1$: $y = \\frac{1}{2}(-1)^2 = \\frac{1}{2}(1) = \\frac{1}{2}$. Tọa độ $(-1, \\frac{1}{2})$ thỏa mãn. Điểm $N(-1, \\frac{1}{2})$ thuộc đồ thị.',
        },
        {
          content: '$P(4, 4)$',
          is_correct: false,
          explaination: 'Thay $x=4$: $y = \\frac{1}{2}(4)^2 = \\frac{1}{2}(16) = 8$. Tọa độ $(4, 4)$ không thỏa mãn.',
        },
        {
          content: '$Q(-6, -18)$',
          is_correct: false,
          explaination: 'Thay $x=-6$: $y = \\frac{1}{2}(-6)^2 = \\frac{1}{2}(36) = 18$. Tọa độ $(-6, -18)$ không thỏa mãn.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Quãng đường chuyển động $y$ (m) của một vật rơi tự do được cho bởi công thức $y = 5x^2$ (với $x$ là thời gian tính bằng giây). Một vật được thả rơi từ độ cao 125 m. Sau bao lâu vật chạm đất?',
      explaination:
        'Khi vật chạm đất, nó đã đi được quãng đường $y = 125$ m. Thay $y = 125$ vào công thức và giải phương trình tìm $x$ (thời gian $x$ phải là số dương).',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '25 giây',
          is_correct: false,
          explaination: 'Ta có $125 = 5x^2 \\implies x^2 = 125 / 5 = 25$. Đây là $x^2$, không phải $x$.',
        },
        {
          content: '5 giây',
          is_correct: true,
          explaination: 'Ta giải $125 = 5x^2 \\implies x^2 = 25$. Vì $x > 0$ (thời gian) nên $x = \\sqrt{25} = 5$ giây.',
        },
        {
          content: '10 giây',
          is_correct: false,
          explaination: 'Kiểm tra lại phép chia và phép khai căn.',
        },
        {
          content: '3 giây',
          is_correct: false,
          explaination: 'Nếu $x=3$, $y = 5(3)^2 = 45$ m, không phải 125 m.',
        },
      ],
    },
    {
      content:
        'Quỹ đạo của một con cá heo khi nhảy lên khỏi mặt nước có dạng parabol $y = ax^2$. Gốc tọa độ O(0,0) là vị trí cao nhất của cá heo, cách mặt nước 25 feet. Biết sau 2 giây (kể từ vị trí cao nhất), cá heo chạm mặt nước. Hàm số biểu thị quỹ đạo nhảy của cá heo là:',
      explaination:
        'Gốc O(0,0) là điểm cao nhất. Khi cá heo chạm mặt nước, vị trí đó ở bên phải 2 giây ($x=2$) và ở dưới 25 feet ($y=-25$). Điểm chạm mặt nước có tọa độ $(2, -25)$. Thay tọa độ điểm này vào $y=ax^2$ để tìm $a$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$y = -2x^2$',
          is_correct: false,
          explaination: 'Nếu $a=-2$, khi $x=2$, $y = -2(2)^2 = -8$, không phải -25.',
        },
        {
          content: '$y = -12.5x^2$',
          is_correct: false,
          explaination: 'Nếu $a=-12.5$, khi $x=2$, $y = -12.5(2)^2 = -50$, không phải -25.',
        },
        {
          content: '$y = -6.25x^2$',
          is_correct: true,
          explaination:
            'Điểm chạm mặt nước có tọa độ $(2, -25)$. Thay vào $y=ax^2$: $-25 = a(2)^2 \\implies -25 = 4a \\implies a = -25/4 = -6.25$.',
        },
        {
          content: '$y = -25x^2$',
          is_correct: false,
          explaination: 'Giá trị này không thỏa mãn điểm $(2, -25)$.',
        },
      ],
    },

    // ====================================================================
    // === CHƯƠNG 7 - §2. Phương trình bậc hai một ẩn ===
    // ====================================================================
    // --- Easy ---
    {
      content:
        'Phương trình nào sau đây là phương trình bậc hai một ẩn $x$?',
      explaination:
        'Phương trình bậc hai một ẩn $x$ có dạng $ax^2 + bx + c = 0$, trong đó $a, b, c$ là các hệ số và $a \\ne 0$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$0x^2 + 8x + 6 = 0$',
          is_correct: false,
          explaination: 'Đây là phương trình bậc nhất, vì hệ số $a = 0$.',
        },
        {
          content: '$3x^2 - 8 = 0$',
          is_correct: true,
          explaination:
            'Đây là PT bậc hai với $a = 3$, $b = 0$, $c = -8$. Điều kiện $a \\ne 0$ được thỏa mãn.',
        },
        {
          content: '$x^3 + 2x - 1 = 0$',
          is_correct: false,
          explaination: 'Đây là phương trình bậc ba.',
        },
        {
          content: '$5x + 3y = 0$',
          is_correct: false,
          explaination: 'Đây là phương trình bậc nhất hai ẩn.',
        },
      ],
    },
    {
      content:
        'Xác định các hệ số $a, b, c$ của phương trình $2x^2 - 5x + 3 = 0$.',
      explaination:
        'Đối chiếu phương trình $2x^2 - 5x + 3 = 0$ với dạng $ax^2 + bx + c = 0$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$a = 2, b = 5, c = 3$',
          is_correct: false,
          explaination: 'Sai dấu của hệ số b.',
        },
        {
          content: '$a = 2, b = -5, c = 3$',
          is_correct: true,
          explaination: 'Hệ số của $x^2$ là $a=2$, hệ số của $x$ là $b=-5$, hệ số tự do là $c=3$.',
        },
        {
          content: '$a = 2, b = 5, c = -3$',
          is_correct: false,
          explaination: 'Sai dấu của b và c.',
        },
        {
          content: '$a = 2, b = 3, c = -5$',
          is_correct: false,
          explaination: 'Nhầm lẫn vị trí của b và c.',
        },
      ],
    },
    {
      content: 'Biệt thức $\\Delta$ của phương trình $ax^2 + bx + c = 0$ được tính bằng công thức:',
      explaination: 'Đây là công thức định nghĩa biệt thức delta.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\Delta = b^2 - 4ac$',
          is_correct: true,
        },
        {
          content: '$\\Delta = b^2 + 4ac$',
          is_correct: false,
          explaination: 'Sai dấu phép toán.',
        },
        {
          content: '$\\Delta = a^2 - 4bc$',
          is_correct: false,
          explaination: 'Sai vị trí các hệ số.',
        },
        {
          content: '$\\Delta = c^2 - 4ab$',
          is_correct: false,
          explaination: 'Sai vị trí các hệ số.',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Phương trình $2x^2 - x - 3 = 0$ có biệt thức $\\Delta$ bằng bao nhiêu?',
      explaination:
        'Xác định $a=2, b=-1, c=-3$. Áp dụng công thức $\\Delta = b^2 - 4ac$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '-23',
          is_correct: false,
          explaination: '$\\Delta = (-1)^2 - 4(2)(-3) = 1 + 24 = 25$.',
        },
        {
          content: '25',
          is_correct: true,
          explaination: '$\\Delta = (-1)^2 - 4(2)(-3) = 1 + 24 = 25$.',
        },
        {
          content: '1',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '-25',
          is_correct: false,
          explaination: 'Sai dấu.',
        },
      ],
    },
    {
      content:
        'Phương trình $9x^2 + 6x + 1 = 0$ có nghiệm là:',
      explaination:
        'Xác định $a=9, b=6, c=1$. Tính $\\Delta = b^2 - 4ac = 6^2 - 4(9)(1) = 36 - 36 = 0$. Vì $\\Delta = 0$, phương trình có nghiệm kép $x = -b / (2a)$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Phương trình vô nghiệm',
          is_correct: false,
          explaination: '$\\Delta = 0$ nên phương trình có nghiệm kép.',
        },
        {
          content: '$x_1 = 3, x_2 = 1/3$',
          is_correct: false,
          explaination: '$\\Delta = 0$ nên phương trình có nghiệm kép.',
        },
        {
          content: '$x_1 = x_2 = -\\frac{1}{3}$',
          is_correct: true,
          explaination: 'Nghiệm kép $x = -b / (2a) = -6 / (2 \\times 9) = -6 / 18 = -1/3$.',
        },
        {
          content: '$x_1 = x_2 = \\frac{1}{3}$',
          is_correct: false,
          explaination: 'Sai dấu. $x = -b / (2a)$.',
        },
      ],
    },
    {
      content:
        'Phương trình $3x^2 - 2x + 9 = 0$ có biệt thức thu gọn $\\Delta\'$ bằng bao nhiêu?',
      explaination:
        'Xác định $a=3, b=-2 \\implies b\' = -1, c=9$. Áp dụng công thức $\\Delta\' = (b\')^2 - ac$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$-104$',
          is_correct: false,
          explaination: 'Đây là $\\Delta = b^2 - 4ac = (-2)^2 - 4(3)(9) = 4 - 108 = -104$.',
        },
        {
          content: '28',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: '-26',
          is_correct: true,
          explaination: '$\\Delta\' = (b\')^2 - ac = (-1)^2 - (3)(9) = 1 - 27 = -26$.',
        },
        {
          content: '10',
          is_correct: false,
          explaination: 'Đây là $\\Delta\'$ của phương trình $3x^2-4x-2=0$.',
        },
      ],
    },
    {
      content:
        'Giải phương trình $x^2 - 5x + 6 = 0$.',
      explaination:
        'Xác định $a=1, b=-5, c=6$. Tính $\\Delta = (-5)^2 - 4(1)(6) = 25 - 24 = 1 > 0$. Phương trình có 2 nghiệm phân biệt.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x_1 = -2, x_2 = -3$',
          is_correct: false,
          explaination: 'Sai dấu nghiệm.',
        },
        {
          content: '$x_1 = 1, x_2 = 6$',
          is_correct: false,
          explaination: 'Sai. $x_1+x_2=7 \\ne -b/a = 5$.',
        },
        {
          content: '$x_1 = 2, x_2 = 3$',
          is_correct: true,
          explaination:
            '$x_1 = \\frac{-(-5) + \\sqrt{1}}{2(1)} = \\frac{5+1}{2} = 3$. $x_2 = \\frac{-(-5) - \\sqrt{1}}{2(1)} = \\frac{5-1}{2} = 2$.',
        },
        {
          content: 'Phương trình vô nghiệm',
          is_correct: false,
          explaination: '$\\Delta = 1 > 0$.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Cho phương trình $ax^2 + bx + c = 0$ ($a \\ne 0$). Điều kiện nào sau đây là đúng? (Chọn nhiều đáp án)',
      explaination:
        'Xét các trường hợp của biệt thức $\\Delta$ để xác định số nghiệm của phương trình.',
      level: DifficultyLevel.hard,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Nếu $\\Delta > 0$ thì phương trình có 2 nghiệm phân biệt.',
          is_correct: true,
          explaination: 'Công thức nghiệm $x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.',
        },
        {
          content: 'Nếu $\\Delta = 0$ thì phương trình có nghiệm kép.',
          is_correct: true,
          explaination: 'Nghiệm kép $x = -b / (2a)$.',
        },
        {
          content: 'Nếu $\\Delta < 0$ thì phương trình vô nghiệm.',
          is_correct: true,
          explaination: 'Không có căn bậc hai thực của số âm.',
        },
        {
          content: 'Nếu $\\Delta \\ge 0$ thì phương trình vô nghiệm.',
          is_correct: false,
          explaination: 'Nếu $\\Delta \\ge 0$, phương trình có nghiệm.',
        },
      ],
    },
    {
      content:
        'Một máng dẫn nước có mặt cắt ngang là hình chữ nhật với diện tích $120 \\text{ cm}^2$. Biết chiều rộng của máng là $x$ cm và chiều dài tấm tôn ban đầu là 32 cm (đáy là $32-2x$). Phương trình nào mô tả đúng bài toán?',
      explaination:
        'Chiều cao mặt cắt là $x$ cm. Chiều rộng mặt cắt là $(32-2x)$ cm. Diện tích là $x(32-2x) = 120$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x^2 - 16x + 60 = 0$',
          is_correct: true,
          explaination:
            '$x(32-2x) = 120 \\implies 32x - 2x^2 = 120 \\implies -2x^2 + 32x - 120 = 0$. Chia 2 vế cho -2 ta được $x^2 - 16x + 60 = 0$.',
        },
        {
          content: '$x^2 + 16x - 60 = 0$',
          is_correct: false,
          explaination: 'Sai dấu.',
        },
        {
          content: '$x(x-32) = 120$',
          is_correct: false,
          explaination: 'Sai biểu thức chiều rộng đáy.',
        },
        {
          content: '$x^2 - 32x + 120 = 0$',
          is_correct: false,
          explaination: 'Sai khi chia cho -2.',
        },
      ],
    },
    {
      content:
        'Một nhà máy sản xuất 5000 sản phẩm năm 2019. Năm 2020 giảm $x\\%$. Năm 2021 giảm $x\\%$ so với 2020. Biết năm 2021 giảm 51% so với 2019. Tìm $x$.',
      explaination:
        'Sản lượng 2019: 5000. Sản lượng 2020: $5000(1 - x/100)$. Sản lượng 2021: $5000(1 - x/100)^2$. Sản lượng 2021 cũng bằng $5000(1 - 51/100) = 5000(0.49)$. Ta giải $(1 - x/100)^2 = 0.49$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'x = 51',
          is_correct: false,
          explaination: 'Đây là tổng % giảm, không phải $x$.',
        },
        {
          content: 'x = 25.5',
          is_correct: false,
          explaination: 'Đây là $51/2$. Giảm giá liên tiếp không phải là phép cộng.',
        },
        {
          content: 'x = 70',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
        {
          content: 'x = 30',
          is_correct: true,
          explaination:
            'Ta có $(1 - x/100)^2 = 0.49$. Lấy căn hai vế: $1 - x/100 = 0.7$ (vì $x>0$ nên $1-x/100 > 0$). $x/100 = 1 - 0.7 = 0.3$. Vậy $x = 30$.',
        },
      ],
    },

    // ========================================================
    // === CHƯƠNG 7 - §3. Định lí Viète ===
    // ========================================================
    // --- Easy ---
    {
      content: 'Cho phương trình $ax^2 + bx + c = 0$ ($a \\ne 0$) có hai nghiệm $x_1, x_2$. Hệ thức Viète nào sau đây là đúng?',
      explaination:
        'Định lí Viète phát biểu mối liên hệ giữa tổng và tích của hai nghiệm với các hệ số của phương trình bậc hai.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x_1 + x_2 = \\frac{b}{a}$; $x_1 x_2 = \\frac{c}{a}$',
          is_correct: false,
          explaination: 'Sai dấu của tổng. $x_1+x_2 = -b/a$.',
        },
        {
          content: '$x_1 + x_2 = -\\frac{b}{a}$; $x_1 x_2 = \\frac{c}{a}$',
          is_correct: true,
          explaination: 'Đây là phát biểu chính xác của Định lí Viète.',
        },
        {
          content: '$x_1 + x_2 = -\\frac{b}{a}$; $x_1 x_2 = -\\frac{c}{a}$',
          is_correct: false,
          explaination: 'Sai dấu của tích. $x_1x_2 = c/a$.',
        },
        {
          content: '$x_1 + x_2 = \\frac{c}{a}$; $x_1 x_2 = -\\frac{b}{a}$',
          is_correct: false,
          explaination: 'Nhầm lẫn giữa công thức tính tổng và tích.',
        },
      ],
    },
    {
      content: 'Cho phương trình $5x^2 - 7x - 3 = 0$. Tính tổng hai nghiệm $x_1 + x_2$.',
      explaination:
        'Xác định các hệ số $a=5, b=-7, c=-3$. Áp dụng công thức $x_1+x_2 = -b/a$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$-\\frac{7}{5}$',
          is_correct: false,
          explaination: 'Đây là $b/a$. Công thức đúng là $-b/a$.',
        },
        {
          content: '$-\\frac{3}{5}$',
          is_correct: false,
          explaination: 'Đây là tích $c/a$.',
        },
        {
          content: '$\\frac{7}{5}$',
          is_correct: true,
          explaination: '$x_1+x_2 = -(-7)/5 = 7/5$.',
        },
        {
          content: '$\\frac{3}{5}$',
          is_correct: false,
          explaination: 'Đây là $-c/a$.',
        },
      ],
    },
    {
      content: 'Phương trình $ax^2 + bx + c = 0$ ($a \\ne 0$) có $a + b + c = 0$ thì một nghiệm là $x_1 = 1$, nghiệm còn lại là:',
      explaination:
        'Theo định lí Viète, $x_1 x_2 = c/a$. Nếu $x_1=1$, ta có $1 \\times x_2 = c/a \\implies x_2 = c/a$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x_2 = \\frac{c}{a}$',
          is_correct: true,
          explaination: 'Đây là hệ quả đúng của trường hợp $a+b+c=0$.',
        },
        {
          content: '$x_2 = -\\frac{c}{a}$',
          is_correct: false,
          explaination: 'Đây là nghiệm $x_2$ cho trường hợp $a-b+c=0$.',
        },
        {
          content: '$x_2 = -1$',
          is_correct: false,
          explaination: 'Nghiệm $x_1 = -1$ là của trường hợp $a-b+c=0$.',
        },
        {
          content: '$x_2 = \\frac{a}{c}$',
          is_correct: false,
          explaination: 'Nhầm lẫn $c/a$ với $a/c$.',
        },
      ],
    },
    // --- Medium ---
    {
      content: 'Nhẩm nghiệm của phương trình $3x^2 - 4x + 1 = 0$.',
      explaination:
        'Kiểm tra các trường hợp đặc biệt: $a+b+c$ và $a-b+c$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x_1 = 1; x_2 = \\frac{1}{3}$',
          is_correct: true,
          explaination: 'Phương trình có $a=3, b=-4, c=1$. Ta thấy $a+b+c = 3 + (-4) + 1 = 0$. Vậy $x_1 = 1$ và $x_2 = c/a = 1/3$.',
        },
        {
          content: '$x_1 = -1; x_2 = -\\frac{1}{3}$',
          is_correct: false,
          explaination: 'Nhầm sang trường hợp $a-b+c=0$.',
        },
        {
          content: '$x_1 = 1; x_2 = 3$',
          is_correct: false,
          explaination: 'Nghiệm $x_2 = c/a$, không phải $a/c$.',
        },
        {
          content: 'Phương trình vô nghiệm',
          is_correct: false,
          explaination: 'Ta thấy $a+b+c=0$ nên phương trình luôn có 2 nghiệm.',
        },
      ],
    },
    {
      content: 'Nhẩm nghiệm của phương trình $2x^2 + 5x + 3 = 0$.',
      explaination:
        'Kiểm tra các trường hợp đặc biệt: $a+b+c$ và $a-b+c$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x_1 = 1; x_2 = \\frac{3}{2}$',
          is_correct: false,
          explaination: 'Nhầm sang trường hợp $a+b+c=0$.',
        },
        {
          content: '$x_1 = -1; x_2 = \\frac{3}{2}$',
          is_correct: false,
          explaination: 'Sai dấu nghiệm $x_2$. $x_2 = -c/a$.',
        },
        {
          content: '$x_1 = -1; x_2 = -\\frac{3}{2}$',
          is_correct: true,
          explaination: 'Phương trình có $a=2, b=5, c=3$. Ta thấy $a-b+c = 2 - 5 + 3 = 0$. Vậy $x_1 = -1$ và $x_2 = -c/a = -3/2$.',
        },
        {
          content: '$x_1 = -1; x_2 = -\\frac{2}{3}$',
          is_correct: false,
          explaination: 'Nghiệm $x_2 = -c/a$, không phải $-a/c$.',
        },
      ],
    },
    {
      content: 'Tìm hai số biết tổng của chúng bằng 7 và tích của chúng bằng 12.',
      explaination:
        'Hai số cần tìm là nghiệm của phương trình $x^2 - Sx + P = 0$, với $S=7$ và $P=12$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '3 và 4',
          is_correct: true,
          explaination: 'Ta giải $x^2 - 7x + 12 = 0$. Nhẩm $a+b+c$ không được. $\\Delta = (-7)^2 - 4(1)(12) = 49 - 48 = 1$. Nghiệm là $x_1 = (7+1)/2 = 4$ và $x_2 = (7-1)/2 = 3$.',
        },
        {
          content: '-3 và -4',
          is_correct: false,
          explaination: 'Hai số này có tổng $S = -7$, không phải 7.',
        },
        {
          content: '2 và 5',
          is_correct: false,
          explaination: 'Tổng là 7, nhưng tích là 10, không phải 12.',
        },
        {
          content: '1 và 6',
          is_correct: false,
          explaination: 'Tổng là 7, nhưng tích là 6, không phải 12.',
        },
      ],
    },
    // --- Hard ---
    {
      content: 'Một nhà kính trồng hoa hình chữ nhật có độ dài hàng rào bao quanh là 68 m và diện tích trồng hoa là $240 m^2$. Chiều dài và chiều rộng của nhà kính là nghiệm của phương trình nào?',
      explaination:
        'Gọi chiều dài là $L$, chiều rộng là $W$. Chu vi $2(L+W) = 68 \\implies$ Tổng $S = L+W = 34$. Diện tích (Tích) $P = L \\times W = 240$. Hai số $L, W$ là nghiệm của phương trình $x^2 - Sx + P = 0$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x^2 - 68x + 240 = 0$',
          is_correct: false,
          explaination: 'Nhầm lẫn $S$ là chu vi. $S$ là nửa chu vi (tổng hai số).',
        },
        {
          content: '$x^2 - 34x + 240 = 0$',
          is_correct: true,
          explaination: 'Tổng $S = 68/2 = 34$. Tích $P = 240$. Phương trình là $x^2 - 34x + 240 = 0$.',
        },
        {
          content: '$x^2 + 34x - 240 = 0$',
          is_correct: false,
          explaination: 'Sai dấu của cả $S$ và $P$.',
        },
        {
          content: '$x^2 - 34x - 240 = 0$',
          is_correct: false,
          explaination: 'Sai dấu của $P$.',
        },
      ],
    },
    {
      content: 'Cho phương trình $2x^2 - 3x - 6 = 0$. Không giải phương trình, hãy tính giá trị của biểu thức $A = \\frac{1}{x_1} + \\frac{1}{x_2}$.',
      explaination:
        'Sử dụng Viète: $S = x_1+x_2 = -b/a = -(-3)/2 = 3/2$. $P = x_1x_2 = c/a = -6/2 = -3$. Quy đồng biểu thức $A = \\frac{x_1+x_2}{x_1x_2} = S/P$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\frac{1}{2}$',
          is_correct: false,
          explaination: 'Đây là $S/(-P)$. $A = (3/2) / (-3) = -1/2$.',
        },
        {
          content: '$2$',
          is_correct: false,
          explaination: 'Đây là $P/S$.',
        },
        {
          content: '$-\\frac{1}{2}$',
          is_correct: true,
          explaination: '$A = S/P = (3/2) / (-3) = 3 / (2 \\times -3) = 3 / (-6) = -1/2$.',
        },
        {
          content: '$-2$',
          is_correct: false,
          explaination: 'Đây là $P/S$ đảo ngược dấu.',
        },
      ],
    },
    {
      content: 'Cho phương trình $x^2 - 4x + 1 = 0$ có hai nghiệm $x_1, x_2$. Các khẳng định nào sau đây là đúng? (Chọn nhiều đáp án)',
      explaination:
        'Kiểm tra $\\Delta\' = (-2)^2 - 1(1) = 3 > 0$, phương trình có 2 nghiệm. Tính $S = x_1+x_2 = 4$ và $P = x_1x_2 = 1$. Tính các biểu thức liên quan như $x_1^2 + x_2^2 = (x_1+x_2)^2 - 2x_1x_2 = S^2 - 2P$.',
      level: DifficultyLevel.hard,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat7_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Tổng hai nghiệm $S = 4$.',
          is_correct: true,
          explaination: '$S = -b/a = -(-4)/1 = 4$.',
        },
        {
          content: 'Tích hai nghiệm $P = 1$.',
          is_correct: true,
          explaination: '$P = c/a = 1/1 = 1$.',
        },
        {
          content: '$x_1^2 + x_2^2 = 14$.',
          is_correct: true,
          explaination: '$x_1^2 + x_2^2 = S^2 - 2P = (4)^2 - 2(1) = 16 - 2 = 14$.',
        },
        {
          content: '$x_1^2 + x_2^2 = 18$.',
          is_correct: false,
          explaination: 'Sai. Đây là kết quả của $S^2 + 2P$.',
        },
      ],
    },

   // ===================================================================================
    // === CHƯƠNG 8 - §1. Đường tròn ngoại tiếp tam giác. Đường tròn nội tiếp tam giác ===
    // ===================================================================================
    // --- Easy ---
    {
      content: 'Đường tròn đi qua ba đỉnh của tam giác được gọi là gì?',
      explaination:
        'Hãy nhớ lại định nghĩa về đường tròn liên quan đến ba đỉnh của tam giác.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đường tròn ngoại tiếp tam giác.',
          is_correct: true,
          explaination: 'Theo định nghĩa, đường tròn đi qua ba đỉnh của tam giác là đường tròn ngoại tiếp tam giác đó.',
        },
        {
          content: 'Đường tròn nội tiếp tam giác.',
          is_correct: false,
          explaination: 'Đường tròn nội tiếp là đường tròn tiếp xúc với ba cạnh của tam giác, không phải đi qua ba đỉnh.',
        },
        {
          content: 'Đường tròn bàng tiếp tam giác.',
          is_correct: false,
          explaination: 'Đường tròn bàng tiếp chỉ tiếp xúc với một cạnh và phần kéo dài của hai cạnh kia.',
        },
        {
          content: 'Đường tròn cơ sở của tam giác.',
          is_correct: false,
          explaination: 'Đây không phải là một thuật ngữ chuẩn trong hình học phẳng liên quan đến tam giác.',
        },
      ],
    },
    {
      content: 'Đường tròn tiếp xúc với ba cạnh của tam giác được gọi là gì?',
      explaination:
        'Hãy nhớ lại định nghĩa về đường tròn liên quan đến ba cạnh của tam giác.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đường tròn ngoại tiếp tam giác.',
          is_correct: false,
          explaination: 'Đường tròn ngoại tiếp là đường tròn đi qua ba đỉnh của tam giác.',
        },
        {
          content: 'Đường tròn nội tiếp tam giác.',
          is_correct: true,
          explaination: 'Theo định nghĩa, đường tròn tiếp xúc với ba cạnh của tam giác là đường tròn nội tiếp tam giác đó.',
        },
        {
          content: 'Đường tròn bàng tiếp tam giác.',
          is_correct: false,
          explaination: 'Đường tròn bàng tiếp cũng tiếp xúc với ba đường thẳng chứa ba cạnh, nhưng chỉ tiếp xúc trong với một cạnh.',
        },
        {
          content: 'Đường tròn tâm O.',
          is_correct: false,
          explaination: 'Đây là cách gọi tên một đường tròn bất kỳ, không mô tả mối quan hệ của nó với tam giác.',
        },
      ],
    },
    {
      content: 'Tâm của đường tròn ngoại tiếp tam giác là giao điểm của ba đường nào?',
      explaination:
        'Tâm đường tròn ngoại tiếp phải cách đều ba đỉnh $A, B, C$ của tam giác. Điểm cách đều $A$ và $B$ nằm trên đường trung trực của $AB$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Ba đường phân giác.',
          is_correct: false,
          explaination: 'Giao điểm ba đường phân giác là tâm của đường tròn nội tiếp, vì nó cách đều ba cạnh.',
        },
        {
          content: 'Ba đường trung tuyến.',
          is_correct: false,
          explaination: 'Giao điểm ba đường trung tuyến là trọng tâm của tam giác.',
        },
        {
          content: 'Ba đường cao.',
          is_correct: false,
          explaination: 'Giao điểm ba đường cao là trực tâm của tam giác.',
        },
        {
          content: 'Ba đường trung trực.',
          is_correct: true,
          explaination: 'Tâm đường tròn ngoại tiếp cách đều ba đỉnh. Mọi điểm trên đường trung trực của $AB$ thì cách đều $A$ và $B$. Tương tự cho $BC$ và $AC$. Do đó, giao điểm của ba đường trung trực cách đều cả ba đỉnh $A, B, C$.',
        },
      ],
    },
    // --- Medium ---
    {
      content: 'Tâm của đường tròn nội tiếp tam giác là giao điểm của ba đường nào?',
      explaination:
        'Tâm đường tròn nội tiếp phải cách đều ba cạnh $AB, BC, CA$ của tam giác. Điểm cách đều hai cạnh $AB$ và $AC$ nằm trên đường phân giác của góc $A$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Ba đường phân giác.',
          is_correct: true,
          explaination: 'Tâm đường tròn nội tiếp cách đều ba cạnh. Mọi điểm trên đường phân giác của góc $A$ thì cách đều hai cạnh $AB$ và $AC$. Do đó, giao điểm của ba đường phân giác cách đều cả ba cạnh $AB, BC, CA$.',
        },
        {
          content: 'Ba đường trung tuyến.',
          is_correct: false,
          explaination: 'Giao điểm ba đường trung tuyến là trọng tâm của tam giác.',
        },
        {
          content: 'Ba đường cao.',
          is_correct: false,
          explaination: 'Giao điểm ba đường cao là trực tâm của tam giác.',
        },
        {
          content: 'Ba đường trung trực.',
          is_correct: false,
          explaination: 'Giao điểm ba đường trung trực là tâm của đường tròn ngoại tiếp, vì nó cách đều ba đỉnh.',
        },
      ],
    },
    {
      content: 'Cho tam giác ABC vuông tại A. Tâm đường tròn ngoại tiếp của tam giác ABC nằm ở đâu?',
      explaination:
        'Trong tam giác vuông, đường trung tuyến ứng với cạnh huyền bằng một nửa cạnh huyền. Gọi M là trung điểm $BC$, ta có $MA = MB = MC$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đỉnh A.',
          is_correct: false,
          explaination: 'Đỉnh A là một trong ba đỉnh tam giác, nó không thể cách đều cả ba đỉnh (khoảng cách từ A đến A là 0).',
        },
        {
          content: 'Trung điểm cạnh huyền BC.',
          is_correct: true,
          explaination: 'Gọi $O$ là trung điểm cạnh huyền $BC$. Ta có $OA = OB = OC = \\frac{1}{2}BC$ (tính chất đường trung tuyến ứng với cạnh huyền). Vì $O$ cách đều $A, B, C$ nên $O$ là tâm đường tròn ngoại tiếp.',
        },
        {
          content: 'Trung điểm cạnh góc vuông AB.',
          is_correct: false,
          explaination: 'Trung điểm của $AB$ chỉ cách đều $A$ và $B$, không cách đều $C$ (trừ trường hợp đặc biệt không thể xảy ra).',
        },
        {
          content: 'Trọng tâm tam giác.',
          is_correct: false,
          explaination: 'Trọng tâm chỉ trùng với tâm đường tròn ngoại tiếp trong trường hợp tam giác đều, mà tam giác này vuông.',
        },
      ],
    },
    {
      content: 'Đối với một tam giác đều, khẳng định nào sau đây là đúng? (Chọn nhiều đáp án)',
      explaination:
        'Trong tam giác đều, các đường đặc biệt (trung tuyến, trung trực, phân giác, đường cao) ứng với cùng một đỉnh đều trùng nhau.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Tâm đường tròn ngoại tiếp và tâm đường tròn nội tiếp trùng nhau.',
          is_correct: true,
          explaination: 'Do các đường trung trực và đường phân giác trùng nhau, nên giao điểm của chúng (tâm ngoại tiếp và tâm nội tiếp) cũng trùng nhau.',
        },
        {
          content: 'Trọng tâm, trực tâm, tâm đường tròn ngoại tiếp, tâm đường tròn nội tiếp là bốn điểm phân biệt.',
          is_correct: false,
          explaination: 'Ngược lại, trong tam giác đều, bốn điểm này trùng làm một.',
        },
        {
          content: 'Trọng tâm của tam giác là tâm đường tròn ngoại tiếp.',
          is_correct: true,
          explaination: 'Trong tam giác đều, đường trung tuyến cũng là đường trung trực, nên trọng tâm (giao 3 trung tuyến) cũng là tâm đường tròn ngoại tiếp (giao 3 trung trực).',
        },
        {
          content: 'Tâm đường tròn ngoại tiếp luôn nằm ngoài tam giác.',
          is_correct: false,
          explaination: 'Tam giác đều là tam giác nhọn, nên tâm đường tròn ngoại tiếp nằm bên trong tam giác.',
        },
      ],
    },
    // --- Hard ---
    {
      content: 'Tính bán kính $R$ của đường tròn ngoại tiếp tam giác ABC vuông tại A, biết $AB = 5$ cm, $AC = 12$ cm.',
      explaination:
        'Bán kính $R$ của đường tròn ngoại tiếp tam giác vuông bằng một nửa cạnh huyền. Cần dùng định lí Pythagore để tính cạnh huyền $BC$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '13 cm',
          is_correct: false,
          explaination: '13 cm là độ dài cạnh huyền $BC$. Bán kính $R$ bằng một nửa cạnh huyền.',
        },
        {
          content: '6 cm',
          is_correct: false,
          explaination: 'Đây là một nửa của $AC$, không phải $BC$.',
        },
        {
          content: '6.5 cm',
          is_correct: true,
          explaination: 'Áp dụng Pythagore: $BC^2 = AB^2 + AC^2 = 5^2 + 12^2 = 25 + 144 = 169$. Suy ra $BC = \\sqrt{169} = 13$ cm. Bán kính $R = BC / 2 = 13 / 2 = 6.5$ cm.',
       },
        {
          content: '8.5 cm',
          is_correct: false,
          explaination: 'Đây là $(5+12)/2$, là một phép tính không chính xác.',
        },
      ],
    },
    {
      content: 'Một tam giác đều có cạnh là $a = 6$ cm. Bán kính $R$ của đường tròn ngoại tiếp tam giác đó là:',
      explaination:
        'Bán kính đường tròn ngoại tiếp $R$ của tam giác đều cạnh $a$ được tính bằng công thức $R = \\frac{a\\sqrt{3}}{3}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$3\\sqrt{3}$ cm',
          is_correct: false,
          explaination: 'Đây là độ dài đường cao $h = \\frac{a\\sqrt{3}}{2} = \\frac{6\\sqrt{3}}{2} = 3\\sqrt{3}$. $R$ bằng $2/3$ đường cao.',
        },
        {
          content: '$2\\sqrt{3}$ cm',
          is_correct: true,
          explaination: 'Áp dụng công thức $R = \\frac{a\\sqrt{3}}{3} = \\frac{6\\sqrt{3}}{3} = 2\\sqrt{3}$ cm. (Cách khác: Đường cao $h = 3\\sqrt{3}$. Tâm O là trọng tâm, $R = OA = \\frac{2}{3}h = \\frac{2}{3}(3\\sqrt{3}) = 2\\sqrt{3}$).',
        },
        {
          content: '$\\sqrt{3}$ cm',
          is_correct: false,
          explaination: 'Đây là bán kính $r$ của đường tròn nội tiếp ($r = \\frac{a\\sqrt{3}}{6}$).',
        },
        {
          content: '3 cm',
          is_correct: false,
          explaination: 'Đây là một nửa cạnh $a/2$.',
        },
      ],
    },
    {
      content: 'Một tam giác đều có cạnh là $a = 12$ cm. Bán kính $r$ của đường tròn nội tiếp tam giác đó là:',
      explaination:
        'Bán kính đường tròn nội tiếp $r$ của tam giác đều cạnh $a$ được tính bằng công thức $r = \\frac{a\\sqrt{3}}{6}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$6\\sqrt{3}$ cm',
          is_correct: false,
          explaination: 'Đây là độ dài đường cao $h = \\frac{a\\sqrt{3}}{2} = \\frac{12\\sqrt{3}}{2} = 6\\sqrt{3}$. $r$ bằng $1/3$ đường cao.',
        },
        {
          content: '$4\\sqrt{3}$ cm',
          is_correct: false,
          explaination: 'Đây là bán kính $R$ của đường tròn ngoại tiếp ($R = \\frac{a\\sqrt{3}}{3}$).',
        },
        {
          content: '$2\\sqrt{3}$ cm',
          is_correct: true,
          explaination: 'Áp dụng công thức $r = \\frac{a\\sqrt{3}}{6} = \\frac{12\\sqrt{3}}{6} = 2\\sqrt{3}$ cm. (Cách khác: Đường cao $h = 6\\sqrt{3}$. Tâm O là trọng tâm, $r = OM = \\frac{1}{3}h = \\frac{1}{3}(6\\sqrt{3}) = 2\\sqrt{3}$).',
        },
        {
          content: '6 cm',
          is_correct: false,
          explaination: 'Đây là một nửa cạnh $a/2$.',
        },
      ],
    },

    // ========================================================
    // === CHƯƠNG 8 - §2. Tứ giác nội tiếp đường tròn ===
    // ========================================================
    // --- Easy ---
    {
  
      content: 'Một tứ giác được gọi là nội tiếp đường tròn nếu:',
      explaination:
        'Theo định nghĩa, tứ giác nội tiếp đường tròn là tứ giác có bốn đỉnh thuộc một đường tròn.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Bốn đỉnh của nó thuộc một đường tròn.',
          is_correct: true,
          explaination: 'Đây là định nghĩa chính xác của tứ giác nội tiếp.',
        },
        {
          content: 'Bốn cạnh của nó tiếp xúc với một đường tròn.',
          is_correct: false,
          explaination:
            'Đây là định nghĩa của tứ giác ngoại tiếp đường tròn (các cạnh là tiếp tuyến).',
        },
        {
          content: 'Có hai cạnh song song.',
          is_correct: false,
          explaination: 'Đây là định nghĩa của hình thang.',
        },
        {
          content: 'Có hai đường chéo bằng nhau.',
          is_correct: false,
          explaination:
            'Đây là tính chất của hình thang cân hoặc hình chữ nhật, không phải mọi tứ giác nội tiếp.',
        },
      ],
    },
    {
      content:
        'Tứ giác ABCD nội tiếp đường tròn. Biết $\\widehat{A} = 60^{\\circ}$. Tính số đo $\\widehat{C}$.',
      explaination:
        'Trong một tứ giác nội tiếp, tổng số đo hai góc đối bằng $180^{\\circ}$. Góc A và góc C là hai góc đối nhau.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$60^{\\circ}$',
          is_correct: false,
          explaination:
            'Sai. Hai góc đối của tứ giác nội tiếp bù nhau, không nhất thiết bằng nhau.',
        },
        {
          content: '$90^{\\circ}$',
          is_correct: false,
          explaination: 'Sai. Tổng hai góc đối là $180^{\\circ}$.',
        },
        {
          content: '$120^{\\circ}$',
          is_correct: true,
          explaination:
            'Vì ABCD nội tiếp nên $\\widehat{A} + \\widehat{C} = 180^{\\circ}$. Suy ra $\\widehat{C} = 180^{\\circ} - \\widehat{A} = 180^{\\circ} - 60^{\\circ} = 120^{\\circ}$.',
        },
        {
          content: '$30^{\\circ}$',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },
    {
      content:
        'Hình nào sau đây LUÔN LUÔN nội tiếp được một đường tròn?',
      explaination:
        'Một tứ giác nội tiếp nếu tổng hai góc đối bằng $180^{\\circ}$. Ta cần kiểm tra xem hình nào luôn thỏa mãn điều kiện này.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Hình bình hành',
          is_correct: false,
          explaination:
            'Hình bình hành có các góc đối bằng nhau. Để nội tiếp, góc đối phải bù nhau, vậy chúng phải bằng $90^{\\circ}$ (tức là hình chữ nhật). Một hình bình hành bất kỳ thì không.',
        },
        {
          content: 'Hình chữ nhật',
          is_correct: true,
          explaination:
            'Mọi hình chữ nhật đều có 4 góc bằng $90^{\\circ}$. Tổng hai góc đối luôn là $90^{\\circ} + 90^{\\circ} = 180^{\\circ}$, nên nó luôn nội tiếp được.',
        },
        {
          content: 'Hình thoi',
          is_correct: false,
          explaination:
            'Tương tự hình bình hành, hình thoi chỉ nội tiếp khi nó là hình vuông (các góc bằng $90^{\\circ}$).',
        },
        {
          content: 'Hình thang bất kỳ',
          is_correct: false,
          explaination:
            'Chỉ hình thang cân mới luôn nội tiếp được đường tròn. Hình thang vuông hoặc thang thường thì không.',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Cho tứ giác ABCD nội tiếp đường tròn (O). Biết $\\widehat{B} = 95^{\\circ}$ và $\\widehat{C} = 67^{\\circ}$. Tính $\\widehat{D}$ và $\\widehat{A}$.',
      explaination:
        'Áp dụng tính chất tứ giác nội tiếp: $\\widehat{A} + \\widehat{C} = 180^{\\circ}$ và $\\widehat{B} + \\widehat{D} = 180^{\\circ}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\widehat{A} = 85^{\\circ}, \\widehat{D} = 113^{\\circ}$',
          is_correct: false,
          explaination:
            'Sai. Bạn đã tính $\\widehat{D} = 180^{\\circ} - \\widehat{A}$ và $\\widehat{C} = 180^{\\circ} - \\widehat{B}$. Phải là góc đối diện.',
        },
        {
          content: '$\\widehat{A} = 113^{\\circ}, \\widehat{D} = 85^{\\circ}$',
          is_correct: true,
          explaination:
            'Góc A đối diện góc C: $\\widehat{A} = 180^{\\circ} - \\widehat{C} = 180^{\\circ} - 67^{\\circ} = 113^{\\circ}$. Góc D đối diện góc B: $\\widehat{D} = 180^{\\circ} - \\widehat{B} = 180^{\\circ} - 95^{\\circ} = 85^{\\circ}$.',
        },
        {
          content: '$\\widehat{A} = 95^{\\circ}, \\widehat{D} = 67^{\\circ}$',
          is_correct: false,
          explaination:
            'Hai góc kề không bù nhau. Góc đối mới bù nhau.',
        },
        {
          content: '$\\widehat{A} = 110^{\\circ}, \\widehat{D} = 80^{\\circ}$',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },
    {
      content:
        'Hình chữ nhật ABCD có $AB = 8$ cm và $BC = 6$ cm. Tính bán kính $R$ của đường tròn ngoại tiếp hình chữ nhật này.',
      explaination:
        'Tâm đường tròn ngoại tiếp hình chữ nhật là giao điểm 2 đường chéo. Bán kính R bằng một nửa độ dài đường chéo. Áp dụng định lí Pythagore cho tam giác ABC vuông tại B.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '10 cm',
          is_correct: false,
          explaination:
            'Đây là độ dài đường chéo AC. Bán kính R chỉ bằng một nửa đường chéo.',
        },
        {
          content: '5 cm',
          is_correct: true,
          explaination:
            'Đường chéo $AC = \\sqrt{AB^2 + BC^2} = \\sqrt{8^2 + 6^2} = \\sqrt{64 + 36} = \\sqrt{100} = 10$ cm. Bán kính $R = AC / 2 = 10 / 2 = 5$ cm.',
        },
        {
          content: '7 cm',
          is_correct: false,
          explaination: 'Bạn đã tính $(8+6)/2$, đây là nửa chu vi, không phải bán kính.',
        },
        {
          content: '14 cm',
          is_correct: false,
          explaination: 'Đây là nửa chu vi $8+6$.',
        },
      ],
    },
    {
      content:
        'Hình thang ABCD (AB // CD) nội tiếp đường tròn. Khẳng định nào sau đây là đúng?',
      explaination:
        'Trong một đường tròn, hai dây song song (AB và CD) sẽ chắn hai cung bằng nhau (cung AD và cung BC). Hai cung bằng nhau căng hai dây bằng nhau (AD=BC). Hình thang có hai cạnh bên bằng nhau là hình thang cân.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'ABCD là hình thang vuông.',
          is_correct: false,
          explaination:
            'Một hình thang vuông (không phải hình chữ nhật) có tổng hai góc đối không bằng $180^{\\circ}$ (ví dụ $90^{\\circ}$ và $\\widehat{C} \ne 90^{\\circ}$) nên không thể nội tiếp.',
        },
        {
          content: 'ABCD là hình bình hành.',
          is_correct: false,
          explaination: 'Hình thang chỉ là hình bình hành nếu hai đáy bằng nhau.',
        },
        {
          content: 'ABCD là hình thang cân.',
          is_correct: true,
          explaination:
            'Một hình thang nội tiếp đường tròn thì phải là hình thang cân. Đây là một định lí.',
        },
        {
          content: '$AB = CD$',
          is_correct: false,
          explaination:
            'Hai đáy không nhất thiết bằng nhau. $AD = BC$ (hai cạnh bên) mới là khẳng định đúng.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Cho hình vuông ABCD cạnh $a$. Bán kính $R$ của đường tròn ngoại tiếp hình vuông đó bằng:',
      explaination:
        'Tâm đường tròn ngoại tiếp là giao điểm O của 2 đường chéo. Bán kính R bằng một nửa độ dài đường chéo. Đường chéo $AC$ của hình vuông cạnh $a$ là $a\\sqrt{2}$ (theo định lí Pythagore).',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$R = a$',
          is_correct: false,
          explaination: 'Sai. Đây là độ dài cạnh.',
        },
        {
          content: '$R = a\\sqrt{2}$',
          is_correct: false,
          explaination: 'Đây là độ dài đường chéo $AC$. Bán kính $R = AC/2$.',
        },
        {
          content: '$R = \\frac{a\\sqrt{2}}{2}$',
          is_correct: true,
          explaination:
            'Đường chéo $d = a\\sqrt{2}$. Bán kính $R = d/2 = \\frac{a\\sqrt{2}}{2}$.',
        },
        {
          content: '$R = \\frac{a}{2}$',
          is_correct: false,
          explaination:
            'Đây là bán kính $r$ của đường tròn nội tiếp hình vuông, không phải ngoại tiếp.',
        },
      ],
    },
    {
      content:
        'Cho tam giác đều ABC nội tiếp đường tròn (O) và điểm M thuộc cung nhỏ BC. Tính số đo $\\widehat{BMC}$.',
      explaination:
        'Tứ giác ABMC nội tiếp đường tròn (O). Theo tính chất tứ giác nội tiếp, tổng hai góc đối bằng $180^{\\circ}$. Do đó, $\\widehat{BMC} + \\widehat{BAC} = 180^{\\circ}$. Vì tam giác ABC đều nên $\\widehat{BAC} = 60^{\\circ}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$60^{\\circ}$',
          is_correct: false,
          explaination:
            'Sai. $60^{\\circ}$ là số đo của $\\widehat{BAC}$ (góc đối của $\\widehat{BMC}$). $60^{\\circ}$ cũng là số đo của $\\widehat{BNC}$ nếu N nằm trên cung lớn BC.',
        },
        {
          content: '$120^{\\circ}$',
          is_correct: true,
          explaination:
            'Tứ giác ABMC nội tiếp. $\\widehat{BMC} + \\widehat{BAC} = 180^{\\circ}$. $\\widehat{BAC} = 60^{\\circ}$ (do tam giác ABC đều). Suy ra $\\widehat{BMC} = 180^{\\circ} - 60^{\\circ} = 120^{\\circ}$.',
        },
        {
          content: '$90^{\\circ}$',
          is_correct: false,
          explaination: 'Chỉ đúng nếu BC là đường kính, nhưng tam giác ABC đều.',
        },
        {
          content: '$100^{\\circ}$',
          is_correct: false,
          explaination: 'Tính toán sai.',
        },
      ],
    },
    {
      content:
        'Cho tứ giác ABCD nội tiếp đường tròn. Hai tia CD và BA cắt nhau tại I. Khẳng định nào sau đây là đúng? (Chọn nhiều đáp án)',
      explaination:
        'Xét $\\triangle IAD$ và $\\triangle ICB$. Ta có $\\widehat{I}$ là góc chung. Vì ABCD nội tiếp nên $\\widehat{BCD} + \\widehat{BAD} = 180^{\\circ}$. Mà $\\widehat{BAD} + \\widehat{IAD} = 180^{\\circ}$ (kề bù). Suy ra $\\widehat{BCD} = \\widehat{IAD}$. Do đó $\\triangle IAD \\sim \\triangle ICB$ (g-g).',
      level: DifficultyLevel.hard,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\widehat{IAD} = \\widehat{BCD}$',
          is_correct: true,
          explaination:
            'Tính chất: Góc ngoài tại một đỉnh của tứ giác nội tiếp bằng góc trong tại đỉnh đối diện.',
        },
        {
          content: '$\\triangle IAD \\sim \\triangle ICB$',
          is_correct: true,
          explaination:
            'Hai tam giác đồng dạng theo trường hợp góc-góc ($\\widehat{I}$ chung và $\\widehat{IAD} = \\widehat{ICB}$ ).',
        },
        {
          content: '$IA \\cdot IB = ID \\cdot IC$',
          is_correct: true,
          explaination:
            'Đây là hệ quả từ $\\triangle IAD \\sim \\triangle ICB$. Ta có tỉ lệ $\\frac{IA}{IC} = \\frac{ID}{IB} \\implies IA \\cdot IB = IC \\cdot ID$ (Phương tích của điểm I).',
        },
        {
          content: '$\\widehat{IAD} = \\widehat{ABC}$',
          is_correct: false,
          explaination:
            'Sai. $\\widehat{IAD}$ (góc ngoài đỉnh A) bằng $\\widehat{BCD}$ (góc trong đỉnh C).',
        },
      ],
    },
    {
      content:
        'Một khung thép sân khấu có dạng đường tròn bán kính 15 m. Một người thợ đứng tại A nhìn hai đèn B, C trên đường tròn (A, B, C thuộc đường tròn) và thấy $\\widehat{BAC} = 30^{\\circ}$. Tính khoảng cách BC.',
      explaination:
        'Xét đường tròn (O; R) với $R=15$ m. $\\widehat{BAC}$ là góc nội tiếp chắn cung BC. $\\text{sđ } \\overparen{BC} = 2 \\times \\widehat{BAC} = 2 \\times 30^{\\circ} = 60^{\\circ}$. Dây $BC$ căng cung $60^{\\circ}$. Góc ở tâm $\\widehat{BOC} = \\text{sđ } \\overparen{BC} = 60^{\\circ}$. Tam giác BOC có $OB=OC=R$ và $\\widehat{BOC} = 60^{\\circ}$ nên là tam giác đều.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat8_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '30 m',
          is_correct: false,
          explaination:
            'Đây là đường kính. $BC$ chỉ bằng đường kính nếu $\\widehat{BAC} = 90^{\\circ}$.',
        },
        {
          content: '15 m',
          is_correct: true,
          explaination:
            'Góc nội tiếp $\\widehat{BAC} = 30^{\\circ}$ $\\implies$ số đo cung $\\overparen{BC} = 60^{\\circ}$. Góc ở tâm $\\widehat{BOC} = 60^{\\circ}$. Tam giác BOC có $OB=OC=R=15$ m và $\\widehat{BOC}=60^{\\circ}$ nên là tam giác đều. Vậy $BC = R = 15$ m.',
        },
        {
          content: '$15\\sqrt{3}$ m',
          is_correct: false,
          explaination:
            'Kết quả này đúng nếu góc ở tâm $\\widehat{BOC} = 120^{\\circ}$ (tức là $\\widehat{BAC} = 60^{\\circ}$).',
        },
        {
          content: '$15\\sqrt{2}$ m',
          is_correct: false,
          explaination:
            'Kết quả này đúng nếu góc ở tâm $\\widehat{BOC} = 90^{\\circ}$ (tức là $\\widehat{BAC} = 45^{\\circ}$).',
        },
      ],
    },
    
    // =================================================================================
    // === CHƯƠNG 9 - §1. Đa giác đều. Hình đa giác đều trong thực tiễn ===
    // =================================================================================
    // --- Easy ---
    {
      content: 'Đa giác đều là đa giác có đặc điểm nào sau đây?',
      explaination:
        'Một đa giác đều phải thỏa mãn đồng thời hai điều kiện về cạnh và góc.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Tất cả các cạnh bằng nhau.',
          is_correct: false,
          explaination: 'Chưa đủ. Một hình thoi có các cạnh bằng nhau nhưng chưa chắc là đa giác đều (trừ khi nó là hình vuông).',
        },
        {
          content: 'Tất cả các góc bằng nhau.',
          is_correct: false,
          explaination: 'Chưa đủ. Một hình chữ nhật có các góc bằng nhau nhưng chưa chắc là đa giác đều (trừ khi nó là hình vuông).',
        },
        {
          content: 'Tất cả các cạnh bằng nhau và tất cả các góc bằng nhau.',
          is_correct: true,
          explaination: 'Đây là định nghĩa chính xác. Ví dụ: hình vuông vừa có 4 cạnh bằng nhau, vừa có 4 góc bằng $90^\\circ$.',
        },
        {
          content: 'Là một đa giác lồi.',
          is_correct: false,
          explaination: 'Đa giác đều là đa giác lồi, nhưng một đa giác lồi bất kỳ (ví dụ hình chữ nhật) chưa chắc là đa giác đều.',
        },
      ],
    },
    {
      content: 'Hình nào sau đây KHÔNG phải là đa giác đều?',
      explaination:
        'Xét xem hình nào vi phạm định nghĩa "tất cả các cạnh bằng nhau VÀ tất cả các góc bằng nhau".',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Tam giác đều.',
          is_correct: false,
          explaination: 'Tam giác đều có 3 cạnh bằng nhau và 3 góc bằng $60^\\circ$, nên là đa giác đều.',
        },
        {
          content: 'Hình vuông.',
          is_correct: false,
          explaination: 'Hình vuông có 4 cạnh bằng nhau và 4 góc bằng $90^\\circ$, nên là đa giác đều.',
        },
        {
          content: 'Hình chữ nhật (không phải hình vuông).',
          is_correct: true,
          explaination: 'Hình chữ nhật có các góc bằng nhau (đều bằng $90^\\circ$) nhưng các cạnh không nhất thiết bằng nhau (chiều dài $\\ne$ chiều rộng).',
        },
        {
          content: 'Lục giác đều.',
          is_correct: false,
          explaination: 'Lục giác đều có 6 cạnh bằng nhau và 6 góc bằng $120^\\circ$, nên là đa giác đều.',
        },
      ],
    },
    {
      content: 'Thế nào là một đa giác lồi?',
      explaination:
        'Định nghĩa đa giác lồi dựa trên vị trí của đa giác so với đường thẳng chứa một cạnh bất kỳ của nó.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đa giác có tất cả các cạnh bằng nhau.',
          is_correct: false,
          explaination: 'Đây là định nghĩa đa giác đều cạnh, ví dụ như hình thoi.',
        },
        {
          content: 'Đa giác luôn nằm về một phía của đường thẳng chứa một cạnh bất kì của đa giác đó.',
          is_correct: true,
          explaination: 'Đây là định nghĩa chính xác của đa giác lồi. Đa giác không lồi (đa giác lõm) sẽ bị đường thẳng chứa cạnh "cắt" thành nhiều phần.',
        },
        {
          content: 'Đa giác có ít nhất một góc trong lớn hơn $180^\\circ$.',
          is_correct: false,
          explaination: 'Đây là đặc điểm của đa giác không lồi (đa giác lõm).',
        },
        {
          content: 'Đa giác có các đỉnh nằm trên một đường tròn.',
          is_correct: false,
          explaination: 'Đây là định nghĩa của đa giác nội tiếp, không phải đa giác lồi (mặc dù đa giác nội tiếp luôn là đa giác lồi).',
        },
      ],
    },
    // --- Medium ---
    {
      content: 'Số đo mỗi góc của một ngũ giác đều (5 cạnh) bằng bao nhiêu?',
      explaination:
        'Tổng số đo các góc của đa giác n cạnh là $(n-2) \\times 180^\\circ$. Đối với ngũ giác ($n=5$), tổng là $(5-2) \\times 180^\\circ = 540^\\circ$. Chia đều cho 5 góc.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$60^\\circ$',
          is_correct: false,
          explaination: 'Đây là số đo góc của tam giác đều ($n=3$).',
        },
        {
          content: '$90^\\circ$',
          is_correct: false,
          explaination: 'Đây là số đo góc của hình vuông ($n=4$).',
        },
        {
          content: '$108^\\circ$',
          is_correct: true,
          explaination: 'Tổng các góc là $(5-2) \\times 180^\\circ = 540^\\circ$. Số đo mỗi góc là $540^\\circ / 5 = 108^\\circ$.',
        },
        {
          content: '$120^\\circ$',
          is_correct: false,
          explaination: 'Đây là số đo góc của lục giác đều ($n=6$).',
        },
      ],
    },
    {
      content: 'Số đo mỗi góc của một lục giác đều (6 cạnh) bằng bao nhiêu?',
      explaination:
        'Tổng số đo các góc của đa giác n cạnh là $(n-2) \\times 180^\\circ$. Đối với lục giác ($n=6$), tổng là $(6-2) \\times 180^\\circ = 720^\\circ$. Chia đều cho 6 góc.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$108^\\circ$',
          is_correct: false,
          explaination: 'Đây là số đo góc của ngũ giác đều ($n=5$).',
        },
        {
          content: '$120^\\circ$',
          is_correct: true,
          explaination: 'Tổng các góc là $(6-2) \\times 180^\\circ = 720^\\circ$. Số đo mỗi góc là $720^\\circ / 6 = 120^\\circ$.',
        },
        {
          content: '$135^\\circ$',
          is_correct: false,
          explaination: 'Đây là số đo góc của bát giác đều ($n=8$).',
        },
        {
          content: '$720^\\circ$',
          is_correct: false,
          explaination: 'Đây là tổng số đo các góc của lục giác, không phải số đo của một góc.',
        },
      ],
    },
    {
      content: 'Hình ảnh tổ ong trong tự nhiên (Hình 13) có cấu trúc liên quan đến hình đa giác đều nào?',
      explaination:
        'Quan sát Hình 13 trong sách, ta thấy các ô của tổ ong có dạng hình 6 cạnh đều.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Ngũ giác đều (Hình 5 cạnh)',
          is_correct: false,
          explaination: 'Hình ảnh ngũ giác đều thường thấy ở bông hoa hoặc con sao biển.',
        },
        {
          content: 'Lục giác đều (Hình 6 cạnh)',
          is_correct: true,
          explaination: 'Cấu trúc tổ ong được xây dựng từ các ô hình lục giác đều, đây là một cấu trúc rất hiệu quả về vật liệu và độ bền.',
        },
        {
          content: 'Bát giác đều (Hình 8 cạnh)',
          is_correct: false,
          explaination: 'Hình ảnh này không liên quan đến tổ ong. Bát giác đều có thể thấy ở một số thiết kế đĩa hoặc gạch (như Hình 20).',
        },
        {
          content: 'Hình vuông (Hình 4 cạnh)',
          is_correct: false,
          explaination: 'Hình vuông thường thấy trong các viên gạch lát nền (Hình 18).',
        },
      ],
    },
    {
      content: 'Những khẳng định nào sau đây là đúng? (Chọn nhiều đáp án)',
      explaination:
        'Áp dụng định nghĩa đa giác đều: "tất cả các cạnh bằng nhau" VÀ "tất cả các góc bằng nhau".',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Hình chữ nhật là một đa giác đều.',
          is_correct: false,
          explaination: 'Sai. Hình chữ nhật có các góc bằng nhau ($90^\\circ$) nhưng các cạnh không nhất thiết bằng nhau.',
        },
        {
          content: 'Hình thoi là một đa giác đều.',
          is_correct: false,
          explaination: 'Sai. Hình thoi có các cạnh bằng nhau nhưng các góc không nhất thiết bằng nhau.',
        },
        {
          content: 'Hình vuông là một đa giác đều.',
          is_correct: true,
          explaination: 'Đúng. Hình vuông thỏa mãn cả hai điều kiện: 4 cạnh bằng nhau và 4 góc bằng nhau (đều bằng $90^\\circ$).',
        },
        {
          content: 'Tam giác đều là một đa giác đều.',
          is_correct: true,
          explaination: 'Đúng. Tam giác đều thỏa mãn cả hai điều kiện: 3 cạnh bằng nhau và 3 góc bằng nhau (đều bằng $60^\\circ$).',
        },
      ],
    },
    // --- Hard ---
    {
      content: 'Tổng số đo các góc trong của một bát giác đều (8 cạnh) là bao nhiêu?',
      explaination:
        'Sử dụng công thức tính tổng số đo các góc trong của một đa giác $n$ cạnh: $S = (n-2) \\times 180^\\circ$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$1080^\\circ$',
          is_correct: true,
          explaination: 'Với $n=8$, ta có tổng số đo các góc là $S = (8-2) \\times 180^\\circ = 6 \\times 180^\\circ = 1080^\\circ$.',
        },
        {
          content: '$135^\\circ$',
          is_correct: false,
          explaination: 'Đây là số đo của *một* góc trong bát giác đều, được tính bằng $1080^\\circ / 8 = 135^\\circ$. Câu hỏi yêu cầu tính *tổng* các góc.',
        },
        {
          content: '$720^\\circ$',
          is_correct: false,
          explaination: 'Đây là tổng số đo các góc của lục giác ($n=6$).',
        },
        {
          content: '$1440^\\circ$',
          is_correct: false,
          explaination: 'Đây là tổng số đo các góc của thập giác ($n=10$).',
        },
      ],
    },
    {
      content: 'Trong Ví dụ 2 (Hình 8), tại sao hình bát giác (8 cạnh) mà bạn Thảo tạo ra được coi là một đa giác đều?',
      explaination:
        'Phân tích quá trình gấp và cắt trong Hình 8 để hiểu tại sao các cạnh và các góc của hình 8e lại bằng nhau.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Vì nó được cắt ra từ một hình vuông, mà hình vuông là đa giác đều.',
          is_correct: false,
          explaination: 'Việc cắt một đa giác đều không đảm bảo kết quả sẽ là một đa giác đều.',
        },
        {
          content: 'Vì nó có 8 cạnh.',
          is_correct: false,
          explaination: 'Việc có 8 cạnh chỉ khiến nó trở thành một bát giác, không phải là một bát giác *đều*.',
        },
        {
          content: 'Vì cách gấp và cắt đối xứng tạo ra 8 cạnh bằng nhau và 8 góc bằng nhau.',
          is_correct: true,
          explaination: 'Quá trình gấp giấy (Hình 8a, 8b, 8c) đảm bảo tính đối xứng. Nhát cắt (Hình 8d) tạo ra 8 tam giác cân bằng nhau khi mở ra (Hình 8e), dẫn đến 8 cạnh (cạnh đáy tam giác) bằng nhau và 8 góc ở đỉnh (bằng nhau) tạo thành bát giác đều.',
        },
        {
          content: 'Vì nó có tâm đối xứng O.',
          is_correct: false,
          explaination: 'Một đa giác đều (với số cạnh chẵn) có tâm đối xứng, nhưng một đa giác có tâm đối xứng (ví dụ hình chữ nhật) chưa chắc là đa giác đều.',
        },
      ],
    },

    // ========================================================
    // === CHƯƠNG 9 - §2. Phép quay ===
    // ========================================================
    // --- Easy ---
    {
      content:
        'Phép quay tâm O góc $\\alpha$ biến điểm M (khác O) thành điểm M\' sao cho:',
      explaination:
        'Theo định nghĩa, phép quay tâm O biến M thành M\' thì M\' phải nằm trên đường tròn (O; OM) và góc quay $\\widehat{MOM\'}$ phải bằng $\\alpha$ theo đúng chiều quay đã định.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$OM = OM\'$ và $\\widehat{MOM\'} = \\alpha$',
          is_correct: true,
          explaination:
            'Đây là định nghĩa chính xác. $OM = OM\'$ đảm bảo M\' cùng quỹ đạo tròn với M, và $\\widehat{MOM\'} = \\alpha$ đảm bảo đúng góc quay.',
        },
        {
          content: '$OM < OM\'$ và $\\widehat{MOM\'} = \\alpha$',
          is_correct: false,
          explaination:
            'Phép quay là một phép dời hình, nó bảo toàn khoảng cách đến tâm quay. $OM$ phải bằng $OM\'$.',
        },
        {
          content: '$OM = OM\'$ và $MM\' = \\alpha$',
          is_correct: false,
          explaination:
            'Sai. $MM\'$ là độ dài một dây cung, $\\alpha$ là số đo góc, chúng không thể bằng nhau.',
        },
        {
          content: 'M, O, M\' thẳng hàng.',
          is_correct: false,
          explaination:
            'Điều này chỉ xảy ra trong trường hợp đặc biệt khi góc quay $\\alpha = 180^{\\circ}$ (đối xứng tâm).',
        },
      ],
    },
    {
      content:
        'Cho hình vuông ABCD tâm O. Phép quay thuận chiều (cùng chiều kim đồng hồ) $90^{\\circ}$ tâm O biến điểm A thành điểm nào?',
      explaination:
        'Hình vuông ABCD có tâm O. Các góc $\\widehat{AOB}, \\widehat{BOC}, \\widehat{COD}, \\widehat{DOA}$ đều bằng $90^{\\circ}$. Quay thuận chiều (clockwise) là quay từ A $\\to$ D $\\to$ C $\\to$ B $\\to$ A.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Điểm B',
          is_correct: false,
          explaination:
            'Sai. Biến A thành B là phép quay ngược chiều $90^{\\circ}$ (counter-clockwise).',
        },
        {
          content: 'Điểm C',
          is_correct: false,
          explaination:
            'Sai. Biến A thành C là phép quay $180^{\\circ}$ (đối xứng tâm).',
        },
        {
          content: 'Điểm D',
          is_correct: true,
          explaination:
            'Đúng. $OA = OD$ và $\\widehat{AOD} = 90^{\\circ}$. Quay A thuận chiều $90^{\\circ}$ sẽ tới D.',
        },
        {
          content: 'Điểm O',
          is_correct: false,
          explaination:
            'Sai. Phép quay chỉ biến tâm O thành chính nó. Điểm A khác O nên không thể biến thành O.',
        },
      ],
    },
    {
      content:
        'Phép quay tâm O góc $180^{\\circ}$ (thuận chiều hoặc ngược chiều) còn được gọi là gì?',
      explaination:
        'Khi $M\'$ là ảnh của $M$ qua phép quay $180^{\\circ}$, ba điểm $M, O, M\'$ thẳng hàng và $OM = OM\'$. Đây chính là định nghĩa của phép đối xứng tâm O.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Phép đối xứng tâm O',
          is_correct: true,
          explaination:
            'Phép quay $180^{\\circ}$ làm $M, O, M\'$ thẳng hàng và O là trung điểm $MM\'$.',
        },
        {
          content: 'Phép đối xứng trục Oy',
          is_correct: false,
          explaination:
            'Đối xứng trục là lật qua một đường thẳng, không phải quay 180 độ quanh một điểm.',
        },
        {
          content: 'Phép quay $360^{\\circ}$',
          is_correct: false,
          explaination:
            'Phép quay $360^{\\circ}$ là phép đồng nhất, biến mọi điểm thành chính nó.',
        },
        {
          content: 'Phép tịnh tiến',
          is_correct: false,
          explaination:
            'Phép tịnh tiến di chuyển mọi điểm theo một vector, không giữ cố định tâm O.',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Cho hình lục giác đều $A_1A_2A_3A_4A_5A_6$ tâm O. Phép quay ngược chiều (ngược chiều kim đồng hồ) $120^{\\circ}$ tâm O biến điểm $A_1$ thành điểm nào?',
      explaination:
        'Lục giác đều có 6 đỉnh cách đều tâm O. Góc ở tâm giữa hai đỉnh kề nhau là $360^{\\circ}/6 = 60^{\\circ}$. Quay ngược chiều $120^{\\circ}$ (tức là $2 \\times 60^{\\circ}$) sẽ di chuyển điểm qua 2 đỉnh theo chiều $A_1 \\to A_2 \\to A_3$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$A_2$',
          is_correct: false,
          explaination:
            'Biến $A_1$ thành $A_2$ là phép quay ngược chiều $60^{\\circ}$.',
        },
        {
          content: '$A_3$',
          is_correct: true,
          explaination:
            'Quay ngược chiều từ $A_1$ đến $A_2$ là $60^{\\circ}$, và từ $A_1$ đến $A_3$ là $60^{\\circ} + 60^{\\circ} = 120^{\\circ}$.',
        },
        {
          content: '$A_4$',
          is_correct: false,
          explaination:
            'Biến $A_1$ thành $A_4$ là phép quay $180^{\\circ}$ (đối xứng tâm).',
        },
        {
          content: '$A_6$',
          is_correct: false,
          explaination:
            'Biến $A_1$ thành $A_6$ là phép quay thuận chiều $60^{\\circ}$ (hoặc ngược chiều $300^{\\circ}$).',
        },
      ],
    },
    {
      content:
        'Phép quay tâm O nào sau đây giữ nguyên hình vuông ABCD (biến hình vuông thành chính nó)? (Chọn nhiều đáp án)',
      explaination:
        'Hình đa giác đều n-cạnh tâm O được giữ nguyên bởi phép quay góc $\\alpha = k \\cdot (360^{\\circ}/n)$. Với hình vuông $n=4$, các góc quay giữ nguyên hình là bội của $90^{\\circ}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Quay thuận chiều $90^{\\circ}$',
          is_correct: true,
          explaination:
            'Phép quay này biến (A, B, C, D) thành (D, A, B, C). Hình vuông mới trùng với hình vuông cũ.',
        },
        {
          content: 'Quay ngược chiều $180^{\\circ}$',
          is_correct: true,
          explaination:
            'Phép quay này biến (A, B, C, D) thành (C, D, A, B). Hình vuông mới trùng với hình vuông cũ.',
        },
        {
          content: 'Quay thuận chiều $270^{\\circ}$',
          is_correct: true,
          explaination:
            'Phép quay này biến (A, B, C, D) thành (B, C, D, A). Hình vuông mới trùng với hình vuông cũ.',
        },
        {
          content: 'Quay ngược chiều $45^{\\circ}$',
          is_correct: false,
          explaination:
            'Góc $45^{\\circ}$ không phải là bội của $90^{\\circ}$. Đỉnh A sẽ quay đến vị trí giữa cung AD, không trùng với đỉnh nào.',
        },
      ],
    },
    {
      content:
        'Cho hình ngũ giác đều ABCDE tâm O. Phép quay ngược chiều $\\alpha = 72^{\\circ}$ tâm O biến điểm A thành B. Khẳng định nào sau đây là đúng? (Chọn nhiều đáp án)',
      explaination:
        'Ngũ giác đều $n=5$. Góc quay cơ bản là $360^{\\circ}/5 = 72^{\\circ}$. Phép quay này sẽ dịch chuyển các đỉnh đi 1 bước ngược chiều kim đồng hồ (A $\\to$ B, B $\\to$ C, ...).',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Phép quay này biến điểm B thành C.',
          is_correct: true,
          explaination: 'Đúng, $B \\to C$ là quay ngược chiều $72^{\\circ}$.',
        },
        {
          content: 'Phép quay này biến điểm E thành A.',
          is_correct: true,
          explaination: 'Đúng, $E \\to A$ là quay ngược chiều $72^{\\circ}$.',
        },
        {
          content: 'Phép quay này biến điểm A thành E.',
          is_correct: false,
          explaination:
            'Sai. $A \\to E$ là phép quay thuận chiều $72^{\\circ}$ (hoặc ngược chiều $288^{\\circ}$).',
        },
        {
          content: 'Phép quay này biến điểm C thành B.',
          is_correct: false,
          explaination:
            'Sai. $C \\to B$ là phép quay thuận chiều $72^{\\circ}$ (hoặc ngược chiều $288^{\\circ}$).',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Hình chong chóng (gồm 18 tam giác đều bằng nhau ghép lại) có tâm O. Phép quay tâm O góc $\\alpha$ nào sau đây giữ nguyên hình chong chóng đó?',
      explaination:
        'Hình chong chóng này không phải là đa giác đều 18 cạnh. Nó được tạo bởi 6 "cánh" hoa văn giống hệt nhau. Phép quay giữ nguyên hình phải là bội của $360^{\\circ}/6 = 60^{\\circ}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Góc $20^{\\circ}$ (thuận chiều)',
          is_correct: false,
          explaination:
            'Sai. Mặc dù có 18 tam giác ($360/18 = 20$), nhưng 3 tam giác tạo thành 1 cánh. Quay $20^{\\circ}$ sẽ không làm hình trùng khít.',
        },
        {
          content: 'Góc $120^{\\circ}$ (ngược chiều)',
          is_correct: true,
          explaination:
            'Đúng. $120^{\\circ}$ là bội của $60^{\\circ}$ ($120 = 2 \\times 60$). Phép quay này sẽ làm 6 cánh hoa văn trùng khít lên nhau.',
        },
        {
          content: 'Góc $90^{\\circ}$ (thuận chiều)',
          is_correct: false,
          explaination:
            'Sai. $90^{\\circ}$ không phải là bội của $60^{\\circ}$.',
        },
        {
          content: 'Góc $100^{\\circ}$ (ngược chiều)',
          is_correct: false,
          explaination:
            'Sai. $100^{\\circ}$ không phải là bội của $60^{\\circ}$.',
        },
      ],
    },
    {
      content:
        'Cho hình bát giác đều (8 cạnh) ABCDEGHK tâm O. Phép quay ngược chiều tâm O biến A thành C. Đây là phép quay góc bao nhiêu độ?',
      explaination:
        'Bát giác đều $n=8$. Góc quay cơ bản (từ đỉnh này sang đỉnh kề ngược chiều kim đồng hồ) là $360^{\\circ}/8 = 45^{\\circ}$. Quay ngược chiều từ A đến C là đi qua 2 đỉnh (A $\\to$ B $\\to$ C).',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$45^{\\circ}$',
          is_correct: false,
          explaination: 'Sai. Đây là góc quay ngược chiều từ A $\\to$ B.',
        },
        {
          content: '$90^{\\circ}$',
          is_correct: true,
          explaination:
            'Góc quay = $2 \\times (360^{\\circ}/8) = 2 \\times 45^{\\circ} = 90^{\\circ}$.',
        },
        {
          content: '$135^{\\circ}$',
          is_correct: false,
          explaination: 'Sai. Đây là góc quay ngược chiều từ A $\\to$ D.',
        },
        {
          content: '$60^{\\circ}$',
          is_correct: false,
          explaination:
            '$60^{\\circ}$ không phải là bội của $45^{\\circ}$, không thể biến đỉnh A thành đỉnh khác.',
        },
      ],
    },
    {
      content:
        'Phép quay tâm O với góc quay $\\alpha$ (biết $\\alpha$ không phải là bội của $360^{\\circ}$) có bao nhiêu điểm bất động (điểm biến thành chính nó)?',
      explaination:
        'Theo định nghĩa, phép quay tâm O giữ nguyên điểm O. Bất kỳ điểm M nào khác O ($M \\ne O$) sẽ bị quay đến vị trí M\' trên đường tròn (O; OM). $M\'$ chỉ trùng $M$ khi góc quay là bội của $360^{\\circ}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat9_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '0',
          is_correct: false,
          explaination:
            'Sai. Phép quay luôn giữ nguyên tâm quay O, vậy có ít nhất 1 điểm bất động.',
        },
        {
          content: '1',
          is_correct: true,
          explaination:
            'Chỉ có duy nhất tâm quay O là điểm bất động ($Q(O) = O$). Mọi điểm M khác O đều bị di chuyển đến M\' $\\ne$ M.',
        },
        {
          content: '2',
          is_correct: false,
          explaination: 'Không thể có 2 điểm bất động (trừ khi là phép đồng nhất).',
        },
        {
          content: 'Vô số',
          is_correct: false,
          explaination:
            'Chỉ phép quay $k \\cdot 360^{\\circ}$ (phép đồng nhất) mới có vô số điểm bất động (tất cả các điểm).',
        },
      ],
    },

    // ========================================================
    // === CHƯOSNG 10 - §1. Hình trụ ===
    // ========================================================
    // --- Easy ---
    {
      content: 'Hình trụ được tạo ra khi quay hình nào sau đây một vòng quanh một cạnh cố định của nó?',
      explaination:
        'Hãy nhớ lại định nghĩa về cách tạo ra một hình trụ trong không gian.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Hình tam giác vuông.',
          is_correct: false,
          explaination: 'Khi quay một hình tam giác vuông quanh một cạnh góc vuông, nó sẽ tạo ra một hình nón.',
        },
        {
          content: 'Hình chữ nhật.',
          is_correct: true,
          explaination: 'Theo định nghĩa (Hình 2), hình trụ được tạo ra khi quay một hình chữ nhật một vòng xung quanh đường thẳng cố định chứa một cạnh của nó.',
        },
        {
          content: 'Hình tròn.',
          is_correct: false,
          explaination: 'Quay một hình tròn quanh một đường kính của nó sẽ tạo ra một hình cầu.',
        },
        {
          content: 'Nửa hình tròn.',
          is_correct: false,
          explaination: 'Quay một nửa hình tròn quanh đường kính của nó sẽ tạo ra một hình cầu.',
        },
      ],
    },
    {
      content: 'Vật thể nào sau đây KHÔNG có dạng hình trụ?',
      explaination:
        'Hình trụ có đặc điểm là hai mặt đáy là hai hình tròn bằng nhau và song song với nhau.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Lon nước (Hình 1a).',
          is_correct: false,
          explaination: 'Lon nước là một ví dụ điển hình của hình trụ.',
        },
        {
          content: 'Hộp sữa (Hình 1e).',
          is_correct: false,
          explaination: 'Hộp sữa (dạng hộp sữa đặc, sữa bột) thường có dạng hình trụ.',
        },
        {
          content: 'Cốc (ly) thủy tinh (Hình 1c).',
          is_correct: false,
          explaination: 'Chiếc cốc này có hai đáy hình tròn bằng nhau và thành cốc thẳng đứng, đây là một hình trụ.',
        },
        {
          content: 'Một quả bóng đá.',
          is_correct: true,
          explaination: 'Quả bóng đá có dạng hình cầu, không phải hình trụ.',
        },
      ],
    },
    {
      content: 'Trong hình trụ, "đường sinh" là gì?',
      explaination:
        'Xem lại các yếu tố của hình trụ (Hình 3). Đường sinh liên quan đến mặt xung quanh của hình trụ.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đường kính của mặt đáy.',
          is_correct: false,
          explaination: 'Đây là đường kính đáy, không phải đường sinh.',
        },
        {
          content: 'Đoạn thẳng nối tâm hai mặt đáy.',
          is_correct: false,
          explaination: 'Đoạn thẳng này gọi là trục của hình trụ, và độ dài của nó bằng chiều cao $h$.',
        },
        {
          content: 'Mỗi vị trí của cạnh bên khi quay hình chữ nhật tạo thành mặt xung quanh.',
          is_correct: true,
          explaination: 'Theo định nghĩa (Hình 3), cạnh $AB$ (đối diện cạnh trục quay $CD$) quét nên mặt xung quanh, và mỗi vị trí của $AB$ được gọi là một đường sinh. Độ dài đường sinh bằng chiều cao $h$.',
        },
        {
          content: 'Đường tròn của mặt đáy.',
          is_correct: false,
          explaination: 'Đây là chu vi đáy, không phải đường sinh.',
        },
      ],
    },
    // --- Medium ---
    {
      content: 'Công thức tính diện tích xung quanh $S_{xq}$ của hình trụ có bán kính đáy $r$ và chiều cao $h$ là:',
      explaination:
        'Diện tích xung quanh $S_{xq}$ bằng chu vi đáy nhân với chiều cao. Chu vi đáy của hình tròn là $C = 2\\pi r$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$S_{xq} = \\pi r^2 h$',
          is_correct: false,
          explaination: 'Đây là công thức tính thể tích $V$ của hình trụ.',
        },
        {
          content: '$S_{xq} = 2\\pi r h$',
          is_correct: true,
          explaination: 'Diện tích xung quanh bằng chu vi đáy ($C = 2\\pi r$) nhân với chiều cao ($h$).',
        },
        {
          content: '$S_{xq} = 2\\pi r^2$',
          is_correct: false,
          explaination: 'Đây là diện tích của hai mặt đáy.',
        },
        {
          content: '$S_{xq} = \\pi r (r + h)$',
          is_correct: false,
          explaination: 'Đây là công thức tính $S_{tp}$ của hình nón. $S_{tp}$ của hình trụ là $2\\pi rh + 2\\pi r^2$.',
        },
      ],
    },
    {
      content: 'Công thức tính thể tích $V$ của hình trụ có bán kính đáy $r$ và chiều cao $h$ là:',
      explaination:
        'Thể tích $V$ bằng diện tích đáy nhân với chiều cao. Diện tích đáy của hình tròn là $S = \\pi r^2$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$V = \\pi r^2 h$',
          is_correct: true,
          explaination: 'Thể tích bằng diện tích đáy ($S = \\pi r^2$) nhân với chiều cao ($h$).',
        },
        {
          content: '$V = 2\\pi r h$',
          is_correct: false,
          explaination: 'Đây là công thức tính diện tích xung quanh $S_{xq}$ của hình trụ.',
        },
        {
          content: '$V = \\frac{1}{3}\\pi r^2 h$',
          is_correct: false,
          explaination: 'Đây là công thức tính thể tích $V$ của hình nón.',
        },
        {
          content: '$V = \\pi r^2$',
          is_correct: false,
          explaination: 'Đây là công thức tính diện tích mặt đáy $S$.',
        },
      ],
    },
    {
      content: 'Chọn các khẳng định đúng về một hình trụ (theo Hình 3):',
      explaination:
        'Phân tích các yếu tố cấu tạo nên hình trụ: hai đáy, đường sinh, và chiều cao.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Hai mặt đáy là hai hình tròn bằng nhau.',
          is_correct: true,
          explaination: 'Đúng, hai mặt đáy (tâm D và tâm C) là hai hình tròn bằng nhau (cùng bán kính $r=DA=CB$).',
        },
        {
          content: 'Hai mặt đáy nằm trong hai mặt phẳng song song với nhau.',
          is_correct: true,
          explaination: 'Đúng, đây là đặc điểm của hình trụ đứng được học.',
        },
        {
          content: 'Độ dài đường sinh bằng chiều cao của hình trụ.',
          is_correct: true,
          explaination: 'Đúng, trong hình trụ đứng, đường sinh (ví dụ $AB$) song song và bằng trục $CD$, do đó độ dài đường sinh bằng chiều cao $h$.',
        },
        {
          content: 'Độ dài đường sinh bằng bán kính đáy.',
          is_correct: false,
          explaination: 'Sai, độ dài đường sinh ($h$) không nhất thiết bằng bán kính đáy ($r$), trừ trường hợp đặc biệt $h=r$.',
        },
      ],
    },
    // --- Hard ---
    {
      content: 'Một khối gỗ hình trụ (Ví dụ 3) có bán kính đáy 13 cm và chiều cao 43 cm. Thể tích của khối gỗ đó là (lấy $\\pi \\approx 3,14$, làm tròn đến hàng phần trăm):',
      explaination:
        'Áp dụng công thức $V = \\pi r^2 h$ với $r=13$ cm và $h=43$ cm.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$1755,38 cm^3$',
          is_correct: false,
          explaination: 'Đây là kết quả nếu tính $V = 13 \\times 43 \\times \\pi$. Bạn đã quên bình phương bán kính $r^2$.',
        },
        {
          content: '$22829,95 cm^3$',
          is_correct: true,
          explaination: '$V = \\pi \\times (13)^2 \\times 43 = \\pi \\times 169 \\times 43 = 7267\\pi \\approx 7267 \\times 3,14 \\approx 22817,78$. (Sách dùng giá trị $\\pi$ chính xác hơn: $7267\\pi \\approx 22829,95$).',
        },
        {
          content: '$3490,76 cm^3$',
          is_correct: false,
          explaination: 'Đây là kết quả nếu tính $S_{xq} = 2\\pi rh$. Câu hỏi yêu cầu tính thể tích $V$.',
        },
        {
          content: '$5811,34 cm^3$',
          is_correct: false,
          explaination: 'Đây là kết quả nếu tính $V = \\pi r h^2$. Bạn đã nhầm lẫn giữa $r$ và $h$ khi bình phương.',
        },
      ],
    },
    {
      content: 'Một cây cột hình trụ (Bài tập 2) có đường kính đáy 30 cm và chiều cao 350 cm. Chi phí sơn mặt xung quanh là 40 000 đồng/m². Tổng chi phí là (lấy $\\pi \\approx 3,14$, làm tròn đến hàng nghìn):',
      explaination:
        'Đổi đơn vị: $d=30$ cm $= 0.3$ m $\\implies r = 0.15$ m. $h=350$ cm $= 3.5$ m. Tính $S_{xq} = 2\\pi rh$. Sau đó nhân với đơn giá 40 000 đồng/m². ',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '132 000 đồng',
          is_correct: true,
          explaination: '$S_{xq} = 2 \\times 3,14 \\times 0,15 \\times 3,5 = 3,297 m^2$. Chi phí = $3,297 \\times 40000 = 131880$ đồng. Làm tròn đến hàng nghìn ta được 132 000 đồng.',
        },
        {
          content: '13 188 000 đồng',
          is_correct: false,
          explaination: 'Sai, có thể bạn đã không đổi đơn vị từ cm sang m và tính $S_{xq}$ bằng cm² ($S_{xq} = 2 \\times 3,14 \\times 15 \\times 350 = 32970 cm^2 = 3.297 m^2$).',
        },
        {
          content: '264 000 đồng',
          is_correct: false,
          explaination: 'Bạn có thể đã dùng đường kính $d=0.3$m thay vì bán kính $r=0.15$m khi tính $S_{xq}$.',
        },
        {
          content: '9 900 000 đồng',
          is_correct: false,
          explaination: 'Đây là kết quả nếu tính Thể tích $V = \\pi r^2 h = 3,14 \\times (0.15)^2 \\times 3.5 \\approx 0.247 m^3$ rồi nhân với 40000. Sai yêu cầu (tính $S_{xq}$).',
        },
      ],
    },
    {
      content: 'Một chiếc pin 3A (Bài tập 6) có dạng hình trụ, cao 44,5 mm và đường kính đáy 10,5 mm. Diện tích toàn phần của viên pin là (lấy $\\pi \\approx 3,14$, làm tròn đến hàng phần mười):',
      explaination:
        'Đổi đơn vị: $h=44,5$ mm $= 4,45$ cm. $d=10,5$ mm $= 1,05$ cm $\\implies r = 0,525$ cm. Tính $S_{tp} = S_{xq} + 2 \\times S_{đáy} = 2\\pi rh + 2\\pi r^2$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$14,7 cm^2$',
          is_correct: false,
          explaination: 'Đây là $S_{xq} = 2 \\times 3,14 \\times 0,525 \\times 4,45 \\approx 14,66 cm^2$. Cần tính $S_{tp}$.',
        },
        {
          content: '$1,7 cm^2$',
          is_correct: false,
          explaination: 'Đây là diện tích 2 đáy: $2S_{đáy} = 2 \\times 3,14 \\times (0,525)^2 \\approx 1,73 cm^2$. Cần tính $S_{tp}$.',
        },
        {
          content: '$16,4 cm^2$',
          is_correct: true,
          explaination: '$S_{xq} \\approx 14,66 cm^2$. $2S_{đáy} \\approx 1,73 cm^2$. $S_{tp} = S_{xq} + 2S_{đáy} \\approx 14,66 + 1,73 = 16,39 cm^2$. Làm tròn đến hàng phần mười là $16,4 cm^2$.',
        },
        {
          content: '$3,9 cm^3$',
          is_correct: false,
          explaination: 'Đây là Thể tích $V = S_{đáy} \\times h \\approx (1,73/2) \\times 4,45 \\approx 3,85 cm^3$. Sai đơn vị và sai yêu cầu.',
        },
      ],
    },
    {
      content: 'Một đường ống hình trụ (Bài tập 5) dài 30 m, dung tích 1 800 000 lít. Đường kính đáy của đường ống là (lấy $\\pi \\approx 3,14$, làm tròn đến hàng phần trăm):',
      explaination:
        'Đổi đơn vị: $V = 1 800 000$ lít $= 1 800 000 dm^3 = 1800 m^3$. Chiều cao $h = 30$ m. Từ $V = \\pi r^2 h$, suy ra $r^2 = V / (\\pi h)$. Tính $r$, sau đó tính đường kính $d=2r$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$4,37 m$',
          is_correct: false,
          explaination: 'Đây là bán kính $r$. $r^2 = 1800 / (3,14 \\times 30) = 1800 / 94,2 \\approx 19,11$. $r = \\sqrt{19,11} \\approx 4,37$ m. Cần tìm đường kính $d$.',
        },
        {
          content: '$19,11 m$',
          is_correct: false,
          explaination: 'Đây là $r^2$, không phải $d$.',
        },
        {
          content: '$8,74 m$',
          is_correct: true,
          explaination: 'Ta có $r \\approx 4,37$ m. Đường kính $d = 2r = 2 \\times 4,37 = 8,74$ m.',
        },
        {
          content: '$60 m$',
          is_correct: false,
          explaination: 'Đây là kết quả của $1800 / 30 = 60$. Bạn đã quên chia cho $\\pi$ và khai căn.',
        },
      ],
    },

    // ========================================================
    // === CHƯƠNG 10 - §2. Hình nón ===
    // ========================================================
    // --- Easy ---
    {
      content:
        'Khi quay tam giác vuông $OAB$ một vòng quanh cạnh góc vuông $OA$ cố định thì đường gấp khúc $OBA$ tạo nên hình gì?',
      explaination:
        'Theo định nghĩa, hình nón được tạo ra khi quay một tam giác vuông một vòng quanh một cạnh góc vuông cố định của nó.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Hình trụ',
          is_correct: false,
          explaination: 'Hình trụ được tạo ra khi quay hình chữ nhật.',
        },
        {
          content: 'Hình nón',
          is_correct: true,
          explaination:
            'Cạnh $OA$ là chiều cao, cạnh $OB$ là bán kính đáy, và cạnh $AB$ là đường sinh.',
        },
        {
          content: 'Hình cầu',
          is_correct: false,
          explaination: 'Hình cầu được tạo ra khi quay nửa hình tròn.',
        },
        {
          content: 'Hình tam giác',
          is_correct: false,
          explaination: 'Hình tạo thành là một khối 3D.',
        },
      ],
    },
    {
      content:
        'Cho hình nón có bán kính đáy $r$ và đường sinh $l$. Công thức tính diện tích xung quanh $S_{xq}$ của hình nón là:',
      explaination:
        'Diện tích xung quanh của hình nón được tính bằng tích của $\\pi$, bán kính đáy $r$, và đường sinh $l$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$S_{xq} = \\pi r l$',
          is_correct: true,
        },
        {
          content: '$S_{xq} = 2\\pi r l$',
          is_correct: false,
          explaination:
            'Đây là công thức diện tích xung quanh hình trụ (với $l$ là chiều cao $h$).',
        },
        {
          content: '$S_{xq} = \\pi r^2 l$',
          is_correct: false,
          explaination: 'Sai công thức.',
        },
        {
          content: '$S_{xq} = \\pi r h$',
          is_correct: false,
          explaination: 'Sai. Phải dùng đường sinh $l$, không dùng chiều cao $h$.',
        },
      ],
    },
    {
      content:
        'Công thức tính thể tích $V$ của hình nón có bán kính đáy $r$ và chiều cao $h$ là:',
      explaination:
        'Thể tích hình nón bằng một phần ba tích của diện tích đáy ($\\pi r^2$) và chiều cao $h$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$V = \\pi r^2 h$',
          is_correct: false,
          explaination: 'Đây là công thức thể tích hình trụ.',
        },
        {
          content: '$V = \\frac{1}{3} \\pi r^2 h$',
          is_correct: true,
        },
        {
          content: '$V = \\frac{4}{3} \\pi r^3$',
          is_correct: false,
          explaination: 'Đây là công thức thể tích hình cầu.',
        },
        {
          content: '$V = \\pi r l$',
          is_correct: false,
          explaination: 'Đây là công thức diện tích xung quanh.',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Một hình nón có bán kính đáy $r = 5$ cm và chiều cao $h = 12$ cm. Đường sinh $l$ của hình nón đó là:',
      explaination:
        'Mối liên hệ giữa $r, h, l$ trong hình nón là $l^2 = h^2 + r^2$ (định lí Pythagore).',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '13 cm',
          is_correct: true,
          explaination:
            '$l = \\sqrt{h^2 + r^2} = \\sqrt{12^2 + 5^2} = \\sqrt{144 + 25} = \\sqrt{169} = 13$ cm.',
        },
        {
          content: '17 cm',
          is_correct: false,
          explaination: 'Bạn nhầm $h+r$.',
        },
        {
          content: '$\\sqrt{119}$ cm',
          is_correct: false,
          explaination:
            'Bạn đã tính $\\sqrt{h^2 - r^2}$. Phải là $l^2 = h^2 + r^2$.',
        },
        {
          content: '7 cm',
          is_correct: false,
          explaination: 'Bạn đã tính $h-r$.',
        },
      ],
    },
    {
      content:
        'Tính diện tích xung quanh $S_{xq}$ của một hình nón có bán kính đáy $r = 3$ cm và đường sinh $l = 7$ cm.',
      explaination:
        'Áp dụng công thức $S_{xq} = \\pi r l$ với $r=3$ và $l=7$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$10\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Bạn đã tính $\\pi(r+l)$.',
        },
        {
          content: '$63\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Bạn đã tính $\\pi r^2 l / 3$ (nhầm lẫn công thức).',
        },
        {
          content: '$21\\pi \\text{ cm}^2$',
          is_correct: true,
          explaination: '$S_{xq} = \\pi \\times 3 \\times 7 = 21\\pi \\text{ cm}^2$.',
        },
        {
          content: '$9\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Đây là diện tích đáy $S_đ = \\pi r^2$.',
        },
      ],
    },
    {
      content:
        'Tính thể tích $V$ của một hình nón có bán kính đáy $r = 6$ cm và chiều cao $h = 5$ cm.',
      explaination:
        'Áp dụng công thức $V = \\frac{1}{3} \\pi r^2 h$ với $r=6$ và $h=5$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$180\\pi \\text{ cm}^3$',
          is_correct: false,
          explaination:
            'Bạn đã tính $V = \\pi r^2 h$, đây là thể tích hình trụ. Bạn quên chia 3.',
        },
        {
          content: '$30\\pi \\text{ cm}^3$',
          is_correct: false,
          explaination: 'Bạn đã tính $V = \\pi r h$. Sai công thức.',
        },
        {
          content: '$60\\pi \\text{ cm}^3$',
          is_correct: true,
          explaination:
            '$V = \\frac{1}{3} \\pi \\times 6^2 \\times 5 = \\frac{1}{3} \\pi \\times 36 \\times 5 = 12 \\times 5 \\pi = 60\\pi \\text{ cm}^3$.',
        },
        {
          content: '$36\\pi \\text{ cm}^3$',
          is_correct: false,
          explaination: 'Đây là diện tích đáy $S_đ = \\pi r^2$.',
        },
      ],
    },
    {
      content:
        'Một hình nón có đường sinh $l = 10$ cm và bán kính đáy $r = 6$ cm. Chiều cao $h$ của hình nón là:',
      explaination:
        'Mối liên hệ giữa $r, h, l$ trong hình nón là $l^2 = h^2 + r^2$. Do đó $h = \\sqrt{l^2 - r^2}$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '8 cm',
          is_correct: true,
          explaination:
            '$h = \\sqrt{l^2 - r^2} = \\sqrt{10^2 - 6^2} = \\sqrt{100 - 36} = \\sqrt{64} = 8$ cm.',
        },
        {
          content: '4 cm',
          is_correct: false,
          explaination: 'Bạn đã tính $l-r$.',
        },
        {
          content: '$\\sqrt{136}$ cm',
          is_correct: false,
          explaination: 'Bạn đã tính $\\sqrt{l^2 + r^2}$ (sai).',
        },
        {
          content: '16 cm',
          is_correct: false,
          explaination: 'Bạn đã tính $l+r$.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Tính diện tích toàn phần $S_{tp}$ của hình nón có bán kính đáy $r = 5$ cm và chiều cao $h = 12$ cm.',
      explaination:
        'Bước 1: Tính đường sinh $l = \\sqrt{h^2 + r^2}$. Bước 2: Tính diện tích xung quanh $S_{xq} = \\pi r l$. Bước 3: Tính diện tích đáy $S_đ = \\pi r^2$. Bước 4: $S_{tp} = S_{xq} + S_đ$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$65\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination:
            'Đây mới chỉ là diện tích xung quanh $S_{xq}$. $l = \\sqrt{12^2 + 5^2} = 13$. $S_{xq} = \\pi \\times 5 \\times 13 = 65\\pi$.',
        },
        {
          content: '$25\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Đây mới chỉ là diện tích đáy $S_đ = \\pi \\times 5^2 = 25\\pi$.',
        },
        {
          content: '$90\\pi \\text{ cm}^2$',
          is_correct: true,
          explaination:
            'Đường sinh $l = 13$ cm. $S_{xq} = 65\\pi \\text{ cm}^2$. $S_đ = 25\\pi \\text{ cm}^2$. $S_{tp} = S_{xq} + S_đ = 65\\pi + 25\\pi = 90\\pi \\text{ cm}^2$.',
        },
        {
          content: '$85\\pi \\text{ cm}^2$',
          is_correct: false,
          explaination: 'Bạn đã tính $S_{tp} = \\pi r (h + r) = \\pi \\times 5 \\times (12+5) = 85\\pi$. Sai công thức, phải là $S_{tp} = \\pi r (l + r)$.',
        },
      ],
    },
    {
      content:
        'Một chiếc nón lá hình nón có chu vi đáy $C = 40\\pi$ cm và chiều cao $h = 15$ cm. Các khẳng định nào sau đây là ĐÚNG? (Chọn nhiều đáp án)',
      explaination:
        'Bước 1: Từ chu vi đáy $C = 2\\pi r$, tìm bán kính $r$. $40\\pi = 2\\pi r \\implies r = 20$ cm. Bước 2: Tính đường sinh $l = \\sqrt{h^2 + r^2} = \\sqrt{15^2 + 20^2}$. Bước 3: Tính diện tích xung quanh $S_{xq} = \\pi r l$.',
      level: DifficultyLevel.hard,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Bán kính đáy $r = 20$ cm.',
          is_correct: true,
          explaination: '$r = C / (2\\pi) = 40\\pi / (2\\pi) = 20$ cm.',
        },
        {
          content: 'Đường sinh $l = 25$ cm.',
          is_correct: true,
          explaination:
            '$l = \\sqrt{15^2 + 20^2} = \\sqrt{225 + 400} = \\sqrt{625} = 25$ cm.',
        },
        {
          content: 'Diện tích xung quanh là $500\\pi \\text{ cm}^2$.',
          is_correct: true,
          explaination:
            '$S_{xq} = \\pi r l = \\pi \\times 20 \\times 25 = 500\\pi \\text{ cm}^2$.',
        },
        {
          content: 'Đường sinh $l = 35$ cm.',
          is_correct: false,
          explaination: 'Bạn đã tính $h+r$.',
        },
      ],
    },
    {
      content:
        'Một đống cát hình nón có chu vi đáy $C = 12$ m và chiều cao $h = 2.5$ m. Thể tích $V$ của đống cát là (lấy $\\pi \\approx 3.14$):',
      explaination:
        'Bước 1: Tìm bán kính $r = C / (2\\pi) = 12 / (2\\pi) = 6/\\pi$. Bước 2: Tính diện tích đáy $S_đ = \\pi r^2 = \\pi (6/\\pi)^2 = 36/\\pi$. Bước 3: Tính thể tích $V = \\frac{1}{3} S_đ h = \\frac{1}{3} \\times \\frac{36}{\\pi} \\times 2.5 = \\frac{12 \\times 2.5}{\\pi} = \\frac{30}{\\pi}$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Khoảng 9.55 $m^3$',
          is_correct: true,
          explaination:
            '$r = 12 / (2 \\times 3.14) \\approx 1.91$ m. $V = \\frac{1}{3} \\pi r^2 h \\approx \\frac{1}{3} \\times 3.14 \\times (1.91)^2 \\times 2.5 \\approx 9.55 m^3$. Hoặc chính xác hơn: $V = 30 / \\pi \\approx 30 / 3.14 \\approx 9.55 m^3$.',
        },
        {
          content: 'Khoảng 28.66 $m^3$',
          is_correct: false,
          explaination:
            'Bạn đã tính thể tích hình trụ $V = \\pi r^2 h \\approx 28.66 m^3$.',
        },
        {
          content: 'Khoảng 15 $m^3$',
          is_correct: false,
          explaination: 'Bạn đã tính $\\frac{1}{2} C h = \\frac{1}{2} \\times 12 \\times 2.5 = 15$.',
        },
        {
          content: 'Khoảng 113.1 $m^3$',
          is_correct: false,
          explaination:
            'Bạn nhầm $r=6$ (thay vì $r=6/\\pi$). $V = \\frac{1}{3} \\pi (6^2) (2.5) = 30\\pi \\approx 94.2 m^3$. Tính toán sai.',
        },
      ],
    },

    // ========================================================
    // === CHƯƠNG 10 - §3. Hình cầu ===
    // ========================================================
    // --- Easy ---
    {
      content: 'Hình nào sau đây được tạo ra khi quay một nửa hình tròn một vòng quanh đường kính cố định của nó?',
      explaination:
        'Hãy nhớ lại định nghĩa về cách tạo ra một hình cầu.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Hình trụ.',
          is_correct: false,
          explaination: 'Hình trụ được tạo ra bằng cách quay một hình chữ nhật.',
        },
        {
          content: 'Hình nón.',
          is_correct: false,
          explaination: 'Hình nón được tạo ra bằng cách quay một hình tam giác vuông.',
        },
        {
          content: 'Hình cầu.',
          is_correct: true,
          explaination: 'Theo định nghĩa (Hình 22), khi quay nửa hình tròn tâm O bán kính R một vòng quanh đường kính AB, ta được một hình cầu.',
        },
        {
          content: 'Hình tròn.',
          is_correct: false,
          explaination: 'Hình tròn là hình phẳng, hình cầu là hình không gian.',
        },
      ],
    },
    {
      content: 'Khi cắt hình cầu bởi một mặt phẳng, mặt cắt thu được là hình gì?',
      explaination:
        'Hãy tưởng tượng bạn dùng một con dao phẳng cắt một quả cam (dạng hình cầu). Mặt cắt luôn là một hình tròn.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Hình tròn.',
          is_correct: true,
          explaination: 'Mọi mặt phẳng cắt hình cầu đều tạo ra một mặt cắt là hình tròn. Nếu mặt phẳng đi qua tâm, ta được hình tròn lớn (đường tròn lớn).',
        },
        {
          content: 'Hình elip.',
          is_correct: false,
          explaination: 'Mặt cắt hình elip xảy ra khi cắt hình nón hoặc hình trụ bởi một mặt phẳng xiên.',
        },
        {
          content: 'Một điểm.',
          is_correct: false,
          explaination: 'Điều này chỉ xảy ra nếu mặt phẳng tiếp xúc với hình cầu, không cắt qua hình cầu.',
        },
        {
          content: 'Hình vuông.',
          is_correct: false,
          explaination: 'Không thể tạo ra mặt cắt hình vuông từ hình cầu.',
        },
      ],
    },
    {
      content: 'Vật thể nào sau đây có dạng hình cầu?',
      explaination:
        'Hình cầu là một vật thể tròn đều trong không gian, giống như một quả bóng.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Một lon sữa đặc.',
          is_correct: false,
          explaination: 'Lon sữa đặc có dạng hình trụ.',
        },
        {
          content: 'Một chiếc nón lá.',
          is_correct: false,
          explaination: 'Chiếc nón lá có dạng hình nón.',
        },
        {
          content: 'Một viên bi.',
          is_correct: true,
          explaination: 'Viên bi là một ví dụ điển hình của vật thể có dạng hình cầu.',
        },
        {
          content: 'Một chiếc đĩa CD.',
          is_correct: false,
          explaination: 'Chiếc đĩa CD có dạng hình tròn (dẹt), không phải hình cầu (khối tròn).',
        },
      ],
    },
    // --- Medium ---
    {
      content: 'Công thức tính diện tích mặt cầu $S$ có bán kính $R$ là:',
      explaination:
        'Diện tích mặt cầu bằng 4 lần diện tích hình tròn lớn của nó. Diện tích hình tròn lớn là $\\pi R^2$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$S = \\pi R^2$',
          is_correct: false,
          explaination: 'Đây là công thức tính diện tích hình tròn, không phải diện tích mặt cầu.',
        },
        {
          content: '$S = \\frac{4}{3}\\pi R^3$',
          is_correct: false,
          explaination: 'Đây là công thức tính thể tích $V$ của hình cầu.',
        },
        {
          content: '$S = 4\\pi R^2$',
          is_correct: true,
          explaination: 'Công thức tính diện tích mặt cầu là $S = 4\\pi R^2$.',
        },
        {
          content: '$S = 2\\pi R^2$',
          is_correct: false,
          explaination: 'Đây là diện tích của hai mặt đáy hình trụ, hoặc diện tích mặt cầu nếu bạn nhầm lẫn hệ số 4.',
        },
      ],
    },
    {
      content: 'Công thức tính thể tích $V$ của hình cầu có bán kính $R$ là:',
      explaination:
        'Hãy nhớ công thức tính thể tích khối cầu, công thức này chứa $R^3$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$V = 4\\pi R^2$',
          is_correct: false,
          explaination: 'Đây là công thức tính diện tích mặt cầu $S$.',
        },
        {
          content: '$V = \\frac{4}{3}\\pi R^3$',
          is_correct: true,
          explaination: 'Công thức tính thể tích hình cầu là $V = \\frac{4}{3}\\pi R^3$.',
        },
        {
          content: '$V = \\pi R^2 h$',
          is_correct: false,
          explaination: 'Đây là công thức tính thể tích $V$ của hình trụ.',
        },
        {
          content: '$V = 4\\pi R^3$',
          is_correct: false,
          explaination: 'Bạn đã quên hệ số $\\frac{1}{3}$ trong công thức $\\frac{4}{3}\\pi R^3$.',
        },
      ],
    },
    {
      content: 'Tính diện tích mặt cầu của một quả bóng (Ví dụ 2) có đường kính 22 cm (lấy $\\pi \\approx 3,14$, làm tròn đến hàng phần mười).',
      explaination:
        'Đường kính $d = 22$ cm, vậy bán kính $R = 11$ cm. Áp dụng công thức $S = 4\\pi R^2$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$1519,8 cm^2$',
          is_correct: true,
          explaination: '$S = 4 \\times 3,14 \\times (11)^2 = 4 \\times 3,14 \\times 121 = 1519,76 cm^2$. Làm tròn đến hàng phần mười là $1519,8 cm^2$.',
        },
        {
          content: '$379,9 cm^2$',
          is_correct: false,
          explaination: 'Bạn có thể đã quên nhân với 4, đây là $\\pi R^2$.',
        },
        {
          content: '$6079,0 cm^2$',
          is_correct: false,
          explaination: 'Bạn có thể đã nhầm lẫn và sử dụng đường kính $d=22$ thay vì bán kính $R=11$ trong công thức: $4 \\times 3,14 \\times (22)^2$.',
        },
        {
          content: '$5572,5 cm^3$',
          is_correct: false,
          explaination: 'Đây là Thể tích $V = \\frac{4}{3}\\pi R^3$. Câu hỏi yêu cầu tính Diện tích $S$.',
        },
      ],
    },
    // --- Hard ---
    {
      content: 'Một vật thể hình cầu có thể tích là $36\\pi cm^3$. Bán kính $R$ của hình cầu đó là:',
      explaination:
        'Sử dụng công thức $V = \\frac{4}{3}\\pi R^3$. Thay $V = 36\\pi$ vào và giải phương trình tìm $R$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '9 cm',
          is_correct: false,
          explaination: 'Nếu $R=9$, $V = \\frac{4}{3}\\pi (9)^3 = 972\\pi cm^3$. Bạn có thể đã nhầm $36\\pi = 4\\pi R \\implies R=9$.',
        },
        {
          content: '3 cm',
          is_correct: true,
          explaination: 'Ta có $36\\pi = \\frac{4}{3}\\pi R^3$. Chia cả hai vế cho $\\pi$: $36 = \\frac{4}{3} R^3$. Suy ra $R^3 = 36 \\times \\frac{3}{4} = 9 \\times 3 = 27$. Vậy $R = \\sqrt[3]{27} = 3$ cm.',
        },
        {
          content: '27 cm',
          is_correct: false,
          explaination: 'Đây là giá trị của $R^3$, không phải $R$.',
        },
        {
          content: '6 cm',
          is_correct: false,
          explaination: 'Nếu $R=6$, $V = \\frac{4}{3}\\pi (6)^3 = 288\\pi cm^3$.',
        },
      ],
    },
    {
      content: 'Một hình cầu có diện tích mặt cầu là $100\\pi cm^2$. Thể tích $V$ của hình cầu đó là:',
      explaination:
        'Từ $S = 4\\pi R^2 = 100\\pi$, tìm $R$. Sau đó, dùng $R$ để tính $V = \\frac{4}{3}\\pi R^3$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$500\\pi cm^3$',
          is_correct: false,
          explaination: 'Sai. Đây là kết quả nếu $R^3=125$.',
        },
        {
          content: '$\\frac{500\\pi}{3} cm^3$',
          is_correct: true,
          explaination: 'Từ $S = 4\\pi R^2 = 100\\pi \\implies R^2 = 100/4 = 25 \\implies R = 5$ cm. Thay $R=5$ vào $V$: $V = \\frac{4}{3}\\pi (5)^3 = \\frac{4}{3}\\pi (125) = \\frac{500\\pi}{3} cm^3$.',
        },
        {
          content: '$100\\pi cm^3$',
          is_correct: false,
          explaination: 'Đây là diện tích mặt cầu S, không phải thể tích V.',
        },
        {
          content: '$\\frac{250\\pi}{3} cm^3$',
          is_correct: false,
          explaination: 'Bạn có thể đã nhầm lẫn khi tính $R^3$ hoặc hệ số $\\frac{4}{3}$.',
        },
      ],
    },
    {
      content: 'Một bể bơi hình bán cầu (Bài tập 4) có đường kính 10 m. Tính diện tích bề mặt (gồm cả mặt đáy hình tròn) và thể tích của bể bơi (lấy $\\pi \\approx 3,14$, làm tròn đến hàng phần trăm).',
      explaination:
        '$d=10$ m $\\implies R=5$ m. Bể bơi là NỬA hình cầu. $S_{bề mặt} = S_{mặt cong} + S_{đáy} = \\frac{1}{2}S_{mặt cầu} + S_{hình tròn} = \\frac{1}{2}(4\\pi R^2) + \\pi R^2 = 2\\pi R^2 + \\pi R^2 = 3\\pi R^2$. $V = \\frac{1}{2}V_{hình cầu} = \\frac{1}{2}(\\frac{4}{3}\\pi R^3) = \\frac{2}{3}\\pi R^3$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: cd_cat10_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$S = 157 m^2$; $V = 261,67 m^3$',
          is_correct: false,
          explaination: 'Bạn đã tính $S = \\frac{1}{2}S_{mặt cầu} = 2\\pi R^2$ (chỉ mặt cong, thiếu mặt đáy) và $V = \\frac{1}{2}V_{hình cầu}$.',
        },
        {
          content: '$S = 314 m^2$; $V = 523,33 m^3$',
          is_correct: false,
          explaination: 'Đây là diện tích $S$ và thể tích $V$ của CẢ HÌNH CẦU, không phải NỬA HÌNH CẦU.',
        },
        {
          content: '$S = 235,5 m^2$; $V = 261,67 m^3$',
          is_correct: true,
          explaination: '$R=5$m. Diện tích bề mặt $S = 3\\pi R^2 = 3 \\times 3,14 \\times (5)^2 = 3 \\times 3,14 \\times 25 = 235,5 m^2$. Thể tích $V = \\frac{2}{3}\\pi R^3 = \\frac{2}{3} \\times 3,14 \\times (5)^3 = \\frac{2}{3} \\times 3,14 \\times 125 \\approx 261,67 m^3$.',
        },
        {
          content: '$S = 235,5 m^2$; $V = 523,33 m^3$',
          is_correct: false,
          explaination: 'Diện tích $S$ đúng (cho bán cầu + đáy) nhưng thể tích $V$ sai (đây là $V$ của cả hình cầu).',
        },
      ],
    },







    // ========================================================
    //Chân trời sáng tạo - Toán 9
    // =======================================================================
    // === CHƯƠNG 1 (CTST) - §1. Phương trình quy về PT bậc nhất 1 ẩn ===
    // =======================================================================
    // --- Easy ---
    {
      content: 'Phương trình $(x+3)(2x-5)=0$ được gọi là gì?',
      explaination:
        'Phương trình này có dạng tích của hai biểu thức bậc nhất bằng 0.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Phương trình bậc hai',
          is_correct: false,
          explaination: 'Mặc dù khi nhân ra sẽ thành phương trình bậc hai, nhưng dạng $(...)(...)=0$ có tên gọi cụ thể.',
        },
        {
          content: 'Phương trình tích',
          is_correct: true,
          explaination: 'Một phương trình có dạng $A(x) \cdot B(x) = 0$ được gọi là phương trình tích.',
        },
        {
          content: 'Phương trình chứa ẩn ở mẫu',
          is_correct: false,
          explaination: 'Phương trình này không có ẩn số nào nằm ở mẫu thức.',
        },
        {
          content: 'Phương trình bậc nhất',
          is_correct: false,
          explaination: 'Phương trình bậc nhất chỉ có $x$ với số mũ cao nhất là 1.',
        },
      ],
    },
    {
      content: 'Giải phương trình $(x-7)(5x+4)=0$.',
      explaination:
        'Để giải phương trình tích $A \cdot B = 0$, ta giải $A=0$ hoặc $B=0$.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x = 7$ hoặc $x = \\frac{4}{5}$',
          is_correct: false,
          explaination: 'Sai dấu ở nghiệm thứ hai. $5x+4=0 \\implies 5x = -4 \\implies x = -4/5$.',
        },
        {
          content: '$x = -7$ hoặc $x = -\\frac{4}{5}$',
          is_correct: false,
          explaination: 'Sai dấu ở nghiệm thứ nhất. $x-7=0 \\implies x=7$.',
        },
        {
          content: '$x = 7$ hoặc $x = -\\frac{4}{5}$',
          is_correct: true,
          explaination: 'Ta giải $x-7=0 \\implies x=7$. Hoặc $5x+4=0 \\implies 5x=-4 \\implies x=-4/5$.',
        },
        {
          content: '$x = -7$ hoặc $x = \\frac{4}{5}$',
          is_correct: false,
          explaination: 'Sai dấu ở cả hai nghiệm.',
        },
      ],
    },
    {
      content: 'Điều kiện xác định của phương trình $\\frac{3}{3x-2}=\\frac{x}{x+2}-1$ là gì?',
      explaination:
        'Điều kiện xác định (ĐKXĐ) của phương trình chứa ẩn ở mẫu là điều kiện để *tất cả* các mẫu thức khác 0.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x \\ne \\frac{2}{3}$',
          is_correct: false,
          explaination: 'Chưa đủ. Điều kiện này chỉ đảm bảo mẫu $3x-2 \\ne 0$. Cần xét cả mẫu $x+2$.',
        },
        {
          content: '$x \\ne -2$',
          is_correct: false,
          explaination: 'Chưa đủ. Điều kiện này chỉ đảm bảo mẫu $x+2 \\ne 0$. Cần xét cả mẫu $3x-2$.',
        },
        {
          content: '$x \\ne \\frac{2}{3}$ và $x \\ne -2$',
          is_correct: true,
          explaination: 'Ta phải có $3x-2 \\ne 0 \\implies x \\ne 2/3$. Đồng thời $x+2 \\ne 0 \\implies x \\ne -2$.',
        },
        {
          content: '$x \\ne \\frac{3}{2}$ và $x \\ne 2$',
          is_correct: false,
          explaination: 'Tính toán sai điều kiện $3x-2 \\ne 0$.',
        },
      ],
    },
    // --- Medium ---
    {
      content: 'Giải phương trình $2x(x+6)+5(x+6)=0$.',
      explaination:
        'Ta thấy $(x+6)$ là nhân tử chung. Đặt nhân tử chung để đưa về phương trình tích.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x = -6$ hoặc $x = -\\frac{5}{2}$',
          is_correct: true,
          explaination: 'PT $\\iff (x+6)(2x+5) = 0$. Giải $x+6=0 \\implies x=-6$. Giải $2x+5=0 \\implies x=-5/2$.',
        },
        {
          content: '$x = 6$ hoặc $x = \\frac{5}{2}$',
          is_correct: false,
          explaination: 'Sai dấu của cả hai nghiệm.',
        },
        {
          content: '$x = -6$ hoặc $x = \\frac{5}{2}$',
          is_correct: false,
          explaination: 'Sai dấu của nghiệm $x=5/2$.',
        },
        {
          content: '$x = -\\frac{5}{2}$',
          is_correct: false,
          explaination: 'Thiếu nghiệm $x=-6$.',
        },
      ],
    },
    {
      content: 'Giải phương trình $\\frac{x+3}{x-3}+\\frac{x-2}{x}=2$.',
      explaination:
        'Cần tìm ĐKXĐ, quy đồng mẫu thức, khử mẫu để giải phương trình hệ quả, và cuối cùng đối chiếu nghiệm với ĐKXĐ.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x = \\frac{3}{2}$',
          is_correct: false,
          explaination: 'Kết quả giải phương trình hệ quả là $x = -3/2$.',
        },
        {
          content: '$x = -\\frac{3}{2}$',
          is_correct: true,
          explaination: 'ĐKXĐ: $x \\ne 3$ và $x \\ne 0$. Quy đồng: $x(x+3) + (x-2)(x-3) = 2x(x-3)$. Rút gọn: $x^2+3x + x^2-5x+6 = 2x^2-6x \\implies 2x^2-2x+6 = 2x^2-6x \\implies 4x = -6 \\implies x = -3/2$. Giá trị này thoả mãn ĐKXĐ.',
        },
        {
          content: '$x = 3$',
          is_correct: false,
          explaination: 'Giá trị $x=3$ không thoả mãn ĐKXĐ.',
        },
        {
          content: 'Phương trình vô nghiệm.',
          is_correct: false,
          explaination: 'Phương trình có nghiệm $x = -3/2$.',
        },
      ],
    },
    {
      content: 'Tìm nghiệm của phương trình $\\frac{3}{x-2}+\\frac{2}{x+1}=\\frac{2x+5}{(x-2)(x+1)}$.',
      explaination:
        'Cần tìm ĐKXĐ, quy đồng và khử mẫu. Cẩn thận với nghiệm không thoả mãn điều kiện xác định.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x = 2$',
          is_correct: false,
          explaination: '$x=2$ là nghiệm của phương trình hệ quả $3x=6$, nhưng nó vi phạm ĐKXĐ $x \\ne 2$.',
        },
        {
          content: '$x = -1$',
          is_correct: false,
          explaination: '$x=-1$ vi phạm ĐKXĐ $x \\ne -1$.',
        },
        {
          content: 'Phương trình vô nghiệm.',
          is_correct: true,
          explaination: 'ĐKXĐ: $x \\ne 2$ và $x \\ne -1$. Khử mẫu: $3(x+1) + 2(x-2) = 2x+5 \\implies 3x+3+2x-4 = 2x+5 \\implies 5x-1 = 2x+5 \\implies 3x = 6 \\implies x=2$. Vì $x=2$ không thoả mãn ĐKXĐ, nên phương trình đã cho vô nghiệm.',
        },
        {
          content: '$x = 6$',
          is_correct: false,
          explaination: 'Tính toán sai, $3x=6$ chứ không phải $x=6$.',
        },
      ],
    },
    {
      content: 'Các bước giải phương trình chứa ẩn ở mẫu bao gồm những gì? (Chọn nhiều đáp án)',
      explaination:
        'Giải phương trình chứa ẩn ở mẫu yêu cầu tuân thủ một quy trình 4 bước để đảm bảo tìm đúng nghiệm.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Bước 1: Tìm điều kiện xác định của phương trình.',
          is_correct: true,
          explaination: 'Đây là bước đầu tiên và bắt buộc, để loại bỏ các giá trị làm mẫu bằng 0.',
        },
        {
          content: 'Bước 2: Quy đồng mẫu thức hai vế, rồi khử mẫu.',
          is_correct: true,
          explaination: 'Bước này giúp đưa phương trình về dạng không còn mẫu thức (phương trình hệ quả).',
        },
        {
          content: 'Bước 3: Giải phương trình vừa nhận được (phương trình hệ quả).',
          is_correct: true,
          explaination: 'Đây là bước giải phương trình sau khi đã khử mẫu.',
        },
        {
          content: 'Bước 4: Đối chiếu nghiệm với ĐKXĐ và kết luận.',
          is_correct: true,
          explaination: 'Đây là bước quan trọng để loại bỏ các nghiệm ngoại lai (nghiệm vi phạm ĐKXĐ).',
        },
      ],
    },
    // --- Hard ---
    {
      content: 'Độ cao quả bóng gôn là $h=t(20-5t)$. Quả bóng chạm đất (độ cao $h=0$) vào những thời điểm nào?',
      explaination:
        '"Chạm đất" nghĩa là độ cao $h=0$. Ta cần giải phương trình tích $t(20-5t) = 0$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Chỉ tại $t = 4$ giây',
          is_correct: false,
          explaination: 'Thiếu nghiệm $t=0$. Phương trình tích có 2 nghiệm.',
        },
        {
          content: '$t = 0$ giây và $t = 4$ giây',
          is_correct: true,
          explaination: 'Giải $t(20-5t) = 0$, ta được $t=0$ (lúc bắt đầu đánh, $h=0$) hoặc $20-5t=0 \\implies 5t=20 \\implies t=4$ (lúc rơi chạm đất, $h=0$).',
        },
        {
          content: 'Chỉ tại $t = 0$ giây',
          is_correct: false,
          explaination: 'Đây mới là thời điểm ban đầu. Cần tìm cả thời điểm lúc rơi xuống.',
        },
        {
          content: '$t = 5$ giây',
          is_correct: false,
          explaination: 'Nếu $t=5$, $h = 5(20 - 5 \\times 5) = 5(-5) = -25$, không phải $h=0$.',
        },
      ],
    },
    {
      content: 'Một ô tô đi từ A đến B rồi quay về A hết 4 giờ 24 phút. Quãng đường AB là 120 km. Tốc độ về lớn hơn tốc độ đi 20%. Tốc độ lúc đi là:',
      explaination:
        'Gọi $v > 0$ (km/h) là tốc độ lúc đi. Tốc độ lúc về là $v \cdot (1 + 20/100) = 1.2v$. Đổi 4 giờ 24 phút = $4 + 24/60 = 4.4$ giờ. Lập phương trình tổng thời gian: $\\frac{120}{v} + \\frac{120}{1.2v} = 4.4$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s1.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '50 km/h',
          is_correct: true,
          explaination: 'Giải PT: $\\frac{120}{v} + \\frac{100}{v} = 4.4 \\implies \\frac{220}{v} = 4.4 \\implies v = \\frac{220}{4.4} = 50$. Tốc độ lúc đi là 50 km/h (ĐKXĐ $v>0$ được thoả mãn).',
        },
        {
          content: '60 km/h',
          is_correct: false,
          explaination: 'Đây là tốc độ lúc về ($1.2 \\times 50 = 60$).',
        },
        {
          content: '45 km/h',
          is_correct: false,
          explaination: 'Nếu $v=45$, $t = 120/45 + 120/(1.2 \\times 45) \\approx 2.67 + 2.22 = 4.89$ giờ, không phải 4.4 giờ.',
        },
        {
          content: '55 km/h',
          is_correct: false,
          explaination: 'Nếu $v=55$, $t = 120/55 + 120/(1.2 \\times 55) \\approx 2.18 + 1.82 = 4$ giờ, không phải 4.4 giờ.',
        },
      ],
    },

    // ===================================================================================
    // === CHƯƠNG 1 - §2. Phương trình bậc nhất hai ẩn và hệ hai phương trình bậc nhất hai ẩn ===
    // ===================================================================================
    // --- Easy ---
    {
      content:
        'Phương trình nào sau đây là phương trình bậc nhất hai ẩn $x$ và $y$?',
      explaination:
        'Phương trình bậc nhất hai ẩn $x, y$ có dạng $ax + by = c$, trong đó $a, b, c$ là các hệ số, và $a, b$ không đồng thời bằng 0.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s2.category_id, // Giả định ctst_cat1_s2 đã được định nghĩa
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$3x + 5y = -3$',
          is_correct: true,
          explaination:
            'Đây là phương trình bậc nhất hai ẩn với $a=3, b=5, c=-3$.',
        },
        {
          content: '$0x + 0y = 8$',
          is_correct: false,
          explaination:
            'Phương trình này có $a=0$ và $b=0$, vi phạm điều kiện $a, b$ không đồng thời bằng 0.',
        },
        {
          content: '$x^2 + 2x - 24 = 0$',
          is_correct: false,
          explaination: 'Đây là phương trình bậc hai một ẩn $x$.',
        },
        {
          content: '$x^3 + 5x - 6 = 0$',
          is_correct: false,
          explaination: 'Đây là phương trình bậc ba một ẩn $x$.',
        },
      ],
    },
    {
      content: 'Cặp số $(1; 2)$ là một nghiệm của phương trình nào sau đây?',
      explaination:
        'Để kiểm tra, ta thay $x=1$ và $y=2$ vào từng phương trình. Nếu ta được một đẳng thức đúng (ví dụ: $1=1$ hoặc $4=4$) thì cặp số đó là nghiệm.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$3x - y = 1$',
          is_correct: true,
          explaination:
            'Thay $x=1, y=2$ vào vế trái: $3(1) - 2 = 3 - 2 = 1$. Vế trái bằng vế phải (1 = 1), nên đây là nghiệm.',
        },
        {
          content: '$4x + 3y = 7$',
          is_correct: false,
          explaination:
            'Thay $x=1, y=2$ vào vế trái: $4(1) + 3(2) = 4 + 6 = 10$. Vế trái không bằng vế phải ($10 \\ne 7$).',
        },
        {
          content: '$x + 3y = -4$',
          is_correct: false,
          explaination:
            'Thay $x=1, y=2$ vào vế trái: $1 + 3(2) = 1 + 6 = 7$. Vế trái không bằng vế phải ($7 \\ne -4$).',
        },
        {
          content: '$3x - 4y = -1$',
          is_correct: false,
          explaination:
            'Thay $x=1, y=2$ vào vế trái: $3(1) - 4(2) = 3 - 8 = -5$. Vế trái không bằng vế phải ($-5 \\ne -1$).',
        },
      ],
    },
    {
      content:
        'Cặp số $(1; 2)$ là nghiệm của hệ phương trình nào sau đây?',
      explaination:
        'Một cặp số là nghiệm của hệ phương trình nếu nó là nghiệm của TẤT CẢ các phương trình trong hệ. Ta cần thay $x=1, y=2$ vào cả hai phương trình.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\begin{cases} 4x - y = 2 \\\\ x + 3y = 7 \\end{cases}$',
          is_correct: true,
          explaination:
            'Kiểm tra PT(1): $4(1) - 2 = 2$ (Đúng). Kiểm tra PT(2): $1 + 3(2) = 1 + 6 = 7$ (Đúng). Cặp số này thỏa mãn cả hai phương trình.',
        },
        {
          content: '$\\begin{cases} x - 2y = 3 \\\\ 2x + y = 4 \\end{cases}$',
          is_correct: false,
          explaination:
            'Kiểm tra PT(1): $1 - 2(2) = 1 - 4 = -3$. Vế trái không bằng vế phải ($-3 \\ne 3$).',
        },
        {
          content: '$\\begin{cases} 2x - y = -1 \\\\ x - 3y = 8 \\end{cases}$',
          is_correct: false,
          explaination:
            'Kiểm tra PT(1): $2(1) - 2 = 0$. Vế trái không bằng vế phải ($0 \\ne -1$).',
        },
        {
          content: '$\\begin{cases} x + 2y = 4 \\\\ 2x + y = -1 \\end{cases}$',
          is_correct: false,
          explaination:
            'Kiểm tra PT(1): $1 + 2(2) = 5$. Vế trái không bằng vế phải ($5 \\ne 4$).',
        },
      ],
    },
    // --- Medium ---
    {
      content:
        'Tập hợp các nghiệm của phương trình $0x - \\frac{3}{2}y = 6$ được biểu diễn bởi đường thẳng nào?',
      explaination:
        'Rút gọn phương trình: $0x - \\frac{3}{2}y = 6 \\implies -\\frac{3}{2}y = 6 \\implies y = 6 / (-\\frac{3}{2}) = 6 \\times (-\\frac{2}{3}) = -4$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Đường thẳng $y = -4$',
          is_correct: true,
          explaination:
            'Phương trình rút gọn thành $y = -4$. Đây là một đường thẳng song song với trục Ox và cắt trục Oy tại điểm (0; -4).',
        },
        {
          content: 'Đường thẳng $x = 0$',
          is_correct: false,
          explaination: 'Đường thẳng $x=0$ là trục Oy.',
        },
        {
          content: 'Đường thẳng $y = 6$',
          is_correct: false,
          explaination: 'Bạn quên chia cho hệ số $-\\frac{3}{2}$.',
        },
        {
          content: 'Đường thẳng $y = 2x + 3$',
          is_correct: false,
          explaination: 'Phương trình này không phụ thuộc vào $x$.',
        },
      ],
    },
    {
      content:
        'Một ô tô đi từ A đến B (210 km), cùng lúc đó xe máy đi từ B về A. Tốc độ ô tô là $x$ (km/h), tốc độ xe máy là $y$ (km/h). Biết hai xe gặp nhau sau 2 giờ. Phương trình nào biểu thị đúng sự kiện này?',
      explaination:
        'Khi hai xe đi ngược chiều và gặp nhau, tổng quãng đường hai xe đi được bằng khoảng cách AB. Quãng đường ô tô đi trong 2 giờ là $2x$. Quãng đường xe máy đi trong 2 giờ là $2y$.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x + y = 210$',
          is_correct: false,
          explaination: 'Đây là tổng tốc độ, không phải quãng đường.',
        },
        {
          content: '$2x + 2y = 210$',
          is_correct: true,
          explaination:
            'Quãng đường ô tô đi là $2x$. Quãng đường xe máy đi là $2y$. Tổng quãng đường là $2x + 2y = 210$.',
        },
        {
          content: '$x - y = 2$',
          is_correct: false,
          explaination: 'Sai logic.',
        },
        {
          content: '$2y - 2x = 210$',
          is_correct: false,
          explaination:
            'Đây là hiệu quãng đường. Phải là tổng quãng đường.',
        },
      ],
    },
    {
      content:
        'Phương trình bậc nhất hai ẩn $ax + by = c$ có đặc điểm gì về nghiệm? (Chọn các đáp án đúng)',
      explaination:
        'Phương trình bậc nhất hai ẩn (với $a, b$ không đồng thời bằng 0) luôn có vô số nghiệm. Tập hợp các nghiệm này tạo thành một đường thẳng trên mặt phẳng tọa độ.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Luôn có vô số nghiệm.',
          is_correct: true,
          explaination: 'Đây là tính chất cơ bản của phương trình bậc nhất hai ẩn.',
        },
        {
          content: 'Tập hợp nghiệm được biểu diễn bởi một đường thẳng.',
          is_correct: true,
          explaination:
            'Tập nghiệm (x, y) chính là các điểm nằm trên đường thẳng $ax+by=c$.',
        },
        {
          content: 'Chỉ có một nghiệm duy nhất.',
          is_correct: false,
          explaination: 'Sai. Phương trình bậc nhất một ẩn mới có 1 nghiệm duy nhất.',
        },
        {
          content: 'Luôn vô nghiệm.',
          is_correct: false,
          explaination: 'Sai. Chỉ phương trình $0x+0y=c$ (với $c \\ne 0$) mới vô nghiệm.',
        },
      ],
    },
    // --- Hard ---
    {
      content:
        'Xét bài toán cổ (trang 10): "Mỗi người năm trái thừa năm trái / Mỗi người sáu trái một người không". Gọi $x$ là số em nhỏ, $y$ là số trái hồng. Hệ phương trình nào mô tả đúng bài toán?',
      explaination:
        'PT(1): "Mỗi người 5 trái thừa 5 trái" $\\implies$ Số trái hồng $y = 5x + 5$. PT(2): "Mỗi người 6 trái một người không" $\\implies$ có $(x-1)$ người được 6 trái, 1 người 0 trái. $\\implies$ Số trái hồng $y = 6(x-1) + 0$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\begin{cases} y = 5x + 5 \\\\ y = 6(x - 1) \\end{cases}$',
          is_correct: true,
          explaination:
            'PT(1): $y$ (tổng số hồng) = $5x$ (chia cho x người) $+ 5$ (thừa 5). PT(2): $y$ (tổng số hồng) = $6(x-1)$ (chia cho $x-1$ người, 1 người 0 trái).',
        },
        {
          content: '$\\begin{cases} 5y = x + 5 \\\\ 6y = x - 1 \\end{cases}$',
          is_correct: false,
          explaination: 'Sai. $y$ là tổng số hồng, $x$ là số người.',
        },
        {
          content: '$\\begin{cases} y = 5x + 5 \\\\ y = 6x - 1 \\end{cases}$',
          is_correct: false,
          explaination:
            'Sai PT(2). "Một người không" nghĩa là chỉ có $(x-1)$ người nhận 6 trái.',
        },
        {
          content: '$\\begin{cases} y - 5x = 5 \\\\ y - 6x = 0 \\end{cases}$',
          is_correct: false,
          explaination: 'Sai PT(2). "Một người không" là $y = 6(x-1)$.',
        },
      ],
    },
    {
      content:
        'Cho phương trình $3x - y = 1$. Cặp số nào sau đây KHÔNG là nghiệm của phương trình?',
      explaination:
        'Ta thay lần lượt các cặp số (x; y) vào phương trình. Cặp số nào cho ra một đẳng thức SAI (ví dụ: $0=1$ hoặc $5 \\ne 1$) thì không phải là nghiệm.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '(1; 2)',
          is_correct: false,
          explaination:
            'Thay $x=1, y=2$: $3(1) - 2 = 1$. (Đúng). Đây là nghiệm.',
        },
        {
          content: '(0; -1)',
          is_correct: false,
          explaination:
            'Thay $x=0, y=-1$: $3(0) - (-1) = 1$. (Đúng). Đây là nghiệm.',
        },
        {
          content: '(1/3; 0)',
          is_correct: false,
          explaination:
            'Thay $x=1/3, y=0$: $3(1/3) - 0 = 1$. (Đúng). Đây là nghiệm.',
        },
        {
          content: '(1; -2)',
          is_correct: true,
          explaination:
            'Thay $x=1, y=-2$: $3(1) - (-2) = 3 + 2 = 5$. Vế trái không bằng vế phải ($5 \\ne 1$). Đây KHÔNG phải là nghiệm.',
        },
      ],
    },
    {
      content:
        'Một ô tô đi từ A đến B (cách nhau 210 km) với tốc độ $x$ (km/h). Cùng lúc đó, xe máy đi từ B về A với tốc độ $y$ (km/h). Biết tốc độ ô tô hơn xe máy 15 km/h và hai xe gặp nhau sau 2 giờ. Hệ phương trình nào mô tả đúng bài toán?',
      explaination:
        'PT(1): Tốc độ ô tô ($x$) hơn xe máy ($y$) 15 km/h $\\implies x - y = 15$. PT(2): Hai xe đi ngược chiều, gặp nhau sau 2h $\\implies$ Tổng quãng đường $2x + 2y = 210$.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s2.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\begin{cases} x - y = 15 \\\\ 2x + 2y = 210 \\end{cases}$',
          is_correct: true,
          explaination:
            'PT(1) $x-y=15$ biểu thị ô tô nhanh hơn xe máy 15 km/h. PT(2) $2x+2y=210$ biểu thị tổng quãng đường hai xe đi được sau 2 giờ bằng 210 km.',
        },
        {
          content: '$\\begin{cases} y - x = 15 \\\\ 2x + 2y = 210 \\end{cases}$',
          is_correct: false,
          explaination: 'Sai PT(1). $y-x=15$ nghĩa là xe máy nhanh hơn ô tô.',
        },
        {
          content: '$\\begin{cases} x - y = 15 \\\\ x + y = 210 \\end{cases}$',
          is_correct: false,
          explaination:
            'Sai PT(2). $x+y=105$ mới là tổng vận tốc. Tổng quãng đường phải là $2x+2y$.',
        },
        {
          content: '$\\begin{cases} x = y + 15 \\\\ 210/x = 210/y + 2 \\end{cases}$',
          is_correct: false,
          explaination:
            'Sai PT(2). Đây là bài toán đi ngược chiều, không phải đi cùng chiều và về sớm/muộn.',
        },
      ],
    },

    // ===========================================================================
    // === CHƯƠNG 1 (CTST) - §3. Giải hệ hai phương trình bậc nhất hai ẩn ===
    // ===========================================================================
    // --- Easy ---
    {
      content: 'Bước đầu tiên của việc giải hệ phương trình bằng phương pháp thế là gì?',
      explaination:
        'Phương pháp thế yêu cầu "thay thế" một ẩn bằng một biểu thức chứa ẩn còn lại.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Cộng hoặc trừ hai phương trình của hệ.',
          is_correct: false,
          explaination: 'Đây là bước của phương pháp cộng đại số, không phải phương pháp thế.',
        },
        {
          content: 'Từ một phương trình, biểu diễn ẩn này theo ẩn kia.',
          is_correct: true,
          explaination: 'Đây là Bước 1 của phương pháp thế. Ví dụ, từ $x - 2y = 1$, ta biểu diễn $x$ theo $y$ thành $x = 2y + 1$.',
        },
        {
          content: 'Nhân hai vế của một phương trình với một số.',
          is_correct: false,
          explaination: 'Đây là một bước có thể có trong phương pháp cộng đại số, không phải là bước đầu tiên của phương pháp thế.',
        },
        {
          content: 'Kiểm tra nghiệm bằng máy tính cầm tay.',
          is_correct: false,
          explaination: 'Đây là bước kiểm tra kết quả, không phải bước giải.',
        },
      ],
    },
    {
      content: 'Mục tiêu của phương pháp cộng đại số là gì?',
      explaination:
        'Phương pháp này cộng (hoặc trừ) hai phương trình với nhau để đạt được một mục đích cụ thể.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Làm cho hệ phương trình phức tạp hơn.',
          is_correct: false,
          explaination: 'Mục tiêu của mọi phương pháp giải là làm cho bài toán đơn giản hơn.',
        },
        {
          content: 'Biểu diễn ẩn này theo ẩn kia.',
          is_correct: false,
          explaination: 'Đây là mục tiêu của phương pháp thế.',
        },
        {
          content: 'Khử bớt một ẩn để được phương trình một ẩn.',
          is_correct: true,
          explaination: 'Bằng cách cộng hoặc trừ, ta làm cho hệ số của một ẩn (ví dụ $y$ và $-y$) triệt tiêu, chỉ còn lại phương trình chứa ẩn $x$.',
        },
        {
          content: 'Tìm ra $x=0$ và $y=0$.',
          is_correct: false,
          explaination: 'Đây chỉ là một nghiệm có thể có, không phải mục tiêu của phương pháp.',
        },
      ],
    },
    {
      content: 'Giải hệ phương trình $\\begin{cases}x = 3y + 1 \\\\ 2x + y = 9\\end{cases}$',
      explaination:
        'Phương trình đầu tiên đã biểu diễn $x$ theo $y$. Ta dùng phương pháp thế: thế $x = 3y+1$ vào phương trình thứ hai.',
      level: DifficultyLevel.easy,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x = 4, y = 1$',
          is_correct: true,
          explaination: 'Thế (1) vào (2): $2(3y+1) + y = 9 \\implies 6y+2+y=9 \\implies 7y=7 \\implies y=1$. Thay $y=1$ vào (1): $x = 3(1) + 1 = 4$.',
        },
        {
          content: '$x = 1, y = 4$',
          is_correct: false,
          explaination: 'Nhầm lẫn giá trị của $x$ và $y$.',
        },
        {
          content: '$x = 7, y = 2$',
          is_correct: false,
          explaination: 'Nếu $y=2$, $x = 3(2)+1 = 7$. Nhưng $2(7)+2 = 16$, không bằng 9. Sai.',
        },
        {
          content: '$x = -2, y = -1$',
          is_correct: false,
          explaination: 'Tính toán sai. $7y=7$ nên $y=1$.',
        },
      ],
    },
    // --- Medium ---
    {
      content: 'Giải hệ phương trình $\\begin{cases}2x-3y=-5 \\\\ x+3y=11\\end{cases}$',
      explaination:
        'Hệ số của $y$ là $-3y$ và $3y$ đối nhau, ta dùng phương pháp cộng đại số.',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x = 2, y = 3$',
          is_correct: true,
          explaination: 'Lấy (1) + (2) vế theo vế: $(2x-3y) + (x+3y) = -5 + 11 \\implies 3x = 6 \\implies x=2$. Thế $x=2$ vào (2): $2 + 3y = 11 \\implies 3y = 9 \\implies y=3$.',
        },
        {
          content: '$x = 3, y = 2$',
          is_correct: false,
          explaination: 'Nhầm lẫn giá trị $x$ và $y$.',
        },
        {
          content: '$x = -1, y = 1$',
          is_correct: false,
          explaination: 'Kiểm tra lại: $2(-1) - 3(1) = -5$ (Đúng). Nhưng $(-1) + 3(1) = 2$, không bằng 11. Sai.',
        },
        {
          content: '$x = 16, y = -5$',
          is_correct: false,
          explaination: 'Đây là kết quả nếu trừ hai vế, tính toán sai.',
        },
      ],
    },
    {
      content: 'Giải hệ phương trình $\\begin{cases}x-2y=4 \\\\ 2x-4y=1\\end{cases}$',
      explaination:
        'Sử dụng phương pháp thế. Từ (1) $\\implies x = 2y + 4$. Thế vào (2).',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$x = 4, y = 0$',
          is_correct: false,
          explaination: 'Cặp số này thỏa mãn (1) nhưng không thỏa mãn (2): $2(4) - 4(0) = 8 \\ne 1$.',
        },
        {
          content: 'Hệ phương trình có vô số nghiệm.',
          is_correct: false,
          explaination: 'Trường hợp vô số nghiệm xảy ra khi $0y = 0$.',
        },
        {
          content: 'Hệ phương trình vô nghiệm.',
          is_correct: true,
          explaination: 'Thế $x = 2y + 4$ vào (2): $2(2y+4) - 4y = 1 \\implies 4y + 8 - 4y = 1 \\implies 0y = -7$. Phương trình này vô nghiệm, do đó hệ vô nghiệm.',
        },
        {
          content: '$x = 2, y = -1$',
          is_correct: false,
          explaination: 'Cặp số này thỏa mãn (1) nhưng không thỏa mãn (2): $2(2) - 4(-1) = 8 \\ne 1$.',
        },
      ],
    },
    {
      content: 'Kết luận nào đúng cho hệ phương trình $\\begin{cases}3x+y=2 \\\\ 6x+2y=4\\end{cases}$?',
      explaination:
        'Ta có thể dùng phương pháp thế: $y = 2 - 3x$. Thế vào (2).',
      level: DifficultyLevel.medium,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Hệ có nghiệm duy nhất $x=0, y=2$.',
          is_correct: false,
          explaination: 'Cặp số (0, 2) thỏa mãn cả hai phương trình, nhưng đây không phải là nghiệm *duy nhất*.',
        },
        {
          content: 'Hệ phương trình vô nghiệm.',
          is_correct: false,
          explaination: 'Trường hợp vô nghiệm xảy ra khi $0x = k$ với $k \\ne 0$.',
        },
        {
          content: 'Hệ phương trình có vô số nghiệm.',
          is_correct: true,
          explaination: 'Thế $y = 2 - 3x$ vào (2): $6x + 2(2 - 3x) = 4 \\implies 6x + 4 - 6x = 4 \\implies 0x = 0$. Phương trình này nghiệm đúng với mọi $x$. Vậy hệ có vô số nghiệm dạng $\\begin{cases}x \\in \\mathbb{R} \\\\ y = 2 - 3x\\end{cases}$.',
        },
        {
          content: 'Hệ có nghiệm duy nhất $x=1, y=-1$.',
          is_correct: false,
          explaination: 'Cặp số (1, -1) thỏa mãn cả hai phương trình, nhưng đây không phải là nghiệm *duy nhất*.',
        },
      ],
    },
    {
      content: 'Các bước giải bài toán bằng cách lập hệ phương trình là gì? (Chọn nhiều đáp án)',
      explaination:
        'Đây là quy trình chuẩn để giải một bài toán thực tế bằng đại số.',
      level: DifficultyLevel.medium,
      type: QuestionType.multiple_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: 'Bước 1: Lập hệ phương trình.',
          is_correct: true,
          explaination: 'Bao gồm chọn ẩn, đặt điều kiện, và lập các phương trình từ giả thiết.',
        },
        {
          content: 'Bước 2: Giải hệ phương trình nhận được.',
          is_correct: true,
          explaination: 'Sử dụng các phương pháp như thế hoặc cộng đại số để tìm giá trị của các ẩn.',
        },
        {
          content: 'Bước 3: Kiểm tra nghiệm với điều kiện và trả lời bài toán.',
          is_correct: true,
          explaination: 'Kiểm tra xem nghiệm tìm được có hợp lý không (ví dụ: số người không thể âm) và trả lời câu hỏi của bài toán.',
        },
        {
          content: 'Bước 4: Vẽ đồ thị của hệ phương trình.',
          is_correct: false,
          explaination: 'Việc vẽ đồ thị là một phương pháp giải (phương pháp đồ thị), không phải là một bước bắt buộc trong quy trình giải chung.',
        },
      ],
    },
    // --- Hard ---
    {
      content: 'Bài toán mở đầu: Chị An mua 1,2kg thịt lợn và 0,7kg thịt bò hết 362 nghìn. Chị Ba mua 0,8kg lợn và 0,5kg bò hết 250 nghìn. Hệ phương trình nào mô tả đúng bài toán?',
      explaination:
        'Gọi $x$ là giá 1kg thịt lợn, $y$ là giá 1kg thịt bò (nghìn đồng). Lập hai phương trình dựa trên hóa đơn của chị An và chị Ba.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$\\begin{cases}1.2x + 0.7y = 362 \\\\ 0.8x + 0.5y = 250\\end{cases}$',
          is_correct: true,
          explaination: 'PT (1): 1,2kg lợn ($1.2x$) + 0,7kg bò ($0.7y$) = 362. PT (2): 0,8kg lợn ($0.8x$) + 0,5kg bò ($0.5y$) = 250.',
        },
        {
          content: '$\\begin{cases}1.2x + 0.8y = 362 \\\\ 0.7x + 0.5y = 250\\end{cases}$',
          is_correct: false,
          explaination: 'Sai. Phương trình đã trộn lẫn số liệu của chị An và chị Ba.',
        },
        {
          content: '$\\begin{cases}x + y = 362 \\\\ x + y = 250\\end{cases}$',
          is_correct: false,
          explaination: 'Sai. Đây là phương trình nếu coi $x$ và $y$ là tổng số kg thịt, không phải giá tiền.',
        },
        {
          content: '$\\begin{cases}0.7x + 1.2y = 362 \\\\ 0.5x + 0.8y = 250\\end{cases}$',
          is_correct: false,
          explaination: 'Sai. Đã gán nhầm $x$ cho thịt bò và $y$ cho thịt lợn.',
        },
      ],
    },
    {
      content: 'Tìm $a$ và $b$ để đồ thị hàm số $y=ax+b$ đi qua hai điểm $A(2; -2)$ và $B(-1; 3)$.',
      explaination:
        'Thay tọa độ điểm A vào hàm số ta được phương trình (1): $2a + b = -2$. Thay tọa độ điểm B vào ta được PT (2): $-a + b = 3$. Giải hệ hai phương trình này.',
      level: DifficultyLevel.hard,
      type: QuestionType.single_choice,
      status: QuestionStatus.public,
      category_id: ctst_cat1_s3.category_id,
      tutor_id: tutor.uid,
      answers: [
        {
          content: '$a = -\\frac{5}{3}, b = \\frac{4}{3}$',
          is_correct: true,
          explaination: 'Ta có hệ $\\begin{cases}2a+b=-2 \\\\ -a+b=3\\end{cases}$. Lấy (1) - (2): $3a = -5 \\implies a = -5/3$. Thế vào (2): $-(-5/3) + b = 3 \\implies 5/3 + b = 9/3 \\implies b = 4/3$.',
        },
        {
          content: '$a = 1, b = -4$',
          is_correct: false,
          explaination: 'Nếu $a=1, b=-4$, điểm A(2, -2) thỏa mãn: $1(2) - 4 = -2$. Nhưng điểm B(-1, 3) không thỏa: $1(-1) - 4 = -5 \\ne 3$.',
        },
        {
          content: '$a = 1, b = 1$',
          is_correct: false,
          explaination: 'Nếu $a=1, b=1$, điểm A(2, -2) không thỏa mãn: $1(2) + 1 = 3 \\ne -2$.',
        },
        {
          content: '$a = -\\frac{4}{3}, b = \\frac{5}{3}$',
          is_correct: false,
          explaination: 'Tính toán sai khi giải hệ. $3a = -5$, không phải $3a = -4$.',
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
