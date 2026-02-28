import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
require('dotenv').config()
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})
const prisma = new PrismaClient({adapter});

/**
 * Hàm trợ giúp để tạo category cha (Chương) và các category con (Bài)
 * @param bookId - ID của sách
 * @param chapterName - Tên của category cha (Chương)
 * @param lessonNames - Mảng chứa tên của các category con (Bài)
 */
async function createChapterAndLessons(
  bookId: string,
  chapterName: string,
  lessonNames: string[],
) {
  // 1. Xử lý Category Cha (Chương)
  // Thay thế upsert bằng findFirst + create/update
  let parentCategory = await prisma.categories.findFirst({
    where: { category_name: chapterName },
  });

  if (!parentCategory) {
    parentCategory = await prisma.categories.create({
      data: {
        category_name: chapterName,
        description: 'Chương trong sách',
        parent_id: null,
      },
    });
  } else {
    // Nếu đã tồn tại -> Update (nếu cần thiết, ở đây update mô tả cho đồng bộ)
    parentCategory = await prisma.categories.update({
      where: { category_id: parentCategory.category_id }, // Update theo ID là an toàn nhất
      data: {
        description: 'Chương trong sách',
        parent_id: null,
      },
    });
  }

  // 2. Tạo liên kết Structure (Sách - Chương)
  // Logic cũ của bạn dùng cate_id, hãy đảm bảo schema của bạn đúng tên trường này.
  // Nếu schema là category_id, hãy sửa lại ở đây. Tôi giữ nguyên logic tìm kiếm an toàn.
  const CateInPlan = await prisma.structure.findFirst({
    where: {
      plan_id: bookId,
      // Sử dụng relation filter để an toàn hơn nếu tên cột thay đổi
      Category: { category_id: parentCategory.category_id },
    },
  });

  if (!CateInPlan) {
    await prisma.structure.create({
      data: {
        Category: { connect: { category_id: parentCategory.category_id } },
        Plan: { connect: { plan_id: bookId } },
      },
    });
  }

  console.log(`  Tạo/cập nhật Chương: ${parentCategory.category_name}`);

  // 3. Xử lý Categories Con (Bài học)
  const lessonPromises = lessonNames.map(async (lessonName) => {
    // Tìm xem bài học đã tồn tại chưa
    let lesson = await prisma.categories.findFirst({
      where: { category_name: lessonName },
    });

    if (!lesson) {
      // Chưa có -> Tạo mới và gán cha
      return prisma.categories.create({
        data: {
          category_name: lessonName,
          description: chapterName,
          parent_id: parentCategory.category_id,
        },
      });
    } else {
      // Đã có -> Cập nhật cha (để đảm bảo cấu trúc cây đúng)
      return prisma.categories.update({
        where: { category_id: lesson.category_id },
        data: {
          parent_id: parentCategory.category_id,
          description: chapterName,
        },
      });
    }
  });

  await Promise.all(lessonPromises);
  console.log(`    -> Đã tạo/cập nhật ${lessonNames.length} bài học con.`);
}

