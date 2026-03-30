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

@Controller('badge')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BadgeController {
    constructor(
        private readonly badgeService: BadgeService
    ){}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
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
}