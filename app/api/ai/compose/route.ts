import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { buildComposePrompt } from '@/lib/ai/prompts';
import { geminiGenerateText } from '@/lib/ai/gemini';
import { DocumentType } from '@/lib/constants/document-types';

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
    const { blocks, mode, targetCharCount, documentType } = body as {
      blocks?: Array<{ type: string; label: string; content: string; order: number }>;
      mode?: 'casual' | 'formal';
      targetCharCount?: number;
      documentType?: DocumentType | null;
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
      documentType: documentType || undefined,
    });

    // 日本語は1文字≈1.5-2トークン程度。目標文字数の2倍を上限とし、AIに十分な余裕を持たせる
    // ただし、最小512、最大4096の範囲内
    const maxTokens = Math.min(
      Math.max(Math.round(safeTarget * 2), 512),
      4096
    );

    let text = await geminiGenerateText({
      prompt,
      apiKey,
      model: process.env.GEMINI_MODEL,
      temperature: 0.7,
      maxOutputTokens: maxTokens,
    });

    // 目標文字数を5%以上超えている場合のみ切り詰める（文の途中で切れないよう、最後の句点まで）
    const maxAllowed = Math.round(safeTarget * 1.05); // 5%超過まで許容
    if (text.length > maxAllowed) {
      const truncated = text.slice(0, safeTarget);
      const lastPeriod = truncated.lastIndexOf('。');
      const lastExclamation = truncated.lastIndexOf('！');
      const lastQuestion = truncated.lastIndexOf('？');
      const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
      
      if (lastSentenceEnd > safeTarget * 0.85) {
        // 文の終わりが見つかった場合、そこまでで切り詰める
        text = truncated.slice(0, lastSentenceEnd + 1);
      } else {
        // 文の終わりが見つからない場合、目標文字数で切り詰める
        text = truncated;
      }
    }

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


