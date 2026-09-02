'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getUserRank, UserRank } from '@/lib/ranks';
import type { Post } from '@/actions/posts';
import { revalidatePath } from 'next/cache';

export interface PublicUserProfile {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  totalPosts: number;
  totalLikes: number;
  followersCount: number;
  followingCount: number;
  rank: UserRank;
  isFollowing: boolean;
  isSelf: boolean;
  posts: Post[];
}

export interface NotificationItem {
  id: number;
  userId: number;
  actorId: number;
  actorUsername: string;
  type: 'like' | 'follow';
  postId: number | null;
  postTitle: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UserSearchResult {
  id: number;
  username: string;
  rank: UserRank;
  totalPosts: number;
  totalLikes: number;
}

/**
 * Alterna (seguir / dejar de seguir) a un usuario:
 * - Inserta o elimina en la tabla `follows`.
 * - Genera una notificación de tipo 'follow' al usuario objetivo.
 */
export async function toggleFollow(targetUserId: number): Promise<{ success?: boolean; isFollowing?: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { error: 'unauthenticated' };
  }

  if (session.userId === targetUserId) {
    return { error: 'No puedes seguirte a ti mismo.' };
  }

  try {
    // 1. Verificar si ya lo sigue
    const existing = await db.execute({
      sql: 'SELECT id FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1',
      args: [session.userId, targetUserId],
    });

    if (existing.rows.length > 0) {
      // Dejar de seguir
      await db.execute({
        sql: 'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
        args: [session.userId, targetUserId],
      });

      revalidatePath(`/user/[username]`, 'page');
      revalidatePath('/wall');
      revalidatePath('/profile');
      revalidatePath('/');
      return { success: true, isFollowing: false };
    } else {
      // Seguir
      await db.execute({
        sql: 'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
        args: [session.userId, targetUserId],
      });

      // Insertar notificación de follow
      await db.execute({
        sql: 'INSERT INTO notifications (user_id, actor_id, type) VALUES (?, ?, ?)',
        args: [targetUserId, session.userId, 'follow'],
      });

      revalidatePath(`/user/[username]`, 'page');
      revalidatePath('/wall');
      revalidatePath('/profile');
      revalidatePath('/');
      return { success: true, isFollowing: true };
    }
  } catch {
    return { error: 'Error al procesar seguimiento. Intenta de nuevo.' };
  }
}

/**
 * Obtiene el perfil público de un usuario por su nombre de usuario
 */
