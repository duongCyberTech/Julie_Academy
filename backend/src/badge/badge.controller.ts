import { 
    Controller, UseGuards,
    Post, Get, Patch, Delete,
    Body, Param, Query, Request 
} from "@nestjs/common";
import { BadgeService } from "./badge.service";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { BadgeDto } from "./dto/badge.dto";

@Controller('badge')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BadgeController {
    constructor(
        private readonly badgeService: BadgeService
    ){}

    @Post()
    createNewBadge(
        @Body() data: BadgeDto
    ){
        return this.badgeService.createBadge(data)
    }

    @Get()
    getAllBadge(){
        return this.badgeService.getAllBadge()
    }
}