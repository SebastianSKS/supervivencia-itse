import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { logout } from '@/actions/auth';
import { getMyPosts, getUserStats } from '@/actions/posts';
import { getFavoritePosts } from '@/actions/favorites';
import { getRankProgress, RANKS_CODEX } from '@/lib/ranks';
import UpdateUsernameForm from './UpdateUsernameForm';
import Navbar from '@/components/Navbar';
import RankBadge from '@/components/RankBadge';
import ProfileFollowStats from '@/components/ProfileFollowStats';
import ProfileTabs from '@/components/ProfileTabs';
import {
  User,
  Shield,
  Calendar,
  LogOut,
  Crown,
  Heart,
  Award,
  Zap,
  BookOpen,
  ShieldCheck,
  Star,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [myPosts, favoritePosts, userStats] = await Promise.all([
    getMyPosts(session.userId),
    getFavoritePosts(session.userId),
    getUserStats(session.userId),
  ]);

  const isAdmin = session.role === 'admin';
  const progress = getRankProgress(userStats.totalPosts, userStats.totalLikes);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">

        {/* ── Cabecera ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-5 h-5 text-zinc-500" />
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Mi Perfil</h1>
        </div>

        {/* ── Info del usuario + Barra de Progreso (XP) ────────────────────── */}
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-2xl font-black border"
              style={{
                background: isAdmin ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.04)',
                borderColor: isAdmin ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.08)',
                color: isAdmin ? '#fbbf24' : '#e4e4e7',
              }}
            >
              {session.username.charAt(0).toUpperCase()}
            </div>

            {/* Info Principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <h2 className="text-xl font-bold text-zinc-100">@{session.username}</h2>
                <RankBadge rank={userStats.rank} size="md" />
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full text-amber-400 bg-amber-400/10 border border-amber-400/20">
                    <Crown className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span className="truncate">{session.email}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Award className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span>Nivel: <strong className="text-zinc-200">{userStats.rank}</strong></span>
                </div>
              </div>

              {/* ── Contadores Sociales Interactivos (Seguidores & Seguidos Modal) ── */}
              <ProfileFollowStats
                userId={session.userId}
                username={session.username}
                followersCount={userStats.followersCount}
                followingCount={userStats.followingCount}
                totalPosts={userStats.totalPosts}
                totalLikes={userStats.totalLikes}
                rank={userStats.rank}
                currentUserId={session.userId}
                mode="profile"
              />
            </div>
          </div>

          {/* ── Barra de Progreso XP ────────────────────────────────────────── */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Progreso hacia siguiente rango</span>
              </div>
              <span className="text-[11px] text-zinc-400">
                {progress.message}
              </span>
            </div>

            {/* Barra */}
            <div className="w-full h-2.5 bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  progress.isMax
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 shadow-sm shadow-amber-500/40'
                    : progress.currentRank === 'Veterano'
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-sm shadow-cyan-500/30'
                    : progress.currentRank === 'Estudiante'
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                    : 'bg-zinc-500'
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            {/* Marcadores de nivel */}
            <div className="flex justify-between items-center text-[10px] text-zinc-600 mt-1.5 px-0.5 font-mono">
              <span>Recluta (0)</span>
              <span>Estudiante (1)</span>
              <span>Veterano (3)</span>
              <span className="text-amber-400/80">Leyenda (10)</span>
            </div>
          </div>
        </div>

        {/* ── Códice de Rangos (Guía de Logros) ─────────────────────────────── */}
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Guía de Rangos y Logros
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RANKS_CODEX.map((rank) => {
              const isCurrent = userStats.rank === rank.name;

              return (
                <div
                  key={rank.name}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-zinc-800/80 border-white/20 shadow-sm'
                      : 'bg-zinc-950/40 border-white/[0.04] opacity-50 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{rank.icon}</span>
                      <span className="font-bold text-sm text-zinc-100">{rank.name}</span>
                    </div>

                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Actual
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-zinc-500">
                        {rank.requirement}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                    {rank.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Actualizar username ───────────────────────────────────────────── */}
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-6 mb-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Actualizar Username
          </h3>
          <UpdateUsernameForm currentUsername={session.username} />
        </div>

        {/* ── Cerrar sesión ─────────────────────────────────────────────────── */}
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-6 mb-8">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Sesión
          </h3>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm font-medium text-red-500/70 hover:text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-400/10 hover:border-red-400/20 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* ── Pestañas: Mis Consejos & Favoritos ────────────────────────────── */}
        <ProfileTabs
          myPosts={myPosts}
          favoritePosts={favoritePosts}
          currentUserId={session.userId}
        />

      </main>
    </div>
  );
}
