'use client';

import { Progress } from '@/components/ui/progress';

interface CharCounterProps {
  current: number;
  target: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CharCounter({
  current,
  target,
  label,
  size = 'md',
}: CharCounterProps) {
  const isOverflow = current > target;

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{label}</span>
          <span
            className={
              isOverflow
                ? 'text-[var(--error)] font-semibold'
                : 'text-[var(--muted-foreground)]'
            }
          >
            {current.toLocaleString()} / {target.toLocaleString()}文字
          </span>
        </div>
      )}
      <Progress value={current} max={target} size={size} />
    </div>
  );
}

