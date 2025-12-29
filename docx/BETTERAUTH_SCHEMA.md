# BetterAuth データスキーマ ドキュメント

## 1. 概要

BetterAuthは、TypeScript/JavaScript向けのオープンソース認証ライブラリです。フレームワークに依存せず、様々なデータベースアダプターをサポートしています。

**公式ドキュメント:** https://www.better-auth.com

**本プロジェクトでの構成:**
- 認証方法: Google OAuth
- データベース: Turso (SQLite互換)
- ORM: Drizzle ORM

---

## 2. 必須コアテーブル

BetterAuthを使用する際は、以下の**4つのコアテーブル**を必ず作成する必要があります。

### 2.1 テーブル一覧

| テーブル名 | 説明 |
|-----------|------|
| `user` | ユーザー情報 |
| `session` | セッション管理 |
| `account` | OAuthアカウント連携 |
| `verification` | メール確認トークン等 |

---

## 3. 各テーブルの詳細スキーマ

### 3.1 User テーブル

ユーザーの基本情報を管理します。

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | ✅ | 主キー（UUID推奨） |
| `email` | TEXT | ✅ | メールアドレス（ユニーク） |
| `emailVerified` | BOOLEAN | ✅ | メール確認済みフラグ |
| `name` | TEXT | ✅ | ユーザー名 |
| `image` | TEXT | ❌ | プロフィール画像URL |
| `createdAt` | TIMESTAMP | ✅ | 作成日時 |
| `updatedAt` | TIMESTAMP | ✅ | 更新日時 |

#### Drizzle Schema

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  name: text('name').notNull(),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

---

### 3.2 Session テーブル

ユーザーのログインセッションを管理します。

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | ✅ | 主キー（セッションID） |
| `userId` | TEXT | ✅ | 外部キー → user.id |
| `expiresAt` | TIMESTAMP | ✅ | セッション有効期限 |
| `ipAddress` | TEXT | ❌ | IPアドレス |
| `userAgent` | TEXT | ❌ | ユーザーエージェント |
| `token` | TEXT | ✅ | セッショントークン（ユニーク） |
| `createdAt` | TIMESTAMP | ✅ | 作成日時 |
| `updatedAt` | TIMESTAMP | ✅ | 更新日時 |

#### Drizzle Schema

