import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { BadgeDto } from "./dto/badge.dto";
import { ExceptionResponse } from "src/exception/Exception.exception";
import { AggregateType, BadgeType, ValueType } from "@prisma/client";

@Injectable()
export class BadgeService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createBadge(data: BadgeDto){
        try {
            const newBadge = await this.prisma.badge.create({
                data: {
                    title: data.title,
                    description: data.description || null,
                    badge_url: data.badge_url,
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

    async checkBadge(student_id: string, badge_type: BadgeType, func_type: AggregateType, value_type: ValueType, value: number) {
        if (badge_type.includes("exam")) {
            if (badge_type.includes("practice")) {
                
            }
        }
    }
}