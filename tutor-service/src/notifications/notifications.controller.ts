import { 
    Controller, 
    DefaultValuePipe, 
    Get, 
    Param, 
    ParseIntPipe, 
    ParseUUIDPipe, 
    Patch, 
    Query, 
    Request,
    UseGuards
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { ReadStatus } from "./dto/notification.dto";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { ExceptionResponse } from "src/exception/Exception.exception";

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

    @Patch(':notice_id')
    markAsRead(
        @Param('notice_id', ParseUUIDPipe) notice_id: string
    ) {
        try {
            return this.notificationsService.markAsRead(notice_id)
        } catch (error) {
            return new ExceptionResponse().returnError(error)
        }
    }
}