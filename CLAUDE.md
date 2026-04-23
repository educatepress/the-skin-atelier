@AGENTS.md

# このプロジェクトについて

## 概要

広尾クリニック美容皮膚科ブランド「The Skin Atelier」のマーケティング自動化基盤。
AI が CEO/CTO として、ブログ・X (Twitter)・Instagram のコンテンツ生成から投稿・品質監査までを全自動で運用する。

- **ブランド名:** The Skin Atelier（Dr. Miyaka 名義）
- **GitHub:** `hiroo-open/the-skin-atelier`
- **本番URL:** `https://skin-atelier.jp`
- **Vercel デプロイ:** Vercel Hobby プラン
- **AI の役割:** CEO / CTO（戦略立案・実装・運用を全面委任）
- **取締役:** オーナー医師。実務に入らず、方向性の承認（y/n）のみ。技術的な質問は禁止

## 技術スタック

- **言語/フレームワーク:** Next.js 16（App Router）+ TypeScript + React 19
- **スタイリング:** Tailwind CSS v4
- **AI:** Gemini 2.5 Flash（コンテンツ生成・AI監査）
- **データ管理:** Google Sheets（サービスアカウント認証）
- **SNS連携:** Twitter API v2 / Make.com（Instagram投稿）/ Slack（承認フロー）
- **画像/動画CDN:** Cloudinary
- **CI/CD:** GitHub Actions（6ワークフロー）+ macOS launchd（ローカル補助）
- **コンテンツ:** MDX ブログ

## ディレクトリ構成

```
src/
├── app/api/
│   ├── cron/daily-publisher/   ← 日次投稿（X/Blog/IG）を実行する定時バッチ
│   ├── cron/pre-patrol/        ← AI品質監査 → Slack承認メッセージ送信
│   ├── cron/x-monitor/         ← X投稿のパフォーマンス数値を収集
│   ├── slack/interactive/      ← Slack承認ボタンの受け口
│   └── approve/                ← 手動承認API
├── components/                 ← UIパーツ（ボタンやカードなど）
├── content/                    ← ブログ記事（MDX形式）
└── lib/
    ├── sheets.ts               ← Google Sheets操作の中核（18列HEADERS定義あり）
    ├── sheets-rest.ts          ← Slack handler用のSheets操作
    ├── blog.ts                 ← ブログ記事の読み込み
    ├── brand.ts                ← ブランド定義
    └── env-helper.ts           ← 環境変数の取得ヘルパー

scripts/
├── auto-publish/
│   ├── x-variety-single.ts     ← バイラル型単発ツイート生成（6パターン）
│   ├── generate-x-post.ts      ← ブログ連動Xスレッド生成
│   ├── x-prospecting-patrol.ts ← X上の見込み患者を検索→自動リプライ
│   └── send-slack-approval.ts  ← Slack承認メッセージ送信
├── patrol/
│   ├── site-patrol.ts          ← サイト死活監視
│   └── slack-reporter.ts       ← Slackへの通知
├── auto-post-blog.ts           ← ブログ記事生成パイプライン（→X連動も実行）
├── plan-10day-themes.ts        ← 10日分のテーマを自動計画
└── publish-via-github.ts       ← GitHub APIでブログをコミット→自動デプロイ

prompts/                        ← コンテンツ生成プロンプト集 ★改変禁止（後述）
├── hashtag-strategy.md         ← ハッシュタグ戦略バンク
├── x-viral-patterns.md         ← Xバイラル投稿の型定義
├── blog-writing-guide.md       ← ブログ執筆ガイド
└── carousel-prompt-atelier.md  ← カルーセル生成プロンプト

.github/workflows/              ← GitHub Actions（定時実行の自動化）
```

## システムアーキテクチャ

```
[Topics Bank / ThemeSchedule]  ← Google Sheets（ネタ帳＋スケジュール管理）
         │
    ┌────┴────────────────────────────────────┐
    │                                         │
[GitHub Actions 04:00 JST]             [Vercel API Routes]
 auto-post-blog.ts                      daily-publisher (10:00 JST)
 → Blog生成 + X Thread生成              pre-patrol (15:15 JST)
 → Sheets に pending 登録               x-monitor (12:00 JST)
         │
    pre-patrol (15:15 JST)
     AI品質監査 → Slack承認メッセージ
         │
    取締役「承認」クリック
         │
    /api/slack/interactive
     status = 'approved'
     scheduled_date = 翌日JST
         │
    daily-publisher (10:00 JST)
     ├─ X: Twitter API v2 で投稿
     ├─ Blog: GitHub APIでコミット → Vercel自動デプロイ
     └─ IG: Make.com webhook → Instagram Business API
```

---

# 自動化スケジュール

