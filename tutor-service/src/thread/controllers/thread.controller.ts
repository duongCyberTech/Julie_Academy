import { 
    Body,
    Controller, 
    Post, 
    UseGuards,
    Request,
    Patch,
    ParseUUIDPipe,
    Param,
    Delete
} from "@nestjs/common";
import { ThreadService } from "../services/thread.service";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { Roles } from "src/auth/decorator/roles.decorator";
import { CreateThreadDto, UpdateThreadDto } from "../dto/ThreadDto.dto";

@Controller('threads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ThreadController {
    constructor(
        private threadService: ThreadService
    ){}

    @Post()
    @Roles('tutor', 'student')
    createThread(
        @Request() req,
        @Body() data: CreateThreadDto
    ){
        const uid: string = req.user.userId
        return this.threadService.createThread(uid, data)
    }

    @Patch(':thread_id')
    updateThread(
        @Param('thread_id', ParseUUIDPipe) thread_id: string,
        @Body() data: UpdateThreadDto,
        @Request() req
    ) {
        const uid = req.user.userId
        return this.threadService.updateThread(uid, thread_id, data)
    }

    @Delete(':thread_id')
    deleteThread(
        @Param('thread_id', ParseUUIDPipe) thread_id: string,
        @Request() req
    ) {
        const uid = req.user.userId
        return this.threadService.deleteThread(uid, thread_id)
    }

    @Post('follow/:thread_id')
    followThread(
        @Param('thread_id', ParseUUIDPipe) thread_id: string,
        @Request() req
    ) {
        const uid = req.user.userId
        return this.threadService.followThread(uid, thread_id)
    }
}