import {
    Controller,
    Get, Post, Patch, Delete,
    Body, Param, Query,
    UseGuards,
    UseInterceptors,
    UploadedFile
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ResourceService, FolderService } from './resource.service'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guard/roles.guard'
import { Roles } from 'src/auth/decorator/roles.decorator'
import { FolderDto, ResourceDto } from './dto/resource.dto'

@Controller('resources')
export class ResourceController {
    constructor(
        private readonly resource: ResourceService
    ){}

    @Post(':tutor_id')
    @UseInterceptors(FileInterceptor('file'))
    uploadDocs(
        @Param('tutor_id') tutor_id: string,
        @Body() data: ResourceDto,
        @UploadedFile() file: Express.Multer.File
    ){
        return this.resource.createNewDocs(tutor_id, data, file)
    }
}

@Controller('folders')
export class FolderController {
    constructor(
        private readonly folder: FolderService
    ){}

    @Post(':tutor_id/:class_id')
    createFolder(
        @Param('tutor_id') tutor_id: string,
        @Param('class_id') class_id: string,
        @Body() data: FolderDto
    ){
        return this.folder.createFolder(tutor_id, class_id, data)
    }

    @Get(':class_id')
    getFolderByClass(
        @Param('class_id') class_id: string
    ){
        return this.folder.getFolderByClass(class_id)
    }
}