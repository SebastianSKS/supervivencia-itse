'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { Bell, Heart, UserPlus, CheckCircle2, Sparkles } from 'lucide-react';
import {
  getNotifications,
  markNotificationsAsRead,
  NotificationItem,
} from '@/actions/social';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  initialNotifications?: NotificationItem[];
  initialUnreadCount?: number;
}

export default function NotificationsDropdown({
  initialNotifications = [],
  initialUnreadCount = 0,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar notificaciones y escuchar clics
  async function handleToggle() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      // Cargar las notificaciones más recientes
      const res = await getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);

      // Si hay no leídas, marcarlas como leídas en servidor
      if (res.unreadCount > 0) {
        startTransition(async () => {
          await markNotificationsAsRead();
          setUnreadCount(0);
        });
      }
    }
  }

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleToggle}
        title="Notificaciones"
        className="relative p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
        aria-label="Abrir notificaciones"
      >
        <Bell className="w-4 h-4" />

        {/* Punto rojo indicador de alertas no leídas */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-zinc-950 animate-pulse" />
        )}
      </button>

      {/* Dropdown de Alertas */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50 animate-float-up">
          {/* Cabecera */}
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Notificaciones
            </span>
            <span className="text-[11px] text-zinc-500">
              {notifications.length} recientes
            </span>
          </div>

          {/* Lista de Alertas */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No tienes notificaciones pendientes.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    !n.isRead ? 'bg-zinc-800/30' : 'hover:bg-zinc-800/20'
                  }`}
                >
                  {/* Icono del tipo de notificación */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === 'like'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}
                  >
                    {n.type === 'like' ? (
                      <Heart className="w-3.5 h-3.5 fill-red-400/20" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Contenido de la alerta */}
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="text-zinc-300 leading-snug">
                      <Link
                        href={`/user/${n.actorUsername}`}
                        onClick={() => setIsOpen(false)}
                        className="font-bold text-zinc-100 hover:text-white hover:underline"
                      >
                        @{n.actorUsername}
                      </Link>{' '}
                      {n.type === 'like' ? (
                        <>
                          le dio like a tu consejo{' '}
                          {n.postTitle && (
                            <span className="text-zinc-400 font-medium italic">
                              &ldquo;{n.postTitle}&rdquo;
                            </span>
                          )}
                        </>
                      ) : (
                        'ha comenzado a seguirte.'
                      )}
                    </p>
                    <span className="text-[10px] text-zinc-600 mt-1 block">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