async function main() {
  console.log(`Bắt đầu seeding Books...`);

  // ======================================================
  // 1. TẠO BOOKS
  // (Phần này vẫn dùng upsert được nếu Title của Book là Unique trong Schema.
  // Nếu Title Book cũng không Unique, bạn cần sửa tương tự như trên.
  // Giả định Title Book vẫn Unique hoặc bạn muốn giữ logic này)
  // ======================================================

  //Book: Toán 9 - Cánh Diều
  let bookCD = await prisma.lesson_Plan.findFirst({
    where: { title: 'Toán 9 - Cánh Diều' },
  });

  if (!bookCD) {
    bookCD = await prisma.lesson_Plan.create({
      data: {
        title: 'Toán 9 - Cánh Diều',
        subject: 'Toán',
        type: 'book',
        grade: 9,
        description: 'Sách giáo khoa Toán lớp 9 - Bộ sách Cánh Diều',
      },
    });
  }
  console.log(`Đã tạo/cập nhật Book: ${bookCD.title}`);

  //Book: Toán 9 - Chân trời sáng tạo
  let bookCTST = await prisma.lesson_Plan.findFirst({
    where: { title: 'Toán 9 - Chân Trời Sáng Tạo' },
  });

  if (!bookCTST) {
    bookCTST = await prisma.lesson_Plan.create({
      data: {
        title: 'Toán 9 - Chân Trời Sáng Tạo',
        subject: 'Toán',
        type: 'book',
        grade: 9,
        description: 'Sách giáo khoa Toán lớp 9 - Bộ sách Chân Trời Sáng Tạo',
      },
    });
  }
  console.log(`Đã tạo/cập nhật Book: ${bookCTST.title}`);

  //Book: Toán 9 - Kết nối tri thức với cuộc sống
  let bookKNTT = await prisma.lesson_Plan.findFirst({
    where: { title: 'Toán 9 - Kết Nối Tri Thức Với Cuộc Sống' },
  });

  if (!bookKNTT) {
    bookKNTT = await prisma.lesson_Plan.create({
      data: {
        title: 'Toán 9 - Kết Nối Tri Thức Với Cuộc Sống',
        subject: 'Toán',
        type: 'book',
        grade: 9,
        description:
          'Sách giáo khoa Toán lớp 9 - Bộ sách Kết Nối Tri Thức Với Cuộc Sống',
      },
    });
  }
  console.log(`Đã tạo/cập nhật Book: ${bookKNTT.title}`);

  console.log(`\nBắt đầu seeding Categories (Cha-Con)...`);

  // ======================================================
  // 2. TẠO CATEGORIES (CHA-CON) CHO SÁCH CÁNH DIỀU
  // ======================================================
  console.log('\n--- Đang seed Sách Cánh Diều ---');
  await createChapterAndLessons(
    bookCD.plan_id,
    'Chương I: Phương trình và hệ phương trình bậc nhất',
    [
      '§1. Phương trình quy về phương trình bậc nhất một ẩn',
      '§2. Phương trình bậc nhất hai ẩn. Hệ hai phương trình bậc nhất hai ẩn',
      '§3. Giải hệ hai phương trình bậc nhất hai ẩn',
    ],
  );

  await createChapterAndLessons(
    bookCD.plan_id,
    'Chương II: Bất đẳng thức. Bất phương trình bậc nhất một ẩn',
    ['§1. Bất đẳng thức', '§2. Bất phương trình bậc nhất một ẩn'],
  );

  await createChapterAndLessons(bookCD.plan_id, 'Chương III: Căn thức', [
    '§1. Căn bậc hai và căn bậc ba của số thực',
    '§2. Một số phép tính về căn bậc hai của số thực',
    '§3. Căn thức bậc hai và căn thức bậc ba của biểu thức đại số',
    '§4. Một số phép biến đổi căn thức bậc hai của biểu thức đại số',
  ]);

  await createChapterAndLessons(
    bookCD.plan_id,
    'Chương IV: Hệ thức lượng trong tam giác vuông',
    [
      '§1. Tỉ số lượng giác của góc nhọn',
      '§2. Một số hệ thức về cạnh và góc trong tam giác vuông',
      '§3. Ứng dụng của tỉ số lượng giác của góc nhọn',
    ],
  );

  await createChapterAndLessons(bookCD.plan_id, 'Chương V: Đường tròn', [
    '§1. Đường tròn. Vị trí tương đối của hai đường tròn',
    '§2. Vị trí tương đối của đường thẳng và đường tròn',
    '§3. Tiếp tuyến của đường tròn',
    '§4. Góc ở tâm. Góc nội tiếp',
    '§5. Độ dài cung tròn, diện tích hình quạt tròn, diện tích hình vành khuyên',
  ]);

  await createChapterAndLessons(
    bookCD.plan_id,
    'Chương VI: Một số yếu tố thống kê và xác suất',
    [
      '§1. Mô tả và biểu diễn dữ liệu trên các bảng, biểu đồ',
      '§2. Tần số. Tần số tương đối',
      '§3. Tần số ghép nhóm. Tần số tương đối ghép nhóm',
      '§4. Phép thử ngẫu nhiên và không gian mẫu. Xác suất của biến cố',
    ],
  );

  await createChapterAndLessons(
    bookCD.plan_id,
    'Chương VII: Hàm số y = ax^2 (a \\ne 0). Phương trình bậc hai một ẩn',
    [
      '§1. Hàm số y = ax^2 (a \\ne 0)',
      '§2. Phương trình bậc hai một ẩn',
      '§3. Định lí Viète',
    ],
  );

  await createChapterAndLessons(
    bookCD.plan_id,
    'Chương VIII: Đường tròn ngoại tiếp và đường tròn nội tiếp',
    [
      '§1. Đường tròn ngoại tiếp tam giác. Đường tròn nội tiếp tam giác',
      '§2. Tứ giác nội tiếp đường tròn',
    ],
  );

  await createChapterAndLessons(bookCD.plan_id, 'Chương IX: Đa giác đều', [
    '§1. Đa giác đều. Hình đa giác đều trong thực tiễn',
    '§2. Phép quay',
  ]);

  await createChapterAndLessons(
    bookCD.plan_id,
    'Chương X: Hình học trực quan',
    ['§1. Hình trụ', '§2. Hình nón', '§3. Hình cầu'],
  );

  // ======================================================
  // 3. TẠO CATEGORIES (CHA-CON) CHO SÁCH CHÂN TRỜI SÁNG TẠO
  // ======================================================
  console.log('\n--- Đang seed Sách Chân Trời Sáng Tạo ---');
  await createChapterAndLessons(
    bookCTST.plan_id,
    'Chương 1: PHƯƠNG TRÌNH VÀ HỆ PHƯƠNG TRÌNH',
    [
      'Bài 1. Phương trình quy về phương trình bậc nhất một ẩn',
      'Bài 2. Phương trình bậc nhất hai ẩn và hệ hai phương trình bậc nhất hai ẩn',
      'Bài 3. Giải hệ hai phương trình bậc nhất hai ẩn',
    ],
  );

  await createChapterAndLessons(
    bookCTST.plan_id,
    'Chương 2: BẤT ĐẲNG THỨC. BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN',
    ['Bài 1. Bất đẳng thức', 'Bài 2. Bất phương trình bậc nhất một ẩn'],
  );

  await createChapterAndLessons(bookCTST.plan_id, 'Chương 3: CĂN THỨC', [
    'Bài 1. Căn bậc hai',
    'Bài 2. Căn bậc ba',
    'Bài 3. Tính chất của phép khai phương',
    'Bài 4. Biến đổi đơn giản biểu thức chứa căn thức bậc hai',
  ]);

  await createChapterAndLessons(
    bookCTST.plan_id,
    'Chương 4: HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG',
    [
      'Bài 1. Tỉ số lượng giác của góc nhọn',
      'Bài 2. Hệ thức giữa cạnh và góc của tam giác vuông',
    ],
  );

  await createChapterAndLessons(bookCTST.plan_id, 'Chương 5: ĐƯỜNG TRÒN', [
    'Bài 1. Đường tròn',
    'Bài 2. Tiếp tuyến của đường tròn',
    'Bài 3. Góc ở tâm, góc nội tiếp',
    'Bài 4. Hình quạt tròn và hình vành khuyên',
  ]);

  await createChapterAndLessons(
    bookCTST.plan_id,
    'Chương 6: HÀM SỐ y = ax^2 (a ≠ 0) VÀ PHƯƠNG TRÌNH BẬC HAI MỘT ẨN',
    [
      'Bài 1. Hàm số và đồ thị của hàm số y = ax^2 (a ≠ 0)',
      'Bài 2. Phương trình bậc hai một ẩn',
      'Bài 3. Định lí Viète',
    ],
  );

  await createChapterAndLessons(
    bookCTST.plan_id,
    'Chương 7: MỘT SỐ YẾU TỐ THỐNG KÊ',
    [
      'Bài 1. Bảng tần số và biểu đồ tần số',
      'Bài 2. Bảng tần số tương đối và biểu đồ tần số tương đối',
      'Bài 3. Biểu diễn số liệu ghép nhóm',
    ],
  );

  await createChapterAndLessons(
    bookCTST.plan_id,
    'Chương 8: MỘT SỐ YẾU TỐ XÁC SUẤT',
    ['Bài 1. Không gian mẫu và biến cố', 'Bài 2. Xác suất của biến cố'],
  );

  await createChapterAndLessons(
    bookCTST.plan_id,
    'Chương 9: TỨ GIÁC NỘI TIẾP. ĐA GIÁC ĐỀU',
    [
      'Bài 1. Đường tròn ngoại tiếp tam giác. Đường tròn nội tiếp tam giác',
      'Bài 2. Tứ giác nội tiếp',
      'Bài 3. Đa giác đều và phép quay',
    ],
  );

  await createChapterAndLessons(
    bookCTST.plan_id,
    'Chương 10: CÁC HÌNH KHỐI TRONG THỰC TIỄN',
    ['Bài 1. Hình trụ', 'Bài 2. Hình nón', 'Bài 3. Hình cầu'],
  );

  // ======================================================
  // 4. TẠO CATEGORIES (CHA-CON) CHO SÁCH KẾT NỐI TRI THỨC
  // ======================================================
  console.log('\n--- Đang seed Sách Kết Nối Tri Thức ---');

  await createChapterAndLessons(
    bookKNTT.plan_id,
    'Chương 1. PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    [
      'Bài 1. Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn',
      'Bài 2. Giải hệ hai phương trình bậc nhất hai ẩn',
      'Bài 3. Giải bài toán bằng cách lập hệ phương trình',
    ],
  );

  await createChapterAndLessons(
    bookKNTT.plan_id,
    'Chương II. PHƯƠNG TRÌNH VÀ BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN',
    [
      'Bài 4. Phương trình quy về phương trình bậc nhất một ẩn',
      'Bài 5. Bất đẳng thức và tính chất',
      'Bài 6. Bất phương trình bậc nhất một ẩn',
    ],
  );

  await createChapterAndLessons(
    bookKNTT.plan_id,
    'Chương III. CĂN BẬC HAI VÀ CĂN BẬC BA',
    [
      'Bài 7. Căn bậc hai và căn thức bậc hai',
      'Bài 8. Khai căn bậc hai với phép nhân và phép chia',
      'Bài 9. Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai',
      'Bài 10. Căn bậc ba và căn thức bậc ba',
    ],
  );

  await createChapterAndLessons(
    bookKNTT.plan_id,
    'Chương IV. HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG',
    [
      'Bài 11. Tỉ số lượng giác của góc nhọn',
      'Bài 12. Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng',
    ],
  );

  await createChapterAndLessons(bookKNTT.plan_id, 'Chương V. ĐƯỜNG TRÒN', [
    'Bài 13. Mở đầu về đường tròn',
    'Bài 14. Cung và dây của một đường tròn',
    'Bài 15. Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên',
    'Bài 16. Vị trí tương đối của đường thẳng và đường tròn',
    'Bài 17. Vị trí tương đối của hai đường tròn',
  ]);

  await createChapterAndLessons(
    bookKNTT.plan_id,
    'Chương VI. HÀM SỐ y = ax^2 (a ≠ 0). PHƯƠNG TRÌNH BẬC HAI MỘT ẨN',
    [
      'Bài 18. Hàm số y = ax^2 (a ≠ 0)',
      'Bài 19. Phương trình bậc hai một ẩn',
      'Bài 20. Định lí Viète và ứng dụng',
      'Bài 21. Giải bài toán bằng cách lập phương trình',
    ],
  );

  await createChapterAndLessons(
    bookKNTT.plan_id,
    'Chương VII. TẦN SỐ VÀ TẦN SỐ TƯƠNG ĐỐI',
    [
      'Bài 22. Bảng tần số và biểu đồ tần số',
      'Bài 23. Bảng tần số tương đối và biểu đồ tần số tương đối',
      'Bài 24. Bảng tần số, tần số tương đối ghép nhóm và biểu đồ',
    ],
  );

  await createChapterAndLessons(
    bookKNTT.plan_id,
    'Chương VIII. XÁC SUẤT CỦA BIẾN CỐ TRONG MỘT SỐ MÔ HÌNH XÁC SUẤT ĐƠN GIẢN',
    [
      'Bài 25. Phép thử ngẫu nhiên và không gian mẫu',
      'Bài 26. Xác suất của biến cố liên quan tới phép thử',
    ],
  );

  await createChapterAndLessons(
    bookKNTT.plan_id,
    'Chương IX. ĐƯỜNG TRÒN NGOẠI TIẾP VÀ ĐƯỜNG TRÒN NỘI TIẾP',
    [
      'Bài 27. Góc nội tiếp',
      'Bài 28. Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác',
      'Bài 29. Tứ giác nội tiếp',
      'Bài 30. Đa giác đều',
    ],
  );

  await createChapterAndLessons(
    bookKNTT.plan_id,
    'Chương X. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN',
    ['Bài 31. Hình trụ và hình nón', 'Bài 32. Hình cầu'],
  );

  console.log(`\n🎉 Seeding Books và Categories hoàn tất.`);
}

main()
  .catch((e) => {
    console.error('Lỗi seeding Books/Categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
