import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { MailService } from "src/mail/mail.service";

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name)
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailer: MailService
    ){}
    

    // @Cron('* * * * * *')
    // handleCronEverySecond() {
    //     this.logger.log('--- Đang chạy Cron Job mỗi giây! (Ví dụ 1) ---');
    //     // Logic của Cron Job (ví dụ: gửi email, dọn dẹp database, kiểm tra trạng thái)
    // }

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
                        startat: {gte: today},
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
                
                await this.mailer.sendEmail("Cron job: Check and update class status", `[Date - ${today}]: update ${item_update.count} classes`)
                this.logger.log("Cron job done")
            })  
        } catch (error) {
            this.logger.log("Fail with error")
        }
      
    }

}