'use client';

import { useEditorStore } from '@/stores/editor-store';
import { WritingMode } from '@/types/document';

const modes: { value: WritingMode; label: string; description: string }[] = [
  {
    value: 'casual',
    label: 'カジュアル',
    description: '親しみやすい文体',
  },
  {
    value: 'formal',
    label: 'フォーマル',
    description: '学術的・堅めの文体',
  },
];

export function WritingModeSelector() {
  const { writingMode, setWritingMode } = useEditorStore();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">モード:</label>
      <div className="flex rounded-lg border p-0.5">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => setWritingMode(mode.value)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              writingMode === mode.value
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
            title={mode.description}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}

