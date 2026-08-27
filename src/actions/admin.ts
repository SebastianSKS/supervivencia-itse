'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Elimina un post con borrado en cascada explícito:
 * 1. Borra todos los likes del post (FK constraint)
 * 2. Borra el post
 *
 * Uso en form: <form action={deletePost.bind(null, post.id)}>
 */
export async function deletePost(postId: number): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  // Paso 1: eliminar likes relacionados
  await db.execute({
    sql:  'DELETE FROM likes WHERE post_id = ?',
    args: [postId],
  });

  // Paso 2: eliminar el post
  await db.execute({
    sql:  'DELETE FROM posts WHERE id = ?',
    args: [postId],
  });

  revalidatePath('/wall');
  revalidatePath('/admin');
}
