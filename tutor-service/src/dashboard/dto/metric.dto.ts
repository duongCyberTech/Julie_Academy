import { IsNumber, IsOptional } from "class-validator";

export class ApiMetricsDto {
    @IsOptional()
    @IsNumber()
    duration?: number;
}