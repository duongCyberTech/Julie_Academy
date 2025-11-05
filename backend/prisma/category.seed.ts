import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertCategoryWithChildren(categoryData: any, parentId: string | null = null) {
  const existingCategory = await prisma.categories.findUnique({
    where: {
      category_name: categoryData.category_name,
      book_id: categoryData.book_id,
    },
  });
  const categoryDataForCreate: any = {
    category_name: categoryData.category_name,
    description: categoryData.description,
    Books: {
      connect: { book_id: categoryData.book_id },
    },
    ...(parentId ? { Categories: { connect: { category_id: parentId } } } : {}),
  };

  const category = existingCategory ? existingCategory : await prisma.categories.create({
    data: categoryDataForCreate,
  });

  if (categoryData.children?.length) {
    for (const child of categoryData.children) {
      await upsertCategoryWithChildren(child, category.category_id);
    }
  }
}

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


  const categoriesData = [{
    category_name: 'Chương I: Phương trình và hệ phương trình bậc nhất',
    description: 'Chương I bao gồm các bài về phương trình và hệ phương trình bậc nhất.',
    book_id: math9Book.book_id,
    children:[
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
    ]
  }
  ];

  for (const cat of categoriesData) {
    await upsertCategoryWithChildren(cat);
  }

  console.log(`Đã tạo/cập nhật ${categoriesData.length} Categories cho ${math9Book.title}.`);

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