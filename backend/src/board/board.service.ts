import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { AddMemberDto } from "./dto/add-member.dto";
import { BoardGateway } from "./board.gateway";

@Injectable()
export class BoardService{
    constructor(
        private readonly prisma: PrismaService,
        private readonly boardGateway: BoardGateway
    ){}

    create(createBoardDto: CreateBoardDto, userId: string) {
        return this.prisma.board.create({
          data: {
            ...createBoardDto,
            ownerId: userId,
          },
        });
      }

      findAll(userId: string) {
        return this.prisma.board.findMany({
          where: {
            OR: [
              { ownerId: userId }, // Tableros que creó
              { members: { some: { userId: userId } } }, // Tableros donde es miembro
            ],
          },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        });
      }
    
      findOne(id: string, userId: string) {
        return this.prisma.board.findFirst({
          where: {
            id,
            OR: [
              { ownerId: userId },
              { members: { some: { userId: userId } } },
            ],
          },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
            lists: {
              include: {
                cards: true,
              },
            },
          },
        });
      }

    async addMember(boardId: string, userId: string, addMemberDto: AddMemberDto) {
        // Verificar que el usuario que hace la petición es el owner
        const board = await this.prisma.board.findFirst({
          where: {
            id: boardId,
            ownerId: userId,
          },
        });

        if (!board) {
          throw new ForbiddenException('Solo el propietario puede agregar miembros');
        }

        // Verificar que el usuario a agregar existe
        const userToAdd = await this.prisma.user.findUnique({
          where: { id: addMemberDto.userId },
        });

        if (!userToAdd) {
          throw new NotFoundException('Usuario no encontrado');
        }

        // Verificar que no es el owner (no tiene sentido agregar al owner como miembro)
        if (addMemberDto.userId === userId) {
          throw new ForbiddenException('No puedes agregarte a ti mismo como miembro');
        }

        // Verificar que no es ya miembro
        const existingMember = await this.prisma.boardMember.findFirst({
          where: {
            boardId: boardId,
            userId: addMemberDto.userId,
          }
        });

        if (existingMember) {
          throw new ForbiddenException('El usuario ya es miembro de este tablero');
        }

        // Agregar el miembro
        await this.prisma.boardMember.create({
          data: {
            boardId: boardId,
            userId: addMemberDto.userId,
          }
        });

        // Emitir evento WebSocket para notificar a todos los usuarios del tablero
        this.boardGateway.emitToBoard(boardId, {
          boardId,
          type: 'member_added',
          data: { userId: addMemberDto.userId, email: userToAdd.email }
        });

        // Retornar el board actualizado
        return this.prisma.board.findUnique({
          where: { id: boardId },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        });
    }

    async removeMember(boardId: string, userId: string, memberId: string) {
        // Verificar que el usuario que hace la petición es el owner
        const board = await this.prisma.board.findFirst({
          where: {
            id: boardId,
            ownerId: userId,
          },
        });

        if (!board) {
          throw new ForbiddenException('Solo el propietario puede remover miembros');
        }

        // Verificar que el miembro existe en el tablero
        const existingMember = await this.prisma.boardMember.findFirst({
          where: {
            boardId: boardId,
            userId: memberId,
          }
        });

        if (!existingMember) {
          throw new NotFoundException('El usuario no es miembro de este tablero');
        }

        // Remover el miembro
        await this.prisma.boardMember.delete({
          where: { id: existingMember.id }
        });

        // Emitir evento WebSocket para notificar a todos los usuarios del tablero
        this.boardGateway.emitToBoard(boardId, {
          boardId,
          type: 'member_removed',
          data: { userId: memberId }
        });

        // Retornar el board actualizado
        return this.prisma.board.findUnique({
          where: { id: boardId },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        });
    }

    async update(id: string, updateBoardDto: UpdateBoardDto, userId: string) {
        // Verificar que el tablero existe y el usuario tiene permisos
        const board = await this.prisma.board.findFirst({
            where: {
                id,
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId: userId } } },
                ],
            },
        });

        if (!board) {
            throw new NotFoundException('Tablero no encontrado o sin permisos');
        }

        // Solo el propietario puede actualizar el tablero
        if (board.ownerId !== userId) {
            throw new ForbiddenException('Solo el propietario puede actualizar el tablero');
        }

        // Actualizar el tablero
        const updatedBoard = await this.prisma.board.update({
            where: { id },
            data: updateBoardDto,
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        // Emitir evento WebSocket para notificar a todos los usuarios del tablero
        this.boardGateway.emitBoardUpdated(id, updatedBoard);

        return updatedBoard;
    }

    remove(id: string, userId: string) {
        return this.prisma.board.deleteMany({
            where: {
                id,
                ownerId: userId,
            },
        });
    }
}