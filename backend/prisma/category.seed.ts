import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Bắt đầu seeding Books và Categories cho Toán 9...`);


  //Book: Toán 9 - Cánh Diều
  const bookCD = await prisma.books.upsert({
    where: { title: "Toán 9 - Cánh Diều" },
    update: {}, 
    create: {
      title: "Toán 9 - Cánh Diều",
      subject: "Toán",
      grade: 9,
      description: "Sách giáo khoa Toán lớp 9 - Bộ sách Cánh Diều", 
    },
  });
  console.log(`Đã tạo/cập nhật Book: ${bookCD.title}`);

  //Book: Toán 9 - Chân trời sáng tạo
  const bookCTST = await prisma.books.upsert({
    where: { title: "Toán 9 - Chân Trời Sáng Tạo" },
    update: {}, 
    create: {
      title: "Toán 9 - Chân Trời Sáng Tạo",
      subject: "Toán",
      grade: 9,
      description: "Sách giáo khoa Toán lớp 9 - Bộ sách Chân Trời Sáng Tạo", 
    },
  });
  console.log(`Đã tạo/cập nhật Book: ${bookCTST.title}`);

  //Book: Toán 9 - Kết nối tri thức với cuộc sống
  const bookKNTT = await prisma.books.upsert({
    where: { title: "Toán 9 - Kết Nối Tri Thức Với Cuộc Sống" },
    update: {}, 
    create: {
      title: "Toán 9 - Kết Nối Tri Thức Với Cuộc Sống",
      subject: "Toán",
      grade: 9,
      description: "Sách giáo khoa Toán lớp 9 - Bộ sách Kết Nối Tri Thức Với Cuộc Sống", 
    },
  });
  console.log(`Đã tạo/cập nhật Book: ${bookKNTT.title}`);

 const categoriesData = [
    // === CÁNH DIỀU ===
    // === CHƯƠNG I: PHƯƠNG TRÌNH VÀ HỆ PHƯƠNG TRÌNH BẬC NHẤT ===
    {
      category_name: '§1. Phương trình quy về phương trình bậc nhất một ẩn',
      description: 'Chương I: Phương trình và hệ phương trình bậc nhất',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§2. Phương trình bậc nhất hai ẩn. Hệ hai phương trình bậc nhất hai ẩn',
      description: 'Chương I: Phương trình và hệ phương trình bậc nhất',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§3. Giải hệ hai phương trình bậc nhất hai ẩn',
      description: 'Chương I: Phương trình và hệ phương trình bậc nhất',
      book_id: bookCD.book_id,
    },
    
    // === CHƯƠNG II: BẤT ĐẲNG THỨC. BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN ===
    {
      category_name: '§1. Bất đẳng thức',
      description: 'Chương II: Bất đẳng thức. Bất phương trình bậc nhất một ẩn',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§2. Bất phương trình bậc nhất một ẩn',
      description: 'Chương II: Bất đẳng thức. Bất phương trình bậc nhất một ẩn',
      book_id: bookCD.book_id,
    },
  
    // === CHƯƠNG III: CĂN THỨC ===
    {
      category_name: '§1. Căn bậc hai và căn bậc ba của số thực',
      description: 'Chương III: Căn thức',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§2. Một số phép tính về căn bậc hai của số thực',
      description: 'Chương III: Căn thức',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§3. Căn thức bậc hai và căn thức bậc ba của biểu thức đại số',
      description: 'Chương III: Căn thức',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§4. Một số phép biến đổi căn thức bậc hai của biểu thức đại số',
      description: 'Chương III: Căn thức',
      book_id: bookCD.book_id,
    },

    // === CHƯƠNG IV: HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG ===
    {
      category_name: '§1. Tỉ số lượng giác của góc nhọn',
      description: 'Chương IV: Hệ thức lượng trong tam giác vuông',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§2. Một số hệ thức về cạnh và góc trong tam giác vuông',
      description: 'Chương IV: Hệ thức lượng trong tam giác vuông',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§3. Ứng dụng của tỉ số lượng giác của góc nhọn',
      description: 'Chương IV: Hệ thức lượng trong tam giác vuông',
      book_id: bookCD.book_id,
    },

    // === CHƯƠNG V: ĐƯỜNG TRÒN ===
    {
      category_name: '§1. Đường tròn. Vị trí tương đối của hai đường tròn',
      description: 'Chương V: Đường tròn',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§2. Vị trí tương đối của đường thẳng và đường tròn',
      description: 'Chương V: Đường tròn',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§3. Tiếp tuyến của đường tròn',
      description: 'Chương V: Đường tròn',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§4. Góc ở tâm. Góc nội tiếp',
      description: 'Chương V: Đường tròn',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§5. Độ dài cung tròn, diện tích hình quạt tròn, diện tích hình vành khuyên',
      description: 'Chương V: Đường tròn',
      book_id: bookCD.book_id,
    },

    // === CHƯƠNG VI: MỘT SỐ YẾU TỐ THỐNG KÊ VÀ XÁC SUẤT ===
    {
      category_name: '§1. Mô tả và biểu diễn dữ liệu trên các bảng, biểu đồ',
      description: 'Chương VI: Một số yếu tố thống kê và xác suất',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§2. Tần số. Tần số tương đối',
      description: 'Chương VI: Một số yếu tố thống kê và xác suất',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§3. Tần số ghép nhóm. Tần số tương đối ghép nhóm',
      description: 'Chương VI: Một số yếu tố thống kê và xác suất',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§4. Phép thử ngẫu nhiên và không gian mẫu. Xác suất của biến cố',
      description: 'Chương VI: Một số yếu tố thống kê và xác suất',
      book_id: bookCD.book_id,
    },
  
    // === CHƯƠNG VII: HÀM SỐ y = ax^2 (a != 0). PHƯƠNG TRÌNH BẬC HAI MỘT ẨN ===
    {
      category_name: '§1. Hàm số y = ax^2 (a \\ne 0)',
      description: 'Chương VII: Hàm số y = ax^2 (a \\ne 0). Phương trình bậc hai một ẩn',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§2. Phương trình bậc hai một ẩn',
      description: 'Chương VII: Hàm số y = ax^2 (a \\ne 0). Phương trình bậc hai một ẩn',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§3. Định lí Viète',
      description: 'Chương VII: Hàm số y = ax^2 (a \\ne 0). Phương trình bậc hai một ẩn',
      book_id: bookCD.book_id,
    },
  
    // === CHƯƠNG VIII: ĐƯỜNG TRÒN NGOẠI TIẾP VÀ ĐƯỜNG TRÒN NỘI TIẾP ===
    {
      category_name: '§1. Đường tròn ngoại tiếp tam giác. Đường tròn nội tiếp tam giác',
      description: 'Chương VIII: Đường tròn ngoại tiếp và đường tròn nội tiếp',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§2. Tứ giác nội tiếp đường tròn',
      description: 'Chương VIII: Đường tròn ngoại tiếp và đường tròn nội tiếp',
      book_id: bookCD.book_id,
    },
  
    // === CHƯƠNG IX: ĐA GIÁC ĐỀU ===
    {
      category_name: '§1. Đa giác đều. Hình đa giác đều trong thực tiễn',
      description: 'Chương IX: Đa giác đều',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§2. Phép quay',
      description: 'Chương IX: Đa giác đều',
      book_id: bookCD.book_id,
    },
  
    // === CHƯƠNG X: HÌNH HỌC TRỰC QUAN ===
    {
      category_name: '§1. Hình trụ',
      description: 'Chương X: Hình học trực quan',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§2. Hình nón',
      description: 'Chương X: Hình học trực quan',
      book_id: bookCD.book_id,
    },
    {
      category_name: '§3. Hình cầu',
      description: 'Chương X: Hình học trực quan',
      book_id: bookCD.book_id,
    },

    // ======================================================
  // === SÁCH CHÂN TRỜI SÁNG TẠO - TẬP 1 ===
  // ======================================================
    // --- Chương 1 ---
    {
      category_name: 'Bài 1. Phương trình quy về phương trình bậc nhất một ẩn',
      description: 'Chương 1: PHƯƠNG TRÌNH VÀ HỆ PHƯƠNG TRÌNH',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 2. Phương trình bậc nhất hai ẩn và hệ hai phương trình bậc nhất hai ẩn',
      description: 'Chương 1: PHƯƠNG TRÌNH VÀ HỆ PHƯƠNG TRÌNH',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 3. Giải hệ hai phương trình bậc nhất hai ẩn',
      description: 'Chương 1: PHƯƠNG TRÌNH VÀ HỆ PHƯƠNG TRÌNH',
      book_id: bookCTST.book_id,
    },
    // --- Chương 2 ---
    {
      category_name: 'Bài 1. Bất đẳng thức',
      description: 'Chương 2: BẤT ĐẲNG THỨC. BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 2. Bất phương trình bậc nhất một ẩn',
      description: 'Chương 2: BẤT ĐẲNG THỨC. BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN',
      book_id: bookCTST.book_id,
    },
    // --- Chương 3 ---
    {
      category_name: 'Bài 1. Căn bậc hai',
      description: 'Chương 3: CĂN THỨC',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 2. Căn bậc ba',
      description: 'Chương 3: CĂN THỨC',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 3. Tính chất của phép khai phương',
      description: 'Chương 3: CĂN THỨC',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 4. Biến đổi đơn giản biểu thức chứa căn thức bậc hai',
      description: 'Chương 3: CĂN THỨC',
      book_id: bookCTST.book_id,
    },
    // --- Chương 4 ---
    {
      category_name: 'Bài 1. Tỉ số lượng giác của góc nhọn',
      description: 'Chương 4: HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 2. Hệ thức giữa cạnh và góc của tam giác vuông',
      description: 'Chương 4: HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG',
      book_id: bookCTST.book_id,
    },
    // --- Chương 5 ---
    {
      category_name: 'Bài 1. Đường tròn',
      description: 'Chương 5: ĐƯỜNG TRÒN',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 2. Tiếp tuyến của đường tròn',
      description: 'Chương 5: ĐƯỜNG TRÒN',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 3. Góc ở tâm, góc nội tiếp',
      description: 'Chương 5: ĐƯỜNG TRÒN',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 4. Hình quạt tròn và hình vành khuyên',
      description: 'Chương 5: ĐƯỜNG TRÒN',
      book_id: bookCTST.book_id,
    },

    // --- Chương 6 ---
    {
      category_name: 'Bài 1. Hàm số và đồ thị của hàm số y = ax^2 (a ≠ 0)',
      description: 'Chương 6: HÀM SỐ y = ax^2 (a ≠ 0) VÀ PHƯƠNG TRÌNH BẬC HAI MỘT ẨN',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 2. Phương trình bậc hai một ẩn',
      description: 'Chương 6: HÀM SỐ y = ax^2 (a ≠ 0) VÀ PHƯƠNG TRÌNH BẬC HAI MỘT ẨN',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 3. Định lí Viète',
      description: 'Chương 6: HÀM SỐ y = ax^2 (a ≠ 0) VÀ PHƯƠNG TRÌNH BẬC HAI MỘT ẨN',
      book_id: bookCTST.book_id,
    },
    // --- Chương 7 ---
    {
      category_name: 'Bài 1. Bảng tần số và biểu đồ tần số',
      description: 'Chương 7: MỘT SỐ YẾU TỐ THỐNG KÊ',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 2. Bảng tần số tương đối và biểu đồ tần số tương đối',
      description: 'Chương 7: MỘT SỐ YẾU TỐ THỐNG KÊ',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 3. Biểu diễn số liệu ghép nhóm',
      description: 'Chương 7: MỘT SỐ YẾU TỐ THỐNG KÊ',
      book_id: bookCTST.book_id,
    },
    // --- Chương 8 ---
    {
      category_name: 'Bài 1. Không gian mẫu và biến cố',
      description: 'Chương 8: MỘT SỐ YẾU TỐ XÁC SUẤT',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 2. Xác suất của biến cố',
      description: 'Chương 8: MỘT SỐ YẾU TỐ XÁC SUẤT',
      book_id: bookCTST.book_id,
    },
    // --- Chương 9 ---
    {
      category_name: 'Bài 1. Đường tròn ngoại tiếp tam giác. Đường tròn nội tiếp tam giác',
      description: 'Chương 9: TỨ GIÁC NỘI TIẾP. ĐA GIÁC ĐỀU',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 2. Tứ giác nội tiếp',
      description: 'Chương 9: TỨ GIÁC NỘI TIẾP. ĐA GIÁC ĐỀU',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 3. Đa giác đều và phép quay',
      description: 'Chương 9: TỨ GIÁC NỘI TIẾP. ĐA GIÁC ĐỀU',
      book_id: bookCTST.book_id,
    },
    // --- Chương 10 ---
    {
      category_name: 'Bài 1. Hình trụ',
      description: 'Chương 10: CÁC HÌNH KHỐI TRONG THỰC TIỄN',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 2. Hình nón',
      description: 'Chương 10: CÁC HÌNH KHỐI TRONG THỰC TIỄN',
      book_id: bookCTST.book_id,
    },
    {
      category_name: 'Bài 3. Hình cầu',
      description: 'Chương 10: CÁC HÌNH KHỐI TRONG THỰC TIỄN',
      book_id: bookCTST.book_id,
    },

    // === SÁCH KẾT NỐI TRI THỨC - TẬP 1 ===
  {
    category_name: 'Bài 1. Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn',
    description: 'Chương 1. PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 2. Giải hệ hai phương trình bậc nhất hai ẩn',
    description: 'Chương 1. PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 3. Giải bài toán bằng cách lập hệ phương trình',
    description: 'Chương 1. PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 4. Phương trình quy về phương trình bậc nhất một ẩn',
    description: 'Chương II. PHƯƠNG TRÌNH VÀ BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 5. Bất đẳng thức và tính chất',
    description: 'Chương II. PHƯƠNG TRÌNH VÀ BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 6. Bất phương trình bậc nhất một ẩn',
    description: 'Chương II. PHƯƠNG TRÌNH VÀ BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 7. Căn bậc hai và căn thức bậc hai',
    description: 'Chương III. CĂN BẬC HAI VÀ CĂN BẬC BA',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 8. Khai căn bậc hai với phép nhân và phép chia',
    description: 'Chương III. CĂN BẬC HAI VÀ CĂN BẬC BA',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 9. Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai',
    description: 'Chương III. CĂN BẬC HAI VÀ CĂN BẬC BA',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 10. Căn bậc ba và căn thức bậc ba',
    description: 'Chương III. CĂN BẬC HAI VÀ CĂN BẬC BA',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 11. Tỉ số lượng giác của góc nhọn',
    description: 'Chương IV. HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 12. Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng',
    description: 'Chương IV. HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 13. Mở đầu về đường tròn',
    description: 'Chương V. ĐƯỜNG TRÒN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 14. Cung và dây của một đường tròn',
    description: 'Chương V. ĐƯỜNG TRÒN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 15. Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên',
    description: 'Chương V. ĐƯỜNG TRÒN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 16. Vị trí tương đối của đường thẳng và đường tròn',
    description: 'Chương V. ĐƯỜNG TRÒN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 17. Vị trí tương đối của hai đường tròn',
    description: 'Chương V. ĐƯỜNG TRÒN',
    book_id: bookKNTT.book_id,
  },

  // === SÁCH KẾT NỐI TRI THỨC - TẬP 2 ===
  {
    category_name: 'Bài 18. Hàm số y = ax^2 (a ≠ 0)',
    description: 'Chương VI. HÀM SỐ y = ax^2 (a ≠ 0). PHƯƠNG TRÌNH BẬC HAI MỘT ẨN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 19. Phương trình bậc hai một ẩn',
    description: 'Chương VI. HÀM SỐ y = ax^2 (a ≠ 0). PHƯƠNG TRÌNH BẬC HAI MỘT ẨN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 20. Định lí Viète và ứng dụng',
    description: 'Chương VI. HÀM SỐ y = ax^2 (a ≠ 0). PHƯƠNG TRÌNH BẬC HAI MỘT ẨN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 21. Giải bài toán bằng cách lập phương trình',
    description: 'Chương VI. HÀM SỐ y = ax^2 (a ≠ 0). PHƯƠNG TRÌNH BẬC HAI MỘT ẨN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 22. Bảng tần số và biểu đồ tần số',
    description: 'Chương VII. TẦN SỐ VÀ TẦN SỐ TƯƠNG ĐỐI',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 23. Bảng tần số tương đối và biểu đồ tần số tương đối',
    description: 'Chương VII. TẦN SỐ VÀ TẦN SỐ TƯƠNG ĐỐI',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 24. Bảng tần số, tần số tương đối ghép nhóm và biểu đồ',
    description: 'Chương VII. TẦN SỐ VÀ TẦN SỐ TƯƠNG ĐỐI',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 25. Phép thử ngẫu nhiên và không gian mẫu',
    description: 'Chương VIII. XÁC SUẤT CỦA BIẾN CỐ TRONG MỘT SỐ MÔ HÌNH XÁC SUẤT ĐƠN GIẢN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 26. Xác suất của biến cố liên quan tới phép thử',
    description: 'Chương VIII. XÁC SUẤT CỦA BIẾN CỐ TRONG MỘT SỐ MÔ HÌNH XÁC SUẤT ĐƠN GIẢN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 27. Góc nội tiếp',
    description: 'Chương IX. ĐƯỜNG TRÒN NGOẠI TIẾP VÀ ĐƯỜNG TRÒN NỘI TIẾP',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 28. Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác',
    description: 'Chương IX. ĐƯỜNG TRÒN NGOẠI TIẾP VÀ ĐƯỜNG TRÒN NỘI TIẾP',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 29. Tứ giác nội tiếp',
    description: 'Chương IX. ĐƯỜNG TRÒN NGOẠI TIẾP VÀ ĐƯỜNG TRÒN NỘI TIẾP',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 30. Đa giác đều',
    description: 'Chương IX. ĐƯỜNG TRÒN NGOẠI TIẾP VÀ ĐƯỜNG TRÒN NỘI TIẾP',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 31. Hình trụ và hình nón',
    description: 'Chương X. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN',
    book_id: bookKNTT.book_id,
  },
  {
    category_name: 'Bài 32. Hình cầu',
    description: 'Chương X. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN',
    book_id: bookKNTT.book_id,
  },
  ];




  const categoryPromises = categoriesData.map(catData =>
    prisma.categories.upsert({
      where: { category_name: catData.category_name },
      update: { book_id: catData.book_id, description: catData.description }, 
      create: catData,
    })
  );

  const createdCategories = await Promise.all(categoryPromises);
  console.log(`Đã tạo/cập nhật tổng cộng ${createdCategories.length} Categories cho các loại sách.`);

  console.log(`Seeding Books và Categories hoàn tất.`);
}

main()
  .catch((e) => {
    console.error('Lỗi seeding Books/Categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });