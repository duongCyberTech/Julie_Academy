import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { EmailObjective, EmailTemplateType, Period } from "@prisma/client";

export class EmailConfigDto {
  @IsString()
  header!: string;

  @IsOptional()
  @IsString()
  body: string = "";

  @IsOptional()
  @IsString()
  template_id: string | null = null;

  @IsBoolean()
  use_template: boolean = false;

  @IsBoolean()
  active!: boolean;

  @IsEnum(['weekly', 'monthly'])
  period!: Period;

  @IsArray()
  @IsString({ each: true })
  receiver_ids: string[] = []

  @IsEnum(EmailObjective)
  send_to: EmailObjective = EmailObjective.all

  @IsOptional()
  @IsString()
  time_to_send: string = '00:00';

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

export class EmailTemplateCreateDto {
  @IsString()
  body: string = "";

  @IsOptional()
  @IsEnum(EmailTemplateType)
  type: EmailTemplateType = EmailTemplateType.public
}