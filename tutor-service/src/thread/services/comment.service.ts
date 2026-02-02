import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCommentDto } from "../dto/CommentDto.dto";
import { uuidv7 as uuid } from "uuidv7";

@Injectable()
export class CommentService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createComment(uid: string, thread_id: string, data: CreateCommentDto) {
        const idx = await this.prisma.comments.aggregate({
            _max: {comment_id: true},
            where: {
                thread_id
            }
        })
        return this.prisma.comments.create({
            data: {
                ...data,
                comment_id: (Number(idx._max.comment_id) ?? 0) + 1,
                sender: {connect: {uid}},
                thread: {connect: {thread_id}}
            }
        })
    }

    async updateComment(uid: string, thread_id: string) {

    }
}