'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const CATEGORIES = ['Trámites', 'Profesores', 'Cafetería', 'Residencias', 'Exámenes'];

export default function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const setCategory = (cat: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        onClick={() => setCategory(null)}
        className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
          !currentCategory
            ? 'bg-zinc-100 border-zinc-100 text-zinc-900'
            : 'bg-zinc-900/50 border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
        }`}
      >
        Todos
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            currentCategory === cat
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              : 'bg-zinc-900/50 border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
