import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';

interface BoardEvent {
  boardId: string;
  type: 'card_created' | 'card_updated' | 'card_deleted' | 'list_created' | 'list_updated' | 'list_deleted' | 'member_added' | 'member_removed' | 'board_updated';
  data: any;
}

@WebSocketGateway({
  cors: {
    origin: "*", // Permitir todos los orígenes en desarrollo
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Habilitar ambos transportes
})
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  // Mapa para rastrear qué usuarios están en qué tableros
  private userBoards = new Map<string, Set<string>>();

  //Esto se ejecuta cuando se inicia
  afterInit(server: Server) {
    console.log('🚀 WebSocket Gateway initialized!');
  }
 
  //Detecta cuando alguien se conecta al socket
  // @UseGuards(WsJwtGuard)
  handleConnection(client: Socket) {
    console.log(`✅ Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
    // Limpiar el usuario de todos los tableros
    this.userBoards.delete(client.id);
  }

  @SubscribeMessage('join_board')
  // @UseGuards(WsJwtGuard)
  handleJoinBoard(client: Socket, boardId: string) {
    console.log(`🎯 User ${client.id} trying to join board ${boardId}`);
    
    // Unirse a la sala del tablero
    client.join(`board_${boardId}`);
    
    // Registrar que este usuario está en este tablero
    if (!this.userBoards.has(client.id)) {
      this.userBoards.set(client.id, new Set());
    }
    this.userBoards.get(client.id)?.add(boardId);
    
    console.log(`✅ User ${client.id} joined board ${boardId}`);
  }

  @SubscribeMessage('leave_board')
  // @UseGuards(WsJwtGuard)
  handleLeaveBoard(client: Socket, boardId: string) {
    // Salir de la sala del tablero
    client.leave(`board_${boardId}`);
    
    // Remover el tablero de la lista del usuario
    this.userBoards.get(client.id)?.delete(boardId);
    
    console.log(`👋 User ${client.id} left board ${boardId}`);
  }

  // Método para emitir eventos a todos los usuarios de un tablero
  emitToBoard(boardId: string, event: BoardEvent) {
    this.server.to(`board_${boardId}`).emit('board_update', event);
    console.log(`📡 Emitted ${event.type} to board ${boardId}`);
  }

  // Métodos específicos para diferentes tipos de eventos
  emitCardCreated(boardId: string, card: any) {
    this.emitToBoard(boardId, {
      boardId,
      type: 'card_created',
      data: card,
    });
  }

  emitCardUpdated(boardId: string, card: any) {
    this.emitToBoard(boardId, {
      boardId,
      type: 'card_updated',
      data: card,
    });
  }

  emitCardDeleted(boardId: string, cardId: string) {
    this.emitToBoard(boardId, {
      boardId,
      type: 'card_deleted',
      data: { id: cardId },
    });
  }

  emitListCreated(boardId: string, list: any) {
    this.emitToBoard(boardId, {
      boardId,
      type: 'list_created',
      data: list,
    });
  }

  emitListUpdated(boardId: string, list: any) {
    this.emitToBoard(boardId, {
      boardId,
      type: 'list_updated',
      data: list,
    });
  }

  emitListDeleted(boardId: string, listId: string) {
    this.emitToBoard(boardId, {
      boardId,
      type: 'list_deleted',
      data: { id: listId },
    });
  }

  emitBoardUpdated(boardId: string, board: any) {
    this.emitToBoard(boardId, {
      boardId,
      type: 'board_updated',
      data: board,
    });
  }
} 