export async function getUserPublicProfile(username: string): Promise<PublicUserProfile | null> {
  const session = await getSession();
  const currentUserId = session?.userId ?? -1;

  // 1. Obtener usuario y estadísticas
  const userRes = await db.execute({
    sql: `
      WITH user_stats AS (
        SELECT
          u.id AS user_id,
          COUNT(DISTINCT p.id) AS total_posts,
          COUNT(l.id)          AS total_likes
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id
        LEFT JOIN likes l ON p.id = l.post_id
        WHERE u.username = ?
        GROUP BY u.id
      ),
      follower_stats AS (
        SELECT
          COUNT(*) AS followers_count
        FROM follows f
        JOIN users u ON f.following_id = u.id
        WHERE u.username = ?
      ),
      following_stats AS (
        SELECT
          COUNT(*) AS following_count
        FROM follows f
        JOIN users u ON f.follower_id = u.id
        WHERE u.username = ?
      ),
      follow_check AS (
        SELECT
          COUNT(*) AS is_following
        FROM follows f
        JOIN users u ON f.following_id = u.id
        WHERE u.username = ? AND f.follower_id = ?
      )
      SELECT
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        COALESCE(s.total_posts, 0) AS total_posts,
        COALESCE(s.total_likes, 0) AS total_likes,
        (SELECT followers_count FROM follower_stats) AS followers_count,
        (SELECT following_count FROM following_stats) AS following_count,
        (SELECT is_following FROM follow_check) AS is_following
      FROM users u
      LEFT JOIN user_stats s ON u.id = s.user_id
      WHERE u.username = ?
      LIMIT 1
    `,
    args: [username, username, username, username, currentUserId, username],
  });

  const userRow = userRes.rows[0];
  if (!userRow) return null;

  const targetUserId = Number(userRow.id);
  const totalPosts = Number(userRow.total_posts || 0);
  const totalLikes = Number(userRow.total_likes || 0);
  const followersCount = Number(userRow.followers_count || 0);
  const followingCount = Number(userRow.following_count || 0);
  const isFollowing = Number(userRow.is_following || 0) > 0;
  const isSelf = currentUserId === targetUserId;
  const rank = getUserRank(totalPosts, totalLikes);

  // 2. Obtener los posts del usuario con estado de likes para el usuario actual
  const postsRes = await db.execute({
    sql: `
      SELECT
        p.id,
        p.title,
        p.content,
        p.category,
        COALESCE(p.views, 0)                     AS views,
        p.created_at,
        p.user_id,
        COALESCE(u.username, 'Usuario eliminado') AS username,
        COALESCE(u.role, 'user')                 AS author_role,
        COUNT(DISTINCT l.id)                     AS like_count,
        MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS has_liked
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `,
    args: [currentUserId, targetUserId],
  });

  const posts: Post[] = postsRes.rows.map((r) => ({
    id: Number(r.id),
    title: r.title as string,
    content: r.content as string,
    category: (r.category as string) ?? null,
    created_at: r.created_at as string,
    user_id: targetUserId,
    username: r.username as string,
    author_role: (r.author_role as string) ?? 'user',
    like_count: Number(r.like_count || 0),
    views: Number(r.views || 0),
    author_posts: totalPosts,
    author_likes: totalLikes,
    author_rank: rank,
    has_liked: Number(r.has_liked) === 1,
  }));

  return {
    id: targetUserId,
    username: userRow.username as string,
    email: userRow.email as string,
    role: userRow.role as 'user' | 'admin',
    createdAt: userRow.created_at as string,
    totalPosts,
    totalLikes,
    followersCount,
    followingCount,
    rank,
    isFollowing,
    isSelf,
    posts,
  };
}

/**
 * Obtiene el listado de notificaciones para el usuario actual
 */
export async function getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  const session = await getSession();
  if (!session) return { notifications: [], unreadCount: 0 };

  const result = await db.execute({
    sql: `
      SELECT
        n.id,
        n.user_id,
        n.actor_id,
        n.type,
        n.post_id,
        n.is_read,
        n.created_at,
        COALESCE(actor.username, 'Usuario') AS actor_username,
        p.title AS post_title
      FROM notifications n
      JOIN users actor ON n.actor_id = actor.id
      LEFT JOIN posts p ON n.post_id = p.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 25
    `,
    args: [session.userId],
  });

  const notifications: NotificationItem[] = result.rows.map((row) => ({
    id: Number(row.id),
    userId: Number(row.user_id),
    actorId: Number(row.actor_id),
    actorUsername: row.actor_username as string,
    type: row.type as 'like' | 'follow',
    postId: row.post_id ? Number(row.post_id) : null,
    postTitle: row.post_title ? (row.post_title as string) : null,
    isRead: Number(row.is_read) === 1,
    createdAt: row.created_at as string,
  }));

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount };
}

/**
 * Marca todas las notificaciones del usuario como leídas
 */
export async function markNotificationsAsRead(): Promise<void> {
  const session = await getSession();
  if (!session) return;

  await db.execute({
    sql: 'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    args: [session.userId],
  });

  revalidatePath('/wall');
  revalidatePath('/');
  revalidatePath('/profile');
}

/**
 * Busca usuarios para el autocompletado en el buscador del Navbar
 */
