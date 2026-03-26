import { Type } from "class-transformer";
import { IsDate, IsNumber, IsOptional } from "class-validator";

export class FilterDTO {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page: number = 1

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit: number = 10

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startAt: Date

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endAt: Date
}