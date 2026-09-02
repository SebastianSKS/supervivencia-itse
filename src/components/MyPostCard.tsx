'use client';

import { useState, useTransition } from 'react';
import { formatDate } from '@/lib/utils';
import { deleteMyPost } from '@/actions/user';
import LikeButton from './LikeButton';
import ViewTracker from './ViewTracker';
import UserAvatar from './UserAvatar';
import { Trash2, Pencil, Loader2, BadgeCheck, Star, Shield } from 'lucide-react';
import { editPost, type Post } from '@/actions/posts';

interface Props {
  post: Post;
  currentUserId?: number | null;
}

function AuthorBadge({ role, totalLikes, totalPosts }: { role: string; totalLikes: number; totalPosts: number }) {
  if (role === 'admin') return <BadgeCheck className="w-4 h-4 text-blue-500" />;
  if (totalLikes >= 10) return <Star className="w-4 h-4 text-yellow-500" />;
  if (totalPosts >= 3) return <Shield className="w-4 h-4 text-purple-500" />;
  return null;
}

/**
 * Variante de PostCard para /profile.
 * Incluye botón de eliminar con validación de ownership en el servidor, badge de rango y vistas.
 */
export default function MyPostCard({ post, currentUserId = null }: Props) {
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
    <article className="group flex flex-col gap-4 bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 sm:p-5 hover:bg-zinc-800/40 hover:border-white/10 transition-all duration-200">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-zinc-800 border border-white/[0.08] shrink-0 overflow-hidden">
            <UserAvatar username={post.username} size={32} className="rounded-full" />
          </div>
          <div className="leading-none">
            <div className="flex items-center gap-2">
              <p className="text-zinc-200 text-sm font-medium">@{post.username}</p>
              <AuthorBadge role={post.author_role} totalLikes={post.author_likes} totalPosts={post.author_posts} />
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-zinc-600 text-xs">
              <span>{formatDate(post.created_at)}</span>
              {post.category && (
                <>
                  <span>•</span>
                  <span className="text-zinc-500 font-medium">{post.category}</span>
                </>
              )}
            </div>
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
          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">
            {post.content}
          </p>
        )}
      </div>

      {/* Footer: like + radar de vistas + eliminar */}
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

        {/* Botón eliminar — valida ownership en el servidor */}
        <form action={deleteMyPost.bind(null, post.id)}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-xs text-red-500/50 hover:text-red-400 hover:bg-red-400/10 px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
            aria-label="Eliminar este consejo"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </form>
      </div>

    </article>
  );
}
