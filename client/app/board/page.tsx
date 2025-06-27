// src/app/page.tsx
'use client'; // Importante para componentes con interactividad

import { Board } from '@/components/Board/Board';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BoardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const boardId = searchParams.get('id');

  useEffect(() => {
    if (!boardId) {
      router.push('/home');
    }
  }, [boardId, router]);

  if (!boardId) {
    return <div>No se encontró el tablero.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Board boardId={boardId} />
    </div>
  );
}