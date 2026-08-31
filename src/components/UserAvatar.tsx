/**
 * UserAvatar — Avatar dinámico con DiceBear (estilo "shapes")
 *
 * Genera siempre el mismo avatar para el mismo username (semilla determinista).
 * Si DiceBear no carga, muestra la inicial como fallback.
 *
 * Uso:
 *   <UserAvatar username="mariela" size={32} className="rounded-full" />
 */

interface Props {
  username: string;
  /** Tamaño en px del lado del cuadrado (el contenedor — la imagen se escala al 100%). */
  size?: number;
  /** Clases Tailwind extra que se añaden al contenedor <span>. */
  className?: string;
}

export default function UserAvatar({ username, size = 32, className = '' }: Props) {
  const seed = encodeURIComponent(username);
  const src  = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=transparent`;

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Avatar de @${username}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`@${username}`}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback: ocultar imagen rota y mostrar la inicial vía CSS
          const el = e.currentTarget as HTMLImageElement;
          el.style.display = 'none';
          const parent = el.parentElement;
          if (parent && !parent.dataset.fallback) {
            parent.dataset.fallback = '1';
            parent.textContent = username.charAt(0).toUpperCase();
            parent.style.fontSize = `${Math.round(size * 0.45)}px`;
            parent.style.fontWeight = '700';
            parent.style.color = '#a1a1aa';
          }
        }}
      />
    </span>
  );
}
