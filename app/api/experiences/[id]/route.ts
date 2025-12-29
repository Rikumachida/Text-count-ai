import { NextRequest, NextResponse } from 'next/server';
import { db, experience } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { eq, and } from 'drizzle-orm';

// GET /api/experiences/:id
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
    const row = await db
      .select()
      .from(experience)
      .where(and(eq(experience.id, id), eq(experience.userId, session.user.id)))
      .get();

    if (!row) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: '経験データが見つかりません' } },
        { status: 404 }
      );
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// PUT /api/experiences/:id
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
    const existing = await db
      .select()
      .from(experience)
      .where(and(eq(experience.id, id), eq(experience.userId, session.user.id)))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: '経験データが見つかりません' } },
        { status: 404 }
      );
    }

    // autoは編集不可（将来的に必要なら別途設計）
    if (existing.source === 'auto') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: '自動蓄積データは編集できません' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category } = body as {
      title?: string;
      content?: string;
      category?: string | null;
    };

    const now = new Date();
    await db
      .update(experience)
      .set({
        title: title ?? existing.title,
        content: content ?? existing.content,
        category: category !== undefined ? category : existing.category,
        updatedAt: now,
      })
      .where(eq(experience.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// DELETE /api/experiences/:id
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
    const existing = await db
      .select()
      .from(experience)
      .where(and(eq(experience.id, id), eq(experience.userId, session.user.id)))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: '経験データが見つかりません' } },
        { status: 404 }
      );
    }

    // autoは削除不可（将来的に必要なら別途設計）
    if (existing.source === 'auto') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: '自動蓄積データは削除できません' } },
        { status: 403 }
      );
    }

    await db.delete(experience).where(eq(experience.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}


