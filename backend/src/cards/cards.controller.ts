import { Controller, Post, Body, UseGuards, Patch, Param, Req, Get, Delete } from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { CardResponseDto } from './dto/card-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  // Obtiene todas las tarjetas de un tablero
  @Get()
  async findAllByBoard(): Promise<string> {
    const userId = "holis"
    return userId
  }

  // Crea una nueva tarjeta
  @Post()
  async create(@Body() createCardDto: CreateCardDto, @Req() req: AuthenticatedRequest): Promise<CardResponseDto> {
    const userId = req.user.sub;
    const card = await this.cardsService.create(createCardDto, userId);
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      order: card.order,
      listId: card.listId,
      completed: card.completed,
    };
  }


  // Actualiza una tarjeta existente
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CardResponseDto> {
    const userId = req.user.sub;
    const card = await this.cardsService.update(id, updateCardDto, userId);
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      order: card.order,
      listId: card.listId,
      completed: card.completed,
    };
  }

  // Elimina una tarjeta
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const result = await this.cardsService.remove(id, userId);
    if (result.count === 0) {
      return { message: 'No se encontró la tarjeta o no tienes permiso para eliminarla.' };
    }
    return { message: 'Tarjeta eliminada correctamente.' };
  }
}
