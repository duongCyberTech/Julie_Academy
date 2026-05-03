import { IsBoolean, IsString } from "class-validator";

export class SystemConfigValidatorDto {
  @IsString()
  key!: string;

  @IsBoolean()
  value!: boolean;
}