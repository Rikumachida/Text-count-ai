import { auth } from './auth';
import { headers } from 'next/headers';

/**
 * サーバーコンポーネントでセッションを取得
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * 認証済みユーザーを取得（未認証時はnull）
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * 認証必須のページで使用（未認証時はエラー）
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

