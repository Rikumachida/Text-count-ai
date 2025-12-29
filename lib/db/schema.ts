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
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
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

/**
 * Folder テーブル
 * ドキュメント整理用フォルダ
 */
export const folder = sqliteTable('folder', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  parentId: text('parentId'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('folder_userId_idx').on(table.userId),
}));

/**
 * Document テーブル
 * ユーザーのドキュメント
 */
export const document = sqliteTable('document', {
  id: text('id').primaryKey(),
  userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default(''),
  targetCharCount: integer('targetCharCount').notNull().default(1000),
  writingMode: text('writingMode').notNull().default('formal'),
  folderId: text('folderId').references(() => folder.id, { onDelete: 'set null' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  userIdIdx: index('document_userId_idx').on(table.userId),
  folderIdIdx: index('document_folderId_idx').on(table.folderId),
}));

/**
 * Block テーブル
 * ドキュメントの構成ブロック
 */
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

/**
 * Template テーブル
 * 構成テンプレート
 */
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

/**
 * Experience テーブル
 * ユーザーの経験データ
 */
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

