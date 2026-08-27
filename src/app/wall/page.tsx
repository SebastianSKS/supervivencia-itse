import { getPosts } from '@/actions/posts';
import { getSession } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import { LayoutGrid, PenSquare } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function WallPage() {
  const [session, posts] = await Promise.all([getSession(), getPosts()]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12">

        {/* Encabezado + botón publicar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <LayoutGrid className="w-5 h-5 text-zinc-500" />
              <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">El Muro</h1>
            </div>
            <p className="text-zinc-500 text-sm pl-7">
              {posts.length} {posts.length === 1 ? 'consejo publicado' : 'consejos publicados'}
            </p>
          </div>

          {session ? (
            <Link
              href="/publicar"
              className="flex items-center gap-2 text-sm font-semibold bg-zinc-100 text-zinc-900 hover:bg-white px-4 py-2.5 rounded-xl transition-colors"
            >
              <PenSquare className="w-4 h-4" />
              + Nuevo consejo
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 border border-white/10 hover:border-white/20 bg-zinc-900/40 px-4 py-2.5 rounded-xl transition-all"
            >
              Inicia sesión para publicar
            </Link>
          )}
        </div>

        {/* Grid de posts */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/[0.06] rounded-2xl">
            <LayoutGrid className="w-10 h-10 text-zinc-800 mb-3" />
            <p className="text-zinc-500 font-medium text-sm">El muro está vacío</p>
            <p className="text-zinc-600 text-xs mt-1">¡Sé el primero en dejar un consejo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
