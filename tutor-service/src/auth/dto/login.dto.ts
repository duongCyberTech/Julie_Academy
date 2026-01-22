import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from "class-validator";

export class LoginDto {
    @IsEmail({}, {message: "Invalid Email!"})
    email: string;

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
    password: string
}