'use client';

import { useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Image from 'next/image';
import { useEditorStore } from '@/stores/editor-store';
import { BlockItem } from './block-item';
import { BlockLabelBadge } from './block-label-badge';
import { BlockPalette } from './block-palette';

export function BlockList() {
  const {
    blocks,
    title,
    setTitle,
    updateBlockContent,
    updateBlockLabel,
    removeBlock,
    reorderBlocks,
    addBlock,
    getBlockHint,
  } = useEditorStore();

  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  // タイトルテキストエリアの高さを自動調整
  useEffect(() => {
    const textarea = titleTextareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(48, textarea.scrollHeight)}px`;
    }
  }, [title]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderBlocks(active.id as string, over.id as string);
    }
  };

  return (
    <div className="space-y-4">
      {/* タイトルブロック */}
      <div className="rounded-2xl border border-[#D9D9D9] bg-white p-2 mb-6">
        {/* Header */}
        <div className="flex items-center gap-1 mb-4">
          <BlockLabelBadge type="title" />
        </div>

        {/* Content area */}
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
            ref={titleTextareaRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章のタイトルを入力"
            className="min-h-[48px] flex-1 resize-none overflow-hidden bg-transparent text-sm font-medium leading-relaxed text-[#4C484D] placeholder:text-[#9CA3AF] focus:outline-none"
          />
        </div>
      </div>

      {/* 構成ブロック */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {blocks.map((block) => (
              <BlockItem
                key={block.id}
                block={block}
                onContentChange={(content) =>
                  updateBlockContent(block.id, content)
                }
                onLabelChange={(label) => updateBlockLabel(block.id, label)}
                onDelete={() => removeBlock(block.id)}
                canDelete={blocks.length > 1}
                hintText={getBlockHint(block.order)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <BlockPalette onAddBlock={(type) => addBlock(type)} />
    </div>
  );
}

