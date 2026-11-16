'use client';

import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Check,
  History,
  ImageIcon,
  type LucideIcon,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

/**
 * Building blocks shared by the admin/seller modal forms (artikel, produk):
 * consistent field labels, numbered section cards, and live image previews.
 */

export const inputClassName =
  'h-12 rounded-xl border-border bg-card px-4 text-base text-ink placeholder:text-ink-soft transition-shadow focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15';
export const textareaClassName =
  'w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-base text-ink placeholder:text-ink-soft transition-shadow focus:outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15';
export const selectTriggerClassName =
  'h-12 w-full cursor-pointer gap-2.5 rounded-xl border-border bg-card px-4 text-base text-ink transition-colors hover:border-brand/40 focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface data-[size=default]:h-11 data-[state=open]:border-brand data-[state=open]:ring-3 data-[state=open]:ring-brand/15 data-placeholder:text-ink-soft [&>svg:last-child]:text-ink-soft [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 data-[state=open]:[&>svg:last-child]:rotate-180';

/** Dropdown panel opened directly below its trigger, matching its width. */
export const selectContentClassName =
  'max-h-72 rounded-xl border-0 bg-card p-1';

export const selectItemClassName =
  'cursor-pointer rounded-lg py-2 pr-8 pl-3 text-[15px] text-ink transition-colors focus:bg-surface focus:text-ink data-[state=checked]:bg-surface data-[state=checked]:font-semibold data-[state=checked]:text-ink [&_svg]:text-ink';

/**
 * Single-choice pill buttons (radio group). Friendlier than a dropdown for
 * short option lists such as gender.
 */
export function ChoicePills<T extends string | null>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl px-4 text-[15px] transition-all',
              isActive
                ? 'bg-brand font-medium text-on-field'
                : 'bg-card text-ink-soft hover:text-ink',
            )}
          >
            {isActive ? <Check className="size-3.5" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Gender choices shared by article and product forms (null = unspecified). */
export const GENDER_CHOICES: {
  value: 'male' | 'female' | 'unisex' | null;
  label: string;
}[] = [
  { value: null, label: 'Tidak Ditentukan' },
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
  { value: 'unisex', label: 'Unisex' },
];

export function Field({
  label,
  required = false,
  hint,
  error,
  aside,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-[15px] font-medium text-ink">
          {label}
          {required ? (
            <span className="ml-0.5 text-destructive">*</span>
          ) : (
            <span className="ml-1.5 text-[13px] font-normal text-ink-soft">
              (Opsional)
            </span>
          )}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p className="flex animate-in items-center gap-1 text-[13px] text-destructive fade-in">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormSection({
  icon: Icon,
  title,
  description,
  aside,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-card p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Icon
            className="mt-0.5 size-5 shrink-0 text-ink-soft"
            strokeWidth={1.75}
          />
          <div>
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            <p className="text-[15px] text-ink-soft">{description}</p>
          </div>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function ImagePreview({
  url,
  className,
}: {
  url?: string | null;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const isValid =
    Boolean(url) && /^https?:\/\//.test(url ?? '') && failedUrl !== url;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface text-ink-soft',
        isValid && 'border-solid',
        className,
      )}
    >
      {isValid ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url ?? ''}
          alt=""
          onError={() => setFailedUrl(url ?? null)}
          className="size-full animate-in object-cover fade-in"
        />
      ) : (
        <ImageIcon className="size-5" />
      )}
    </div>
  );
}

/**
 * Free-text field backed by saved entries: type to search previously used
 * values, pick one to reuse it, or press Enter / "Buat" to add a new value.
 */
export function CreatableCombobox({
  value,
  onChange,
  options,
  placeholder = 'Cari atau buat baru…',
  emptyText = 'Belum ada data tersimpan.',
  isLoading = false,
}: {
  value?: string | null;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  emptyText?: string;
  isLoading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const trimmedSearch = search.trim();
  const query = trimmedSearch.toLowerCase();
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(query),
  );
  const exactMatch = options.find((option) => option.toLowerCase() === query);

  const close = () => {
    setIsOpen(false);
    setSearch('');
  };
  const select = (next: string) => {
    onChange(next);
    close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      inputRef.current?.blur();
      return;
    }
    if (event.key !== 'Enter') return;
    // Keep Enter from submitting the surrounding form.
    event.preventDefault();
    if (!trimmedSearch) return;
    select(exactMatch ?? filteredOptions[0] ?? trimmedSearch);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={cn(
          'flex min-h-11 w-full cursor-text flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card py-1.5 pr-2 pl-3 transition-shadow',
          isOpen && 'border-brand ring-3 ring-brand/15',
        )}
      >
        <Search
          className={cn(
            'size-4 shrink-0 transition-colors',
            isOpen ? 'text-ink' : 'text-ink-soft',
          )}
        />
        {value ? (
          <span className="inline-flex animate-in items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[15px] font-medium text-ink fade-in zoom-in-95">
            {value}
            <button
              type="button"
              aria-label={`Hapus ${value}`}
              onClick={(event) => {
                event.stopPropagation();
                onChange('');
              }}
              className="cursor-pointer rounded-full p-0.5 text-ink-soft hover:bg-surface hover:text-ink"
            >
              <X className="size-3" />
            </button>
          </span>
        ) : null}
        <input
          ref={inputRef}
          value={isOpen ? search : ''}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value ? '' : placeholder}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          className="min-w-[8rem] flex-1 bg-transparent px-1 text-[15px] text-ink outline-none placeholder:text-ink-soft"
        />
      </div>

      {isOpen ? (
        <div className="absolute z-20 mt-2 w-full origin-top animate-in overflow-hidden rounded-xl bg-card duration-150 fade-in zoom-in-95">
          <p className="flex items-center gap-1.5 px-3 pt-2.5 pb-1 text-[13px] text-ink-soft">
            <History className="size-3.5" />
            {trimmedSearch
              ? `${filteredOptions.length} Data Tersimpan Cocok`
              : `${options.length} Data Tersimpan`}
          </p>
          <div
            id={listboxId}
            role="listbox"
            className="max-h-52 overflow-y-auto p-1"
          >
            {isLoading ? (
              <p className="px-3 py-2 text-base text-ink-soft">Memuat…</p>
            ) : null}
            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => select(option)}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-[15px] text-ink transition-colors hover:bg-surface',
                  value === option && 'bg-surface font-medium text-ink',
                )}
              >
                {option}
                {value === option ? <Check className="size-4" /> : null}
              </button>
            ))}
            {trimmedSearch && !exactMatch ? (
              <button
                type="button"
                onClick={() => select(trimmedSearch)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[15px] transition-colors hover:bg-surface"
              >
                <Plus className="size-3.5 text-ink" />
                <span className="text-ink-soft">Buat baru</span>
                <span className="rounded-md bg-surface px-2 py-0.5 font-medium text-ink">
                  {trimmedSearch}
                </span>
              </button>
            ) : null}
            {!isLoading && filteredOptions.length === 0 && !trimmedSearch ? (
              <p className="px-3 py-2 text-base text-ink-soft">{emptyText}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
