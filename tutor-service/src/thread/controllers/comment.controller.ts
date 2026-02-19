import { 
    Body,
    Controller, 
    DefaultValuePipe, 
    Get, 
    MaxFileSizeValidator, 
    Param, 
    ParseFilePipe, 
    ParseIntPipe, 
    ParseUUIDPipe, 
    Post, 
    Query, 
    Request, 
    UploadedFiles, 
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { CommentService } from "../services/comment.service";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { Roles } from "src/auth/decorator/roles.decorator";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { CreateCommentDto } from "../dto/CommentDto.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CustomFileValidator } from "src/validator/file.validator";

@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentController {
    constructor(
        private commentService: CommentService
    ){}

    @Post(':thread_id')
    @UseInterceptors(FilesInterceptor('images'))
    createComment(
        @Request() req,
        @Param('thread_id', ParseUUIDPipe) thread_id: string,
        @Body() data: CreateCommentDto,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new CustomFileValidator()
                ],
                fileIsRequired: false
            })
        )
        images?: Array<Express.Multer.File>
    ) {
        const uid = req.user.userId
        return this.commentService.createComment(uid, thread_id, data, images)
    }

    @Get('/thread/:thread_id')
    getCommentsByThread(
        @Param('thread_id', ParseUUIDPipe) thread_id: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pnt', new ParseIntPipe({ errorHttpStatusCode: 400, optional: true })) parent_cmt_id?: number,
    ) {
        return this.commentService.getCommentsByThread(thread_id, parent_cmt_id, page)
    }
}