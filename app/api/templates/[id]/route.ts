import { NextRequest, NextResponse } from 'next/server';
import { db, template } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { eq, and } from 'drizzle-orm';

// PUT /api/templates/:id - テンプレート更新
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
      .from(template)
      .where(and(eq(template.id, id), eq(template.userId, session.user.id)))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'テンプレートが見つかりません' } },
        { status: 404 }
      );
    }

    if (existing.isPreset === 1) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'プリセットテンプレートは編集できません' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, blocks } = body as {
      name?: string;
      description?: string | null;
      blocks?: unknown;
    };

    await db
      .update(template)
      .set({
        name: name ?? existing.name,
        description: description !== undefined ? description : existing.description,
        blocks: blocks
          ? typeof blocks === 'string'
            ? blocks
            : JSON.stringify(blocks)
          : existing.blocks,
      })
      .where(eq(template.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/:id - テンプレート削除
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
      .from(template)
      .where(and(eq(template.id, id), eq(template.userId, session.user.id)))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'テンプレートが見つかりません' } },
        { status: 404 }
      );
    }

    if (existing.isPreset === 1) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'プリセットテンプレートは削除できません' } },
        { status: 403 }
      );
    }

    await db.delete(template).where(eq(template.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}


