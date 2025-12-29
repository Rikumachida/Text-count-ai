# UIコンポーネント設計書

## 1. デザインシステム

### 1.1 参考デザイン
- [Notion](https://notion.so) - ブロックベースのエディタUI
- [Nani!?](https://nani.now/ja) - クリーンでモダンなAIツールのUI

### 1.2 カラーパレット

```css
:root {
  /* Primary */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-500: #0ea5e9;
  --primary-600: #0284c7;
  --primary-700: #0369a1;

  /* Neutral */
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-300: #d4d4d4;
  --neutral-500: #737373;
  --neutral-700: #404040;
  --neutral-900: #171717;

  /* Semantic */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;

  /* Block Types */
  --block-point: #3b82f6;     /* 青 - 結論 */
  --block-reason: #22c55e;    /* 緑 - 理由 */
  --block-example: #f59e0b;   /* オレンジ - 具体例 */
  --block-background: #8b5cf6;/* 紫 - 背景 */
  --block-problem: #ef4444;   /* 赤 - 課題 */
  --block-solution: #06b6d4;  /* シアン - 解決策 */
}
```

### 1.3 タイポグラフィ

```css
/* フォントファミリー */
--font-sans: 'Noto Sans JP', 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* サイズ */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### 1.4 スペーシング

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
```

---

## 2. 基本UIコンポーネント

### 2.1 Button

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}
```

**バリエーション:**
| Variant | 用途 |
|---------|------|
| primary | メインアクション（保存、AI仕上げ） |
| secondary | サブアクション（キャンセル、エクスポート） |
| ghost | テキストボタン（削除、詳細） |
| danger | 危険なアクション（削除確認） |

---

### 2.2 Input

```tsx
interface InputProps {
  type: 'text' | 'number' | 'email';
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}
```

---

### 2.3 Textarea

```tsx
interface TextareaProps {
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;  // 文字数表示
  disabled?: boolean;
}
```

---

### 2.4 Progress

```tsx
interface ProgressProps {
  value: number;      // 現在値
  max: number;        // 最大値
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}
```

**色の変化:**
- 0-50%: デフォルト（青）
- 50-80%: success（緑）
- 80-100%: warning（オレンジ）
- 100%超: error（赤）

---

### 2.5 Dialog / Modal

```tsx
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}
```

---

### 2.6 Dropdown / Select

```tsx
interface SelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

---

## 3. レイアウトコンポーネント

### 3.1 Header

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] 文字数カウントAI        [ドキュメント ▼] [UserMenu] │
└─────────────────────────────────────────────────────────────┘
```

**要素:**
- ロゴ（ホームへのリンク）
- ドキュメント切り替え（ドロップダウン）
- ユーザーメニュー（アバター、ログアウト）

---

### 3.2 Sidebar（ドキュメント一覧時）

```
┌──────────────────┐
│ 📁 すべて        │
│ 📁 経済学        │
│   └─ 📁 期末     │
│ 📁 経営学        │
│                  │
│ [+ 新規フォルダ] │
└──────────────────┘
```

---

### 3.3 Footer（エディタ内）

```
┌─────────────────────────────────────────────────────────────┐
│ 合計: 1,234 / 2,000文字  ██████████░░░░░ 62%               │
│ [💾 保存] [✨ AI仕上げ] [📋 コピー] [📤 Export ▼]          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. エディタコンポーネント

### 4.1 EditorContainer

メインのエディタラッパー。

```tsx
interface EditorContainerProps {
  document: Document;
  blocks: Block[];
  onSave: () => void;
}
```

---

### 4.2 TargetInput（目標文字数入力）

```
┌─────────────────────────────────────┐
│ 目標文字数: [  2,000  ] 文字        │
└─────────────────────────────────────┘
```

---

### 4.3 WritingModeSelector（執筆モード選択）

```
┌─────────────────────────────────────┐
│ モード: [カジュアル ▼]              │
│         ├─ カジュアル               │
│         └─ フォーマル               │
└─────────────────────────────────────┘
```

---

### 4.4 BlockList（ブロックリスト）

ドラッグ＆ドロップ可能なブロックのリスト。

```tsx
interface BlockListProps {
  blocks: Block[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onBlockUpdate: (id: string, content: string) => void;
  onBlockDelete: (id: string) => void;
}
```

---

### 4.5 BlockItem（ブロックアイテム）

```
┌────────────────────────────────────────────────────────────┐
│ ⋮⋮ 🔵 結論（Point）                      120 / 400文字 ✕ │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [テキストエリア]                                          │
│  私は〇〇だと考える。なぜなら...                           │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ ████████████░░░░░░░░ 30%                                   │
└────────────────────────────────────────────────────────────┘
```

**要素:**
- ドラッグハンドル（⋮⋮）
- ブロックタイプアイコン（色付き）
- ブロックラベル
- 文字数カウント
- 削除ボタン
- テキストエリア
- プログレスゲージ

```tsx
interface BlockItemProps {
  block: Block;
  targetCharCount: number;
  onContentChange: (content: string) => void;
  onDelete: () => void;
  isDragging?: boolean;
}
```

---

### 4.6 BlockPalette（ブロックパレット）

