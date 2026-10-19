const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
});
const weekdayFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'short',
});
const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});
const longDateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const DAY_MS = 1000 * 60 * 60 * 24;

function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (
    parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
  ).toUpperCase();
}

/** Clock time of a message, e.g. "21.25". */
export function formatTime(iso: string): string {
  const date = toDate(iso);
  return date ? timeFormatter.format(date) : '';
}

/** Chat-list timestamp: time today, "Kemarin", weekday this week, else date. */
export function formatShortTime(iso: string | null): string {
  const date = toDate(iso);
  if (!date) return '';

  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / DAY_MS,
  );
  if (diffDays === 0) return timeFormatter.format(date);
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return weekdayFormatter.format(date);
  return shortDateFormatter.format(date);
}

/** Local calendar day of a message, used to group a thread by date. */
export function getDayKey(iso: string): string {
  const date = toDate(iso);
  return date ? String(startOfDay(date)) : '';
}

/** Date separator label inside a thread: "Hari ini", "Kemarin", or full date. */
export function formatDayLabel(iso: string): string {
  const date = toDate(iso);
  if (!date) return '';

  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / DAY_MS,
  );
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  return longDateFormatter.format(date);
}
