import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { logout } from '@/actions/auth';
import { getMyPosts, getUserStats } from '@/actions/posts';
import UpdateUsernameForm from './UpdateUsernameForm';
import MyPostCard from '@/components/MyPostCard';
import Navbar from '@/components/Navbar';
import RankBadge from '@/components/RankBadge';
import { User, Shield, Calendar, LogOut, Crown, LayoutGrid, PenSquare, Heart, Award } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [myPosts, userStats] = await Promise.all([
    getMyPosts(session.userId),
    getUserStats(session.userId),
  ]);

  const isAdmin = session.role === 'admin';

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12">

        {/* ── Cabecera ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-5 h-5 text-zinc-500" />
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Mi Perfil</h1>
        </div>

        {/* ── Info del usuario ──────────────────────────────────────────────── */}
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-6 mb-4">
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

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                <h2 className="text-xl font-bold text-zinc-100">@{session.username}</h2>
                <RankBadge rank={userStats.rank} size="md" />
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full text-amber-400 bg-amber-400/10 border border-amber-400/20">
                    <Crown className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <User className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span className="truncate">{session.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span>{userStats.totalPosts} {userStats.totalPosts === 1 ? 'consejo publicado' : 'consejos publicados'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Heart className="w-3.5 h-3.5 text-red-500/60 shrink-0" />
                  <span>{userStats.totalLikes} {userStats.totalLikes === 1 ? 'like recibido' : 'likes recibidos'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Award className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span>Nivel: <strong className="text-zinc-200">{userStats.rank}</strong></span>
                </div>
              </div>
            </div>
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
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-6 mb-10">
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

        {/* ── Mis Consejos ──────────────────────────────────────────────────── */}
        <div>
          {/* Encabezado sección */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4 text-zinc-500" />
              <h2 className="text-base font-bold text-zinc-100">Mis Consejos Publicados</h2>
              <span className="text-zinc-600 text-sm">({myPosts.length})</span>
            </div>
            <Link
              href="/publicar"
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-white/[0.08] hover:border-white/20 bg-zinc-900/40 px-3 py-1.5 rounded-lg transition-all"
            >
              <PenSquare className="w-3.5 h-3.5" />
              + Nuevo
            </Link>
          </div>

          {/* Grid de mis posts */}
          {myPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 border border-dashed border-white/[0.06] rounded-2xl">
              <LayoutGrid className="w-9 h-9 text-zinc-800 mb-3" />
              <p className="text-zinc-500 text-sm font-medium">Aún no has publicado nada</p>
              <p className="text-zinc-600 text-xs mt-1 mb-4">
                Comparte tu experiencia con los de primer semestre
              </p>
              <Link
                href="/publicar"
                className="text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white px-4 py-2 rounded-lg transition-colors"
              >
                Publicar mi primer consejo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPosts.map(post => (
                <MyPostCard key={post.id} post={post} currentUserId={session.userId} />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
