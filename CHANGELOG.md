# CHANGELOG — The Skin Atelier by Dr. Miyaka

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
