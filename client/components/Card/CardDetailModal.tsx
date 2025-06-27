import { useState } from 'react';
import { cardsApi } from '@/lib/api';
import { Card } from '@/types';
import { toast } from 'sonner';

interface CardDetailModalProps {
  card: Card;
  onClose: () => void;
  onDelete?: () => void;
}

export default function CardDetailModal({ card, onClose, onDelete }: CardDetailModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await cardsApi.update(card.id, { title, description });
      toast.success('Tarjeta actualizada');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
    } catch (e) {
      toast.error('Error al guardar los cambios');
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar esta tarjeta? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    try {
      await cardsApi.delete(card.id);
      toast.success('Tarjeta eliminada');
      if (onDelete) onDelete();
      onClose();
    } catch (e) {
      toast.error('Error al eliminar la tarjeta');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Detalle de Tarjeta</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px] bg-white text-gray-900"
              maxLength={500}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">¡Guardado!</div>}
        </div>
        <div className="mt-6 flex justify-between gap-2 items-center">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            disabled={deleting}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={saving || deleting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              disabled={saving || !title.trim() || deleting}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 