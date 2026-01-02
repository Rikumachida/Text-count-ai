'use client';

import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { ADDITIONAL_BLOCK_TYPES, BlockType } from '@/lib/constants/block-types';
import { cn } from '@/lib/utils/cn';
import { BlockTag } from './block-tag';

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
}

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);

  const allBlockTypes: BlockType[] = ['point', 'reason', 'example', ...ADDITIONAL_BLOCK_TYPES];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] py-3 text-sm text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
      >
        <Plus className="h-4 w-4" />
        <span>ブロックを追加</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border bg-[var(--background)] p-3 shadow-lg">
          <div className="flex flex-wrap gap-2">
            {allBlockTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  onAddBlock(type);
                  setIsOpen(false);
                }}
                className="cursor-pointer"
              >
                <BlockTag type={type} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
