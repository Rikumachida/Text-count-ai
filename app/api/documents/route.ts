import { NextRequest, NextResponse } from 'next/server';
import { db, document, block } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_PREP_BLOCKS } from '@/lib/constants/block-types';

// GET /api/documents - ドキュメント一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // ドキュメント一覧を取得
    let query = db
      .select()
      .from(document)
      .where(eq(document.userId, session.user.id))
      .orderBy(desc(document.updatedAt))
      .limit(limit)
      .offset(offset);

    const documents = await query;

    // 各ドキュメントのブロック数を計算
    const documentsWithCounts = await Promise.all(
      documents.map(async (doc) => {
        const blocks = await db
          .select()
          .from(block)
          .where(eq(block.documentId, doc.id));
        
        const charCount = blocks.reduce((sum, b) => sum + b.content.length, 0);
        
        return {
          ...doc,
          charCount,
        };
      })
    );

    return NextResponse.json({
      documents: documentsWithCounts,
      total: documents.length,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// POST /api/documents - ドキュメント作成
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, targetCharCount, folderId, writingMode } = body;

    const documentId = uuidv4();
    const now = new Date();

    // ドキュメント作成
    await db.insert(document).values({
      id: documentId,
      userId: session.user.id,
      title: title || '',
      targetCharCount: targetCharCount || 1000,
      writingMode: writingMode || 'formal',
      folderId: folderId || null,
      createdAt: now,
      updatedAt: now,
    });

    // デフォルトブロック（PREP法）を作成
    const defaultBlocks = DEFAULT_PREP_BLOCKS.map((template, index) => ({
      id: uuidv4(),
      documentId,
      type: template.type,
      label: template.label,
      content: '',
      order: index,
      targetCharCount: Math.round((targetCharCount || 1000) * template.ratio),
    }));

    await db.insert(block).values(defaultBlocks);

    // 作成したドキュメントを取得して返す
    const newDocument = await db
      .select()
      .from(document)
      .where(eq(document.id, documentId))
      .get();

    const blocks = await db
      .select()
      .from(block)
      .where(eq(block.documentId, documentId))
      .orderBy(block.order);

    return NextResponse.json({
      ...newDocument,
      blocks,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

