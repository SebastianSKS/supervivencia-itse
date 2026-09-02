'use client';

import { useState, useTransition } from 'react';
import { createPost } from '@/actions/posts';
import type { SessionPayload } from '@/lib/auth';
import { AlertCircle, CheckCircle2, Loader2, PenSquare, LogIn } from 'lucide-react';
import Link from 'next/link';

interface Props { session: SessionPayload | null; }

export default function CreatePostForm({ session }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // ── Sin sesión: prompt de login ──────────────────────────────────────────
  if (!session) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/30 border border-white/[0.06] rounded-2xl px-6 py-5 backdrop-blur-sm">
        <div>
          <p className="text-zinc-200 font-medium text-sm">Deja tu legado</p>
          <p className="text-zinc-500 text-sm mt-0.5">
            Inicia sesión para compartir tu consejo con los de primer semestre
          </p>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 shrink-0 text-sm font-medium bg-zinc-100 text-zinc-900 hover:bg-white px-4 py-2 rounded-lg transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);

    startTransition(async () => {
      const res = await createPost(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(true);
        setTitle('');
        setContent('');
        setCategory('');
      }
    });
  };

  // ── Con sesión: formulario de creación ───────────────────────────────────
  return (
    <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-6">
      <p className="text-zinc-300 font-medium text-sm mb-4">
        Comparte un consejo,{' '}
        <span className="text-zinc-100">@{session.username}</span>
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        {/* Mensajes de estado */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            ¡Consejo publicado! Ya aparece en El Muro.
          </div>
        )}

        {/* Inputs */}
        <input
          name="title"
          type="text"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del consejo..."
          className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-white/20 focus:bg-zinc-800 transition-all"
        />
        <textarea
          name="content"
          required
          rows={4}
          minLength={20}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Cuéntales todo lo que ojalá alguien te hubiera dicho antes del primer semestre..."
          className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-white/20 focus:bg-zinc-800 transition-all resize-none"
        />

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between pt-1">
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-auto flex-1 bg-zinc-800/50 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-zinc-400 outline-none focus:border-white/20 focus:text-zinc-200 transition-all appearance-none cursor-pointer"
          >
            <option value="">Categoría (Opcional)</option>
            <option value="Trámites">Trámites</option>
            <option value="Profesores">Profesores</option>
            <option value="Cafetería">Cafetería</option>
            <option value="Residencias">Residencias</option>
            <option value="Exámenes">Exámenes</option>
          </select>

          <div className="w-full sm:w-auto flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 text-sm font-medium bg-zinc-100 text-zinc-900 hover:bg-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Publicando...</>
              ) : (
                <><PenSquare className="w-4 h-4" />Publicar</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
