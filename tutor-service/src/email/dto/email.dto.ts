import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Period } from "@prisma/client";

export class EmailConfigDto {
  @IsString()
  header: string;

  @IsOptional()
  @IsString()
  body: string = "";

  @IsOptional()
  @IsString()
  template_id?: string;

  @IsBoolean()
  use_template: boolean = false;

  @IsBoolean()
  active: boolean;

  @IsEnum(['weekly', 'monthly'])
  period: Period;

  @IsOptional()
  @IsString()
  time_to_send?: string = '00:00';

  @IsOptional()
  @IsNumber()
  day_of_week?: number;

  @IsOptional()
  @IsNumber()
  day_of_month?: number;

  @IsOptional()
  @IsBoolean()
  create_as_template?: boolean = false;
}