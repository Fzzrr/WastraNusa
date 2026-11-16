import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Built once: constructing Intl.NumberFormat on every call is slow in lists.
const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

export function formatIDR(value: number): string {
  return idrFormatter.format(value);
}

/** Union of string lists: trimmed, de-duplicated, sorted (Indonesian collation). */
export function mergeUniqueSorted(...lists: string[][]): string[] {
  return [
    ...new Set(
      lists
        .flat()
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, 'id'));
}

/**
 * The value as the client would receive it from an API route (Dates and
 * Decimals become strings). Use before handing server data to React Query.
 */
export function toJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
