'use client';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import { Card as CardType } from '@/types';
import { cardsApi } from '@/lib/api';
import CardDetailModal from './CardDetailModal';

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: card.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const [completed, setCompleted] = useState(card.completed);
  const [saving, setSaving] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    setCompleted(card.completed);
  }, [card.completed]);

  const handleToggleCompleted = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCompleted = !completed;
    setCompleted(newCompleted);
    setSaving(true);
    try {
      await cardsApi.update(card.id, { completed: newCompleted });
    } catch (error) {
      setCompleted(!newCompleted); // revertir si falla
    } finally {
      setSaving(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    boxShadow: isDragging 
      ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' 
      : 'none',
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`relative group bg-white/20 rounded p-3 mb-2 cursor-default hover:bg-white/30 transition-all duration-150 ease-out text-white shadow-sm select-none transform-gpu animate-in fade-in slide-in-from-top-2 flex items-center gap-3 ${
          isDragging ? 'shadow-lg scale-105 rotate-1' : 'hover:scale-[1.02]'
        }`}
        onClick={() => setShowDetail(true)}
      >
        {/* Botón check */}
        <button
          onClick={handleToggleCompleted}
          disabled={saving}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${completed ? 'bg-green-500 border-green-500' : 'bg-white/30 border-white/60'}
            opacity-0 group-hover:opacity-100 cursor-pointer
          `}
          tabIndex={-1}
          type="button"
        >
          {completed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Contenido */}
        <div className="flex-1 flex flex-col justify-center">
          <h3
            className={`font-medium text-sm transition-all duration-200 text-left ${
              completed ? 'line-through text-green-300' : ''
            } group-hover:ml-5 ml-1`}
          >
            {card.title}
          </h3>
        </div>

        {/* Botón editar */}
        <button
          onClick={e => { e.stopPropagation(); setShowDetail(true); }}
          className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                     bg-white/20 border-white/60 hover:bg-gray-700/60 hover:border-gray-500 cursor-pointer
                     opacity-0 group-hover:opacity-100"
          tabIndex={-1}
          type="button"
          aria-label="Editar tarjeta"
        >
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Zona draggable visible, desde el check hasta antes del botón editar */}
        <div
          {...listeners}
          className="absolute top-0 left-12 h-full w-[calc(100%-6rem)] cursor-move z-10"
          aria-label="Drag area"
          tabIndex={-1}
        />
      </div>
      {showDetail && (
        <CardDetailModal card={card} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
} 