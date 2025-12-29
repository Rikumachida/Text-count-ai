import type { WritingMode } from '@/types/document';
import type { Block } from '@/types/block';

function modeInstruction(mode: WritingMode) {
  if (mode === 'casual') {
    return '文体はカジュアル（親しみやすく、読みやすい口調）。砕けすぎず、大学のレポートとして許容される範囲で自然に。';
  }
  return '文体はフォーマル（大学レポート向け、論理的で丁寧）。主観は許容するが、曖昧表現を減らし、論理のつながりを明確に。';
}

function blockTypeHint(type: string) {
  switch (type) {
    case 'point':
      return '結論（主張）';
    case 'reason':
      return '理由';
    case 'example':
      return '具体例';
    case 'background':
      return '背景';
    case 'problem':
      return '課題';
    case 'solution':
      return '解決策';
    default:
      return 'セクション';
  }
}

// 経験データの型
export type ExperienceForHint = {
  id: string;
  title: string;
  content: string;
  category: string | null;
};

// ヒント生成用プロンプト
export function buildHintsPrompt(params: {
  theme: string;
  blocks: { type: string; label: string; order: number }[];
  experiences: ExperienceForHint[];
  writingMode: WritingMode;
  targetCharCount: number;
}) {
  const { theme, blocks, experiences, writingMode, targetCharCount } = params;

  const ordered = [...blocks].sort((a, b) => a.order - b.order);

  const blockList = ordered
    .map((b, idx) => {
      const hint = blockTypeHint(b.type);
      return `${idx + 1}. ${b.label || hint}（${hint}）`;
    })
    .join('\n');

  const experienceList =
    experiences.length > 0
      ? experiences
          .map((e) => `- 「${e.title}」${e.category ? `（${e.category}）` : ''}: ${e.content.slice(0, 100)}...`)
          .join('\n')
      : '（経験データがありません）';

  const hasExperiences = experiences.length > 0;

  return [
    'あなたは大学生向けレポートの執筆支援アシスタントです。',
    'ユーザーが入力した「テーマ」と「構成（ブロック）」を見て、各ブロックに何を書けばよいかヒントを提案してください。',
    '',
    '【重要な制約】',
    '- 出力は必ず以下のJSON形式のみ。それ以外のテキストは出力しない。',
    '- ヒントは具体的かつ励ましを含む口調で（例: 「〜を書いてみよう！」）',
    '- 経験データがある場合は、関連しそうな経験を具体的に提案する',
    '- 経験データがない場合は、汎用的なヒントを出す',
    `- ${modeInstruction(writingMode)}`,
    '',
    '【入力情報】',
    `テーマ: ${theme}`,
    `目標文字数: ${targetCharCount}文字`,
    '',
    '【ブロック構成】',
    blockList,
    '',
    '【ユーザーの経験データ】',
    experienceList,
    '',
    '【出力形式（JSON）】',
    '```json',
    '{',
    '  "overview": "テーマと経験を踏まえた全体アドバイス（1〜2文）",',
    '  "suggestedExperiences": [',
    '    { "id": "経験ID", "title": "経験タイトル", "relevance": "このテーマとの関連" }',
    '  ],',
    '  "structureHint": "構成についてのアドバイス（PREP法の流れなど）",',
    '  "blockHints": [',
    '    { "order": 0, "hint": "このブロックに書く内容のヒント" },',
    '    ...',
    '  ]',
    '}',
    '```',
    '',
    hasExperiences
      ? '経験データを参照して、具体的な経験名を含めたヒントを出してください。'
      : '経験データがないので、汎用的なヒントを出してください。また、経験を登録すると良いアドバイスができることを示唆してください。',
  ].join('\n');
}

export function buildComposePrompt(params: {
  blocks: Pick<Block, 'type' | 'label' | 'content' | 'order'>[];
  mode: WritingMode;
  targetCharCount: number;
}) {
  const { blocks, mode, targetCharCount } = params;

  const ordered = [...blocks].sort((a, b) => a.order - b.order);
  const nonEmpty = ordered.filter((b) => (b.content ?? '').trim().length > 0);

  const sections = nonEmpty
    .map((b, idx) => {
      const title = b.label?.trim() || blockTypeHint(b.type);
      const hint = blockTypeHint(b.type);
      const content = (b.content ?? '').trim();
      return [
        `【${idx + 1}. ${title}】`,
        `(意図: ${hint})`,
        content,
      ].join('\n');
    })
    .join('\n\n');

  return [
    'あなたは大学生向けレポートの文章編集アシスタントです。',
    '以下の「構成ブロックのメモ」を、論理が通る自然な日本語の文章に統合して仕上げてください。',
    '',
    '【重要な制約】',
    '- 出力は日本語のみ。',
    '- Markdown記法（見出し/箇条書き/コードフェンス）は使わず、通常の文章として出力する。',
    '- 文章の重複を避け、論理の飛躍があれば補ってつなぐ（ただし事実は捏造しない）。',
    `- 目標文字数は約${targetCharCount}文字（±15%程度を目安）。`,
    `- ${modeInstruction(mode)}`,
    '',
    '【入力（構成ブロックのメモ）】',
    sections || '（入力が空です。ユーザーに内容入力を促す短い案内文を1〜2文だけ出力してください。）',
    '',
    '【出力】',
  ].join('\n');
}


