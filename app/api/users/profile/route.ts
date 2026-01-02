import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth-server';
import { eq } from 'drizzle-orm';

// GET /api/users/profile - 現在のユーザープロフィールを取得
export async function GET() {
  try {
    const currentUser = await requireAuth();

    const [profile] = await db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        university: user.university,
        major: user.major,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/users/profile - プロフィールを更新
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();

    const { university, major } = body;

    // バリデーション
    if (university !== undefined && typeof university !== 'string') {
      return NextResponse.json({ error: 'Invalid university' }, { status: 400 });
    }
    if (major !== undefined && typeof major !== 'string') {
      return NextResponse.json({ error: 'Invalid major' }, { status: 400 });
    }

    // 更新データを構築
    const updateData: { university?: string | null; major?: string | null; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (university !== undefined) {
      updateData.university = university.trim() || null;
    }
    if (major !== undefined) {
      updateData.major = major.trim() || null;
    }

    // 更新実行
    await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, currentUser.id));

    // 更新後のプロフィールを返す
    const [updatedProfile] = await db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        university: user.university,
        major: user.major,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    return NextResponse.json(updatedProfile);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

