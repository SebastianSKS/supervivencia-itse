import Navbar from '@/components/Navbar';
import { getTopVeterans } from '@/actions/veterans';
import UserAvatar from '@/components/UserAvatar';
import RankBadge from '@/components/RankBadge';
import { Trophy, Heart, BookOpen, Medal } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Estilos de posición para el podio
const POSITION_CONFIG: Record<
  number,
  { label: string; ring: string; numClass: string }
> = {
  1: {
    label: '1.°',
    ring:  'ring-2 ring-amber-400/60',
    numClass: 'text-amber-400 font-black text-base',
  },
  2: {
    label: '2.°',
    ring:  'ring-2 ring-zinc-400/40',
    numClass: 'text-zinc-300 font-black text-base',
  },
  3: {
    label: '3.°',
    ring:  'ring-2 ring-amber-700/50',
    numClass: 'text-amber-600/90 font-black text-base',
  },
};

export default async function RankingPage() {
  const veterans = await getTopVeterans();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-10 sm:py-14">

        {/* ── Cabecera ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-4">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-100 tracking-tight mb-2">
            Salón de la Fama
          </h1>
          <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
            Los{' '}
            <span className="text-zinc-300 font-medium">veteranos del ITSE</span>{' '}
            con mayor reconocimiento de la comunidad, ordenados por likes totales.
          </p>
        </div>

        {/* ── Lista de rankings ─────────────────────────────────────────────── */}
        {veterans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/[0.06] rounded-2xl text-center px-4">
            <Medal className="w-10 h-10 text-zinc-800 mb-3" />
            <p className="text-zinc-500 font-medium text-sm">
              Aún no hay suficiente actividad para el ranking.
            </p>
            <p className="text-zinc-600 text-xs mt-1">
              Publica consejos y recibe likes para aparecer aquí.
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl overflow-hidden">
            {veterans.map((veteran, index) => {
              const position = index + 1;
              const config   = POSITION_CONFIG[position];
              const isTop3   = position <= 3;

              return (
                <Link
                  key={veteran.id}
                  href={`/user/${veteran.username}`}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors group border-b border-white/[0.04] last:border-b-0 ${
                    isTop3
                      ? 'hover:bg-zinc-800/60 bg-zinc-900/20'
                      : 'hover:bg-zinc-800/30'
                  }`}
                >
                  {/* Número de posición */}
                  <span
                    className={`w-7 text-center tabular-nums shrink-0 ${
                      config
                        ? config.numClass
                        : 'text-zinc-500 font-semibold text-sm'
                    }`}
                  >
                    {position}
                  </span>

                  {/* Avatar */}
                  <div
                    className={`rounded-full bg-zinc-800 overflow-hidden shrink-0 transition-all ${
                      config ? config.ring : 'hover:ring-1 hover:ring-white/10'
                    }`}
                  >
                    <UserAvatar
                      username={veteran.username}
                      size={isTop3 ? 44 : 38}
                      className="rounded-full"
                    />
                  </div>

                  {/* Username + rango */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold truncate group-hover:text-white transition-colors ${
                        isTop3 ? 'text-zinc-100 text-sm' : 'text-zinc-300 text-sm'
                      }`}
                    >
                      @{veteran.username}
                    </p>
                    <div className="mt-0.5">
                      <RankBadge rank={veteran.rank} size="sm" />
                    </div>
                  </div>

                  {/* Stats: likes + posts */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-zinc-300">
                      <Heart className="w-3.5 h-3.5 text-red-400/80 shrink-0" />
                      {veteran.total_likes}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs tabular-nums text-zinc-500">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      {veteran.total_posts}{' '}
                      {veteran.total_posts === 1 ? 'consejo' : 'consejos'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Nota de pie ───────────────────────────────────────────────────── */}
        <p className="text-center text-zinc-700 text-xs mt-6">
          El ranking se actualiza en tiempo real con cada like recibido.
        </p>

      </main>
    </div>
  );
}
