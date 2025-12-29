'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Pencil, Filter } from 'lucide-react';

type Experience = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  source: 'auto' | 'manual' | string;
  documentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function ExperiencesPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<Experience[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [source, setSource] = useState<'all' | 'manual' | 'auto'>('all');
  const [category, setCategory] = useState('');

  // Create form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newCategorySelect, setNewCategorySelect] = useState(''); // '' | existing | '__new__'
  const [newCategoryCustom, setNewCategoryCustom] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit modal (simple inline state)
  const [editing, setEditing] = useState<Experience | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategorySelect, setEditCategorySelect] = useState(''); // '' | existing | '__new__'
  const [editCategoryCustom, setEditCategoryCustom] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isSessionPending && !session) router.push('/');
  }, [session, isSessionPending, router]);

  useEffect(() => {
    if (session) {
      fetchCategories();
      fetchExperiences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, source]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/experiences/categories');
      const data = await res.json();
      if (!res.ok) return;
      setAllCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch {
      // ignore
    }
  };

  const fetchExperiences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL('/api/experiences', window.location.origin);
      if (source !== 'all') url.searchParams.set('source', source);
      if (category.trim()) url.searchParams.set('category', category.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || '取得に失敗しました');
      setItems(data.experiences ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => {
    // フィルタ用はDB全体（allCategories）を優先
    return allCategories.slice().sort();
  }, [allCategories]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      setError('タイトルと内容は必須です');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const categoryValue =
        newCategorySelect === '__new__'
          ? newCategoryCustom.trim() || null
          : newCategorySelect.trim() || null;

      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: categoryValue,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || '作成に失敗しました');
      setTitle('');
      setContent('');
      setNewCategorySelect('');
      setNewCategoryCustom('');
      await fetchCategories();
      await fetchExperiences();
    } catch (e) {
      setError(e instanceof Error ? e.message : '作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (x: Experience) => {
    setEditing(x);
    setEditTitle(x.title);
    setEditContent(x.content);
    if (!x.category) {
      setEditCategorySelect('');
      setEditCategoryCustom('');
      return;
    }
    // 既存カテゴリにあれば選択、なければ新規入力扱い
    const inList = allCategories.includes(x.category);
    if (inList) {
      setEditCategorySelect(x.category);
      setEditCategoryCustom('');
    } else {
      setEditCategorySelect('__new__');
      setEditCategoryCustom(x.category);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setIsUpdating(true);
    setError(null);
    try {
      const categoryValue =
        editCategorySelect === '__new__'
          ? editCategoryCustom.trim() || null
          : editCategorySelect.trim() || null;

      const res = await fetch(`/api/experiences/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim() || editing.title,
          content: editContent.trim() || editing.content,
          category: categoryValue,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || '更新に失敗しました');
      setEditing(null);
      await fetchCategories();
      await fetchExperiences();
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (x: Experience) => {
    if (x.source === 'auto') {
      setError('自動蓄積データは削除できません');
      return;
    }
    if (!confirm(`「${x.title}」を削除しますか？`)) return;
    setError(null);
    const res = await fetch(`/api/experiences/${x.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error?.message || '削除に失敗しました');
      return;
    }
    await fetchExperiences();
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold">経験データ</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          自分の経験を蓄積して、AIの提案に活用できます（手動登録/自動抽出）
        </p>
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
          <h2 className="text-lg font-semibold">経験を手動登録</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="例: サークルでのリーダー経験"
            />
          </div>
          <div>
            <label className="text-sm font-medium">カテゴリ（任意）</label>
            <select
              value={newCategorySelect}
              onChange={(e) => setNewCategorySelect(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
            >
              <option value="">（未設定）</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__new__">＋ 新規カテゴリを入力</option>
            </select>
            {newCategorySelect === '__new__' && (
              <input
                value={newCategoryCustom}
                onChange={(e) => setNewCategoryCustom(e.target.value)}
                className="mt-2 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
                placeholder="例: リーダーシップ"
              />
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
              rows={4}
              placeholder="何をしたか / どう工夫したか / 結果どうなったか などをメモ"
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-50"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          追加
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as any)}
            className="bg-transparent outline-none"
          >
            <option value="all">すべて</option>
            <option value="manual">手動</option>
            <option value="auto">自動</option>
          </select>
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
        >
          <option value="">カテゴリ: すべて</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={fetchExperiences}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-[var(--muted)]"
        >
          再読み込み
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center text-sm text-[var(--muted-foreground)]">
          経験データがありません。上から手動登録できます。
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((x) => (
            <div key={x.id} className="group relative rounded-xl border bg-[var(--background)] p-4 transition-shadow hover:shadow-md">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="font-medium line-clamp-1">{x.title}</h3>
                <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                  {x.source === 'manual' ? '手動' : '自動'}
                </span>
              </div>
              {x.category && (
                <div className="mb-2 text-xs text-[var(--muted-foreground)]">{x.category}</div>
              )}
              <p className="text-sm text-[var(--muted-foreground)] line-clamp-4">{x.content}</p>

              <div className="mt-3 text-xs text-[var(--muted-foreground)]">
                更新: {new Date(x.updatedAt).toLocaleDateString('ja-JP')}
              </div>

              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-all group-hover:opacity-100">
                <button
                  onClick={() => openEdit(x)}
                  className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                  title="編集"
                  disabled={x.source === 'auto'}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(x)}
                  className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
                  title="削除"
                  disabled={x.source === 'auto'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative mx-4 w-full max-w-xl rounded-2xl bg-[var(--background)] p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold">経験を編集</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">タイトル</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">カテゴリ（任意）</label>
                <select
                  value={editCategorySelect}
                  onChange={(e) => setEditCategorySelect(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="">（未設定）</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__new__">＋ 新規カテゴリを入力</option>
                </select>
                {editCategorySelect === '__new__' && (
                  <input
                    value={editCategoryCustom}
                    onChange={(e) => setEditCategoryCustom(e.target.value)}
                    className="mt-2 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
                    placeholder="例: リーダーシップ"
                  />
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">内容</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
                  rows={5}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-[var(--muted)]"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : '更新'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


