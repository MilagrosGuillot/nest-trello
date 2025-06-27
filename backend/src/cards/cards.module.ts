import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BoardsModule } from '../board/boards.module';

@Module({
  imports: [PrismaModule, BoardsModule],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
