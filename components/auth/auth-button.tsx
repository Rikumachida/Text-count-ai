'use client';

import { useSession } from '@/lib/auth-client';
import { LoginButton } from './login-button';
import { UserMenu } from './user-menu';
import { User } from 'lucide-react';

export function AuthButton() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
        <div className="h-4 w-4 animate-pulse rounded bg-[var(--muted)]" />
        <div className="hidden sm:block h-4 w-16 animate-pulse rounded bg-[var(--muted)]" />
      </div>
    );
  }

  if (session) {
    return <UserMenu />;
  }

  return (
    <button
      onClick={() => {}}
      className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
    >
      <User className="h-4 w-4" />
      <span className="hidden sm:inline">ログイン</span>
    </button>
  );
}

// LoginButtonをモーダルやドロップダウンで表示する場合に使用
export function AuthModal() {
  const { data: session } = useSession();

  if (session) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-[var(--background)] p-8 shadow-xl">
        <h2 className="mb-2 text-2xl font-bold">ログイン</h2>
        <p className="mb-6 text-[var(--muted-foreground)]">
          ログインすると、ドキュメントの保存やAI機能が使えます。
        </p>
        <LoginButton className="w-full justify-center" />
      </div>
    </div>
  );
}

