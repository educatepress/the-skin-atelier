# ブログ自動投稿パイプライン修正ログ (2026-04-15)

## 背景
ブログ自動投稿がSlackに安定して届かず、パイプライン全体が4/10以降停止していた。

---

## 発見した問題と修正

### P0: Google OAuth トークン自動リフレッシュ未実装
- **ファイル**: `scripts/lib/google-client.ts`
- **問題**: access_token (1時間有効) の期限切れ時に再認証の対話フローに入りハング
- **修正**: 期限切れ検知 → refresh_token で自動更新。Vercel/GitHub Actions (読み取り専用FS) ではファイル保存をスキップしインメモリで継続。サーバーレス環境 (`VERCEL`, `AWS_LAMBDA_FUNCTION_NAME`, `GITHUB_ACTIONS`) での対話認証フローをブロックし明確なエラーを throw。

### P0: Gemini API 503 リトライ不足
- **ファイル**: `scripts/auto-post-blog.ts`
- **問題**: `generateBlogPost()` と `reviewArticle()` に `withRetry` がなく、503 一発で全体が失敗
- **修正**: 全 Gemini API 呼び出しに `withRetry` (5回、指数バックオフ、最大60秒キャップ) を追加。gemini-2.5-flash のみ使用（クオリティ維持）。

### P0: テーマ切れ時の自動生成
- **ファイル**: `scripts/auto-post-blog.ts`
- **問題**: ThemeSchedule にテーマがない場合、ハードコードされたデフォルトテーマで進行（毎回同じ記事）
- **修正**: `autoGenerateThemes()` 関数を追加。テーマがなければ Gemini で10日分を一括生成し ThemeSchedule シートに自動保存
- **最適化**: テーマ取得ロジックを3段階に変更:
  1. 翌日日付の pending テーマがあれば使う
  2. なければ任意の pending テーマを使う（テーマ生成スキップ）
  3. pending テーマが完全にゼロの場合のみ自動生成（503リスクの高い処理を最小化）

### P1: Slack承認 → ブログ投稿のバリデーション不足
- **ファイル**: `src/app/api/slack/interactive/route.ts`
- **修正**:
  - `captionText` が空の場合のバリデーション追加
  - `slug` が空の場合のバリデーション追加
  - `GITHUB_TOKEN` 未設定チェック追加
  - `status === 'posted'` の二重投稿防止チェック追加

### P1: 新規ブログ記事の 404 問題
- **ファイル**: `src/app/blog/[slug]/page.tsx`
- **問題**: `generateStaticParams()` のみでビルド時に存在しない記事は 404
- **修正**: `dynamicParams = true` を追加

### P1: プロンプトファイルのパス解決
- **ファイル**: `scripts/auto-post-blog.ts`, `scripts/auto-publish/generate-x-post.ts`
- **問題**: `path.join(cwd, "..", "the-skin-atelier", "prompts/...")` が GitHub Actions の checkout 構造で失敗する可能性
- **修正**: 複数候補パス (cwd直下、../the-skin-atelier/、__dirname ベース) を順に試行

### P1: GitHub Actions ワークフローの二重X投稿
- **ファイル**: `.github/workflows/auto-daily-content.yml`
- **問題**: `auto-post-blog.ts` 内の `execSync` と workflow の別ステップで X 投稿が二重生成
- **修正**: workflow から X 投稿ステップを削除

### P2: エラー時のSlack通知
- **ファイル**: `scripts/auto-post-blog.ts`
- **修正**: main の catch ブロックに Slack エラー通知を追加（自動実行時もエラーが見える）

### P2: 日付正規化の堅牢化
- **ファイル**: `scripts/auto-post-blog.ts`
- **修正**: `normalizeDate()` に時刻部分の除去、スペースの trim を追加

---

## インフラ変更

### GitHub Actions ワークフロー
- **実行時間**: JST 12:00 → **JST 04:00** に変更（Gemini API 503 のピーク回避）
- **タイムアウト**: 15分 → **20分** に変更
- **失敗時自動再実行フロー追加**:
  - 1回目失敗 → 30分待機 → 自動再実行
  - 2回目失敗 → 1時間待機 → 自動再実行
  - 3回目失敗 → Slack に「3回連続失敗」エラー通知
