import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateThreadDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    content: string

    @IsNotEmpty()
    @IsUUID()
    class_id: string
}

export class UpdateThreadDto {
    @IsOptional()
    @IsString()
    title?: string

    @IsOptional()
    @IsString()
    content?: string
}