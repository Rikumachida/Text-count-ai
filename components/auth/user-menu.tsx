'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useState, useRef, useEffect } from 'react';
import { User, LogOut, FileText, FolderOpen, Briefcase, Settings } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isPending) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--muted)]" />
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-[var(--muted)]"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
            <User className="h-4 w-4" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border bg-[var(--background)] py-2 shadow-lg">
          {/* User info */}
          <div className="border-b px-4 pb-3 pt-1">
            <p className="font-medium">{session.user.name}</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {session.user.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/documents"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--muted)]"
            >
              <FileText className="h-4 w-4" />
              マイドキュメント
            </Link>
            <Link
              href="/templates"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--muted)]"
            >
              <FolderOpen className="h-4 w-4" />
              テンプレート
            </Link>
            <Link
              href="/experiences"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--muted)]"
            >
              <Briefcase className="h-4 w-4" />
              経験データ
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--muted)]"
            >
              <Settings className="h-4 w-4" />
              設定
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t pt-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--muted)]"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

