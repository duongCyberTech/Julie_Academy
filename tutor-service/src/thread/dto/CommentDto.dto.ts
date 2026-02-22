import { Type } from "class-transformer";
import { IsAlpha, IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCommentDto {
    @IsNotEmpty()
    @IsString()
    content: string

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    parent_cmt_id?: number

    @IsOptional()
    @IsEmail()
    email?: string
}

export class UpdateCommentDto {
    @IsOptional()
    @IsString()
    content: string

    @IsOptional()
    @IsArray()
    deletedImages: string[]
}