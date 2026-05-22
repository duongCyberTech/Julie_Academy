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

export enum HistorySort {
    newest = "newest",     // doneAt desc (mặc định, giống hành vi cũ)
    oldest = "oldest",     // doneAt asc
    highest = "highest",   // final_score desc, doneAt desc tie-break
    lowest = "lowest",     // final_score asc, doneAt desc tie-break
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

    @IsOptional()
    @IsEnum(HistorySort)
    sort: HistorySort = HistorySort.newest
}

export class PartialFilterDTO extends PartialType(FilterDTO) {}