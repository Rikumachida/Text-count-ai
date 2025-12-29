# データベーススキーマ設計書

## 1. 概要

- **データベース**: Turso (LibSQL / SQLite互換)
- **ORM**: Drizzle ORM
- **スキーマ管理**: Drizzle Kit (マイグレーション)
- **認証**: BetterAuth

> ⚠️ **重要**: BetterAuthのスキーマ要件については `BETTERAUTH_SCHEMA.md` を参照してください。
> テーブル名・カラム名はBetterAuthの規約に従う必要があります。

---

## 2. テーブル一覧

### 2.1 BetterAuth コアテーブル（必須）

| テーブル名 | 説明 | 詳細 |
|-----------|------|------|
| `user` | ユーザー情報 | BETTERAUTH_SCHEMA.md 参照 |
| `session` | セッション管理 | BETTERAUTH_SCHEMA.md 参照 |
| `account` | OAuth連携 | BETTERAUTH_SCHEMA.md 参照 |
| `verification` | トークン管理 | BETTERAUTH_SCHEMA.md 参照 |

### 2.2 アプリケーションテーブル

| テーブル名 | 説明 |
|-----------|------|
| `folder` | フォルダ管理 |
| `document` | ドキュメント |
| `block` | 構成ブロック |
| `template` | テンプレート |
| `experience` | 経験データ |

---

## 3. ER図

```
┌─────────────────┐
│  BetterAuth     │
│  Core Tables    │
├─────────────────┤
│ user            │←─────────────────────────────────────────┐
│ session         │                                          │
│ account         │                                          │
│ verification    │                                          │
└─────────────────┘                                          │
        │                                                    │
        │ userId                                             │
        ↓                                                    │
┌─────────────────┐     ┌─────────────────┐     ┌───────────┴───┐
│    folder       │     │    document     │     │   experience  │
├─────────────────┤     ├─────────────────┤     ├───────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)       │
│ userId (FK)     │←────│ folderId (FK)   │     │ userId (FK)   │
│ name            │     │ userId (FK)     │     │ title         │
│ parentId (FK)───┘     │ title           │     │ content       │
│ createdAt       │     │ targetCharCount │     │ category      │
└─────────────────┘     │ createdAt       │     │ source        │
                        │ updatedAt       │     │ documentId    │
                        └────────┬────────┘     │ createdAt     │
                                 │              │ updatedAt     │
                                 │              └───────────────┘
                                 │ documentId
                                 ↓
                        ┌─────────────────┐     ┌───────────────┐
                        │     block       │     │   template    │
                        ├─────────────────┤     ├───────────────┤
                        │ id (PK)         │     │ id (PK)       │
                        │ documentId (FK) │     │ userId (FK)   │
                        │ type            │     │ name          │
                        │ label           │     │ description   │
                        │ content         │     │ blocks (JSON) │
                        │ order           │     │ isPreset      │
                        │ targetCharCount │     │ createdAt     │
                        └─────────────────┘     └───────────────┘
```

---

## 4. BetterAuth コアテーブル

> 詳細は `BETTERAUTH_SCHEMA.md` を参照

### 4.1 User テーブル

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | ✅ | 主キー（UUID） |
| `email` | TEXT | ✅ | メールアドレス（ユニーク） |
| `emailVerified` | BOOLEAN | ✅ | メール確認済みフラグ |
| `name` | TEXT | ✅ | ユーザー名 |
| `image` | TEXT | ❌ | プロフィール画像URL |
| `createdAt` | TIMESTAMP | ✅ | 作成日時 |
| `updatedAt` | TIMESTAMP | ✅ | 更新日時 |
| `university` | TEXT | ❌ | 大学名（カスタム） |
| `major` | TEXT | ❌ | 専攻（カスタム） |

### 4.2 Session テーブル

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | ✅ | 主キー |
| `userId` | TEXT | ✅ | 外部キー → user.id |
| `expiresAt` | TIMESTAMP | ✅ | セッション有効期限 |
| `token` | TEXT | ✅ | セッショントークン（ユニーク） |
| `ipAddress` | TEXT | ❌ | IPアドレス |
| `userAgent` | TEXT | ❌ | ユーザーエージェント |
| `createdAt` | TIMESTAMP | ✅ | 作成日時 |
| `updatedAt` | TIMESTAMP | ✅ | 更新日時 |

