import { getSession } from '@/lib/auth';
import { getPosts } from '@/actions/posts';
import { deletePost, getReportedPosts, dismissReports } from '@/actions/admin';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Crown,
  Trash2,
  Heart,
  User,
  Hash,
  AlertTriangle,
  Check,
  ShieldAlert,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { formatDate, truncate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  const [posts, reportedPosts] = await Promise.all([
    getPosts(),
    getReportedPosts(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12">

        {/* ── Cabecera ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
                Panel de Administración
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm">
                Control de moderación, estadísticas y gestión de contenido
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-zinc-900/60 border border-white/[0.06] px-3 py-1.5 rounded-xl text-xs text-zinc-400">
              Total posts: <strong className="text-zinc-200">{posts.length}</strong>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl text-xs text-red-400 font-medium">
              Reportes activos: <strong>{reportedPosts.length}</strong>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 1: Reportes Pendientes ───────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Reportes Pendientes ({reportedPosts.length})
              </h2>
            </div>
            {reportedPosts.length > 0 && (
              <span className="text-xs text-amber-400/90 font-medium">
                Requieren revisión
              </span>
            )}
          </div>

          {reportedPosts.length === 0 ? (
            <div className="bg-zinc-900/30 border border-white/[0.06] rounded-2xl p-8 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                <Check className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-zinc-200">
                Bandeja de moderación limpia
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                No hay publicaciones reportadas pendientes de revisión.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportedPosts.map((report) => (
                <div
                  key={report.postId}
                  className="bg-zinc-900/50 border border-red-500/20 rounded-2xl p-5 shadow-lg shadow-black/40 relative overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Detalles del post reportado */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          {report.reportCount} {report.reportCount === 1 ? 'Reporte' : 'Reportes'}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">
                          Post #{report.postId}
                        </span>
                        <span className="text-xs text-zinc-400">
                          Autor: <strong className="text-zinc-200">@{report.authorUsername}</strong>
                        </span>
                        <span className="text-xs text-zinc-600">
                          • {formatDate(report.postCreatedAt)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-100 mb-1.5">
                        {report.title}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-white/[0.04] mb-3">
                        {report.content}
                      </p>

                      {/* Motivos y Reportantes */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-zinc-500">
                        <div>
                          <strong className="text-zinc-400">Motivos:</strong>{' '}
                          <span className="text-zinc-300">
                            {report.reasons.join(', ') || 'No especificado'}
                          </span>
                        </div>
                        <div>
                          <strong className="text-zinc-400">Por:</strong>{' '}
                          <span className="text-zinc-300">
                            {report.reporters.map((u) => `@${u}`).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción para el admin */}
                    <div className="flex sm:flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-0">
                      {/* Descartar Reportes */}
                      <form action={dismissReports.bind(null, report.postId)}>
                        <button
                          type="submit"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Descartar</span>
                        </button>
                      </form>

                      {/* Eliminar Post en cascada */}
                      <form action={deletePost.bind(null, report.postId)}>
                        <button
                          type="submit"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar Post</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SECCIÓN 2: Todos los Consejos ─────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Todas las Publicaciones ({posts.length})
            </h2>
          </div>

          <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl shadow-black/40">
            {posts.length === 0 ? (
              <p className="text-center text-zinc-600 text-sm py-16">No hay publicaciones registradas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-5 py-3.5 text-zinc-600 font-medium text-xs uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><Hash className="w-3 h-3" />ID</span>
                      </th>
                      <th className="text-left px-5 py-3.5 text-zinc-600 font-medium text-xs uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><User className="w-3 h-3" />Autor</span>
                      </th>
                      <th className="text-left px-5 py-3.5 text-zinc-600 font-medium text-xs uppercase tracking-wider">
                        Título
                      </th>
                      <th className="text-left px-5 py-3.5 text-zinc-600 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">
                        Extracto
                      </th>
                      <th className="text-left px-5 py-3.5 text-zinc-600 font-medium text-xs uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><Heart className="w-3 h-3" />Likes</span>
                      </th>
                      <th className="px-5 py-3.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >
                        {/* ID */}
                        <td className="px-5 py-4 text-zinc-600 font-mono text-xs">
                          #{post.id}
                        </td>

                        {/* Autor */}
                        <td className="px-5 py-4">
                          <span className="text-zinc-300 text-sm">@{post.username}</span>
                        </td>

                        {/* Título */}
                        <td className="px-5 py-4 max-w-[180px]">
                          <span className="text-zinc-100 font-medium text-sm leading-snug">
                            {truncate(post.title, 45)}
                          </span>
                        </td>

                        {/* Extracto */}
                        <td className="px-5 py-4 max-w-[240px] hidden lg:table-cell">
                          <span className="text-zinc-500 text-xs leading-relaxed">
                            {truncate(post.content, 85)}
                          </span>
                        </td>

                        {/* Likes */}
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-zinc-400 text-sm">
                            <Heart className="w-3.5 h-3.5 text-red-500/60" />
                            {post.like_count}
                          </span>
                        </td>

                        {/* Acción eliminar */}
                        <td className="px-5 py-4 text-right">
                          <form action={deletePost.bind(null, post.id)}>
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 text-xs text-red-500/60 hover:text-red-400 hover:bg-red-400/10 px-2.5 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer"
                              aria-label={`Eliminar post #${post.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Eliminar
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
        </section>

      </main>
    </div>
  );
}
