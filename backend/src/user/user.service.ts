import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto, StudentDto, TutorDto, ParentsDto } from './dto/user.dto';
import { AccountStatus } from '@prisma/client';

const bcrypt = require('bcrypt');
require('dotenv').config();

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: UserDto) {
    return this.prisma.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(data.password, 12);
      const user = await tx.user.findUnique({
        where: {
          email: data.email,
        },
      });
      if (user) {
        throw new Error('User already exists');
      }
      const newUser = await tx.user.create({
        data: {
          username: data.username,
          fname: data.fname,
          mname: data.mname,
          lname: data.lname,
          email: data.email,
          password: hashedPassword,
          role: data.role,
          status: data.status,
          avata_url: data.avata_url || '',
        },
      });
      if (data.role === 'student') {
        const studentData: StudentDto = {
          school: data.school || '',
          dob: data.dob || new Date('2000-01-01'),
        };
        await tx.student.create({
          data: {
            user: { connect: { uid: newUser.uid } },
            ...studentData,
          },
        });
      } else if (data.role === 'tutor') {
        const tutorData: TutorDto = {
          phone_number: data.phone_number || '',
          experiences: data.experiences || '',
        };
        await tx.tutor.create({
          data: {
            user: { connect: { uid: newUser.uid } },
            ...tutorData,
          },
        });
      } else if (data.role === 'parents') {
        const parentsData: ParentsDto = {
          phone_number: data.phone_number || '',
        };
        await tx.parents.create({
          data: {
            user: { connect: { uid: newUser.uid } },
            ...parentsData,
          },
        });
      } else {
        throw new BadRequestException('Invalid role');
      }

      return newUser !== null
        ? { status: 201, message: 'User created successfully' }
        : { status: 400, message: 'User creation failed' };
    });
  }

  findAll(
    role?: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
    filter: string = '',
  ) {
    const skip: number = (page - 1) * limit;
    const where: any = {};
    if (role && role !== 'all') {
      if (['admin', 'tutor', 'student', 'parents'].includes(role)) {
        where.role = role as any;
      } else {
        console.warn(`Invalid role filter received: ${role}`);
      }
    }

    if (status && status !== 'all') {
      if (['active', 'inactive'].includes(status)) {
        where.status = status as any;
      } else {
        console.warn(`Invalid status filter received: ${status}`);
      }
    }
    if (filter) {
      where.OR = [
        { fname: { contains: filter, mode: 'insensitive' } },
        { lname: { contains: filter, mode: 'insensitive' } },
        { email: { contains: filter, mode: 'insensitive' } },
        { username: { contains: filter, mode: 'insensitive' } },
      ];
    }
    return this.prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        uid: id,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async updateUser(id: string, data: Partial<UserDto>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }
    return this.prisma.user.update({
      where: {
        uid: id,
      },
      data,
    });
  }

  async updateUserStatus(id: string, status: AccountStatus) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.prisma.user.update({
      where: { uid: id },
      data: { status: status },
      select: {
        uid: true,
        status: true,
      },
    });
  }
}
