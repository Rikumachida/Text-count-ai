import { NextRequest, NextResponse } from 'next/server';
import { db, experience } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// GET /api/experiences - 経験一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const sp = request.nextUrl.searchParams;
    const source = sp.get('source'); // 'auto' | 'manual'
    const category = sp.get('category');

    // NOTE: drizzleの条件組み立てを単純化するため、必要分だけ分岐
    let rows;
    if (source && category) {
      rows = await db
        .select()
        .from(experience)
        .where(
          and(
            eq(experience.userId, session.user.id),
            eq(experience.source, source),
            eq(experience.category, category)
          )
        )
        .orderBy(desc(experience.updatedAt));
    } else if (source) {
      rows = await db
        .select()
        .from(experience)
        .where(
          and(eq(experience.userId, session.user.id), eq(experience.source, source))
        )
        .orderBy(desc(experience.updatedAt));
    } else if (category) {
      rows = await db
        .select()
        .from(experience)
        .where(
          and(eq(experience.userId, session.user.id), eq(experience.category, category))
        )
        .orderBy(desc(experience.updatedAt));
    } else {
      rows = await db
        .select()
        .from(experience)
        .where(eq(experience.userId, session.user.id))
        .orderBy(desc(experience.updatedAt));
    }

    return NextResponse.json({ experiences: rows });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// POST /api/experiences - 手動登録
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
    const { title, content, category } = body as {
      title?: string;
      content?: string;
      category?: string | null;
    };

    if (!title || !content) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'title と content は必須です' } },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date();

    await db.insert(experience).values({
      id,
      userId: session.user.id,
      title,
      content,
      category: category ?? null,
      source: 'manual',
      documentId: null,
      createdAt: now,
      updatedAt: now,
    });

    const row = await db
      .select()
      .from(experience)
      .where(and(eq(experience.id, id), eq(experience.userId, session.user.id)))
      .get();

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}


