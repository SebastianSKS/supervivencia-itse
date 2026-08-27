import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET    = new TextEncoder().encode(process.env.AUTH_SECRET!);
const COOKIE    = 'itse_session';

// Rutas que requieren sesión activa
const PROTECTED  = ['/profile', '/admin', '/publicar'];
// Rutas solo para usuarios NO autenticados
const GUEST_ONLY = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE)?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET);
      isAuthenticated = true;
    } catch {
      // Token inválido o expirado
    }
  }

  // Ruta protegida sin sesión → redirige a login
  if (PROTECTED.some(p => pathname.startsWith(p)) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Ruta de guest con sesión activa → redirige al inicio
  if (GUEST_ONLY.some(p => pathname.startsWith(p)) && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*', '/publicar', '/login', '/register'],
};
