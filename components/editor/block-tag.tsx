'use client';

import Image from 'next/image';
import { BlockType } from '@/lib/constants/block-types';

interface BlockTagProps {
  type: BlockType;
  className?: string;
}

// 統一カラー
const TAG_BG_COLOR = '#FAF5FF';
const TAG_TEXT_COLOR = '#5E5677';

// パレット用の短いラベル設定
const BLOCK_TAG_CONFIG: Record<BlockType, {
  emojiSrc: string | null;
  label: string;
  bgColor: string;
  textColor: string;
}> = {
  point: {
    emojiSrc: '/emojis/emoji-pushpin.png',
    label: '結論',
    bgColor: TAG_BG_COLOR,
    textColor: TAG_TEXT_COLOR,
  },
  reason: {
    emojiSrc: '/emojis/emoji-question.png',
    label: '理由',
    bgColor: TAG_BG_COLOR,
    textColor: TAG_TEXT_COLOR,
  },
  example: {
    emojiSrc: '/emojis/emoji-starstruck.png',
    label: '具体例',
    bgColor: TAG_BG_COLOR,
    textColor: TAG_TEXT_COLOR,
  },
  background: {
    emojiSrc: '/emojis/emoji-thinking.png',
    label: '背景',
    bgColor: TAG_BG_COLOR,
    textColor: TAG_TEXT_COLOR,
  },
  problem: {
    emojiSrc: '/emojis/emoji-anxious.png',
    label: '課題',
    bgColor: TAG_BG_COLOR,
    textColor: TAG_TEXT_COLOR,
  },
  solution: {
    emojiSrc: '/emojis/emoji-lightbulb.png',
    label: '解決策',
    bgColor: TAG_BG_COLOR,
    textColor: TAG_TEXT_COLOR,
  },
  custom: {
    emojiSrc: null,
    label: 'カスタム',
    bgColor: '#F8F8F8',
    textColor: TAG_TEXT_COLOR,
  },
};

export function BlockTag({ type, className = '' }: BlockTagProps) {
  const config = BLOCK_TAG_CONFIG[type] || BLOCK_TAG_CONFIG.custom;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-80 ${className}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      {config.emojiSrc && (
        <Image
          src={config.emojiSrc}
          alt=""
          width={20}
          height={20}
          className="flex-shrink-0"
        />
      )}
      <span>{config.label}</span>
    </div>
  );
}

// プレースホルダー用のテキストをエクスポート
export const BLOCK_PLACEHOLDER_TEXT: Record<BlockType, string> = {
  point: '何が言いたいのか',
  reason: 'それが言いたい理由は何か',
  example: '実際にあなたが経験したことや具体例は？',
  background: '社会や自分との関係性はどんなところにあるか',
  problem: '課題や問題になる点はどんなところか',
  solution: '課題を解決できるアイデアはどんなものになるか',
  custom: '自由に記述してください',
};

