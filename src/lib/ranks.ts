export type UserRank = 'Recluta' | 'Estudiante' | 'Veterano' | 'Leyenda';

/**
 * Determina el rango/nivel del usuario según sus estadísticas históricas:
 * - 'Leyenda': 10 o más likes totales recibidos en sus publicaciones.
 * - 'Veterano': 3 o más publicaciones creadas.
 * - 'Estudiante': 1 a 2 publicaciones creadas.
 * - 'Recluta': 0 publicaciones (nivel inicial).
 */
export function getUserRank(totalPosts: number, totalLikes: number): UserRank {
  if (totalLikes >= 10) return 'Leyenda';
  if (totalPosts >= 3)  return 'Veterano';
  if (totalPosts >= 1)  return 'Estudiante';
  return 'Recluta';
}
