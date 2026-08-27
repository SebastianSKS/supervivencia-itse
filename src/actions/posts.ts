'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
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
};

export type CreatePostState = { error?: string; success?: boolean } | null;

// ─── Helper: mapear fila de BD → Post ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPost(row: any): Post {
  return {
    id:         Number(row.id),
    title:      row.title      as string,
    content:    row.content    as string,
    created_at: row.created_at as string,
    user_id:    Number(row.user_id),
    username:   row.username   as string,
    like_count: Number(row.like_count),
  };
}

// ─── Todos los posts (El Muro) ────────────────────────────────────────────────
export async function getPosts(): Promise<Post[]> {
  const result = await db.execute(`
    SELECT
      p.id, p.title, p.content, p.created_at, p.user_id,
      COALESCE(u.username, 'Usuario eliminado') AS username,
      COUNT(l.id) AS like_count
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
  return result.rows.map(rowToPost);
}

// ─── Posts del usuario actual (Perfil) ────────────────────────────────────────
export async function getMyPosts(userId: number): Promise<Post[]> {
  const result = await db.execute({
    sql: `
      SELECT
        p.id, p.title, p.content, p.created_at, p.user_id,
        COALESCE(u.username, 'Usuario eliminado') AS username,
        COUNT(l.id) AS like_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `,
    args: [userId],
  });
  return result.rows.map(rowToPost);
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
  redirect('/');   // ← navega al inicio tras publicar exitosamente
}
