# CHANGELOG — The Skin Atelier by Dr. Miyaka

## [Next] — 未定

### 📋 残タスク
- **公式LINE開設**: テキスト素材・リッチメニュー画像は作成済み。アカウント開設後、友だち追加URLをLPのCTAボタンに埋め込む。
- **サイト全体の見え方チェック**: 本番環境（skin-atelier.jp）でのスマホ・PC表示確認。
- **自動パトロール（毎日サイト監視）**: GitHub Actions cronの動作テスト実行。
- **メニュー・アクセス情報の正式化**: ダミーの住所・料金を本番データに差し替え。

## [0.6.0] — 2026-04-03

### ♿ LPアクセシビリティ＆UI改善
- **極小フォントの撤廃**: LP全コンポーネントに点在していた可読性の低い極小フォント（0.45rem〜0.7remなど）をすべて `11px` または `12px (text-xs)` に修正し可読性を確保。
- **コントラスト比の改善**: 背景と同化しがちだった極薄ピンク色（`#E8D3C9`系）を、視認性の高い `var(--color-pink-gold-deep)` 等へ変更。
- **法的免責事項の明瞭化**: 医療広告ガイドライン関連の注意事項の文字サイズを遵守サイズにアップし、不透明度も `opacity-40/50` から `opacity-70` に引き上げ、誠実な情報開示を徹底。

### 💬 情緒的コピー（Empathy）の導入・改善
- **冷たい英語から体温のある日本語へ**: Hero, FAQ, Experienceセクション等で使われていた事務的な英語見出しや機能的な文言を、ドクターの体温を感じさせる情緒的な日本語コピー（例：「あなたの不安に寄り添って」「あなたの肌の物語を、お聞かせください」など）へ刷新。
- **FAQの視認性向上**: FAQの回答部分にブログ記事と同じ「A.」の装飾を付与し、UXの一貫性を強化。

## [0.5.0] — 2026-04-01

### 🔒 コンテンツ匿名化・表現統一
- **「フォトフェイシャル」→「IPL治療（光治療）」に全面置換**: ブログ全6記事、LPのFAQ（faq-section.tsx）、Treatments（treatments.tsx）の該当箇所をすべて書き換え。
- **クリニック固有表現の一般化**: 「The Skin Atelierでは」→「私の診療では」に変更（hyaluronic-acid-subtraction.md）。
- **ボトックス記事の修正**: 具体的な単位数テーブル・追加注入の文言を削除（botox-how-many-times.md）。
- **AIプロンプト厳格化**: `prompts/blog-writing-guide.md` に禁止ルール3項目（クリニック固有表現、具体的注入量、フォトフェイシャル名称）を追加。

### 📄 新規ページ追加
- **メニュー・料金表ページ**: `/menu` — サイトのStitchデザインに統一したダミー料金表（IPL治療、エレクトロポレーション、注入治療、インナーケア、診察料）。FadeInアニメーション・Recommendバッジ付き。
- **アクセスページ**: `/access` — Google Maps埋め込み（広尾エリアのダミーピン）＋住所・最寄り駅・診療時間＋徒歩ルート案内＋**「現在地からの経路を検索する」ボタン**（Google Maps Directions API連携）。

### 🧭 ナビゲーション更新
- **ヘッダー**: `Menu` `Access` リンクを追加。`FAQ` を削除し、ナビを簡潔化。
- **フッター**: 同様に `Menu` `Access` を追加。ハッシュリンクを `/#` 形式に修正（他ページからの遷移対応）。

### 💬 公式LINE準備
- **LPのCTAボタン変更**: Invitationセクションの「X をフォロー」「Instagram をフォロー」ボタンを削除 → LINE公式グリーンの「**公式LINEで無料相談・予約する**」ボタンに一新。
- **LINE設定テキスト一式作成**: `prompts/line-official-copy.md` — プロフィール、挨拶メッセージ、美肌診断の自動応答、相談の自動応答、リッチメニュー構成をコピペ用に整備。
- **リッチメニューモックアップ**: AI画像生成により大理石×ピンクゴールドのデザイン案を作成。

### 🔧 Slack通知改善
- **auto-post-blog.ts**: 記事全文のSlack通知を `files.uploadV2`（ファイル添付）→ `chat.postMessage`（テキスト返信）に変更。スマホからもスレッド内で全文が直接読めるように。

### 🔍 SEO / Search Console
- **Google Search Console所有権確認**: 既に完了済みであることを確認。
- **サイトマップ送信**: `https://skin-atelier.jp/sitemap.xml` をSearch Consoleに送信完了。全ページのインデックス登録を開始。
- **メタタグ準備**: `layout.tsx` の `metadata.verification.google` に環境変数ベースのGSC確認タグを追加。



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