### 4.3 Account テーブル

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | ✅ | 主キー |
| `userId` | TEXT | ✅ | 外部キー → user.id |
| `accountId` | TEXT | ✅ | プロバイダー側のID |
| `providerId` | TEXT | ✅ | プロバイダー名（google） |
| `accessToken` | TEXT | ❌ | アクセストークン |
| `refreshToken` | TEXT | ❌ | リフレッシュトークン |
| `accessTokenExpiresAt` | TIMESTAMP | ❌ | 有効期限 |
| `scope` | TEXT | ❌ | 認可スコープ |
| `createdAt` | TIMESTAMP | ✅ | 作成日時 |
| `updatedAt` | TIMESTAMP | ✅ | 更新日時 |

### 4.4 Verification テーブル

| カラム名 | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | ✅ | 主キー |
| `identifier` | TEXT | ✅ | 識別子 |
| `value` | TEXT | ✅ | トークン値 |
| `expiresAt` | TIMESTAMP | ✅ | 有効期限 |
| `createdAt` | TIMESTAMP | ✅ | 作成日時 |
| `updatedAt` | TIMESTAMP | ✅ | 更新日時 |

---

## 5. アプリケーションテーブル

### 5.1 Folder（フォルダ）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PK | UUID |
| `userId` | TEXT | FK → user.id, NOT NULL | 所有者 |
| `name` | TEXT | NOT NULL | フォルダ名 |
| `parentId` | TEXT | FK → folder.id, NULLABLE | 親フォルダ |
| `createdAt` | INTEGER | NOT NULL | 作成日時 |

```typescript
export const folder = sqliteTable('folder', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  parentId: text('parentId').references(() => folder.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('folder_userId_idx').on(table.userId),
}));
```

---

### 5.2 Document（ドキュメント）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PK | UUID |
| `userId` | TEXT | FK → user.id, NULLABLE | 所有者（ゲストはnull） |
| `title` | TEXT | NOT NULL, DEFAULT '' | タイトル |
| `targetCharCount` | INTEGER | NOT NULL, DEFAULT 1000 | 目標文字数 |
| `folderId` | TEXT | FK → folder.id, NULLABLE | 所属フォルダ |
| `createdAt` | INTEGER | NOT NULL | 作成日時 |
| `updatedAt` | INTEGER | NOT NULL | 更新日時 |

```typescript
export const document = sqliteTable('document', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default(''),
  targetCharCount: integer('targetCharCount').notNull().default(1000),
  folderId: text('folderId').references(() => folder.id, { onDelete: 'set null' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('document_userId_idx').on(table.userId),
  folderIdIdx: index('document_folderId_idx').on(table.folderId),
}));
```

---

### 5.3 Block（構成ブロック）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PK | UUID |
| `documentId` | TEXT | FK → document.id, NOT NULL | 所属ドキュメント |
| `type` | TEXT | NOT NULL | ブロックタイプ |
| `label` | TEXT | NOT NULL | 表示ラベル |
| `content` | TEXT | NOT NULL, DEFAULT '' | テキスト内容 |
| `order` | INTEGER | NOT NULL | 並び順 |
| `targetCharCount` | INTEGER | NOT NULL, DEFAULT 0 | 目標文字数 |

**typeの値:**
| type | 説明 |
|------|------|
| `point` | 結論 |
| `reason` | 理由 |
| `example` | 具体例 |
| `background` | 背景 |
| `problem` | 課題 |
| `solution` | 解決策 |
| `custom` | カスタム |

```typescript
export const block = sqliteTable('block', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull().references(() => document.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  label: text('label').notNull(),
  content: text('content').notNull().default(''),
  order: integer('order').notNull(),
  targetCharCount: integer('targetCharCount').notNull().default(0),
}, (table) => ({
  documentIdIdx: index('block_documentId_idx').on(table.documentId),
}));
```

---

### 5.4 Template（テンプレート）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PK | UUID |
| `userId` | TEXT | FK → user.id, NULLABLE | 所有者（プリセットはnull） |
| `name` | TEXT | NOT NULL | テンプレート名 |
| `description` | TEXT | NULLABLE | 説明 |
| `blocks` | TEXT | NOT NULL | ブロック構成 (JSON) |
| `isPreset` | INTEGER | NOT NULL, DEFAULT 0 | プリセットフラグ |
| `createdAt` | INTEGER | NOT NULL | 作成日時 |

```typescript
export const template = sqliteTable('template', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  blocks: text('blocks').notNull(), // JSON string
  isPreset: integer('isPreset').notNull().default(0),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('template_userId_idx').on(table.userId),
}));
```

