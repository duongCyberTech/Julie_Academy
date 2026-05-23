import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { MailService } from "src/mail/mail.service";
import { MailObjectDto } from "src/mail/dto/mail.dto";
import { PdfService } from "src/resource/pdf/pdf.service";
import { FileType } from "src/resource/dto/pdf.dto";
import { LogStatus } from "@prisma/client";

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);

    private readonly available_emails = [
        "maidangduong92tn@gmail.com",
        "duong.maibk106khmt@hcmut.edu.vn"
    ];

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
                    where: { role: "admin", status: 'active', email: { in: this.available_emails } },
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

                const content = `
                    <p>Dear Admin,</p>
                    <br/>
                    <p>As of ${today.toDateString()}, there have been ${item_update.count} classes updated to "ongoing" status.</p>
                    <p>Please review the class statuses and take any necessary actions.</p>
                    <br/><br/>
                    <p>Best regards,<br/>Julie Academy Team</p>
                `

                const payload: MailObjectDto = {
                    to: this.available_emails[1], // Send to the first available admin email
                    subject: "[JULIE ACADEMY] Check and update class status",
                    content
                }
                await this.mailer.sendEmail(payload)

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
                                    user: { status: 'active', email: { in: this.available_emails } },
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
                                        user: { status: 'active', email: { in: this.available_emails } },
                                    }
                                },
                                select: {
                                    student: {
                                        select: {
                                            uid: true,
                                            user: {
                                                select: {
                                                    email: true,
                                                    lname: true,
                                                    fname: true,
                                                    mname: true
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            tutor: {
                                select: {
                                    user: {
                                        select: {
                                            email: true,
                                            lname: true,
                                            fname: true,
                                            mname: true
                                        }
                                    },
                                    phone_number: true
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
                })),
                tutor: config.class.tutor
            })))
            this.logger.log(`Found ${emailConfigs.length} email configurations to process`)
            for (const config of emailConfigs) {
                this.logger.log(`Processing email config ${config.config_id} for class ${config.class_id} with ${config.students.length} students`)
                const errors: string[] = []
                let emailsAttempted = 0

                for (const { student_uid, student } of config.students) {

                    const fileContent = await this.pdf.generateFileContent(FileType.STUDY_REPORT, student_uid, config.config_id)

                    if (!fileContent) continue;

                    this.logger.log(`Sending learning report email to ${student.email} for class ${config.class_id} with config ${config.config_id}`)

                    config.body = config.body.replace("[Tên học sinh]", student.lname + " " + (student.mname ? student.mname + " " : "") + student.fname )
                    if (config.body.includes("[Đi học đầy đủ / Vắng X buổi]")) {
                        config.body = config.body.replace("[Đi học đầy đủ / Vắng X buổi]", "Đi học đầy đủ")
                    }

                    if (config.body.includes("[Nhập điểm số trung bình]")) {
                        const now = new Date();
                        const previous_date = config?.period === 'weekly'
                        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                        : (config?.period === 'monthly' ? new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) : null);

                        const data = await this.prisma.exam_taken.findMany({
                            where: {
                                student_uid: student_uid,
                                isDone: true,
                                exam_session: {
                                exam_open_in: {
                                    some: { class: { emailConfig: { some: { config_id: config.config_id } } } }
                                }
                                },
                                ...(previous_date ? { doneAt: { gt: previous_date, lte: now } } : {})
                            },
                            select: {
                                final_score: true
                            }
                        });

                        const averageScore = data.length > 0 ? (data.reduce((sum, item) => sum + Number(item.final_score), 0) / data.length).toFixed(2) : "N/A";
                        config.body = config.body.replace("[Nhập điểm số trung bình]", averageScore)
                    }
                    
                    config.body += `<div class="x_763740103moz-signature">-- <br>
                                        <meta content="text/html; charset=UTF-8">
                                        <meta content="text/css">
                                        
                                        <meta content="Cocoa HTML Writer">
                                        <meta content="1038.25">
                                        <style>
                                            div.zm_4957416615336148795_parse_5937464171537465393 p.x_763740103p1 { margin: 0px 0px 0px 0px; font: 12px helvetica }
                                            div.zm_4957416615336148795_parse_5937464171537465393 span.x_763740103s1 { font: 15px helvetica }
                                            div.zm_4957416615336148795_parse_5937464171537465393 span.x_763740103s2 { font: 15px "Lucida Grande" }
                                            div.zm_4957416615336148795_parse_5937464171537465393 span.x_763740103s3 { color: rgb(238, 119, 0) }
                                            div.zm_4957416615336148795_parse_5937464171537465393 span.x_763740103s4 { font: 12px "Lucida Grande"; color: rgb(0, 0, 128) }
                                            div.zm_4957416615336148795_parse_5937464171537465393 span.x_763740103s5 { color: rgb(128, 0, 0) }
                                            div.zm_4957416615336148795_parse_5937464171537465393 span.x_763740103s6 { font: 12px "Lucida Grande" }
                                        </style>
                                        <p class="x_763740103p1"><span class="x_763740103s1"><b>${config.tutor.user.fname} ${config.tutor.user.lname}</b></span><span class="x_763740103s2"><br>
                                            </span>
                                            <span class="x_763740103s1">Gia sư</span><span class="x_763740103s2"><br></span>
                                            ${config.tutor.user.email ? `<span class="x_763740103s1">${config.tutor.user.email}</span><span class="x_763740103s2"><br></span>` : '' }
                                            ${config.tutor.phone_number ? `<span class="x_763740103s1">${config.tutor.phone_number}</span><span class="x_763740103s2"><br></span>` : '' }
                                            <span class="x_763740103s3"><b>Julie</b></span> <span class="x_763740103s3"><b>Academy</b></span><span class="x_763740103s4"><b><br>
                                            </b></span><span class="x_763740103s3"><b>“Chạm để thay đổi lộ trình”</b></span><span class="x_763740103s4"><b><br>
                                            </b></span><span class="x_763740103s5"> </span>Ho Chi Minh City,
                                            Vietnam<span class="x_763740103s6"><br>
                                            </span><a href="https://www.julieacademy.io.vn" target="_blank">www.julieacademy.io.vn</a>
                                        </p>
                                    </div>`

                    const payload: MailObjectDto = {
                        to: student.email,
                        subject: `[Julie Academy] ${config.header}`,
                        content: config.body,
                        fileContent: fileContent
                    }

                    emailsAttempted++
                    try {
                        await this.mailer.sendEmail(payload)
                    } catch (err) {
                        const message = (err as Error)?.message ?? 'Unknown error'
                        this.logger.error(`Failed to send email to ${student.email}: ${message}`)
                        errors.push(`${student.email}: ${message}`)
                    }
                }

                if (emailsAttempted > 0) {
                    try {
                        await this.prisma.emailLogs.create({
                            data: {
                                config_id: config.config_id,
                                status: errors.length === 0 ? LogStatus.success : LogStatus.failure,
                                error_message: errors
                            }
                        })
                        this.logger.log(`Log created for config ${config.config_id}: ${errors.length === 0 ? 'success' : `failure (${errors.length} error(s))`}`)
                    } catch (logErr) {
                        this.logger.error(`Failed to write email log for config ${config.config_id}`, logErr)
                    }
                }
            }
        } catch (error) {
            this.logger.error("Failed to send learning report emails", error)
        }
    }
}