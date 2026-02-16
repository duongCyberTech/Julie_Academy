import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

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
    @IsString()
    title: string

    @IsString()
    content: string

    @IsArray({ message: 'deletedImages phải là một mảng' })
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
    @IsString({ each: true })
    deletedImages: string[];
}