import { ExamType } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, IsOptional } from "class-validator";

export enum TimeRange {
    week = "week",
    month = "month",
    year = "year"
}

export enum ExamFilterType {
    practice = 'practice',
    test = 'test',
    adaptive = 'adaptive',
    all = 'all'
}

export class FilterDTO {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit: number = 10

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startAt: Date

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endAt: Date

    @IsOptional()
    @IsEnum(TimeRange)
    group_time: TimeRange = TimeRange.week

    @IsOptional()
    @IsEnum(ExamFilterType)
    exam_type: ExamFilterType = ExamFilterType.practice
}