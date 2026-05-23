import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, LogStatus, Period, EmailObjective, UserRole, AccountStatus } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const EMAIL_CONFIGS = [
  {
    header: 'Báo cáo học tập hàng tuần',
    body: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #1976d2;">📊 Báo Cáo Học Tập Hàng Tuần</h2>
      <p>Kính gửi Quý Phụ huynh,</p>
      <p>Đây là báo cáo học tập định kỳ của em <strong>[Tên học sinh]</strong>.</p>
      <ul>
        <li><strong>Chuyên cần:</strong> [Đi học đầy đủ / Vắng X buổi]</li>
        <li><strong>Điểm trung bình:</strong> [Nhập điểm số trung bình]</li>
      </ul>
      <p>Trân trọng,<br/><strong>Julie Academy</strong></p>
    </div>`,
    period: Period.weekly,
    day_of_week: 1,
    day_of_month: null,
    time_to_send: '08:00',
    active: true,
  },
  {
    header: 'Tổng kết học tập hàng tháng',
    body: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #2e7d32;">📋 Tổng Kết Học Tập Tháng</h2>
      <p>Kính gửi Quý Phụ huynh,</p>
      <p>Hệ thống gửi đến Quý Phụ huynh tổng kết tháng của em <strong>[Tên học sinh]</strong>.</p>
      <ul>
        <li><strong>Chuyên cần:</strong> [Đi học đầy đủ / Vắng X buổi]</li>
        <li><strong>Điểm trung bình tháng:</strong> [Nhập điểm số trung bình]</li>
      </ul>
      <p>Trân trọng,<br/><strong>Julie Academy</strong></p>
    </div>`,
    period: Period.monthly,
    day_of_week: null,
    day_of_month: 1,
    time_to_send: '09:00',
    active: true,
  },
];

const LOGS_PER_CONFIG: Array<{ offsetDays: number; status: LogStatus; errors: string[] }> = [
  { offsetDays: 1,  status: LogStatus.success, errors: [] },
  { offsetDays: 8,  status: LogStatus.success, errors: [] },
  { offsetDays: 15, status: LogStatus.failure, errors: ['student1@gmail.com: SMTP connection timeout after 30s'] },
  { offsetDays: 22, status: LogStatus.success, errors: [] },
  { offsetDays: 29, status: LogStatus.failure, errors: ['student2@gmail.com: Invalid recipient address', 'student3@gmail.com: Mailbox full'] },
];

async function main() {
  console.log('Bắt đầu quy trình Seed Email Configs & Logs...\n');

  // 1. Find or create the seed tutor user
  let tutorUser = await prisma.user.findUnique({ where: { email: 'thu.le@julie.tutor.com' } });
  if (!tutorUser) {
    tutorUser = await prisma.user.create({
      data: {
        username: 'tutor_seed',
        fname: 'Tutor',
        mname: '',
        lname: 'Demo',
        email: 'tutor@gmail.com',
        password: 'hashed_password_dummy_123',
        role: UserRole.tutor,
        status: AccountStatus.active,
      },
    });
    console.log(`👤 Đã tạo User tutor (UID: ${tutorUser.uid})`);
  } else {
    console.log(`👤 Dùng User tutor sẵn có (UID: ${tutorUser.uid})`);
  }

  // 2. Find or create Tutor profile
  let tutor = await prisma.tutor.findUnique({ where: { uid: tutorUser.uid } });
  if (!tutor) {
    tutor = await prisma.tutor.create({ data: { uid: tutorUser.uid } });
    console.log(`👨‍🏫 Đã tạo Tutor profile (UID: ${tutor.uid})`);
  } else {
    console.log(`👨‍🏫 Dùng Tutor profile sẵn có (UID: ${tutor.uid})`);
  }

  // 3. Find or create a seed class
  let seedClass = await prisma.class.findFirst({
    where: { class_id: "e59e4379-fd7f-4b66-9c5d-b57af04d4bed" },
  });
  if (!seedClass) {
    seedClass = await prisma.class.create({
      data: {
        classname: '[Seed] Lớp Toán Nâng Cao',
        description: 'Lớp học seed dùng để kiểm thử tính năng email log.',
        duration_time: 12,
        nb_of_student: 10,
        grade: 10,
        subject: 'Toán',
        status: 'ongoing',
        tutor_uid: tutor.uid,
        startat: daysAgo(60),
      },
    });
    console.log(`🏫 Đã tạo Class (ID: ${seedClass.class_id})\n`);
  } else {
    console.log(`🏫 Dùng Class sẵn có (ID: ${seedClass.class_id})\n`);
  }

  // 4. Create 2 email configs + 5 logs each
  for (const cfg of EMAIL_CONFIGS) {
    const existing = await prisma.emailConfig.findFirst({
      where: { class_id: seedClass.class_id, header: cfg.header },
    });

    const config = existing ?? await prisma.emailConfig.create({
      data: {
        header: cfg.header,
        body: cfg.body,
        period: cfg.period,
        day_of_week: cfg.day_of_week,
        day_of_month: cfg.day_of_month,
        time_to_send: cfg.time_to_send,
        active: cfg.active,
        send_to: EmailObjective.all,
        class_id: seedClass.class_id,
      },
    });

    if (existing) {
      console.log(`🔄 Config sẵn có: "${cfg.header}" (ID: ${config.config_id})`);
    } else {
      console.log(`✅ Đã tạo Config: "${cfg.header}" (ID: ${config.config_id})`);
    }

    for (const log of LOGS_PER_CONFIG) {
      await prisma.emailLogs.create({
        data: {
          config_id: config.config_id,
          sent_at: daysAgo(log.offsetDays),
          status: log.status,
          error_message: log.errors,
        },
      });
    }
    console.log(`   📬 Đã tạo ${LOGS_PER_CONFIG.length} logs (${LOGS_PER_CONFIG.filter(l => l.status === LogStatus.success).length} thành công, ${LOGS_PER_CONFIG.filter(l => l.status === LogStatus.failure).length} thất bại)\n`);
  }

  console.log('🎉 Hoàn tất Seed Email Configs & Logs!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
