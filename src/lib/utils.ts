import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
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
