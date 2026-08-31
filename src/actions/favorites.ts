'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getUserRank } from '@/lib/ranks';
import type { Post } from './posts';
import { revalidatePath } from 'next/cache';

// ─── Alternar Favorito (Guardar / Quitar de Guardados) ────────────────────────
export async function toggleFavorite(
  postId: number,
): Promise<{ error?: string; isFavorited?: boolean }> {
  const session = await getSession();
  if (!session) {
    return { error: 'Debes iniciar sesión para guardar en favoritos.' };
  }

  const userId = session.userId;

  try {
    // 1. Verificar si ya está en favoritos
    const check = await db.execute({
      sql: 'SELECT id FROM favorites WHERE user_id = ? AND post_id = ? LIMIT 1',
      args: [userId, postId],
    });

    let isFavorited = false;

    if (check.rows.length > 0) {
      // Quitar de favoritos
      await db.execute({
        sql: 'DELETE FROM favorites WHERE user_id = ? AND post_id = ?',
        args: [userId, postId],
      });
      isFavorited = false;
    } else {
      // Guardar en favoritos
      await db.execute({
        sql: 'INSERT INTO favorites (user_id, post_id) VALUES (?, ?)',
        args: [userId, postId],
      });
      isFavorited = true;
    }

    revalidatePath('/profile');
    revalidatePath('/wall');
    revalidatePath('/');

    return { isFavorited };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    return { error: msg || 'Error al actualizar favoritos.' };
  }
}

// ─── Obtener Posts Guardados / Favoritos del Usuario ──────────────────────────
export async function getFavoritePosts(userId: number): Promise<Post[]> {
  const session = await getSession();
  const currentUserId = session?.userId ?? -1;

  const result = await db.execute({
    sql: `
      WITH user_stats AS (
        SELECT
          u.id AS user_id,
          COUNT(DISTINCT p_sub.id) AS total_posts,
          COUNT(l_sub.id)          AS total_likes
        FROM users u
        LEFT JOIN posts p_sub ON u.id = p_sub.user_id
        LEFT JOIN likes l_sub ON p_sub.id = l_sub.post_id
        GROUP BY u.id
      )
      SELECT
        p.id,
        p.title,
        p.content,
        COALESCE(p.views, 0)                     AS views,
        p.created_at,
        p.user_id,
        COALESCE(u.username, 'Usuario eliminado') AS username,
        COUNT(DISTINCT l.id)                     AS like_count,
        COALESCE(s.total_posts, 0)               AS author_posts,
        COALESCE(s.total_likes, 0)               AS author_likes,
        MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS has_liked,
        MAX(CASE WHEN f.follower_id = ? THEN 1 ELSE 0 END) AS is_following_author,
        1 AS has_favorited,
        fav.created_at AS favorited_at
      FROM favorites fav
      JOIN posts p             ON fav.post_id = p.id
      LEFT JOIN users u        ON p.user_id = u.id
      LEFT JOIN likes l        ON p.id = l.post_id
      LEFT JOIN user_stats s   ON p.user_id = s.user_id
      LEFT JOIN follows f      ON p.user_id = f.following_id AND f.follower_id = ?
      WHERE fav.user_id = ?
      GROUP BY p.id, fav.created_at
      ORDER BY fav.created_at DESC
    `,
    args: [currentUserId, currentUserId, userId],
  });

  return result.rows.map((row) => {
    const authorPosts = Number(row.author_posts || 0);
    const authorLikes = Number(row.author_likes || 0);

    return {
      id: Number(row.id),
      title: row.title as string,
      content: row.content as string,
      created_at: row.created_at as string,
      user_id: Number(row.user_id),
      username: row.username as string,
      like_count: Number(row.like_count || 0),
      views: Number(row.views || 0),
      author_posts: authorPosts,
      author_likes: authorLikes,
      author_rank: getUserRank(authorPosts, authorLikes),
      has_liked: Number(row.has_liked) === 1,
      is_following_author: Number(row.is_following_author) === 1,
      has_favorited: true,
    };
  });
}
