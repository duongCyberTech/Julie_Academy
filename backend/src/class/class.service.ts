import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {ClassDto, ScheduleDto} from './dto/class.dto';
import { google } from 'googleapis';
import { addDays, isBefore, setDate, setHours, setMinutes } from 'date-fns';
import { ClassStatus, EnrollStatus, Prisma } from '@prisma/client';
import { DuplicatingObject } from 'src/mode/control.mode';
require('dotenv').config()


@Injectable()
export class ScheduleService {
  private calendar;
  constructor(
    private readonly prisma: PrismaService
  ){
    const key = {
      "type": process.env.TYPE,
      "project_id": process.env.PROJECT_ID,
      "private_key_id": process.env.PRIVATE_KEY_ID,
      "private_key": process.env.PRIVATE_KEY,
      "client_email": process.env.CLIENT_EMAIL,
      "client_id": process.env.CLIENT_ID,
      "auth_uri": process.env.AUTH_URI,
      "token_uri": process.env.TOKEN_URI,
      "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
      "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL,
      "universe_domain": process.env.UNIVERSE_DOMAIN
    }

    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: [process.env.SCOP_1]
    })
    this.calendar = google.calendar({version: 'v3', auth})
  }

  getAllMeetingsBetween(
    startClassAt: Date,
    endClassAt: Date,
    meeting_date: number, // 2–8 (Thứ Hai–Chủ nhật)
    startAt: string,
    endAt: string
  ) {
    const meetings = [];
    let current = new Date(startClassAt);

    const weekday = meeting_date === 8 ? 0 : meeting_date - 1;

    while (isBefore(current, endClassAt) || current.toDateString() === endClassAt.toDateString()) {
      if (current.getDay() === weekday) {
        const [startHour, startMin] = startAt.split(':').map(Number);
        const [endHour, endMin] = endAt.split(':').map(Number);

        const startTime = setMinutes(setHours(new Date(current), startHour), startMin);
        const endTime = setMinutes(setHours(new Date(current), endHour), endMin);

        meetings.push({ startTime, endTime });
      }

      current = addDays(current, 1);
    }

    return meetings;
  } 

  async createGoogleCalendarEvent(startTime: Date, endTime: Date, sClass: any){
    const event = {
      summary: `Class ${sClass.classname}`,
      description: `Weekly ${sClass.description}`,
      start: {dateTime: startTime.toISOString(), timeZone: 'Asia/Ho_Chi_Minh'},
      end: {dateTime: endTime.toISOString(), timeZone: 'Asia/Ho_Chi_Minh'},
      conferenceData: {
        createRequest: {
          requestId: `meeting-${Date.now()}`,
          conferenceSolutionKey: {type: "hangoutsMeet"}
        }
      }
    }

    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1
    })

    console.log('✅ Created event:', response.data.htmlLink);
  }

  parseTimeStrToNum(time: string){
    const data = time.split(":")
    return parseFloat(data[0]) + parseFloat(data[1])/60.0; 
  }

  async createSchedule(class_id:string, schedules: ScheduleDto[]){
    return this.prisma.$transaction(async(tx) => {

      var cnt = 1 + await tx.schedule.count({
        where: {class_id}
      })
      
      var schedLst = []

      for (const item of schedules){

        const newStartAtNum: Number = this.parseTimeStrToNum(item.startAt);
        const newEndAtNum: Number = this.parseTimeStrToNum(item.endAt);
        const checkExist: {meeting_date: string}[] = await tx.$queryRaw(Prisma.sql`
          SELECT "meeting_date"
          FROM public."Schedule"
          WHERE
            "meeting_date" = ${item.meeting_date} 
            AND
            (
              -- Lấy tổng số giây từ nửa đêm (00:00:00) và chia cho 3600 để có giờ thập phân (REAL)
              -- 1. Chuyển đổi endAt của DB thành giờ thập phân
              ((
                EXTRACT(EPOCH FROM "endAt"::TIME) / 3600.0
              ) > ${newStartAtNum} AND 

              -- 2. Chuyển đổi startAt của DB thành giờ thập phân
              (
                EXTRACT(EPOCH FROM "startAt"::TIME) / 3600.0
              ) <= ${newStartAtNum})

              OR 
              ((
                EXTRACT(EPOCH FROM "endAt"::TIME) / 3600.0
              ) >= ${newEndAtNum} AND 

              -- 2. Chuyển đổi startAt của DB thành giờ thập phân
              (
                EXTRACT(EPOCH FROM "startAt"::TIME) / 3600.0
              ) < ${newEndAtNum})

              OR (
              (
                EXTRACT(EPOCH FROM "endAt"::TIME) / 3600.0
              ) = ${newEndAtNum} AND 

              -- 2. Chuyển đổi startAt của DB thành giờ thập phân
              (
                EXTRACT(EPOCH FROM "startAt"::TIME) / 3600.0
              ) = ${newStartAtNum}
              )
            )
        `);

        if (checkExist && checkExist.length) continue;

        const sched = await tx.schedule.create({
          data:{
            ...item,
            schedule_id: cnt++,
            class: {connect: {class_id}}
          }
        })
        
        schedLst.push(sched)
      }

      return {status: 201, message: "Create Schedule Successfully!", data: schedLst}
    })
  }

  async deleteSchedule(class_id: string, mode: boolean = false, schedules?: number[]){
    return this.prisma.$transaction(async(tx) => {
      if (mode) {
        await tx.schedule.deleteMany({
          where: {class_id}
        })

        return {status: 200, message: "Delete the whole schedule successfully!"}
      }

      if (!schedules) return {status: 400, message: "No action done as missing the schedule!"}

      var schedLst: number[] = schedules.sort()
      var cnt_d = 0

      for (const sched of schedLst){
        console.log(sched)
        const idx: number = await tx.schedule.delete({
          where: {schedule_id_class_id: {class_id, schedule_id: sched - cnt_d}}
        }).then((schedule) => {return schedule.schedule_id})
        
        cnt_d++;
        
        console.log(schedLst)
        await tx.schedule.updateMany({
          where: {class_id, schedule_id: {gt: Number(idx)}},
          data: {
            schedule_id: {decrement: 1}
          }
        })
      }

      return {status: 200, message: "Delete Successfully!"}
    })
  }

  async getAllSchedule(){
    var sched = await this.prisma.schedule.findMany({
      select: {
        schedule_id: true,
        startAt: true,
        endAt: true,
        meeting_date: true,
        class: {
          select: {
            class_id: true,
            classname: true
          }
        }
      }
    })

    const grouped = Object.values(
      sched.reduce((acc, item) => {
        const classId = item.class.class_id;

        if (!acc[classId]) {
          acc[classId] = {
            class_id: classId,
            classname: item.class.classname,
            schedules: []
          };
        }

        acc[classId].schedules.push({
          schedule_id: item.schedule_id,
          startAt: item.startAt,
          endAt: item.endAt,
          meeting_date: item.meeting_date
        });

        return acc;
      }, {})
    );

    return grouped
  }
  
  async getScheduleByClass(class_id: string){
    return this.prisma.schedule.findMany({
      where: {class_id}
    })
  }
}
@Injectable()
export class ClassService {
  constructor(
    private prisma: PrismaService,
    private readonly schedule: ScheduleService
  ) {}

