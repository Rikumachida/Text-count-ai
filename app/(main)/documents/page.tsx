'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Trash2, Calendar, Type, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  targetCharCount: number;
  charCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/');
    }
  }, [session, isSessionPending, router]);

  useEffect(() => {
    if (session) {
      fetchDocuments();
    }
  }, [session]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('ドキュメントの取得に失敗しました');
      }
      const data = await response.json();
      setDocuments(data.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title || '無題のドキュメント'}」を削除しますか？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      });

      if (!response.ok) {
        throw new Error('作成に失敗しました');
      }

      const data = await response.json();
      router.push(`/editor/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました');
    }
  };

  if (isSessionPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">マイドキュメント</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            保存したドキュメントを管理できます
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          新規作成
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : documents.length === 0 ? (
        /* Empty state */
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed">
          <FileText className="mb-4 h-16 w-16 text-[var(--muted-foreground)]" />
          <h2 className="mb-2 text-lg font-medium">ドキュメントがありません</h2>
          <p className="mb-6 text-sm text-[var(--muted-foreground)]">
            新規作成ボタンからドキュメントを作成しましょう
          </p>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
          >
            <Plus className="h-4 w-4" />
            新規作成
          </button>
        </div>
      ) : (
        /* Document list */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group relative rounded-xl border bg-[var(--background)] p-4 transition-shadow hover:shadow-md"
            >
              <Link href={`/editor/${doc.id}`} className="block">
                <h3 className="mb-2 font-medium line-clamp-1">
                  {doc.title || '無題のドキュメント'}
                </h3>
                <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <Type className="h-3 w-3" />
                    {doc.charCount.toLocaleString()} / {doc.targetCharCount.toLocaleString()}文字
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(doc.updatedAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(doc.id, doc.title);
                }}
                className="absolute right-2 top-2 rounded-lg p-2 text-[var(--muted-foreground)] opacity-0 transition-all hover:bg-[var(--error)]/10 hover:text-[var(--error)] group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

