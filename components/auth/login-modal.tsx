'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { signIn } from '@/lib/auth-client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
    } catch (err) {
      console.error('Login error:', err);
      setError('ログインに失敗しました。もう一度お試しください。');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-[var(--background)] p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-white">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">ログイン</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            ログインすると、ドキュメントの保存やAI機能が使えます
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span>{isLoading ? 'ログイン中...' : 'Googleでログイン'}</span>
        </button>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <p className="text-center text-xs font-medium text-[var(--muted-foreground)]">
            ログインすると利用できる機能
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-3 py-2">
              <span className="text-lg">💾</span>
              <span>ドキュメント保存</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-3 py-2">
              <span className="text-lg">✨</span>
              <span>AI文章仕上げ</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-3 py-2">
              <span className="text-lg">📁</span>
              <span>フォルダ整理</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-3 py-2">
              <span className="text-lg">📝</span>
              <span>テンプレート</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          ログインすることで、
          <a href="#" className="underline hover:text-[var(--foreground)]">
            利用規約
          </a>
          と
          <a href="#" className="underline hover:text-[var(--foreground)]">
            プライバシーポリシー
          </a>
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}

