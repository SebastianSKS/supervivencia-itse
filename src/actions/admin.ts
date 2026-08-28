'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface ReportedPostItem {
  postId: number;
  title: string;
  content: string;
  postCreatedAt: string;
  authorUsername: string;
  reportCount: number;
  reasons: string[];
  reporters: string[];
  lastReportedAt: string;
}

/**
 * Obtiene todos los posts que tienen reportes activos pendientes de moderación
 */
export async function getReportedPosts(): Promise<ReportedPostItem[]> {
  const session = await getSession();
  if (!session || session.role !== 'admin') return [];

  const result = await db.execute(`
    SELECT
      p.id AS post_id,
      p.title,
      p.content,
      p.created_at AS post_created_at,
      COALESCE(u.username, 'Usuario eliminado') AS author_username,
      COUNT(r.id) AS report_count,
      GROUP_CONCAT(r.reason, ' /// ') AS reasons_concat,
      GROUP_CONCAT(reporter.username, ', ') AS reporters_concat,
      MAX(r.created_at) AS last_reported_at
    FROM reports r
    JOIN posts p ON r.post_id = p.id
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN users reporter ON r.user_id = reporter.id
    GROUP BY p.id
    ORDER BY report_count DESC, last_reported_at DESC
  `);

  return result.rows.map((row) => {
    const reasonsRaw = (row.reasons_concat as string) || '';
    const reportersRaw = (row.reporters_concat as string) || '';

    return {
      postId: Number(row.post_id),
      title: row.title as string,
      content: row.content as string,
      postCreatedAt: row.post_created_at as string,
      authorUsername: row.author_username as string,
      reportCount: Number(row.report_count),
      reasons: reasonsRaw.split(' /// ').filter(Boolean),
      reporters: Array.from(new Set(reportersRaw.split(', ').filter(Boolean))),
      lastReportedAt: row.last_reported_at as string,
    };
  });
}

/**
 * Descarta todos los reportes de un post (los elimina de la tabla reports y deja el post intacto)
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
 * Elimina un post con borrado en cascada explícito:
 * 1. Borra todos los likes del post
 * 2. Borra todos los reportes del post
 * 3. Borra el post
 */
export async function deletePost(postId: number): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  // Paso 1: eliminar likes relacionados
  await db.execute({
    sql: 'DELETE FROM likes WHERE post_id = ?',
    args: [postId],
  });

  // Paso 2: eliminar reportes relacionados
  await db.execute({
    sql: 'DELETE FROM reports WHERE post_id = ?',
    args: [postId],
  });

  // Paso 3: eliminar el post
  await db.execute({
    sql: 'DELETE FROM posts WHERE id = ?',
    args: [postId],
  });

  revalidatePath('/wall');
  revalidatePath('/');
  revalidatePath('/profile');
  revalidatePath('/admin');
}
