import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthStore {
  // Estado
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loadingAuth: boolean;
  error: string | null;
  
  // Acciones
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoadingAuth: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones de autenticación
  login: (token: string, user: User) => void;
  logout: () => void;
  initializeAuth: () => void;
  
  // Selectores
  getToken: () => string | null;
  getUser: () => User | null;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Estado inicial
  user: null,
  token: null,
  isAuthenticated: false,
  loadingAuth: false,
  error: null,
  
  // Setters
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setLoadingAuth: (loading) => set({ loadingAuth: loading }),
  setError: (error) => set({ error }),
  
  // Acciones de autenticación
  login: (token: string, user: User) => {
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    set({ 
      token, 
      user, 
      isAuthenticated: true, 
      error: null 
    });
  },
  
  logout: () => {
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    set({ 
      token: null, 
      user: null, 
      isAuthenticated: false, 
      error: null 
    });
  },
  
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ 
            token, 
            user, 
            isAuthenticated: true 
          });
        } catch (error) {
          // Si hay error al parsear, limpiar localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  },
  
  // Selectores
  getToken: () => get().token,
  getUser: () => get().user,
})); 