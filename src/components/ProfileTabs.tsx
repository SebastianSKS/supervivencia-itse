'use client';

import { useState } from 'react';
import type { Post } from '@/actions/posts';
import MyPostCard from './MyPostCard';
import PostCard from './PostCard';
import { LayoutGrid, Bookmark, PenSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Props {
  myPosts: Post[];
  favoritePosts: Post[];
  currentUserId: number;
}

type TabType = 'my_posts' | 'favorites';

export default function ProfileTabs({
  myPosts,
  favoritePosts,
  currentUserId,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('my_posts');

  return (
    <div className="space-y-6">
      {/* ── Selector de Pestañas (Tabs Glassmorphism) ──────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-1 gap-2 flex-wrap">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Pestaña 1: Mis Consejos */}
          <button
            onClick={() => setActiveTab('my_posts')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'my_posts'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-cyan-400" />
            <span>Mis Consejos</span>
            <span className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-zinc-900/80 text-zinc-400 border border-white/[0.06]">
              {myPosts.length}
            </span>
          </button>

          {/* Pestaña 2: Favoritos / Guardados */}
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-cyan-400 text-cyan-400' : 'text-cyan-400'}`} />
            <span>Favoritos</span>
            <span className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-zinc-900/80 text-zinc-400 border border-white/[0.06]">
              {favoritePosts.length}
            </span>
          </button>
        </div>

        {/* Botón rápido de publicar si está en Mis Consejos */}
        {activeTab === 'my_posts' && (
          <Link
            href="/publicar"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>+ Nuevo</span>
          </Link>
        )}
      </div>

      {/* ── Contenido de Pestaña 1: Mis Consejos ────────────────────────────── */}
      {activeTab === 'my_posts' && (
        <div>
          {myPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/[0.06] rounded-2xl px-4 text-center">
              <LayoutGrid className="w-10 h-10 text-zinc-800 mb-3" />
              <p className="text-zinc-400 text-sm font-semibold">Aún no has publicado ningún consejo</p>
              <p className="text-zinc-600 text-xs mt-1 mb-5 max-w-sm">
                Comparte tus aprendizajes y trucos de supervivencia para ayudar a los nuevos estudiantes del ITSE.
              </p>
              <Link
                href="/publicar"
                className="text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                Publicar mi primer consejo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {myPosts.map((post) => (
                <MyPostCard key={post.id} post={post} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Contenido de Pestaña 2: Favoritos / Guardados ───────────────────── */}
      {activeTab === 'favorites' && (
        <div>
          {favoritePosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/[0.06] rounded-2xl px-4 text-center">
              <Bookmark className="w-10 h-10 text-zinc-800 mb-3" />
              <p className="text-zinc-400 text-sm font-semibold">No tienes consejos guardados</p>
              <p className="text-zinc-600 text-xs mt-1 mb-5 max-w-sm">
                Guarda los consejos más útiles de tus compañeros haciendo clic en el icono de marcador para tenerlos siempre a mano.
              </p>
              <Link
                href="/wall"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                Explorar El Muro
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {favoritePosts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