```typescript
export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

---

### 3.3 Account テーブル

OAuth プロバイダー（Google等）との連携情報を管理します。

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | ✅ | 主キー |
| `userId` | TEXT | ✅ | 外部キー → user.id |
| `accountId` | TEXT | ✅ | プロバイダー側のユーザーID |
| `providerId` | TEXT | ✅ | プロバイダー名（例: "google"） |
| `accessToken` | TEXT | ❌ | アクセストークン |
| `refreshToken` | TEXT | ❌ | リフレッシュトークン |
| `accessTokenExpiresAt` | TIMESTAMP | ❌ | アクセストークン有効期限 |
| `refreshTokenExpiresAt` | TIMESTAMP | ❌ | リフレッシュトークン有効期限 |
| `scope` | TEXT | ❌ | 認可スコープ |
| `idToken` | TEXT | ❌ | IDトークン |
| `password` | TEXT | ❌ | パスワードハッシュ（Email認証用） |
| `createdAt` | TIMESTAMP | ✅ | 作成日時 |
| `updatedAt` | TIMESTAMP | ✅ | 更新日時 |

#### Drizzle Schema

```typescript
export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  idToken: text('idToken'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

---

### 3.4 Verification テーブル

メール確認やパスワードリセット用のトークンを管理します。

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | ✅ | 主キー |
| `identifier` | TEXT | ✅ | 識別子（メールアドレス等） |
| `value` | TEXT | ✅ | トークン値 |
| `expiresAt` | TIMESTAMP | ✅ | 有効期限 |
| `createdAt` | TIMESTAMP | ✅ | 作成日時 |
| `updatedAt` | TIMESTAMP | ✅ | 更新日時 |

#### Drizzle Schema

```typescript
export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
```

---

## 4. カスタムフィールドの追加

本プロジェクトでは、ユーザーに追加のフィールドが必要です。

### 4.1 追加するフィールド

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `university` | TEXT | ❌ | 所属大学 |
| `major` | TEXT | ❌ | 専攻 |

### 4.2 拡張されたUserスキーマ

```typescript
export const user = sqliteTable('user', {
  // BetterAuth 必須フィールド
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  name: text('name').notNull(),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  
  // カスタムフィールド
  university: text('university'),
  major: text('major'),
});
```

### 4.3 BetterAuth設定でのカスタムフィールド

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  
  // カスタムユーザーフィールドを定義
  user: {
    additionalFields: {
      university: {
        type: 'string',
        required: false,
      },
      major: {
        type: 'string',
        required: false,
      },
    },
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

---

## 5. 完全なスキーマファイル

### 5.1 lib/db/schema.ts

```typescript
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================
// BetterAuth Core Tables
// ============================================

/**
 * User テーブル
 * BetterAuthの必須テーブル + カスタムフィールド
 */
export const user = sqliteTable('user', {
  // 必須フィールド
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  name: text('name').notNull(),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  
  // カスタムフィールド
  university: text('university'),
  major: text('major'),
});

/**
 * Session テーブル
 * ユーザーセッション管理
 */
export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('session_userId_idx').on(table.userId),
}));

/**
 * Account テーブル
 * OAuth プロバイダー連携
 */
export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  idToken: text('idToken'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('account_userId_idx').on(table.userId),
}));

/**
 * Verification テーブル
 * メール確認トークン等
 */
export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// ============================================
// Application Tables
// ============================================

// ここにアプリケーション固有のテーブルを追加
// (document, block, folder, template, experience)
```

---

## 6. Google OAuth 設定

### 6.1 Google Cloud Console での設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「認証情報」へ移動
4. 「認証情報を作成」→「OAuth クライアントID」を選択
5. アプリケーションの種類: 「ウェブアプリケーション」
6. 承認済みリダイレクトURI:
   - 開発: `http://localhost:3000/api/auth/callback/google`
   - 本番: `https://your-domain.com/api/auth/callback/google`

### 6.2 環境変数

```env
# .env.local
BETTER_AUTH_SECRET=your-random-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 7. BetterAuth セットアップ

### 7.1 インストール

```bash
npm install better-auth
```

### 7.2 Auth設定ファイル

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  
  emailAndPassword: {
    enabled: false, // Google認証のみ使用
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  
  user: {
    additionalFields: {
      university: {
        type: 'string',
        required: false,
      },
      major: {
        type: 'string',
        required: false,
      },
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7日間
    updateAge: 60 * 60 * 24,     // 1日ごとに更新
  },
});

// 型エクスポート
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

### 7.3 APIルート

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
```

### 7.4 クライアントサイド

```typescript
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signOut, useSession } = authClient;
```

---

## 8. 使用例

### 8.1 ログインボタン

```tsx
"use client";

import { signIn } from '@/lib/auth-client';

export function LoginButton() {
  const handleLogin = async () => {
    await signIn.social({
      provider: 'google',
      callbackURL: '/editor',
    });
  };
  
  return (
    <button onClick={handleLogin}>
      Googleでログイン
    </button>
  );
}
```

### 8.2 セッション取得（Server Component）

```tsx
// app/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function Page() {
  const session = await auth.api.getSession({
    headers: headers(),
  });
  
  if (!session) {
    return <LoginButton />;
  }
  
  return <div>Welcome, {session.user.name}!</div>;
}
```

### 8.3 セッション取得（Client Component）

```tsx
"use client";

import { useSession } from '@/lib/auth-client';

export function UserMenu() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <LoginButton />;
  
  return (
    <div>
      <img src={session.user.image} alt={session.user.name} />
      <span>{session.user.name}</span>
    </div>
  );
}
```

---

## 9. 重要な注意事項

### 9.1 テーブル名について

⚠️ **BetterAuthはテーブル名に厳密です**

以下のテーブル名を**正確に**使用する必要があります：
- `user`（`users` ではない）
- `session`（`sessions` ではない）
- `account`（`accounts` ではない）
- `verification`

### 9.2 カラム名について

⚠️ **カラム名はキャメルケース**

BetterAuthはデフォルトでキャメルケースのカラム名を期待します：
- `emailVerified`（`email_verified` ではない）
- `createdAt`（`created_at` ではない）
- `userId`（`user_id` ではない）

スネークケースを使用したい場合は、アダプター設定でマッピングが必要です。

### 9.3 IDの生成

BetterAuthはデフォルトでUUIDを使用します。必要に応じてカスタムID生成も可能です。

---

## 10. DATABASE_SCHEMA.md との統合

本ドキュメントのBetterAuthスキーマは、`DATABASE_SCHEMA.md` のアプリケーションテーブルと組み合わせて使用します。

```typescript
// 完全なスキーマ構成
export * from './betterauth-schema';  // user, session, account, verification
export * from './app-schema';         // document, block, folder, template, experience
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-25 | 初版作成 |

## 参考資料

- [BetterAuth 公式ドキュメント](https://www.better-auth.com)
- [BetterAuth GitHub](https://github.com/better-auth/better-auth)
- [Better AuthでAstroの認証機能を簡単実装](https://bema.jp/articles/20251210/)

