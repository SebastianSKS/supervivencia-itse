'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/** Inserta un like anónimo para un post dado */
export async function likePost(postId: number): Promise<void> {
  await db.execute({
    sql:  'INSERT INTO likes (post_id) VALUES (?)',
    args: [postId],
  });
  revalidatePath('/wall');
}
