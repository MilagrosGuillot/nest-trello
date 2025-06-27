'use client';

import { useState } from 'react';
import { usersApi, boardsApi } from '@/lib/api';

interface AddMemberModalProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: () => void;
}

interface User {
  id: string;
  email: string;
}

export default function AddMemberModal({ boardId, isOpen, onClose, onMemberAdded }: AddMemberModalProps) {
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!email.trim()) return;

    setSearching(true);
    setError('');
    setFoundUser(null);

    try {
      const user = await usersApi.searchByEmail(email);
      setFoundUser(user);
    } catch (error) {
      setError('Usuario no encontrado');
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (!foundUser) return;

    setAdding(true);
    setError('');

    try {
      await boardsApi.addMember(boardId, foundUser.id);
      onMemberAdded();
      onClose();
      setEmail('');
      setFoundUser(null);
    } catch (error) {
      setError('Error al agregar miembro');
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h2 className="text-xl font-bold mb-4">Agregar Miembro</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email del usuario
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={searching || !email.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {foundUser && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">Usuario encontrado:</p>
              <p className="font-medium">{foundUser.email}</p>
              <button
                onClick={handleAddMember}
                disabled={adding}
                className="mt-2 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {adding ? 'Agregando...' : 'Agregar Miembro'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
} 