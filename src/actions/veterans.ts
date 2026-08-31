'use server';

import { db } from '@/lib/db';
import { getUserRank, UserRank } from '@/lib/ranks';

export type Veteran = {
  id: number;
  username: string;
  total_likes: number;
  total_posts: number;
  rank: UserRank;
};

/**
 * Devuelve los 10 usuarios con más likes totales recibidos en sus posts.
 * Ordenado por SUM(likes) DESC, con fallback a total_posts en caso de empate.
 */
export async function getTopVeterans(): Promise<Veteran[]> {
  try {
    const result = await db.execute({
      sql: `
        SELECT
          u.id,
          u.username,
          COUNT(DISTINCT p.id)   AS total_posts,
          COUNT(DISTINCT l.id)   AS total_likes
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id
        LEFT JOIN likes l ON p.id = l.post_id
        GROUP BY u.id, u.username
        ORDER BY total_likes DESC, total_posts DESC
        LIMIT 10
      `,
      args: [],
    });

    return result.rows.map((row) => {
      const totalPosts = Number(row.total_posts || 0);
      const totalLikes = Number(row.total_likes || 0);
      return {
        id:          Number(row.id),
        username:    (row.username as string) ?? 'Anónimo',
        total_likes: totalLikes,
        total_posts: totalPosts,
        rank:        getUserRank(totalPosts, totalLikes),
      };
    });
  } catch (err: unknown) {
    console.error('[getTopVeterans] Error:', err instanceof Error ? err.message : err);
    return [];
  }
}
