import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { BadgeDto } from "./dto/badge.dto";
import { ExceptionResponse } from "src/exception/Exception.exception";
import { AggregateType, BadgeType, ValueType } from "@prisma/client";
import { CloudinaryService } from "src/resource/cloudinary/cloudinary.service";
import { BadgeGateway } from "./badge.gateway";

@Injectable()
export class BadgeService {
    constructor(
        private readonly prisma: PrismaService,
        private cloudinary: CloudinaryService,
        private badgeGateway: BadgeGateway
    ){}

    async createBadge(data: BadgeDto, file: Express.Multer.File){
        try {
            const fileUploader = await this.cloudinary.uploadFile(file)

            const newBadge = await this.prisma.badge.create({
                data: {
                    title: data.title,
                    description: data.description || null,
                    badge_url: fileUploader.secure_url,
                    badge_type: data.badge_type as BadgeType,
                    func_type: data.func_type as AggregateType,
                    value_type: data.value_type as ValueType,
                    threshold: data.threshold
                }
            });

            return newBadge
        } catch (error) {
            return new ExceptionResponse().returnError(error)
        }
    }

    async getAllBadge() {
        try {
            return this.prisma.badge.findMany()
        } catch (error) {
            return new ExceptionResponse().returnError(error)
        }
    }

    async getBadgeById(badge_id: string) {
        try {
            return this.prisma.badge.findUnique({
                where: {
                    badge_id
                }
            })
        } catch (error) {
            return new ExceptionResponse().returnError(error)
        }
    }

    async checkBadge(student_id: string, badge_type: BadgeType, func_type: AggregateType, value_type: ValueType, value: number) {
        const badge = await this.prisma.badge.findFirst({
            where: {
                badge_claimed: {
                    none: {
                        student_id
                    }
                },
                badge_type,
                func_type,
                value_type,
                threshold: {
                    lte: value
                }
            }
        })

        if(badge){
            await this.prisma.claim.create({
                data: {
                    badge_id: badge.badge_id,
                    student_id,
                    claim_at: new Date()
                }
            })
            this.badgeGateway.sendBadgeUpdate(student_id, badge)
        }
    }

    async updateBadge(badge_id: string, data: Partial<BadgeDto>, file: Express.Multer.File) {
        return this.prisma.badge.update({
            where: {
                badge_id
            },
            data: {
                ...data
            }
        })
    }

    async deleteBadge(badge_id: string) {
        return this.prisma.badge.delete({
            where: {
                badge_id
            }
        })
    }
}