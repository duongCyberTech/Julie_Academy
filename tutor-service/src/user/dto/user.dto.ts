import { UserRole } from "@prisma/client";
import { PartialType } from "@nestjs/mapped-types";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, MinLength, Matches, IsString, IsEnum, IsOptional, IsDate, ValidateIf } from "class-validator";

export class UserDto {
    @IsNotEmpty()
    @Matches(/^[\p{L}\s]+$/u, {
        message: 'Họ không hợp lệ',
    })
    fname!: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string' && value.trim() == '') {
            return undefined;
        }
        return value;
    })
    @Matches(/^[\p{L}\s]+$/u, {
        message: 'Tên không hợp lệ',
    })
    mname?: string;

    @IsNotEmpty()
    @Matches(/^[\p{L}\s]+$/u, {
        message: 'Tên không hợp lệ',
    })
    lname!: string;

    @IsNotEmpty()
    username!: string;

    @IsEmail({}, {message: "Invalid Email!"})
    email!: string;
    
    @IsNotEmpty()
    @IsEnum(UserRole, {
        message: 'Role phải là tutor, student hoặc parents',
    })
    role!: UserRole;

    @IsNotEmpty()
    @IsEnum(['active', 'inactive'])
    status!: 'active' | 'inactive';
    avata_url?: string;

    @IsNotEmpty({message: "Password Required!"})
    @IsString()
    @MinLength(8, { message: 'Password phải có ít nhất 8 ký tự' })
    @Matches(/^(?=.*[a-z])/, {
        message: 'Password phải chứa ít nhất 1 chữ thường',
    })
    @Matches(/^(?=.*[A-Z])/, {
        message: 'Password phải chứa ít nhất 1 chữ hoa',
    })
    @Matches(/^(?=.*\d)/, {
        message: 'Password phải chứa ít nhất 1 số',
    })
    @Matches(/^(?=.*[@$!%*?&])/,
        { message: 'Password phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)' },
    )
    password!: string;

    @IsOptional()
    @ValidateIf(o => o.dob !== '' && o.dob !== undefined && o.dob !== null)
    @IsDate()
    dob?: Date;

    @IsOptional()
    @IsString()
    school?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string' && value.trim() == '') {
            return undefined;
        }
        return value;
    })
    @Matches(/^(0|\+84)(3|5|7|8|9)+([0-9]{8})\b/, { message: 'Số điện thoại không hợp lệ' })
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsString()
    experiences?: string;
}

export class StudentDto {
    @IsOptional()
    @IsString()
    school?: string;

    @IsOptional()
    @ValidateIf(o => o.dob !== '' && o.dob !== undefined && o.dob !== null)
    @IsDate()
    dob?: Date;
}

export class TutorDto {
    @IsOptional()
    @Matches(/^(0|\+84)(3|5|7|8|9)+([0-9]{8})\b/, { message: 'Số điện thoại không hợp lệ' })
    phone_number?: string;
    
    @IsOptional()
    @IsString()
    experiences?: string;
}

export class ParentsDto {
    @IsOptional()
    @Matches(/^(0|\+84)(3|5|7|8|9)+([0-9]{8})\b/, { message: 'Số điện thoại không hợp lệ' })
    phone_number?: string;
}

export class PasswordChangeDto {
    @IsNotEmpty({message: "Current Password Required!"})
    @IsString()
    current_password!: string;

    @IsNotEmpty({message: "New Password Required!"})
    @IsString()
    @MinLength(8, { message: 'New Password phải có ít nhất 8 ký tự' })
    @Matches(/^(?=.*[a-z])/, {
        message: 'New Password phải chứa ít nhất 1 chữ thường',
    })
    @Matches(/^(?=.*[A-Z])/, {
        message: 'New Password phải chứa ít nhất 1 chữ hoa',
    })
    @Matches(/^(?=.*\d)/, {
        message: 'New Password phải chứa ít nhất 1 số',
    })
    @Matches(/^(?=.*[@$!%*?&])/,
        { message: 'New Password phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)' },
    )
    new_password!: string;

    @IsNotEmpty({message: "Confirm New Password Required!"})
    @IsString()
    confirm_new_password!: string;
}

export class UpdateUserDto extends PartialType(UserDto) {}