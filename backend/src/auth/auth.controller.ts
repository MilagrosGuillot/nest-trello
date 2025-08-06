import { Controller, Post, Body, Get, HttpException, HttpStatus } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto"
import { CreateUserDto } from "./dto/create-user.dto"
import { AuthService } from './auth.service';
import { AuthMongoService } from './AuthMongoService';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly authMongoService: AuthMongoService) { }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);

  }

  @Post('register')
  register(@Body() createAuthDto: CreateUserDto) {
    return this.authService.register(createAuthDto);

  }
//--------------------PRUEBAS DE CONEXION A LA DATABASE--------------------
  @Get()
  getRoot() {
    return { message: 'Backend funcionando correctamente' };
  }

  @Get('db')
  async checkDB() {
    const isConnected = await this.authMongoService.checkConnection();
    if (isConnected) {
      return { ok: 'Conexión a la Database: OK' };
    } else {
      throw new HttpException(
        { error: 'Conexión a la Database: ERROR' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('db/init')
  async initDB() {
    const isConnected = await this.authMongoService.checkConnection();
    if (!isConnected) {
      throw new HttpException(
        { error: 'No se puede inicializar la Database' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.authMongoService.initDatabase();
      return { ok: 'Usuarios de prueba insertados' };
    } catch (error) {
      throw new HttpException(
        { error: 'Error al inicializar la Database' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}