import { create } from 'zustand';
import { Card } from '@/types';
import { cardsApi } from '@/lib/api';

interface CardStore {
  // Estado
  cards: Card[];
  loadingCards: boolean;
  error: string | null;
  
  // Acciones
  setCards: (cards: Card[]) => void;
  setLoadingCards: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones asíncronas
  fetchCardsByBoard: (boardId: string) => Promise<void>;
  addCard: (title: string, description: string, order: number, listId: string) => Promise<void>;
  updateCard: (id: string, data: { title?: string; description?: string; order?: number; listId?: string }) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  
  // Selectores
  getCardsByList: (listId: string) => Card[];
  getCardsByBoard: (boardId: string) => Card[];
  getCardById: (id: string) => Card | undefined;
}

export const useCardStore = create<CardStore>((set, get) => ({
  // Estado inicial
  cards: [],
  loadingCards: false,
  error: null,
  
  // Setters
  setCards: (cards) => set({ cards }),
  setLoadingCards: (loading) => set({ loadingCards: loading }),
  setError: (error) => set({ error }),
  
  // Acciones asíncronas
  fetchCardsByBoard: async (boardId: string) => {
    set({ loadingCards: true, error: null });
    try {
      const cards = await cardsApi.getByBoard(boardId);
      set({ cards, loadingCards: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error fetching cards',
        loadingCards: false 
      });
    }
  },
  
  addCard: async (title: string, description: string, order: number, listId: string) => {
    set({ error: null });
    try {
      const newCard = await cardsApi.create({ title, description, order, listId });
      set((state) => ({ cards: [...state.cards, newCard] }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error creating card'
      });
    }
  },
  
  updateCard: async (id: string, data: { title?: string; description?: string; order?: number; listId?: string }) => {
    set({ error: null });
    try {
      const updatedCard = await cardsApi.update(id, data);
      set((state) => ({
        cards: state.cards.map(card => 
          card.id === id ? updatedCard : card
        )
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error updating card'
      });
    }
  },
  
  removeCard: async (id: string) => {
    set({ error: null });
    try {
      await cardsApi.delete(id);
      set((state) => ({ 
        cards: state.cards.filter(card => card.id !== id) 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error deleting card'
      });
    }
  },
  
  // Selectores
  getCardsByList: (listId: string) => {
    return get().cards.filter(card => card.listId === listId);
  },
  
  getCardsByBoard: (boardId: string) => {
    // Asumiendo que las cards tienen una relación con board a través de list
    // Esto dependerá de tu estructura de datos
    return get().cards.filter(card => {
      // Necesitarías acceder a la lista para verificar el boardId
      // Esto es un ejemplo, ajusta según tu estructura
      return true; // Placeholder
    });
  },
  
  getCardById: (id: string) => {
    return get().cards.find(card => card.id === id);
  },
})); 