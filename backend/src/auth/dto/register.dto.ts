import { IsEmail, IsNotEmpty, MinLength, Matches, IsString } from "class-validator";

export class RegisterDto {
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

    DoB?: Date;
    description?: string;
    phone_number?: string 
}