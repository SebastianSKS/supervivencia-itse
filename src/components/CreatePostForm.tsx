'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createPost } from '@/actions/posts';
import type { SessionPayload } from '@/lib/auth';
import { AlertCircle, CheckCircle2, Loader2, PenSquare, LogIn } from 'lucide-react';
import Link from 'next/link';

// ─── Botón con estado pending ─────────────────────────────────────────────────
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 text-sm font-medium bg-zinc-100 text-zinc-900 hover:bg-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
    >
      {pending ? (
        <><Loader2 className="w-4 h-4 animate-spin" />Publicando...</>
      ) : (
        <><PenSquare className="w-4 h-4" />Publicar</>
      )}
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
interface Props { session: SessionPayload | null; }

export default function CreatePostForm({ session }: Props) {
  const [state, action] = useActionState(createPost, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Limpia el formulario tras publicar con éxito
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

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

  // ── Con sesión: formulario de creación ───────────────────────────────────
  return (
    <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-6">
      <p className="text-zinc-300 font-medium text-sm mb-4">
        Comparte un consejo,{' '}
        <span className="text-zinc-100">@{session.username}</span>
      </p>
      <form ref={formRef} action={action} className="flex flex-col gap-3">

        {/* Mensajes de estado */}
        {state?.error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {state.error}
          </div>
        )}
        {state?.success && (
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
          placeholder="Título del consejo..."
          className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-white/20 focus:bg-zinc-800 transition-all"
        />
        <textarea
          name="content"
          required
          rows={4}
          minLength={20}
          placeholder="Cuéntales todo lo que ojalá alguien te hubiera dicho antes del primer semestre..."
          className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-white/20 focus:bg-zinc-800 transition-all resize-none"
        />
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
