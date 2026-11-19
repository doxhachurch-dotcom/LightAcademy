const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MOIS_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export function parseDate(v?: string | null): Date | null {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  // « 2026-11-15 » ou « 2026-11-15 12:00:00.000Z » ou ISO
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], 12);
  const d = new Date(s.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}

export function ymd(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Date au format stocké par le CRM web pour les dates « jour » (midi UTC). */
export function dayStamp(d: Date): string {
  return `${ymd(d)}T12:00:00.000Z`;
}

export function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);
}

export function fmtShort(v?: string | Date | null): string {
  const d = v instanceof Date ? v : parseDate(v);
  if (!d) return '—';
  return `${d.getDate()} ${MOIS[d.getMonth()]}`;
}

export function fmtLong(v?: string | Date | null): string {
  const d = v instanceof Date ? v : parseDate(v);
  if (!d) return '—';
  return `${d.getDate()} ${MOIS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDayName(v?: string | Date | null): string {
  const d = v instanceof Date ? v : parseDate(v);
  if (!d) return '';
  const j = JOURS[d.getDay()];
  return `${j.charAt(0).toUpperCase()}${j.slice(1)} ${d.getDate()} ${MOIS_LONG[d.getMonth()]}`;
}

export function monthLabel(d: Date): string {
  const m = MOIS_LONG[d.getMonth()];
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${d.getFullYear()}`;
}

export function relDay(v?: string | null): { label: string; late: boolean; today: boolean } {
  const d = parseDate(v);
  if (!d) return { label: 'Sans date', late: false, today: false };
  const n = daysBetween(new Date(), d);
  if (n === 0) return { label: "Aujourd'hui", late: false, today: true };
  if (n === 1) return { label: 'Demain', late: false, today: false };
  if (n === -1) return { label: 'Hier', late: true, today: false };
  if (n < 0) return { label: `En retard de ${-n} j`, late: true, today: false };
  if (n < 7) return { label: `Dans ${n} jours`, late: false, today: false };
  return { label: fmtShort(d), late: false, today: false };
}

export function age(v?: string | null): number | null {
  const d = parseDate(v);
  if (!d) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) a--;
  return a >= 0 && a < 130 ? a : null;
}

export function initials(name?: string | null): string {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return ((parts[0][0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

const AV = ['#3B6CFF', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#EF4444', '#6366F1'];
export function avatarColor(seed?: string | null): string {
  let h = 0;
  for (const c of String(seed || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AV[h % AV.length];
}

export function firstName(name?: string | null): string {
  return String(name || '').trim().split(/\s+/)[0] || '';
}

export function normalize(s?: string | null): string {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function phoneHref(p?: string | null): string {
  return String(p || '').replace(/[^\d+]/g, '');
}

export function plural(n: number, one: string, many?: string): string {
  return `${n} ${n > 1 ? many || one + 's' : one}`;
}

export function hm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Combine une date (jour) et une heure « HH:MM » en Date locale. */
export function atTime(day: Date, time: string): Date {
  const [h, m] = (time || '00:00').split(':').map((x) => parseInt(x, 10) || 0);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}
