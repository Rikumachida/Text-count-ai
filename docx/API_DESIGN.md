# API設計書

## 1. 概要

- **ベースURL**: `/api`
- **認証**: BetterAuth (セッションベース)
- **レスポンス形式**: JSON

---

## 2. 認証 API

### 2.1 BetterAuth エンドポイント

BetterAuthが自動的に以下のエンドポイントを提供：

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/auth/session` | 現在のセッション取得 |
| POST | `/api/auth/sign-in/social` | ソーシャルログイン |
| POST | `/api/auth/sign-out` | ログアウト |
| GET | `/api/auth/callback/google` | Google OAuthコールバック |

---

## 3. ドキュメント API

### 3.1 ドキュメント一覧取得

```
GET /api/documents
```

**認証**: 必須

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| folderId | string | No | フォルダでフィルタ |
| limit | number | No | 取得件数 (default: 20) |
| offset | number | No | オフセット |

**レスポンス**:
```json
{
  "documents": [
    {
      "id": "doc-123",
      "title": "レポート課題1",
      "targetCharCount": 2000,
      "folderId": "folder-456",
      "createdAt": "2025-12-25T10:00:00Z",
      "updatedAt": "2025-12-25T12:00:00Z",
      "charCount": 1500
    }
  ],
  "total": 15
}
```

---

### 3.2 ドキュメント作成

```
POST /api/documents
```

**認証**: 必須

**リクエストボディ**:
```json
{
  "title": "新規レポート",
  "targetCharCount": 2000,
  "folderId": "folder-456",
  "templateId": "preset-prep"
}
```

**レスポンス**:
```json
{
  "id": "doc-789",
  "title": "新規レポート",
  "targetCharCount": 2000,
  "folderId": "folder-456",
  "blocks": [
    { "id": "block-1", "type": "point", "label": "結論", "content": "", "order": 0 },
    { "id": "block-2", "type": "reason", "label": "理由", "content": "", "order": 1 },
    { "id": "block-3", "type": "example", "label": "具体例", "content": "", "order": 2 },
    { "id": "block-4", "type": "point", "label": "結論", "content": "", "order": 3 }
  ],
  "createdAt": "2025-12-25T10:00:00Z"
}
```

---

### 3.3 ドキュメント取得

```
GET /api/documents/:id
```

**認証**: 必須（自分のドキュメントのみ）

**レスポンス**:
```json
{
  "id": "doc-123",
  "title": "レポート課題1",
  "targetCharCount": 2000,
  "folderId": "folder-456",
  "blocks": [
    {
      "id": "block-1",
      "type": "point",
      "label": "結論",
      "content": "私は〇〇だと考える。",
      "order": 0,
      "targetCharCount": 400
    }
  ],
  "createdAt": "2025-12-25T10:00:00Z",
  "updatedAt": "2025-12-25T12:00:00Z"
}
```

---

### 3.4 ドキュメント更新

```
PUT /api/documents/:id
```

**認証**: 必須

**リクエストボディ**:
```json
{
  "title": "更新されたタイトル",
  "targetCharCount": 2500,
  "folderId": "folder-789",
  "blocks": [
    {
      "id": "block-1",
      "type": "point",
      "label": "結論",
      "content": "更新された内容",
      "order": 0
    }
  ]
}
```

**レスポンス**:
```json
{
  "id": "doc-123",
  "title": "更新されたタイトル",
  "updatedAt": "2025-12-25T14:00:00Z"
}
```

---

### 3.5 ドキュメント削除

```
DELETE /api/documents/:id
```

**認証**: 必須

**レスポンス**:
```json
{
  "success": true
}
```

---

## 4. ブロック API

### 4.1 ブロック追加

```
POST /api/documents/:documentId/blocks
```

**認証**: 必須

**リクエストボディ**:
```json
{
  "type": "background",
  "label": "背景",
  "order": 0
}
```

**レスポンス**:
```json
{
  "id": "block-new",
  "type": "background",
  "label": "背景",
  "content": "",
  "order": 0,
  "targetCharCount": 200
}
```

---

### 4.2 ブロック更新

```
PUT /api/documents/:documentId/blocks/:blockId
```

**認証**: 必須

**リクエストボディ**:
```json
{
  "content": "更新されたブロック内容",
  "label": "カスタムラベル"
}
```

---

### 4.3 ブロック削除

```
DELETE /api/documents/:documentId/blocks/:blockId
```

**認証**: 必須

---

### 4.4 ブロック並び替え

```
PUT /api/documents/:documentId/blocks/reorder
```

**認証**: 必須

**リクエストボディ**:
```json
{
  "blockIds": ["block-2", "block-1", "block-3", "block-4"]
}
```

---

## 5. フォルダ API

### 5.1 フォルダ一覧取得

```
GET /api/folders
```

**認証**: 必須

**レスポンス**:
```json
{
  "folders": [
    {
      "id": "folder-1",
      "name": "経済学",
      "parentId": null,
      "documentCount": 5
    },
    {
      "id": "folder-2",
      "name": "期末レポート",
      "parentId": "folder-1",
      "documentCount": 2
    }
  ]
}
```

---

### 5.2 フォルダ作成

```
POST /api/folders
```

**リクエストボディ**:
```json
{
  "name": "新しいフォルダ",
  "parentId": null
}
```

---

### 5.3 フォルダ更新・削除

```
PUT /api/folders/:id
DELETE /api/folders/:id
```

---

## 6. テンプレート API

### 6.1 テンプレート一覧取得

```
GET /api/templates
```

**認証**: オプション（未認証でもプリセット取得可）

**クエリパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| includePresets | boolean | プリセットを含めるか (default: true) |

**レスポンス**:
```json
{
  "templates": [
    {
      "id": "preset-prep",
      "name": "PREP法",
      "description": "結論→理由→具体例→結論の構成",
      "isPreset": true,
      "blocks": [...]
    },
    {
      "id": "user-template-1",
      "name": "マイテンプレート",
      "isPreset": false,
      "blocks": [...]
    }
  ]
}
```

---

### 6.2 テンプレート作成

```
POST /api/templates
```

**認証**: 必須

**リクエストボディ**:
```json
{
  "name": "問題解決型",
  "description": "課題→原因→解決策の構成",
  "blocks": [
    { "type": "problem", "label": "課題", "ratio": 0.3 },
    { "type": "reason", "label": "原因", "ratio": 0.3 },
    { "type": "solution", "label": "解決策", "ratio": 0.4 }
  ]
}
```

---

## 7. 経験 API

### 7.1 経験一覧取得

```
GET /api/experiences
```

**認証**: 必須

**クエリパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| source | string | 'auto' / 'manual' でフィルタ |
| category | string | カテゴリでフィルタ |

---

### 7.2 経験作成（手動登録）

```
POST /api/experiences
```

**認証**: 必須

**リクエストボディ**:
```json
{
  "title": "サークル活動でのリーダー経験",
  "content": "大学2年時に...",
  "category": "リーダーシップ"
}
```

---

### 7.3 経験更新・削除

```
PUT /api/experiences/:id
DELETE /api/experiences/:id
```

---

## 8. AI API

### 8.1 文章仕上げ

```
POST /api/ai/compose
```

**認証**: 必須

**リクエストボディ**:
```json
{
  "blocks": [
    { "type": "point", "content": "私は〇〇だと考える。" },
    { "type": "reason", "content": "なぜなら..." },
    { "type": "example", "content": "例えば..." },
    { "type": "point", "content": "したがって..." }
  ],
  "mode": "formal",
  "targetCharCount": 2000
}
```

**mode**:
- `casual`: カジュアルモード
- `formal`: フォーマルモード

**レスポンス**:
```json
{
  "composedText": "私は〇〇だと考える。その理由として、...",
  "charCount": 1850
}
```

---

### 8.2 構成提案

```
POST /api/ai/suggest-structure
```

**認証**: 必須

**リクエストボディ**:
```json
{
  "theme": "環境問題と企業の責任について",
  "targetCharCount": 2000
}
```

**レスポンス**:
```json
{
  "suggestions": [
    {
      "name": "PREP法",
      "blocks": [
        { "type": "point", "label": "結論", "suggestion": "企業は環境保全に積極的に取り組むべきである" },
        { "type": "reason", "label": "理由", "suggestion": "以下の3つの理由から..." }
      ]
    },
    {
      "name": "問題解決型",
      "blocks": [...]
    }
  ]
}
```

---

### 8.3 経験提案

```
POST /api/ai/suggest-experience
```

**認証**: 必須

**リクエストボディ**:
```json
{
  "blockContent": "チームワークの重要性について...",
  "blockType": "example"
}
```

**レスポンス**:
```json
{
  "suggestions": [
    {
      "experienceId": "exp-123",
      "title": "サークル活動でのリーダー経験",
      "relevance": "チームワークに関連する経験として活用できます",
      "excerpt": "大学2年時に..."
    }
  ]
}
```

---

### 8.4 経験抽出（自動蓄積用）

```
POST /api/ai/extract-experience
```

**認証**: 必須（内部API）

**リクエストボディ**:
```json
{
  "documentId": "doc-123",
  "blocks": [...]
}
```

**レスポンス**:
```json
{
  "extractedExperiences": [
    {
      "title": "インターンシップでの営業経験",
      "content": "...",
      "category": "ビジネス"
    }
  ]
}
```

---

## 9. ユーザー API

### 9.1 プロフィール取得

```
GET /api/user/profile
```

**認証**: 必須

---

### 9.2 プロフィール更新

```
PUT /api/user/profile
```

**認証**: 必須

**リクエストボディ**:
```json
{
  "name": "山田太郎",
  "university": "東京大学",
  "major": "経済学部"
}
```

---

## 10. エラーレスポンス

### 形式

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です"
  }
}
```

### エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| UNAUTHORIZED | 401 | 認証が必要 |
| FORBIDDEN | 403 | アクセス権限なし |
| NOT_FOUND | 404 | リソースが見つからない |
| VALIDATION_ERROR | 400 | バリデーションエラー |
| INTERNAL_ERROR | 500 | サーバーエラー |
| RATE_LIMIT | 429 | レート制限 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-25 | 初版作成 |

