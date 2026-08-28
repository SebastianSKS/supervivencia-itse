'use client';

import { useState, useOptimistic, useTransition } from 'react';
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

  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
    initialIsFollowing,
    (_current, nextState: boolean) => nextState,
  );

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

    const nextState = !optimisticFollowing;

    startTransition(async () => {
      setOptimisticFollowing(nextState);
      if (onFollowChange) onFollowChange(nextState);

      const res = await toggleFollow(targetUserId);
      if (res.error) {
        if (res.error === 'unauthenticated') {
          router.push('/login');
        } else {
          setOptimisticFollowing(initialIsFollowing);
          if (onFollowChange) onFollowChange(initialIsFollowing);
        }
      }
    });
  }

  // ── Variante Inline para el feed del muro ────────────────────────────────
  if (variant === 'inline') {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={isPending}
        title={optimisticFollowing ? 'Dejar de seguir' : 'Seguir a este autor'}
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full transition-all cursor-pointer ${
          optimisticFollowing
            ? 'bg-zinc-800/80 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.06]'
            : 'bg-zinc-100 hover:bg-white text-zinc-900 shadow-sm font-semibold'
        }`}
      >
        {isPending ? (
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
        ) : optimisticFollowing ? (
          <>
            <UserCheck className="w-2.5 h-2.5 text-cyan-400" />
            <span>Siguiendo</span>
          </>
        ) : (
          <>
            <UserPlus className="w-2.5 h-2.5" />
            <span>Seguir</span>
          </>
        )}
      </button>
    );
  }

  // ── Variante Grande para el Perfil Público ───────────────────────────────
  return (
    <button
      onClick={handleToggleFollow}
      disabled={isPending}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
        optimisticFollowing
          ? 'bg-zinc-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-zinc-200 border border-zinc-700'
          : 'bg-zinc-100 hover:bg-white text-zinc-900 shadow-md shadow-black/20'
      }`}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Actualizando...</span>
        </>
      ) : optimisticFollowing ? (
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