## GitHub Actions（確実に時刻通り実行される主系統）

| ワークフロー | UTC | JST | 役割 |
|---|---|---|---|
| `auto-daily-content.yml` | 19:00 | 04:00 | Blog + X Thread 生成 |
| `daily-publisher.yml` | 01:00 | 10:00 | 承認済みアイテムを各チャネルに投稿 |
| `pre-patrol.yml` | 06:15 | 15:15 | AI品質監査 → Slack承認メッセージ |
| `x-variety-daily.yml` | 03:00 / 09:00 / 12:30 | 12:00 / 18:00 / 21:30 | バイラル型単発ツイート（3回/日） |
| `x-monitor.yml` | 03:00 | 12:00 | X投稿パフォーマンス監視 |
| `site-patrol.yml` | 00:00 | 09:00 | サイト死活監視 |

## macOS launchd（ローカル補助）

| plist | 役割 |
|---|---|
| `com.skin-atelier.x-patrol.plist` | X見込み患者への自動リプライ（08:00 JST） |
| `com.skin-atelier.daily-research.plist` | テーマリサーチ |
| `com.skin-atelier.daily-blog.plist` | (disabled) ブログ生成 fallback |

---

# Google Sheets キュー管理

- **スプレッドシート ID:** `1HkBDRsLcCyyx59CdgU-H-LoVIAM6KkC9NPqMjtAfpsY`
- **認証方式:** サービスアカウント（OAuth は過去に失効事故があり廃止済み）

## シート構成
- `シート1`（メインキュー）: 18列 A〜R — 全コンテンツの状態管理
- `Topics`（ネタ帳）: theme_id, brand, theme_text, status, used_date
- `ThemeSchedule`（テーマスケジュール）: date, brand, themeArea, theme, searchKeywords, ...
- `prompts`（ブランド別プロンプト設定）

## HEADERS（18列 — sheets.ts と sheets-rest.ts で完全一致必須）

```
content_id, brand, type, title, cloudinary_url, cloudinary_public_id, gdrive_url,
generation_recipe, status, patrol_pre_result, scheduled_date, post_url,
posted_at, patrol_post_result, cloudinary_deleted, slack_ts, error_detail, ymrl_evidence
```

**注意:** この列順を変更すると、status が別の列に書き込まれる等の重大事故が起きる（過去に発生済み）。sheets.ts と sheets-rest.ts の両方を必ず同時に更新すること。

## ステータスフロー

```
pending → (pre-patrol AI監査) → pending (patrol_pre_result='done')
  → (Slack承認ボタン) → approved (scheduled_date=翌日JST)
  → (daily-publisher) → posted (post_url, posted_at が記録される)
```

---

# 作業ルール

## 必ず守ること

- 実装を始める前に CONTEXT.md を読むこと
- 一度に1ステップだけ実装する（複数の変更をまとめない）
- 作業の区切りで CONTEXT.md を更新すること
- 問題や気づきを検知したら ISSUES.md に追記すること
- 不明点があれば推測で進めず、必ず取締役に確認すること
- CLAUDE.md / CONTEXT.md / ISSUES.md を変更するときは、事前に変更内容を提示して承認を得ること

## コーディング方針

- TypeScript で書く。`npx tsx` で実行する前提
- 日本語コメント推奨（取締役が読む可能性がある）
- エラーハンドリング: Gemini API は 503 が頻発するので、指数バックオフ retry を必ず入れる
- Sheets 操作: `SheetsDB` クラス（`scripts/lib/sheets-db.ts`）または `src/lib/sheets.ts` を使う

## プロンプト改変禁止（最重要ルール）

`prompts/` 配下のコンテンツ生成プロンプトは **医師監修済みの核資産**。
エビデンスベース（PubMed 参照）の品質が担保されている。

- バグ修正・インフラ修復 → 自由にやってOK
- プロンプトの文言変更 → 取締役に事前確認が必要

対象ファイル:
- `prompts/blog-writing-guide.md`
- `prompts/carousel-prompt-atelier.md`
- `prompts/reels-script-prompt-atelier.md`
- `prompts/x-viral-patterns.md`

## 取締役承認が必要な事項

- 医学的主張を含むブログ記事の初出
- LP（ランディングページ）の構造変更
- ブランド名義の対外発言
- 価格・キャンペーン施策
- 予算支出を伴う外部サービス追加

## AI CEO 自律裁量の範囲

上記以外のマーケ・技術・コンテンツに関する意思決定は AI が自律実行。

---

# よく使うコマンド

## 開発

- ローカル起動: `npm run dev`
- ビルド: `npm run build`
- 本番起動: `npm run start`
- Lint: `npm run lint`

## コンテンツ生成（手動実行）

