import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, EmailTemplateType, UserRole, AccountStatus } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Xác định môi trường
const env = process.env.NODE_ENV || 'development';
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
});

// Khởi tạo Prisma Client
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
});
const prisma = new PrismaClient({ adapter });

// 3 MẪU TEMPLATE HTML ĐƯỢC DESIGN CHUYÊN NGHIỆP
const SYSTEM_TEMPLATES = [
  {
    header: '📝 [Nhắc nhở] Hoàn thành nhiệm vụ học tập',
    type: EmailTemplateType.public,
    body: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">📝 Nhắc Nhở Nhiệm Vụ Học Tập</h2>
        <p>Chào các em học sinh,</p>
        <p>Thầy/cô gửi email này để nhắc nhở các em về việc hoàn thành các bài tập và chuẩn bị thật tốt cho buổi học tiếp theo.</p>
        
        <div style="background-color: #f5f9ff; padding: 15px; border-left: 4px solid #1976d2; margin: 20px 0;">
          <p style="margin-top: 0;"><strong>📋 Thông tin nhiệm vụ:</strong></p>
          <ul style="margin-bottom: 0;">
            <li><strong>Nội dung cần làm:</strong> [Nhập tên bài tập hoặc nhiệm vụ]</li>
            <li><strong>Hạn nộp bài:</strong> <span style="color: #d32f2f;"><strong>[Nhập thời gian hạn chót]</strong></span></li>
            <li><strong>Hình thức nộp:</strong> [Nộp trên hệ thống / Nộp trực tiếp]</li>
          </ul>
        </div>

        <p>Việc hoàn thành bài tập đầy đủ giúp các em khắc sâu kiến thức và dễ dàng tiếp thu bài mới hơn. Nếu có bất kỳ câu hỏi nào khó, đừng ngại ghi chú lại để chúng ta giải quyết trên lớp nhé!</p>
        <p>Chúc các em một ngày học tập hiệu quả!</p>
        <br>
        <p><em>Trân trọng,</em><br><strong style="color: #1976d2;">Giáo viên bộ môn</strong></p>
      </div>
    `
  },
  {
    header: '📊 [Báo cáo] Tình hình học tập định kỳ',
    type: EmailTemplateType.public,
    body: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #2e7d32; border-bottom: 2px solid #2e7d32; padding-bottom: 10px;">📊 Báo Cáo Tình Hình Học Tập</h2>
        <p>Kính gửi Quý Phụ huynh,</p>
        <p>Hệ thống xin trân trọng gửi đến Quý Phụ huynh báo cáo tổng hợp tình hình học tập của em <strong>[Tên học sinh]</strong> trong khoảng thời gian vừa qua.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #e8f5e9;">
            <th style="border: 1px solid #c8e6c9; padding: 10px; text-align: left;">Tiêu chí</th>
            <th style="border: 1px solid #c8e6c9; padding: 10px; text-align: left;">Đánh giá / Kết quả</th>
          </tr>
          <tr>
            <td style="border: 1px solid #c8e6c9; padding: 10px;"><strong>Chuyên cần</strong></td>
            <td style="border: 1px solid #c8e6c9; padding: 10px;">[Đi học đầy đủ / Vắng X buổi]</td>
          </tr>
          <tr>
            <td style="border: 1px solid #c8e6c9; padding: 10px;"><strong>Điểm kiểm tra</strong></td>
            <td style="border: 1px solid #c8e6c9; padding: 10px; color: #1976d2; font-weight: bold;">[Nhập điểm số trung bình]</td>
          </tr>
        </table>

        <p><strong>📝 Nhận xét từ Giáo viên:</strong></p>
        <p style="font-style: italic; background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
          "Con có thái độ học tập tích cực, hăng hái phát biểu xây dựng bài. Tuy nhiên cần chú ý cẩn thận hơn ở khâu tính toán để tránh mất điểm đáng tiếc."
        </p>

        <p>Sự đồng hành của gia đình là nguồn động lực rất lớn. Rất mong Quý Phụ huynh tiếp tục đôn đốc, động viên để con phát huy. Mọi thắc mắc Quý Phụ huynh vui lòng phản hồi trực tiếp lại email này.</p>
        <br>
        <p><em>Trân trọng cảm ơn,</em><br><strong style="color: #2e7d32;">Giáo viên Chủ nhiệm</strong></p>
      </div>
    `
  },
  {
    header: '⚠️ [Thông báo] Nghỉ học đột xuất',
    type: EmailTemplateType.public,
    body: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #ed6c02; border-bottom: 2px solid #ed6c02; padding-bottom: 10px;">⚠️ Thông Báo Nghỉ Học</h2>
        <p>Kính gửi Quý Phụ huynh và các em học sinh,</p>
        <p>Thầy/cô rất tiếc phải thông báo: Vì lý do <strong>[Nhập lý do: ví dụ sự cố thời tiết / sức khỏe giáo viên / trung tâm mất điện]</strong>, buổi học ngày hôm nay sẽ phải tạm hoãn.</p>
        
        <div style="background-color: #fff4e5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;"><strong>Lớp học:</strong> [Tên lớp học]</li>
            <li style="margin-bottom: 8px;"><strong>Ngày nghỉ:</strong> <span style="color: #d32f2f; font-weight: bold;">[Nhập ngày tháng]</span></li>
            <li><strong>Kế hoạch học bù:</strong> Lịch học bù chính thức sẽ được thông báo đến Quý Phụ huynh và các em trong thời gian sớm nhất qua hệ thống.</li>
          </ul>
        </div>

        <p>Các em học sinh hãy tận dụng thời gian này để tự ôn tập lại các kiến thức của buổi trước nhé.</p>
        <p>Rất mong Quý Phụ huynh và các em thông cảm cho sự bất tiện ngoài ý muốn này.</p>
        <br>
        <p><em>Trân trọng,</em><br><strong style="color: #ed6c02;">Ban Quản lý Trung tâm</strong></p>
      </div>
    `
  }
];

async function main() {
  console.log(`Bắt đầu quy trình Seed Email Templates...`);

  // 1. TÌM HOẶC TẠO TÀI KHOẢN CÓ EMAIL tutor@gmail.com
  let tutorUser = await prisma.user.findUnique({
    where: { email: 'tutor@gmail.com' }
  });

  if (!tutorUser) {
    tutorUser = await prisma.user.create({
      data: {
        username: 'tutor_system_seed',
        fname: 'Tutor',
        mname: '',
        lname: 'Demo',
        email: 'tutor@gmail.com',
        password: 'hashed_password_dummy_123',
        role: UserRole.tutor,
        status: AccountStatus.active,
      }
    });
    console.log(`👤 Đã tạo tài khoản Tutor tạm (UID: ${tutorUser.uid})`);
  } else {
    console.log(`👤 Đã tìm thấy tài khoản Tutor (UID: ${tutorUser.uid})`);
  }

  // 2. TẠO CÁC EMAIL TEMPLATE
  for (const template of SYSTEM_TEMPLATES) {
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: { header: template.header } 
    });

    if (!existingTemplate) {
      await prisma.emailTemplate.create({
        data: {
          header: template.header,
          type: template.type,
          body: template.body,
          // Đã sửa lỗi TypeScript bằng cách sử dụng connect
          creator: {
            connect: { uid: tutorUser.uid }
          }
        }
      });
      console.log(`✅ Đã tạo mới: "${template.header}"`);
    } else {
      await prisma.emailTemplate.update({
        where: { template_id: existingTemplate.template_id },
        data: {
          body: template.body,
          type: template.type,
          // Cập nhật lại liên kết với User
          creator: {
            connect: { uid: tutorUser.uid }
          }
        }
      });
      console.log(`🔄 Đã cập nhật: "${template.header}"`);
    }
  }

  console.log(`\n🎉 Hoàn tất seeding Email Templates thành công!`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seeding Email Templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });