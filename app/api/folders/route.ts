import { NextRequest, NextResponse } from 'next/server';
import { db, folder, document } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { eq, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// GET /api/folders - フォルダ一覧取得
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    // フォルダ一覧を取得
    const folders = await db
      .select()
      .from(folder)
      .where(eq(folder.userId, session.user.id));

    // 各フォルダのドキュメント数をカウント
    const foldersWithCounts = await Promise.all(
      folders.map(async (f) => {
        const docs = await db
          .select({ count: sql<number>`count(*)` })
          .from(document)
          .where(eq(document.folderId, f.id));

        return {
          ...f,
          documentCount: docs[0]?.count || 0,
        };
      })
    );

    return NextResponse.json({ folders: foldersWithCounts });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// POST /api/folders - フォルダ作成
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
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'フォルダ名は必須です' } },
        { status: 400 }
      );
    }

    const folderId = uuidv4();
    const now = new Date();

    await db.insert(folder).values({
      id: folderId,
      userId: session.user.id,
      name,
      parentId: parentId || null,
      createdAt: now,
    });

    const newFolder = await db
      .select()
      .from(folder)
      .where(eq(folder.id, folderId))
      .get();

    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// PUT /api/folders - フォルダ更新
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, parentId } = body;

    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'フォルダIDは必須です' } },
        { status: 400 }
      );
    }

    // 所有権確認
    const existingFolder = await db
      .select()
      .from(folder)
      .where(and(eq(folder.id, id), eq(folder.userId, session.user.id)))
      .get();

    if (!existingFolder) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'フォルダが見つかりません' } },
        { status: 404 }
      );
    }

    await db
      .update(folder)
      .set({
        name: name ?? existingFolder.name,
        parentId: parentId !== undefined ? parentId : existingFolder.parentId,
      })
      .where(eq(folder.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// DELETE /api/folders - フォルダ削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'フォルダIDは必須です' } },
        { status: 400 }
      );
    }

    // 所有権確認
    const existingFolder = await db
      .select()
      .from(folder)
      .where(and(eq(folder.id, id), eq(folder.userId, session.user.id)))
      .get();

    if (!existingFolder) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'フォルダが見つかりません' } },
        { status: 404 }
      );
    }

    // フォルダ内のドキュメントのfolderIdをnullに
    await db
      .update(document)
      .set({ folderId: null })
      .where(eq(document.folderId, id));

    // フォルダ削除
    await db.delete(folder).where(eq(folder.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

