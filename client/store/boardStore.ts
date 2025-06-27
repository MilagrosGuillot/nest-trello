import { create } from 'zustand';
import { Board } from '@/types';
import { boardsApi } from '@/lib/api';

interface BoardStore {
  // Estado
  boards: Board[];
  loadingBoards: boolean;
  error: string | null;
  
  // Acciones
  setBoards: (boards: Board[]) => void;
  setLoadingBoards: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones asíncronas
  fetchBoards: () => Promise<void>; //Trae todos los tableros del backend.
  addBoard: (title: string) => Promise<void>; //Crea un nuevo tablero.
  updateBoard: (id: string, title: string) => Promise<void>; //Actualiza el título de un tablero.
  removeBoard: (id: string) => Promise<void>; //Elimina un tablero.
  
  // Selectores
  getBoardById: (id: string) => Board | undefined;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  // Estado inicial
  boards: [],
  loadingBoards: false,
  error: null,
  
  // Setters
  setBoards: (boards) => set({ boards }),
  setLoadingBoards: (loading) => set({ loadingBoards: loading }),
  setError: (error) => set({ error }),
  
  // Acciones asíncronas
  fetchBoards: async () => {
    set({ loadingBoards: true, error: null });
    try {
      const boards = await boardsApi.getAll();
      set({ boards, loadingBoards: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error fetching boards',
        loadingBoards: false 
      });
    }
  },
  
  addBoard: async (title: string) => {
    set({ error: null });
    try {
      const newBoard = await boardsApi.create({ title });
      set((state) => ({ boards: [...state.boards, newBoard] }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error creating board'
      });
    }
  },
  
  updateBoard: async (id: string, title: string) => {
    set({ error: null });
    try {
      const updatedBoard = await boardsApi.update(id, { title });
      set((state) => ({
        boards: state.boards.map(board => 
          board.id === id ? updatedBoard : board
        )
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error updating board'
      });
    }
  },
  
  removeBoard: async (id: string) => {
    set({ error: null });
    try {
      await boardsApi.delete(id);
      set((state) => ({ 
        boards: state.boards.filter(board => board.id !== id) 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error deleting board'
      });
    }
  },
  
  // Selectores
  getBoardById: (id: string) => {
    return get().boards.find(board => board.id === id);
  },
})); 