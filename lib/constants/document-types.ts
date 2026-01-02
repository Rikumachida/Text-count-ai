// 文章タイプの定義
export type DocumentType = 
  | 'formal'          // 丁寧
  | 'casual'          // カジュアル
  | 'business_email'  // メール
  | 'essay'           // 論文
  | 'reaction'        // 感想
  | 'entry_sheet';    // エントリーシート

export interface DocumentTypeInfo {
  id: DocumentType;
  label: string;
  emojiSrc: string;
  description: string;
}

export const DOCUMENT_TYPES: DocumentTypeInfo[] = [
  { id: 'formal', label: '丁寧', emojiSrc: '/emojis/emoji-monocle.png', description: '丁寧で礼儀正しい文章' },
  { id: 'casual', label: 'カジュアル', emojiSrc: '/emojis/emoji-sunglasses.png', description: 'くだけた自然な文章' },
  { id: 'business_email', label: 'メール', emojiSrc: '/emojis/emoji-envelope.png', description: 'ビジネスメール' },
  { id: 'essay', label: '論文', emojiSrc: '/emojis/emoji-book.png', description: '学術的で論理的な文章' },
  { id: 'reaction', label: '感想', emojiSrc: '/emojis/emoji-thought.png', description: '授業の感想・考察' },
  { id: 'entry_sheet', label: 'エントリーシート', emojiSrc: '/emojis/emoji-memo.png', description: '就活用の自己PR' },
];

// 文章タイプに応じたプロンプト修飾子
export function getDocumentTypePromptModifier(type: DocumentType | null): string {
  if (!type) return '';

  const modifiers: Record<DocumentType, string> = {
    formal: '丁寧で礼儀正しい敬語を使い、フォーマルなトーンで書いてください。',
    casual: 'くだけた自然な口調で、親しみやすい文章を書いてください。',
    business_email: 'ビジネスメールとして適切な敬語と構成（宛名、挨拶、本文、結び）を使ってください。',
    essay: '学術的で論理的な文章構成を意識し、客観的な表現を使ってください。「である調」を使用してください。',
    reaction: '授業内容への感想と自分の考察を明確に分け、学んだことと疑問点を含めてください。',
    entry_sheet: '自己PRとして、具体的なエピソードと学んだこと・強みを明確に伝えてください。',
  };

  return modifiers[type] || '';
}
