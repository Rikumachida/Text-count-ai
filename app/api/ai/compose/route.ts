import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { buildComposePrompt } from '@/lib/ai/prompts';
import { geminiGenerateText } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFIG_ERROR',
            message: 'GEMINI_API_KEY が未設定です（.env.local を確認してください）',
          },
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { blocks, mode, targetCharCount } = body as {
      blocks?: Array<{ type: string; label: string; content: string; order: number }>;
      mode?: 'casual' | 'formal';
      targetCharCount?: number;
    };

    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'blocks は必須です' } },
        { status: 400 }
      );
    }

    const safeMode = mode === 'casual' ? 'casual' : 'formal';
    const safeTarget =
      typeof targetCharCount === 'number' && targetCharCount > 0
        ? Math.round(targetCharCount)
        : 1000;

    const prompt = buildComposePrompt({
      blocks: blocks.map((b, idx) => ({
        type: String(b.type ?? 'custom'),
        label: String(b.label ?? ''),
        content: String(b.content ?? ''),
        order: typeof b.order === 'number' ? b.order : idx,
      })),
      mode: safeMode,
      targetCharCount: safeTarget,
    });

    const text = await geminiGenerateText({
      prompt,
      apiKey,
      model: process.env.GEMINI_MODEL,
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    return NextResponse.json({
      composedText: text,
      charCount: text.length,
      mode: safeMode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'サーバーエラーが発生しました';
    console.error('AI compose error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}


