import { AggregateType, BadgeType, ValueType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class BadgeDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsEnum(BadgeType)
    badge_type: BadgeType

    @IsNotEmpty()
    @IsEnum(AggregateType)
    func_type: AggregateType

    @IsNotEmpty()
    @IsEnum(ValueType)
    value_type: ValueType

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    threshold: number
}