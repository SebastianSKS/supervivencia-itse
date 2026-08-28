'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getUserRank, UserRank } from '@/lib/ranks';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  user_id: number;
  username: string;
  like_count: number;
  author_posts: number;
  author_likes: number;
  author_rank: UserRank;
  has_liked: boolean;
  is_following_author?: boolean;
};

export type CreatePostState = { error?: string; success?: boolean } | null;

// ─── Helper: mapear fila de BD → Post con Rango, Likes y Follow ───────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPost(row: any): Post {
  const authorPosts = Number(row.author_posts || 0);
  const authorLikes = Number(row.author_likes || 0);

  return {
    id:                  Number(row.id),
    title:               row.title        as string,
    content:             row.content      as string,
    created_at:          row.created_at   as string,
    user_id:             Number(row.user_id),
    username:            row.username     as string,
    like_count:          Number(row.like_count || 0),
    author_posts:        authorPosts,
    author_likes:        authorLikes,
    author_rank:         getUserRank(authorPosts, authorLikes),
    has_liked:           Number(row.has_liked) === 1,
    is_following_author: Number(row.is_following_author) === 1,
  };
}

// ─── Todos los posts (El Muro) ────────────────────────────────────────────────
export async function getPosts(): Promise<Post[]> {
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
        p.created_at,
        p.user_id,
        COALESCE(u.username, 'Usuario eliminado') AS username,
        COUNT(DISTINCT l.id)                     AS like_count,
        COALESCE(s.total_posts, 0)               AS author_posts,
        COALESCE(s.total_likes, 0)               AS author_likes,
        MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS has_liked,
        MAX(CASE WHEN f.follower_id = ? THEN 1 ELSE 0 END) AS is_following_author
      FROM posts p
      LEFT JOIN users u        ON p.user_id = u.id
      LEFT JOIN likes l        ON p.id = l.post_id
      LEFT JOIN user_stats s   ON p.user_id = s.user_id
      LEFT JOIN follows f      ON p.user_id = f.following_id AND f.follower_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `,
    args: [currentUserId, currentUserId, currentUserId],
  });

  return result.rows.map(rowToPost);
}

// ─── Posts del usuario actual (Perfil) ────────────────────────────────────────
export async function getMyPosts(userId: number): Promise<Post[]> {
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
        p.created_at,
        p.user_id,
        COALESCE(u.username, 'Usuario eliminado') AS username,
        COUNT(DISTINCT l.id)                     AS like_count,
        COALESCE(s.total_posts, 0)               AS author_posts,
        COALESCE(s.total_likes, 0)               AS author_likes,
        MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS has_liked,
        0 AS is_following_author
      FROM posts p
      LEFT JOIN users u      ON p.user_id = u.id
      LEFT JOIN likes l      ON p.id = l.post_id
      LEFT JOIN user_stats s ON p.user_id = s.user_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `,
    args: [userId, userId],
  });

  return result.rows.map(rowToPost);
}

// ─── Obtener estadísticas de un usuario específico ────────────────────────────
export async function getUserStats(userId: number): Promise<{
  totalPosts: number;
  totalLikes: number;
  followersCount: number;
  followingCount: number;
  rank: UserRank;
}> {
  const result = await db.execute({
    sql: `
      SELECT
        COUNT(DISTINCT p.id) AS total_posts,
        COUNT(DISTINCT l.id) AS total_likes,
        (SELECT COUNT(*) FROM follows WHERE following_id = ?) AS followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ?)  AS following_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE u.id = ?
      GROUP BY u.id
    `,
    args: [userId, userId, userId],
  });

  const row = result.rows[0];
  const totalPosts = Number(row?.total_posts || 0);
  const totalLikes = Number(row?.total_likes || 0);
  const followersCount = Number(row?.followers_count || 0);
  const followingCount = Number(row?.following_count || 0);

  return {
    totalPosts,
    totalLikes,
    followersCount,
    followingCount,
    rank: getUserRank(totalPosts, totalLikes),
  };
}

// ─── Validaciones comunes ─────────────────────────────────────────────────────
function validatePost(title: string, content: string): string | null {
  if (!title || !content)   return 'El título y el consejo son obligatorios.';
  if (title.length   < 5)  return 'El título debe tener al menos 5 caracteres.';
  if (title.length   > 120) return 'El título no puede superar 120 caracteres.';
  if (content.length < 20) return 'El consejo debe tener al menos 20 caracteres.';
  return null;
}

// ─── Crear post (inline, sin redirect) ────────────────────────────────────────
export async function createPost(
  _prev: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  const session = await getSession();
  if (!session) return { error: 'Debes iniciar sesión para publicar.' };

  const title   = (formData.get('title')   as string)?.trim();
  const content = (formData.get('content') as string)?.trim();
  const err = validatePost(title, content);
  if (err) return { error: err };

  try {
    await db.execute({
      sql:  'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
      args: [session.userId, title, content],
    });
  } catch {
    return { error: 'Error al publicar. Intenta de nuevo.' };
  }

  revalidatePath('/wall');
  revalidatePath('/');
  return { success: true };
}

// ─── Publicar desde /publicar (con redirect a inicio) ─────────────────────────
export async function publishPost(
  _prev: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  const session = await getSession();
  if (!session) return { error: 'Debes iniciar sesión para publicar.' };

  const title   = (formData.get('title')   as string)?.trim();
  const content = (formData.get('content') as string)?.trim();
  const err = validatePost(title, content);
  if (err) return { error: err };

  try {
    await db.execute({
      sql:  'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
      args: [session.userId, title, content],
    });
  } catch {
    return { error: 'Error al publicar. Intenta de nuevo.' };
  }

  revalidatePath('/');
  revalidatePath('/wall');
  revalidatePath('/profile');
  redirect('/');
}
