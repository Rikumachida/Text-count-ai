'use client';

import { useState } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { useSession } from '@/lib/auth-client';
import { DOCUMENT_TYPES, DocumentType } from '@/lib/constants/document-types';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  BookOpen,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BlockTag } from './block-tag';
import { BlockType } from '@/lib/constants/block-types';

export function HintsBlock() {
  const { data: session } = useSession();
  const {
    blocks,
    targetCharCount,
    writingMode,
    documentType,
    setDocumentType,
    hints,
    hintsCollapsed,
    setHints,
    clearHints,
    setHintsCollapsed,
    applyRecommendedStructure,
  } = useEditorStore();

  const [theme, setTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateHints = async () => {
    if (!theme.trim()) {
      setError('テーマを入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/hints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme.trim(),
          blocks: blocks.map((b) => ({
            type: b.type,
            label: b.label,
            order: b.order,
          })),
          targetCharCount,
          writingMode,
          documentType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'ヒント生成に失敗しました');
      }

      setHints({
        theme: theme.trim(),
        overview: data.overview ?? '',
        suggestedExperiences: data.suggestedExperiences ?? [],
        recommendedStructure: data.recommendedStructure ?? [],
        structureHint: data.structureHint ?? '',
        blockHints: data.blockHints ?? [],
        noExperiences: data.noExperiences ?? false,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ヒント生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // ログインしていない場合は表示しない
  if (!session) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-5 py-4"
        onClick={() => hints && setHintsCollapsed(!hintsCollapsed)}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#F4E9FF]">
            <Image
              src="/icons/icon-ai-hint.png"
              alt=""
              width={28}
              height={28}
            />
          </div>
          <h2 className="font-semibold">より良い文章を作成する</h2>
          {hints && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
              生成済み
            </span>
          )}
        </div>
        {hints && (
          <button className="rounded-lg p-1 hover:bg-white/50 dark:hover:bg-white/10">
            {hintsCollapsed ? (
              <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)]" />
            ) : (
              <ChevronUp className="h-5 w-5 text-[var(--muted-foreground)]" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {!hintsCollapsed && (
        <div className="border-t px-5 py-4">
          {/* Document Type Tags */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[var(--muted-foreground)]">
              どんな文章を書きますか？
            </label>
            <div className="flex flex-wrap gap-2">
              {DOCUMENT_TYPES.map((type) => {
                const isSelected = documentType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setDocumentType(isSelected ? null : type.id)}
                    className={`flex h-7 items-center gap-1 rounded-full border pl-2 pr-3 text-[10px] font-semibold transition-all ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                        : 'border-[#D9D9D9] bg-white text-[#5E5677] hover:border-violet-300'
                    }`}
                    title={type.description}
                  >
                    <Image
                      src={type.emojiSrc}
                      alt=""
                      width={20}
                      height={20}
                      className="flex-shrink-0"
                    />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme input */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[var(--muted-foreground)]">
              何について書きますか？
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="例: AIと人間の共存について"
                className="w-full rounded-lg border bg-white px-4 py-2.5 text-sm shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-violet-500/50 dark:bg-[var(--background)]"
                onKeyDown={(e) => {
                  // IME変換中はEnterで送信しない
                  if (e.key === 'Enter' && !isLoading && !e.nativeEvent.isComposing) {
                    handleGenerateHints();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTheme('');
                    clearHints();
                  }}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-all hover:bg-[var(--muted)] disabled:opacity-50 dark:bg-[var(--background)]"
                >
                  リセット
                </button>
                <button
                  onClick={handleGenerateHints}
                  disabled={isLoading || !theme.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : hints ? (
                    <RefreshCw className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>
                    {isLoading ? '生成中...' : hints ? '再生成' : 'ヒント生成'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Generated hints */}
          {hints && (
            <div className="space-y-4">
              {/* Overview */}
              <div className="rounded-xl bg-white/70 p-4 dark:bg-white/5">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300">
                  <Sparkles className="h-4 w-4" />
                  全体アドバイス
                </div>
                <p className="text-sm leading-relaxed text-[var(--foreground)]">
                  {hints.overview}
                </p>
              </div>

              {/* Suggested experiences */}
              {hints.suggestedExperiences.length > 0 && (
                <div className="rounded-xl bg-white/70 p-4 dark:bg-white/5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300">
                    <BookOpen className="h-4 w-4" />
                    使えそうな経験
                  </div>
                  <ul className="space-y-2">
                    {hints.suggestedExperiences.map((exp) => (
                      <li key={exp.id} className="text-sm">
                        <span className="font-medium">「{exp.title}」</span>
                        <span className="ml-2 text-[var(--muted-foreground)]">
                          → {exp.relevance}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* No experiences warning */}
              {hints.noExperiences && (
                <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4" />
                    経験データがありません
                  </div>
                  <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">
                    経験を登録すると、より具体的なヒントが得られます。
                  </p>
                  <Link
                    href="/experiences"
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900/70"
                  >
                    経験を登録する →
                  </Link>
                </div>
              )}

              {/* Recommended Structure */}
              {hints.recommendedStructure && hints.recommendedStructure.length > 0 && (
                <div className="rounded-xl bg-white/70 p-4 dark:bg-white/5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300">
                      <Sparkles className="h-4 w-4" />
                      おすすめの構成
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('現在の構成を推奨構成に置き換えますか？\n入力済みの内容は削除されます。')) {
                          applyRecommendedStructure();
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-violet-600"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      構成を適用
                    </button>
                  </div>
                  
                  {/* Block list with hints */}
                  <div className="space-y-3">
                    {hints.recommendedStructure.map((rec, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        {/* Block Tag */}
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-xs font-medium text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
                            {index + 1}
                          </span>
                          <BlockTag type={rec.type as BlockType} />
                        </div>
                        
                        {/* Hint Box */}
                        <div className="ml-7 rounded-lg bg-violet-50 p-3 dark:bg-violet-950/30">
                          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                            <Image
                              src="/icons/icon-hint.svg"
                              alt=""
                              width={14}
                              height={14}
                            />
                            おすすめヒント
                          </div>
                          <p className="text-xs leading-relaxed text-violet-700 dark:text-violet-300">
                            {rec.hint}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

