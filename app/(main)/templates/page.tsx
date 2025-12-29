'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/stores/editor-store';
import { Loader2, Plus, Trash2, Save, Layers } from 'lucide-react';

type TemplateItem = {
  id: string;
  userId?: string | null;
  name: string;
  description: string | null;
  blocks: string; // JSON
  isPreset: boolean;
  createdAt: string | null;
};

function safeParseBlocks(blocks: string) {
  try {
    const parsed = JSON.parse(blocks);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function TemplatesPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const { blocks: editorBlocks, targetCharCount } = useEditorStore();

  const [items, setItems] = useState<TemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isSessionPending && !session) router.push('/');
  }, [session, isSessionPending, router]);

  useEffect(() => {
    if (session) fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/templates?includePresets=true');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'テンプレート取得に失敗しました');
      setItems(data.templates ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'テンプレート取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const presetItems = useMemo(() => items.filter((t) => t.isPreset), [items]);
  const userItems = useMemo(() => items.filter((t) => !t.isPreset), [items]);

  const buildBlocksFromEditor = () => {
    const total = editorBlocks.reduce((sum, b) => sum + (b.targetCharCount || 0), 0) || targetCharCount || 1;
    return editorBlocks
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((b) => ({
        type: b.type,
        label: b.label,
        ratio: Math.max(0.05, Math.round(((b.targetCharCount || 0) / total) * 100) / 100),
      }));
  };

  const handleCreate = async (useEditor: boolean) => {
    if (!name.trim()) {
      setError('テンプレート名を入力してください');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const blocks = useEditor ? buildBlocksFromEditor() : null;
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          blocks: blocks ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || '作成に失敗しました');
      setName('');
      setDescription('');
      await fetchTemplates();
    } catch (e) {
      setError(e instanceof Error ? e.message : '作成に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, templateName: string) => {
    if (!confirm(`「${templateName}」を削除しますか？`)) return;
    setError(null);
    const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error?.message || '削除に失敗しました');
      return;
    }
    await fetchTemplates();
  };

  if (isSessionPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">テンプレート</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            PREP法などのプリセットと、あなたのテンプレートを管理できます
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
      )}

      {/* Create */}
      <div className="mb-8 rounded-2xl border bg-[var(--background)] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold">新規テンプレート作成</h2>
        </div>

        <div className="grid gap-3">
          <div>
            <label className="text-sm font-medium">テンプレート名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="例: マイPREP（短め）"
            />
          </div>
          <div>
            <label className="text-sm font-medium">説明（任意）</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="例: 期末レポート用"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleCreate(true)}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            今のエディタ構成から作成
          </button>
          <button
            onClick={() => handleCreate(false)}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
            title="ブロック構成が空の場合、作成後に編集（次実装）で整えます"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
            空テンプレとして作成
          </button>
        </div>
      </div>

      {/* Lists */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : (
        <div className="grid gap-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-[var(--muted-foreground)]">プリセット</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {presetItems.map((t) => {
                const blocks = safeParseBlocks(t.blocks);
                return (
                  <div key={t.id} className="rounded-xl border bg-[var(--background)] p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-medium">{t.name}</h3>
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                        preset
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">{t.description ?? ''}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {blocks.map((b: any, i: number) => (
                        <span
                          key={`${t.id}-${i}`}
                          className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs"
                        >
                          {b.label ?? b.type}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-[var(--muted-foreground)]">あなたのテンプレート</h2>
            {userItems.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed p-8 text-center text-sm text-[var(--muted-foreground)]">
                まだテンプレートがありません。上のフォームから作成できます。
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userItems.map((t) => {
                  const blocks = safeParseBlocks(t.blocks);
                  return (
                    <div key={t.id} className="group relative rounded-xl border bg-[var(--background)] p-4 transition-shadow hover:shadow-md">
                      <h3 className="mb-1 font-medium">{t.name}</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">{t.description ?? ''}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {blocks.slice(0, 6).map((b: any, i: number) => (
                          <span key={`${t.id}-${i}`} className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs">
                            {b.label ?? b.type}
                          </span>
                        ))}
                        {blocks.length > 6 && (
                          <span className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs">
                            +{blocks.length - 6}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        className="absolute right-2 top-2 rounded-lg p-2 text-[var(--muted-foreground)] opacity-0 transition-all hover:bg-[var(--error)]/10 hover:text-[var(--error)] group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}


