import { UserRole } from "@prisma/client";
import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, MinLength, Matches, IsString, IsEnum, IsOptional, IsDate } from "class-validator";
import { SanitizeEmpty } from "src/validator/sanitize-empty.validator";

export class UserDto {
    @IsNotEmpty()
    @Matches(/^[\p{L}\s]+$/u, {
        message: 'Họ không hợp lệ',
    })
    fname!: string;

    @IsOptional()
    @SanitizeEmpty()
    @Matches(/^[\p{L}\s]+$/u, {
        message: 'Tên lót không hợp lệ',
    })
    mname?: string;

    @IsNotEmpty()
    @Matches(/^[\p{L}\s]+$/u, {
        message: 'Tên không hợp lệ',
    })
    lname!: string;

    @IsNotEmpty()
    username!: string;

    @IsEmail({}, {message: "Định dạng email không hợp lệ!"})
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

    @IsNotEmpty({message: "Không được để trống mật khẩu!"})
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
    @SanitizeEmpty()
    @IsDate()
    dob?: Date;

    @IsOptional()
    @SanitizeEmpty()
    @IsString()
    school?: string;

    @IsOptional()
    @SanitizeEmpty()
    @Matches(/^(0|\+84)(3|5|7|8|9)+([0-9]{8})\b/, { message: 'Số điện thoại không hợp lệ' })
    @IsString()
    phone_number?: string;

    @IsOptional()
    @SanitizeEmpty()
    @IsString()
    experiences?: string;
}

export class StudentDto {
    @IsOptional()
    @SanitizeEmpty()
    @IsString()
    school?: string;

    @IsOptional()
    @SanitizeEmpty()
    @IsDate()
    dob?: Date;
}

export class TutorDto {
    @IsOptional()
    @SanitizeEmpty()
    @Matches(/^(0|\+84)(3|5|7|8|9)+([0-9]{8})\b/, { message: 'Số điện thoại không hợp lệ' })
    phone_number?: string;
    
    @IsOptional()
    @SanitizeEmpty()
    @IsString()
    experiences?: string;
}

export class ParentsDto {
    @IsOptional()
    @SanitizeEmpty()
    @Matches(/^(0|\+84)(3|5|7|8|9)+([0-9]{8})\b/, { message: 'Số điện thoại không hợp lệ' })
    phone_number?: string;
}

export class PasswordChangeDto {
    @IsNotEmpty({message: "Không được để trống mật khẩu hiện tại!"})
    @IsString()
    current_password!: string;

    @IsNotEmpty({message: "Không được để trống mật khẩu mới!"})
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

    @IsNotEmpty({message: "Xác nhận mật khẩu mới không được để trống!"})
    @IsString()
    confirm_new_password!: string;
}

export class UpdateUserDto extends PartialType(UserDto) {}