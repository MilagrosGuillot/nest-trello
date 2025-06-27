import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BoardGateway } from '../board/board.gateway';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private boardGateway: BoardGateway,
  ) {}

  async create(createCardDto: CreateCardDto, userId: string) {
    const { listId, ...rest } = createCardDto;

    const list = await this.prisma.list.findFirst({
      where: { 
        id: listId,
        board: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId: userId } } },
          ],
        },
      },
      include: { board: true },
    });

    if (!list) {
      throw new UnauthorizedException('Cannot create card in this list');
    }

    const newCard = await this.prisma.card.create({
      data: {
        ...rest,
        listId,
        description: createCardDto.description || '', 
      },
    });

    // Emitir evento WebSocket
    this.boardGateway.emitCardCreated(list.boardId, newCard);
    
    return newCard;
  }

  async update(id: string, updateCardDto: UpdateCardDto, userId: string) {
    const card = await this.prisma.card.findFirst({
      where: { 
        id,
        list: {
          board: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId: userId } } },
            ],
          },
        },
      },
      include: { list: { include: { board: true } } },
    });

    if (!card) {
      throw new UnauthorizedException('Cannot update this card');
    }


    let newList: any = null;
    if (updateCardDto.listId && updateCardDto.listId !== card.listId) {
      newList = await this.prisma.list.findFirst({
        where: { 
          id: updateCardDto.listId,
          board: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId: userId } } },
            ],
          },
        },
        include: { board: true },
      });
      if (!newList) {
        throw new UnauthorizedException('Cannot move card to this list');
      }
    }

    const updatedCard = await this.prisma.card.update({
      where: { id },
      data: updateCardDto,
    });

    // Emitir evento WebSocket con el boardId correcto
    const boardId = newList ? newList.boardId : card.list.boardId;
    console.log(`Emitiendo card_updated para board ${boardId}, card movida de lista ${card.listId} a lista ${updateCardDto.listId}`);
    this.boardGateway.emitCardUpdated(boardId, updatedCard);
    
    return updatedCard;
  }

  async findAllByBoard(boardId: string, userId: string) {
    // Verificar que el board pertenece al usuario o es miembro
    const board = await this.prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId: userId } } },
        ],
      },
    });

    if (!board) {
      throw new UnauthorizedException('Cannot access cards from this board');
    }

    // Obtener todas las listas del board
    const lists = await this.prisma.list.findMany({
      where: { boardId },
      select: { id: true },
    });

    const listIds = lists.map(list => list.id);

    // Obtener todas las cards de esas listas
    return this.prisma.card.findMany({
      where: {
        listId: {
          in: listIds,
        },
      },
      orderBy: [
        { listId: 'asc' },
        { order: 'asc' },
      ],
    });
  }

  async remove(id: string, userId: string) {
    // Verificar que la tarjeta existe y pertenece a un board del usuario o es miembro
    const card = await this.prisma.card.findFirst({
      where: {
        id,
        list: {
          board: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId: userId } } },
            ],
          },
        },
      },
      include: { list: { include: { board: true } } },
    });

    if (!card) {
      return { count: 0 };
    }

    const result = await this.prisma.card.deleteMany({
      where: { id },
    });

    // Emitir evento WebSocket
    if (result.count > 0) {
      this.boardGateway.emitCardDeleted(card.list.boardId, id);
    }

    return result;
  }
}
