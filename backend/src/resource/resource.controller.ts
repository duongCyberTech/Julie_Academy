import {
    Controller,
    Get, Post, Patch, Delete,
<<<<<<< HEAD
    Body, Param, Query,
=======
    Body, Param, Query, Request,
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
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
<<<<<<< HEAD

@Controller('resources')
=======
import { ExceptionResponse } from 'src/exception/Exception.exception'

@Controller('resources')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(JwtAuthGuard, RolesGuard)
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
export class ResourceController {
    constructor(
        private readonly resource: ResourceService
    ){}

<<<<<<< HEAD
    @Post(':tutor_id')
    @UseInterceptors(FileInterceptor('file'))
    uploadDocs(
        @Param('tutor_id') tutor_id: string,
        @Body() data: ResourceDto,
        @UploadedFile() file: Express.Multer.File
    ){
        return this.resource.createNewDocs(tutor_id, data, file)
=======
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
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
    }
}

@Controller('folders')
<<<<<<< HEAD
=======
@UseGuards(JwtAuthGuard, RolesGuard)
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
export class FolderController {
    constructor(
        private readonly folder: FolderService
    ){}

<<<<<<< HEAD
    @Post(':tutor_id/:class_id')
    createFolder(
        @Param('tutor_id') tutor_id: string,
        @Param('class_id') class_id: string,
        @Body() data: FolderDto
    ){
        return this.folder.createFolder(tutor_id, class_id, data)
=======
    @Post(':class_id/:category_id')
    createFolder(
        @Param('category_id') category_id: string,
        @Param('class_id') class_id: string,
        @Body() data: FolderDto,
        @Request() req
    ){
        const tutor_id = req.user.userId
        return this.folder.createFolder(tutor_id, category_id, class_id, data)
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
    }

    @Get(':class_id')
    getFolderByClass(
        @Param('class_id') class_id: string
    ){
        return this.folder.getFolderByClass(class_id)
    }
<<<<<<< HEAD
=======

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
>>>>>>> d937f31e5ab0572198a09e05dc116193d4c03268
}