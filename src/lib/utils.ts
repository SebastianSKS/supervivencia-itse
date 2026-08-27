/**
 * Formatea una fecha ISO/SQLite a texto relativo en español.
 * SQLite datetime('now') devuelve 'YYYY-MM-DD HH:MM:SS' en UTC.
 */
export function formatDate(dateStr: string): string {
  // Convierte el formato SQLite a ISO 8601 con zona UTC
  const date = new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z');
  const now  = new Date();

  const diffMs    = now.getTime() - date.getTime();
  const diffMins  = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays  = Math.floor(diffHours / 24);

  if (diffMins  < 1)  return 'Ahora mismo';
  if (diffMins  < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays  === 1) return 'Ayer';
  if (diffDays  < 7)  return `Hace ${diffDays} días`;

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: diffDays > 365 ? 'numeric' : undefined,
  }).format(date);
}

/** Trunca texto a un máximo de caracteres */
export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}
