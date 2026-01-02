'use client';

import { useSidebarStore } from '@/lib/stores/sidebar-store';

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div 
      className={`min-h-screen pt-14 lg:pt-0 transition-all duration-300 ${
        isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}
    >
      {children}
    </div>
  );
}

