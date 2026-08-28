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
  if (!session) return { error: 'No autorizado. Inicia sesión.' };

  const newUsername = (formData.get('username') as string)?.trim();

  if (!newUsername) return { error: 'El nombre de usuario no puede estar vacío.' };
  if (newUsername.length < 3) return { error: 'El nombre de usuario debe tener al menos 3 caracteres.' };
  if (!/^[a-zA-Z0-9_.-]+$/.test(newUsername)) {
    return { error: 'Solo se permiten letras, números, guiones y puntos.' };
  }
  if (newUsername === session.username) return { error: 'Ese ya es tu nombre de usuario actual.' };

  try {
    // Intentar actualizar directamente en SQLite (Turso)
    await db.execute({
      sql: 'UPDATE users SET username = ? WHERE id = ?',
      args: [newUsername, session.userId],
    });

    // Actualizar cookie de sesión con el nuevo username
    await setSession({ ...session, username: newUsername });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    // Captura de violación de restricción UNIQUE (índice o columna)
    if (msg.includes('UNIQUE') || msg.includes('idx_users_username') || msg.includes('constraint')) {
      return { error: 'Este nombre de usuario ya está en uso. Elige otro.' };
    }
    return { error: 'Error al actualizar el nombre de usuario. Intenta de nuevo.' };
  }

  revalidatePath('/profile');
  revalidatePath('/wall');
  revalidatePath('/');
  return { success: '¡Nombre de usuario actualizado correctamente!' };
}

// ─── Eliminar post propio (con validación de ownership) ───────────────────────
export async function deleteMyPost(postId: number): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  // Verificar que el post existe y le pertenece al usuario
  const check = await db.execute({
    sql: 'SELECT user_id FROM posts WHERE id = ? LIMIT 1',
    args: [postId],
  });

  const row = check.rows[0];
  if (!row) return;                                      // Post no existe
  if (Number(row.user_id) !== session.userId) return;   // No es del usuario → silencio

  // Borrado en cascada explícito
  await db.execute({ sql: 'DELETE FROM likes   WHERE post_id = ?', args: [postId] });
  await db.execute({ sql: 'DELETE FROM reports WHERE post_id = ?', args: [postId] });
  await db.execute({ sql: 'DELETE FROM posts   WHERE id = ?',     args: [postId] });

  revalidatePath('/profile');
  revalidatePath('/');
  revalidatePath('/wall');
}
