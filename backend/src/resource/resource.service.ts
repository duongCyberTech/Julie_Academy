import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { FolderDto, ResourceDto } from "./dto/resource.dto";

@Injectable()
export class FolderService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createFolder(tutor_id: string, class_id: string, data: FolderDto){
        return this.prisma.$transaction(async(tx) => {
            const newFolder = await tx.folders.create({
                data: {
                    folder_name: data.folder_name,
                    createdAt: new Date(),
                    updateAt: new Date(),
                    tutor: { connect: { uid: tutor_id } },
                    ...(data.cate_id ? { category: { connect: {category_id: data.cate_id} } }: {}),
                    ...(data.parent_id ? {Folders: {connect: { folder_id: data.parent_id }}} : {})
                }
            })

            await tx.folder_of_class.create({
                data: {
                    class: {connect: {class_id}},
                    folder: {connect: {folder_id: newFolder.folder_id}}
                }
            })
        })
    }

    async traverseFolderTree(class_id:string, parent_id: string | null = null){
        const fatherLayer = await this.prisma.folders.findMany({
            where: {
                classes: {some: {class_id}},
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
}

@Injectable()
export class ResourceService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createNewDocs(tutor_id: string, data: ResourceDto){ 
        return this.prisma.$transaction(async(tx) => {
            const newDocs = await tx.resources.create({
                data: {
                    title: data.title,
                    description: data.description,
                    createAt: new Date(),
                    updateAt: new Date(),
                    file_path: data.file_path,
                    file_type: data.file_type,
                    version: data.version || 1,
                    num_pages: data.num_pages || 0,
                    tutor: { connect: {uid: tutor_id} },
                }
            })

            if (data.folder && data.folder.length > 0) {
                for ( const fold in data.folder) {
                    await tx.resource_in_folder.create({
                        data: {
                            resources: { connect: { did: newDocs.did } },
                            folder: { connect: { folder_id: fold } }
                        }
                    })
                }
            }

            if ((!data.folder || data.folder.length === 0) && data.cate_id) {
                await tx.resources.update({
                    where: { did: newDocs.did },
                    data: {
                        category: { connect: { category_id: data.cate_id }}
                    }
                })
            }
        })
    }
}