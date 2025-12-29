'use client';

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
import { useEditorStore } from '@/stores/editor-store';
import { BlockItem } from './block-item';
import { BlockPalette } from './block-palette';

export function BlockList() {
  const {
    blocks,
    updateBlockContent,
    updateBlockLabel,
    removeBlock,
    reorderBlocks,
    addBlock,
    getBlockHint,
  } = useEditorStore();

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

