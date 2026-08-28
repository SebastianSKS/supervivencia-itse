import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import PostSortSelector from '@/components/PostSortSelector';
import { getSession } from '@/lib/auth';
import { getPosts } from '@/actions/posts';
import { ArrowDown, LayoutGrid, Users, BookOpen, Heart, PenSquare } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ sort?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { sort } = await searchParams;
  const [session, posts] = await Promise.all([getSession(), getPosts(sort)]);
  const totalLikes = posts.reduce((sum, p) => sum + p.like_count, 0);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center px-4 pt-14 sm:pt-20 pb-12 sm:pb-16">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 border border-white/10 bg-zinc-900/60 px-3 py-1.5 rounded-full mb-6 sm:mb-8">
          <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
          <span>Foro de la comunidad ITSE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight sm:leading-none mb-4 sm:mb-6 text-zinc-100">
          Sobrevive el<br />
          <span className="text-white">primer semestre</span>
        </h1>

        <p className="text-zinc-500 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-8 sm:mb-10 px-2">
          Consejos directos de veteranos del{' '}
          <span className="text-zinc-300 font-medium">ITSE</span> para que no
          cometas los mismos errores.
        </p>

        <a
          href="#muro"
          className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-900 hover:bg-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-xs sm:text-sm shadow-md"
        >
          <ArrowDown className="w-4 h-4" />
          Ver consejos
        </a>
      </section>

      {/* ── Stats dinámicas ───────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 mb-12 sm:mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Consejos publicados', value: posts.length, icon: BookOpen },
            { label: 'Autores únicos', value: new Set(posts.map(p => p.user_id)).size, icon: Users },
            { label: 'Likes totales', value: totalLikes, icon: Heart },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 sm:p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/[0.06] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono">{value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-white/[0.05]" />
      </div>

      {/* ── El Muro ───────────────────────────────────────────────────────────── */}
      <section id="muro" className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        {/* Encabezado + Selector de ordenamiento + botón publicar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <LayoutGrid className="w-5 h-5 text-zinc-500 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">El Muro</h2>
            </div>
            <p className="text-zinc-500 text-xs sm:text-sm pl-7">
              {posts.length} {posts.length === 1 ? 'consejo publicado' : 'consejos publicados'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Selector de ordenamiento dinámico */}
            <PostSortSelector />

            {session ? (
              <Link
                href="/publicar"
                className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold bg-zinc-100 text-zinc-900 hover:bg-white px-4 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
              >
                <PenSquare className="w-4 h-4" />
                + Nuevo consejo
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 border border-white/10 hover:border-white/20 bg-zinc-900/40 px-4 py-2.5 rounded-xl transition-all shrink-0"
              >
                Inicia sesión para publicar
              </Link>
            )}
          </div>
        </div>

        {/* Grid de posts responsive */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 border border-dashed border-white/[0.06] rounded-2xl w-full px-4 text-center">
            <LayoutGrid className="w-10 h-10 text-zinc-800 mb-3" />
            <p className="text-zinc-500 font-medium text-sm">No se encontraron consejos</p>
            <p className="text-zinc-600 text-xs mt-1">
              {session ? '¡Sé el primero en dejar un consejo!' : 'Inicia sesión para publicar el primer consejo.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {posts.map(post => (
              <PostCard key={post.id} post={post} currentUserId={session?.userId ?? null} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] mt-10">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-xs text-zinc-600">Supervivencia ITSE — {new Date().getFullYear()}</p>
          <Link href="/wall" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Ver muro completo →
          </Link>
        </div>
      </footer>
    </div>
  );
}
