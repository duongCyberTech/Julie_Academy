import { PrismaClient, UserRole, AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Danh sách tên mẫu
const tutorNames = [
  'Nguyễn Văn An', 'Trần Thị Bích', 'Lê Minh Cường', 'Phạm Ngọc Dũng', 'Hoàng Gia Hân',
  'Vũ Đức Hải', 'Đặng Thu Hằng', 'Bùi Tuấn Hùng', 'Đỗ Mạnh Khang', 'Huỳnh Phương Linh',
];

const studentNames = [
  // 20 Học sinh
  'Phan Thị Mỹ', 'Võ Minh Nam', 'Trương Tấn Phát', 'Nguyễn Bảo Quân', 'Đinh Thanh Sơn',
  'Trần Ngọc Thảo', 'Lê Anh Tuấn', 'Phạm Phương Uyên', 'Hoàng Quang Vinh', 'Vũ Yến Vy',
  'Ngô Kiến Huy', 'Lương Thùy Linh', 'Mai Phương Thúy', 'Phạm Hương', 'H\'Hen Niê',
  'Nguyễn Thúc Thùy Tiên', 'Đỗ Mỹ Linh', 'Trần Tiểu Vy', 'Nguyễn Cao Kỳ Duyên', 'Đặng Thu Thảo'
];

const parentNames = [
  'Mai Văn Giàu', 'Lý Thị Sen', 'Ngô Đức Trí', 'Dương Ngọc Mai', 'Trịnh Xuân Phúc',
  'Vương Minh Tâm', 'Châu Thị Lan', 'Lưu Hữu Phước', 'Tô Hoài Nam', 'Đoàn Kim Chi',
];

function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function createCredentials(name, roleSuffix = '') {
  const parts = removeAccents(name).toLowerCase().split(' ');
  if (parts.length === 0) return { username: `user${roleSuffix}`, email: `user${roleSuffix}@gmail.com` };
  
  const fname = parts[parts.length - 1];
  const lnames = parts.slice(0, parts.length - 1).map((part) => part[0]).join('');
  
  const randomSuffix = Math.floor(Math.random() * 100); 
  const username = `${fname}${lnames}${randomSuffix}${roleSuffix}`;
  const email = `${username}@gmail.com`;
  
  return { username, email };
}

function splitName(name) {
  const parts = name.split(' ');
  const fname = parts[parts.length - 1];
  const lname = parts[0];
  const mname = parts.length > 2 ? parts.slice(1, parts.length - 1).join(' ') : '';
  return { fname, mname, lname };
}

function generateRandomPhoneNumber() {
  const prefix = ['090', '091', '098', '034', '035', '037', '086'];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const randomNumber = Math.floor(1000000 + Math.random() * 9000000);
  return `${randomPrefix}${randomNumber}`;
}

async function main() {
  console.log(`🚀 Bắt đầu quá trình seeding...`);

  const saltRounds = 10;

  // --- HASH PASSWORDS THEO YÊU CẦU ---
  const adminPassword = await bcrypt.hash('Admin123@', saltRounds);
  const tutorPassword = await bcrypt.hash('Tutor123@', saltRounds);
  const studentPassword = await bcrypt.hash('Student123@', saltRounds);
  const parentPassword = await bcrypt.hash('Parent123@', saltRounds);

  console.log(`🔑 Đã thiết lập mật khẩu riêng cho từng Role.`);

  // --- 1. SEED ADMIN ---
  const adminEmail = 'admin@gmail.com';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: adminPassword }, 
    create: {
      username: 'admin',
      fname: 'Admin', mname: '', lname: 'User',
      email: adminEmail,
      password: adminPassword,
      role: UserRole.admin,
      status: AccountStatus.active,
    },
  });
  console.log(`✅ Admin created: ${adminEmail} (Pass: admin123@)`);

  // --- 2. SEED SYSTEM TUTOR ---
  const systemTutorEmail = 'tutor@gmail.com';
  const createdSystemUser = await prisma.user.upsert({
    where: { email: systemTutorEmail },
    update: { password: tutorPassword },
    create: {
      username: 'system.tutor',
      fname: 'System', mname: '', lname: 'Tutor',
      email: systemTutorEmail,
      password: tutorPassword,
      role: UserRole.tutor,
      status: AccountStatus.active,
    },
  });

  await prisma.tutor.upsert({
    where: { uid: createdSystemUser.uid },
    update: {},
    create: { 
      uid: createdSystemUser.uid, 
      phone_number: '0000000000', 
      experiences: 'Tài khoản hệ thống tạo câu hỏi ban đầu' 
    },
  });
  console.log(`✅ System Tutor created: ${systemTutorEmail} (Pass: Tutor123@)`);

  // --- 3. SEED NORMAL TUTORS ---
  console.log(`👨‍🏫 Đang tạo ${tutorNames.length} Tutors thông thường...`);
  for (const name of tutorNames) {
    const { username, email } = createCredentials(name, '.gv');
    const { fname, mname, lname } = splitName(name);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: tutorPassword },
      create: {
        username, email, fname, mname, lname,
        password: tutorPassword,
        role: UserRole.tutor,
        status: AccountStatus.active,
      },
    });
    
    await prisma.tutor.upsert({
      where: { uid: user.uid },
      update: {},
      create: { uid: user.uid, phone_number: generateRandomPhoneNumber(), experiences: 'Giáo viên Toán' },
    });
  }

  // --- 4. SEED PARENTS ---
  console.log(`👪 Đang tạo ${parentNames.length} Parents...`);
  const createdParentUids: string[] = [];
  
  for (const name of parentNames) {
    const { username, email } = createCredentials(name, '.ph');
    const { fname, mname, lname } = splitName(name);

    const user = await prisma.user.upsert({
      where: { email },
      update: { password: parentPassword },
      create: {
        username, email, fname, mname, lname,
        password: parentPassword,
        role: UserRole.parents,
        status: AccountStatus.active,
      },
    });

    await prisma.parents.upsert({
      where: { uid: user.uid },
      update: {},
      create: { uid: user.uid, phone_number: generateRandomPhoneNumber() },
    });
    createdParentUids.push(user.uid);
  }

  // --- 5. SEED STUDENTS ---
  console.log(`🎓 Đang tạo ${studentNames.length} Students...`);
  const createdStudentUids: string[] = [];

  for (const name of studentNames) {
    const { username, email } = createCredentials(name, '.hs');
    const { fname, mname, lname } = splitName(name);
    const dob = new Date(2008, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

    const user = await prisma.user.upsert({
      where: { email },
      update: { password: studentPassword },
      create: {
        username, email, fname, mname, lname,
        password: studentPassword,
        role: UserRole.student,
        status: AccountStatus.active,
      },
    });

    await prisma.student.upsert({
      where: { uid: user.uid },
      update: {},
      create: { uid: user.uid, school: 'THPT Chuyên', dob },
    });
    createdStudentUids.push(user.uid);
  }

  // --- 6. SEED IS_FAMILY (Random Logic) ---
  console.log(`🔗 Đang ghép nối gia đình (Random số con)...`);
  
  for (let i = 0; i < createdStudentUids.length; i++) {
    const studentUid = createdStudentUids[i];
    let parentUid;

    // Logic: 
    // 10 HS đầu tiên -> 10 PH đầu tiên (đảm bảo ai cũng có con)
    // 10 HS sau -> Random PH bất kỳ (tạo trường hợp 2-3 con)
    if (i < createdParentUids.length) {
        parentUid = createdParentUids[i];
    } else {
        const randomIndex = Math.floor(Math.random() * createdParentUids.length);
        parentUid = createdParentUids[randomIndex];
    }

    await prisma.is_family.upsert({
      where: {
        student_uid_parents_uid: { student_uid: studentUid, parents_uid: parentUid },
      },
      update: {},
      create: {
        student_uid: studentUid,
        parents_uid: parentUid,
      },
    });
  }
  
  console.log(`✅ Đã phân bổ ${createdStudentUids.length} học sinh vào các gia đình.`);
  console.log(`🎉 Seeding hoàn tất!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });