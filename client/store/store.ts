import { create } from 'zustand';
import { Board } from '@/types';
import { boardsApi } from '@/lib/api';

interface Store {
  boards: Board[];
  setBoards: (boards: Board[]) => void;
  loadingBoards: boolean;
  fetchBoards: () => Promise<void>;
  addBoard: (title: string) => Promise<void>;
  removeBoard: (id: string) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  boards: [],
  setBoards: (boards) => set({ boards }),
  loadingBoards: false,
  fetchBoards: async () => {
    set({ loadingBoards: true });
    try {
      const boards = await boardsApi.getAll();
      set({ boards });
    } catch (error) {
      // Puedes manejar errores aquí si quieres
      set({ boards: [] });
    } finally {
      set({ loadingBoards: false });
    }
  },
  addBoard: async (title: string) => {
    try {
      const newBoard = await boardsApi.create({ title });
      set((state) => ({ boards: [...state.boards, newBoard] }));
    } catch (error) {
      // Manejar error si quieres
    }
  },
  removeBoard: async (id: string) => {
    try {
      await boardsApi.delete(id);
      set((state) => ({ boards: state.boards.filter((b) => b.id !== id) }));
    } catch (error) {
      // Manejar error si quieres
    }
  },
}));
