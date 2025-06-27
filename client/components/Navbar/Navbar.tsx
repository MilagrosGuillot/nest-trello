'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/boardStore';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const boards = useBoardStore((state) => state.boards);
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Obtener usuario autenticado del store
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Inicializar usuario desde localStorage al montar el Navbar
  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  // Cierre del menú al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowMobileSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    setShowMobileMenu(false);
    setShowMobileSearch(false);
    router.push('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Aquí puedes implementar la lógica de búsqueda real
      setSearchQuery('');
      setShowMobileSearch(false);
    }
  };

  const filteredBoards = searchQuery.trim().length > 0
    ? boards.filter(b => b.title.toLowerCase().startsWith(searchQuery.toLowerCase()))
    : [];

  const handleSelect = (id: string) => {
    setSearchQuery('');
    setShowMobileSearch(false);
    setShowMobileMenu(false);
    router.push(`/board?id=${id}`);
  };

  return (
    <nav className="bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Links */}
          <div className="flex items-center gap-6 relative">
            <Link href="/home" className="text-2xl font-bold text-gray-800">
              GiraPoint
            </Link>
            <div className="hidden sm:flex space-x-6 items-center">
              <Link 
                href="/home"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 text-sm font-medium transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Inicio
              </Link>
            </div>
            {/* Buscador móvil desplegable */}
            {showMobileSearch && (
              <div 
                ref={mobileSearchRef}
                className="sm:hidden absolute top-full left-0 mt-2 bg-gray-200 rounded-lg shadow-lg border border-gray-300 z-50 p-3 w-80"
              >
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar tableros..."
                    className="w-full p-2 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-gray-200"
                    autoFocus
                  />
                  {filteredBoards.length > 0 && (
                    <ul className="mt-2 bg-white rounded shadow border border-gray-200 max-h-60 overflow-y-auto">
                      {filteredBoards.map(board => (
                        <li
                          key={board.id}
                          className="px-4 py-2 text-gray-800 hover:bg-indigo-100 cursor-pointer text-sm"
                          onMouseDown={() => handleSelect(board.id)}
                        >
                          {board.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* Buscador + Perfil */}
          <div className="flex items-center gap-4 relative">
            <input
              type="text"
              placeholder="Buscar tableros..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowMobileSearch(false); }}
              className="hidden sm:block p-2 rounded-lg bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-gray-200 w-56"
            />
            {filteredBoards.length > 0 && searchQuery.trim().length > 0 && (
              <ul className="hidden sm:block absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow z-20 max-h-60 overflow-y-auto">
                {filteredBoards.map(board => (
                  <li
                    key={board.id}
                    className="px-4 py-2 text-gray-800 hover:bg-indigo-100 cursor-pointer text-sm"
                    onMouseDown={() => handleSelect(board.id)}
                  >
                    {board.title}
                  </li>
                ))}
              </ul>
            )}
            <button 
              className="sm:hidden p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Image src="/lupa.png" alt="Buscar" width={24} height={24} />
            </button>
            {/* Perfil */}
            <div className="relative flex items-center" ref={menuRef}>
              <button onClick={() => setShowMenu(!showMenu)} className="focus:outline-none rounded-full">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 font-bold text-sm border-2 border-gray-400">
                  {user?.name ? user.name[0] : '?'}
                </div>
              </button>
              {/* Menú desplegable */}
              <div className={`absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 z-50 transform transition-all duration-200 ease-out ${
                showMenu 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}>
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v1" />
                      </svg>
                      Cerrar sesión
                    </div>
                  </button>
                </div>
              </div>
            </div>
            {/* Botón menú móvil */}
            <div className="sm:hidden">
              <button
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none"
                onClick={() => setShowMobileMenu(true)}
              >
                <span className="sr-only">Abrir menú principal</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            {/* Menú móvil desplegable */}
            {showMobileMenu && (
              <>
                {/* Backdrop con gradiente */}
                <div 
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300 ease-out" 
                  onClick={() => setShowMobileMenu(false)} 
                />
                <div
                  ref={mobileMenuRef}
                  className="fixed top-0 right-0 w-72 h-full bg-gray-50 z-50 shadow-2xl flex flex-col p-6 gap-6 transform transition-all duration-300 ease-out"
                  style={{ 
                    transform: showMobileMenu ? 'translateX(0)' : 'translateX(100%)',
                    boxShadow: showMobileMenu ? '0 0 50px rgba(0,0,0,0.3)' : 'none'
                  }}
                >
                  {/* Header del menú */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-gray-900 text-xl font-bold">GiraPoint</h2>
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all duration-200 focus:outline-none"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {/* Enlaces de navegación */}
                  <div className="space-y-2">
                    <Link 
                      href="/home" 
                      className="flex items-center gap-3 text-black hover:text-gray-700 hover:bg-gray-200 px-4 py-3 rounded-lg transition-all duration-200 text-lg font-medium" 
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Inicio
                    </Link>
                  </div>
                  {/* Separador más ancho */}
                  <div className="border-t-2 border-gray-300 my-6" />
                  {/* Botón cerrar sesión */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-100 px-4 py-3 rounded-lg transition-all duration-200 text-lg font-medium -mt-8"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Barra de navegacion lista, logo, links de navegacion, buscador y boton crear