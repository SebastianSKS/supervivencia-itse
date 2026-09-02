'use client';

import { useState, useMemo } from 'react';
import { LayoutGrid, PenSquare, AlertTriangle, Sparkles, Clock, Flame, Hourglass, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import PostCard from './PostCard';
import type { Post } from '@/actions/posts';

const CATEGORIES = ['Trámites', 'Profesores', 'Cafetería', 'Residencias', 'Exámenes'];
type SortOption = 'random' | 'newest' | 'popular' | 'oldest';

interface Props {
  initialPosts: Post[];
  currentUserId: number | null;
  hasSession: boolean;
  loadError: string | null;
}

export default function Feed({ initialPosts, currentUserId, hasSession, loadError }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<SortOption>('random');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // 1. Filtrar por categoría
  const filteredPosts = useMemo(() => {
    if (!activeCategory) return initialPosts;
    return initialPosts.filter(p => p.category === activeCategory);
  }, [initialPosts, activeCategory]);

  // 2. Ordenar
  const sortedPosts = useMemo(() => {
    const arr = [...filteredPosts];
    if (activeSort === 'newest') {
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (activeSort === 'oldest') {
      arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (activeSort === 'popular') {
      arr.sort((a, b) => {
        if (b.like_count === a.like_count) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return b.like_count - a.like_count;
      });
    } else if (activeSort === 'random') {
      // Deterministic pseudo-random based on id to prevent re-render jumps, or just random
      // To keep it simple and match previous behavior:
      arr.sort(() => Math.random() - 0.5);
    }
    return arr;
  }, [filteredPosts, activeSort]);

  const SortIcon = {
    random: Sparkles,
    newest: Clock,
    popular: Flame,
    oldest: Hourglass,
  }[activeSort];

  const sortLabels = {
    random: 'Para ti',
    newest: 'Más recientes',
    popular: 'Más populares',
    oldest: 'Más antiguos',
  };

  return (
    <section id="muro" className="max-w-4xl mx-auto px-4 pt-2 pb-12 sm:pb-16">
      {/* Encabezado + Selector + botón publicar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <LayoutGrid className="w-5 h-5 text-zinc-500 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">El Muro</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm pl-7">
            {sortedPosts.length} {sortedPosts.length === 1 ? 'consejo encontrado' : 'consejos encontrados'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Custom Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs font-medium rounded-xl px-4 py-2.5 transition-all"
            >
              <SortIcon className="w-4 h-4 text-cyan-400" />
              <span>{sortLabels[activeSort]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 ml-1" />
            </button>
            
            {isSortOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 flex flex-col py-1">
                {(['random', 'newest', 'popular', 'oldest'] as SortOption[]).map((sortOpt) => {
                  const Icon = {
                    random: Sparkles,
                    newest: Clock,
                    popular: Flame,
                    oldest: Hourglass,
                  }[sortOpt];
                  
                  return (
                    <button
                      key={sortOpt}
                      onClick={() => {
                        setActiveSort(sortOpt);
                        setIsSortOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors \${
                        activeSort === sortOpt 
                          ? 'bg-zinc-800 text-zinc-100' 
                          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 \${activeSort === sortOpt ? 'text-cyan-400' : 'text-zinc-500'}`} />
                      {sortLabels[sortOpt]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {hasSession ? (
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

      {/* Filtro de Categorías (Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors border \${
            !activeCategory
              ? 'bg-zinc-100 border-zinc-100 text-zinc-900'
              : 'bg-zinc-900/50 border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors border \${
              activeCategory === cat
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-zinc-900/50 border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loadError ? (
        <div className="flex flex-col items-center justify-center py-16 border border-red-500/10 bg-red-500/5 rounded-2xl px-4 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400/60 mb-3" />
          <p className="text-zinc-400 font-medium text-sm">Hubo un problema al cargar el muro</p>
          <p className="text-zinc-600 text-xs mt-1 font-mono break-all max-w-md">{loadError}</p>
          <p className="text-zinc-600 text-xs mt-3">Intenta recargar la página.</p>
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 sm:py-24 border border-dashed border-white/[0.06] rounded-2xl w-full px-4 text-center">
          <LayoutGrid className="w-10 h-10 text-zinc-800 mb-3" />
          <p className="text-zinc-500 font-medium text-sm">No se encontraron consejos</p>
          <p className="text-zinc-600 text-xs mt-1">
            {hasSession ? '¡Sé el primero en dejar un consejo aquí!' : 'Inicia sesión para publicar.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {sortedPosts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </section>
  );
}
