'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2, User, GraduationCap, Save, Check, AlertCircle } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  name: string;
  image: string | null;
  university: string | null;
  major: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // プロフィール取得
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/users/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setUniversity(data.university || '');
        setMajor(data.major || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/');
    } else if (session) {
      fetchProfile();
    }
  }, [session, isPending, router, fetchProfile]);

  // プロフィール保存
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ university, major }),
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const error = await res.json();
        setErrorMessage(error.error || '保存に失敗しました');
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setErrorMessage('ネットワークエラーが発生しました');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // 変更があるかチェック
  const hasChanges = profile && (
    university !== (profile.university || '') ||
    major !== (profile.major || '')
  );

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">設定</h1>

      {/* プロフィールカード */}
      <div className="rounded-2xl border bg-[var(--background)] p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10">
            <User className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">プロフィール</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              あなたの情報を設定します
            </p>
          </div>
        </div>

        {/* 基本情報（読み取り専用） */}
        <div className="mb-6 rounded-xl bg-[var(--muted)]/30 p-4">
          <div className="flex items-center gap-4">
            {session.user.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || ''} 
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/20">
                <User className="h-8 w-8 text-[var(--primary)]" />
              </div>
            )}
            <div>
              <div className="text-lg font-medium">{session.user.name}</div>
              <div className="text-sm text-[var(--muted-foreground)]">{session.user.email}</div>
              <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                Googleアカウントで連携中
              </div>
            </div>
          </div>
        </div>

        {/* 編集可能なフィールド */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">大学</label>
            <div className="flex items-center gap-2 rounded-xl border bg-[var(--background)] px-4 py-3 transition-colors focus-within:border-[var(--primary)]">
              <GraduationCap className="h-5 w-5 text-[var(--muted-foreground)]" />
              <input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                placeholder="例: 〇〇大学"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">学部・専攻</label>
            <input
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full rounded-xl border bg-[var(--background)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
              placeholder="例: 経済学部 経営学科"
            />
          </div>
        </div>

        {/* エラーメッセージ */}
        {saveStatus === 'error' && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </div>
        )}

        {/* 保存ボタン */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check className="h-4 w-4" />
                保存しました
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                変更を保存
              </>
            )}
          </button>

          {!hasChanges && saveStatus !== 'success' && (
            <span className="text-sm text-[var(--muted-foreground)]">
              変更はありません
            </span>
          )}
        </div>
      </div>

      {/* アカウント情報 */}
      <div className="mt-6 rounded-2xl border bg-[var(--background)] p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">アカウント情報</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">アカウント作成日</span>
            <span>
              {profile?.createdAt 
                ? new Date(profile.createdAt).toLocaleDateString('ja-JP')
                : '-'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">認証方法</span>
            <span>Google OAuth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
