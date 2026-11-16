'use client';

import { cn } from '@/lib/utils';
import { type CreateArticleInput } from '@/schemas/article.schema';
import { useFormContext, useWatch } from 'react-hook-form';

export function FormProgress() {
  const { control } = useFormContext<CreateArticleInput>();
  const requiredFields = useWatch({
    control,
    name: [
      'title',
      'motifLabel',
      'topic',
      'island',
      'province',
      'region',
      'excerpt',
    ],
  });
  const filledCount = requiredFields.filter((value) => value?.trim()).length;
  const progress = Math.round((filledCount / requiredFields.length) * 100);
  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            progress === 100 ? 'bg-brand' : 'bg-gold',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span
        className={cn(
          'text-[13px] font-medium whitespace-nowrap tabular-nums',
          progress === 100 ? 'text-ink' : 'text-ink-soft',
        )}
      >
        {filledCount}/{requiredFields.length} Field Wajib
      </span>
    </div>
  );
}
