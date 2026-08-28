import { getSession } from '@/lib/auth';
import { getUserPublicProfile } from '@/actions/social';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import RankBadge from '@/components/RankBadge';
import FollowButton from '@/components/FollowButton';
import ProfileFollowStats from '@/components/ProfileFollowStats';
import { notFound } from 'next/navigation';
import {
  User,
  Crown,
  Calendar,
  Heart,
  BookOpen,
  Users,
  LayoutGrid,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const [session, profile] = await Promise.all([
    getSession(),
    getUserPublicProfile(decodedUsername),
  ]);

  if (!profile) {
    notFound();
  }

  const isAdmin = profile.role === 'admin';
  const currentUserId = session?.userId ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Back navigation */}
        <Link
          href="/wall"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al Muro</span>
        </Link>

        {/* ── Tarjeta Principal de Perfil ───────────────────────────────────── */}
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-5 sm:p-8 mb-8 shadow-xl shadow-black/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 flex items-center justify-center text-2xl sm:text-3xl font-black border select-none"
                style={{
                  background: isAdmin ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.04)',
                  borderColor: isAdmin ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.08)',
                  color: isAdmin ? '#fbbf24' : '#e4e4e7',
                }}
              >
                {profile.username.charAt(0).toUpperCase()}
              </div>

              {/* Info y Rango */}
              <div>
                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
                    @{profile.username}
                  </h1>
                  <RankBadge rank={profile.rank} size="md" />
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full text-amber-400 bg-amber-400/10 border border-amber-400/20">
                      <Crown className="w-3 h-3" /> Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  Miembro de la comunidad ITSE
                </p>
              </div>
            </div>

            {/* Acción de Seguir / Editar Perfil */}
            <div className="w-full sm:w-auto">
              {profile.isSelf ? (
                <Link
                  href="/profile"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 transition-colors"
                >
                  Editar mi perfil
                </Link>
              ) : (
                <FollowButton
                  targetUserId={profile.id}
                  initialIsFollowing={profile.isFollowing}
                  variant="large"
                  currentUserId={currentUserId}
                />
              )}
            </div>
          </div>

          {/* ── Estadísticas y Contadores Sociales Interactivos (Modal TikTok) ── */}
          <ProfileFollowStats
            userId={profile.id}
            username={profile.username}
            followersCount={profile.followersCount}
            followingCount={profile.followingCount}
            totalPosts={profile.totalPosts}
            totalLikes={profile.totalLikes}
            rank={profile.rank}
            currentUserId={currentUserId}
            mode="public"
          />
        </div>

        {/* ── Feed de Publicaciones del Usuario ────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              Consejos de @{profile.username} ({profile.posts.length})
            </h2>
          </div>

          {profile.posts.length === 0 ? (
            <div className="bg-zinc-900/30 border border-dashed border-white/[0.06] rounded-2xl py-16 text-center">
              <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-sm font-medium text-zinc-400">
                Este usuario aún no ha publicado consejos.
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">
                Vuelve más tarde para ver sus aportes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
