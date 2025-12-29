'use client';

import { useEffect, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ComposeResultModalProps {
  open: boolean;
  onClose: () => void;
  text: string;
  charCount: number;
}

export function ComposeResultModal({ open, onClose, text, charCount }: ComposeResultModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!open) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative mx-4 w-full max-w-2xl rounded-2xl bg-[var(--background)] shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">✨ AI仕上げ結果</h2>
            <p className="text-xs text-[var(--muted-foreground)]">{charCount.toLocaleString()}文字</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto px-6 py-4">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{text}</div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              copied ? 'bg-[var(--success)] text-white' : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'コピーしました' : 'コピー'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-[var(--muted)]"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}


