import {
    Controller,
    Get, Post, Patch, Delete,
    Body, Param, Query, Request, Response,
    UseGuards,
    UseInterceptors,
    UploadedFile
} from '@nestjs/common'
import { Request as Req, Response as Resp } from 'express';
import { FileInterceptor } from '@nestjs/platform-express'
import { ResourceService, FolderService } from './resource.service'
import { GoogleDriveService } from './google/google.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guard/roles.guard'
import { Roles } from 'src/auth/decorator/roles.decorator'
import { FolderDto, ResourceDto } from './dto/resource.dto'
import { ExceptionResponse } from 'src/exception/Exception.exception'

@Controller('resources')
@UseGuards(JwtAuthGuard, RolesGuard)
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
        @Request() req
    ){
        const tutor_id = req.user.userId
        return this.resource.createNewDocs(tutor_id, folder_id, data, file)
    }

    @Get()
    getAllDocs(
        @Request() req
    ){
        const tutor_id = req.user.userId
        try {
            return this.resource.getAllDocs(tutor_id)
        } catch (error) {
            return new ExceptionResponse().returnError(error)
        }
    }

    @Get(':folder_id')
    getAllDocsByFolder(
        @Param('folder_id') folder_id: string 
    ){
        try {
            return this.resource.getAllDocsByFolder(folder_id)
        } catch (error) {
            return new ExceptionResponse().returnError(error)
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
            return new ExceptionResponse().returnError(error)
        }
    }

    @Get('download/:file_id')
    async downloadFile(
        @Param('file_id') file_id: string,
        @Response() res: Resp
    ){
        try {
            const GGD_file = await this.prisma.resources.findUnique({
                where: {did: file_id}
            })

            const fileParsing = GGD_file.file_path.split("/")

            const fileId = fileParsing[fileParsing.indexOf("d") + 1]

            const chunk = 1024
            const maxSize = GGD_file.num_pages * 1024
            let curr_window = 0

            while (curr_window + chunk - 1 <= maxSize){
                const driveApiResponse = await this.drive.downloadFile(fileId, `bytes=${curr_window}-${curr_window+chunk-1}`)

                res.status(driveApiResponse.status)

                const driveHeaders = driveApiResponse.hearders

                if (driveHeaders['content-type']) res.setHeader('Content-Type', driveHeaders['content-type']);
                if (driveHeaders['content-length']) res.setHeader('Content-Length', driveHeaders['content-length']);
                if (driveHeaders['content-range']) res.setHeader('Content-Range', driveHeaders['content-range']);

                res.setHeader('Accept-Ranges', 'bytes');
                driveApiResponse.data.pipe(res);
                curr_window += chunk
            }
        } catch (error) {
            if (error.status) {
                res.status(error.status).send(error.message);
            } else {
                res.status(500).send('Lỗi máy chủ nội bộ khi tải file.');
            }
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
        @Request() req
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
            return new ExceptionResponse().returnError(error)
        }
    }

    @Delete(':folder_id')
    deleteFolder(
        @Param('folder_id') folder_id: string
    ){
        try {
            return this.folder.deleteFolder(folder_id)
        } catch (error) {
            return new ExceptionResponse().returnError(error)
        }
    }
}