import { 
    IsBoolean,
    IsDate,
    IsInt, 
    IsNumber,
    IsOptional,
    IsString,
    IsUUID
} from "class-validator";

export class AnalyticsDto {
    @IsInt()
    water_drops?: number;

    @IsInt()
    experience?: number;

    @IsBoolean()
    streak_trigger?: boolean = false
}

export class LevelConfigDto {
    @IsInt()
    exp_required!: number;
}

export class ActionConfigDto {
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    drops_claim!: number;
}