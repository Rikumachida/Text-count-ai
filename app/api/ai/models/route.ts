import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';

export async function GET() {
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

  const url = new URL('https://generativelanguage.googleapis.com/v1beta/models');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString(), { method: 'GET' });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      {
        error: {
          code: 'GEMINI_ERROR',
          message: data?.error?.message || `Gemini ListModels error: ${res.status} ${res.statusText}`,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}