**blocks JSON構造:**
```json
[
  { "type": "point", "label": "結論（Point）", "ratio": 0.2 },
  { "type": "reason", "label": "理由（Reason）", "ratio": 0.3 },
  { "type": "example", "label": "具体例（Example）", "ratio": 0.3 },
  { "type": "point", "label": "結論（Point）", "ratio": 0.2 }
]
```

---

### 5.5 Experience（経験）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PK | UUID |
| `userId` | TEXT | FK → user.id, NOT NULL | 所有者 |
| `title` | TEXT | NOT NULL | タイトル |
| `content` | TEXT | NOT NULL | 内容 |
| `category` | TEXT | NULLABLE | カテゴリ |
| `source` | TEXT | NOT NULL | 蓄積方法 |
| `documentId` | TEXT | FK → document.id, NULLABLE | 元ドキュメント |
| `createdAt` | INTEGER | NOT NULL | 作成日時 |
| `updatedAt` | INTEGER | NOT NULL | 更新日時 |

**sourceの値:**
| source | 説明 |
|--------|------|
| `auto` | AI自動抽出 |
| `manual` | 手動登録 |

```typescript
export const experience = sqliteTable('experience', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category'),
  source: text('source').notNull(), // 'auto' | 'manual'
  documentId: text('documentId').references(() => document.id, { onDelete: 'set null' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('experience_userId_idx').on(table.userId),
}));
```

---

## 6. 完全なスキーマファイル

### lib/db/schema.ts

```typescript
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================
// BetterAuth Core Tables
// ============================================

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  name: text('name').notNull(),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  // Custom fields
  university: text('university'),
  major: text('major'),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('session_userId_idx').on(table.userId),
}));

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

export const folder = sqliteTable('folder', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  parentId: text('parentId').references(() => folder.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('folder_userId_idx').on(table.userId),
}));

export const document = sqliteTable('document', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default(''),
  targetCharCount: integer('targetCharCount').notNull().default(1000),
  folderId: text('folderId').references(() => folder.id, { onDelete: 'set null' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('document_userId_idx').on(table.userId),
  folderIdIdx: index('document_folderId_idx').on(table.folderId),
}));

export const block = sqliteTable('block', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull().references(() => document.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  label: text('label').notNull(),
  content: text('content').notNull().default(''),
  order: integer('order').notNull(),
  targetCharCount: integer('targetCharCount').notNull().default(0),
}, (table) => ({
  documentIdIdx: index('block_documentId_idx').on(table.documentId),
}));

export const template = sqliteTable('template', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  blocks: text('blocks').notNull(),
  isPreset: integer('isPreset').notNull().default(0),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('template_userId_idx').on(table.userId),
}));

export const experience = sqliteTable('experience', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category'),
  source: text('source').notNull(),
  documentId: text('documentId').references(() => document.id, { onDelete: 'set null' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('experience_userId_idx').on(table.userId),
}));
```

---

## 7. マイグレーション手順

```bash
# スキーマから差分を生成
npx drizzle-kit generate

# マイグレーション実行
npx drizzle-kit migrate

# スキーマをDBにプッシュ（開発時）
npx drizzle-kit push
```

---

## 8. シードデータ

### PREP法テンプレート（プリセット）

```typescript
const prepTemplate = {
  id: 'preset-prep',
  userId: null,
  name: 'PREP法',
  description: '結論→理由→具体例→結論の構成。説得力のある文章に最適。',
  blocks: JSON.stringify([
    { type: 'point', label: '結論（Point）', ratio: 0.2 },
    { type: 'reason', label: '理由（Reason）', ratio: 0.3 },
    { type: 'example', label: '具体例（Example）', ratio: 0.3 },
    { type: 'point', label: '結論（Point）', ratio: 0.2 },
  ]),
  isPreset: 1,
};
```

---

## 9. 命名規則

> ⚠️ BetterAuthとの整合性のため、以下の命名規則を採用

| 項目 | 規則 | 例 |
|------|------|-----|
| テーブル名 | 単数形、キャメルケース | `user`, `document` |
| カラム名 | キャメルケース | `userId`, `createdAt` |
| 外部キー | `{参照先テーブル}Id` | `userId`, `documentId` |
| インデックス名 | `{テーブル}_{カラム}_idx` | `session_userId_idx` |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-25 | 初版作成 |
| 2025-12-25 | BetterAuthスキーマとの整合性を確保、命名規則を統一 |
