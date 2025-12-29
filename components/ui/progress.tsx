'use client';

import { cn } from '@/lib/utils/cn';

interface ProgressProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Progress({
  value,
  max,
  className,
  showLabel = false,
  size = 'md',
}: ProgressProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOverflow = value > max;
  
  // Color based on progress
  let barColor = 'bg-[var(--primary)]';
  if (percentage >= 100) {
    barColor = isOverflow ? 'bg-[var(--error)]' : 'bg-[var(--success)]';
  } else if (percentage >= 80) {
    barColor = 'bg-[var(--warning)]';
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full rounded-full bg-[var(--muted)]',
          heights[size]
        )}
      >
        <div
          className={cn(
            'rounded-full transition-all duration-300 ease-out',
            heights[size],
            barColor,
            isOverflow && 'animate-progress-pulse'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
          <span>{value.toLocaleString()}文字</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}

