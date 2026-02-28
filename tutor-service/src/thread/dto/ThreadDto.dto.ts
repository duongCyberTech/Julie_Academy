import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

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
    @IsString({ each: true })
    open_list?: string[]

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === 1 || value === '1' || value === true) return true;
        if (value === 'false' || value === 0 || value === '0' || value === false) return false;
        return value;
    })
    @IsBoolean()
    is_restricted?: boolean
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