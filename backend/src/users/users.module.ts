import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';


@Module({ 
    controllers: [UsersController], 
    providers: [UsersService],
    imports: [PrismaService] 
  })                       
  export class UsersModule {}
  