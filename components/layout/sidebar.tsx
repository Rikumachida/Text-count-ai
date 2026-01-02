'use client';

import { useState } from 'react';
import { 
  FileText, 
  Layout, 
  Sparkles,
  Plus,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { LoginModal } from '@/components/auth/login-modal';
import { useSidebarStore } from '@/lib/stores/sidebar-store';

const navItems = [
  { href: '/documents', label: 'ドキュメント', icon: FileText },
  { href: '/templates', label: 'テンプレート', icon: Layout },
  { href: '/experiences', label: '経験データ', icon: Sparkles },
];

export function Sidebar() {
  const { data: session, isPending } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // グローバルな折りたたみ状態
  const { isCollapsed, toggle, setCollapsed } = useSidebarStore();

  const [isCreating, setIsCreating] = useState(false);

  const handleNewDocument = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '',
          targetCharCount: 1000,
          writingMode: 'formal',
        }),
      });

      if (!response.ok) {
        throw new Error('ドキュメントの作成に失敗しました');
      }

      const data = await response.json();
      router.push(`/editor/${data.id}`);
      setIsMobileOpen(false);
    } catch (error) {
      console.error('Error creating document:', error);
      alert('ドキュメントの作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // ロゴクリック時の処理
  const handleLogoClick = (e: React.MouseEvent) => {
    if (isCollapsed) {
      e.preventDefault();
      setCollapsed(false);
    } else {
      setIsMobileOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className={`flex h-14 items-center px-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {/* Logo */}
        <Link 
          href="/" 
          className="group relative flex items-center" 
          onClick={handleLogoClick}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          {isCollapsed ? (
            <div className="relative flex h-8 w-8 items-center justify-center">
              {/* シンボルマーク - 折りたたみ時 */}
              <Image
                src="/logos/symbolmark.svg"
                alt="Contäx"
                width={32}
                height={32}
                className={`transition-opacity ${isLogoHovered ? 'opacity-0' : 'opacity-100'}`}
              />
              {/* ホバー時に矢印表示 */}
              <ChevronRight className={`absolute h-5 w-5 text-[var(--primary)] transition-opacity ${isLogoHovered ? 'opacity-100' : 'opacity-0'}`} />
            </div>
          ) : (
            <Image
              src="/logos/logo.svg"
              alt="Contäx"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          )}
        </Link>
        
        {/* Collapse button - 展開時のみ表示 */}
        {!isCollapsed && (
          <button
            onClick={toggle}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* New Document Button */}
      <div className="px-3 py-2">
        <button
          onClick={handleNewDocument}
          disabled={isCreating}
          className={`flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-medium transition-all hover:bg-[var(--muted)] disabled:opacity-50 ${isCollapsed ? 'justify-center' : ''}`}
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {!isCollapsed && <span>{isCreating ? '作成中...' : '新規ドキュメント'}</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                active
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-3">
        {isPending ? (
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--muted)]" />
            {!isCollapsed && <div className="h-4 w-24 animate-pulse rounded bg-[var(--muted)]" />}
          </div>
        ) : session ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-3 rounded-xl transition-colors hover:bg-[var(--muted)] ${isCollapsed ? 'justify-center p-1.5' : 'w-full px-2 py-2'}`}
            >
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt="" 
                  className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)]/20 text-[var(--primary)]">
                  {session.user.name?.charAt(0) || 'U'}
                </div>
              )}
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium truncate max-w-[140px]">
                    {session.user.name}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] truncate max-w-[140px]">
                    {session.user.email}
                  </div>
                </div>
              )}
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsUserMenuOpen(false)} 
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 z-50 rounded-xl border bg-[var(--background)] p-1 shadow-lg">
                  <Link
                    href="/settings"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsMobileOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--muted)]"
                  >
                    <Settings className="h-4 w-4" />
                    設定
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    ログアウト
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 ${isCollapsed ? 'px-2' : ''}`}
          >
            {!isCollapsed && <span>ログイン</span>}
            {isCollapsed && (
              <Image
                src="/logos/symbolmark.svg"
                alt=""
                width={20}
                height={20}
                className="brightness-0 invert"
              />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b bg-[var(--background)] px-4 lg:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--muted)]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/logo.svg"
            alt="Contäx"
            width={100}
            height={28}
            className="h-7 w-auto"
          />
        </Link>
        <div className="w-9" /> {/* Spacer */}
      </header>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-50 hidden h-full border-r bg-[var(--background)] transition-all duration-300 lg:block ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-50 h-full w-72 border-r bg-[var(--background)] transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--muted)]"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

// Export sidebar widths for layout calculations
export const SIDEBAR_WIDTH = 256; // 16rem = 64 * 4
export const SIDEBAR_COLLAPSED_WIDTH = 64; // 4rem
