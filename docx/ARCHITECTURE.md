# アーキテクチャ設計書

## 1. 技術スタック詳細

| カテゴリ | 技術 | バージョン | 備考 |
|---------|------|-----------|------|
| フレームワーク | Next.js | 15.x | App Router |
| 言語 | TypeScript | 5.x | |
| スタイリング | Tailwind CSS | 3.x | |
| 認証 | BetterAuth | latest | Google OAuth |
| データベース | Turso | - | LibSQL (SQLite互換) |
| ORM | Drizzle ORM | latest | |
| AI API | Gemini API | - | Google AI |
| ドラッグ＆ドロップ | dnd-kit | latest | |
| 状態管理 | Zustand | latest | クライアント状態用 |
| バリデーション | Zod | latest | |
| ホスティング | Google Cloud Run | - | コンテナベース |

---

## 2. ディレクトリ構成

```
text-count-ai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認証関連ルート（グループ）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── google/
│   │           └── route.ts
│   │
│   ├── (main)/                   # メインアプリルート（グループ）
│   │   ├── editor/               # エディタ画面
│   │   │   ├── page.tsx          # 新規作成
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 既存編集
│   │   │
│   │   ├── documents/            # ドキュメント一覧
│   │   │   └── page.tsx
│   │   │
│   │   ├── templates/            # テンプレート管理
│   │   │   └── page.tsx
│   │   │
│   │   ├── experiences/          # 経験データ管理
│   │   │   └── page.tsx
│   │   │
│   │   └── settings/             # 設定・プロフィール
│   │       └── page.tsx
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── [...betterauth]/
│   │   │       └── route.ts
│   │   │
│   │   ├── documents/
│   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PUT, DELETE
│   │   │
│   │   ├── blocks/
│   │   │   └── route.ts
│   │   │
│   │   ├── templates/
│   │   │   └── route.ts
│   │   │
│   │   ├── folders/
│   │   │   └── route.ts
│   │   │
│   │   ├── experiences/
│   │   │   └── route.ts
│   │   │
│   │   └── ai/
│   │       ├── compose/          # 文章仕上げ
│   │       │   └── route.ts
│   │       ├── suggest-structure/# 構成提案
│   │       │   └── route.ts
│   │       └── suggest-experience/# 経験提案
│   │           └── route.ts
│   │
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.tsx                  # ランディングページ
│   ├── globals.css
│   └── favicon.ico
│
├── components/                   # 共通コンポーネント
│   ├── ui/                       # 基本UIコンポーネント
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── progress.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── layout/                   # レイアウトコンポーネント
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   │
│   ├── editor/                   # エディタ関連
│   │   ├── editor-container.tsx
│   │   ├── block-list.tsx
│   │   ├── block-item.tsx
│   │   ├── block-palette.tsx     # 追加ブロック選択
│   │   ├── char-counter.tsx
│   │   ├── target-input.tsx
│   │   └── progress-gauge.tsx
│   │
│   ├── ai/                       # AI機能関連
│   │   ├── compose-button.tsx
│   │   ├── writing-mode-selector.tsx
│   │   ├── suggestion-panel.tsx
│   │   └── experience-suggester.tsx
│   │
│   └── auth/                     # 認証関連
│       ├── login-button.tsx
│       ├── user-menu.tsx
│       └── guest-banner.tsx
│
├── lib/                          # ユーティリティ・設定
│   ├── auth.ts                   # BetterAuth設定
│   ├── db/
│   │   ├── index.ts              # Drizzle クライアント
│   │   ├── schema.ts             # スキーマ定義
│   │   └── migrations/           # マイグレーションファイル
│   │
│   ├── ai/
│   │   ├── gemini.ts             # Gemini APIクライアント
│   │   └── prompts.ts            # プロンプトテンプレート
│   │
│   ├── utils/
│   │   ├── char-count.ts         # 文字数カウントロジック
│   │   ├── distribution.ts       # 配分計算ロジック
│   │   └── export.ts             # エクスポート処理
│   │
│   └── constants/
│       ├── block-types.ts        # ブロックタイプ定義
│       └── templates.ts          # プリセットテンプレート
│
├── hooks/                        # カスタムフック
│   ├── use-document.ts
│   ├── use-blocks.ts
│   ├── use-char-count.ts
│   └── use-auth.ts
│
├── stores/                       # Zustand ストア
│   ├── editor-store.ts           # エディタ状態
│   └── ui-store.ts               # UI状態
│
├── types/                        # 型定義
│   ├── document.ts
│   ├── block.ts
│   ├── user.ts
│   └── api.ts
│
├── docx/                         # ドキュメント
│   ├── requirement.md
│   ├── TASKS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DESIGN.md
│   └── UI_COMPONENTS.md
│
├── public/                       # 静的ファイル
│
├── .env.local                    # 環境変数（gitignore）
├── .env.example                  # 環境変数サンプル
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── drizzle.config.ts
└── package.json
```

---

## 3. コンポーネント設計

