import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength } from "class-validator";

export class CreateUserDto {
@IsString()
@IsNotEmpty()
@IsEmail()
email: string

@IsString()
@IsNotEmpty()
name: string

@IsString()
@IsNotEmpty()
@MinLength(6)
@MaxLength(32)
password: string

}