import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {ClassDto} from './dto/class.dto';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async createClass(tutor_uid: string, data: ClassDto) {
    return this.prisma.$transaction(async (tx) => {
        const newClass = await tx.class.create({
            data: {
                classname: data.classname,
                description: data.description,
                duration_time: data.duration_time,
                nb_of_student: data.nb_of_student,
                status: data.status,
                grade: data.grade,
                subject: data.subject,
                createdAt: new Date(),
                updateAt: new Date(),
                tutor: { connect: { uid: tutor_uid } },
            },
        });
        return (newClass !== null ? {status: 201, message: 'Class created successfully'} : {status: 400, message: 'Class creation failed'})
    })
  }

  async getAllClasses(page?: number, limit?: number, search?: string, status?: string, startAt?: Date, endAt?: Date) {
    const skip:number = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (startAt && endAt) {
        where.startAt = { gte: startAt, lte: endAt };
    } else if (startAt) {
        where.startAt = { gte: startAt };
    } else if (endAt) {
        where.startAt = { lte: endAt };
    }
    if (search) {
      where.OR = [
        { classname: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.class.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select:{
        class_id: true,
        classname: true,
        description: true,
        tutor:{
          select:{ user:{
            select:{
              uid: true,
              fname: true,
              lname: true,
              username: true,
            }
          }
          }
        }
      },
    });
  }

  async getClassesByTutor(tutor_uid: string) {
    return this.prisma.class.findMany({
      where: { tutor_uid },
      orderBy: { createdAt: 'desc' },
      select:{
        class_id: true,
        classname: true,
        description: true,
        tutor:{
          select:{ user:{
            select:{
              uid: true,
              fname: true,
              lname: true,
              username: true,
            }
          }
          }
        }
      },
    });
  }

  async getDetailedClass(class_id: string) {
    return this.prisma.class.findMany({
      where: { class_id: class_id } ,
      orderBy: { createdAt: 'desc' },
      select:{
        class_id: true,
        classname: true,
        description: true,
        tutor:{
          select:{ user:{
            select:{
              uid: true,
              fname: true,
              lname: true,
              username: true,
            }
          }
          }
        }
      },
    });
  }

  async enrollClass(class_id: string, student_uid: string) {
    return this.prisma.$transaction(async (tx) => {
        const checkEnrollment = await tx.learning.findFirst({
            where: {
                class_id,
                student_uid
            }
        });
        if (checkEnrollment) {
            throw new BadRequestException('Student already enrolled in this class');
        }
        const enrollment = await tx.learning.create({
            data: {
                class: { connect: { class_id } },
                student: { connect: { uid: student_uid } },
            },
        });
        return (enrollment !== null ? {status: 201, message: 'Enrollment successful'} : {status: 400, message: 'Enrollment failed'})
    });
  }
}