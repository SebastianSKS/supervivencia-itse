import { getSession } from '@/lib/auth';
import { logout } from '@/actions/auth';
import { Shield, LayoutGrid, User, LogOut, Crown } from 'lucide-react';
import Link from 'next/link';

/** Navbar compartida — Server Component, lee sesión por sí sola */
export default async function Navbar() {
  const session = await getSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span className="font-semibold text-zinc-100 text-sm tracking-tight">
              Supervivencia ITSE
            </span>
          </Link>
          <Link
            href="/wall"
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            El Muro
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          {session ? (
            <>
              {session.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md text-amber-400 bg-amber-400/10 hover:bg-amber-400/15 transition-colors mr-1"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-2.5 py-1.5 rounded-md hover:bg-zinc-800/60"
              >
                <User className="w-3.5 h-3.5" />
                @{session.username}
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 px-2.5 py-1.5 rounded-md hover:bg-zinc-800/60 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-md hover:bg-zinc-800/60 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-white px-3 py-1.5 rounded-md transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
