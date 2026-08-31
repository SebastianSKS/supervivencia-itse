import { formatDate } from '@/lib/utils';
import LikeButton from './LikeButton';
import RankBadge from './RankBadge';
import ReportButton from './ReportButton';
import FollowButton from './FollowButton';
import ViewTracker from './ViewTracker';
import BookmarkButton from './BookmarkButton';
import UserAvatar from './UserAvatar';
import type { Post } from '@/actions/posts';
import Link from 'next/link';

interface Props {
  post: Post;
  currentUserId?: number | null;
}

export default function PostCard({ post, currentUserId = null }: Props) {
  const isAuthor = currentUserId === post.user_id;

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