export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const clean = query.trim().replace(/^@/, '');
  if (clean.length < 1) return [];

  const result = await db.execute({
    sql: `
      WITH user_stats AS (
        SELECT
          u.id AS user_id,
          COUNT(DISTINCT p.id) AS total_posts,
          COUNT(l.id)          AS total_likes
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id
        LEFT JOIN likes l ON p.id = l.post_id
        GROUP BY u.id
      )
      SELECT
        u.id,
        u.username,
        COALESCE(s.total_posts, 0) AS total_posts,
        COALESCE(s.total_likes, 0) AS total_likes
      FROM users u
      LEFT JOIN user_stats s ON u.id = s.user_id
      WHERE u.username LIKE ?
      ORDER BY total_posts DESC, total_likes DESC
      LIMIT 6
    `,
    args: [`%${clean}%`],
  });

  return result.rows.map((row) => {
    const totalPosts = Number(row.total_posts || 0);
    const totalLikes = Number(row.total_likes || 0);
    return {
      id: Number(row.id),
      username: row.username as string,
      rank: getUserRank(totalPosts, totalLikes),
      totalPosts,
      totalLikes,
    };
  });
}

export interface FollowUserItem {
  id: number;
  username: string;
  rank: UserRank;
  totalPosts: number;
  totalLikes: number;
  isFollowing: boolean;
  isSelf: boolean;
}

/**
 * Obtiene la lista de seguidores de un usuario (quiénes lo siguen)
 */
export async function getFollowers(targetUserId: number): Promise<FollowUserItem[]> {
  const session = await getSession();
  const currentUserId = session?.userId ?? -1;

  const result = await db.execute({
    sql: `
      WITH user_stats AS (
        SELECT
          u.id AS user_id,
          COUNT(DISTINCT p.id) AS total_posts,
          COUNT(l.id)          AS total_likes
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id
        LEFT JOIN likes l ON p.id = l.post_id
        GROUP BY u.id
      ),
      viewer_follows AS (
        SELECT following_id
        FROM follows
        WHERE follower_id = ?
      )
      SELECT
        u.id,
        u.username,
        COALESCE(s.total_posts, 0) AS total_posts,
        COALESCE(s.total_likes, 0) AS total_likes,
        CASE WHEN vf.following_id IS NOT NULL THEN 1 ELSE 0 END AS is_following
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      LEFT JOIN user_stats s ON u.id = s.user_id
      LEFT JOIN viewer_follows vf ON u.id = vf.following_id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `,
    args: [currentUserId, targetUserId],
  });

  return result.rows.map((row) => {
    const userId = Number(row.id);
    const totalPosts = Number(row.total_posts || 0);
    const totalLikes = Number(row.total_likes || 0);

    return {
      id: userId,
      username: row.username as string,
      rank: getUserRank(totalPosts, totalLikes),
      totalPosts,
      totalLikes,
      isFollowing: Number(row.is_following) === 1,
      isSelf: currentUserId === userId,
    };
  });
}

/**
 * Obtiene la lista de usuarios a los que sigue un usuario
 */
export async function getFollowing(targetUserId: number): Promise<FollowUserItem[]> {
  const session = await getSession();
  const currentUserId = session?.userId ?? -1;

  const result = await db.execute({
    sql: `
      WITH user_stats AS (
        SELECT
          u.id AS user_id,
          COUNT(DISTINCT p.id) AS total_posts,
          COUNT(l.id)          AS total_likes
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id
        LEFT JOIN likes l ON p.id = l.post_id
        GROUP BY u.id
      ),
      viewer_follows AS (
        SELECT following_id
        FROM follows
        WHERE follower_id = ?
      )
      SELECT
        u.id,
        u.username,
        COALESCE(s.total_posts, 0) AS total_posts,
        COALESCE(s.total_likes, 0) AS total_likes,
        CASE WHEN vf.following_id IS NOT NULL THEN 1 ELSE 0 END AS is_following
      FROM follows f
      JOIN users u ON f.following_id = u.id
      LEFT JOIN user_stats s ON u.id = s.user_id
      LEFT JOIN viewer_follows vf ON u.id = vf.following_id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `,
    args: [currentUserId, targetUserId],
  });

  return result.rows.map((row) => {
    const userId = Number(row.id);
    const totalPosts = Number(row.total_posts || 0);
    const totalLikes = Number(row.total_likes || 0);

    return {
      id: userId,
      username: row.username as string,
      rank: getUserRank(totalPosts, totalLikes),
      totalPosts,
      totalLikes,
      isFollowing: Number(row.is_following) === 1,
      isSelf: currentUserId === userId,
    };
  });
}

