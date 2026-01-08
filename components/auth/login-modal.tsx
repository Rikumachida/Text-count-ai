'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { signIn } from '@/lib/auth-client';
import Image from 'next/image';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: '/icons/icon-lightbulb-3d.png',
    label: 'AIヒント生成',
    bgColor: '#F4E9FF',
  },
  {
    icon: '/icons/icon-chart-3d.png',
    label: '文字数の管理',
    bgColor: '#D6EFFF',
  },
  {
    icon: '/icons/icon-pencil-3d.png',
    label: 'AI文章作成',
    bgColor: '#FFEDE9',
  },
  {
    icon: '/icons/icon-cards-3d.png',
    label: '文章の構造化',
    bgColor: '#FFF9E9',
  },
];

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
      <div className="relative w-full max-w-[424px] mx-4 rounded-2xl bg-white p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header with Symbol and Text */}
        <div className="flex flex-col items-center gap-[21px] mb-8">
          {/* Symbolmark */}
          <div className="flex items-center justify-center">
            <Image
              src="/icons/symbolmark.svg"
              alt="Contäx"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-center gap-3.5 w-full">
            <h2 className="text-[28px] font-medium tracking-tight text-black text-center">
              Contäxにログイン
            </h2>
            <p className="text-[17.5px] leading-[1.4] tracking-tight text-[#696969] text-center max-w-[290px]">
              ログインするとドキュメントの保存やAI機能が使えます
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
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

        {/* Features Section */}
        <div className="mt-10">
          <p className="text-[13.5px] leading-[1.8] tracking-tight text-[#696969] text-center mb-2">
            ログインすると利用できる機能
          </p>
          <div className="grid grid-cols-2 gap-[5px]">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-md bg-[#F8F8F8] py-2 pl-2 pr-2"
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <Image
                    src={feature.icon}
                    alt={feature.label}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </div>
                <span className="text-[13.5px] font-semibold text-[#332A3C]">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <p className="mt-10 text-[13.5px] leading-[1.8] tracking-tight text-[#696969] text-center">
          ログインすることで、
          <a href="#" className="underline hover:text-gray-800">
            利用規約
          </a>
          と
          <a href="#" className="underline hover:text-gray-800">
            プライバシーポリシー
          </a>
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
