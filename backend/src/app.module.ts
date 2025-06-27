import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './board/boards.module';
import { ListsModule } from './lists/lists.module';
import { CardsModule } from './cards/cards.module';
dotenv.config();

@Module({
  imports: [
    AuthModule,
    BoardsModule,
    ListsModule,
    CardsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
