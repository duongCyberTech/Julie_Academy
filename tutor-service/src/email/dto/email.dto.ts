import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Period } from "@prisma/client";

export class EmailConfigDto {
  @IsString()
  header: string;

  @IsString()
  body: string;

  @IsString()
  template_name: string;

  @IsBoolean()
  use_template: boolean;

  @IsBoolean()
  active: boolean;

  @IsEnum(['weekly', 'monthly'])
  period: Period;

  @IsOptional()
  @IsNumber()
  day_of_week?: number;

  @IsOptional()
  @IsNumber()
  day_of_month?: number;
}