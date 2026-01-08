import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { buildHintsPrompt, ExperienceForHint } from '@/lib/ai/prompts';
import { geminiGenerateText } from '@/lib/ai/gemini';
import { db, experience } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { DocumentType } from '@/lib/constants/document-types';

export type RecommendedBlock = {
  type: string;
  hint: string;
};

export type HintsResponse = {
  overview: string;
  suggestedExperiences: { id: string; title: string; relevance: string }[];
  recommendedStructure: RecommendedBlock[];
  structureHint: string;
  blockHints: { order: number; hint: string }[];
  noExperiences: boolean;
};

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
    const { theme, blocks, targetCharCount, writingMode, documentType } = body as {
      theme?: string;
      blocks?: Array<{ type: string; label: string; order: number }>;
      targetCharCount?: number;
      writingMode?: 'casual' | 'formal';
      documentType?: DocumentType | null;
    };

    if (!theme || typeof theme !== 'string' || theme.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'テーマを入力してください' } },
        { status: 400 }
      );
    }

    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ブロック構成が必要です' } },
        { status: 400 }
      );
    }

    // ユーザーの経験データを取得
    const userExperiences = await db
      .select()
      .from(experience)
      .where(eq(experience.userId, session.user.id));

    const experiencesForPrompt: ExperienceForHint[] = userExperiences.map((e) => ({
      id: e.id,
      title: e.title,
      content: e.content,
      category: e.category,
    }));

    const safeMode = writingMode === 'casual' ? 'casual' : 'formal';
    const safeTarget =
      typeof targetCharCount === 'number' && targetCharCount > 0
        ? Math.round(targetCharCount)
        : 1000;

    const prompt = buildHintsPrompt({
      theme: theme.trim(),
      blocks: blocks.map((b, idx) => ({
        type: String(b.type ?? 'custom'),
        label: String(b.label ?? ''),
        order: typeof b.order === 'number' ? b.order : idx,
      })),
      experiences: experiencesForPrompt,
      writingMode: safeMode,
      targetCharCount: safeTarget,
      documentType: documentType || undefined,
    });

    const rawText = await geminiGenerateText({
      prompt,
      apiKey,
      model: process.env.GEMINI_MODEL,
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    // JSONを抽出してパース
    let parsed: HintsResponse;
    try {
      // ```json ... ``` を除去
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rawText;
      parsed = JSON.parse(jsonStr.trim());
    } catch {
      // パース失敗時はフォールバック
      parsed = {
        overview: 'ヒントの生成に問題がありました。もう一度お試しください。',
        suggestedExperiences: [],
        recommendedStructure: blocks.map((b) => ({
          type: b.type,
          hint: `${b.label || 'このセクション'}について書いてみましょう`,
        })),
        structureHint: '',
        blockHints: blocks.map((b, idx) => ({
          order: typeof b.order === 'number' ? b.order : idx,
          hint: `${b.label || 'このセクション'}について書いてみましょう`,
        })),
        noExperiences: experiencesForPrompt.length === 0,
      };
    }

    // noExperiences フラグを追加
    parsed.noExperiences = experiencesForPrompt.length === 0;

    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'サーバーエラーが発生しました';
    console.error('AI hints error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

