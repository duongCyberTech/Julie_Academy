import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { MailService } from "src/mail/mail.service";
import { MailObjectDto } from "src/mail/dto/mail.dto";
import { PdfService } from "src/resource/pdf/pdf.service";
import { FileType } from "src/resource/dto/pdf.dto";

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name)
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailer: MailService,
        private readonly pdf: PdfService
    ){}
    
    @Cron('0 * * * * *', {
        name: 'email_sender',
        timeZone: 'Asia/Ho_Chi_Minh'
    })
    async handleSendEmail() {
        try {
            
        } catch (error) {
            
        }
    }

    @Cron('0 0 0 * * *',{
        name: 'class_status',
        timeZone: 'Asia/Ho_Chi_Minh'
    })
    async handleClassStatusChecking(){
        try {
            return this.prisma.$transaction(async(tx) => {
                const today = new Date();

                // Fetch classes and update those whose computed end date is on/after today
                const classes = await tx.class.findMany();

                for (const cls of classes) {
                    if (!cls.startat || cls.duration_time == null) continue;

                    const endDate = new Date(cls.startat);
                    endDate.setDate(endDate.getDate() + cls.duration_time * 7);

                    if (endDate <= today && cls.status !== 'cancelled' && cls.status !== 'ongoing') {
                        await tx.class.update({
                            where: { class_id: cls.class_id },
                            data: { status: 'completed' }
                        });
                    }
                }

                const item_update = await tx.class.updateMany({
                    where: {
                        startat: {lte: today},
                        OR: [
                            {status: {not: 'cancelled'}},
                            {status: {not: 'ongoing'}},
                            {status: {not: 'completed'}}
                        ]
                    },
                    data: {
                        status: 'ongoing'
                    }
                })
                
                await this.prisma.user.findMany({
                    where: { role: "admin" },
                    select: { email: true }
                }).then((lst) => {
                    lst.map(user => user.email).forEach(async (email) => {
                        const content = `
                            <p>Dear Admin,</p>
                            <br/>
                            <p>As of ${today.toDateString()}, there have been ${item_update.count} classes updated to "ongoing" status.</p>
                            <p>Please review the class statuses and take any necessary actions.</p>
                            <br/><br/>
                            <p>Best regards,<br/>Julie Academy Team</p>
                        `

                        const payload: MailObjectDto = {
                            to: email,
                            subject: "[JULIE ACADEMY] Check and update class status",
                            content
                        }
                        await this.mailer.sendEmail(payload)
                    })
                })

                this.logger.log("Cron job done")
            })  
        } catch (error) {
            this.logger.log("Fail with error")
        }
    }

    @Cron('0 * * * *', {
        name: 'learning_report',
        timeZone: 'Asia/Ho_Chi_Minh'
    })
    async handleSendLearningReportEmail() {
        try {
            this.logger.log("Starting to send learning report emails")
            const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))

            const emailConfigs = await this.prisma.emailConfig.findMany({
                where: { 
                    active: true,
                    class: { 
                        status: 'ongoing',
                        learning: {
                            some: {
                                status: 'accepted',
                                student: { 
                                    user: { status: 'active' },
                                    exam_taken: {
                                        some: {
                                            isDone: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    OR: [
                        { period: 'weekly', day_of_week: now.getDay() }, // Sunday - 0, Monday - 1, ..., Saturday - 6
                        { period: 'monthly', day_of_month: now.getDate() }
                    ],
                    time_to_send: {
                        startsWith: now.getHours().toString().padStart(2, '0')
                    }
                },
                select: {
                    config_id: true,
                    period: true,
                    header: true,
                    body: true,
                    class: {
                        select: {
                            class_id: true,
                            learning: {
                                where: {
                                    status: 'accepted',
                                    student: {
                                        user: { status: 'active' }
                                    }
                                },
                                select: {
                                    student: {
                                        select: {
                                            uid: true,
                                            user: {
                                                select: {
                                                    email: true,
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }).then(res => res.map(config => ({
                config_id: config.config_id,
                period: config.period,
                header: config.header,
                body: config.body,
                class_id: config.class.class_id,
                students: config.class.learning.map(learning => ({
                    student_uid: learning.student.uid,
                    student: learning.student.user
                })) 
            })))
            this.logger.log(`Found ${emailConfigs.length} email configurations to process`)
            for (const config of emailConfigs) {
                this.logger.log(`Processing email config ${config.config_id} for class ${config.class_id} with ${config.students.length} students`)
                for (const { student_uid, student } of config.students) {

                    const fileContent = await this.pdf.generateFileContent(FileType.STUDY_REPORT, student_uid, config.config_id)

                    if (!fileContent) continue

                    this.logger.log(`Sending learning report email to ${student.email} for class ${config.class_id} with config ${config.config_id}`)

                    const payload: MailObjectDto = {
                        to: student.email,
                        subject: `[Julie Academy] ${config.header}`,
                        content: config.body,
                        fileContent: fileContent
                    }
                    await this.mailer.sendEmail(payload)
                }
            }
        } catch (error) {
            this.logger.error("Failed to send learning report emails", error)
        }
    }
}