- **同時実行防止**: `concurrency: daily-blog` で重複実行をブロック

### GitHub Secrets 更新
- `GOOGLE_OAUTH_CLIENT_SECRET` — 正しい値に修正
- `GOOGLE_OAUTH_TOKEN_JSON` — refresh_token 含む最新トークンに更新
- `SLACK_BOT_TOKEN` — 更新済み（ただし不正文字問題が残存、下記参照）

### Vercel 環境変数更新
- `GOOGLE_OAUTH_TOKEN_JSON` を最新トークンに更新

### launchd (ローカル Mac)
- `com.skin-atelier.daily-blog` → **削除**（GitHub Actions に一本化）
- `com.skin-atelier.x-patrol` (見込み客サーチ) → 残存
- `com.skin-atelier.daily-research` → 残存

### Slack App
- Request URL: `https://www.ttcguide.co/api/slack/interactive` (確認済み、Reels Factory Bot)

---

## 現在の自動化フロー

```
毎日 JST 04:00 (GitHub Actions: auto-daily-content.yml)
  → auto-post-blog.ts
    1. ThemeSchedule から翌日テーマ取得
       ├ 翌日分あり → 使用
       ├ 翌日分なし、他のpending あり → 最初の未使用テーマを使用
       └ pending ゼロ → autoGenerateThemes() で10日分自動生成
    2. Gemini Deep Research (Google Search Grounding)
    3. Gemini 記事生成 + 自動検閲 (gemini-2.5-flash)
    4. Google Sheets キュー登録
    5. Slack #skin-atelier_jp に承認メッセージ送信
    6. X投稿も同時生成・Slack送信
  
  失敗時 → 30分後に自動再実行 (最大3回)

Slackで「✅ 承認」クリック
  → Vercel webhook (route.ts @ ttcguide.co)
    → GitHub に .md を push (educatepress/the-skin-atelier)
    → Vercel 自動デプロイ → サイトに公開
```

---

## 現在のステータスと残タスク

### 動作確認済み ✅
- Google OAuth トークン自動リフレッシュ（ローカル・GitHub Actions 両方）
- テーマ自動取得（既存pending テーマからのピックアップ）
- テーマ自動生成（10日分一括、ThemeSchedule シートに保存）
- ブログ記事の生成・検閲（gemini-2.5-flash、2分26秒で完了）
- X投稿の自動生成
- Google Sheets へのキュー登録
- 失敗時自動再実行ワークフロー

### 未解決 🔴
- **SLACK_BOT_TOKEN の不正文字問題**: GitHub Secrets に貼り付ける際に改行やスペースが混入している。トークン自体は正しい（ローカルで認証成功確認済み）。GitHub Secrets の `SLACK_BOT_TOKEN` を再度貼り直す必要あり。
  - 正しい値: (Slack Bot Token — .env.local 参照)
  - コード側で trim する対策も検討可能

### 検討中
- Gemini Web/アプリで手動ブログ生成 → Google Sheets に保存するフローの整備
- ThemeSchedule のテーマ重複チェック（Run #7 と #8 で二重生成された可能性）

---

## コミット履歴
- `63fa911` fix(pipeline): stabilize blog auto-post and Slack approval flow
- `7f5f3a6` fix: remove duplicate X post step in GitHub Actions & add GITHUB_ACTIONS to serverless detection
- `3831b97` fix: resolve prompt file paths for GitHub Actions compatibility
- `ad7fbdf` fix: increase Actions timeout to 30min and cap retry backoff at 60s
- `19f3a85` fix: avoid costly theme generation when pending themes exist
- `e07119a` fix: add fallback model (gemini-2.0-flash) when primary model has 503
- `e9a159a` fix: use gemini-2.5-flash only + auto-retry workflow on failure
- `3f4a43b` fix: move daily blog cron to JST 04:00 to avoid Gemini 503 peak hours
