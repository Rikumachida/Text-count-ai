'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';
import { useEditorStore } from '@/stores/editor-store';
import { EditorContainer } from '@/components/editor/editor-container';
import { Loader2 } from 'lucide-react';

export default function EditorPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;
  
  const { loadDocument } = useEditorStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/');
    }
  }, [session, isSessionPending, router]);

  useEffect(() => {
    if (session && documentId) {
      fetchDocument();
    }
  }, [session, documentId]);

  const fetchDocument = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('ドキュメントが見つかりません');
        }
        throw new Error('ドキュメントの取得に失敗しました');
      }

      const data = await response.json();
      
      loadDocument({
        id: data.id,
        title: data.title,
        targetCharCount: data.targetCharCount,
        blocks: data.blocks,
        writingMode: data.writingMode,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSessionPending || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <h2 className="mb-2 text-lg font-medium text-[var(--error)]">エラー</h2>
          <p className="mb-6 text-sm text-[var(--muted-foreground)]">{error}</p>
          <button
            onClick={() => router.push('/documents')}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
          >
            ドキュメント一覧へ戻る
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <EditorContainer />;
}

