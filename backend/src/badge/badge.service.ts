import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { BadgeDto } from "./dto/badge.dto";
import { ExceptionResponse } from "src/exception/Exception.exception";

@Injectable()
export class BadgeService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createBadge(data: BadgeDto){
        try {
            const newBadge = await this.prisma.badge.create({data});

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
}