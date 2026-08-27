'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { likePost } from '@/actions/likes';

interface Props {
  postId: number;
  initialCount: number;
}

export default function LikeButton({ postId, initialCount }: Props) {
  const [liked, setLiked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticCount, addOptimistic] = useOptimistic(
    initialCount,
    (current: number) => current + 1,
  );

  function handleLike() {
    if (liked || isPending) return;
    setLiked(true);
    startTransition(async () => {
      addOptimistic(undefined);
      await likePost(postId);
    });
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all duration-150 ${
        liked
          ? 'text-red-400 bg-red-400/10 cursor-default'
          : 'text-zinc-500 hover:text-red-400 hover:bg-red-400/10 active:scale-95'
      }`}
      aria-label={`${optimisticCount} likes`}
    >
      <Heart
        className={`w-3.5 h-3.5 transition-all duration-150 ${liked ? 'fill-red-400 scale-110' : ''}`}
      />
      <span className="tabular-nums font-medium">{optimisticCount}</span>
    </button>
  );
}
