/**
 * クリニック公開ゲート。
 *
 * 開業「公開OK」までは false（既定）。価格・アクセス・予約・診療案内など
 * "開業を示すクリニック情報" を一括で制御する。false の間、対象ページは
 * notFound() で 404 にし、リンクも張らず、sitemap にも載せない
 * （＝「準備中」表示も出さず、存在しない状態にする）。
 *
 * 公開する時は Vercel の環境変数 NEXT_PUBLIC_CLINIC_OPEN=true を設定して再ビルド。
 */
export const CLINIC_OPEN = process.env.NEXT_PUBLIC_CLINIC_OPEN === "true";
