# Next.js App Router ベストプラクティス

## 1. 概要

Next.js 13.4以降で正式リリースされたApp Routerは、React Server Componentsをデフォルトで採用した新しいルーティングシステムです。このドキュメントでは、App Routerを使用した開発におけるベストプラクティスをまとめます。

**参考資料:**
- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [Next.js App Routerの基礎](https://blog.techscore.com/entry/2025/06/27/080000)

---

## 2. Server Components vs Client Components

### 2.1 基本原則

App Routerでは、**すべてのコンポーネントがデフォルトでServer Component**です。

```
┌─────────────────────────────────────────────────────────────┐
│                    Server Components                        │
│  ✅ データベースアクセス                                    │
│  ✅ 機密情報（APIキー等）の使用                            │
│  ✅ 大きな依存関係の使用（バンドルに含まれない）           │
│  ✅ SEO対策                                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Client Components                        │
│  ✅ インタラクティブなUI（onClick, onChange等）            │
│  ✅ React Hooks（useState, useEffect等）                   │
│  ✅ ブラウザAPI（localStorage, window等）                  │
│  ✅ サードパーティUIライブラリ                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 使い分けの判断フロー

```
コンポーネントを作成する
         ↓
インタラクティブ機能が必要？
    ├─ No → Server Component（デフォルト）
    └─ Yes → "use client" を追加
         ↓
useStateやuseEffectが必要？
    ├─ No → Server Component
    └─ Yes → "use client" を追加
         ↓
ブラウザAPIが必要？
    ├─ No → Server Component
    └─ Yes → "use client" を追加
```

### 2.3 ベストプラクティス

```tsx
// ❌ Bad: 全体をClient Componentにしてしまう
"use client";

export default function Page() {
  const [count, setCount] = useState(0);
  const data = await fetchData(); // エラー！async使えない
  
  return (
    <div>
      <h1>{data.title}</h1>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
    </div>
  );
}
```

```tsx
// ✅ Good: Server Componentを親に、Client Componentは最小限に
// app/page.tsx (Server Component)
import { Counter } from '@/components/Counter';

export default async function Page() {
  const data = await fetchData(); // サーバーで実行
  
  return (
    <div>
      <h1>{data.title}</h1>
      <Counter /> {/* インタラクティブ部分のみClient */}
    </div>
  );
}

// components/Counter.tsx (Client Component)
"use client";

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

---

## 3. ディレクトリ構成のベストプラクティス

### 3.1 推奨構成

```
app/
├── (auth)/                    # ルートグループ（URLに影響しない）
│   ├── login/
│   │   └── page.tsx
│   └── layout.tsx             # 認証ページ共通レイアウト
│
├── (main)/                    # メインアプリのルートグループ
│   ├── dashboard/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── layout.tsx             # メインアプリ共通レイアウト
│
├── api/                       # API Routes
│   └── [...]/
│       └── route.ts
│
├── layout.tsx                 # ルートレイアウト
├── page.tsx                   # ホームページ
├── loading.tsx                # グローバルローディング
├── error.tsx                  # グローバルエラー
├── not-found.tsx              # 404ページ
└── globals.css
```

### 3.2 特殊ファイル

| ファイル名 | 用途 |
|-----------|------|
| `page.tsx` | ルートのUIを定義 |
| `layout.tsx` | 共有レイアウト（子ルートで維持） |
| `template.tsx` | 再レンダリングされるレイアウト |
| `loading.tsx` | Suspenseのローディング状態 |
| `error.tsx` | エラーバウンダリ |
| `not-found.tsx` | 404ページ |
| `route.ts` | API エンドポイント |

### 3.3 ルートグループ `(folder)`

URLに影響を与えずにルートを整理できます。

```
app/
├── (marketing)/           # URLには含まれない
│   ├── about/
│   │   └── page.tsx      # → /about
│   └── contact/
│       └── page.tsx      # → /contact
│
└── (app)/                 # URLには含まれない
    ├── dashboard/
    │   └── page.tsx      # → /dashboard
    └── settings/
        └── page.tsx      # → /settings
```

---

## 4. データフェッチング

### 4.1 Server Componentでのフェッチ

```tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    // キャッシュオプション
    cache: 'force-cache',      // 静的（デフォルト）
    // cache: 'no-store',      // 動的（毎回フェッチ）
    // next: { revalidate: 60 } // 60秒でrevalidate
  });
  
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### 4.2 並列データフェッチ

```tsx
// ✅ Good: 並列でフェッチ
async function Page() {
  // 同時に開始
  const postsPromise = getPosts();
  const usersPromise = getUsers();
  
  // 両方の完了を待つ
  const [posts, users] = await Promise.all([postsPromise, usersPromise]);
  
  return <div>...</div>;
}
```

```tsx
// ❌ Bad: 直列でフェッチ（遅い）
async function Page() {
  const posts = await getPosts();  // 完了を待つ
  const users = await getUsers();  // その後開始
  
  return <div>...</div>;
}
```

### 4.3 Client Componentでのフェッチ

```tsx
"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useSWR(
    `/api/users/${userId}`,
    fetcher
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;
  
  return <div>{data.name}</div>;
}
```

---

## 5. Server Actions

### 5.1 基本的な使い方

```tsx
// app/actions.ts
"use server";

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  
  // データベースに保存
  await db.posts.create({ title, content });
  
  // キャッシュを更新
  revalidatePath('/posts');
}
```

```tsx
// app/posts/new/page.tsx
import { createPost } from '@/app/actions';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" />
      <textarea name="content" placeholder="Content" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### 5.2 Client Componentから呼び出す

