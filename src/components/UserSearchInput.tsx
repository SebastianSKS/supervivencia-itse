'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, User, Loader2, X } from 'lucide-react';
import { searchUsers, UserSearchResult } from '@/actions/social';
import RankBadge from './RankBadge';
import Link from 'next/link';

export default function UserSearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clean = query.trim();
    if (clean.length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(clean);
        setResults(res);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Buscar estudiante..."
          className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-2 text-zinc-500 hover:text-zinc-300 p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/80 overflow-hidden z-50 animate-float-up">
          {isLoading ? (
            <div className="p-3 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Buscando...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-3 text-center text-xs text-zinc-500">
              No se encontraron usuarios.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04] max-h-60 overflow-y-auto">
              {results.map((u) => (
                <Link
                  key={u.id}
                  href={`/user/${u.username}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="flex items-center justify-between p-2.5 hover:bg-zinc-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 text-xs font-semibold shrink-0">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate block">
                        @{u.username}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {u.totalPosts} consejos • {u.totalLikes} likes
                      </span>
                    </div>
                  </div>
                  <RankBadge rank={u.rank} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
