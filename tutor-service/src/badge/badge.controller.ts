import { 
    Controller, UseGuards,
    Post, Get, Patch, Delete,
    Body, Param, Query, Request, 
    UseInterceptors,
    UploadedFile
} from "@nestjs/common";
import { BadgeService } from "./badge.service";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { BadgeDto } from "./dto/badge.dto";
import { FileInterceptor } from "@nestjs/platform-express/multer/interceptors/file.interceptor";
import { Roles } from "src/auth/decorator/roles.decorator";

@Controller('badge')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BadgeController {
    constructor(
        private readonly badgeService: BadgeService
    ){}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @Roles('admin')
    createNewBadge(
        @Body() data: BadgeDto, 
        @UploadedFile() file: Express.Multer.File
    ){
        return this.badgeService.createBadge(data, file)
    }

    @Get()
    getAllBadge(){
        return this.badgeService.getAllBadge()
    }

    @Get(':id')
    getBadgeById(
        @Param('id') badge_id: string
    ){
        return this.badgeService.getBadgeById(badge_id)
    }

    @Patch(':id')
    @Roles('admin')
    updateBadge(
        @Param('id') badge_id: string,
        @Body() data: Partial<BadgeDto>,
        @UploadedFile() file: Express.Multer.File
    ){
        return this.badgeService.updateBadge(badge_id, data, file)
    }

    @Delete(':id')
    @Roles('admin')
    deleteBadge(
        @Param('id') badge_id: string
    ){
        return this.badgeService.deleteBadge(badge_id)
    }
}