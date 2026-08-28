'use client';

import { useState, useEffect, useTransition } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { toggleFollow } from '@/actions/social';
import { useRouter } from 'next/navigation';

interface Props {
  targetUserId: number;
  initialIsFollowing: boolean;
  variant?: 'inline' | 'large';
  currentUserId?: number | null;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
  variant = 'inline',
  currentUserId = null,
  onFollowChange,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing);

  // Sincronizar estado local si las props cambian
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  // No mostrar botón de auto-seguimiento
  if (currentUserId && currentUserId === targetUserId) {
    return null;
  }

  function handleToggleFollow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      router.push('/login');
      return;
    }

    const previousState = isFollowing;
    const nextState = !isFollowing;

    // 1. Actualización visual instantánea (Feedback optimista inmediato)
    setIsFollowing(nextState);
    if (onFollowChange) {
      onFollowChange(nextState);
    }

    // 2. Ejecución de Server Action con revalidación y router.refresh()
    startTransition(async () => {
      try {
        const res = await toggleFollow(targetUserId);

        if (res.error) {
          // Si hubo error, revertir
          setIsFollowing(previousState);
          if (onFollowChange) onFollowChange(previousState);

          if (res.error === 'unauthenticated') {
            router.push('/login');
          }
        } else {
          // Refresco del router para sincronizar datos en el servidor
          router.refresh();
        }
      } catch {
        setIsFollowing(previousState);
        if (onFollowChange) onFollowChange(previousState);
      }
    });
  }

  // ── Variante Inline (Muro y Modal de Seguidores) ─────────────────────────
  if (variant === 'inline') {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={isPending}
        title={isFollowing ? 'Dejar de seguir' : 'Seguir a este usuario'}
        className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full transition-all cursor-pointer select-none ${
          isFollowing
            ? 'bg-zinc-800 hover:bg-zinc-800/80 text-zinc-300 hover:text-red-400 hover:border-red-500/30 border border-zinc-700/70 font-medium'
            : 'bg-zinc-100 hover:bg-white text-zinc-900 shadow-sm font-semibold hover:shadow'
        }`}
      >
        {isPending ? (
          <Loader2 className="w-2.5 h-2.5 animate-spin text-zinc-400" />
        ) : isFollowing ? (
          <>
            <UserCheck className="w-2.5 h-2.5 text-cyan-400" />
            <span>Siguiendo</span>
          </>
        ) : (
          <>
            <UserPlus className="w-2.5 h-2.5 text-zinc-900" />
            <span>Seguir</span>
          </>
        )}
      </button>
    );
  }

  // ── Variante Grande (Cabecera de Perfil Público) ─────────────────────────
  return (
    <button
      onClick={handleToggleFollow}
      disabled={isPending}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer select-none ${
        isFollowing
          ? 'bg-zinc-800 hover:bg-zinc-800/90 hover:text-red-400 hover:border-red-500/30 text-zinc-200 border border-zinc-700 font-medium'
          : 'bg-zinc-100 hover:bg-white text-zinc-900 shadow-md shadow-black/20 font-semibold'
      }`}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Actualizando...</span>
        </>
      ) : isFollowing ? (
        <>
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <span>Siguiendo</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Seguir</span>
        </>
      )}
    </button>
  );
}
