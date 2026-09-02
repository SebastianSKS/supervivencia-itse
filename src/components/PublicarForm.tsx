'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { publishPost } from '@/actions/posts';
import { AlertCircle, Loader2, Send } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 text-sm font-semibold bg-zinc-100 text-zinc-900 hover:bg-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <><Loader2 className="w-4 h-4 animate-spin" />Publicando...</>
      ) : (
        <><Send className="w-4 h-4" />Publicar consejo</>
      )}
    </button>
  );
}

export default function PublicarForm({ username }: { username: string }) {
  const [state, action] = useActionState(publishPost, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      {/* Error */}
      {state?.error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
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
        <SubmitButton />
      </div>
    </form>
  );
}
