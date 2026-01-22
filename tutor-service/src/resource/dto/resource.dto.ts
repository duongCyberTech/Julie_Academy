export class FolderDto {
    folder_name: string;
    updateAt: Date;
    createAt: Date;
    cate_id?: string;
    parent_id?: string;
}

export class ResourceDto {
    title: string;
    description?: string;
    file_type: string;
    file_path: string;
    version: number;
    num_pages: number;
    cate_id?: string; 
    folder?: string[]
}