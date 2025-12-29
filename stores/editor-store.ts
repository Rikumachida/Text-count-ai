import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Block } from '@/types/block';
import { WritingMode } from '@/types/document';
import { DEFAULT_PREP_BLOCKS, BlockType, BLOCK_TYPES } from '@/lib/constants/block-types';
import { v4 as uuidv4 } from 'uuid';

// ヒント関連の型
export type SuggestedExperience = {
  id: string;
  title: string;
  relevance: string;
};

export type BlockHint = {
  order: number;
  hint: string;
};

export type HintsData = {
  theme: string;
  overview: string;
  suggestedExperiences: SuggestedExperience[];
  structureHint: string;
  blockHints: BlockHint[];
  noExperiences: boolean;
};

interface EditorState {
  // Document state
  documentId: string | null;
  title: string;
  targetCharCount: number;
  blocks: Block[];
  writingMode: WritingMode;

  // Hints state
  hints: HintsData | null;
  hintsCollapsed: boolean;

  // Actions
  setTitle: (title: string) => void;
  setTargetCharCount: (count: number) => void;
  setWritingMode: (mode: WritingMode) => void;
  
  // Block actions
  addBlock: (type: BlockType, index?: number) => void;
  removeBlock: (id: string) => void;
  updateBlockContent: (id: string, content: string) => void;
  updateBlockLabel: (id: string, label: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  
  // Document actions
  resetDocument: () => void;
  loadDocument: (doc: {
    id: string;
    title: string;
    targetCharCount: number;
    blocks: Block[];
    writingMode: WritingMode;
  }) => void;

  // Hints actions
  setHints: (hints: HintsData) => void;
  clearHints: () => void;
  setHintsCollapsed: (collapsed: boolean) => void;
  getBlockHint: (order: number) => string | null;

  // Computed
  getTotalCharCount: () => number;
  getBlockCharCount: (id: string) => number;
  calculateBlockTargets: () => void;
}

// Create initial blocks from PREP template
function createInitialBlocks(): Block[] {
  return DEFAULT_PREP_BLOCKS.map((template, index) => ({
    id: uuidv4(),
    type: template.type,
    label: template.label,
    content: '',
    order: index,
    targetCharCount: 0,
  }));
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      documentId: null,
      title: '',
      targetCharCount: 1000,
      blocks: createInitialBlocks(),
      writingMode: 'formal',

      // Hints state
      hints: null,
      hintsCollapsed: false,

      // Setters
      setTitle: (title) => set({ title }),
      
      setTargetCharCount: (count) => {
        set({ targetCharCount: count });
        get().calculateBlockTargets();
      },
      
      setWritingMode: (mode) => set({ writingMode: mode }),

      // Block actions
      addBlock: (type, index) => {
        const { blocks } = get();
        const blockInfo = BLOCK_TYPES[type];
        const newBlock: Block = {
          id: uuidv4(),
          type,
          label: blockInfo.label,
          content: '',
          order: index ?? blocks.length,
          targetCharCount: 0,
        };

        let newBlocks: Block[];
        if (index !== undefined) {
          newBlocks = [
            ...blocks.slice(0, index),
            newBlock,
            ...blocks.slice(index),
          ].map((b, i) => ({ ...b, order: i }));
        } else {
          newBlocks = [...blocks, newBlock];
        }

        set({ blocks: newBlocks });
        get().calculateBlockTargets();
      },

      removeBlock: (id) => {
        const { blocks } = get();
        const newBlocks = blocks
          .filter((b) => b.id !== id)
          .map((b, i) => ({ ...b, order: i }));
        set({ blocks: newBlocks });
        get().calculateBlockTargets();
      },

      updateBlockContent: (id, content) => {
        const { blocks } = get();
        set({
          blocks: blocks.map((b) =>
            b.id === id ? { ...b, content } : b
          ),
        });
      },

      updateBlockLabel: (id, label) => {
        const { blocks } = get();
        set({
          blocks: blocks.map((b) =>
            b.id === id ? { ...b, label } : b
          ),
        });
      },

      reorderBlocks: (activeId, overId) => {
        const { blocks } = get();
        const oldIndex = blocks.findIndex((b) => b.id === activeId);
        const newIndex = blocks.findIndex((b) => b.id === overId);

        if (oldIndex === -1 || newIndex === -1) return;

        const newBlocks = [...blocks];
        const [removed] = newBlocks.splice(oldIndex, 1);
        newBlocks.splice(newIndex, 0, removed);

        set({
          blocks: newBlocks.map((b, i) => ({ ...b, order: i })),
        });
      },

      // Document actions
      resetDocument: () => {
        set({
          documentId: null,
          title: '',
          targetCharCount: 1000,
          blocks: createInitialBlocks(),
          writingMode: 'formal',
          hints: null,
          hintsCollapsed: false,
        });
        get().calculateBlockTargets();
      },

      loadDocument: (doc) => {
        set({
          documentId: doc.id,
          title: doc.title,
          targetCharCount: doc.targetCharCount,
          blocks: doc.blocks,
          writingMode: doc.writingMode,
          hints: null,
          hintsCollapsed: false,
        });
        get().calculateBlockTargets();
      },

      // Hints actions
      setHints: (hints) => set({ hints }),
      
      clearHints: () => set({ hints: null }),
      
      setHintsCollapsed: (collapsed) => set({ hintsCollapsed: collapsed }),
      
      getBlockHint: (order) => {
        const { hints } = get();
        if (!hints) return null;
        const found = hints.blockHints.find((h) => h.order === order);
        return found?.hint ?? null;
      },

      // Computed
      getTotalCharCount: () => {
        const { blocks } = get();
        return blocks.reduce((sum, block) => sum + block.content.length, 0);
      },

      getBlockCharCount: (id) => {
        const { blocks } = get();
        const block = blocks.find((b) => b.id === id);
        return block?.content.length ?? 0;
      },

      calculateBlockTargets: () => {
        const { blocks, targetCharCount } = get();
        if (blocks.length === 0) return;

        // デフォルトの比率を使用して目標文字数を計算
        const defaultRatios = DEFAULT_PREP_BLOCKS.reduce((acc, b) => {
          acc[b.type] = b.ratio;
          return acc;
        }, {} as Record<string, number>);

        // 各ブロックに比率を割り当て
        const totalBlocks = blocks.length;
        const evenRatio = 1 / totalBlocks;

        const updatedBlocks = blocks.map((block) => {
          const ratio = defaultRatios[block.type] ?? evenRatio;
          return {
            ...block,
            targetCharCount: Math.round(targetCharCount * ratio),
          };
        });

        // 合計が目標に合うよう調整
        const totalTarget = updatedBlocks.reduce((sum, b) => sum + b.targetCharCount, 0);
        if (totalTarget !== targetCharCount && updatedBlocks.length > 0) {
          updatedBlocks[0].targetCharCount += targetCharCount - totalTarget;
        }

        set({ blocks: updatedBlocks });
      },
    }),
    {
      name: 'text-count-ai-editor',
      partialize: (state) => ({
        documentId: state.documentId,
        title: state.title,
        targetCharCount: state.targetCharCount,
        blocks: state.blocks,
        writingMode: state.writingMode,
      }),
    }
  )
);

