'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { register } from '@/actions/auth';
import { Shield, User, Mail, Lock, Zap, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
          <span>Creando cuenta...</span>
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 text-zinc-900" />
          <span>Crear cuenta</span>
        </>
      )}
    </button>
  );
}

export default function RegisterPage() {
  const [state, action] = useActionState(register, null);

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* ── Background Glow & Blobs ────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[540px] h-[540px] bg-gradient-to-tr from-fuchsia-500/10 via-indigo-500/10 to-cyan-500/10 rounded-full blur-3xl -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/4 w-[360px] h-[360px] bg-fuchsia-500/5 rounded-full blur-3xl -z-10"
      />

      <div className="w-full max-w-md animate-float-up z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al inicio</span>
        </Link>

        {/* ── Card Glassmorphism ──────────────────────────────────────────── */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-7 sm:p-8 shadow-2xl shadow-black/80">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-100 mb-3.5 shadow-inner">
              <Shield className="w-5 h-5 text-zinc-300" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Crear una cuenta
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Únete para compartir tu experiencia con nuevos estudiantes
            </p>
          </div>

          <form action={action} className="flex flex-col gap-4">
            {/* Error Message */}
            {state?.error && (
              <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/20 animate-float-up">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{state.error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Username
              </label>
              <div className="relative">
                <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
                  state?.error?.toLowerCase().includes('usuario') ? 'text-red-400' : 'text-zinc-500'
                }`} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  minLength={3}
                  autoComplete="username"
                  placeholder="veterano_itse"
                  className={`w-full bg-zinc-900/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all ${
                    state?.error?.toLowerCase().includes('usuario')
                      ? 'border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/40'
                      : 'border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 hover:border-white/20'
                  }`}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nombre@ejemplo.com"
                  className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 hover:border-white/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 hover:border-white/20"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm"
                className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 hover:border-white/20"
                />
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>

          {/* Divider */}
          <div className="h-px bg-white/[0.06] my-6" />

          {/* Footer */}
          <p className="text-center text-xs text-zinc-400">
            ¿Ya tienes una cuenta?{' '}
            <Link
              href="/login"
              className="text-zinc-200 hover:text-white font-medium hover:underline transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
