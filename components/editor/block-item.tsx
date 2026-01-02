'use client';

import { useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Block } from '@/types/block';
import { BlockType } from '@/lib/constants/block-types';
import { cn } from '@/lib/utils/cn';
import { BlockLabelBadge } from './block-label-badge';
import { BLOCK_PLACEHOLDER_TEXT } from './block-tag';

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
  onDelete,
  canDelete = true,
  hintText,
}: BlockItemProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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

  const charCount = block.content.length;
  const isOverflow = charCount > block.targetCharCount;

  // テキストエリアの高さを自動調整
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 一度高さをリセットしてからscrollHeightを取得
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(80, textarea.scrollHeight)}px`;
    }
  }, [block.content]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-2xl border border-[#D9D9D9] bg-white p-2 transition-shadow',
        isDragging && 'shadow-lg opacity-90 z-50',
        'hover:shadow-md'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-1">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            tabIndex={-1}
            className="cursor-grab touch-none rounded p-1 hover:bg-[var(--muted)] active:cursor-grabbing"
          >
            <Image
              src="/icons/icon-drag.svg"
              alt="ドラッグ"
              width={24}
              height={24}
            />
          </button>

          {/* Block Label Badge */}
          <BlockLabelBadge type={block.type as BlockType} />
        </div>

        <div className="flex items-center gap-2">
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
              tabIndex={-1}
              className="rounded p-1 hover:bg-[var(--error)]/10"
            >
              <Image
                src="/icons/icon-delete.svg"
                alt="削除"
                width={24}
                height={24}
              />
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="space-y-2">
        {/* AI Hint */}
        {hintText && (
          <div className="flex items-start gap-2 rounded-lg bg-[#FAF5FF] p-2 pr-4">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-[#F4E9FF]">
              <Image
                src="/icons/icon-hint.svg"
                alt=""
                width={28}
                height={28}
              />
            </div>
            <p className="text-xs leading-relaxed text-[#633571]">
              {hintText}
            </p>
          </div>
        )}

        {/* Text input */}
        <div className="flex items-start gap-2 rounded-lg bg-[#F9F9F9] p-2 pr-4">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-[#EEEEEE]">
            <Image
              src="/icons/icon-edit.svg"
              alt=""
              width={28}
              height={28}
            />
          </div>
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder={BLOCK_PLACEHOLDER_TEXT[block.type as BlockType] || '自由に記述してください'}
            className="min-h-[80px] flex-1 resize-none overflow-hidden bg-transparent text-xs leading-relaxed text-[#4C484D] placeholder:text-[#9CA3AF] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
