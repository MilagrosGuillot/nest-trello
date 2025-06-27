import { Controller, Post, Body, UseGuards, Req, Get, Put, Delete, Param, NotFoundException } from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { ListResponseDto } from './dto//list-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  // Crea una nueva lista
  @Post()
  async create(@Body() createListDto: CreateListDto, @Req() req: AuthenticatedRequest): Promise<ListResponseDto> {
    const userId = req.user.sub;
    const list = await this.listsService.create(createListDto, userId);
    return {
      id: list.id,
      title: list.title,
      order: list.order,
      boardId: list.boardId,
    };
  }

  // Obtiene todas las listas de un tablero especifico
  @Get('board/:boardId')
  async findAllByBoard(@Param('boardId') boardId: string, @Req() req: AuthenticatedRequest): Promise<ListResponseDto[]> {
    const userId = req.user.sub;
    const lists = await this.listsService.findAllByBoard(boardId, userId);
    return lists.map(list => ({
      id: list.id,
      title: list.title,
      order: list.order,
      boardId: list.boardId,
    }));
  }

  // Actualiza una lista existente
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateListDto: CreateListDto, @Req() req: AuthenticatedRequest): Promise<ListResponseDto> {
    const userId = req.user.sub;
    const list = await this.listsService.update(id, updateListDto, userId);
    if (!list) {
      throw new NotFoundException('No se encontró la lista');
    }
    return {
      id: list.id,
      title: list.title,
      order: list.order,
      boardId: list.boardId,
    };
  }

  // Elimina una lista
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const result = await this.listsService.remove(id, userId);
    if (result.count === 0) {
      return { message: 'No se encontró la lista o no tienes permiso para eliminarla.' };
    }
    return { message: 'Lista eliminada correctamente.' };
  }
}
