import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { BoardGateway } from './board.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BoardController],
  providers: [BoardService, BoardGateway],
  exports: [BoardGateway],
})
export class BoardsModule {}
