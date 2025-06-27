import { Body, Controller, Get, Param, Post, Req, UseGuards, Delete, NotFoundException, Patch } from "@nestjs/common";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { AddMemberDto } from "./dto/add-member.dto";
import { BoardService } from "./board.service";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from "src/auth/interfaces/authenticated-request.interface";
import { BoardResponseDto } from "./dto/boardResponse.dto";

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardController{
    constructor(private readonly boardsService: BoardService) {}

    @Post()
    async create(@Body() createBoardDto: CreateBoardDto, @Req() req: AuthenticatedRequest): Promise<BoardResponseDto> {
    const userId = req.user.sub;
    const board = await this.boardsService.create(createBoardDto, userId);
    return {
        id: board.id,
        title: board.title,
        ownerId: board.ownerId,
        members: [],
    };
}

//obtener todos los tableros (boards) que pertenecen a ese usuario.
    @Get()
    async findAll(@Req() req: AuthenticatedRequest): Promise<BoardResponseDto[]> {
    const userId = req.user.sub;
    const boards = await this.boardsService.findAll(userId);
    // Mapea cada board a BoardResponseDto
    return boards.map(board => ({
        id: board.id,
        title: board.title,
        ownerId: board.ownerId,
        members: board.members?.map(member => ({
            id: member.user.id,
            email: member.user.email,
        })) || [],
    }));
}

// buscar el tablero con ese id que pertenezca al usuario
    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest): Promise<BoardResponseDto> {
        const userId = req.user.sub;
        const board = await this.boardsService.findOne(id, userId);
        if (!board) {
            throw new NotFoundException('No se encontró el tablero');
        }
        return {
            id: board.id,
            title: board.title,
            ownerId: board.ownerId,
            members: board.members?.map(member => ({
                id: member.user.id,
                email: member.user.email,
            })) || [],
        };
    }

    // Agregar miembro a un tablero
    @Post(':id/members')
    async addMember(
        @Param('id') boardId: string,
        @Body() addMemberDto: AddMemberDto,
        @Req() req: AuthenticatedRequest
    ): Promise<BoardResponseDto> {
        const userId = req.user.sub;
        const board = await this.boardsService.addMember(boardId, userId, addMemberDto);
        if (!board) {
            throw new NotFoundException('No se encontró el tablero');
        }
        return {
            id: board.id,
            title: board.title,
            ownerId: board.ownerId,
            members: board.members?.map(member => ({
                id: member.user.id,
                email: member.user.email,
            })) || [],
        };
    }

    // Remover miembro de un tablero
    @Delete(':id/members/:memberId')
    async removeMember(
        @Param('id') boardId: string,
        @Param('memberId') memberId: string,
        @Req() req: AuthenticatedRequest
    ): Promise<BoardResponseDto> {
        const userId = req.user.sub;
        const board = await this.boardsService.removeMember(boardId, userId, memberId);
        if (!board) {
            throw new NotFoundException('No se encontró el tablero');
        }
        return {
            id: board.id,
            title: board.title,
            ownerId: board.ownerId,
            members: board.members?.map(member => ({
                id: member.user.id,
                email: member.user.email,
            })) || [],
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateBoardDto: UpdateBoardDto,
        @Req() req: AuthenticatedRequest
    ): Promise<BoardResponseDto> {
        const userId = req.user.sub;
        const board = await this.boardsService.update(id, updateBoardDto, userId);
        if (!board) {
            throw new NotFoundException('No se encontró el tablero');
        }
        return {
            id: board.id,
            title: board.title,
            ownerId: board.ownerId,
            members: board.members?.map(member => ({
                id: member.user.id,
                email: member.user.email,
            })) || [],
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const userId = req.user.sub;
        const result = await this.boardsService.remove(id, userId);
        if (result.count === 0) {
            return { message: 'No se encontró el tablero o no tienes permiso para eliminarlo.' };
        }
        return { message: 'Tablero eliminado correctamente.' };
    }
}