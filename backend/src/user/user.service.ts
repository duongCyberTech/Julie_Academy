import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto, StudentDto, TutorDto, ParentsDto } from './dto/user.dto';
import { AccountStatus, UserRole, Prisma } from '@prisma/client';

const bcrypt = require('bcrypt');
require('dotenv').config();

type PrismaTransaction = Prisma.TransactionClient;
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
        throw new BadRequestException('User with this email already exists');
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
        const studentData: Partial<StudentDto> = {
          school: data.school || '',
          dob: data.dob ? new Date(data.dob) : null,
        };
        await tx.student.create({
          data: {
            user: { connect: { uid: newUser.uid } },
            ...studentData,
          },
        });
      } else if (data.role === 'tutor') {
        const tutorData: Partial<TutorDto> = {
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
        const parentsData: Partial<ParentsDto> = {
          phone_number: data.phone_number || '',
        };
        await tx.parents.create({
          data: {
            user: { connect: { uid: newUser.uid } },
            ...parentsData,
          },
        });
      } else if (data.role !== 'admin') {
        throw new BadRequestException('Invalid role specified');
      }

      const { password, ...result } = newUser;
      return {
        status: 201,
        message: 'User created successfully',
        data: result,
      };
    });
  }

  async findAll(
    role?: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
    filter: string = '',
  ) {
    const skip: number = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};

    if (role && role !== 'all') {
      if (Object.values(UserRole).includes(role as UserRole)) {
        where.role = role as UserRole;
      } else {
        console.warn(`Invalid role filter received: ${role}`);
      }
    }

    if (status && status !== 'all') {
      if (Object.values(AccountStatus).includes(status as AccountStatus)) {
        where.status = status as AccountStatus;
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
      select: {
        uid: true,
        username: true,
        email: true,
        fname: true,
        mname: true,
        lname: true,
        role: true,
        status: true,
        avata_url: true,
        student: true,
        tutor: true,
        parents: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        uid: id,
      },
      select: {
        uid: true,
        username: true,
        email: true,
        fname: true,
        mname: true,
        lname: true,
        role: true,
        status: true,
        avata_url: true,
        student: true,
        tutor: true,
        parents: true,
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

    const userData: Partial<Prisma.UserUpdateInput> = {};
    const userModelKeys = [
      'username',
      'fname',
      'mname',
      'lname',
      'email',
      'password',
      'role',
      'status',
      'avata_url',
    ];

    for (const key of userModelKeys) {
      if (data[key] !== undefined) {
        userData[key] = data[key];
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { uid: id },
        data: userData,
        select: {
          uid: true,
          username: true,
          email: true,
          fname: true,
          mname: true,
          lname: true,
          role: true,
          status: true,
          avata_url: true,
          student: true,
          tutor: true,
          parents: true,
        },
      });

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this._updateProfile(tx, updatedUser.role, id, data);

      const finalUser = await tx.user.findUnique({
        where: { uid: id },
        select: {
          uid: true,
          username: true,
          email: true,
          fname: true,
          mname: true,
          lname: true,
          role: true,
          status: true,
          avata_url: true,
          student: true,
          tutor: true,
          parents: true,
        },
      });
      return finalUser;
    });
  }

  async updateUserStatus(id: string, status: AccountStatus) {
    const user = await this.prisma.user.findUnique({ where: { uid: id } });
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

  private async _updateProfile(
    tx: PrismaTransaction,
    role: UserRole,
    uid: string,
    data: Partial<UserDto>,
  ) {
    try {
      if (role === 'student') {
        const studentData: Partial<StudentDto> = {};
        if (data.school !== undefined) studentData.school = data.school;
        if (data.dob !== undefined)
          studentData.dob = data.dob ? new Date(data.dob) : null;

        if (Object.keys(studentData).length > 0) {
          await tx.student.upsert({
            where: { uid },
            update: studentData,
            create: { uid, ...studentData },
          });
        }
      } else if (role === 'tutor') {
        const tutorData: Partial<TutorDto> = {};
        if (data.phone_number !== undefined)
          tutorData.phone_number = data.phone_number;
        if (data.experiences !== undefined)
          tutorData.experiences = data.experiences;

        if (Object.keys(tutorData).length > 0) {
          await tx.tutor.upsert({
            where: { uid },
            update: tutorData,
            create: { uid, ...tutorData },
          });
        }
      } else if (role === 'parents') {
        const parentsData: Partial<ParentsDto> = {};
        if (data.phone_number !== undefined)
          parentsData.phone_number = data.phone_number;

        if (Object.keys(parentsData).length > 0) {
          await tx.parents.upsert({
            where: { uid },
            update: parentsData,
            create: { uid, ...parentsData },
          });
        }
      }
    } catch (error) {
      console.error(
        `Error updating profile for user ${uid} (role: ${role}):`,
        error,
      );
      throw new BadRequestException(
        `Failed to update profile: ${error.message}`,
      );
    }
  }
}
