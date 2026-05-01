import { IsOptional, IsString } from "class-validator"

export class MailObjectDto {
  @IsOptional()
  @IsString()
  from?: string = '"Julie Academy" <no-reply@gmail.com>'

  @IsString()
  to!: string

  @IsString()
  subject!: string

  @IsString()
  content!: string

  @IsOptional()
  @IsString()
  fileContent?: string
}