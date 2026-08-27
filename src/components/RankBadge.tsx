import { UserRank } from '@/lib/ranks';
import { Star, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  rank: UserRank;
  size?: 'sm' | 'md';
}

export default function RankBadge({ rank, size = 'sm' }: Props) {
  const isSm = size === 'sm';

  switch (rank) {
    case 'Leyenda':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-950/40 border border-amber-500/50 text-amber-400 shadow-sm shadow-amber-500/10 ${
            isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
          title="Rango Leyenda: +10 likes en total"
        >
          <Star className={isSm ? 'w-2.5 h-2.5 fill-amber-400 text-amber-400' : 'w-3 h-3 fill-amber-400 text-amber-400'} />
          <span>Leyenda</span>
        </span>
      );

    case 'Veterano':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/10 ${
            isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
          title="Rango Veterano: +3 consejos publicados"
        >
          <ShieldCheck className={isSm ? 'w-2.5 h-2.5 text-cyan-400' : 'w-3 h-3 text-cyan-400'} />
          <span>Veterano</span>
        </span>
      );

    case 'Estudiante':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-zinc-800 border border-white/[0.06] text-zinc-400 ${
            isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
          title="Rango Estudiante: 1-2 consejos publicados"
        >
          <span>Estudiante</span>
        </span>
      );

    case 'Recluta':
    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-zinc-800 border border-white/[0.06] text-zinc-400 ${
            isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
          title="Rango Recluta: Nivel inicial"
        >
          <span>Recluta</span>
        </span>
      );
  }
}
