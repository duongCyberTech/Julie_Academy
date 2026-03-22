import { IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class FilterDTO {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    year: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    month: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    day: number
}