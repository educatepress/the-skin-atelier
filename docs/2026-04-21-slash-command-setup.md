# `/reply-draft` Slack Slash Command セットアップ手順

**作成日:** 2026-04-21
**対象:** Dr. Miyaka（Slack ワークスペース管理者）
**所要時間:** 約3分

---

## 前提

- コード実装は完了済み（`src/app/api/slack/reply-draft/route.ts`）
- Vercel にデプロイ済み（`https://skin-atelier.jp` で稼働中）
- Slack App「skin atelier Bot」が既に存在し、Interactivity が ON になっている

---

## 手順

### 1. Slack App ダッシュボードを開く

ブラウザで以下にアクセス:

**https://api.slack.com/apps**

→ 「skin atelier Bot」をクリック

### 2. Slash Command を追加

左メニューから **Slash Commands** → **Create New Command** をクリック

以下を入力:

| 項目 | 値 |
|---|---|
| **Command** | `/reply-draft` |
| **Request URL** | `https://skin-atelier.jp/api/slack/reply-draft` |
| **Short Description** | `X返信案を3種類生成` |
| **Usage Hint** | `[相手のツイート本文]` |

→ **Save** をクリック

### 3. App を再インストール

Slash Command を追加すると、権限スコープが変更されるため再インストールが必要です。

画面上部に **「reinstall your app」** のバナーが表示されるのでクリック。

→ **Allow** をクリックして権限を承認

### 4. 動作確認

Slack の `#skin-atelier_jp` チャンネルで以下を入力:

```
/reply-draft 肌荒れが治らないです…
```

3種類のリプライ案（共感型 / 補足型 / 対話型）が表示されれば成功です。

---

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| 「`dispatch_failed`」エラー | Request URL が正しいか確認。末尾の `/` は不要 |
| 「`This app is not installed in this workspace`」 | 手順3の再インストールが未完了 |
| タイムアウト（何も返ってこない） | Gemini API キーが Vercel 環境変数に設定されているか確認 |