  async createClass(tutor_uid: string, data: ClassDto) {
    return this.prisma.$transaction(async (tx) => {
        const checkExisted = await tx.class.findFirst({
          where: {
            classname: data.classname,
            tutor: { uid: tutor_uid },
            OR: [
              {status: 'pending'},
              {status: 'ongoing'}
            ]
          }
        })

        if (checkExisted) throw new BadRequestException(`class ${data.classname} has been created!`)

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
                startat: data.startAt || new Date(),
                tutor: { connect: { uid: tutor_uid } },
            },
        });

        if (!newClass) throw new InternalServerErrorException("Create class fail!")
        
        return {class: newClass.class_id}
    })
  }

  async getAllClasses(page?: number, limit?: number, search?: string, status?: string, startAt?: Date, endAt?: Date) {
    const _page: number = Number(page) && Number(page) > 0 ? Number(page) : 1;
    const _limit: number = Number(limit) && Number(limit) > 0 ? Number(limit) : 10;
    const skip:number = (_page - 1) * _limit;
    const where: any = {};
    if (status) where.status = status as ClassStatus;
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

    const classLst = await this.prisma.class.findMany({
      where,
      skip,
      take: _limit,
      orderBy: { createdAt: 'desc' },
      select:{
        class_id: true,
        classname: true,
        description: true,
        subject: true,
        grade: true,
        tutor:{
          select:{ user:{
            select:{
              uid: true,
              fname: true,
              mname: true,
              lname: true,
              username: true,
            }
          }
          }
        }
      },
    });

    return classLst
  }

  async getClassesByTutor(tutor_uid: string) {
    const class_ = await this.prisma.class.findMany({
      where: { tutor_uid },
      orderBy: { createdAt: 'desc' },
      select:{
        class_id: true,
        classname: true,
        description: true,
        status: true,
        nb_of_student: true,
        subject: true,
        grade: true,
        tutor:{
          select:{ user:{
            select:{
              uid: true,
              fname: true,
              mname: true,
              lname: true,
              username: true,
            }
          }
          }
        }
      },
    });

    return class_
  }

  async getDetailedClass(class_id: string) {
    const classDetails = await this.prisma.class.findUnique({
      where: { class_id: class_id },
      
      select: {
        class_id: true,
        classname: true,
        description: true,
        grade: true,      
        subject: true,    
        status: true,      
        nb_of_student: true,
        createdAt: true,  
        startat: true,   
        plan_id: true,
        tutor: { 
          select: {
            user: {
              select: {
                uid: true,
                fname: true,
                mname: true,
                lname: true,
                username: true,
              }
            }
          }
        },
        learning: {
          select: {
            student: {
              select: {
                uid: true,
                user: {
                  select: {
                    fname: true,
                    mname: true,
                    lname: true,
                    email: true,
                    avata_url: true 
                  }
                }
              }
            }
          }
        }
      }
    });
    return classDetails;
  }

  async requestForClass(class_id: string, student_lst: string[]){
    return this.prisma.$transaction(async (tx) => {
      const result = []
      for (const student_uid of student_lst){
        const checkExist = await tx.student.findUnique({where: {uid: student_uid}})

        if (!checkExist) continue;

        await tx.learning.create({
          data: {
            class: { connect: { class_id } },
            student: { connect: { uid: student_uid } },
          }
        })

        result.push(checkExist)
      }

      return result
    })
  }

  async acceptEnrollRequest(tutor_id: string, class_id: string, student_id: string){
    return this.prisma.$transaction(async(tx) => {
      const checkPosess = tx.class.findFirst({
        where: {tutor: {uid: tutor_id}, class_id}
      })

      if (!checkPosess) throw new ForbiddenException("Tutor doesn't have permission to access class!")

      await tx.learning.update({
        where: {class_id_student_uid: {class_id, student_uid: student_id}},
        data: {
          status: EnrollStatus.accepted
        }
      })

      return { message: "Enrollment Accepted" }
    })
  }

  async acceptAllEnrollReq(tutor_id: string, class_id: string){
    return this.prisma.$transaction(async(tx) => {
      const checkPosess = tx.class.findFirst({
        where: {tutor: {uid: tutor_id}, class_id}
      })

      if (!checkPosess) throw new ForbiddenException("Tutor doesn't have permission to access class!")

      await tx.learning.updateMany({
        where: {class: {class_id}, status: EnrollStatus.pending},
        data: {
          status: EnrollStatus.accepted
        }
      })

      return { message: "Enrollment Accepted" }
    })
  }

  async rejectEnrollRequest(tutor_id: string, class_id: string, student_id: string){
    return this.prisma.$transaction(async(tx) => {
      const checkPosess = tx.class.findFirst({
        where: {tutor: {uid: tutor_id}, class_id}
      })

      if (!checkPosess) throw new ForbiddenException("Tutor doesn't have permission to access class!")

      await tx.learning.update({
        where: {class_id_student_uid: {class_id, student_uid: student_id}},
        data: {
          status: EnrollStatus.cancelled
        }
      })

      return { message: "Enrollment Cancelled" }
    })
  }

  async cancelEnrollRequest(parent_id: string, class_id: string, student_id: string){
    return this.prisma.$transaction(async(tx) => {
      const checkPosess = tx.is_family.findFirst({
        where: {parents: {uid: parent_id}, student: {uid: student_id}}
      })

      if (!checkPosess) throw new ForbiddenException("Parents don't have permission to reject!")

      await tx.learning.update({
        where: {class_id_student_uid: {class_id, student_uid: student_id}},
        data: {
          status: EnrollStatus.cancelled
        }
      })

      return { message: "Enrollment Cancelled" }
    })
  }

  async completeClass(tutor_id: string, class_id: string, student_id: string){
    return this.prisma.$transaction(async(tx) => {
      const checkPosess = tx.class.findFirst({
        where: {tutor: {uid: tutor_id}, class_id}
      })

      if (!checkPosess) throw new ForbiddenException("Tutor doesn't have permission to access class!")

      await tx.learning.update({
        where: {class_id_student_uid: {class_id, student_uid: student_id}},
        data: {
          status: EnrollStatus.completed
        }
      })

      return { message: "Class Completed" }
    })
  }

  async enrollClass(class_id: string, email: string) {
    return this.prisma.$transaction(async (tx) => {

        const student = await tx.student.findFirst({
          where: { user: { email } }
        });

        if (!student) {
          throw new BadRequestException('Student not found');
        }

        const checkEnrollment = await tx.learning.findFirst({
            where: {
                class: { class_id },
                student: { uid: student.uid }
            }
        });
        if (checkEnrollment) {
            throw new BadRequestException('Student already enrolled in this class');
        }
        const enrollment = await tx.learning.create({
            data: {
                class: { connect: { class_id } },
                student: { connect: { uid: student.uid } },
            },
        });

        if (!enrollment) throw new InternalServerErrorException("Enrollment Fail")
        await tx.class.update({
          where: {class_id},
          data: {nb_of_student: {increment: 1}}
        })
        return {message: 'Enrollment successful'}
    });
  }

  async updateClass(class_id: string, data: Partial<ClassDto>) {
    return this.prisma.$transaction(async (tx) => {
      const { plan_id, ...rest } = data;
      return tx.class.update({
        where: { class_id },
        data: {
          ...rest,
          ...(plan_id ? { plan: { connect: { plan_id } } } : {})
        }
      });
    });
  }

  async cancelClassAtStudentSide(student_uid: string, class_id: string){
    try {
      return this.prisma.$transaction(async(tx) => {
        await tx.learning.delete({
          where: {
            class_id_student_uid: {
              class_id,
              student_uid
            }
          }
        })

        await tx.class.update({
          where: { class_id },
          data: { nb_of_student: {decrement: 1} }
        })
      })
    } catch (error) {
      throw new InternalServerErrorException("Fail when canceling class!")
    }
  }

  async copycatResources(tx: Prisma.TransactionClient, current_folder: string, prev_copy: string){

  }

  async duplicateResource(tx: Prisma.TransactionClient, class_id: string) {
    const rootFolderLayer = await tx.folder_of_class.findMany({
      where: {class: {class_id}},
      select: {
        class_id: true,
        category_id: true,
        folder: {
          select: {
            folder_id: true,
            folder_name: true,
            tutor_id: true
          }
        }
      }
    })

    for (const fold of rootFolderLayer) {
      const copyFolder = await tx.folders.create({
        data: {
          folder_name: fold.folder.folder_name,
          createdAt: new Date(),
          updateAt: new Date(),
          tutor: {connect: {uid: fold.folder.tutor_id}}
        }
      })

      const resources = await tx.resources_in_folder.findMany({
        where: {folder: {folder_id: fold.folder.folder_id}},
        select: {resource_id: true}
      })

      await tx.folder_of_class.create({
        data: {
          class: {connect: {class_id}},
          category: {connect: {category_id: fold.category_id}},
          folder: {connect: {folder_id: copyFolder.folder_id}}
        }
      })

    }
  }

  async duplicateClass(tutor_id: string, data: Partial<ClassDto>, d_class_id: string, dupLst: DuplicatingObject[] = []){
    try {
      return this.prisma.$transaction(async(tx) => {
        const classCopy = await tx.class.findUnique({
          where: {class_id: d_class_id},
          include: {schedule: true, folders: true, plan: true}
        })

        const newClassData: ClassDto = {
          classname: data.classname || classCopy.classname,
          description: data.description || classCopy.description || "",
          createdAt: new Date(),
          updateAt: new Date(),
          startAt: data.startAt || new Date(),
          duration_time: data.duration_time || classCopy.duration_time,
          nb_of_student: 0,
          status: data.startAt ? 'ongoing' : 'pending',
          grade: data.grade || classCopy.grade,
          subject: data.subject || classCopy.subject
        }

        const { plan_id, ...restClassData } = newClassData as any;

        const newClass = await this.createClass(tutor_id, {
            ...restClassData, 
            tutor: {connect: {uid: tutor_id}},
            ...(data.plan_id ? { plan: {connect: {plan_id: data.plan_id}} } : {})
        })

        if (dupLst && dupLst.length > 0) {
          if (dupLst.includes(DuplicatingObject.RESOURCE)){
            
          }

          if (dupLst.includes(DuplicatingObject.PLAN) && !data.plan_id && classCopy.plan_id){
            await tx.class.update({
              where: {class_id: newClass.class},
              data: { plan: { connect: {plan_id: classCopy.plan_id} } }
            })
          }

          if (dupLst.includes(DuplicatingObject.SCHEDULE)) {
            const shedLst =  await tx.schedule.findMany({
              where: { class_id: classCopy.class_id }
            })

            const schedLstData = shedLst.map((item) => {
              const { schedule_id, class_id, meeting_date, ...resitem } = item
              return {...resitem, meeting_date: Number(meeting_date)}
            })
            await this.schedule.createSchedule(newClass.class, schedLstData)
          }
        }

        return tx.class.findUnique({
          where: { class_id: newClass.class },
          include: { schedule: true }
        })
      })
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }
}