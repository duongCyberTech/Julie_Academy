import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { FolderDto, ResourceDto } from "./dto/resource.dto";
import { GoogleDriveService } from "./google/google.service";
import { Prisma, PrismaClient } from "@prisma/client";

@Injectable()
export class FolderService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createFolder(tutor_id: string, category_id: string, class_id: string, data: FolderDto){
        return this.prisma.$transaction(async(tx) => {
            const newFolder = await tx.folders.create({
                data: {
                    folder_name: data.folder_name,
                    createdAt: new Date(),
                    updateAt: new Date(),
                    tutor: { connect: { uid: tutor_id } },
                    ...(data.parent_id ? {Folders: {connect: { folder_id: data.parent_id }}} : {})
                }
            })

            await tx.folder_of_class.create({
                data: {
                    class: {connect: {class_id}},
                    category: {connect: {category_id}},
                    folder: {connect: {folder_id: newFolder.folder_id}}
                }
            })

            return {data: newFolder}
        })
    }

    async traverseFolderTree(class_id:string, parent_id: string | null = null){
        const fatherLayer = await this.prisma.folders.findMany({
            where: {
                class: {some: {class_id}},
                parent_id: parent_id
            }
        })
        if (!fatherLayer || fatherLayer.length === 0) return []

        let result = []
        
        for (const item of fatherLayer) { 
            const children = await this.traverseFolderTree(class_id, item.folder_id)
            result.push({...item, children})
        }

        return result
    }

    async getFolderByClass(class_id: string){
        const root = await this.traverseFolderTree(class_id)
        return root
    }

    async getAllFoldersByLayer(class_id: string, category_id:string, parent_id: string){
        if (!parent_id) {
            return this.prisma.folders.findMany({
                where: {
                   class: {some: {category_id, class_id}}, 
                   parent_id: null
                },
                select: {
                    folder_id: true,
                    folder_name: true,
                    updateAt: true
                }
            })
        }

        const folders = await this.prisma.folders.findMany({
            where: {
                class: {some: {class_id, category_id}},
                folder_id: parent_id
            },
            select: {
                folder_id: true,
                folder_name: true,
                updateAt: true,
                other_Folders: {
                    select: {
                        folder_id: true,
                        folder_name: true,
                        updateAt: true
                    }
                }                
            }
        })
        return folders.map(folder => ({
            folder_id: folder.folder_id,
            folder_name: folder.folder_name,
            updateAt: folder.updateAt,
            children: folder.other_Folders
        }))[0]
    }

    async updateFolder(folder_id: string, data: Partial<FolderDto>){
        return this.prisma.folders.update({
            where: {folder_id},
            data: {
                ...data
            }
        })
    }

    async deleteTraversal(tx: Prisma.TransactionClient, folder_id: string){
        await tx.resources_in_folder.deleteMany({
            where: {folder: {folder_id}}
        })

        const children = await tx.folders.findMany({
            where: {parent_id: folder_id},
            select: {
                folder_id: true
            }
        })

        for (const child of children){
            await this.deleteTraversal(tx, child.folder_id)
        }

        await tx.folder_of_class.deleteMany({
            where: {folder: {folder_id}}
        })

        await tx.folders.delete({
            where: {folder_id}
        })
    }

    async deleteFolder(folder_id: string) {
        return this.prisma.$transaction(async(tx) => {
            await this.deleteTraversal(tx, folder_id)

            return {message: "Delete Successfully"}
        })
    }
}

@Injectable()
export class ResourceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly drive: GoogleDriveService,
        private readonly folder: FolderService
    ){}

    async createNewDocs(tutor_id: string, folder_id: string, data: ResourceDto, file: Express.Multer.File){ 
        if (!file) throw new BadRequestException("File buffer not found.");

        const checkExisted = await this.prisma.folders.findFirst({where: {folder_id}})

        if (!checkExisted) throw new BadRequestException("Folder not found!");

        const fileStream = file.buffer
        if (!fileStream) {
            throw new InternalServerErrorException("File buffer not found. Check Multer configuration.");
        }
        const num_pages = file.size
        const fileUploaded = await this.drive.uploadFile(
            file.originalname,
            file.mimetype,
            fileStream
        )

        return this.prisma.$transaction(async(tx) => {

            const newDocs = await tx.resources.create({
                data: {
                    did: fileUploaded.id,
                    title: data.title,
                    description: data.description,
                    createAt: new Date(),
                    updateAt: new Date(),
                    file_path: fileUploaded.url,
                    file_type: file.mimetype,
                    version: data.version || 1,
                    num_pages: data.num_pages || num_pages,
                    tutor: { connect: {uid: tutor_id} },
                }
            })

            if (folder_id) {
                await tx.resources_in_folder.create({
                    data: {
                        resource: {connect: {did: newDocs.did}},
                        folder: {connect: {folder_id}}
                    }
                })
            }
            else throw new BadRequestException("No folder found!");
            return newDocs
        })
    }

    async getAllDocs(tutor_id: string){
        return this.prisma.resources.findMany({
            where: {tutor:{uid: tutor_id}}
        })
    }

    async getAllDocsByFolder(folder_id: string){
        return this.prisma.resources.findMany({
            where: {Resource_in_Folder: {some: {folder: {folder_id}}}}
        })
    }

    async updateDocs(did: string, data: Partial<ResourceDto>){
        return this.prisma.resources.update({
            where: {did},
            data
        })
    }
}