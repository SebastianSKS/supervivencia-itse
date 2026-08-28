'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { incrementViews } from '@/actions/posts';

interface Props {
  postId: number;
  initialViews: number;
}

// Set global en memoria por sesión para evitar incrementar repetidamente el mismo post
const viewedPostsInSession = new Set<number>();

export default function ViewTracker({ postId, initialViews }: Props) {
  const [views, setViews] = useState(initialViews);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Si ya se contabilizó en esta sesión, no re-observar
    if (viewedPostsInSession.has(postId)) {
      return;
    }

    const currentEl = elementRef.current;
    if (!currentEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          viewedPostsInSession.add(postId);

          // Feedback visual optimista
          setViews((v) => v + 1);

          // Llamar al Server Action en segundo plano
          incrementViews(postId);

          observer.disconnect();
        }
      },
      {
        threshold: 0.4, // Se activa cuando al menos el 40% de la tarjeta está visible
      },
    );

    observer.observe(currentEl);

    return () => {
      observer.disconnect();
    };
  }, [postId]);

  return (
    <div
      ref={elementRef}
      title={`${views} ${views === 1 ? 'vista' : 'vistas'}`}
      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-400 transition-colors select-none"
    >
      <Eye className="w-3.5 h-3.5 text-zinc-500" />
      <span className="font-mono text-xs text-zinc-400">{views}</span>
    </div>
  );
}
