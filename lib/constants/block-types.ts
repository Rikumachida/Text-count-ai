export const BLOCK_TYPES = {
  point: {
    id: 'point',
    label: '結論（Point）',
    color: '#3b82f6', // blue-500
    icon: '🔵',
  },
  reason: {
    id: 'reason',
    label: '理由（Reason）',
    color: '#22c55e', // green-500
    icon: '🟢',
  },
  example: {
    id: 'example',
    label: '具体例（Example）',
    color: '#f59e0b', // amber-500
    icon: '🟠',
  },
  background: {
    id: 'background',
    label: '背景',
    color: '#8b5cf6', // violet-500
    icon: '🟣',
  },
  problem: {
    id: 'problem',
    label: '課題',
    color: '#ef4444', // red-500
    icon: '🔴',
  },
  solution: {
    id: 'solution',
    label: '解決策',
    color: '#06b6d4', // cyan-500
    icon: '🔷',
  },
  custom: {
    id: 'custom',
    label: 'カスタム',
    color: '#6b7280', // gray-500
    icon: '⚪',
  },
} as const;

export type BlockType = keyof typeof BLOCK_TYPES;

// PREP法のデフォルト構成
export const DEFAULT_PREP_BLOCKS = [
  { type: 'point' as BlockType, label: '結論（Point）', ratio: 0.2 },
  { type: 'reason' as BlockType, label: '理由（Reason）', ratio: 0.3 },
  { type: 'example' as BlockType, label: '具体例（Example）', ratio: 0.3 },
  { type: 'point' as BlockType, label: '結論（Point）', ratio: 0.2 },
];

// 追加可能なブロックタイプ
export const ADDITIONAL_BLOCK_TYPES: BlockType[] = [
  'background',
  'problem',
  'solution',
  'custom',
];

