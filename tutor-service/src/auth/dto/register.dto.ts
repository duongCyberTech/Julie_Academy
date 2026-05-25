import { UserRole } from "@prisma/client";
import { IsEmail, IsNotEmpty, MinLength, Matches, IsString, IsEnum, IsOptional } from "class-validator";
import { SanitizeEmpty } from "src/validator/sanitize-empty.validator";

export class RegisterDto {
    @IsNotEmpty()
    @Matches(/^[\p{L}\s]+$/u, {
        message: 'Tên không hợp lệ',
    })
    fname!: string;

    @IsOptional()
    @SanitizeEmpty()
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

    @IsEmail({}, {message: "Định dạng email không hợp lệ!"})
    email!: string;
    
    @IsNotEmpty()
    @IsEnum(['tutor', 'student', 'parents'], {
        message: 'Role phải là tutor, student hoặc parents',
    })
    role!: 'tutor' | 'student' | 'parents';

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
}