```tsx
"use client";

import { createPost } from '@/app/actions';
import { useTransition } from 'react';

export function CreatePostForm() {
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await createPost(formData);
    });
  };
  
  return (
    <form action={handleSubmit}>
      <input name="title" disabled={isPending} />
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

---

## 6. キャッシュ戦略

### 6.1 キャッシュの種類

| キャッシュ | 場所 | 用途 |
|-----------|------|------|
| Request Memoization | サーバー | 同一リクエスト内でのfetch重複排除 |
| Data Cache | サーバー | fetchの結果を永続化 |
| Full Route Cache | サーバー | レンダリング済みHTMLをキャッシュ |
| Router Cache | クライアント | ナビゲーション時のRSCペイロード |

### 6.2 キャッシュ制御

```tsx
// 静的（ビルド時に生成、デフォルト）
fetch('https://api.example.com/data', { cache: 'force-cache' });

// 動的（毎回フェッチ）
fetch('https://api.example.com/data', { cache: 'no-store' });

// ISR（指定秒数でrevalidate）
fetch('https://api.example.com/data', { next: { revalidate: 60 } });

// タグベースのrevalidation
fetch('https://api.example.com/data', { next: { tags: ['posts'] } });

// 手動でrevalidate
import { revalidateTag, revalidatePath } from 'next/cache';
revalidateTag('posts');
revalidatePath('/posts');
```

---

## 7. Middleware

### 7.1 基本的な使い方

```tsx
// middleware.ts（プロジェクトルート）
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 認証チェック
  const token = request.cookies.get('session');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// マッチするパスを指定
export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
};
```

### 7.2 パスのマッチング

```tsx
export const config = {
  matcher: [
    // 特定のパス
    '/dashboard/:path*',
    
    // 複数のパス
    '/api/:path*',
    
    // 除外パターン
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 8. エラーハンドリング

### 8.1 Error Boundary

```tsx
// app/dashboard/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### 8.2 Not Found

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

// 手動で404を返す
import { notFound } from 'next/navigation';

async function Page({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);
  
  if (!post) {
    notFound();
  }
  
  return <div>{post.title}</div>;
}
```

---

## 9. パフォーマンス最適化

### 9.1 コンポーネントの遅延読み込み

```tsx
import dynamic from 'next/dynamic';

// 重いコンポーネントを遅延読み込み
const HeavyEditor = dynamic(() => import('@/components/HeavyEditor'), {
  loading: () => <p>Loading editor...</p>,
  ssr: false, // クライアントのみでレンダリング
});
```

### 9.2 Suspenseの活用

```tsx
import { Suspense } from 'react';

async function SlowComponent() {
  const data = await slowFetch();
  return <div>{data}</div>;
}

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading stats...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
```

### 9.3 画像の最適化

```tsx
import Image from 'next/image';

export function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={100}
      height={100}
      priority={false}      // LCPに影響する画像はtrue
      placeholder="blur"    // ブラー効果
      blurDataURL="..."     // base64のプレースホルダー
    />
  );
}
```

---

## 10. 本プロジェクトでの適用

### 10.1 Server Component として実装するもの

- ページコンポーネント（`page.tsx`）
- レイアウト（`layout.tsx`）
- ドキュメント一覧の取得
- テンプレート一覧の取得
- ユーザープロフィールの取得

### 10.2 Client Component として実装するもの

- エディタ（ドラッグ＆ドロップ、リアルタイム入力）
- 文字数カウンター（リアルタイム更新）
- AI機能のUI（ローディング状態、結果表示）
- フォーム入力（目標文字数、モード選択）
- 認証UI（ログインボタン、ユーザーメニュー）

### 10.3 境界の設計

```
app/
└── editor/
    └── page.tsx              # Server Component
        ├── データ取得（ドキュメント、ユーザー）
        └── <EditorContainer />  # Client Component
            ├── ドラッグ＆ドロップ
            ├── リアルタイムカウント
            └── Zustand store
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-25 | 初版作成 |

