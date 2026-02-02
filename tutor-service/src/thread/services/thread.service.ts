import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateThreadDto, UpdateThreadDto } from "../dto/ThreadDto.dto";
import { DateTime } from 'luxon'

@Injectable()
export class ThreadService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createThread(uid: string, data: CreateThreadDto) {
        const now = DateTime.now().setZone('Asia/Ho_Chi_Minh').toJSDate()
        return this.prisma.thread.create({
            data: {
                class: {connect: {class_id: data.class_id}},
                title: data.title,
                content: data.content,
                createAt: now,
                updateAt: now,
                sender: {connect: {uid}}
            }
        })
    }

    async updateThread(uid: string, thread_id: string, data: UpdateThreadDto) {
        const checkPosess = await this.prisma.thread.findFirst({where: {thread_id, sender: {uid}}})
        if (!checkPosess) throw new NotFoundException("User not have access to thread")
        const now = DateTime.now().setZone('Asia/Ho_Chi_Minh').toJSDate()
        return await this.prisma.thread.update({
            where: {thread_id},
            data: {
                ...data,
                updateAt: now
            }
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
        return await this.prisma.follow.create({
            data: {
                follower: {connect: {uid}},
                thread: {connect: {thread_id}}
            }
        })
    }
}
