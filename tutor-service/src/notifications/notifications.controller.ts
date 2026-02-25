import { 
    Controller, 
    DefaultValuePipe, 
    Get, 
    ParseIntPipe, 
    Query, 
    Request,
    UseGuards
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { ReadStatus } from "./dto/notification.dto";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
    constructor(
        private notificationsService: NotificationsService
    ){}

    @Get()
    getNotificationsByUser(
        @Request() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('read', new DefaultValuePipe(1), ParseIntPipe) have_read: ReadStatus
    ){
        const uid = req.user.userId
        return this.notificationsService.getAllNotificationsByUser(uid, page, have_read)
    }

    @Get('count')
    countNotifications(
        @Request() req,
        @Query('read', new DefaultValuePipe(0), ParseIntPipe) have_read: ReadStatus
    ) {
        const uid = req.user.userId
        return this.notificationsService.countNotifications(uid, have_read)
    }
}