'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DndContext, DragEndEvent, closestCorners, UniqueIdentifier, closestCenter, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { List } from '@/components/List/List';
import { List as ListType, Card as CardType, Board as BoardType } from '@/types';
import { listsApi, cardsApi, boardsApi, usersApi } from '@/lib/api';
import AddMemberModal from './AddMemberModal';
import { io, Socket } from 'socket.io-client';
import {
  getTargetListAndOrder,
  getCardsToUpdate,
  applyLocalCardOrder,
  persistCardOrder
} from './boardDragHelpers';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BoardProps {
  boardId: string;
}

interface BoardEvent {
  boardId: string;
  type: 'card_created' | 'card_updated' | 'card_deleted' | 'list_created' | 'list_updated' | 'list_deleted' | 'member_added' | 'member_removed' | 'board_updated';
  data: any;
}

export function Board({ boardId }: BoardProps) {
  const [lists, setLists] = useState<ListType[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [board, setBoard] = useState<BoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [updatingCards, setUpdatingCards] = useState<Set<string>>(new Set());
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inviteModalRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState<{ id: string; email: string }[]>([]);
  const [emailError, setEmailError] = useState(false);

  // **** Lógica de carga de datos iniciales (listas, tarjetas, board) ****
  const fetchData = useCallback(async () => {
    try {
      const [listsData, cardsData, boardData] = await Promise.all([
        listsApi.getByBoard(boardId),
        cardsApi.getByBoard(boardId),
        boardsApi.getById(boardId)
      ]);
      setLists(listsData);
      setCards(cardsData);
      setBoard(boardData);
      setMembers(boardData.members || []);
    } catch (error) {
      console.error('Error fetching board data:', error);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  // **** Lógica de WebSockets: conexión y sincronización en tiempo real ****
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_board', boardId);
    });

    newSocket.on('disconnect', () => {
    });

    newSocket.on('board_update', (event) => {
      switch (event.type) {
        case 'card_created':
          setCards(prev => [...prev, event.data]);
          break;
        case 'card_updated':
          setCards(prev => prev.map(card => card.id === event.data.id ? { ...card, ...event.data } : card));
          break;
        case 'card_deleted':
          setCards(prev => prev.filter(card => card.id !== event.data.id));
          break;
        case 'list_created':
          setLists(prev => [...prev, event.data]);
          break;
        case 'list_updated':
          setLists(prev => prev.map(list => list.id === event.data.id ? event.data : list));
          break;
        case 'list_deleted':
          setLists(prev => prev.filter(list => list.id !== event.data.id));
          break;
        case 'member_added':
        case 'member_removed':
          fetchData();
          break;
        case 'board_updated':
          setBoard(event.data);
          break;
        default:
          break;
      }
    });

    newSocket.on('connect_error', () => {
    });

    newSocket.on('reconnect', () => {
      newSocket.emit('join_board', boardId);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave_board', boardId);
      newSocket.disconnect();
    };
  }, [boardId, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // **** Lógica de Drag & Drop de tarjetas ****
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeCard = cards.find(card => card.id === active.id);
    if (!activeCard) return;
    const { targetListId, targetOrder } = getTargetListAndOrder(over, cards, lists, activeCard);
    if (targetListId === null || targetOrder === null) return;
    const cardsToUpdate = getCardsToUpdate(activeCard, targetListId, targetOrder, cards, lists, over);
    setUpdatingCards(prev => new Set(prev).add(activeCard.id));
    applyLocalCardOrder(active, over, cards, setCards);
    try {
      await persistCardOrder(cardsToUpdate);
      toast.success('Tarjeta movida');
    } catch {
      setCards(cards);
      toast.error('Error al mover la tarjeta');
    } finally {
      setUpdatingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(activeCard.id);
        return newSet;
      });
    }
  };

  // **** Lógica de creación y edición de listas y título del board ****
  const handleAddList = async () => {
    const newListTitle = prompt('Enter list title:');
    if (!newListTitle?.trim()) return;
    try {
      const newList = await listsApi.create({
        title: newListTitle,
        order: lists.length,
        boardId,
      });
      setLists([...lists, newList]);
      toast.success('Lista creada');
    } catch (error) {
      console.error('Error adding list:', error);
      toast.error('Error al crear la lista');
    }
  };

  const handleTitleEdit = () => {
    if (!board) return;
    setEditingTitle(board.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (!board || !editingTitle.trim() || editingTitle === board.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      const updatedBoard = await boardsApi.update(boardId, { title: editingTitle.trim() });
      setBoard(updatedBoard);
      setIsEditingTitle(false);
    } catch (error) {
      setEditingTitle(board.title);
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setEditingTitle(board?.title || '');
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  // Función para eliminar miembro
  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este miembro del tablero?')) return;
    try {
      await boardsApi.removeMember(boardId, memberId);
      toast.success('Miembro eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar el miembro');
    }
  };

  const openInviteModal = () => {
    setShowInviteModal(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteEmail(e.target.value);
    setEmailError(false);
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      setEmailError(true);
      setInviteMessage('Por favor, ingresa un email válido');
      return;
    }
    setIsInviting(true);
    try {
      console.log('Invitando email directamente:', inviteEmail.trim());
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      if (!response.ok) {
        throw new Error('Error al invitar al miembro');
      }
      setInviteMessage('Usuario invitado exitosamente');
      fetchData();
    } catch (error) {
      setInviteMessage('Hubo un error al invitar al miembro');
    } finally {
      setIsInviting(false);
    }
  };

  const getSortedCardsForList = (listId: string) => {
    return cards
      .filter(card => card.listId === listId)
      .sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className={`min-h-screen text-white font-sans bg-gradient-to-r from-[#261750] to-[#5d4988] ${isDragging ? 'overflow-hidden' : ''}`}>
      <main className="sm:p-6 p-2">
        <div className="flex items-center justify-between mb-6 sm:flex-row flex-col gap-2 gap-y-4">
          <h1 className="text-3xl font-bold text-white text-center sm:text-left w-full sm:w-auto mt-4 sm:mt-0">Tablero</h1>
          <div className="flex gap-2 w-full sm:w-auto relative justify-center sm:justify-start">
            <div className="relative">
              <button
                onClick={openInviteModal}
                className="bg-white hover:bg-gray-100 text-gray-900 font-medium px-4 py-2 rounded transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Invitar
              </button>
              {showInviteModal && (
                <div
                  ref={inviteModalRef}
                  className="absolute right-0 top-full mt-2 min-w-[18rem] max-w-xs sm:max-w-sm w-[min(20rem,100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Añadir personas</h3>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email del invitado
                      </label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={handleEmailChange}
                        placeholder="usuario@ejemplo.com"
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-200 text-gray-900 placeholder-gray-500 text-sm hover:bg-gray-300 ${
                          emailError 
                            ? 'border-red-400 focus:ring-red-400/50 focus:border-red-400' 
                            : 'border-gray-300 focus:ring-indigo-400 focus:border-indigo-400'
                        }`}
                        onKeyPress={(e) => e.key === 'Enter' && handleInviteMember()}
                      />
                      {emailError && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Ingresa un email válido
                        </p>
                      )}
                    </div>
                    {inviteMessage && (
                      <div className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        inviteMessage.includes('exitosamente') 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {inviteMessage}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setShowInviteModal(false)}
                        className="flex-1 px-3 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-all duration-200 text-sm font-medium hover:scale-105 border border-gray-300"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleInviteMember}
                        disabled={isInviting || !inviteEmail.trim() || emailError}
                        className={`flex-1 px-3 py-2 rounded transition-all duration-200 text-sm font-medium hover:scale-105 disabled:hover:scale-100 ${
                          inviteEmail.trim() && !emailError && !isInviting
                            ? 'bg-black hover:bg-gray-800 text-white'
                            : 'bg-gray-300 text-gray-500'
                        }`}
                      >
                        {isInviting ? (
                          <div className="flex items-center justify-center gap-1">
                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                          </div>
                        ) : (
                          'Enviar'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleAddList}
              className="bg-white hover:bg-gray-100 text-gray-900 font-medium px-4 py-2 rounded transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Añadir lista
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full mb-6">
          <span className="text-sm text-gray-200 font-semibold mb-1 sm:mb-0">Participantes del tablero:</span>
          <div className="flex flex-wrap gap-2">
            {members.length === 0 && <span className="text-xs text-gray-400">Sin participantes</span>}
            {members.map((m) => (
              <span key={m.id} className="inline-flex items-center gap-2 bg-white/80 text-gray-800 rounded-full px-3 py-1 text-xs font-medium shadow border border-gray-200">
                <span className="inline-block w-6 h-6 rounded-full bg-purple-400 text-white flex items-center justify-center font-bold text-xs">
                  {m.email[0].toUpperCase()}
                </span>
                <span className="truncate max-w-[100px] sm:max-w-[160px]">{m.email}</span>
              </span>
            ))}
          </div>
        </div>
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <div
            className={`flex gap-4 pb-4 flex-nowrap w-full transition-all duration-150 ${
              isDragging ? 'overflow-x-hidden' : 'overflow-x-auto'
            }`}
          >
            {lists.map((list) => {
              const listCards = getSortedCardsForList(list.id);
              return (
                <List
                  key={list.id}
                  list={list}
                  cards={listCards}
                  onCardAdded={fetchData}
                />
              );
            })}
          </div>
        </DndContext>
      </main>
    </div>
  );
} 