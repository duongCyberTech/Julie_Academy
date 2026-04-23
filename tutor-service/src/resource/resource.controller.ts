import {
    Controller,
    Get, Post, Patch, Delete,
    Body, Param, Query, Request, Response,
    UseGuards,
    UseInterceptors,
    UploadedFile
} from '@nestjs/common'
import { Request as Req, Response as Resp } from 'express';
import { Readable } from 'stream';
import { FileInterceptor } from '@nestjs/platform-express'
import { ResourceService, FolderService } from './resource.service'
import { GoogleDriveService } from './google/google.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guard/roles.guard'
import { Roles } from 'src/auth/decorator/roles.decorator'
import { FolderDto, ResourceDto } from './dto/resource.dto'
import { ExceptionResponse } from 'src/exception/Exception.exception'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resources')
export class ResourceController {
    constructor(
        private readonly resource: ResourceService,
        private readonly drive: GoogleDriveService,
        private readonly prisma: PrismaService
    ){}

    @Post('/:folder_id')
    @UseInterceptors(FileInterceptor('file'))
    uploadDocs(
        @Param('folder_id') folder_id: string,
        @Body() data: ResourceDto,
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any
    ){
        const tutor_id = req.user.userId
        return this.resource.createNewDocs(tutor_id, folder_id, data, file)
    }

    @Get()
    getAllDocs(
        @Request() req: any
    ){
        const tutor_id = req.user.userId
        try {
            return this.resource.getAllDocs(tutor_id)
        } catch (error) {
            return new ExceptionResponse().returnError(error as Error)
        }
    }

    @Get(':folder_id')
    getAllDocsByFolder(
        @Param('folder_id') folder_id: string 
    ){
        try {
            return this.resource.getAllDocsByFolder(folder_id)
        } catch (error) {
            return new ExceptionResponse().returnError(error as Error)
        }
    }

    @Patch(':did')
    updateDocs(
        @Param('did') did: string,
        @Body() data: Partial<ResourceDto> 
    ){
        try {
            return this.resource.updateDocs(did, data)
        } catch (error) {
            return new ExceptionResponse().returnError(error as Error)
        }
    }

    @Get('view/:did')
    async viewFile(@Param('did') did: string, @Response() res: Resp) {
        try {
            const { s3Response, fileInfo } = await this.resource.getFileById(did);

            // Thiết lập Header
            res.setHeader('Content-Type', s3Response.ContentType || 'application/octet-stream');
            res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileInfo.title)}"`);

            // CHÚ Ý: Chuyển đổi Web Stream sang Node.js Stream để pipe
            const stream = s3Response.Body as Readable;
            stream.pipe(res);

        } catch (error) {
            res.status(404).json({ message: (error as Error).message });
        }
    }
}

@Controller('folders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FolderController {
    constructor(
        private readonly folder: FolderService
    ){}

    @Post(':class_id/:category_id')
    createFolder(
        @Param('category_id') category_id: string,
        @Param('class_id') class_id: string,
        @Body() data: FolderDto,
        @Request() req: any
    ){
        const tutor_id = req.user.userId
        return this.folder.createFolder(tutor_id, category_id, class_id, data)
    }

    @Get(':class_id')
    getFolderByClass(
        @Param('class_id') class_id: string
    ){
        return this.folder.getFolderByClass(class_id)
    }

    @Get(':class_id/:category_id')
    getAllFoldersByLayer(
        @Param('class_id') class_id: string,
        @Param('category_id') category_id: string,
        @Query('parent_id') parent_id: string
    ){
        return this.folder.getAllFoldersByLayer(class_id, category_id, parent_id)
    }

    @Patch(':folder_id')
    updateFolder(
        @Param('folder_id') folder_id: string,
        @Body() data: Partial<FolderDto>
    ){
        try {
            return this.folder.updateFolder(folder_id, data)
        } catch (error) {
            return new ExceptionResponse().returnError(error as Error)
        }
    }

    @Delete(':folder_id')
    deleteFolder(
        @Param('folder_id') folder_id: string
    ){
        try {
            return this.folder.deleteFolder(folder_id)
        } catch (error) {
            return new ExceptionResponse().returnError(error as Error)
        }
    }
}