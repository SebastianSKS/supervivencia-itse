'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUsername } from '@/actions/user';
import { User, Loader2, CheckCircle2, AlertCircle, PenLine } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
    >
      {pending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Guardando...</span>
        </>
      ) : (
        <>
          <PenLine className="w-3.5 h-3.5" />
          <span>Actualizar</span>
        </>
      )}
    </button>
  );
}

interface Props {
  currentUsername: string;
}

export default function UpdateUsernameForm({ currentUsername }: Props) {
  const [state, action] = useActionState(updateUsername, null);
  const [inputValue, setInputValue] = useState(currentUsername);

  // Sincronizar input si currentUsername cambia
  useEffect(() => {
    setInputValue(currentUsername);
  }, [currentUsername]);

  const hasError = Boolean(state?.error);

  return (
    <div>
      <p className="text-xs text-zinc-400 mb-4">
        Tu nombre de usuario actual es <span className="text-zinc-200 font-semibold">@{currentUsername}</span>
      </p>

      <form action={action} className="flex flex-col gap-3">
        {/* Mensaje de éxito */}
        {state?.success && (
          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 animate-float-up">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{state.success}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-start">
          <div className="flex flex-col flex-1">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
              Nuevo Nombre de Usuario
            </label>
            <div className="relative">
              <User
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
                  hasError ? 'text-red-400' : 'text-zinc-500'
                }`}
              />
              <input
                name="username"
                type="text"
                required
                minLength={3}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`w-full bg-zinc-900/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all ${
                  hasError
                    ? 'border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/40'
                    : 'border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 hover:border-white/20'
                }`}
                placeholder="nuevo_username"
              />
            </div>

            {/* Mensaje de error justo debajo del input */}
            {hasError && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1.5 animate-float-up">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{state?.error}</span>
              </p>
            )}
          </div>

          <div className="sm:pt-6">
            <SubmitButton />
          </div>
        </div>
      </form>
    </div>
  );
}
