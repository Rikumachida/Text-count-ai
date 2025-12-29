import { NextResponse } from 'next/server';
import { db, experience } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { and, asc, eq, isNotNull } from 'drizzle-orm';

// GET /api/experiences/categories - カテゴリ（タグ）一覧（重複なし）
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const rows = await db
      .select({ category: experience.category })
      .from(experience)
      .where(and(eq(experience.userId, session.user.id), isNotNull(experience.category)))
      .groupBy(experience.category)
      .orderBy(asc(experience.category));

    return NextResponse.json({
      categories: rows.map((r) => r.category).filter(Boolean),
    });
  } catch (error) {
    console.error('Error fetching experience categories:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}


