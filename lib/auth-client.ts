'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // 同一オリジンからAPIを呼び出すため、baseURLは設定しない
  // これにより、Vercelのプレビューデプロイでも正しく動作する
});

export const { signIn, signOut, useSession } = authClient;

