import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DateTime } from 'luxon'
import { PrismaService } from "src/prisma/prisma.service";
import { CloudinaryService } from "src/resource/cloudinary/cloudinary.service";
import { CommentGateway } from "../controllers/comment.gateway";
import { CreateCommentDto, UpdateCommentDto } from "../dto/CommentDto.dto";
import { NotificationType, Prisma } from "@prisma/client";
import { CreateNotificationDTO } from "src/notifications/dto/notification.dto";

@Injectable()
export class CommentService {
    constructor(
        private readonly prisma: PrismaService,
        private cloudinaryService: CloudinaryService,
        private commentGateway: CommentGateway,
        private eventEmitter: EventEmitter2
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
                    is_pinned: true,
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
                    },
                    thread: {
                        select: {
                            class_id: true
                        }
                    },
                    _count: {
                        select: {comments: true}
                    }
                }
            }).then((res) => {
                return {
                    class_id: res.thread.class_id,
                    thread_id,
                    comment_id: res.comment_id,
                    content: res.content,
                    createAt: res.createAt,
                    cnt_comments: res.comments.length,
                    medias: res.Resource_of_Comment.map(i => i.Resources.file_path),
                    parent_cmt_id: res.parent_cmt_id,
                    sender: res.sender,
                    cnt: res._count.comments,
                    isNested: false,
                    replies: []
                }
            })

            if (data.emails && data.emails.length) {
                const taggedEmails = Array.isArray(data.emails)
                        ? data.emails
                        : [data.emails]

                const mappedEmailsToIds = await tx.user.findMany({
                    where: {email: {in: taggedEmails}},
                    select: {
                        uid: true
                    }
                }).then(ids => ids.map(item => item.uid))

                await tx.tag.createMany({
                    data: mappedEmailsToIds.map(item => ({
                        uid: item,
                        thread_id,
                        comment_id: cmt.comment_id
                    }))
                })

                mappedEmailsToIds.forEach((item, index) => {
                    const notiData: CreateNotificationDTO = {
                        message: `${cmt.sender.fname} ${cmt.sender.mname ? cmt.sender.mname : ""} ${cmt.sender.lname} nhắc đến bạn vào một bình luận.`,
                        type: NotificationType.thread,
                        link_wrapper_id: cmt.class_id,
                        link_primary_id: cmt.thread_id,
                        link_partial_id: `${cmt.comment_id}`
                    }

                    this.eventEmitter.emit('notify.new', {uid: item, notiData, email: taggedEmails[index]})
                })
            }

            if (cmt) {
                const newCommentNoti: CreateNotificationDTO = {
                    message: `Có bình luận mới trong bài viết mà bạn theo dõi.`,
                    type: NotificationType.thread,
                    link_wrapper_id: cmt.class_id,
                    link_primary_id: cmt.thread_id,
                    link_partial_id: `${cmt.comment_id}`
                }

                this.eventEmitter.emit('thread.comment.new', newCommentNoti)
                this.commentGateway.sendNewComment(thread_id, cmt);
            }
        })
    }

    async pinComment(uid: string, thread_id: string, comment_id: number) {
        try {
            await this.prisma.comments.update({
                where: {thread_id_comment_id: {thread_id, comment_id}, thread: {sender: {uid}}},
                data: {
                    pinned_at: new Date(),
                    is_pinned: true
                }
            })
        } catch (error) {
            
        }
    }

    async unpinComment(uid: string, thread_id: string, comment_id: number) {
        try {
            await this.prisma.comments.update({
                where: {thread_id_comment_id: {thread_id, comment_id}, thread: {sender: {uid}}},
                data: {
                    pinned_at: null,
                    is_pinned: false
                }
            })
        } catch (error) {
            
        }
    }

    async getCommentsByThread(thread_id: string, parent_cmt_id: number | null = null, page: number = 1) {
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
                is_pinned: true,
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
                },
                _count: {
                    select: {
                        comments: true
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
                isNested: false,
                is_pinned: res.is_pinned,
                replies: [],
                cnt: res._count.comments
            }
        }))

        return cmts && cmts.length ? cmts : []
    }

    async fetchCommentUntil(uid: string, thread_id: string, comment_id: number, current_replies: any[] = []) {
        try {
            const current_comment = await this.prisma.comments.findFirst({
                where: {
                    thread: {class: {learning: {some: {student: {uid}}}}},
                    thread_id,
                    comment_id
                },
                select: {
                    comment_id: true,
                    content: true,
                    comments: true,
                    createAt: true,
                    is_pinned: true,
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
                    },
                    _count: {
                        select: {comments: true}
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
                    sender: res.sender,
                    cnt: res._count.comments,
                    isNested: true,
                    is_pinned: res.is_pinned,
                    replies: [...current_replies]
                }
            })

            if (current_comment.parent_cmt_id) return this.fetchCommentUntil(uid, thread_id, current_comment.parent_cmt_id, [current_comment])
            return current_comment  
        } catch (error) {
            return null
        }
    }

    async updateComment(uid: string, thread_id: string, comment_id: number, data: Partial<UpdateCommentDto>, images: Array<Express.Multer.File> = []) {
        return this.prisma.$transaction(async(tx) => {
            const updateComment = await tx.comments.update({
                where: {thread_id_comment_id: {thread_id, comment_id}},
                data: {
                    ...(data.content ? {content: data.content} : {}),
                    updateAt: DateTime.now().setZone('Asia/Ho_Chi_Minh').toJSDate()
                }
            })
            
            if (images && images.length) {
                const comment_imgs = await this.cloudinaryService.uploadMultiMediaFiles(tx, uid, `Comment #${comment_id} - thread #${thread_id}`, images)

                await tx.resource_of_Comment.createMany({
                    data: comment_imgs.map((item) => {
                        return {
                            thread_id,
                            comment_id,
                            did: item
                        }
                    })
                })
            }

            const deleteArray = Array.isArray(data.deletedImages) 
                    ? data.deletedImages 
                    : (data.deletedImages ? [data.deletedImages] : []);

            if (deleteArray && deleteArray.length) {
                await tx.resource_of_Comment.deleteMany({
                    where: {
                        thread_id,
                        comment_id,
                        Resources: {file_path: {in: deleteArray}}
                    }
                })

                this.eventEmitter.emit('cloudinary.delete', deleteArray)
            }

            const cmt = await tx.comments.findUnique({
                where: {thread_id_comment_id: {thread_id, comment_id: comment_id}},
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
                    },
                    _count: {
                        select: {comments: true}
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
                    sender: res.sender,
                    cnt: res._count.comments
                }
            })

            return cmt
        })
    }

    async collectFilesOfDeleteBranch(
        tx: Prisma.TransactionClient, 
        thread_id: string, 
        comment_id: number
    ): Promise<string[]> {
        const subComments = await tx.comments.findMany({
            where: { 
                thread_id: thread_id, 
                parent_cmt_id: comment_id 
            },
            select: {
                comment_id: true,
                Resource_of_Comment: {
                    select: {
                        Resources: {
                            select: { file_path: true }
                        }
                    }
                }
            }
        });

        if (subComments.length === 0) return [];

        let allFiles: string[] = [];

        for (const comment of subComments) {
            const currentFiles = comment.Resource_of_Comment.map(r => r.Resources.file_path);
            allFiles = [...allFiles, ...currentFiles];

            const branchFiles = await this.collectFilesOfDeleteBranch(tx, thread_id, comment.comment_id);
            allFiles = [...allFiles, ...branchFiles];
        }

        return allFiles;
    }

    async deleteComment(thread_id: string, comment_id: number) {
        return await this.prisma.$transaction(async(tx) => {
            const deletedFilesOfNode = await tx.resource_of_Comment.findMany({
                where: {thread_id, comment_id},
                select: {
                    Resources: {
                        select: {file_path: true}
                    }
                }
            }).then(res => res.map(item => item.Resources.file_path))

            const deletedFilesOfBranch = await this.collectFilesOfDeleteBranch(tx, thread_id, comment_id)

            const deletedFiles = [...deletedFilesOfNode, ...deletedFilesOfBranch]

            await tx.comments.delete({where: {thread_id_comment_id: {thread_id, comment_id}}})

            if (deletedFiles && deletedFiles.length) this.eventEmitter.emit('cloudinary.delete', deletedFiles)

            return { message: "Delete Successfully!", status: 200 }
        })
    }
}