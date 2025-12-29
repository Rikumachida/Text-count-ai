'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { TargetInput } from './target-input';
import { WritingModeSelector } from './writing-mode-selector';
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
    <div className="flex min-h-screen flex-col">
      {/* Toolbar */}
      <div className="sticky top-14 z-40 border-b bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <TargetInput />
          <WritingModeSelector />
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto flex-1 px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          {/* AI Hints Block - Left side on PC, Top on mobile */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <HintsBlock />
          </div>
          
          {/* Block List - Right side on PC */}
          <div>
            <BlockList />
          </div>
        </div>
      </main>

      {/* Footer with progress and actions */}
      <EditorFooter />
    </div>
  );
}

