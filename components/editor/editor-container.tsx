'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { TargetInput } from './target-input';
import { BlockList } from './block-list';
import { EditorFooter } from './editor-footer';
import { HintsBlock } from './hints-block';

export function EditorContainer() {
  const { calculateBlockTargets } = useEditorStore();

  // Initialize block targets on mount
  useEffect(() => {
    calculateBlockTargets();
  }, [calculateBlockTargets]);

  return (
    <div className="flex h-[calc(100vh-56px)] lg:h-screen flex-col">
      {/* Toolbar - 固定 */}
      <div className="shrink-0 border-b bg-[var(--background)]">
        <div className="flex items-center px-4 py-3">
          <TargetInput />
        </div>
      </div>

      {/* Main content area - 独立スクロール */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile: 縦スクロール1カラム / PC: 横2カラム独立スクロール */}
        <div className="flex w-full flex-col lg:flex-row">
          {/* AI Hints Block - 左側 (PC) / 上部 (モバイル) */}
          <div className="shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r lg:w-[400px] p-4">
            <HintsBlock />
          </div>
          
          {/* Block List - 右側 (PC) / 下部 (モバイル) */}
          <div className="flex-1 overflow-y-auto p-4 pb-8">
            <BlockList />
          </div>
        </div>
      </div>

      {/* Footer - 固定 */}
      <EditorFooter />
    </div>
  );
}
