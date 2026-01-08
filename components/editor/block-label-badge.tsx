'use client';

import Image from 'next/image';
import { BlockType } from '@/lib/constants/block-types';

// タイトルを含む拡張タイプ
export type BadgeType = BlockType | 'title';

interface BlockLabelBadgeProps {
  type: BadgeType;
  className?: string;
}

const BADGE_TEXT_COLOR = '#5E5677';

// ブロックタイプごとの設定（Figmaのデザインに基づく）
const BLOCK_BADGE_CONFIG: Record<BadgeType, {
  emojiSrc: string | null;
  text: string;
  bgColor: string;
  textColor: string;
}> = {
  point: {
    emojiSrc: '/emojis/emoji-pushpin.png',
    text: '何が言いたいのか',
    bgColor: '#F7F2FD',
    textColor: BADGE_TEXT_COLOR,
  },
  reason: {
    emojiSrc: '/emojis/emoji-question.png',
    text: 'それが言いたい理由は何か',
    bgColor: '#FDF3F2',
    textColor: BADGE_TEXT_COLOR,
  },
  example: {
    emojiSrc: '/emojis/emoji-starstruck.png',
    text: '実際にあなたが経験したことや具体例は？',
    bgColor: '#F2F6FD',
    textColor: BADGE_TEXT_COLOR,
  },
  background: {
    emojiSrc: '/emojis/emoji-thinking.png',
    text: '社会や自分との関係性はどんなところにあるか',
    bgColor: '#FDF3F2',
    textColor: BADGE_TEXT_COLOR,
  },
  problem: {
    emojiSrc: '/emojis/emoji-anxious.png',
    text: '課題や問題になる点はどんなところか',
    bgColor: '#F2F6FD',
    textColor: BADGE_TEXT_COLOR,
  },
  solution: {
    emojiSrc: '/emojis/emoji-lightbulb.png',
    text: '課題を解決できるアイデアはどんなものになるか',
    bgColor: '#FDF3F2',
    textColor: BADGE_TEXT_COLOR,
  },
  custom: {
    emojiSrc: null,
    text: 'カスタム',
    bgColor: '#F8F8F8',
    textColor: BADGE_TEXT_COLOR,
  },
  title: {
    emojiSrc: '/emojis/emoji-megaphone.png',
    text: 'タイトル',
    bgColor: '#FDF3F2',
    textColor: BADGE_TEXT_COLOR,
  },
};

export function BlockLabelBadge({ type, className = '' }: BlockLabelBadgeProps) {
  const config = BLOCK_BADGE_CONFIG[type] || BLOCK_BADGE_CONFIG.custom;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${className}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      {config.emojiSrc && (
        <Image
          src={config.emojiSrc}
          alt=""
          width={28}
          height={28}
          className="flex-shrink-0"
        />
      )}
      <span>{config.text}</span>
    </div>
  );
}
