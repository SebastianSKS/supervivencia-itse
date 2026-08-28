import { formatDate } from '@/lib/utils';
import LikeButton from './LikeButton';
import RankBadge from './RankBadge';
import ReportButton from './ReportButton';
import type { Post } from '@/actions/posts';

interface Props {
  post: Post;
  currentUserId?: number | null;
}

export default function PostCard({ post, currentUserId = null }: Props) {
  const initial = post.username.charAt(0).toUpperCase();

  return (
    <article className="group flex flex-col gap-4 bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-5 hover:bg-zinc-800/40 hover:border-white/10 transition-all duration-200">

      {/* Header: avatar + autor + rango + fecha */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-zinc-300 text-sm font-semibold shrink-0 select-none">
            {initial}
          </div>
          <div className="leading-none">
            <div className="flex items-center gap-2">
              <p className="text-zinc-200 text-sm font-medium">@{post.username}</p>
              <RankBadge rank={post.author_rank} size="sm" />
            </div>
            <p className="text-zinc-600 text-xs mt-1">{formatDate(post.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Título + contenido */}
      <div className="flex-1">
        <h3 className="text-zinc-100 font-semibold text-base leading-snug mb-2">
          {post.title}
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-4">
          {post.content}
        </p>
      </div>

      {/* Footer: like button + report button */}
      <div className="pt-1 border-t border-white/[0.04] flex items-center justify-between">
        <LikeButton
          postId={post.id}
          initialCount={post.like_count}
          initialLiked={post.has_liked}
          authorId={post.user_id}
          currentUserId={currentUserId}
        />
        <ReportButton
          postId={post.id}
          authorId={post.user_id}
          currentUserId={currentUserId}
        />
      </div>

    </article>
  );
}
