import { Type } from "class-transformer";
import { IsNotEmpty, IsString, Min, Max, IsOptional, IsEnum, IsNumber, IsDateString, IsDate } from "class-validator";

export class ClassDto {
    @IsNotEmpty({ message: 'Classname is required' })
    classname: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    createdAt: Date;

    @IsOptional()
    updateAt: Date;

    @IsOptional()
    @IsDateString()
    startat: string;

    @IsNumber()
    duration_time: number;

    @IsNumber()
    nb_of_student: number;

    @IsOptional()
    @IsEnum(['pending', 'ongoing', 'completed', 'cancelled'])
    status: 'pending' | 'ongoing' | 'completed' | 'cancelled' = 'pending';

    @IsNumber()
    @Min(6, { message: 'Grade must be at least 6' })
    @Max(9, { message: 'Grade must be at most 9' })
    grade: number;
    
    @IsString()
    @IsNotEmpty({ message: 'Subject is required' })
    subject: string;

    @IsOptional()
    @IsString()
    plan_id?: string
}

export class ScheduleDto {
    @IsNumber()
    meeting_date: number;

    @IsString()
    startAt: string;

    @IsString()
    endAt: string;

    @IsString()
    @IsOptional()
    link_meet: string;
}

export class ResourceCopyDto {
    @IsString()
    class_id: string;

    @IsString()
    category_id: string;

    @IsString()
    folder_id: string;

    @IsString()
    folder_name: string;

    @IsString()
    tutor_id: string;
}