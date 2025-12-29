'use client';

import { useCallback, useState } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { useSession } from '@/lib/auth-client';

export function useDocument() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    documentId,
    title,
    targetCharCount,
    blocks,
    writingMode,
    loadDocument,
  } = useEditorStore();

  // ドキュメント保存
  const saveDocument = useCallback(async () => {
    if (!session) {
      setError('ログインが必要です');
      return null;
    }

    setIsSaving(true);
    setError(null);

    try {
      const body = {
        title,
        targetCharCount,
        writingMode,
        blocks: blocks.map((b) => ({
          id: b.id,
          type: b.type,
          label: b.label,
          content: b.content,
          order: b.order,
          targetCharCount: b.targetCharCount,
        })),
      };

      let response: Response;

      if (documentId) {
        // 既存ドキュメントを更新
        response = await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        // 新規ドキュメントを作成
        response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || '保存に失敗しました');
      }

      const data = await response.json();

      // 新規作成の場合、ドキュメントIDを設定
      if (!documentId && data.id) {
        loadDocument({
          id: data.id,
          title,
          targetCharCount,
          blocks,
          writingMode,
        });
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存に失敗しました';
      setError(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [session, documentId, title, targetCharCount, blocks, writingMode, loadDocument]);

  // ドキュメント読み込み
  const loadDocumentById = useCallback(async (id: string) => {
    if (!session) {
      setError('ログインが必要です');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${id}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || '読み込みに失敗しました');
      }

      const data = await response.json();

      loadDocument({
        id: data.id,
        title: data.title,
        targetCharCount: data.targetCharCount,
        blocks: data.blocks,
        writingMode: data.writingMode,
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : '読み込みに失敗しました';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, loadDocument]);

  // ドキュメント削除
  const deleteDocument = useCallback(async (id: string) => {
    if (!session) {
      setError('ログインが必要です');
      return false;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || '削除に失敗しました');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '削除に失敗しました';
      setError(message);
      return false;
    }
  }, [session]);

  return {
    isSaving,
    isLoading,
    error,
    saveDocument,
    loadDocumentById,
    deleteDocument,
    isAuthenticated: !!session,
  };
}

