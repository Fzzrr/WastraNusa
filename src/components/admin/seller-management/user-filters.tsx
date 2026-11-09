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
      className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-[#fffdfa] p-1 ring-1 ring-[#e5ded5]"
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
              'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm whitespace-nowrap transition-all duration-200',
              isActive
                ? 'bg-[#3a5a4a] font-medium text-white shadow-[0_4px_12px_rgba(47,75,61,0.25)]'
                : 'text-[#6f6a62] hover:bg-[#f4efe5] hover:text-[#2f5543]',
            )}
          >
            {option.label}
            {option.value === 'pending' && pendingCount > 0 ? (
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                  isActive
                    ? 'bg-[#e8cb8d] text-[#2f4b3d]'
                    : 'bg-[#f6e7de] text-[#a15d3b]',
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
        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#fffdfa] px-4 text-sm text-[#2f3a33] ring-1 ring-[#e5ded5] transition-all hover:ring-[#3a5a4a]"
      >
        <ArrowUpDown className="size-4 text-[#b08a5e]" />
        {activeLabel}
        <ChevronDown
          className={cn(
            'size-4 text-[#9a8f80] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen ? (
        <div className="absolute right-0 z-10 mt-2 w-52 origin-top-right animate-in overflow-hidden rounded-xl bg-[#fffdfa] p-1 shadow-[0_12px_32px_rgba(89,69,38,0.14)] ring-1 ring-[#ebe3d6] duration-150 fade-in zoom-in-95">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[#f4efe5]',
                option.value === value
                  ? 'bg-[#f4efe5] font-medium text-[#2f5543]'
                  : 'text-[#4a4843]',
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
