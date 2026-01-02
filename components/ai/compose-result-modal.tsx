'use client';

import { useEffect, useState } from 'react';
import { X, Copy, Check, Download, FileText, File, FileDown } from 'lucide-react';

interface ComposeResultModalProps {
  open: boolean;
  onClose: () => void;
  text: string;
  charCount: number;
}

export function ComposeResultModal({ open, onClose, text, charCount }: ComposeResultModalProps) {
  const [copied, setCopied] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setIsEditing(false);
    } else {
      setEditedText(text);
    }
  }, [open, text]);

  if (!open) return null;

  const currentCharCount = editedText.length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExportText = () => {
    const blob = new Blob([editedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contaex-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    // 簡単なWord形式（.docxではなくHTML形式で保存）
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contäx - AI仕上げ結果</title>
</head>
<body>
  <div style="font-family: 'Noto Sans JP', sans-serif; line-height: 1.8; padding: 20px;">
    ${editedText.split('\n').map((line) => `<p style="margin: 0 0 1em 0;">${line || '&nbsp;'}</p>`).join('')}
  </div>
</body>
</html>
    `.trim();

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contaex-${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // PDFはブラウザの印刷機能を使用
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contäx - AI仕上げ結果</title>
  <style>
    body {
      font-family: 'Noto Sans JP', sans-serif;
      line-height: 1.8;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    p {
      margin: 0 0 1em 0;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  ${editedText.split('\n').map((line) => `<p>${line || '&nbsp;'}</p>`).join('')}
</body>
</html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative mx-4 w-full max-w-4xl rounded-2xl bg-[var(--background)] shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">✨ AI仕上げ結果</h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {currentCharCount.toLocaleString()}文字
              {currentCharCount !== charCount && (
                <span className="ml-2 text-violet-600">（編集済み）</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
            >
              {isEditing ? 'プレビュー' : '編集'}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-auto px-6 py-4">
          {isEditing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[400px] w-full resize-none rounded-lg border bg-[var(--background)] px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              placeholder="文章を編集してください..."
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{editedText}</div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t px-6 py-4">
          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportText}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
              title="テキストファイルとしてダウンロード"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">TXT</span>
            </button>
            <button
              onClick={handleExportWord}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
              title="Word形式でダウンロード"
            >
              <File className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Word</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
              title="PDFとして印刷"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                copied
                  ? 'bg-[var(--success)] text-white'
                  : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
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
    </div>
  );
}


