import { Trophy, Heart, BookOpen } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from './UserAvatar';
import RankBadge from './RankBadge';
import type { Veteran } from '@/actions/veterans';

interface Props {
  veterans: Veteran[];
}

// Medallas para los 3 primeros
const MEDAL_STYLES: Record<number, string> = {
  1: 'text-amber-400 font-black',
  2: 'text-zinc-300 font-black',
  3: 'text-amber-600/90 font-black',
};

export default function HallOfFame({ veterans }: Props) {
  if (veterans.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-amber-400/70" />
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Salón de la Fama
          </h3>
        </div>
        <p className="text-zinc-600 text-xs text-center py-6">
          Aún no hay datos suficientes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Cabecera */}
      <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-400/80 shrink-0" />
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
          Salón de la Fama
        </h3>
      </div>

      {/* Lista */}
      <div className="divide-y divide-white/[0.04]">
        {veterans.map((veteran, index) => {
          const position = index + 1;
          const medalClass = MEDAL_STYLES[position] ?? 'text-zinc-500 font-semibold';

          return (
            <Link
              key={veteran.id}
              href={`/user/${veteran.username}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/40 transition-colors group"
            >
              {/* Posición */}
              <span
                className={`w-5 text-center text-sm shrink-0 tabular-nums ${medalClass}`}
              >
                {position}
              </span>

              {/* Avatar */}
              <div className="rounded-full bg-zinc-800 border border-white/[0.08] shrink-0 overflow-hidden group-hover:border-white/20 transition-colors">
                <UserAvatar username={veteran.username} size={30} className="rounded-full" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                  @{veteran.username}
                </p>
                <RankBadge rank={veteran.rank} size="sm" />
              </div>

              {/* Estadísticas */}
              <div className="shrink-0 flex flex-col items-end gap-0.5">
                <span className="flex items-center gap-1 text-[11px] text-zinc-400 tabular-nums">
                  <Heart className="w-3 h-3 text-red-400/70 shrink-0" />
                  {veteran.total_likes}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-600 tabular-nums">
                  <BookOpen className="w-2.5 h-2.5 shrink-0" />
                  {veteran.total_posts}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.04]">
        <p className="text-[10px] text-zinc-600 text-center">
          Ranking por likes totales recibidos
        </p>
      </div>
    </div>
  );
}
