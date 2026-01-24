import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class FolderDto {
    @IsString()
    @IsNotEmpty()
    folder_name: string;

    @IsOptional()
    updateAt: Date;

    @IsOptional()
    createAt: Date;

    @IsOptional()
    @IsString()
    cate_id?: string;

    @IsOptional()
    @IsString()
    parent_id?: string;
}

export class ResourceDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    file_type: string;

    @IsOptional()
    @IsString()
    file_path: string;

    @IsOptional()
    @IsNumber()
    version: number;

    @IsOptional()
    @IsNumber()
    num_pages: number;

    @IsOptional()
    @IsString()
    cate_id?: string; 

    @IsOptional()
    folder?: string[]
}