import { 
    IsEnum,
    IsNotEmpty,
    IsOptional, 
    IsString
} from "class-validator";

import { NotificationType } from '@prisma/client'

export enum ReadStatus {
    have_read = 1,
    have_not_read = -1,
    all = 0
}

export class CreateNotificationDTO {
    @IsString()
    message: string

    @IsOptional()
    @IsEnum(NotificationType, {
        message: "Invalid Notification Type"
    })
    type?: NotificationType

    @IsOptional()
    @IsString()
    link_primary_id?: string 

    @IsOptional()
    @IsString()
    link_partial_id?: string 
}