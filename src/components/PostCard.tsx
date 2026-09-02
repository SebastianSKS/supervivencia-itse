'use client';

import { useState, useTransition } from 'react';
import { formatDate } from '@/lib/utils';
import LikeButton from './LikeButton';
import RankBadge from './RankBadge';
import ReportButton from './ReportButton';
import FollowButton from './FollowButton';
import ViewTracker from './ViewTracker';
import BookmarkButton from './BookmarkButton';
import UserAvatar from './UserAvatar';
import { editPost, type Post } from '@/actions/posts';
import Link from 'next/link';
import { Pencil, Loader2 } from 'lucide-react';

interface Props {
  post: Post;
  currentUserId?: number | null;
}

export default function PostCard({ post, currentUserId = null }: Props) {
  const isAuthor = currentUserId === post.user_id;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (editContent.trim().length < 20) return;
    startTransition(async () => {
      const res = await editPost(post.id, editContent);
      if (res?.success) {
        setIsEditing(false);
      } else {
        alert(res?.error || 'Error al guardar los cambios.');
      }
    });
  };

  return (
    <article className="w-full group flex flex-col gap-3.5 sm:gap-4 bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 sm:p-5 hover:bg-zinc-800/40 hover:border-white/10 transition-all duration-200">

      {/* Header: avatar + autor link + rango + botón seguir + fecha */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href={`/user/${post.username}`}
            className="rounded-full bg-zinc-800 border border-white/[0.08] hover:border-white/20 shrink-0 transition-colors overflow-hidden"
          >
            <UserAvatar username={post.username} size={32} className="rounded-full" />
          </Link>
          <div className="leading-none min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/user/${post.username}`}
                className="text-zinc-200 text-sm font-medium hover:text-white hover:underline transition-colors truncate"
              >
                @{post.username}
              </Link>
              <RankBadge rank={post.author_rank} size="sm" />

              {/* Botón Seguir Inline */}
              {!isAuthor && (
                <FollowButton
                  targetUserId={post.user_id}
                  initialIsFollowing={Boolean(post.is_following_author)}
                  variant="inline"
                  currentUserId={currentUserId}
                />
              )}
            </div>
            <p className="text-zinc-600 text-xs mt-1">{formatDate(post.created_at)}</p>
          </div>
        </div>

        {/* Botón de editar */}
        {isAuthor && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
            title="Editar consejo"
            aria-label="Editar publicación"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Título + contenido */}
      <div className="flex-1">
        <h3 className="text-zinc-100 font-semibold text-base leading-snug mb-2">
          {post.title}
        </h3>
        
        {isEditing ? (
          <div className="flex flex-col gap-3 mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
              rows={4}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || editContent.trim().length < 20}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {post.content}
          </p>
        )}
      </div>

      {/* Footer: like button + radar de vistas (izq) y bookmark + reportar (der) */}
      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialCount={post.like_count}
            initialLiked={post.has_liked}
            authorId={post.user_id}
            currentUserId={currentUserId}
          />
          <ViewTracker postId={post.id} initialViews={post.views} />
        </div>

        <div className="flex items-center gap-1">
          <BookmarkButton
            postId={post.id}
            initialIsFavorited={Boolean(post.has_favorited)}
            currentUserId={currentUserId}
          />
          <ReportButton
            postId={post.id}
            authorId={post.user_id}
            currentUserId={currentUserId}
          />
        </div>
      </div>

    </article>
  );
}
