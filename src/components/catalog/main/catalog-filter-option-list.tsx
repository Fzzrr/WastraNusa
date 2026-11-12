import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProductFilterOption } from '@/types/product';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const optionClassName =
  'relative flex cursor-pointer items-center justify-between overflow-hidden rounded-full px-3 py-2 text-left text-[15px] transition-colors duration-200';

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
          ? 'bg-brand text-on-field'
          : 'text-ink hover:bg-surface hover:text-ink',
      )}
      onClick={onClick}
    >
      <span>{label}</span>
      <span
        className={cn(
          'text-[13px] tabular-nums',
          active ? 'text-on-field-soft' : 'text-ink-soft',
        )}
      >
        {count}
      </span>
    </button>
  );
}

/**
 * One filter group: an "all" option, then each option. With `maxVisible`, the
 * rest collapse behind a toggle, unless the selected option is among them.
 */
export function FilterOptionList({
  title,
  allLabel,
  allCount,
  options,
  selected,
  onChange,
  maxVisible,
  formatLabel = (name) => name,
}: {
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
    <Card className="gap-2 rounded-none border-0 bg-transparent p-0 py-2 text-ink">
      <h3 className="px-3 text-base font-semibold text-ink">{title}</h3>
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
            className="mt-1 flex items-center justify-between rounded-md px-2 py-1.5 text-left text-[15px] font-semibold text-ink-soft"
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
