import { NextRequest, NextResponse } from 'next/server';
import { db, template } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { eq, or, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { PRESET_TEMPLATES } from '@/lib/constants/templates';

type TemplateResponse = {
  id: string;
  userId?: string | null;
  name: string;
  description: string | null;
  blocks: string;
  isPreset: boolean;
  createdAt: Date | null;
};

// GET /api/templates - テンプレート一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const searchParams = request.nextUrl.searchParams;
    const includePresets = searchParams.get('includePresets') !== 'false';

    // プリセットテンプレート
    const presets: TemplateResponse[] = includePresets
      ? PRESET_TEMPLATES.map((t) => ({
          id: t.id,
          userId: null,
          name: t.name,
          description: t.description ?? null,
          blocks: JSON.stringify(t.blocks),
          isPreset: true,
          createdAt: null,
        }))
      : [];

    // ユーザーテンプレート（ログイン時のみ）
    let userTemplates: TemplateResponse[] = [];
    if (session) {
      const dbTemplates = await db
        .select()
        .from(template)
        .where(eq(template.userId, session.user.id));

      userTemplates = dbTemplates.map((t) => ({
        id: t.id,
        userId: t.userId,
        name: t.name,
        description: t.description ?? null,
        blocks: t.blocks,
        isPreset: t.isPreset === 1,
        createdAt: t.createdAt,
      }));
    }

    return NextResponse.json({
      templates: [...presets, ...userTemplates],
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

// POST /api/templates - テンプレート作成
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
    const { name, description, blocks } = body;

    if (!name || !blocks) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: '名前とブロック構成は必須です' } },
        { status: 400 }
      );
    }

    const templateId = uuidv4();
    const now = new Date();

    await db.insert(template).values({
      id: templateId,
      userId: session.user.id,
      name,
      description: description || null,
      blocks: typeof blocks === 'string' ? blocks : JSON.stringify(blocks),
      isPreset: 0,
      createdAt: now,
    });

    const newTemplate = await db
      .select()
      .from(template)
      .where(eq(template.id, templateId))
      .get();

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}

