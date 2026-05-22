/** Godziny seansów traktujemy jako czas lokalny kina (bez przesunięcia UTC). */

export function parseScreeningTime(value) {
  if (!value) return null;
  const s = String(value);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatScreeningDateTime(value) {
  const d = parseScreeningTime(value);
  if (!d) return '—';
  return d.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatScreeningDate(value) {
  const d = parseScreeningTime(value);
  if (!d) return '';
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

export function formatScreeningDayShort(value) {
  const d = parseScreeningTime(value);
  if (!d) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slot = new Date(d);
  slot.setHours(0, 0, 0, 0);
  const diffDays = Math.round((slot - today) / 86400000);
  if (diffDays === 0) return 'dziś';
  if (diffDays === 1) return 'jutro';
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

export function getMovieScreenings(movie) {
  return movie?.screenings ?? movie?.Screenings ?? [];
}

/** Repertuar z osobnych żądań Movie + Screening (zawsze aktualne, bez cache with-screenings). */
export function buildRepertoire(movies, screenings) {
  const byMovieId = new Map();
  for (const s of screenings || []) {
    const movieId = s.movieId ?? s.MovieId;
    if (!movieId) continue;
    if (!byMovieId.has(movieId)) byMovieId.set(movieId, []);
    byMovieId.get(movieId).push(s);
  }

  return (movies || [])
    .map((m) => {
      const id = m.id ?? m.Id;
      const fromScreenings = byMovieId.get(id) || [];
      const embedded = getMovieScreenings(m);
      const merged = fromScreenings.length > 0 ? fromScreenings : embedded;
      return { ...m, id, screenings: merged };
    })
    .filter((m) => m.screenings.length > 0);
}

export const REPERTOIRE_REFRESH_EVENT = 'cinema-repertoire-refresh';

export function notifyRepertoireRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REPERTOIRE_REFRESH_EVENT));
  }
}

export function formatScreeningClock(value) {
  const d = parseScreeningTime(value);
  if (!d) return '—';
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

/** datetime-local → API (bez toISOString / UTC). */
export function toApiScreeningTime(datetimeLocal) {
  if (!datetimeLocal) return '';
  const v = String(datetimeLocal).trim();
  if (v.length === 16) return `${v}:00`;
  return v;
}

/** ISO z API → wartość dla input datetime-local. */
export function toDatetimeLocalValue(value) {
  const d = parseScreeningTime(value);
  if (!d) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function defaultDatetimeLocal(hoursAhead = 1) {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + hoursAhead);
  return toDatetimeLocalValue(now);
}