- X Thread 生成: `npm run slack:x` (`npx tsx scripts/auto-publish/generate-x-post.ts`)
- X Patrol: `npm run slack:patrol` (`npx tsx scripts/auto-publish/x-prospecting-patrol.ts`)
- ブログ生成: `npx tsx scripts/auto-post-blog.ts`
- バイラルツイート: `npx tsx scripts/auto-publish/x-variety-single.ts`
- 10日テーマ計画: `npx tsx scripts/plan-10day-themes.ts`

## 運用・確認

- Sheets 接続確認: `npx tsx -e "import('./scripts/lib/sheets-db').then(async m => { const items = await m.SheetsDB.getQueueItems(); console.log(items.length, 'items'); })"`
- Daily Publisher 手動実行: `curl -H "Authorization: Bearer <CRON_SECRET>" https://skin-atelier.jp/api/cron/daily-publisher`

---

# 環境変数（.env.local に設定。値は書かない）

| 変数名 | 用途 |
|---|---|
| `GEMINI_API_KEY` | Gemini 2.5 Flash（コンテンツ生成・AI監査） |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google Sheets 認証（JSON文字列） |
| `GOOGLE_SHEETS_QUEUE_ID` | スプレッドシート ID |
| `SLACK_BOT_TOKEN` | Slack Bot（atelier 用 App） |
| `TWITTER_API_KEY` | X (Twitter) API Key |
| `TWITTER_API_SECRET` | X API Secret |
| `TWITTER_ACCESS_TOKEN` | X Access Token |
| `TWITTER_ACCESS_SECRET` | X Access Secret |
| `GITHUB_TOKEN` | ブログ自動コミット用 |
| `CRON_SECRET` | Vercel Cron / GitHub Actions 認証 |
| `MAKE_PUBLISH_WEBHOOK_URL` | Make.com → Instagram 投稿 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary アカウント名 |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `PEXELS_API_KEY` | 素材動画取得 |

---

# 外部サービス連携

## Slack
- **App:** atelier 専用 Bot（book 用とは別 App）
- **チャンネル:** `#skin-atelier_jp`
- **Interactive URL:** `https://skin-atelier.jp/api/slack/interactive`
- **用途:** 承認ボタン（approve/reject）、AI 監査結果通知、エラー通知

## Make.com
- **用途:** Slack 承認後に Instagram へ自動投稿
- **フロー:** daily-publisher → webhook POST → Make scenario → IG Business API
- **注意:** `MAKE_IG_PUBLISH_WEBHOOK_URL` と `MAKE_PUBLISH_WEBHOOK_URL` は同じ用途だが変数名が不統一。daily-publisher に fallback チェーン実装済み

## Cloudinary
- **用途:** リール動画 + カルーセル画像の公開URL生成（Instagram API が要求する）

## Twitter / X
- **API:** v2（tweet エンドポイント）
- **アカウント:** Dr. Miyaka（@dr_miyaka_skin）

---

# 注意点・落とし穴（過去の障害から学んだこと）

| # | 何が起きたか | 原因 | 対策 |
|---|---|---|---|
| 1 | ブログ6日間停止 | スクリプトの `.ts` 拡張子が別コミットで消えた | ファイル再作成。コミット前にビルド確認を徹底 |
| 2 | Slack承認が反映されない | `sheets-rest.ts` の HEADERS から `brand` 列が欠落 → status が1列ズレて書き込み | **HEADERS は sheets.ts と sheets-rest.ts で完全一致必須** |
| 3 | Sheets API 認証失敗 | OAuth Refresh Token が失効（`invalid_grant`） | サービスアカウント方式に移行済み。OAuth は使わない |
| 4 | 承認後のアイテムが投稿されない | `scheduled_date = today` だが cron は翌朝実行 → 永久にスキップ | `scheduled_date = tomorrowJst` に修正済み |
| 5 | IG投稿がスキップされる | `MAKE_IG_PUBLISH_WEBHOOK_URL` 未定義 | `MAKE_PUBLISH_WEBHOOK_URL` への fallback チェーン追加済み |
| 6 | Gemini 503 でブログ生成失敗 | API 過負荷（一時的） | 指数バックオフ retry 追加（最大10回） |
| 7 | 同日に同タイプ複数件でスキップ | daily-publisher が `.find()` で各タイプ1件しか処理しなかった | `.filter()` に修正済み（2026-04-23） |

---

# このファイルを読んだ Claude Code がまずすべきこと

1. CONTEXT.md を読んで、今の作業状態を把握する
2. ISSUES.md を読んで、未解決の問題を確認する
3. `git log -5` で最新コミットを確認する
4. 取締役に「次に何をすべきか」を聞く
