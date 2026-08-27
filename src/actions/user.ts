'use server';

import { db } from '@/lib/db';
import { getSession, setSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type UpdateState = { error?: string; success?: string } | null;

// ─── Actualizar username ──────────────────────────────────────────────────────
export async function updateUsername(
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  const session = await getSession();
  if (!session) return { error: 'No autorizado.' };

  const newUsername = (formData.get('username') as string)?.trim();

  if (!newUsername)           return { error: 'El username no puede estar vacío.' };
  if (newUsername.length < 3) return { error: 'El username debe tener al menos 3 caracteres.' };
  if (newUsername === session.username) return { error: 'Ese ya es tu username actual.' };

  try {
    await db.execute({
      sql:  'UPDATE users SET username = ? WHERE id = ?',
      args: [newUsername, session.userId],
    });
    await setSession({ ...session, username: newUsername });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('UNIQUE')) return { error: 'Ese username ya está en uso.' };
    return { error: 'Error al actualizar. Intenta de nuevo.' };
  }

  revalidatePath('/profile');
  return { success: '¡Username actualizado correctamente!' };
}

// ─── Eliminar post propio (con validación de ownership) ───────────────────────
export async function deleteMyPost(postId: number): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  // Verificar que el post existe y le pertenece al usuario
  const check = await db.execute({
    sql:  'SELECT user_id FROM posts WHERE id = ? LIMIT 1',
    args: [postId],
  });

  const row = check.rows[0];
  if (!row) return;                                      // Post no existe
  if (Number(row.user_id) !== session.userId) return;   // No es del usuario → silencio

  // Borrado en cascada explícito
  await db.execute({ sql: 'DELETE FROM likes WHERE post_id = ?', args: [postId] });
  await db.execute({ sql: 'DELETE FROM posts  WHERE id = ?',     args: [postId] });

  revalidatePath('/profile');
  revalidatePath('/');
  revalidatePath('/wall');
}