追加可能なブロックタイプの一覧。

```
┌──────────────────┐
│ + ブロック追加   │
├──────────────────┤
│ 🔵 結論          │
│ 🟢 理由          │
│ 🟠 具体例        │
│ 🟣 背景          │
│ 🔴 課題          │
│ 🔷 解決策        │
│ ⚪ カスタム      │
└──────────────────┘
```

```tsx
interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
}
```

---

### 4.7 CharCounter（文字数カウンター）

```tsx
interface CharCounterProps {
  current: number;
  target: number;
  showPercentage?: boolean;
}
```

---

### 4.8 ProgressGauge（進捗ゲージ）

```tsx
interface ProgressGaugeProps {
  current: number;
  target: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}
```

---

## 5. AI機能コンポーネント

### 5.1 ComposeButton（AI仕上げボタン）

```tsx
interface ComposeButtonProps {
  onCompose: () => void;
  loading?: boolean;
  disabled?: boolean;
}
```

---

### 5.2 ComposeResultModal（仕上げ結果モーダル）

```
┌─────────────────────────────────────────────────────────────┐
│ ✨ AI仕上げ結果                                        ✕ │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  私は〇〇だと考える。その理由として、まず第一に...         │
│  ...                                                        │
│  したがって、〇〇であると結論づけることができる。          │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  1,850文字                                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                              [📋 コピー] [✓ 適用] [キャンセル] │
└─────────────────────────────────────────────────────────────┘
```

---

### 5.3 SuggestionPanel（提案パネル）

構成提案・経験提案の表示用。

```
┌─────────────────────────────────────────────────────────────┐
│ 💡 経験の提案                                               │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐│
│ │ サークル活動でのリーダー経験                             ││
│ │ チームワークに関連する経験として活用できます              ││
│ │                                        [挿入] [詳細]     ││
│ └─────────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────────┐│
│ │ インターンシップでの営業経験                             ││
│ │ ...                                                      ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 認証コンポーネント

### 6.1 LoginButton

```tsx
interface LoginButtonProps {
  provider: 'google';
}
```

```
┌─────────────────────────────────────┐
│ [G] Googleでログイン                │
└─────────────────────────────────────┘
```

---

### 6.2 UserMenu

```
┌──────────────────┐
│ [Avatar ▼]       │
├──────────────────┤
│ 山田太郎         │
│ taro@example.com │
│ ──────────────── │
│ 📝 マイドキュメント │
│ 📁 テンプレート   │
│ 💼 経験データ     │
│ ⚙️  設定         │
│ ──────────────── │
│ 🚪 ログアウト    │
└──────────────────┘
```

---

### 6.3 GuestBanner

未ログイン時に表示するバナー。

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ ゲストモードで利用中です。                              │
│    ログインすると保存・AI機能が使えます [ログイン →]       │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. レスポンシブ対応

### 7.1 ブレークポイント

```css
/* Tailwind CSS デフォルト */
sm: 640px   /* モバイル横向き */
md: 768px   /* タブレット */
lg: 1024px  /* デスクトップ */
xl: 1280px  /* ワイドデスクトップ */
```

### 7.2 モバイル対応

**エディタ画面（モバイル）:**
```
┌───────────────────────┐
│ [≡] 文字カウントAI [@]│
├───────────────────────┤
│ 目標: [2,000] 文字    │
│ モード: [カジュアル▼] │
├───────────────────────┤
│ ┌───────────────────┐ │
│ │🔵 結論   120/400  │ │
│ │[テキストエリア]   │ │
│ │████░░░░░ 30%      │ │
│ └───────────────────┘ │
│ ┌───────────────────┐ │
│ │🟢 理由   80/300   │ │
│ │...                │ │
│ └───────────────────┘ │
├───────────────────────┤
│ 合計: 1,234/2,000 62% │
│ [保存] [AI] [📋] [↑] │
└───────────────────────┘
```

**変更点:**
- サイドバー → ハンバーガーメニュー
- BlockPalette → フローティングボタン
- 横並びボタン → アイコンのみ

---

## 8. アニメーション

### 8.1 トランジション

```css
/* 基本トランジション */
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
```

### 8.2 アニメーション例

| 要素 | アニメーション |
|------|---------------|
| ブロック追加 | フェードイン + スライドダウン |
| ブロック削除 | フェードアウト + スライドアップ |
| ドラッグ中 | 影 + 若干の拡大 |
| プログレス更新 | 滑らかな幅変化 |
| モーダル表示 | フェードイン + スケールアップ |
| ボタンホバー | 背景色変化 |

---

## 9. アクセシビリティ

### 9.1 キーボード操作

| キー | 動作 |
|------|------|
| Tab | フォーカス移動 |
| Shift+Tab | 逆方向フォーカス移動 |
| Enter | ボタン実行、モーダル確定 |
| Escape | モーダル閉じる |
| Ctrl+S | 保存 |

### 9.2 ARIA属性

- ドラッグ可能要素: `aria-grabbed`, `aria-dropeffect`
- プログレス: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- モーダル: `role="dialog"`, `aria-modal="true"`

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-25 | 初版作成 |

