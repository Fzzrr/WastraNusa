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
  'h-11 rounded-xl border-[#e5ded5] bg-white px-4 text-[#2f3a33] placeholder:text-[#b3aa9e] transition-shadow focus-visible:border-[#3a5a4a] focus-visible:ring-3 focus-visible:ring-[#3a5a4a]/15';
export const textareaClassName =
  'w-full resize-none rounded-xl border border-[#e5ded5] bg-white px-4 py-3 text-sm text-[#2f3a33] placeholder:text-[#b3aa9e] transition-shadow focus:outline-none focus-visible:border-[#3a5a4a] focus-visible:ring-3 focus-visible:ring-[#3a5a4a]/15';
export const selectTriggerClassName =
  'h-11 w-full rounded-xl border-[#e5ded5] bg-white text-[#2f3a33] data-[size=default]:h-11';

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
        <label className="text-sm font-medium text-[#3d3a34]">
          {label}
          {required ? (
            <span className="ml-0.5 text-[#c26a3d]">*</span>
          ) : (
            <span className="ml-1.5 text-xs font-normal text-[#a39c92]">
              (Opsional)
            </span>
          )}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p className="flex animate-in items-center gap-1 text-xs text-red-600 fade-in">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-[#9a8f80]">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormSection({
  step,
  icon: Icon,
  title,
  description,
  aside,
  children,
}: {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-[#fffdfa] p-5 ring-1 ring-[#ebe3d6]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f4efe5] text-[#8a6a3a]">
            <Icon className="size-4" />
            <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-[#3a5a4a] text-[10px] font-semibold text-white">
              {step}
            </span>
          </span>
          <div>
            <h3 className="font-semibold text-[#2f4f3f]">{title}</h3>
            <p className="text-xs text-[#9a8f80]">{description}</p>
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
        'flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#e0d6c6] bg-[#faf7f2] text-[#b3aa9e]',
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
          'flex min-h-11 w-full cursor-text flex-wrap items-center gap-1.5 rounded-xl border border-[#e5ded5] bg-white py-1.5 pr-2 pl-3 transition-shadow',
          isOpen && 'border-[#3a5a4a] ring-3 ring-[#3a5a4a]/15',
        )}
      >
        <Search
          className={cn(
            'size-4 shrink-0 transition-colors',
            isOpen ? 'text-[#2f5543]' : 'text-[#b3aa9e]',
          )}
        />
        {value ? (
          <span className="inline-flex animate-in items-center gap-1 rounded-lg bg-[#e3ece5] px-2 py-1 text-sm font-medium text-[#2f5543] fade-in zoom-in-95">
            {value}
            <button
              type="button"
              aria-label={`Hapus ${value}`}
              onClick={(event) => {
                event.stopPropagation();
                onChange('');
              }}
              className="cursor-pointer rounded-full p-0.5 text-[#5b7d66] hover:bg-[#cfe0d3] hover:text-[#2f5543]"
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
          className="min-w-[8rem] flex-1 bg-transparent px-1 text-sm text-[#2f3a33] outline-none placeholder:text-[#b3aa9e]"
        />
      </div>

      {isOpen ? (
        <div className="absolute z-20 mt-2 w-full origin-top animate-in overflow-hidden rounded-xl bg-[#fffdfa] shadow-[0_12px_32px_rgba(89,69,38,0.14)] ring-1 ring-[#ebe3d6] duration-150 fade-in zoom-in-95">
          <p className="flex items-center gap-1.5 border-b border-[#efe8de] px-3 py-2 text-xs font-medium text-[#9a8f80]">
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
              <p className="px-3 py-2 text-sm text-[#9a8f80]">Memuat…</p>
            ) : null}
            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => select(option)}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#3d3a34] transition-colors hover:bg-[#f4efe5]',
                  value === option && 'bg-[#f4efe5] font-medium text-[#2f5543]',
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
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[#f4efe5]"
              >
                <Plus className="size-3.5 text-[#2f5543]" />
                <span className="text-[#9a8f80]">Buat baru</span>
                <span className="rounded-md bg-[#e3ece5] px-2 py-0.5 font-medium text-[#2f5543]">
                  {trimmedSearch}
                </span>
              </button>
            ) : null}
            {!isLoading && filteredOptions.length === 0 && !trimmedSearch ? (
              <p className="px-3 py-2 text-sm text-[#9a8f80]">{emptyText}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
