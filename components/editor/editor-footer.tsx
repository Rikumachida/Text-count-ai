'use client';

import { Sparkles, RotateCcw, Save, Check, Loader2, FileText } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { useDocument } from '@/hooks/use-document';
import { CharCounter } from './char-counter';
import { useState } from 'react';
import { ComposeResultModal } from '@/components/ai/compose-result-modal';

export function EditorFooter() {
  const { blocks, targetCharCount, getTotalCharCount, resetDocument, documentId, writingMode, documentType } = useEditorStore();
  const { saveDocument, isSaving, isAuthenticated, error } = useDocument();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ text: string; charCount: number } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const totalCharCount = getTotalCharCount();

  const handleSave = async () => {
    const result = await saveDocument();
    if (result) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleReset = () => {
    if (window.confirm('ドキュメントをリセットしますか？\n入力内容はすべて削除されます。')) {
      resetDocument();
    }
  };

  const handleAiCompose = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: blocks.map((b) => ({
            type: b.type,
            label: b.label,
            content: b.content,
            order: b.order,
          })),
          mode: writingMode,
          targetCharCount,
          documentType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || '文章作成に失敗しました');
      }

      setAiResult({ text: data.composedText, charCount: data.charCount ?? data.composedText?.length ?? 0 });
      setShowResultModal(true);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : '文章作成に失敗しました');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <div className="shrink-0 border-t shadow-lg bg-[var(--background)]">
        <div className="container mx-auto px-4 py-3">
        {/* Error message */}
        {error && (
          <div className="mb-2 rounded-lg bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">
            {error}
          </div>
        )}
        {aiError && (
          <div className="mb-2 rounded-lg bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]">
            {aiError}
          </div>
        )}

        {/* Progress */}
        <div className="mb-3">
          <CharCounter
            current={totalCharCount}
            target={targetCharCount}
            label="合計"
            size="md"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">リセット</span>
            </button>
          </div>

          <div className="flex gap-2">
            {/* View Generated Text */}
            {aiResult && (
              <button
                onClick={() => setShowResultModal(true)}
                className="flex items-center gap-1.5 rounded-lg border bg-[var(--background)] px-4 py-1.5 text-sm font-medium transition-all hover:bg-[var(--muted)]"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">生成した文章を見る</span>
              </button>
            )}

            {/* Save */}
            {isAuthenticated ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  saveSuccess
                    ? 'bg-[var(--success)] text-white'
                    : 'border bg-[var(--background)] hover:bg-[var(--muted)]'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>
                  {isSaving ? '保存中...' : saveSuccess ? '保存しました！' : documentId ? '上書き保存' : '保存'}
                </span>
              </button>
            ) : (
              <button
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-[var(--muted-foreground)] opacity-50"
                disabled
                title="ログインすると保存できます"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">保存</span>
              </button>
            )}

            {/* AI Compose */}
            <button
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
              disabled={!isAuthenticated || aiLoading}
              title={isAuthenticated ? '文章を作成する' : 'ログインするとAI機能が使えます'}
              onClick={handleAiCompose}
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>{aiLoading ? '作成中...' : '文章を作成する'}</span>
            </button>
          </div>
        </div>
      </div>
      </div>

      <ComposeResultModal
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        text={aiResult?.text ?? ''}
        charCount={aiResult?.charCount ?? 0}
      />
    </>
  );
}
