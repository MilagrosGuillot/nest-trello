import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private jwtService: JwtService, ) {}

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({ where: { email } });
    
        if (!user) {
          throw new UnauthorizedException('Credenciales inválidas');
        }
    
        const isPasswordMatching = await bcrypt.compare(password, user.password);
    
        if (!isPasswordMatching) {
          throw new UnauthorizedException('Credenciales inválidas');
        }
    
        const payload = { sub: user.id, email: user.email };
        
        const { password: _, ...userWithoutPassword } = user;
        return {
          access_token: await this.jwtService.signAsync(payload),
          user: userWithoutPassword,
        };
      }
    
      async register(createUserDto: CreateUserDto) {
        const { email, password, name } = createUserDto;
    
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          throw new ConflictException('Ya existe un usuario con este correo electrónico');
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = await this.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
          },
        });
    
        const { password: _, ...result } = user;
        return result;
      }
      
}