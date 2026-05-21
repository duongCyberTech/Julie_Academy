import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { IsIsoDateTime, TransformToIsoDateTime } from "src/validator/date-iso.validator";

export enum TimeRange {
    week = "week",
    month = "month",
    term = "term",
    year = "year"
}

export enum ExamFilterType {
    practice = 'practice',
    test = 'test',
    adaptive = 'adaptive',
    all = 'all'
}

export enum AttentionIssue {
    all = "all",
    downgrade = "downgrade",
    test_miss = "test_miss"
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
    @TransformToIsoDateTime()
    @IsIsoDateTime()
    startAt!: Date

    @IsOptional()
    @TransformToIsoDateTime()
    @IsIsoDateTime()
    endAt!: Date

    @IsOptional()
    @IsEnum(TimeRange)
    group_time: TimeRange = TimeRange.week

    @IsOptional()
    @IsEnum(ExamFilterType)
    exam_type: ExamFilterType = ExamFilterType.practice

    @IsOptional()
    @IsEnum(AttentionIssue)
    issue: AttentionIssue = AttentionIssue.all

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    grade_threshold: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    test_miss_threshold: number = 1
}

export class PartialFilterDTO extends PartialType(FilterDTO) {}