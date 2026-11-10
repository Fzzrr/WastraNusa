'use client';

import { cn } from '@/lib/utils';
import type {
  SellerManagementRoleFilter,
  SellerManagementSort,
} from '@/repositories/sellerManagement.repository';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type RoleFilter = SellerManagementRoleFilter | 'all';

const ROLE_FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'user', label: 'User' },
  { value: 'seller', label: 'Seller' },
  { value: 'pending', label: 'Menunggu Review' },
  { value: 'rejected', label: 'Ditolak' },
];

const SORT_OPTIONS: { value: SellerManagementSort; label: string }[] = [
  { value: 'newest', label: 'Terbaru Bergabung' },
  { value: 'oldest', label: 'Terlama Bergabung' },
  { value: 'name', label: 'Nama A–Z' },
];

export function StatusTabs({
  value,
  onChange,
  pendingCount,
}: {
  value: RoleFilter;
  onChange: (value: RoleFilter) => void;
  pendingCount: number;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter status"
      className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-card p-1 ring-1 ring-border"
    >
      {ROLE_FILTER_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[15px] whitespace-nowrap transition-colors duration-200',
              isActive
                ? 'bg-brand font-semibold text-on-field'
                : 'text-ink-soft hover:bg-surface hover:text-ink',
            )}
          >
            {option.label}
            {option.value === 'pending' && pendingCount > 0 ? (
              <span
                className={cn(
                  'text-[13px] font-semibold tabular-nums',
                  isActive ? 'text-gold' : 'text-destructive',
                )}
              >
                {pendingCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function SortMenu({
  value,
  onChange,
}: {
  value: SellerManagementSort;
  onChange: (value: SellerManagementSort) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeLabel = SORT_OPTIONS.find((o) => o.value === value)?.label;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Urutkan"
        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-card px-4 text-[15px] text-ink ring-1 ring-border transition-all hover:ring-brand"
      >
        <ArrowUpDown className="size-4 text-ink-soft" />
        {activeLabel}
        <ChevronDown
          className={cn(
            'size-4 text-ink-soft transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen ? (
        <div className="absolute right-0 z-10 mt-2 w-52 origin-top-right animate-in overflow-hidden rounded-xl bg-card p-1 ring-1 ring-border duration-150 fade-in zoom-in-95">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-[15px] transition-colors hover:bg-surface',
                option.value === value
                  ? 'bg-surface font-medium text-ink'
                  : 'text-ink',
              )}
            >
              {option.label}
              {option.value === value ? <Check className="size-4" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
