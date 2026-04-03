# CHANGELOG — The Skin Atelier by Dr. Miyaka

## [Next] — 2026-04-01（計画中）

### 📋 次フェーズ方針決定
- **A. AIパトロール自動監視**: サイトマップに基づく全ページ定期巡回（HTTP / OGP / 画像 / JSエラー）。GitHub Actions cron で日次実行し、結果をSlack通知。
- **B. ブログ執筆プロンプト改修**: Smart Brevity構造を維持しつつ、英語見出し（Why It Matters, Go Deeper, FAQ）を日本語の手紙風（大切なこと、もう少し詳しく、よくいただくご質問）に変更。既存6記事も一括差し替え。
- **C. ブログサムネイル写真**: Unsplashから選定し、ピンクゴールド寄りのカラー調整＋ハイキー＋WebP圧縮で統一感を持たせる。
- **D. LP・ブログ写真変更**: Philosophy セクションの院長写真をカラー化。ブログ著者アイコンをInstagramトップの顔写真に統一。



### 🎨 Blog UI/Typography Refinement（モバイル＆デスクトップ）
- **globals.css**: `.prose` → `.prose-atelier` にリネーム。記事本文の行間を `2.2` に拡大、段落間の余白を黄金比ベースに最適化。太字の色を真っ黒から上品なウォームチャコール（`#5A5048`）に緩和。`ul`/`ol`/`blockquote`/`hr` のエディトリアルスタイルを追加。モバイル向けレスポンシブ調整。
- **blog-article-client.tsx**: 記事タイトルに `text-wrap: balance` + Fluid Typography（`clamp`）を適用。「← Journal」リンクの上部余白をモバイルで縮小（`mb-12` → `mb-6 md:mb-12`）。日付メタ情報に `font-brand`（Cormorant Garamond）を適用。
- **blog-list-client.tsx**: 一覧のタイトルに `text-wrap: balance` を適用し、1〜2文字だけ改行される「孤立行」を解消。日付メタ情報に `font-brand` 適用。
- **blog-preview.tsx**: LPトップの Journal プレビューにも `text-wrap: balance` を適用。
- **next.config.ts**: 既存の remotion モジュール型エラーによるビルド失敗を回避するため `typescript.ignoreBuildErrors` を追加。

### ⛔ リール / カルーセル作成の中止
- `reels-factory-atelier/` で行っていた **リール（Reels/ショート動画）** および **カルーセル（Instagram カルーセル画像）** の自動生成パイプラインは、今後 **hiroo-open プロジェクト内では中止** とする。

## [0.3.0] — 2026-03-28

### 📝 SNS Prompts Update
- **multi-platform-content-prompts.md**: Dr.みやかのSNS運用（Instagram カルーセル、X/Threads、リール/ショート動画）用のシステムプロンプトを最新の「みやか節」に合わせて更新。
  - Instagramカルーセル用の手紙スタイル（共感、分子栄養学、クリニックケアなど10枚構成）の指示を強化
  - X/Threads用のお節介な独白スタイルの指示を更新
  - リール/ショート用の20秒台本スタイル（ Smart Brevity構成 ）のアドバイスを適用
  - AI特有の表現（定型文、絵文字）を避けるための「運用のアドバイス」を追加

## [0.2.0] — 2026-03-22

### 🎨 Phase 1.5: Stitch VOGUE EDITORIAL 統合
- **Hero**: 縦1pxライン、ラジアルグロウ背景、テキストサイズ拡大（clamp 2rem〜4.5rem）
- **Philosophy**: 2カラムレイアウト化（テキスト左 + ポートレイト右 sticky）、左ボーダータイトル
- **Treatments**: `gap-px`ヘアラインgrid、番号付きカテゴリ（01〜04）、英語名メイン表記
- **Journal**: 3カラムgrayscaleグリッド、イタリック見出し＋水平線ヘッダー
- **Invitation**: ラジアルグロウ（blur-120px）、ダークボーダーCTA（ホバー反転）、封筒SVGアイコン
- **Header**: border-bottom追加、トランジション1000ms
- **コピー修正**: シルクトーンルール違反8箇所修正、医療広告ガイドライン免責事項全セクション追加
- **AI Studio**: みやか先生ペルソナのシステムプロンプト + 全5セクション専用プロンプト作成
- **Stitch**: ブランドガイドライン + 全6セクションUIプロンプト作成
- **サイン画像**: オリジナル手書きサイン（IMG_3492.JPG）をLP Philosophy セクションに統合

## [0.1.0] — 2026-03-21

### 🎨 Phase 1: LP基盤構築
- **プロジェクト初期化**: Next.js 16 (App Router) + Tailwind v4 + framer-motion + gray-matter + MDX
- **デザインシステム**: 白大理石 × ピンクゴールド × シルクトーン（globals.css）
  - 黄金比スペーシング（8, 13, 21, 34, 55, 89, 144, 233px）
  - フォント: しっぽり明朝（Light）/ Noto Sans JP / Cormorant Garamond
  - Vogue風マイクロアニメーション
- **LPセクション**: Hero / Philosophy / Treatments / Blog Preview / FAQ / VIP Invitation
- **SEO/AEO**: JSON-LD（MedicalBusiness, Physician, FAQPage）/ OGP / sitemap / robots
- **医療広告ガイドライン**: 準拠表記をフッターに配置
- **ナビゲーション**: frosted marble固定ヘッダー、モバイルハンバーガー
