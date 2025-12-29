'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Lightbulb } from 'lucide-react';
import { Block } from '@/types/block';
import { BLOCK_TYPES } from '@/lib/constants/block-types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/cn';

interface BlockItemProps {
  block: Block;
  onContentChange: (content: string) => void;
  onLabelChange: (label: string) => void;
  onDelete: () => void;
  canDelete?: boolean;
  hintText?: string | null;
}

export function BlockItem({
  block,
  onContentChange,
  onLabelChange,
  onDelete,
  canDelete = true,
  hintText,
}: BlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockInfo = BLOCK_TYPES[block.type];
  const charCount = block.content.length;
  const isOverflow = charCount > block.targetCharCount;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border bg-[var(--background)] shadow-sm transition-shadow',
        isDragging && 'shadow-lg opacity-90 z-50',
        'hover:shadow-md'
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 border-b px-3 py-2"
        style={{ borderLeftColor: blockInfo.color, borderLeftWidth: '4px' }}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Icon */}
        <span className="text-lg">{blockInfo.icon}</span>

        {/* Label (editable) */}
        <input
          type="text"
          value={block.label}
          onChange={(e) => onLabelChange(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
          placeholder="ラベルを入力..."
        />

        {/* Char count */}
        <span
          className={cn(
            'text-xs tabular-nums',
            isOverflow
              ? 'text-[var(--error)] font-semibold'
              : 'text-[var(--muted-foreground)]'
          )}
        >
          {charCount.toLocaleString()} / {block.targetCharCount.toLocaleString()}
        </span>

        {/* Delete button */}
        {canDelete && (
          <button
            onClick={onDelete}
            className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* AI Hint (shown above textarea when available) */}
      {hintText && (
        <div className="flex items-start gap-2 border-b bg-gradient-to-r from-violet-50 to-purple-50 px-3 py-2 dark:from-violet-950/20 dark:to-purple-950/20">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
          <p className="text-xs leading-relaxed text-violet-700 dark:text-violet-300">
            {hintText}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <textarea
          value={block.content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={`${blockInfo.label}を入力してください...`}
          className="min-h-[100px] w-full resize-none bg-transparent text-sm leading-relaxed focus:outline-none"
          rows={4}
        />
      </div>

      {/* Progress */}
      <div className="px-3 pb-3">
        <Progress
          value={charCount}
          max={block.targetCharCount}
          size="sm"
        />
      </div>
    </div>
  );
}

