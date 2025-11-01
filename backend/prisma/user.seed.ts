import { PrismaClient, UserRole, AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const userNames = [
  // Tutors (10)
  'Nguyễn Văn An',
  'Trần Thị Bích',
  'Lê Minh Cường',
  'Phạm Ngọc Dũng',
  'Hoàng Gia Hân',
  'Vũ Đức Hải',
  'Đặng Thu Hằng',
  'Bùi Tuấn Hùng',
  'Đỗ Mạnh Khang',
  'Huỳnh Phương Linh',
  // Students (10)
  'Phan Thị Mỹ',
  'Võ Minh Nam',
  'Trương Tấn Phát',
  'Nguyễn Bảo Quân',
  'Đinh Thanh Sơn',
  'Trần Ngọc Thảo',
  'Lê Anh Tuấn',
  'Phạm Phương Uyên',
  'Hoàng Quang Vinh',
  'Vũ Yến Vy',
  // Parents (10)
  'Mai Văn Giàu',
  'Lý Thị Sen',
  'Ngô Đức Trí',
  'Dương Ngọc Mai',
  'Trịnh Xuân Phúc',
  'Vương Minh Tâm',
  'Châu Thị Lan',
  'Lưu Hữu Phước',
  'Tô Hoài Nam',
  'Đoàn Kim Chi',
];

function removeAccents(str) {
  /* ... */ return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}
function createCredentials(name, roleSuffix = '') {
  /* ... */ const parts = removeAccents(name).toLowerCase().split(' ');
  if (parts.length === 0)
    return {
      username: `user${roleSuffix}`,
      email: `user${roleSuffix}@gmail.com`,
    };
  const fname = parts[parts.length - 1];
  const lnames = parts
    .slice(0, parts.length - 1)
    .map((part) => part[0])
    .join('');
  const usernameBase = `${fname}${lnames ? '.' + lnames : ''}`;
  const username = `${usernameBase}${roleSuffix}`;
  const email = `${username}@gmail.com`;
  return { username, email };
}
function splitName(name) {
  /* ... */ const parts = name.split(' ');
  const fname = parts[parts.length - 1];
  const lname = parts[0];
  const mname =
    parts.length > 2 ? parts.slice(1, parts.length - 1).join(' ') : '';
  return { fname, mname, lname };
}
function generateRandomPhoneNumber() {
  /* ... */ const prefix = ['090', '091', '098', '034', '035', '037', '086'];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const randomNumber = Math.floor(1000000 + Math.random() * 9000000);
  return `${randomPrefix}${randomNumber}`;
}

async function main() {
  console.log(`Bắt đầu quá trình seeding...`);

  const saltRounds = 10;
  const [
    adminPassword,
    tutorPassword,
    studentPassword,
    parentPassword,
    systemTutorPassword,
  ] = await Promise.all([
    bcrypt.hash('Admin123@', saltRounds),
    bcrypt.hash('Tutor123@', saltRounds),
    bcrypt.hash('Student123@', saltRounds),
    bcrypt.hash('Parent123@', saltRounds),
    bcrypt.hash('SystemTutor123@', saltRounds),
  ]);
  console.log(`Đã băm xong 5 loại mật khẩu.`);

  const adminEmail = 'admin@gmail.com';
  const adminUser = await prisma.user.upsert({
    /* ... */ where: { email: adminEmail },
    update: {
      password: adminPassword,
      role: UserRole.admin,
      status: AccountStatus.active,
    },
    create: {
      username: 'admin',
      fname: 'Admin',
      mname: '',
      lname: 'User',
      email: adminEmail,
      password: adminPassword,
      role: UserRole.admin,
      status: AccountStatus.active,
    },
  });
  console.log(`✅ Đã tạo/cập nhật Admin: ${adminUser.email}`);

  const systemTutorEmail = 'system.tutor@julie.com';
  const systemTutorData = {
    userData: {
      username: 'system.tutor',
      fname: 'System',
      mname: '',
      lname: 'Tutor',
      email: systemTutorEmail,
      password: systemTutorPassword,
      role: UserRole.tutor,
      status: AccountStatus.active,
    },
    tutorInfo: {
      phone_number: '0000000000',
      experiences: 'Tài khoản hệ thống tạo câu hỏi ban đầu',
    },
  };
  const createdSystemUser = await prisma.user.upsert({
    where: { email: systemTutorData.userData.email },
    update: {
      password: systemTutorData.userData.password,
      role: systemTutorData.userData.role,
      status: systemTutorData.userData.status,
    },
    create: systemTutorData.userData,
  });
  await prisma.tutor.upsert({
    where: { uid: createdSystemUser.uid },
    update: systemTutorData.tutorInfo,
    create: { uid: createdSystemUser.uid, ...systemTutorData.tutorInfo },
  });
  console.log(`✅ Đã tạo/cập nhật System Tutor: ${createdSystemUser.email}`);

  console.log(`🔄 Đang seeding 10 Tutors thông thường...`);
  const tutorData = userNames.slice(0, 10).map((name) => {
    /* ... */
    const { username, email } = createCredentials(name, '.gv');
    const { fname, mname, lname } = splitName(name);
    return {
      userData: {
        username,
        email,
        fname,
        mname,
        lname,
        password: tutorPassword,
        role: UserRole.tutor,
        status: AccountStatus.active,
      },
      tutorInfo: {
        phone_number: generateRandomPhoneNumber(),
        experiences: `Giáo viên`,
      },
    };
  });
  for (const data of tutorData) {
    /* ... upsert User và Tutor ... */
    const createdUser = await prisma.user.upsert({
      where: { email: data.userData.email },
      update: {
        password: data.userData.password,
        role: data.userData.role,
        status: data.userData.status,
      },
      create: data.userData,
    });
    await prisma.tutor.upsert({
      where: { uid: createdUser.uid },
      update: data.tutorInfo,
      create: { uid: createdUser.uid, ...data.tutorInfo },
    });
  }
  console.log(`✅ -> Seeding 10 Tutors thông thường hoàn tất.`);

  // --- 5. Seed 10 Students ---
  console.log(`🔄 Đang seeding 10 Students...`);
  const studentData = userNames.slice(10, 20).map((name) => {
    /* ... */
    const { username, email } = createCredentials(name, '.hs');
    const { fname, mname, lname } = splitName(name);
    const dob = new Date(
      2005 + Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 12),
      1 + Math.floor(Math.random() * 28),
    );
    return {
      userData: {
        username,
        email,
        fname,
        mname,
        lname,
        password: studentPassword,
        role: UserRole.student,
        status: AccountStatus.active,
      },
      studentInfo: { school: `Trường THPT Mẫu`, dob: dob },
    };
  });
  for (const data of studentData) {
    /* ... upsert User và Student ... */
    const createdUser = await prisma.user.upsert({
      where: { email: data.userData.email },
      update: {
        password: data.userData.password,
        role: data.userData.role,
        status: data.userData.status,
      },
      create: data.userData,
    });
    await prisma.student.upsert({
      where: { uid: createdUser.uid },
      update: data.studentInfo,
      create: { uid: createdUser.uid, ...data.studentInfo },
    });
  }
  console.log(`✅ -> Seeding 10 Students hoàn tất.`);

  // --- 6. Seed 10 Parents ---
  console.log(`🔄 Đang seeding 10 Parents...`);
  const parentData = userNames.slice(20, 30).map((name) => {
    /* ... */
    const { username, email } = createCredentials(name, '.ph');
    const { fname, mname, lname } = splitName(name);
    // Sửa lỗi: UserRole.parents không tồn tại, phải là UserRole.parent
    return {
      userData: {
        username,
        email,
        fname,
        mname,
        lname,
        password: parentPassword,
        role: UserRole.parents,
        status: AccountStatus.active,
      },
      parentInfo: { phone_number: generateRandomPhoneNumber() },
    };
  });
  for (const data of parentData) {
    /* ... upsert User và Parents ... */
    const createdUser = await prisma.user.upsert({
      where: { email: data.userData.email },
      update: {
        password: data.userData.password,
        role: data.userData.role,
        status: data.userData.status,
      },
      create: data.userData,
    });
    await prisma.parents.upsert({
      where: { uid: createdUser.uid },
      update: data.parentInfo,
      create: { uid: createdUser.uid, ...data.parentInfo },
    });
  }
  console.log(`✅ -> Seeding 10 Parents hoàn tất.`);

  console.log(`🎉 Seeding toàn bộ người dùng hoàn tất.`);
}

main()
  .catch((e) => {
    console.error('Lỗi trong quá trình seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
