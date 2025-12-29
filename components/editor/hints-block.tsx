'use client';

import { useState } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { useSession } from '@/lib/auth-client';
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  BookOpen,
  Layers,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export function HintsBlock() {
  const { data: session } = useSession();
  const {
    blocks,
    targetCharCount,
    writingMode,
    hints,
    hintsCollapsed,
    setHints,
    setHintsCollapsed,
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
    <div className="mb-6 overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-5 py-4"
        onClick={() => hints && setHintsCollapsed(!hintsCollapsed)}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
            <Lightbulb className="h-4 w-4" />
          </div>
          <h2 className="font-semibold">AIヒント</h2>
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
          {/* Theme input */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[var(--muted-foreground)]">
              何について書きますか？
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="例: AIと人間の共存について"
                className="flex-1 rounded-lg border bg-white px-4 py-2.5 text-sm shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-violet-500/50 dark:bg-[var(--background)]"
                onKeyDown={(e) => {
                  // IME変換中はEnterで送信しない
                  if (e.key === 'Enter' && !isLoading && !e.nativeEvent.isComposing) {
                    handleGenerateHints();
                  }
                }}
              />
              <button
                onClick={handleGenerateHints}
                disabled={isLoading || !theme.trim()}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : hints ? (
                  <RefreshCw className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isLoading ? '生成中...' : hints ? '再生成' : 'ヒント生成'}
                </span>
              </button>
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

              {/* Structure hint */}
              {hints.structureHint && (
                <div className="rounded-xl bg-white/70 p-4 dark:bg-white/5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300">
                    <Layers className="h-4 w-4" />
                    構成ヒント
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--foreground)]">
                    {hints.structureHint}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

