'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUsername } from '@/actions/user';
import { User, Loader2, CheckCircle2, AlertCircle, PenLine } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
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

  return (
    <div>
      <p className="text-xs text-zinc-400 mb-4">
        Tu username actual es <span className="text-zinc-200 font-semibold">@{currentUsername}</span>
      </p>

      <form action={action} className="flex flex-col gap-3">
        {/* Feedback messages */}
        {state?.error && (
          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 animate-float-up">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{state.error}</span>
          </div>
        )}
        {state?.success && (
          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 animate-float-up">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{state.success}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Nuevo Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                name="username"
                type="text"
                required
                minLength={3}
                defaultValue={currentUsername}
                className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 hover:border-white/20"
                placeholder="nuevo_username"
              />
            </div>
          </div>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
