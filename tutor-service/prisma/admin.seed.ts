import { PrismaClient, UserRole, AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log(`Bắt đầu seeding admin ...`);
    const adminEmail ='admin@gmail.com';
    const plainPassword = 'Admin123@';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log(`Đã băm mật khẩu cho admin.`);
    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
        },
        create: {
            username: 'admin',
            fname: 'Admin',
            mname: '',
            lname: 'User',
            email: adminEmail,
            password: hashedPassword,
            role: UserRole.admin,
            status: AccountStatus.active,
        },
    });
    console.log(`Seeding admin hoàn tất.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });