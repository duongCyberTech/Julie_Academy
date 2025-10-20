import { IsNotEmpty, IsString, Min, Max } from "class-validator";
import { Url } from "url";

export class ClassDto {
    @IsNotEmpty({ message: 'Classname is required' })
    classname: string;

    description?: string;
    createdAt: Date;
    updateAt: Date;
    startAt: Date;
    duration_time: number;
    nb_of_student: number;
    status: 'pending' | 'ongoing' | 'completed' | 'cancelled';

    @Min(6, { message: 'Grade must be at least 6' })
    @Max(9, { message: 'Grade must be at most 9' })
    grade: number;
    
    @IsNotEmpty({ message: 'Subject is required' })
    subject: string;

}

export class ScheduleDto {
    meeting_date: number;
    startAt: string;
    endAt: string;
    link_meet: string;
}