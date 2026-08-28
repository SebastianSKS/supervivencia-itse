'use client';

import { useState, useEffect } from 'react';
import {
  getFollowers,
  getFollowing,
  FollowUserItem,
} from '@/actions/social';
import RankBadge from './RankBadge';
import FollowButton from './FollowButton';
import { X, Users, UserCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

export type FollowModalType = 'followers' | 'following';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: number;
  targetUsername: string;
  initialType?: FollowModalType;
  followersCount: number;
  followingCount: number;
  currentUserId?: number | null;
}

export default function FollowListModal({
  isOpen,
  onClose,
  targetUserId,
  targetUsername,
  initialType = 'followers',
  followersCount,
  followingCount,
  currentUserId = null,
}: Props) {
  const [activeTab, setActiveTab] = useState<FollowModalType>(initialType);
  const [users, setUsers] = useState<FollowUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setActiveTab(initialType);
  }, [initialType, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    async function loadData() {
      try {
        const data =
          activeTab === 'followers'
            ? await getFollowers(targetUserId)
            : await getFollowing(targetUserId);

        if (isMounted) {
          setUsers(data);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab, targetUserId]);

  // Cerrar con tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-float-up">
      {/* Contenedor Modal */}
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabecera con pestañas */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-100">
              @{targetUsername}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Pestañas (Seguidores / Siguiendo) */}
        <div className="grid grid-cols-2 border-b border-white/[0.06] bg-zinc-950/40">
          <button
            onClick={() => setActiveTab('followers')}
            className={`py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'followers'
                ? 'border-cyan-400 text-cyan-400 bg-zinc-900/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Seguidores</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400">
              {followersCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'following'
                ? 'border-cyan-400 text-cyan-400 bg-zinc-900/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Siguiendo</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400">
              {followingCount}
            </span>
          </button>
        </div>

        {/* Lista de Usuarios (Estilo TikTok / Instagram) */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-white/[0.04] min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              <span className="text-xs">Cargando comunidad...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 text-xs text-center">
              <Users className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="font-medium text-zinc-400">
                {activeTab === 'followers'
                  ? 'Aún no tiene seguidores'
                  : 'Aún no sigue a ningún estudiante'}
              </p>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                {activeTab === 'followers'
                  ? 'Sé el primero en seguir su trayectoria.'
                  : 'Pronto descubrirá nuevos consejos en El Muro.'}
              </p>
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-zinc-800/30 rounded-xl transition-colors"
              >
                {/* Info del usuario */}
                <Link
                  href={`/user/${u.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 min-w-0 flex-1 group"
                >
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 group-hover:border-cyan-400/40 flex items-center justify-center text-zinc-200 text-xs font-bold shrink-0 transition-colors select-none">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap leading-tight">
                      <span className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                        @{u.username}
                      </span>
                      <RankBadge rank={u.rank} size="sm" />
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">
                      {u.totalPosts} consejos • {u.totalLikes} likes
                    </span>
                  </div>
                </Link>

                {/* Botón de seguir interactivo in-place */}
                {!u.isSelf && (
                  <div className="shrink-0">
                    <FollowButton
                      targetUserId={u.id}
                      initialIsFollowing={u.isFollowing}
                      variant="inline"
                      currentUserId={currentUserId}
                      onFollowChange={(newIsFollowing) => {
                        setUsers((prev) =>
                          prev.map((item) =>
                            item.id === u.id
                              ? { ...item, isFollowing: newIsFollowing }
                              : item
                          )
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
