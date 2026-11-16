import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProductFilterOption } from '@/types/product';
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

const optionClassName =
  'relative flex cursor-pointer items-center justify-between overflow-hidden rounded-xl px-3 py-2 text-left text-sm transition-all duration-200';

/** Shared card look for every filter group in the sidebar. */
export const filterCardClassName =
  'gap-3 rounded-2xl border-0 bg-[#fbf8f2] p-4 text-[#3f5b4c] shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_28px_rgba(89,69,38,0.06)] ring-1 ring-[#e3d9c7]';

export function FilterCardTitle({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold text-[#2f5b49]">
      <span className="grid size-7 place-items-center rounded-lg bg-[#f5ead3] text-[#a07a2c]">
        <Icon className="size-3.5" />
      </span>
      {children}
    </div>
  );
}

function FilterOption({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        optionClassName,
        active
          ? 'bg-gradient-to-r from-[#2f5f49] to-[#3f7359] text-[#edf4ec] shadow-[0_8px_18px_-10px_rgba(47,95,73,0.8)] before:absolute before:inset-y-1.5 before:left-0 before:w-1 before:rounded-full before:bg-[#e8cb8d]'
          : 'text-[#4f6659] hover:translate-x-0.5 hover:bg-[#e3ece5] hover:text-[#2f5f49]',
      )}
      onClick={onClick}
    >
      <span>{label}</span>
      <Badge
        variant="secondary"
        className={cn(
          'rounded-full px-2 py-0.5 text-xs font-bold',
          active ? 'bg-white/20 text-[#f4f7f1]' : 'bg-[#efe8dd] text-[#839386]',
        )}
      >
        {count}
      </Badge>
    </button>
  );
}

/**
 * One filter group: an "all" option, then each option. With `maxVisible`, the
 * rest collapse behind a toggle, unless the selected option is among them.
 */
export function FilterOptionList({
  icon,
  title,
  allLabel,
  allCount,
  options,
  selected,
  onChange,
  maxVisible,
  formatLabel = (name) => name,
}: {
  icon: LucideIcon;
  title: string;
  allLabel: string;
  allCount: number;
  options: ProductFilterOption[];
  selected?: string;
  onChange: (value?: string) => void;
  maxVisible?: number;
  formatLabel?: (name: string) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const limit = maxVisible ?? options.length;
  const hasMore = options.length > limit;
  const showAll =
    isExpanded ||
    options.slice(limit).some((option) => option.name === selected);
  const visible = showAll ? options : options.slice(0, limit);

  return (
    <Card className={filterCardClassName}>
      <FilterCardTitle icon={icon}>{title}</FilterCardTitle>
      <div className="flex flex-col gap-1.5">
        <FilterOption
          label={allLabel}
          count={allCount}
          active={!selected}
          onClick={() => onChange(undefined)}
        />
        {visible.map((option) => (
          <FilterOption
            key={option.name}
            label={formatLabel(option.name)}
            count={option.count}
            active={selected === option.name}
            onClick={() => onChange(option.name)}
          />
        ))}
        {hasMore ? (
          <button
            type="button"
            className="mt-1 flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-semibold text-[#5d6f62]"
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={showAll}
          >
            <span>{showAll ? 'Sembunyikan lainnya' : 'Tampilkan lainnya'}</span>
            {showAll ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>
    </Card>
  );
}
