'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/boardStore';

export default function HomePage() {
  // **** Estados del componente ****
  const [newBoardTitle, setNewBoardTitle] = useState(''); // Título del nuevo board
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // Estado global del store
  const boards = useBoardStore((state) => state.boards);
  const loadingBoards = useBoardStore((state) => state.loadingBoards);
  const fetchBoards = useBoardStore((state) => state.fetchBoards);
  const addBoard = useBoardStore((state) => state.addBoard);

  // **** Cargar tableros del estado global al montar el componente ****
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // **** Lógica para crear un nuevo tablero ****
  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;
    setIsCreating(true);
    try {
      await addBoard(newBoardTitle);
      setNewBoardTitle('');
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // **** Lógica de logout ****
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // **** Renderizado principal ****
  if (loadingBoards) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#261750] to-[#5d4988] font-sans text-white">
      <main className="px-2 sm:px-6 py-8 space-y-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-col sm:flex-row gap-4">
          <h1 className="text-4xl font-bold text-white/90 tracking-tight drop-shadow-lg">Mis tableros</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-md transition duration-300 cursor-pointer shadow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-9V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2v-1" />
            </svg>
            Cerrar sesión
          </button>
        </div>

        {/* SECCIÓN: TUS ESPACIOS DE TRABAJO */}
        <section>
          <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide text-white/70">Espacios de trabajo</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Renderiza cada tablero como una tarjeta clickable */}
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => router.push(`/board?id=${board.id}`)}
                className="h-40 rounded-xl overflow-hidden cursor-pointer group flex flex-col justify-end bg-white/10 hover:bg-white/20 shadow-lg transition-all duration-200 border border-white/20 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0 transition-opacity group-hover:opacity-80" />
                <div className="relative z-10 flex-1 flex flex-col justify-end">
                  <h3 className="text-white text-lg font-semibold px-4 pb-4 group-hover:underline truncate drop-shadow-lg">
                    {board.title}
                  </h3>
                </div>
              </div>
            ))}

            {/* SECCIÓN: CREAR NUEVO TABLERO */}
            <div className="bg-white/10 hover:bg-white/15 rounded-xl p-4 flex flex-col items-center justify-center text-white cursor-pointer border border-white/20 shadow-lg transition-all duration-200">
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateBoard()}
                placeholder="Nombre del nuevo tablero..."
                className="w-full px-3 py-2 mb-3 bg-white/5 border border-white/20 rounded text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition"
              />
              <button
                onClick={handleCreateBoard}
                disabled={isCreating || !newBoardTitle.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 w-full font-semibold transition"
              >
                {isCreating ? "Creando..." : "Crear tablero"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 