import { Transform, Type } from "class-transformer";
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
    @IsArray()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return [value];
            }
        }
        return value;
    })
    @IsEmail({}, { each: true, message: 'Each item in emails must be a valid email' })
    emails?: string[]
}

export class UpdateCommentDto {
    @IsOptional()
    @IsString()
    content: string

    @IsOptional()
    @IsArray()
    deletedImages: string[]
}