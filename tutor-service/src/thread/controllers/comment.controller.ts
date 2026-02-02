import { Controller } from "@nestjs/common";
import { CommentService } from "../services/comment.service";

@Controller('comments')
export class CommentController {
    constructor(
        private commentService: CommentService
    ){}
}