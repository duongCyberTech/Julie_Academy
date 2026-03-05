import { Controller, Get, Post, Body } from "@nestjs/common";
import { ApiTags, ApiBody } from "@nestjs/swagger";
import { BadgeService } from "./badge.service";
import { BadgeDto } from "./dto/badge.dto";

@ApiTags('Badge') 
@Controller('badge')
export class BadgeController {
    constructor(
        private readonly badgeService: BadgeService
    ){}

    @Post('create')
    @ApiBody({ type: BadgeDto })
    async createBadge(@Body() dto: BadgeDto) {
        return this.badgeService.createBadge(dto);
    }

    @Get('get')
    async getAllBadge() {
        return this.badgeService.getAllBadge();
    }
}