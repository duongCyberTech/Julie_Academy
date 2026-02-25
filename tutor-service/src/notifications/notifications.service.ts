import { 
    Injectable 
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "./notifications.gateway";
import { CreateNotificationDTO, ReadStatus } from "./dto/notification.dto";

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private notify: NotificationGateway
    ){}

    async createNotification(uid: string, data: CreateNotificationDTO) {
        try {
            const resData = await this.prisma.notifications.create({
                data: {
                    ...data,
                    notifyAt: new Date(),
                    receiver: {connect: {uid}}
                }
            })

            const cnt = await this.countNotifications(uid, ReadStatus.have_not_read)

            this.notify.sendNewNotification(uid, resData, cnt)
        } catch (error) {
            return
        }
    }

    async countNotifications(uid: string, have_read: ReadStatus = ReadStatus.all) {
        try {
            return this.prisma.notifications.count({
                where: {
                    receiver: {uid},
                    ...(have_read != ReadStatus.all ? {have_read: (have_read == ReadStatus.have_read)} : {})
                }
            })
        } catch (error) {
            return 0
        }
    }

    async getAllNotificationsByUser(uid: string, page: number = 1, have_read: ReadStatus = ReadStatus.all) {
        try {
            return this.prisma.notifications.findMany({
                where: {
                    receiver: {uid},
                    ...(have_read != ReadStatus.all ? {have_read: (have_read == ReadStatus.have_read)} : {})
                },
                take: 10,
                skip: (page - 1) * 10,
                include: {
                    receiver: {
                        select: {
                            uid: true,
                            username: true,
                            fname: true,
                            mname: true,
                            lname: true, 
                            email: true
                        }
                    }
                }
            })
        } catch (error) {
            return []
        }
    }
}