'use client';

import { useState, useTransition } from 'react';
import { Flag, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { reportPost } from '@/actions/reports';
import { useRouter } from 'next/navigation';

interface Props {
  postId: number;
  authorId: number;
  currentUserId?: number | null;
}

const REPORT_REASONS = [
  'Contenido inapropiado o vulgar',
  'Información falsa o engañosa',
  'Spam o autopromoción no deseada',
  'Acoso o falta de respeto',
  'Otro motivo',
];

export default function ReportButton({
  postId,
  authorId,
  currentUserId = null,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // No mostrar botón de reportar en los propios posts del usuario
  if (currentUserId && currentUserId === authorId) {
    return null;
  }

  function handleOpen() {
    if (!currentUserId) {
      router.push('/login');
      return;
    }
    setIsOpen(true);
    setFeedback(null);
  }

  function handleClose() {
    setIsOpen(false);
    setFeedback(null);
    setCustomReason('');
  }

  function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    const reasonToSend =
      selectedReason === 'Otro motivo'
        ? customReason.trim() || 'Otro motivo no especificado'
        : selectedReason;

    startTransition(async () => {
      const res = await reportPost(postId, reasonToSend);

      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Reporte enviado al equipo de moderación.',
        });
        setTimeout(() => {
          handleClose();
        }, 1800);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Error al enviar reporte.',
        });
      }
    });
  }

  return (
    <>
      <button
        onClick={handleOpen}
        title="Reportar este consejo"
        className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-red-400/90 transition-colors p-1 rounded-md hover:bg-red-400/10 cursor-pointer"
        aria-label="Reportar publicación"
      >
        <Flag className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Reportar</span>
      </button>

      {/* Modal de Reporte Adaptable */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-float-up">
          <div className="w-[92%] sm:max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black relative max-h-[85vh] overflow-y-auto">
            {/* Botón cerrar */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cabecera */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Reportar Consejo</h3>
                <p className="text-xs text-zinc-500">
                  Ayúdanos a mantener la comunidad segura y respetuosa
                </p>
              </div>
            </div>

            {/* Mensajes de feedback */}
            {feedback && (
              <div
                className={`mb-4 flex items-center gap-2 text-xs p-3 rounded-xl border ${
                  feedback.type === 'success'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-red-400 bg-red-500/10 border-red-500/20'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Formulario */}
            {!feedback || feedback.type === 'error' ? (
              <form onSubmit={handleSubmitReport} className="flex flex-col gap-3">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Selecciona el motivo:
                </label>

                <div className="space-y-1.5">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs border cursor-pointer transition-all ${
                        selectedReason === r
                          ? 'bg-zinc-800 border-red-500/40 text-zinc-100'
                          : 'bg-zinc-900/50 border-white/[0.04] text-zinc-400 hover:bg-zinc-800/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r}
                        checked={selectedReason === r}
                        onChange={() => setSelectedReason(r)}
                        className="accent-red-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                {selectedReason === 'Otro motivo' && (
                  <textarea
                    required
                    rows={2}
                    maxLength={200}
                    placeholder="Describe brevemente el problema..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full bg-zinc-800/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-red-500/40 transition-all resize-none mt-1"
                  />
                )}

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-red-500/90 text-white hover:bg-red-500 transition-all shadow-md shadow-red-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Flag className="w-3.5 h-3.5" />
                        <span>Enviar reporte</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
