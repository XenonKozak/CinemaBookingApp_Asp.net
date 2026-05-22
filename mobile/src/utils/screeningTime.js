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
      return { ...m, id, screenings: fromScreenings.length > 0 ? fromScreenings : embedded };
    })
    .filter((m) => m.screenings.length > 0);
}

export function formatScreeningDate(value) {
  const d = parseScreeningTime(value);
  if (!d) return '';
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
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

export function formatScreeningClock(value) {
  const d = parseScreeningTime(value);
  if (!d) return '—';
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export function toApiScreeningTime(input) {
  if (!input) return '';
  const v = String(input).trim().replace(' ', 'T');
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return `${v}:00`;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(String(input).trim())) {
    return String(input).trim().replace(' ', 'T') + ':00';
  }
  return v;
}

export function toDatetimeLocalValue(value) {
  const d = parseScreeningTime(value);
  if (!d) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
