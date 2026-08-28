export type UserRank = 'Recluta' | 'Estudiante' | 'Veterano' | 'Leyenda';

export interface RankProgressInfo {
  currentRank: UserRank;
  nextRank: UserRank | null;
  percentage: number;
  message: string;
  isMax: boolean;
  currentValue: number;
  targetValue: number;
}

export interface RankCodexItem {
  id: UserRank;
  name: string;
  title: string;
  requirement: string;
  description: string;
  icon: string;
}

export const RANKS_CODEX: RankCodexItem[] = [
  {
    id: 'Recluta',
    name: 'Recluta',
    title: 'Nivel 1',
    requirement: '0 publicaciones',
    description: 'Nivel inicial al unirte a la comunidad. Aún estás explorando los pasillos del ITSE.',
    icon: 'user',
  },
  {
    id: 'Estudiante',
    name: 'Estudiante',
    title: 'Nivel 2',
    requirement: 'Publica 1 a 2 consejos',
    description: 'Has empezado a dejar tus primeras huellas y aprendizajes para los novatos.',
    icon: 'book',
  },
  {
    id: 'Veterano',
    name: 'Veterano',
    title: 'Nivel 3',
    requirement: 'Publica 3 o más consejos',
    description: 'Has superado múltiples parciales y eres una voz respetada en la comunidad.',
    icon: 'shield',
  },
  {
    id: 'Leyenda',
    name: 'Leyenda',
    title: 'Nivel Máximo',
    requirement: 'Acumula 10 o más likes totales',
    description: 'Tus consejos han salvado semestres enteros. Eres un pilar legendario del ITSE.',
    icon: 'star',
  },
];

/**
 * Determina el rango/nivel del usuario según sus estadísticas históricas
 */
export function getUserRank(totalPosts: number, totalLikes: number): UserRank {
  if (totalLikes >= 10) return 'Leyenda';
  if (totalPosts >= 3)  return 'Veterano';
  if (totalPosts >= 1)  return 'Estudiante';
  return 'Recluta';
}

/**
 * Calcula el progreso (XP) porcentual y el mensaje explicativo hacia el siguiente rango
 */
export function getRankProgress(totalPosts: number, totalLikes: number): RankProgressInfo {
  const currentRank = getUserRank(totalPosts, totalLikes);

  if (currentRank === 'Leyenda') {
    return {
      currentRank: 'Leyenda',
      nextRank: null,
      percentage: 100,
      message: '¡Nivel Máximo Alcanzado! Eres una Leyenda del ITSE.',
      isMax: true,
      currentValue: totalLikes,
      targetValue: 10,
    };
  }

  if (currentRank === 'Veterano') {
    const needed = Math.max(0, 10 - totalLikes);
    const pct = Math.min(99, Math.max(10, Math.round((totalLikes / 10) * 100)));
    return {
      currentRank: 'Veterano',
      nextRank: 'Leyenda',
      percentage: pct,
      message: `${needed} ${needed === 1 ? 'like más' : 'likes más'} para alcanzar el rango Leyenda`,
      isMax: false,
      currentValue: totalLikes,
      targetValue: 10,
    };
  }

  if (currentRank === 'Estudiante') {
    const needed = Math.max(0, 3 - totalPosts);
    const pct = Math.min(99, Math.max(33, Math.round((totalPosts / 3) * 100)));
    return {
      currentRank: 'Estudiante',
      nextRank: 'Veterano',
      percentage: pct,
      message: `${needed} ${needed === 1 ? 'consejo más' : 'consejos más'} para alcanzar el rango Veterano`,
      isMax: false,
      currentValue: totalPosts,
      targetValue: 3,
    };
  }

  // Recluta
  return {
    currentRank: 'Recluta',
    nextRank: 'Estudiante',
    percentage: 10,
    message: '1 consejo más para alcanzar el rango Estudiante',
    isMax: false,
    currentValue: 0,
    targetValue: 1,
  };
}
