'use server';

import { db } from '@/lib/db';
import { setSession, clearSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export type AuthState = { error: string } | null;

// ─── Register ────────────────────────────────────────────────────────────────
export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = (formData.get('username') as string)?.trim();
  const email    = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const confirm  = formData.get('confirm') as string;

  // Validaciones
  if (!username || !email || !password || !confirm)
    return { error: 'Todos los campos son obligatorios.' };
  if (username.length < 3)
    return { error: 'El username debe tener al menos 3 caracteres.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: 'El email no es válido.' };
  if (password.length < 6)
    return { error: 'La contraseña debe tener al menos 6 caracteres.' };
  if (password !== confirm)
    return { error: 'Las contraseñas no coinciden.' };

  try {
    const password_hash = await bcrypt.hash(password, 12);

    const result = await db.execute({
      sql: `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
      args: [username, email, password_hash],
    });

    const userId = Number(result.lastInsertRowid);
    await setSession({ userId, username, email, role: 'user' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('UNIQUE'))
      return { error: 'Ese email o username ya está registrado.' };
    return { error: 'Error al crear la cuenta. Intenta de nuevo.' };
  }

  redirect('/');
}

// ─── Login ───────────────────────────────────────────────────────────────────
export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email    = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password)
    return { error: 'Todos los campos son obligatorios.' };

  try {
    const result = await db.execute({
      sql: `SELECT * FROM users WHERE email = ? LIMIT 1`,
      args: [email],
    });

    const user = result.rows[0];
    if (!user) return { error: 'Credenciales incorrectas.' };

    const valid = await bcrypt.compare(password, user.password_hash as string);
    if (!valid) return { error: 'Credenciales incorrectas.' };

    await setSession({
      userId:   Number(user.id),
      username: user.username as string,
      email:    user.email as string,
      role:     user.role as 'user' | 'admin',
    });
  } catch {
    return { error: 'Error del servidor. Intenta de nuevo.' };
  }

  redirect('/');
}

// ─── Logout ──────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await clearSession();
  redirect('/login');
}
