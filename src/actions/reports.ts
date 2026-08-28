'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type ReportResult = {
  success?: boolean;
  error?: string;
};

/**
 * Registra un reporte de moderación para un post:
 * - Requiere sesión activa.
 * - Impide que el autor reporte su propio post.
 * - Respeta la restricción UNIQUE(post_id, user_id) para evitar reportes spam.
 */
export async function reportPost(
  postId: number,
  reason: string = 'Contenido inapropiado o engañoso',
): Promise<ReportResult> {
  const session = await getSession();
  if (!session) {
    return { error: 'Debes iniciar sesión para reportar una publicación.' };
  }

  const cleanReason = reason.trim() || 'Contenido inapropiado o engañoso';

  try {
    // 1. Verificar si el post existe y no es del mismo usuario
    const postCheck = await db.execute({
      sql: 'SELECT user_id FROM posts WHERE id = ? LIMIT 1',
      args: [postId],
    });

    const post = postCheck.rows[0];
    if (!post) {
      return { error: 'La publicación ya no existe.' };
    }

    if (Number(post.user_id) === session.userId) {
      return { error: 'No puedes reportar tu propio consejo.' };
    }

    // 2. Insertar el reporte
    await db.execute({
      sql: `INSERT INTO reports (post_id, user_id, reason) VALUES (?, ?, ?)`,
      args: [postId, session.userId, cleanReason],
    });

    revalidatePath('/wall');
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('UNIQUE')) {
      return { error: 'Ya has enviado un reporte para esta publicación.' };
    }
    return { error: 'Error al enviar el reporte. Intenta de nuevo.' };
  }
}
