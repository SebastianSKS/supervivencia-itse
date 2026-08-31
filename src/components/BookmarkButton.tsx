'use client';

import { useState, useTransition } from 'react';
import { Bookmark } from 'lucide-react';
import { toggleFavorite } from '@/actions/favorites';
import { useRouter } from 'next/navigation';

interface Props {
  postId: number;
  initialIsFavorited?: boolean;
  currentUserId?: number | null;
}

export default function BookmarkButton({
  postId,
  initialIsFavorited = false,
  currentUserId = null,
}: Props) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPending, startTransition] = useTransition();

  async function handleToggle() {
    if (!currentUserId) {
      router.push('/login');
      return;
    }

    // 1. Actualización optimista inmediata
    const previousState = isFavorited;
    const nextState = !isFavorited;
    setIsFavorited(nextState);

    startTransition(async () => {
      try {
        const result = await toggleFavorite(postId);
        if (result.error) {
          // Revertir si hubo error
          setIsFavorited(previousState);
        } else if (result.isFavorited !== undefined) {
          setIsFavorited(result.isFavorited);
        }
      } catch {
        setIsFavorited(previousState);
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isFavorited ? 'Guardado en Favoritos' : 'Guardar en Favoritos'}
      className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
        isFavorited
          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15'
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 border border-transparent'
      }`}
      aria-label={isFavorited ? 'Quitar de favoritos' : 'Guardar en favoritos'}
    >
      <Bookmark
        className={`w-3.5 h-3.5 transition-transform active:scale-90 ${
          isFavorited ? 'fill-cyan-400 text-cyan-400' : 'text-zinc-500'
        }`}
      />
    </button>
  );
}
