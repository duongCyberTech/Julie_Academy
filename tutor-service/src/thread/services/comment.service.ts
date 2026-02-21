import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CloudinaryService } from "src/resource/cloudinary/cloudinary.service";
import { CommentGateway } from "../controllers/comment.gateway";
import { CreateCommentDto } from "../dto/CommentDto.dto";

@Injectable()
export class CommentService {
    constructor(
        private readonly prisma: PrismaService,
        private cloudinaryService: CloudinaryService,
        private commentGateway: CommentGateway
    ){}

    async createComment(uid: string, thread_id: string, data: CreateCommentDto, images: Array<Express.Multer.File> = []) {
        const idx = await this.prisma.comments.aggregate({
            _max: {comment_id: true},
            where: {
                thread_id
            }
        })
        return this.prisma.$transaction(async(tx) => {
            const newComment = await tx.comments.create({
                data: {
                    content: data.content,
                    comment_id: (Number(idx._max.comment_id) ?? 0) + 1,
                    sender: {connect: {uid}},
                    thread: {connect: {thread_id}},
                    ...(data.parent_cmt_id ? {
                        parent_cmt: {
                            connect: {
                                thread_id_comment_id: {
                                    thread_id: thread_id,
                                    comment_id: data.parent_cmt_id
                                }
                            }
                        }
                    } : {}),
                }
            })
            if (images && images.length) {
                const resImgs = await this.cloudinaryService.uploadMultiMediaFiles(tx, uid, `Comment of thread #${thread_id}`, images)

                await tx.resource_of_Comment.createMany({
                    data: resImgs.map((img) => {
                        return {
                            thread_id,
                            comment_id: newComment.comment_id,
                            did: img
                        }
                    })
                })
            }
            
            const cmt = await tx.comments.findUnique({
                where: {thread_id_comment_id: {thread_id, comment_id: newComment.comment_id}},
                select: {
                    comment_id: true,
                    content: true,
                    comments: true,
                    createAt: true,
                    Resource_of_Comment: {
                        select: {
                            Resources: {
                                select: {file_path: true}
                            }
                        }
                    },
                    parent_cmt_id: true,
                    sender: {
                        select: {
                            uid: true,
                            fname: true,
                            mname: true, 
                            lname: true,
                            avata_url: true,
                            email: true
                        }
                    }
                }
            }).then((res) => {
                return {
                    thread_id,
                    comment_id: res.comment_id,
                    content: res.content,
                    createAt: res.createAt,
                    cnt_comments: res.comments.length,
                    medias: res.Resource_of_Comment.map(i => i.Resources.file_path),
                    parent_cmt_id: res.parent_cmt_id,
                    sender: res.sender
                }
            })

            if (cmt) this.commentGateway.sendNewComment(thread_id, cmt);
        })
    }

    async getCommentsByThread(thread_id: string, parent_cmt_id: number = null, page: number = 1) {
        const cmts = await this.prisma.comments.findMany({
            take: 10,
            skip: (page - 1) * 10,
            orderBy: {createAt: 'desc'},
            where: {thread: {thread_id}, parent_cmt_id: parent_cmt_id},
            select: {
                comment_id: true,
                content: true,
                comments: true,
                createAt: true,
                Resource_of_Comment: {
                    select: {
                        Resources: {
                            select: {file_path: true}
                        }
                    }
                },
                parent_cmt_id: true,
                sender: {
                    select: {
                        uid: true,
                        fname: true,
                        mname: true, 
                        lname: true,
                        avata_url: true,
                        email: true
                    }
                }
            }
        }).then((resList) => resList.map((res) => {
            return {
                thread_id,
                comment_id: res.comment_id,
                content: res.content,
                createAt: res.createAt,
                cnt_comments: res.comments.length,
                medias: res.Resource_of_Comment.map(i => i.Resources.file_path),
                parent_cmt_id: res.parent_cmt_id,
                sender: res.sender,
                replies: []
            }
        }))

        return cmts && cmts.length ? cmts : []
    }

    async updateComment(uid: string, thread_id: string) {

    }
}