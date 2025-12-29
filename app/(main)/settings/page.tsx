'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2, User, GraduationCap } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');

  useEffect(() => {
    if (!isPending && !session) router.push('/');
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">設定</h1>
      <p className="mb-6 text-sm text-[var(--muted-foreground)]">
        プロフィール情報は次のフェーズで保存対応します（いまはUIのみ）。
      </p>

      <div className="rounded-2xl border bg-[var(--background)] p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold">プロフィール</h2>
        </div>

        <div className="mb-4 text-sm">
          <div className="font-medium">{session.user.name}</div>
          <div className="text-[var(--muted-foreground)]">{session.user.email}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">大学</label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border bg-[var(--background)] px-3 py-2">
              <GraduationCap className="h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="例: 〇〇大学"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">専攻</label>
            <input
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="例: 経済学"
            />
          </div>
        </div>

        <button
          disabled
          className="mt-4 rounded-lg bg-[var(--muted)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)]"
          title="次のフェーズで保存対応します"
        >
          変更を保存（準備中）
        </button>
      </div>
    </div>
  );
}


