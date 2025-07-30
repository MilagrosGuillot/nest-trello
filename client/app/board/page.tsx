'use client';

import { Board } from '@/components/Board/Board';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function BoardContent() {
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

  return <Board boardId={boardId} />;
}

export default function BoardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Cargando tablero...</div>}>
        <BoardContent />
      </Suspense>
    </div>
  );
}
