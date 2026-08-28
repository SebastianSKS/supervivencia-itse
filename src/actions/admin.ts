'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getUserRank, UserRank } from '@/lib/ranks';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  pendingReportsCount: number;
}

export interface AdminUserItem {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  totalPosts: number;
  totalLikes: number;
  rank: UserRank;
}

export interface AdminReportItem {
  reportId: number;
  postId: number;
  postTitle: string;
  postContent: string;
  authorUsername: string;
  reporterUsername: string;
  reason: string;
  createdAt: string;
}

export interface AdminPostItem {
  id: number;
  title: string;
  content: string;
  authorUsername: string;
  likeCount: number;
  views: number;
  reportCount: number;
  createdAt: string;
}

export interface AdminDashboardData {
  stats: AdminStats;
  users: AdminUserItem[];
  reports: AdminReportItem[];
  posts: AdminPostItem[];
}

/**
 * Obtiene todos los datos agregados para el Dashboard Corporativo de Administración
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  // 1. Estadísticas Globales
  const [usersCountRes, postsCountRes, likesCountRes, reportsCountRes] = await Promise.all([
    db.execute('SELECT COUNT(*) AS count FROM users'),
    db.execute('SELECT COUNT(*) AS count FROM posts'),
    db.execute('SELECT COUNT(*) AS count FROM likes'),
    db.execute('SELECT COUNT(*) AS count FROM reports'),
  ]);

  const stats: AdminStats = {
    totalUsers: Number(usersCountRes.rows[0]?.count || 0),
    totalPosts: Number(postsCountRes.rows[0]?.count || 0),
    totalLikes: Number(likesCountRes.rows[0]?.count || 0),
    pendingReportsCount: Number(reportsCountRes.rows[0]?.count || 0),
  };

  // 2. Tabla de Usuarios con Estadísticas Históricas y Rangos
  const usersRes = await db.execute(`
    WITH user_stats AS (
      SELECT
        u.id AS user_id,
        COUNT(DISTINCT p.id) AS total_posts,
        COUNT(l.id) AS total_likes
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      LEFT JOIN likes l ON p.id = l.post_id
      GROUP BY u.id
    )
    SELECT
      u.id,
      u.username,
      u.email,
      u.role,
      u.created_at,
      COALESCE(s.total_posts, 0) AS total_posts,
      COALESCE(s.total_likes, 0) AS total_likes
    FROM users u
    LEFT JOIN user_stats s ON u.id = s.user_id
    ORDER BY u.id DESC
  `);

  const users: AdminUserItem[] = usersRes.rows.map((row) => {
    const totalPosts = Number(row.total_posts || 0);
    const totalLikes = Number(row.total_likes || 0);
    return {
      id: Number(row.id),
      username: row.username as string,
      email: row.email as string,
      role: row.role as 'user' | 'admin',
      createdAt: row.created_at as string,
      totalPosts,
      totalLikes,
      rank: getUserRank(totalPosts, totalLikes),
    };
  });

  // 3. Tabla de Reportes Detallados (Fila a Fila)
  const reportsRes = await db.execute(`
    SELECT
      r.id AS report_id,
      r.post_id,
      r.reason,
      r.created_at AS report_created_at,
      p.title AS post_title,
      p.content AS post_content,
      COALESCE(author.username, 'Usuario eliminado') AS author_username,
      COALESCE(reporter.username, 'Usuario eliminado') AS reporter_username
    FROM reports r
    JOIN posts p ON r.post_id = p.id
    LEFT JOIN users author ON p.user_id = author.id
    LEFT JOIN users reporter ON r.user_id = reporter.id
    ORDER BY r.id DESC
  `);

  const reports: AdminReportItem[] = reportsRes.rows.map((row) => ({
    reportId: Number(row.report_id),
    postId: Number(row.post_id),
    postTitle: row.post_title as string,
    postContent: row.post_content as string,
    authorUsername: row.author_username as string,
    reporterUsername: row.reporter_username as string,
    reason: row.reason as string,
    createdAt: row.report_created_at as string,
  }));

  // 4. Tabla de Todos los Posts con Métricas y Conteo de Reportes
  const postsRes = await db.execute(`
    SELECT
      p.id,
      p.title,
      p.content,
      COALESCE(p.views, 0) AS views,
      p.created_at,
      COALESCE(u.username, 'Usuario eliminado') AS author_username,
      COUNT(DISTINCT l.id) AS like_count,
      COUNT(DISTINCT r.id) AS report_count
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN reports r ON p.id = r.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);

  const posts: AdminPostItem[] = postsRes.rows.map((row) => ({
    id: Number(row.id),
    title: row.title as string,
    content: row.content as string,
    authorUsername: row.author_username as string,
    likeCount: Number(row.like_count || 0),
    views: Number(row.views || 0),
    reportCount: Number(row.report_count || 0),
    createdAt: row.created_at as string,
  }));

  return { stats, users, reports, posts };
}

/**
 * Descarta un reporte individual por su ID
 */
export async function dismissSingleReport(reportId: number): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  await db.execute({
    sql: 'DELETE FROM reports WHERE id = ?',
    args: [reportId],
  });

  revalidatePath('/admin');
}

/**
 * Descarta todos los reportes asociados a un post
 */
export async function dismissReports(postId: number): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  await db.execute({
    sql: 'DELETE FROM reports WHERE post_id = ?',
    args: [postId],
  });

  revalidatePath('/admin');
  revalidatePath('/wall');
}

/**
 * Alterna el rol de un usuario entre 'user' y 'admin'
 */
export async function toggleUserRole(userId: number, currentRole: 'user' | 'admin'): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  // Evitar auto-degradarse si es el único admin
  if (session.userId === userId && currentRole === 'admin') {
    return;
  }

  const nextRole = currentRole === 'admin' ? 'user' : 'admin';

  await db.execute({
    sql: 'UPDATE users SET role = ? WHERE id = ?',
    args: [nextRole, userId],
  });

  revalidatePath('/admin');
  revalidatePath('/profile');
}

/**
 * Elimina un usuario y todo su contenido en cascada (posts, likes, reportes)
 */
export async function deleteUser(userId: number): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  if (session.userId === userId) {
    return; // No se puede autoeliminar desde el panel
  }

  // 1. Eliminar likes de posts del usuario
  await db.execute({
    sql: 'DELETE FROM likes WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?)',
    args: [userId],
  });

  // 2. Eliminar likes dados por el usuario
  await db.execute({
    sql: 'DELETE FROM likes WHERE user_id = ?',
    args: [userId],
  });

  // 3. Eliminar reportes
  await db.execute({
    sql: 'DELETE FROM reports WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?) OR user_id = ?',
    args: [userId, userId],
  });

  // 4. Eliminar posts
  await db.execute({
    sql: 'DELETE FROM posts WHERE user_id = ?',
    args: [userId],
  });

  // 5. Eliminar usuario
  await db.execute({
    sql: 'DELETE FROM users WHERE id = ?',
    args: [userId],
  });

  revalidatePath('/admin');
  revalidatePath('/wall');
  revalidatePath('/');
}

/**
 * Elimina un post con borrado en cascada explícito
 */
export async function deletePost(postId: number): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  await db.execute({
    sql: 'DELETE FROM likes WHERE post_id = ?',
    args: [postId],
  });

  await db.execute({
    sql: 'DELETE FROM reports WHERE post_id = ?',
    args: [postId],
  });

  await db.execute({
    sql: 'DELETE FROM posts WHERE id = ?',
    args: [postId],
  });

  revalidatePath('/wall');
  revalidatePath('/');
  revalidatePath('/profile');
  revalidatePath('/admin');
}
