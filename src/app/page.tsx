import Navbar from '@/components/Navbar';
import Feed from '@/components/Feed';
import { getSession } from '@/lib/auth';
import { getPosts } from '@/actions/posts';
import { ArrowDown, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let session = null;
  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  let loadError: string | null = null;

  try {
    // Obtenemos todos los posts. Feed.tsx se encarga de filtrar y ordenar en el cliente.
    [session, posts] = await Promise.all([getSession(), getPosts()]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[HomePage] Error al cargar datos:', msg);
    loadError = msg;
    try { session = await getSession(); } catch { /* ignorar */ }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center px-4 pt-14 sm:pt-20 pb-10 sm:pb-14 overflow-hidden bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(6,182,212,0.12),transparent)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
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

      {/* ── El Muro ───────────────────────────────────────────────────────────── */}
      <Feed 
        initialPosts={posts} 
        currentUserId={session?.userId ?? null} 
        hasSession={!!session} 
        loadError={loadError} 
      />

      {/* Footer */}
      <footer className="border-t border-white/[0.04] mt-4">
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
