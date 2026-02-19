import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateThreadDto, UpdateThreadDto } from "../dto/ThreadDto.dto";
import { DateTime } from 'luxon'
import { CloudinaryService } from "src/resource/cloudinary/cloudinary.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class ThreadService {
    constructor(
        private readonly prisma: PrismaService,
        private cloudinaryService: CloudinaryService
    ){}

    async uploadMultiMediaFiles(tx: Prisma.TransactionClient, tutor_id: string, title: string, files: Array<Express.Multer.File>) {
        const uploadPromises = files.map(file => this.cloudinaryService.uploadFile(file));
        const results = await Promise.all(uploadPromises);

        const resImages = await tx.resources.createManyAndReturn({
            data: results.map((img, idx) => {
                return {
                    title: img.original_filename,
                    description: title + ` image ${idx}`,
                    file_type: img.resource_type,
                    file_path: img.secure_url,
                    version: 1,
                    num_pages: img.bytes,
                    user_id: tutor_id
                }
            })
        })

        return resImages.map(img => img.did)
    }

    async createThread(uid: string, data: CreateThreadDto, images: Array<Express.Multer.File>) {
        const now = DateTime.now().setZone('Asia/Ho_Chi_Minh').toJSDate()
        return this.prisma.$transaction(async(tx) => {
            const thread = await tx.thread.create({
                data: {
                    class: {connect: {class_id: data.class_id}},
                    title: data.title,
                    content: data.content,
                    createAt: now,
                    updateAt: now,
                    sender: {connect: {uid}}
                }
            });

            if (images && images.length) {
                const thread_images = await this.uploadMultiMediaFiles(tx, uid, thread.title, images);

                await tx.resource_of_Thread.createMany({
                    data: thread_images.map((item) => {
                        return  {
                            thread_id: thread.thread_id,
                            did: item
                        }
                    })
                })
            }

            const res = await tx.thread.findUnique({
                where: {thread_id: thread.thread_id},
                select: {
                    thread_id: true,
                    title: true, 
                    content: true,
                    createAt: true,
                    sender: {
                        select: {
                            uid: true,
                            fname: true,
                            mname: true,
                            lname: true,
                            email: true,
                            avata_url: true
                        }
                    },
                    Resource_of_Thread: {
                        select: {
                            Resources: {
                                select: {
                                    file_path: true
                                }
                            }
                        }
                    },
                    followers: {
                        select: {
                            follower: {
                                select: {uid: true}
                            }
                        }
                    }
                },
            }).then((res) => {
                return {
                    thread_id: res.thread_id,
                    title: res.title,
                    content: res.content,
                    createAt: res.createAt,
                    sender: res.sender,
                    medias: res.Resource_of_Thread.map(item => item.Resources.file_path),
                    followers: res.followers.map(item => item.follower.uid)
                }
            })

            return { data: res, message: "Create Thread Successfully!", status: 201 }
        })
    }

    async getThreadsByClass(uid: string, class_id: string, page: number = 1) {
        const checkInClass = await this.prisma.class.findFirst({
            where: {
                class_id,
                OR: [
                    { tutor: {uid} },
                    { learning: { some: { student: {uid} } } }
                ]
            }
        })
        if (!checkInClass) throw new ForbiddenException("User not have permission")
        return await this.prisma.thread.findMany({
            where: {class_id},
            take: 10,
            skip: (page - 1) * 10,
            orderBy: {createAt: 'desc'},
            select: {
                thread_id: true,
                title: true, 
                content: true,
                createAt: true,
                sender: {
                    select: {
                        uid: true,
                        fname: true,
                        mname: true,
                        lname: true,
                        email: true,
                        avata_url: true
                    }
                },
                Resource_of_Thread: {
                    select: {
                        Resources: {
                            select: {
                                file_path: true
                            }
                        }
                    }
                },
                followers: {
                    select: {
                        follower: {
                            select: {uid: true}
                        }
                    }
                }
            },
        }).then(res => res.map((thread) => {
            return {
                thread_id: thread.thread_id,
                title: thread.title,
                content: thread.content,
                createAt: thread.createAt,
                sender: thread.sender,
                medias: thread.Resource_of_Thread.map(item => item.Resources.file_path),
                followers: thread.followers.map(item => item.follower.uid)
            }
        }))
    }

    async getThreadById(uid: string, thread_id: string) {
        const thread = await this.prisma.thread.findUnique({
            where: {thread_id},
            include: {
                class: {
                    include: {
                        tutor: true,
                        learning: {
                            include: {
                                student: true
                            }
                        }
                    }
                },
                sender: {
                    select: {
                        uid: true,
                        fname: true,
                        lname: true,
                        email: true
                    }
                }
            }
        })
        if (!thread) throw new NotFoundException("Thread not found")
        const isTutor = thread.class.tutor.uid === uid
        
        const isStudent = thread.class.learning.some(learn => learn.student.uid === uid)

        if (!isTutor && !isStudent) throw new ForbiddenException("User not have permission")
        return thread
    }

    async updateThread(uid: string, thread_id: string, data: Partial<UpdateThreadDto>, addImages: Array<Express.Multer.File>) {
        const checkPosess = await this.prisma.thread.findFirst({where: {thread_id, sender: {uid}}})
        if (!checkPosess) throw new NotFoundException("User not have access to thread")
        const now = DateTime.now().setZone('Asia/Ho_Chi_Minh').toJSDate()
        return await this.prisma.$transaction(async(tx) => {
            const restData = {
                ...(data.title ? {title: data.title} : {}),
                ...(data.content ? {content: data.content} : {}),
            }
            const updatedThread = await tx.thread.update({
                where: {thread_id},
                data: {
                    ...restData,
                    updateAt: now
                }
            })

            if (addImages && addImages.length) {
                const thread_images = await this.uploadMultiMediaFiles(tx, uid, updatedThread?.title || "Untitled", addImages)

                await tx.resource_of_Thread.createMany({
                    data: thread_images.map((item) => {
                        return {
                            thread_id: thread_id,
                            did: item
                        }
                    })
                })
            }

            const deleteArray = Array.isArray(data.deletedImages) 
                    ? data.deletedImages 
                    : [data.deletedImages];
            
            if (data.deletedImages && data.deletedImages.length) {
                await tx.resource_of_Thread.deleteMany({
                    where: {
                        thread_id,
                        Resources: {file_path: {in: deleteArray}}
                    }
                })
            }

            const res = await tx.thread.findUnique({
                where: {thread_id: updatedThread.thread_id},
                select: {
                    thread_id: true,
                    title: true, 
                    content: true,
                    createAt: true,
                    sender: {
                        select: {
                            uid: true,
                            fname: true,
                            mname: true,
                            lname: true,
                            email: true,
                            avata_url: true
                        }
                    },
                    Resource_of_Thread: {
                        select: {
                            Resources: {
                                select: {
                                    file_path: true
                                }
                            }
                        }
                    },
                    followers: {
                        select: {
                            follower: {
                                select: {uid: true}
                            }
                        }
                    }
                },
            }).then((res) => {
                return {
                    thread_id: res.thread_id,
                    title: res.title,
                    content: res.content,
                    createAt: res.createAt,
                    sender: res.sender,
                    medias: res.Resource_of_Thread.map(item => item.Resources.file_path),
                    followers: res.followers.map(item => item.follower.uid)
                }
            })

            return { data: res, message: "Update Thread Successfully!", status: 200 }
        })
    }

    async deleteThread(uid: string, thread_id: string) {
        const checkPosess = await this.prisma.thread.findFirst({where: {thread_id, sender: {uid}}})
        if (!checkPosess) throw new NotFoundException("User not have access to thread")
        return await this.prisma.thread.delete({where: {thread_id}})
    }

    async followThread(uid: string, thread_id: string) {
        const checkInClass = await this.prisma.thread.findFirst({
            where: {thread_id, class: {learning: {some: {student: {uid}}}}}
        })
        if (!checkInClass) throw new ForbiddenException("User not have permission")

        const checkExistFollowing = await this.prisma.follow.findFirst({where: 
            {follower: {uid}, thread: {thread_id}}
        })

        if (checkExistFollowing) return { message: "Have followed!", status: 200 }

        const follows = await this.prisma.follow.create({
            data: {
                follower: {connect: {uid}},
                thread: {connect: {thread_id}}
            }
        })

        return follows ? { message: "Follow Successfully!", status: 200 } : { message: "Follow Fail!", status: 400 }
    }

    async unfollowThread(uid: string, thread_id: string) {
        return this.prisma.$transaction(async(tx) => {
            const checkExistFollowing = await tx.follow.findFirst({where: 
                {follower: {uid}, thread: {thread_id}}
            })

            if (!checkExistFollowing) throw new NotFoundException("Have not followed yet!")
            await tx.follow.delete({
                where: {thread_id_uid: {thread_id, uid}}
            })

            return { message: "Unfollow Successfully!", status: 200 }
        })
    }
}
