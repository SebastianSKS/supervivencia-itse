import { getSession } from '@/lib/auth';
import { logout } from '@/actions/auth';
import { getNotifications } from '@/actions/social';
import UserSearchInput from './UserSearchInput';
import NotificationsDropdown from './NotificationsDropdown';
import { Shield, LayoutGrid, User, LogOut, Crown } from 'lucide-react';
import Link from 'next/link';

/** Navbar compartida — Server Component, lee sesión y notificaciones */
export default async function Navbar() {
  const session = await getSession();

  // Si hay sesión, cargar conteo inicial de alertas
  const { notifications, unreadCount } = session
    ? await getNotifications()
    : { notifications: [], unreadCount: 0 };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3 sm:gap-6">

        {/* Left: Logo & El Muro */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span className="font-semibold text-zinc-100 text-sm tracking-tight hidden sm:inline">
              Supervivencia ITSE
            </span>
          </Link>
          <Link
            href="/wall"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>El Muro</span>
          </Link>
        </div>

        {/* Center: Buscador de Usuarios */}
        <div className="flex-1 flex justify-center max-w-xs">
          <UserSearchInput />
        </div>

        {/* Right: Notificaciones, Admin, Perfil & Auth */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {session ? (
            <>
              {/* Campanita de Notificaciones */}
              <NotificationsDropdown
                initialNotifications={notifications}
                initialUnreadCount={unreadCount}
              />

              {/* Botón Admin */}
              {session.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-lg text-amber-400 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 transition-colors mr-0.5"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* Mi Perfil */}
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/60"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">@{session.username}</span>
              </Link>

              {/* Salir */}
              <form action={logout}>
                <button
                  type="submit"
                  title="Cerrar sesión"
                  className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 px-2 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm font-semibold text-zinc-900 bg-zinc-100 hover:bg-white px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors"
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
