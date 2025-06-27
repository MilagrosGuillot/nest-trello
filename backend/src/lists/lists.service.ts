import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async create(createListDto: CreateListDto, userId: string) {
    const { boardId, ...rest } = createListDto;
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
      throw new UnauthorizedException('No puedes crear una lista en este tablero');
    }

    return this.prisma.list.create({
      data: {
        ...rest,
        boardId,
      },
    });
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
      throw new UnauthorizedException('No tienes acceso a las listas de este tablero');
    }

    return this.prisma.list.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
    });
  }

  async update(id: string, updateListDto: CreateListDto, userId: string) {
    const { boardId, ...rest } = updateListDto;
    
    // Verificar que la lista existe y pertenece a un board del usuario o es miembro
    const list = await this.prisma.list.findFirst({
      where: {
        id,
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
      return null;
    }

    return this.prisma.list.update({
      where: { id },
      data: {
        ...rest,
        boardId,
      },
    });
  }

  async remove(id: string, userId: string) {
    // Verificar que la lista existe y pertenece a un board del usuario o es miembro
    const list = await this.prisma.list.findFirst({
      where: {
        id,
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
      return { count: 0 };
    }

    return this.prisma.list.deleteMany({
      where: { id },
    });
  }
}