### 3.1 エディタ画面の構成

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                          [User Menu]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  目標文字数: [____] 文字   モード: [カジュアル ▼]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────┐ ┌─────────┐ │
│  │                                          │ │ ブロック │ │
│  │  Block List (ドラッグ＆ドロップ)          │ │ パレット │ │
│  │                                          │ │         │ │
│  │  ┌────────────────────────────────────┐ │ │ + 背景  │ │
│  │  │ 🔵 結論 (Point)          120/200文字│ │ │ + 課題  │ │
│  │  │ [テキストエリア]                    │ │ │ + 解決策│ │
│  │  │ ████████████░░░░░░ 60%              │ │ │ + Custom│ │
│  │  └────────────────────────────────────┘ │ │         │ │
│  │                                          │ │         │ │
│  │  ┌────────────────────────────────────┐ │ │         │ │
│  │  │ 🟢 理由 (Reason)          80/300文字│ │ │         │ │
│  │  │ [テキストエリア]                    │ │ │         │ │
│  │  │ ███░░░░░░░░░░░░░░ 27%              │ │ │         │ │
│  │  └────────────────────────────────────┘ │ │         │ │
│  │                                          │ │         │ │
│  │  ... (more blocks)                       │ │         │ │
│  │                                          │ │         │ │
│  └──────────────────────────────────────────┘ └─────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  合計: 450/1000文字  ████████░░░░░░░░ 45%            │   │
│  │  [💾 保存] [✨ AI仕上げ] [📋 コピー] [📤 Export ▼]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 コンポーネント階層

```
EditorPage
├── Header
│   └── UserMenu
├── EditorContainer
│   ├── TargetInput (目標文字数)
│   ├── WritingModeSelector (カジュアル/フォーマル)
│   ├── BlockList
│   │   └── BlockItem (複数)
│   │       ├── BlockHeader (タイプ、文字数)
│   │       ├── Textarea
│   │       └── ProgressGauge
│   ├── BlockPalette (追加ブロック)
│   └── EditorFooter
│       ├── TotalCounter
│       ├── TotalProgressGauge
│       ├── SaveButton
│       ├── ComposeButton
│       ├── CopyButton
│       └── ExportMenu
└── GuestBanner (未ログイン時)
```

---

## 4. 状態管理

### 4.1 Zustand Store 構成

```typescript
// stores/editor-store.ts
interface EditorStore {
  // ドキュメント
  documentId: string | null;
  title: string;
  targetCharCount: number;
  
  // ブロック
  blocks: Block[];
  
  // 操作
  setTitle: (title: string) => void;
  setTargetCharCount: (count: number) => void;
  addBlock: (type: BlockType) => void;
  removeBlock: (id: string) => void;
  updateBlockContent: (id: string, content: string) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  
  // 計算値
  getTotalCharCount: () => number;
  getBlockDistribution: () => BlockDistribution[];
}
```

### 4.2 データフロー

```
[User Input]
     ↓
[Zustand Store] ←→ [LocalStorage (Guest)]
     ↓
[API Call] ←→ [Turso DB (Authenticated)]
     ↓
[Server Response]
     ↓
[UI Update]
```

---

## 5. 認証フロー

```
[Landing Page]
     ↓
[Login with Google]
     ↓
[BetterAuth] → [Google OAuth]
     ↓
[Callback] → [Session Created]
     ↓
[Redirect to Editor]
     ↓
[Protected Routes] ← [Middleware Check]
```

---

## 6. AI機能フロー

### 6.1 文章仕上げフロー

```
[User clicks "AI仕上げ"]
     ↓
[Collect all block contents]
     ↓
[API: /api/ai/compose]
     ↓
[Build prompt with mode (casual/formal)]
     ↓
[Gemini API call]
     ↓
[Return composed text]
     ↓
[Display in modal/panel]
     ↓
[User can copy or apply]
```

### 6.2 経験自動蓄積フロー

```
[User saves document]
     ↓
[API: Save document to DB]
     ↓
[API: /api/ai/extract-experience]
     ↓
[Gemini extracts key experiences]
     ↓
[Save to experiences table (source: 'auto')]
     ↓
[Available for future suggestions]
```

---

## 7. 環境変数

```env
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# BetterAuth
BETTER_AUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Turso
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

---

## 8. デプロイメント

### Google Cloud Run 設定

#### 必要なGCPサービス
| サービス | 用途 |
|---------|------|
| Cloud Run | Next.jsアプリのホスティング |
| Artifact Registry | Dockerイメージの保存 |
| Cloud Build | CI/CDパイプライン |
| Secret Manager | 環境変数の安全な管理 |

#### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080

CMD ["node", "server.js"]
```

#### next.config.ts 設定

```typescript
const nextConfig = {
  output: 'standalone',
  // ... other config
};
```

#### Cloud Run デプロイコマンド

```bash
# ビルド & プッシュ
gcloud builds submit --tag gcr.io/PROJECT_ID/text-count-ai

# Cloud Run にデプロイ
gcloud run deploy text-count-ai \
  --image gcr.io/PROJECT_ID/text-count-ai \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-secrets="BETTER_AUTH_SECRET=better-auth-secret:latest,GOOGLE_CLIENT_ID=google-client-id:latest,..."
```

#### CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - id: auth
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - uses: google-github-actions/setup-gcloud@v2
      
      - name: Build and Push
        run: |
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/text-count-ai
      
      - name: Deploy
        run: |
          gcloud run deploy text-count-ai \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/text-count-ai \
            --platform managed \
            --region asia-northeast1 \
            --allow-unauthenticated
```

### ブランチ戦略

```
main (本番)
  ↑
develop (開発)
  ↑
feature/xxx (機能開発)
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-25 | 初版作成 |

