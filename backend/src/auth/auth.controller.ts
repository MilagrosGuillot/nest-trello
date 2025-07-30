import { Controller, Post, Body, Get} from "@nestjs/common";
import {LoginDto} from "./dto/login.dto"
import {CreateUserDto} from "./dto/create-user.dto"
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    login(@Body() loginDto: LoginDto) { 
        return this.authService.login(loginDto);

    }

    @Post('register')
    register(@Body() createAuthDto: CreateUserDto) {
        return this.authService.register(createAuthDto);

     }

     @Get()
  getRoot() {
    return { message: 'Backend funcionando correctamente' };
  }
}