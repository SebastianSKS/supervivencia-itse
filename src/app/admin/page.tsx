import { getSession } from '@/lib/auth';
import { getPosts } from '@/actions/posts';
import { deletePost } from '@/actions/admin';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Crown, Trash2, Heart, User, Hash } from 'lucide-react';
import { truncate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-zinc-500 text-sm">
              {posts.length} {posts.length === 1 ? 'publicación' : 'publicaciones'} en total
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl overflow-hidden">
          {posts.length === 0 ? (
            <p className="text-center text-zinc-600 text-sm py-16">No hay publicaciones</p>
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
                  {posts.map(post => (
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
                      <td className="px-5 py-4">
                        <form action={deletePost.bind(null, post.id)}>
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 text-xs text-red-500/60 hover:text-red-400 hover:bg-red-400/10 px-2.5 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap"
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

      </main>
    </div>
  );
}
