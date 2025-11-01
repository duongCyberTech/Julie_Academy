import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Bắt đầu seeding Books và Categories cho Toán 9...`);

  const math9Book = await prisma.books.upsert({
    where: { title: "Toán 9 - Cánh Diều" },
    update: {}, 
    create: {
      title: "Toán 9 - Cánh Diều",
      subject: "Toán",
      grade: 9,
      description: "Sách giáo khoa Toán lớp 9 - Bộ sách Cánh Diều", 
    },
  });
  console.log(`Đã tạo/cập nhật Book: ${math9Book.title}`);

  const categoriesData = [
    {
      category_name: '§1. Phương trình quy về phương trình bậc nhất một ẩn',
      description: 'Chương I: Phương trình và hệ phương trình bậc nhất',
      book_id: math9Book.book_id,
    },
    {
      category_name: '§2. Phương trình bậc nhất hai ẩn. Hệ hai phương trình bậc nhất hai ẩn',
      description: 'Chương I: Phương trình và hệ phương trình bậc nhất',
      book_id: math9Book.book_id,
    },
    {
      category_name: '§3. Giải hệ hai phương trình bậc nhất hai ẩn',
      description: 'Chương I: Phương trình và hệ phương trình bậc nhất',
      book_id: math9Book.book_id,
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
  console.log(`Đã tạo/cập nhật ${createdCategories.length} Categories cho ${math9Book.title}.`);

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