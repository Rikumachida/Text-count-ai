'use client';

import { useState } from 'react';
import { PenLine } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { UserMenu } from '@/components/auth/user-menu';
import { LoginModal } from '@/components/auth/login-modal';

export function Header() {
  const { data: session, isPending } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/documents', label: 'ドキュメント' },
    { href: '/templates', label: 'テンプレート' },
    { href: '/experiences', label: '経験' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
              <PenLine className="h-4 w-4" />
            </div>
            <span className="text-lg">文字数カウントAI</span>
          </Link>

          {/* Nav (logged-in) */}
          {!isPending && session && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? 'bg-[var(--muted)] text-[var(--foreground)]'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Guest banner */}
            {!isPending && !session && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <span>ゲストモードで利用中</span>
              </div>
            )}

            {/* Auth */}
            {isPending ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--muted)]" />
            ) : session ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-1.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
