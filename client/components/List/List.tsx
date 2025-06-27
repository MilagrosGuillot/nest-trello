'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/Card/Card';
import { List as ListType, Card as CardType } from '@/types';
import { useState } from 'react';
import { cardsApi, listsApi } from '@/lib/api';
import { toast } from 'sonner';

interface ListProps {
  list: ListType;
  cards: CardType[];
  onCardAdded: () => void;
}

export function List({ list, cards, onCardAdded }: ListProps) {
  const { setNodeRef, isOver } = useDroppable({ id: list.id });
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(list.title);
  const [savingTitle, setSavingTitle] = useState(false);

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;

    try {
      await cardsApi.create({
        title: newCardTitle,
        order: cards.length,
        listId: list.id,
      });
      toast.success('Tarjeta creada');
      setNewCardTitle('');
      setIsAddingCard(false);
      onCardAdded();
    } catch (error) {
      toast.error('Error al crear la tarjeta');
      console.error('Error adding card:', error);
    }
  };

  const handleTitleEdit = () => {
    setEditingTitle(list.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (!isEditingTitle) return;
    const trimmed = editingTitle.trim();
    if (!trimmed || trimmed === list.title) {
      setIsEditingTitle(false);
      setEditingTitle(list.title);
      return;
    }
    setSavingTitle(true);
    try {
      await listsApi.update(list.id, { title: trimmed, order: list.order, boardId: list.boardId });
      setIsEditingTitle(false);
      setEditingTitle(trimmed);
    } catch (error) {
      setEditingTitle(list.title);
      setIsEditingTitle(false);
    } finally {
      setSavingTitle(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleSave();
    if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditingTitle(list.title);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar esta lista? Todas las tarjetas dentro también se eliminarán.')) return;
    try {
      await listsApi.delete(list.id);
      toast.success('Lista eliminada');
      onCardAdded(); // Refresca el board
    } catch (error) {
      toast.error('Error al eliminar la lista');
    }
  };

  return (
    <div
      className={`bg-white/10 rounded-xl p-4 text-white shadow-lg w-full sm:w-[280px] md:w-[300px] lg:w-[340px] flex-shrink-0 transition-all duration-200 border border-white/20 relative ${isOver ? 'ring-2 ring-blue-400 scale-[1.02] shadow-2xl z-10' : ''}`}
      style={{ minHeight: 180 }}
    >
      {/* Encabezado de la lista */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={editingTitle}
              onChange={e => setEditingTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              disabled={savingTitle}
              className="font-semibold text-lg text-white/90 bg-white/10 border border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition max-w-[180px]"
              autoFocus
            />
          ) : (
            <h2
              className="font-semibold text-lg text-white/90 truncate max-w-[180px] cursor-pointer hover:bg-white/10 rounded px-1 py-1 transition-colors"
              title={list.title}
              onClick={handleTitleEdit}
            >
              {list.title}
            </h2>
          )}
        </div>
        <span className="inline-block min-w-7 px-2 py-1 rounded-full bg-white/80 text-purple-700 font-bold text-xs shadow border border-purple-300">
          {cards.length}
        </span>
        <button
          onClick={handleDeleteList}
          className="ml-2 p-1 rounded hover:bg-red-600/80 transition-colors"
          title="Eliminar lista"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tarjetas */}
      <div
        ref={setNodeRef}
        className={`min-h-20 max-h-[60vh] overflow-y-auto overflow-x-hidden pr-1 scroll-smooth scroll-snap-y transition-all duration-200 ${isOver ? 'bg-white/10' : ''}`}
      >
        <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <div className="h-12 flex items-center justify-center text-white/50 text-sm italic select-none animate-pulse">
            {isOver ? 'Suelta aquí' : 'Arrastra una tarjeta aquí'}
          </div>
        )}
        <div className="h-0 border-2 border-dashed border-white/20 rounded mb-2 transition-all duration-200" />
      </div>

      {/* Input para agregar tarjeta */}
      {isAddingCard ? (
        <div className="mt-3">
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCard()}
            onBlur={handleAddCard}
            placeholder="Escribe el título..."
            className="w-full px-3 py-2 text-sm rounded-md bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white transition duration-150 ease-in-out"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="w-full mt-3 px-3 py-2 flex items-center gap-2 text-sm font-medium text-white/80 bg-white/5 hover:bg-white/15 rounded-md transition duration-200 ease-in-out hover:text-white"
        >
          <span className="text-lg">＋</span> Añadir tarjeta
        </button>
      )}
    </div>
  );
} 