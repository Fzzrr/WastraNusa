'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import * as React from 'react';

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            'peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-[#ccc3b4] bg-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-[#2f5f49] checked:border-[#2f5f49] transition-all cursor-pointer',
            className,
          )}
          {...props}
        />
        <Check className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity stroke-[3]" />
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
