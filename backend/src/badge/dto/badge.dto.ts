import { AggregateType, BadgeType, ValueType } from "@prisma/client";

export class BadgeDto {
    title: string;
    description?: string;
    badge_url?: string;
    badge_type: BadgeType
    func_type: AggregateType
    value_type: ValueType
    threshold: number
}