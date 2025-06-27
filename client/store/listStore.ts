import { create } from 'zustand';
import { List } from '@/types';
import { listsApi } from '@/lib/api';

interface ListStore {
  // Estado
  lists: List[];
  loadingLists: boolean;
  error: string | null;
  
  // Acciones
  setLists: (lists: List[]) => void;
  setLoadingLists: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones asíncronas
  fetchListsByBoard: (boardId: string) => Promise<void>;
  addList: (title: string, order: number, boardId: string) => Promise<void>;
  updateList: (id: string, title: string, order: number, boardId: string) => Promise<void>;
  removeList: (id: string) => Promise<void>;
  
  // Selectores
  getListsByBoard: (boardId: string) => List[];
  getListById: (id: string) => List | undefined;
}

export const useListStore = create<ListStore>((set, get) => ({
  // Estado inicial
  lists: [],
  loadingLists: false,
  error: null,
  
  // Setters
  setLists: (lists) => set({ lists }),
  setLoadingLists: (loading) => set({ loadingLists: loading }),
  setError: (error) => set({ error }),
  
  // Acciones asíncronas
  fetchListsByBoard: async (boardId: string) => {
    set({ loadingLists: true, error: null });
    try {
      const lists = await listsApi.getByBoard(boardId);
      set({ lists, loadingLists: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error fetching lists',
        loadingLists: false 
      });
    }
  },
  
  addList: async (title: string, order: number, boardId: string) => {
    set({ error: null });
    try {
      const newList = await listsApi.create({ title, order, boardId });
      set((state) => ({ lists: [...state.lists, newList] }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error creating list'
      });
    }
  },
  
  updateList: async (id: string, title: string, order: number, boardId: string) => {
    set({ error: null });
    try {
      const updatedList = await listsApi.update(id, { title, order, boardId });
      set((state) => ({
        lists: state.lists.map(list => 
          list.id === id ? updatedList : list
        )
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error updating list'
      });
    }
  },
  
  removeList: async (id: string) => {
    set({ error: null });
    try {
      await listsApi.delete(id);
      set((state) => ({ 
        lists: state.lists.filter(list => list.id !== id) 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error deleting list'
      });
    }
  },
  
  // Selectores
  getListsByBoard: (boardId: string) => {
    return get().lists.filter(list => list.boardId === boardId);
  },
  
  getListById: (id: string) => {
    return get().lists.find(list => list.id === id);
  },
})); 