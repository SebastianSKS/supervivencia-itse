'use client';

import { useState } from 'react';
import FollowListModal, { FollowModalType } from './FollowListModal';
import { Users, UserCheck, Calendar, Heart, Award } from 'lucide-react';
import type { UserRank } from '@/lib/ranks';

interface Props {
  userId: number;
  username: string;
  followersCount: number;
  followingCount: number;
  totalPosts: number;
  totalLikes: number;
  rank: UserRank;
  currentUserId?: number | null;
  mode?: 'profile' | 'public';
}

export default function ProfileFollowStats({
  userId,
  username,
  followersCount,
  followingCount,
  totalPosts,
  totalLikes,
  rank,
  currentUserId = null,
  mode = 'profile',
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<FollowModalType>('followers');

  function openFollowers() {
    setModalType('followers');
    setIsModalOpen(true);
  }

  function openFollowing() {
    setModalType('following');
    setIsModalOpen(true);
  }

  // ── Modo 1: Tarjeta de Perfil Personal (/profile) ─────────────────────────
  if (mode === 'profile') {
    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-white/[0.06]">
          {/* Seguidores Clickeable */}
          <button
            onClick={openFollowers}
            className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white hover:underline transition-colors text-left cursor-pointer group"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>
              <strong className="text-zinc-100 font-bold">{followersCount}</strong> Seguidores
            </span>
          </button>

          {/* Seguidos Clickeable */}
          <button
            onClick={openFollowing}
            className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white hover:underline transition-colors text-left cursor-pointer group"
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>
              <strong className="text-zinc-100 font-bold">{followingCount}</strong> Seguidos
            </span>
          </button>

          {/* Posts */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>
              <strong className="text-zinc-200">{totalPosts}</strong> {totalPosts === 1 ? 'consejo' : 'consejos'}
            </span>
          </div>

          {/* Likes */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Heart className="w-3.5 h-3.5 text-red-500/70 shrink-0" />
            <span>
              <strong className="text-zinc-200">{totalLikes}</strong> {totalLikes === 1 ? 'like' : 'likes'}
            </span>
          </div>
        </div>

        {/* Modal de Seguidores / Siguiendo */}
        <FollowListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetUserId={userId}
          targetUsername={username}
          initialType={modalType}
          followersCount={followersCount}
          followingCount={followingCount}
          currentUserId={currentUserId}
        />
      </>
    );
  }

  // ── Modo 2: Tarjetas Métricas en Perfil Público (/user/[username]) ────────
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/[0.06]">
        {/* Seguidores Card Clickeable */}
        <button
          onClick={openFollowers}
          className="bg-zinc-950/60 hover:bg-zinc-900/80 border border-white/[0.04] hover:border-cyan-500/30 p-3.5 rounded-xl text-center transition-all cursor-pointer group"
        >
          <div className="text-xl font-bold font-mono text-zinc-100 group-hover:text-cyan-300 transition-colors">
            {followersCount}
          </div>
          <span className="text-xs text-zinc-400 font-medium group-hover:underline flex items-center justify-center gap-1">
            <Users className="w-3 h-3 text-cyan-400" />
            Seguidores
          </span>
        </button>

        {/* Seguidos Card Clickeable */}
        <button
          onClick={openFollowing}
          className="bg-zinc-950/60 hover:bg-zinc-900/80 border border-white/[0.04] hover:border-cyan-500/30 p-3.5 rounded-xl text-center transition-all cursor-pointer group"
        >
          <div className="text-xl font-bold font-mono text-zinc-100 group-hover:text-cyan-300 transition-colors">
            {followingCount}
          </div>
          <span className="text-xs text-zinc-400 font-medium group-hover:underline flex items-center justify-center gap-1">
            <UserCheck className="w-3 h-3 text-cyan-400" />
            Siguiendo
          </span>
        </button>

        {/* Consejos Publicados */}
        <div className="bg-zinc-950/60 border border-white/[0.04] p-3.5 rounded-xl text-center">
          <div className="text-xl font-bold font-mono text-zinc-100">
            {totalPosts}
          </div>
          <span className="text-xs text-zinc-500 font-medium">Consejos</span>
        </div>

        {/* Likes Totales */}
        <div className="bg-zinc-950/60 border border-white/[0.04] p-3.5 rounded-xl text-center">
          <div className="text-xl font-bold font-mono text-red-400">
            {totalLikes}
          </div>
          <span className="text-xs text-zinc-500 font-medium">Likes recibidos</span>
        </div>
      </div>

      {/* Modal de Seguidores / Siguiendo */}
      <FollowListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetUserId={userId}
        targetUsername={username}
        initialType={modalType}
        followersCount={followersCount}
        followingCount={followingCount}
        currentUserId={currentUserId}
      />
    </>
  );
}
