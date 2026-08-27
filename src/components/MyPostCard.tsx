import { formatDate } from '@/lib/utils';
import { deleteMyPost } from '@/actions/user';
import LikeButton from './LikeButton';
import { Trash2, Heart } from 'lucide-react';
import type { Post } from '@/actions/posts';

interface Props {
  post: Post;
}

/**
 * Variante de PostCard para /profile.
 * Incluye botón de eliminar con validación de ownership en el servidor.
 */
export default function MyPostCard({ post }: Props) {
  const initial = post.username.charAt(0).toUpperCase();

  return (
    <article className="group flex flex-col gap-4 bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-5 hover:bg-zinc-800/40 hover:border-white/10 transition-all duration-200">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-zinc-300 text-sm font-semibold shrink-0 select-none">
            {initial}
          </div>
          <div className="leading-none">
            <p className="text-zinc-200 text-sm font-medium">@{post.username}</p>
            <p className="text-zinc-600 text-xs mt-0.5">{formatDate(post.created_at)}</p>
          </div>
        </div>

        {/* Likes inline en el header (vista compacta) */}
        <div className="flex items-center gap-1 text-zinc-600 text-xs">
          <Heart className="w-3.5 h-3.5 text-red-500/50" />
          {post.like_count}
        </div>
      </div>

      {/* Título + contenido */}
      <div className="flex-1">
        <h3 className="text-zinc-100 font-semibold text-base leading-snug mb-2">
          {post.title}
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Footer: like + eliminar */}
      <div className="pt-1 border-t border-white/[0.04] flex items-center justify-between">
        <LikeButton postId={post.id} initialCount={post.like_count} />

        {/* Botón eliminar — valida ownership en el servidor */}
        <form action={deleteMyPost.bind(null, post.id)}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-xs text-red-500/50 hover:text-red-400 hover:bg-red-400/10 px-2.5 py-1.5 rounded-lg transition-all duration-150"
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
