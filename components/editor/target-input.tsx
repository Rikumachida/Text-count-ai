'use client';

import { useEditorStore } from '@/stores/editor-store';

export function TargetInput() {
  const { targetCharCount, setTargetCharCount } = useEditorStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTargetCharCount(value);
    }
  };

  const presets = [500, 1000, 2000, 3000, 5000];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label className="text-sm font-medium">目標文字数:</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={targetCharCount}
          onChange={handleChange}
          min={100}
          step={100}
          className="w-24 rounded-lg border bg-[var(--background)] px-3 py-1.5 text-right text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
        <span className="text-sm text-[var(--muted-foreground)]">文字</span>
      </div>
      
      {/* Presets */}
      <div className="flex gap-1 ml-0 sm:ml-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => setTargetCharCount(preset)}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              targetCharCount === preset
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
            }`}
          >
            {preset.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
}

