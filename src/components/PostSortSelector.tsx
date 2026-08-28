'use client';

import { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpDown, Loader2 } from 'lucide-react';

export default function PostSortSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get('sort') || 'newest';

  function handleSortChange(newSort: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }

    startTransition(() => {
      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, {
        scroll: false,
      });
    });
  }

  return (
    <div className="relative inline-flex items-center">
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin absolute left-3 pointer-events-none" />
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
      )}
      <select
        value={currentSort}
        disabled={isPending}
        onChange={(e) => handleSortChange(e.target.value)}
        className="bg-zinc-900/80 hover:bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs font-medium rounded-xl pl-8 pr-8 py-2 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all cursor-pointer appearance-none shadow-sm disabled:opacity-50"
        aria-label="Ordenar consejos"
      >
        <option value="newest" className="bg-zinc-900 text-zinc-200">
          Más recientes
        </option>
        <option value="popular" className="bg-zinc-900 text-zinc-200">
          Más populares
        </option>
        <option value="oldest" className="bg-zinc-900 text-zinc-200">
          Más antiguos
        </option>
      </select>
      <div className="absolute right-3 pointer-events-none text-zinc-500 text-[10px]">
        ▼
      </div>
    </div>
  );
}
