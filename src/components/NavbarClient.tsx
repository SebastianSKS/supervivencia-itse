'use client';

import { useState } from 'react';
import type { SessionPayload } from '@/lib/auth';
import type { NotificationItem } from '@/actions/social';
import UserSearchInput from './UserSearchInput';
import NotificationsDropdown from './NotificationsDropdown';
import {
  Shield,
  LayoutGrid,
  User,
  LogOut,
  Crown,
  Menu,
  X,
  PenSquare,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/actions/auth';

interface Props {
  session: SessionPayload | null;
  notifications: NotificationItem[];
  unreadCount: number;
}

export default function NavbarClient({ session, notifications, unreadCount }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/90 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2 sm:gap-6">

        {/* ── Left: Logo ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-300">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-bold text-zinc-100 text-sm tracking-tight hidden sm:inline">
              Supervivencia ITSE
            </span>
          </Link>

          {/* Link Desktop a El Muro */}
          <Link
            href="/wall"
            className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>El Muro</span>
          </Link>
        </div>

        {/* ── Center: Buscador en Desktop ───────────────────────────────────── */}
        <div className="hidden md:flex flex-1 justify-center max-w-xs">
          <UserSearchInput />
        </div>

        {/* ── Right: Notificaciones, Auth & Menú Móvil ───────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botón Buscar Móvil */}
          <button
            onClick={() => {
              setIsMobileSearchOpen(!isMobileSearchOpen);
              if (isMobileMenuOpen) setIsMobileMenuOpen(false);
            }}
            title="Buscar estudiantes"
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Campanita de Notificaciones */}
          {session && (
            <NotificationsDropdown
              initialNotifications={notifications}
              initialUnreadCount={unreadCount}
            />
          )}

          {/* ── Acciones Desktop (md:) ──────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                {/* Botón Admin Desktop */}
                {session.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-amber-400 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 transition-colors"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Perfil Desktop */}
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-900/60 border border-white/[0.06] hover:bg-zinc-800/80 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="max-w-[110px] truncate">@{session.username}</span>
                </Link>

                {/* Salir Desktop */}
                <form action={logout}>
                  <button
                    type="submit"
                    title="Cerrar sesión"
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-100 px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* ── Botón Hamburguesa Móvil (< md:) ─────────────────────────────── */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              if (isMobileSearchOpen) setIsMobileSearchOpen(false);
            }}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-white/[0.06] transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* ── Buscador Desplegable en Móvil ───────────────────────────────────── */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 py-2.5 border-t border-white/[0.06] bg-zinc-900/95 backdrop-blur-xl animate-float-up">
          <UserSearchInput />
        </div>
      )}

      {/* ── Menú Desplegable Móvil (Drawer Glassmorphism) ───────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-zinc-900/95 backdrop-blur-2xl px-4 py-5 shadow-2xl animate-float-up space-y-4">
          {/* Navegación Principal */}
          <div className="space-y-1">
            <Link
              href="/wall"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl text-sm font-medium text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4 text-cyan-400" />
                <span>Explorar El Muro</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                Feed
              </span>
            </Link>

            {session && (
              <Link
                href="/publicar"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-zinc-900 bg-zinc-100 hover:bg-white transition-colors"
              >
                <PenSquare className="w-4 h-4 text-zinc-900" />
                <span>+ Publicar Consejo</span>
              </Link>
            )}
          </div>

          {/* Sección de Usuario / Autenticación */}
          <div className="pt-3 border-t border-white/[0.06]">
            {session ? (
              <div className="space-y-2">
                {/* Perfil */}
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] text-sm text-zinc-200"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-xs text-zinc-300">
                      {session.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-zinc-100">@{session.username}</p>
                      <p className="text-[10px] text-zinc-500">Mi Perfil y Estadísticas</p>
                    </div>
                  </div>
                  <User className="w-4 h-4 text-zinc-500" />
                </Link>

                {/* Admin */}
                {session.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Panel de Administración</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-amber-400/20 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  </Link>
                )}

                {/* Cerrar Sesión */}
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 text-xs font-semibold rounded-xl text-zinc-300 bg-zinc-800/80 border border-white/10"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 text-xs font-semibold rounded-xl text-zinc-900 bg-zinc-100"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
