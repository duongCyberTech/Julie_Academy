import { 
    Body,
    Controller, 
    Post, 
    UseGuards,
    Request,
    Patch,
    ParseUUIDPipe,
    Param,
    Delete,
    Get,
    UploadedFiles,
    ParseFilePipe,
    MaxFileSizeValidator,
    UseInterceptors,
    Query,
    ParseIntPipe
} from "@nestjs/common";

import { Request as Req, Response as Resp } from 'express';
import { Readable } from 'stream';
import { FilesInterceptor } from '@nestjs/platform-express'

import { ThreadService } from "../services/thread.service";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { Roles } from "src/auth/decorator/roles.decorator";
import { CreateThreadDto, UpdateThreadDto } from "../dto/ThreadDto.dto";
import { CustomFileValidator } from "src/validator/file.validator";

@Controller('threads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ThreadController {
    constructor(
        private threadService: ThreadService
    ){}

    @Post()
    @Roles('tutor', 'student')
    @UseInterceptors(FilesInterceptor('images'))
    createThread(
        @Request() req,
        @Body() data: CreateThreadDto,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new CustomFileValidator(),
                ],
                fileIsRequired: false
            }),
        )
        images?: Array<Express.Multer.File>
    ){
        const uid: string = req.user.userId
        return this.threadService.createThread(uid, data, images)
    }

    @Get('/class/:class_id')
    getThreadsByClass(
        @Param('class_id', ParseUUIDPipe) class_id: string,
        @Query('page', ParseIntPipe) page: number,
        @Request() req
    ) {
        const uid = req.user.userId
        return this.threadService.getThreadsByClass(uid, class_id, page)
    }

    @Get(':thread_id')
    getThreadById(
        @Param('thread_id', ParseUUIDPipe) thread_id: string,
        @Request() req
    ) {
        const uid = req.user.userId
        return this.threadService.getThreadById(uid, thread_id)
    }

    @Patch(':thread_id')
    @UseInterceptors(FilesInterceptor('addImages'))
    updateThread(
        @Param('thread_id', ParseUUIDPipe) thread_id: string,
        @Body() data: Partial<UpdateThreadDto>,
        @Request() req,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new CustomFileValidator(),
                ],
                fileIsRequired: false
            }),
        )
        addImages?: Array<Express.Multer.File>
    ) {
        const uid = req.user.userId
        return this.threadService.updateThread(uid, thread_id, data, addImages)
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

    @Delete('unfollow/:thread_id')
    unfollowThread(
        @Param('thread_id', ParseUUIDPipe) thread_id: string,
        @Request() req
    ) {
        const uid = req.user.userId
        return this.threadService.unfollowThread(uid, thread_id)
    }
}