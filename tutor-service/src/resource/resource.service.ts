import { 
    BadRequestException, 
    Injectable, 
    InternalServerErrorException, 
    NotFoundException 
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { PrismaService } from "src/prisma/prisma.service";
import { FolderDto, ResourceDto } from "./dto/resource.dto";
import { S3Service } from "./aws/aws-s3.service";
import { Prisma, PrismaClient } from "@prisma/client";

@Injectable()
export class FolderService {
    constructor(
        private readonly prisma: PrismaService,
        private eventEmitter: EventEmitter2
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
            },
            include: {
                class: { 
                    where: { class_id: class_id },
                    select: { category_id: true } 
                },
                resources: {
                    include: {
                        resource: true
                    }
                }
            }
        })

        if (!fatherLayer || fatherLayer.length === 0) return []

        let result = []
        
        for (const item of fatherLayer) { 
            const children = await this.traverseFolderTree(class_id, item.folder_id)
            
            const formattedItem = {
                ...item,
                category_id: item.class?.[0]?.category_id || null, 
                
                resources: item.resources?.map((r: any) => r.resource) || [],
                
                children
            }
            result.push(formattedItem)
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
        private readonly s3: S3Service,
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
        const fileUploaded = await this.s3.uploadFile(file)

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
                    user: { connect: {uid: tutor_id} },
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
            where: {user:{uid: tutor_id}}
        })
    }

    async getAllDocsByFolder(folder_id: string){
        return this.prisma.resources.findMany({
            where: {Resource_in_Folder: {some: {folder: {folder_id}}}}
        })
    }

    async getFileById(did: string) {
        const fileInfo = await this.prisma.resources.findUnique({ where: { did } });
        
        if (!fileInfo) {
            console.error(`File với DID ${did} không tồn tại trong DB`);
            throw new NotFoundException("File không tồn tại trong DB");
        }

        try {
            const url = new URL(fileInfo.file_path);
            const key = url.pathname.substring(1);
            console.log("S3 Key extracted:", key); // Kiểm tra log này

            const s3Response = await this.s3.getFileStream(key);
            return { s3Response, fileInfo }; 
        } catch (error) {
            console.error("Lỗi khi kết nối S3:", error.message);
            throw new NotFoundException("Không tìm thấy file trên S3");
        }
    }

    async updateDocs(did: string, data: Partial<ResourceDto>){
        return this.prisma.resources.update({
            where: {did},
            data
        })
    }
}