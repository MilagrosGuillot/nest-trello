// Hook personalizado para gestionar la conexión y eventos de WebSocket en un tablero específico
// Sincroniza en tiempo real las listas, tarjetas y miembros de un tablero 

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Board, List, Card } from '@/types';

// Estructura de los eventos recibidos desde el backend
interface BoardEvent {
  boardId: string;
  type: 'card_created' | 'card_updated' | 'card_deleted' | 'list_created' | 'list_updated' | 'list_deleted' | 'member_added' | 'member_removed' | 'board_updated';
  data: any;
}

// Props requeridos para el hook
interface UseBoardWebSocketProps {
  boardId: string; // ID del tablero a sincronizar
  setLists: React.Dispatch<React.SetStateAction<List[]>>; // Setter para actualizar listas
  setCards: React.Dispatch<React.SetStateAction<Card[]>>; // Setter para actualizar tarjetas
  setBoard: React.Dispatch<React.SetStateAction<Board | null>>; // Setter para actualizar el tablero
  fetchData: () => void; // Función para recargar datos completos (cuando es necesario)
  updatingCards: Set<string>; // IDs de tarjetas que se están actualizando localmente (para evitar sobrescribir cambios locales)
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>; // Setter para estado de conexión
}


export function useBoardWebSocket({
  boardId,
  setLists,
  setCards,
  setBoard,
  fetchData,
  updatingCards,
  setIsConnected,
}: UseBoardWebSocketProps) {
  useEffect(() => {
    // Crear la conexión con el backend usando Socket.IO
    const socket: Socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    // Al conectar, unirse a la sala del tablero
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_board', boardId);
    });

    // Al desconectar, actualizar estado
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Manejar eventos de actualización del tablero
    socket.on('board_update', (event: BoardEvent) => {
      switch (event.type) {
        case 'card_created':
          // Agregar nueva tarjeta al estado
          setCards(prev => [...prev, event.data]);
          break;
        case 'card_updated':
          // Recargar datos completos (para evitar inconsistencias)
          fetchData();
          break;
        case 'card_deleted':
          // Eliminar tarjeta del estado
          setCards(prev => prev.filter(card => card.id !== event.data.id));
          break;
        case 'list_created':
          // Agregar nueva lista al estado
          setLists(prev => [...prev, event.data]);
          break;
        case 'list_updated':
          // Actualizar lista modificada
          setLists(prev => prev.map(list => list.id === event.data.id ? event.data : list));
          break;
        case 'list_deleted':
          // Eliminar lista del estado
          setLists(prev => prev.filter(list => list.id !== event.data.id));
          break;
        case 'member_added':
        case 'member_removed':
          // Recargar datos completos (miembros cambiaron)
          fetchData();
          break;
        case 'board_updated':
          // Actualizar datos generales del tablero
          setBoard(event.data);
          break;
        default:
          break;
      }
    });

    // Manejar error de conexión
    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Al reconectar, volver a unirse a la sala
    socket.on('reconnect', () => {
      setIsConnected(true);
      socket.emit('join_board', boardId);
    });

    // Cleanup: salir de la sala y cerrar conexión al desmontar o cambiar boardId
    return () => {
      socket.emit('leave_board', boardId);
      socket.disconnect();
    };
  }, [boardId, setLists, setCards, setBoard, setIsConnected, updatingCards, fetchData]);
} 