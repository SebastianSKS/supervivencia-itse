'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type ToggleLikeResult = {
  success?: boolean;
  liked?: boolean;
  error?: string;
};

/**
 * Alterna (Toggle) el like de un usuario en un post:
 * - Requiere sesión activa.
 * - Regla 1: No permite dar like al propio consejo del autor.
 * - Regla 2: Si ya tiene like, lo elimina; si no, lo inserta respetando la restricción UNIQUE.
 * - Genera una notificación de tipo 'like' al autor del post.
 */
export async function toggleLike(postId: number): Promise<ToggleLikeResult> {
  const session = await getSession();
  if (!session) {
    return { error: 'unauthenticated' };
  }

  try {
    // 1. Verificar el autor del post (Regla 1: No auto-like)
    const postCheck = await db.execute({
      sql: 'SELECT user_id FROM posts WHERE id = ? LIMIT 1',
      args: [postId],
    });

    const post = postCheck.rows[0];
    if (!post) {
      return { error: 'El consejo no existe.' };
    }

    const authorId = Number(post.user_id);
    if (authorId === session.userId) {
      return { error: 'No puedes darle like a tu propio consejo.' };
    }

    // 2. Verificar si ya existe el like del usuario (Regla 2: Toggle)
    const existingLike = await db.execute({
      sql: 'SELECT id FROM likes WHERE post_id = ? AND user_id = ? LIMIT 1',
      args: [postId, session.userId],
    });

    if (existingLike.rows.length > 0) {
      // Quitar like
      await db.execute({
        sql: 'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
        args: [postId, session.userId],
      });

      revalidatePath('/wall');
      revalidatePath('/');
      revalidatePath('/profile');
      return { success: true, liked: false };
    } else {
      // Agregar like
      await db.execute({
        sql: 'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
        args: [postId, session.userId],
      });

      // Crear alerta de notificación al autor
      await db.execute({
        sql: 'INSERT INTO notifications (user_id, actor_id, type, post_id) VALUES (?, ?, ?, ?)',
        args: [authorId, session.userId, 'like', postId],
      });

      revalidatePath('/wall');
      revalidatePath('/');
      revalidatePath('/profile');
      return { success: true, liked: true };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('UNIQUE')) {
      return { success: true, liked: true };
    }
    return { error: 'Error al procesar el like. Intenta de nuevo.' };
  }
}
