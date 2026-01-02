import type { WritingMode } from '@/types/document';
import type { Block } from '@/types/block';
import { DocumentType, getDocumentTypePromptModifier, DOCUMENT_TYPES } from '@/lib/constants/document-types';

function modeInstruction(mode: WritingMode) {
  if (mode === 'casual') {
    return '文体はカジュアル（親しみやすく、読みやすい口調）。砕けすぎず、大学のレポートとして許容される範囲で自然に。';
  }
  return '文体はフォーマル（大学レポート向け、論理的で丁寧）。主観は許容するが、曖昧表現を減らし、論理のつながりを明確に。';
}

function documentTypeInstruction(docType?: DocumentType) {
  if (!docType) return '';
  const modifier = getDocumentTypePromptModifier(docType);
  const typeInfo = DOCUMENT_TYPES.find((t) => t.id === docType);
  const label = typeInfo?.label || docType;
  return `- 文章タイプ「${label}」: ${modifier}`;
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
  documentType?: DocumentType;
}) {
  const { theme, blocks, experiences, writingMode, targetCharCount, documentType } = params;

  const ordered = [...blocks].sort((a, b) => a.order - b.order);

  // 目標文字数が長いほど、理由/具体例を複数用意するなど構成を厚くするのが自然
  const lengthTier =
    targetCharCount >= 4000 ? 'xl' :
    targetCharCount >= 2500 ? 'lg' :
    targetCharCount >= 1500 ? 'md' : 'sm';

  const lengthBasedStructureAdvice = (() => {
    switch (lengthTier) {
      case 'xl':
        return [
          `- 目標文字数(${targetCharCount})が長いので、理由は3つ程度、具体例も2〜3つ程度あると説得力が出ます。`,
          '- ブロックを増やせる前提で、必要なら「背景」「課題」「解決策」を追加する案も出してください。',
          '- 結論→理由×3→具体例×2〜3→結論（要約＋示唆） のように厚めに構成してOKです。',
        ].join('\n');
      case 'lg':
        return [
          `- 目標文字数(${targetCharCount})がやや長いので、理由は2〜3つ、具体例も2つ程度あるとバランスが良いです。`,
          '- 必要なら「背景」や「課題」を前段に追加して論点の土台を作る提案もしてください。',
          '- ひとつの理由/具体例に情報が詰まりすぎていれば、分割する提案をしてください。',
        ].join('\n');
      case 'md':
        return [
          `- 目標文字数(${targetCharCount})が中〜長めなので、理由は2つ程度、具体例も1〜2つあると自然です。`,
          '- ブロックが足りない場合は「理由」や「具体例」を追加して分割する提案をしてください。',
        ].join('\n');
      default:
        return [
          `- 目標文字数(${targetCharCount})が短めなので、理由1つ＋具体例1つでも十分です。`,
          '- ただし主張が弱ければ、理由をもう1つ足す提案はしてOKです。',
        ].join('\n');
    }
  })();

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
    '- 「構成ヒント（structureHint）」は受け身ではなく主体的に。目標文字数・ブロック不足・論点不足を見て、改善案（ブロック追加/分割/順序）を具体的に提案する。',
    '- 目標文字数が長い場合は、理由や具体例を複数に増やす提案を積極的に行う。',
    '',
    '【出力フォーマットの制約】',
    '- Markdown記法（**太字**や##見出しなど）は絶対に使わない。プレーンテキストのみ。',
    '- 括弧（）もなるべく使わない。補足が必要な場合は「〜という」「〜のような」など自然な表現に置き換える。',
    '- structureHintは読みやすいように適度に改行（\\n）を入れる。各ブロックの説明は1行ずつ区切る。',
    '- 番号付きリストは「1. 」「2. 」のようにシンプルに。',
    `- ${modeInstruction(writingMode)}`,
    documentType ? documentTypeInstruction(documentType) : '',
    '',
    '【入力情報】',
    `テーマ: ${theme}`,
    `目標文字数: ${targetCharCount}文字`,
    '',
    '【目標文字数に応じた構成の目安】',
    lengthBasedStructureAdvice,
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
    '  "structureHint": "構成についての主体的なアドバイス（例: 理由/具体例を増やす、背景/課題/解決策を足す、分割する、順序を変える等）",',
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
  blocks: { type: string; label: string; content: string; order: number }[];
  mode: WritingMode;
  targetCharCount: number;
  documentType?: DocumentType;
}) {
  const { blocks, mode, targetCharCount, documentType } = params;

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
    `- **文字数制約**: 出力は${Math.round(targetCharCount * 0.95)}〜${targetCharCount}文字の範囲で書いてください。目標に近づけつつ、超過しないように調整してください。`,
    `- ${modeInstruction(mode)}`,
    documentType ? documentTypeInstruction(documentType) : '',
    '',
    '【入力（構成ブロックのメモ）】',
    sections || '（入力が空です。ユーザーに内容入力を促す短い案内文を1〜2文だけ出力してください。）',
    '',
    '【出力】',
    `（${Math.round(targetCharCount * 0.95)}〜${targetCharCount}文字で出力）`,
  ].join('\n');
}


