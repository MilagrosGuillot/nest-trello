import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BoardsModule } from '../board/boards.module';

@Module({
  imports: [PrismaModule, BoardsModule],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}
