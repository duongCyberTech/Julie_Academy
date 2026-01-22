import { IsEmail, IsNotEmpty, MinLength, Matches, IsString } from "class-validator";

export class UserDto {
    fname: string;
    mname: string;
    lname: string;
    username: string;

    @IsEmail({}, {message: "Invalid Email!"})
    email: string;
    
    role: 'admin' | 'student' | 'tutor' | 'parents';
    status: 'active' | 'inactive';
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
    password: string;
    dob?: Date;
    school?: string;
    phone_number?: string;
    experiences?: string;
}

export class StudentDto {
    @IsNotEmpty()
    @IsString()
    school: string;

    @IsNotEmpty()
    dob: Date;
}

export class TutorDto {
    @Matches(/^(0|\+84)(3|5|7|8|9)+([0-9]{8})\b/, { message: 'Số điện thoại không hợp lệ' })
    phone_number: string;
    
    experiences: string;
}

export class ParentsDto {
    @Matches(/^(0|\+84)(3|5|7|8|9)+([0-9]{8})\b/, { message: 'Số điện thoại không hợp lệ' })
    phone_number: string;
}