import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PublicarForm from '@/components/PublicarForm';
import { PenSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PublicarPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-14">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al muro
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/[0.06] flex items-center justify-center shrink-0">
            <PenSquare className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              Nuevo consejo
            </h1>
            <p className="text-zinc-500 text-sm">
              Publicando como{' '}
              <span className="text-zinc-300 font-medium">@{session.username}</span>
            </p>
          </div>
        </div>

        {/* Card con el formulario */}
        <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-8">
          <PublicarForm username={session.username} />
        </div>

        {/* Tip */}
        <p className="text-center text-xs text-zinc-700 mt-6">
          Tu consejo aparecerá en El Muro inmediatamente después de publicar.
        </p>

      </main>
    </div>
  );
}
