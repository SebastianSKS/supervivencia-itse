'use client';

import { useState } from 'react';
import type { AdminDashboardData } from '@/actions/admin';
import type { SessionPayload } from '@/lib/auth';
import {
  deletePost,
  dismissSingleReport,
  toggleUserRole,
  deleteUser,
  updateUserStatsAdmin,
} from '@/actions/admin';
import { logout } from '@/actions/auth';
import RankBadge from '@/components/RankBadge';
import { formatDate, truncate } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  FileText,
  Heart,
  Shield,
  ArrowLeft,
  LogOut,
  Crown,
  Trash2,
  Check,
  UserCheck,
  UserX,
  ExternalLink,
  Search,
  MessageSquare,
  AlertTriangle,
  Eye,
  Pencil,
  X,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  data: AdminDashboardData;
  session: SessionPayload;
}

type TabType = 'overview' | 'users' | 'reports' | 'posts';

export default function AdminDashboardClient({ data, session }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Buscadores (client-side)
  const [userSearch, setUserSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');

  // Edit User Stats Modal
  const [editingUser, setEditingUser] = useState<typeof data.users[0] | null>(null);
  const [editLikes, setEditLikes] = useState<number>(0);
  const [editPosts, setEditPosts] = useState<number>(0);
  const [isSavingStats, setIsSavingStats] = useState(false);

  const handleEditUser = (user: typeof data.users[0]) => {
    setEditingUser(user);
    setEditLikes(user.totalLikes);
    setEditPosts(user.totalPosts);
  };

  const handleSaveUserStats = async () => {
    if (!editingUser) return;
    setIsSavingStats(true);
    await updateUserStatsAdmin(editingUser.id, editLikes, editPosts);
    setIsSavingStats(false);
    setEditingUser(null);
  };

  const { stats, users, reports, posts } = data;

  // Filtrado de tablas
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.authorUsername.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.content.toLowerCase().includes(postSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col md:flex-row antialiased">
      {/* ── SIDEBAR RESPONSIVE ────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800/80 flex flex-col shrink-0 md:sticky md:top-0 md:h-screen">
        {/* Logo & Marca */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-zinc-100 tracking-tight block">
                ITSE Admin
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Control Central v2.0
              </span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
            PROD
          </span>
        </div>

        {/* Navegación Responsive (grid en mobile, columna en desktop) */}
        <nav className="p-2 sm:p-3 grid grid-cols-2 md:grid-cols-1 gap-1.5 md:space-y-1 flex-1 overflow-y-auto">
          <div className="hidden md:block px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Gestión de Datos
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-zinc-800/90 text-zinc-100 shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">Vista General</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'bg-zinc-800/90 text-zinc-100 shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">Usuarios</span>
            </div>
            <span className="text-[10px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400 ml-1">
              {stats.totalUsers}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-zinc-800/90 text-zinc-100 shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">Reportes</span>
            </div>
            {stats.pendingReportsCount > 0 ? (
              <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 ml-1">
                {stats.pendingReportsCount}
              </span>
            ) : (
              <span className="text-[10px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-500 ml-1">
                0
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-zinc-800/90 text-zinc-100 shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">Posts</span>
            </div>
            <span className="text-[10px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400 ml-1">
              {stats.totalPosts}
            </span>
          </button>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-zinc-800/80 space-y-2 bg-zinc-950/60 hidden md:block">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la App</span>
          </Link>

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                {session.username.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-zinc-200 truncate">
                  @{session.username}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">Administrador</p>
              </div>
            </div>

            <form action={logout}>
              <button
                type="submit"
                title="Cerrar sesión"
                className="text-zinc-500 hover:text-red-400 p-1.5 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL DEL DASHBOARD ─────────────────────────────── */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Top Header */}
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
              {activeTab === 'overview' && 'Vista General del Sistema'}
              {activeTab === 'users' && 'Directorio y Control de Usuarios'}
              {activeTab === 'reports' && 'Bandeja de Reportes de Moderación'}
              {activeTab === 'posts' && 'Catálogo Completo de Publicaciones'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Base de Datos: <span className="text-zinc-300 font-mono">Turso AWS (libSQL)</span> • Estado: <span className="text-emerald-400">Activo</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/wall"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver El Muro en Vivo</span>
            </Link>
          </div>
        </header>

        {/* ── TOP METRICS CARDS (KPIs Responsive 2x2 en mobile) ────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {/* Card 1: Usuarios */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">
                Usuarios
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono">
              {stats.totalUsers}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">
              Alumnos registrados
            </p>
          </div>

          {/* Card 2: Posts */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">
                Posts
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono">
              {stats.totalPosts}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">
              Consejos en el muro
            </p>
          </div>

          {/* Card 3: Likes */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">
                Likes
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono">
              {stats.totalLikes}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">
              Reacciones acumuladas
            </p>
          </div>

          {/* Card 4: Reportes */}
          <div
            className={`border rounded-xl p-3.5 sm:p-4 shadow-sm transition-colors ${
              stats.pendingReportsCount > 0
                ? 'bg-red-950/20 border-red-500/30'
                : 'bg-zinc-900/60 border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wider truncate">
                Reportes
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  stats.pendingReportsCount > 0
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div
              className={`text-xl sm:text-2xl font-black font-mono ${
                stats.pendingReportsCount > 0 ? 'text-red-400' : 'text-zinc-100'
              }`}
            >
              {stats.pendingReportsCount}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">
              {stats.pendingReportsCount > 0
                ? 'Requiere revisión'
                : 'Sin reportes'}
            </p>
          </div>
        </div>

        {/* ── TAB 1: VISTA GENERAL ──────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Tabla Rápida de Reportes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200">
                    Reportes que Requieren Atención ({reports.length})
                  </h2>
                </div>
                {reports.length > 5 && (
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                  >
                    Ver todos los reportes →
                  </button>
                )}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                {reports.length === 0 ? (
                  <div className="py-10 text-center text-zinc-500 text-xs">
                    No hay reportes pendientes de moderación.
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs min-w-[640px]">
                      <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3">ID Rep</th>
                          <th className="px-4 py-3">Reportado por</th>
                          <th className="px-4 py-3">Motivo</th>
                          <th className="px-4 py-3">Post Afectado</th>
                          <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-sans">
                        {reports.slice(0, 5).map((r) => (
                          <tr
                            key={r.reportId}
                            className="hover:bg-zinc-800/40 transition-colors"
                          >
                            <td className="px-4 py-3 font-mono text-zinc-500">
                              #{r.reportId}
                            </td>
                            <td className="px-4 py-3 text-zinc-300">
                              @{r.reporterUsername}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-block px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 font-medium text-[11px]">
                                {r.reason}
                              </span>
                            </td>
                            <td className="px-4 py-3 max-w-[260px]">
                              <p className="font-semibold text-zinc-100 truncate">
                                {r.postTitle}
                              </p>
                              <p className="text-zinc-400 text-[11px] truncate">
                                {truncate(r.postContent, 60)}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                              <form
                                action={dismissSingleReport.bind(null, r.reportId)}
                                className="inline-block"
                              >
                                <button
                                  type="submit"
                                  title="Descartar este reporte"
                                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-medium transition-colors cursor-pointer"
                                >
                                  <Check className="w-3 h-3 inline mr-1 text-emerald-400" />
                                  Descartar
                                </button>
                              </form>

                              <form
                                action={deletePost.bind(null, r.postId)}
                                className="inline-block"
                              >
                                <button
                                  type="submit"
                                  title="Eliminar post en cascada"
                                  className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-medium transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3 inline mr-1" />
                                  Eliminar Post
                                </button>
                              </form>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen de Últimos Usuarios */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200">
                    Usuarios Recientes ({users.length})
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                >
                  Ver directorio completo →
                </button>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[580px]">
                    <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Usuario</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Rango</th>
                        <th className="px-4 py-3">Rol</th>
                        <th className="px-4 py-3">Aportes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-sans">
                      {users.slice(0, 6).map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-zinc-500">
                            #{u.id}
                          </td>
                          <td className="px-4 py-3 font-medium text-zinc-200">
                            @{u.username}
                          </td>
                          <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                          <td className="px-4 py-3">
                            <RankBadge rank={u.rank} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-400">
                            {u.totalPosts} posts • {u.totalLikes} likes
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: GESTIÓN DE USUARIOS ───────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Barra de búsqueda */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar por username o email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-700 transition-colors"
                />
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {filteredUsers.length} de {users.length} usuarios
              </span>
            </div>

            {/* Tabla Alta Densidad de Usuarios */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-zinc-950/90 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Usuario</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Rango</th>
                      <th className="px-4 py-3">Rol</th>
                      <th className="px-4 py-3">Estadísticas</th>
                      <th className="px-4 py-3">Registro</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {filteredUsers.map((u) => {
                      const isSelf = session.userId === u.id;
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-zinc-500">
                            #{u.id}
                          </td>
                          <td className="px-4 py-3 font-bold text-zinc-200">
                            @{u.username}
                            {isSelf && (
                              <span className="ml-1.5 text-[10px] text-zinc-500 font-normal">
                                (Tú)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-400 font-mono text-[11px]">
                            {u.email}
                          </td>
                          <td className="px-4 py-3">
                            <RankBadge rank={u.rank} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-400 font-mono text-[11px]">
                            {u.totalPosts} posts • {u.totalLikes} likes
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-[11px]">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleEditUser(u)}
                              title="Editar estadísticas"
                              className="inline-flex items-center justify-center p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4 text-zinc-400 hover:text-white" />
                            </button>
                            {!isSelf && (
                              <>
                                <form
                                  action={toggleUserRole.bind(null, u.id, u.role)}
                                  className="inline-block"
                                >
                                  <button
                                    type="submit"
                                    title={
                                      u.role === 'admin'
                                        ? 'Degradar a usuario normal'
                                        : 'Promover a Administrador'
                                    }
                                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-medium transition-colors cursor-pointer"
                                  >
                                    {u.role === 'admin' ? (
                                      <>
                                        <UserX className="w-3 h-3 inline mr-1 text-amber-400" />
                                        Quitar Admin
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="w-3 h-3 inline mr-1 text-emerald-400" />
                                        Hacer Admin
                                      </>
                                    )}
                                  </button>
                                </form>

                                <form
                                  action={deleteUser.bind(null, u.id)}
                                  className="inline-block"
                                >
                                  <button
                                    type="submit"
                                    title="Banear y eliminar usuario"
                                    className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-medium transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3 inline mr-1" />
                                    Banear
                                  </button>
                                </form>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: REPORTES PENDIENTES ────────────────────────────────────── */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-zinc-400">
                Lista de todos los reportes activos generados por la comunidad
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {reports.length} reportes pendientes
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              {reports.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-xs">
                  No hay reportes pendientes de moderación en este momento.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-zinc-950/90 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">ID Rep</th>
                        <th className="px-4 py-3">Reportado por</th>
                        <th className="px-4 py-3">Motivo</th>
                        <th className="px-4 py-3">Post Afectado (Autor)</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-sans">
                      {reports.map((r) => (
                        <tr
                          key={r.reportId}
                          className="hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-zinc-500">
                            #{r.reportId}
                          </td>
                          <td className="px-4 py-3 font-medium text-zinc-200">
                            @{r.reporterUsername}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 font-semibold text-[11px]">
                              {r.reason}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-[320px]">
                            <p className="font-bold text-zinc-100 truncate">
                              {r.postTitle}
                            </p>
                            <p className="text-zinc-400 text-[11px] truncate">
                              {r.postContent}
                            </p>
                            <span className="text-[10px] text-zinc-500 mt-0.5 block">
                              Autor: @{r.authorUsername} (Post #{r.postId})
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-[11px] whitespace-nowrap">
                            {formatDate(r.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                            <form
                              action={dismissSingleReport.bind(null, r.reportId)}
                              className="inline-block"
                            >
                              <button
                                type="submit"
                                className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                                Descartar
                              </button>
                            </form>

                            <form
                              action={deletePost.bind(null, r.postId)}
                              className="inline-block"
                            >
                              <button
                                type="submit"
                                className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                                Eliminar Post
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: TODOS LOS POSTS ────────────────────────────────────────── */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar por título, contenido o autor..."
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-700 transition-colors"
                />
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {filteredPosts.length} de {posts.length} publicaciones
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-zinc-950/90 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Autor</th>
                      <th className="px-4 py-3">Título</th>
                      <th className="px-4 py-3">Extracto</th>
                      <th className="px-4 py-3">Métricas</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {filteredPosts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-zinc-500">
                          #{p.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-200">
                          @{p.authorUsername}
                        </td>
                        <td className="px-4 py-3 font-bold text-zinc-100 max-w-[200px] truncate">
                          {p.title}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 max-w-[280px] truncate">
                          {p.content}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-zinc-300 mr-2.5">
                            <Heart className="w-3 h-3 text-red-400" />
                            {p.likeCount}
                          </span>
                          <span className="inline-flex items-center gap-1 text-zinc-400 mr-2.5 font-mono text-[11px]">
                            <Eye className="w-3 h-3 text-zinc-500" />
                            {p.views}
                          </span>
                          {p.reportCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 text-[10px]">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {p.reportCount} rep
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-[11px] whitespace-nowrap">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <form action={deletePost.bind(null, p.id)}>
                            <button
                              type="submit"
                              className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3 inline mr-1" />
                              Eliminar
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE EDICIÓN DE ESTADÍSTICAS */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-zinc-100 mb-1">
              Editar Estadísticas
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Sobrescribe manualmente las métricas para @{editingUser.username}.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Total Likes
                </label>
                <input
                  type="number"
                  min="0"
                  value={editLikes}
                  onChange={(e) => setEditLikes(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-700 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Total Posts
                </label>
                <input
                  type="number"
                  min="0"
                  value={editPosts}
                  onChange={(e) => setEditPosts(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-700 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUserStats}
                disabled={isSavingStats}
                className="flex items-center gap-2 bg-zinc-100 text-zinc-900 hover:bg-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isSavingStats ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
