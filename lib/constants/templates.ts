import { BlockTemplate } from '@/types/block';

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  blocks: BlockTemplate[];
}

// プリセットテンプレート
export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'preset-prep',
    name: 'PREP法',
    description: '結論→理由→具体例→結論の構成。説得力のある文章に最適。',
    blocks: [
      { type: 'point', label: '結論（Point）', ratio: 0.2 },
      { type: 'reason', label: '理由（Reason）', ratio: 0.3 },
      { type: 'example', label: '具体例（Example）', ratio: 0.3 },
      { type: 'point', label: '結論（Point）', ratio: 0.2 },
    ],
  },
];

// 今後追加予定のテンプレート
// {
//   id: 'preset-imrad',
//   name: 'IMRAD法',
//   description: '序論→方法→結果→考察の科学論文形式',
//   blocks: [...],
// },
// {
//   id: 'preset-problem-solution',
//   name: '問題解決型',
//   description: '課題→原因→解決策の構成',
//   blocks: [...],
// },

