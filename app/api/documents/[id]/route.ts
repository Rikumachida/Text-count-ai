import { NextRequest, NextResponse } from 'next/server';
import { db, document, block } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// GET /api/documents/:id - ドキュメント詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    // ドキュメント取得
    const doc = await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.id, id),
          eq(document.userId, session.user.id)
        )
      )
      .get();

    if (!doc) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'ドキュメントが見つかりません' } },
        { status: 404 }
      );
    }

    // ブロック取得
    const blocks = await db
      .select()
      .from(block)
      .where(eq(block.documentId, id))
      .orderBy(block.order);

    return NextResponse.json({
      ...doc,
      blocks,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// PUT /api/documents/:id - ドキュメント更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, targetCharCount, folderId, writingMode, blocks: newBlocks } = body;

    // ドキュメント所有権確認
    const existingDoc = await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.id, id),
          eq(document.userId, session.user.id)
        )
      )
      .get();

    if (!existingDoc) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'ドキュメントが見つかりません' } },
        { status: 404 }
      );
    }

    const now = new Date();

    // ドキュメント更新
    await db
      .update(document)
      .set({
        title: title ?? existingDoc.title,
        targetCharCount: targetCharCount ?? existingDoc.targetCharCount,
        folderId: folderId !== undefined ? folderId : existingDoc.folderId,
        writingMode: writingMode ?? existingDoc.writingMode,
        updatedAt: now,
      })
      .where(eq(document.id, id));

    // ブロック更新（渡された場合）
    if (newBlocks && Array.isArray(newBlocks)) {
      // 既存ブロックを削除
      await db.delete(block).where(eq(block.documentId, id));

      // 新しいブロックを挿入
      const blocksToInsert = newBlocks.map((b: {
        id?: string;
        type: string;
        label: string;
        content: string;
        order: number;
        targetCharCount?: number;
      }, index: number) => ({
        id: b.id || uuidv4(),
        documentId: id,
        type: b.type,
        label: b.label,
        content: b.content || '',
        order: b.order ?? index,
        targetCharCount: b.targetCharCount || 0,
      }));

      if (blocksToInsert.length > 0) {
        await db.insert(block).values(blocksToInsert);
      }
    }

    return NextResponse.json({
      id,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/:id - ドキュメント削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    // ドキュメント所有権確認
    const existingDoc = await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.id, id),
          eq(document.userId, session.user.id)
        )
      )
      .get();

    if (!existingDoc) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'ドキュメントが見つかりません' } },
        { status: 404 }
      );
    }

    // ドキュメント削除（CASCADE でブロックも削除される）
    await db.delete(document).where(eq(document.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

