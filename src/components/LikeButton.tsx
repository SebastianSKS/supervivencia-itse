'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike } from '@/actions/likes';
import { useRouter } from 'next/navigation';

interface Props {
  postId: number;
  initialCount: number;
  initialLiked: boolean;
  authorId: number;
  currentUserId?: number | null;
}

export default function LikeButton({
  postId,
  initialCount,
  initialLiked,
  authorId,
  currentUserId = null,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado optimista para el like y el contador
  const [optimisticState, setOptimisticState] = useOptimistic(
    { count: initialCount, liked: initialLiked },
    (current) => {
      const nextLiked = !current.liked;
      return {
        liked: nextLiked,
        count: nextLiked ? current.count + 1 : Math.max(0, current.count - 1),
      };
    },
  );

  async function handleToggle() {
    setErrorMessage(null);

    // 1. Si no está logueado, redirigir al login
    if (!currentUserId) {
      router.push('/login');
      return;
    }

    // 2. Si es el autor del post, evitar auto-like con aviso sutil
    if (currentUserId === authorId) {
      setErrorMessage('No puedes darle like a tu propio consejo');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    // 3. Ejecutar toggle con actualización optimista inmediata
    startTransition(async () => {
      setOptimisticState(undefined);
      const res = await toggleLike(postId);

      if (res.error) {
        if (res.error === 'unauthenticated') {
          router.push('/login');
        } else {
          setErrorMessage(res.error);
          setTimeout(() => setErrorMessage(null), 3000);
        }
      }
    });
  }

  const isLiked = optimisticState.liked;
  const isAuthor = currentUserId === authorId;

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleToggle}
        disabled={isPending}
        title={
          !currentUserId
            ? 'Inicia sesión para dar like'
            : isAuthor
            ? 'No puedes darle like a tu propio consejo'
            : isLiked
            ? 'Quitar like'
            : 'Dar like'
        }
        className={`group inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
          isLiked
            ? 'text-red-400 bg-red-400/10 border border-red-500/20 shadow-sm shadow-red-500/10'
            : 'text-zinc-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent active:scale-95'
        } ${isAuthor ? 'opacity-70' : ''}`}
        aria-label={`${optimisticState.count} likes`}
      >
        <Heart
          className={`w-3.5 h-3.5 transition-all duration-200 ${
            isLiked
              ? 'fill-red-400 text-red-400 scale-110'
              : 'text-zinc-500 group-hover:text-red-400'
          }`}
        />
        <span className="tabular-nums font-medium">{optimisticState.count}</span>
      </button>

      {/* Tooltip / Mensaje de error emergente */}
      {errorMessage && (
        <div className="absolute bottom-full left-0 mb-1.5 z-20 whitespace-nowrap text-[11px] font-medium text-red-300 bg-zinc-900 border border-red-500/30 px-2.5 py-1 rounded-md shadow-lg shadow-black/80 animate-float-up">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
