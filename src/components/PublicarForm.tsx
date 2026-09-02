'use client';

import { useState, useTransition } from 'react';
import { publishPost } from '@/actions/posts';
import { AlertCircle, Loader2, Send } from 'lucide-react';

export default function PublicarForm({ username }: { username: string }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);

    startTransition(async () => {
      const res = await publishPost(null, formData);
      if (res?.error) {
        setError(res.error);
      }
      // If success, publishPost redirects, so we don't need to clear state manually here.
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Título */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Título
        </label>
        <input
          name="title"
          type="text"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Lo más importante del primer parcial..."
          className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-white/20 focus:bg-zinc-800 transition-all"
        />
        <span className="text-xs text-zinc-700">Mínimo 5 caracteres, máximo 120</span>
      </div>

      {/* Contenido */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Tu consejo
        </label>
        <textarea
          name="content"
          required
          rows={7}
          minLength={20}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Hola @${username}, cuéntales todo lo que ojalá alguien te hubiera dicho antes del primer semestre...`}
          className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-white/20 focus:bg-zinc-800 transition-all resize-none"
        />
        <span className="text-xs text-zinc-700">Mínimo 20 caracteres</span>
      </div>

      {/* Categoría (Opcional) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          ¿Deseas añadir una categoría? (Opcional)
        </label>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 outline-none focus:border-white/20 focus:bg-zinc-800 transition-all appearance-none cursor-pointer"
        >
          <option value="">Sin categoría</option>
          <option value="Trámites">Trámites</option>
          <option value="Profesores">Profesores</option>
          <option value="Cafetería">Cafetería</option>
          <option value="Residencias">Residencias</option>
          <option value="Exámenes">Exámenes</option>
        </select>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <a
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 text-sm font-semibold bg-zinc-100 text-zinc-900 hover:bg-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Publicando...</>
          ) : (
            <><Send className="w-4 h-4" />Publicar consejo</>
          )}
        </button>
      </div>
    </form>
  );
}
