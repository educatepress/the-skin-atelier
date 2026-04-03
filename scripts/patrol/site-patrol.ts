/**
 * The Skin Atelier — Site Patrol Script
 * 
 * サイトマップに基づいて全ページを巡回し、以下を検査:
 * - HTTP ステータス (200以外を検出)
 * - OGP / meta タグの存在 (title, description)
 * - 画像のリンク切れ
 * - ブログ記事数の整合性
 * 
 * 結果を Slack #skin-atelier_jp に通知
 */

import { reportToSlack, PatrolResult } from "./slack-reporter";

const SITE_URL = "https://skin-atelier.jp";
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

interface PageCheckResult {
  url: string;
  status: number;
  hasTitle: boolean;
  hasDescription: boolean;
  brokenImages: string[];
  errors: string[];
}

/** サイトマップからURLリストを取得 */
async function fetchSitemapUrls(): Promise<string[]> {
  try {
    const res = await fetch(SITEMAP_URL);
    const xml = await res.text();
    // Simple regex to extract <loc> URLs from sitemap XML
    const urls: string[] = [];
    const regex = /<loc>(.*?)<\/loc>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      urls.push(match[1]);
    }
    return urls;
  } catch (e) {
    console.error("❌ サイトマップの取得に失敗:", e);
    return [];
  }
}

/** 1ページの検査 */
async function checkPage(url: string): Promise<PageCheckResult> {
  const result: PageCheckResult = {
    url,
    status: 0,
    hasTitle: false,
    hasDescription: false,
    brokenImages: [],
    errors: [],
  };

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SkinAtelier-Patrol/1.0" },
    });
    result.status = res.status;

    if (res.status !== 200) {
      result.errors.push(`HTTP ${res.status}`);
      return result;
    }

    const html = await res.text();

    // Check title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    result.hasTitle = !!(titleMatch && titleMatch[1].trim().length > 0);
    if (!result.hasTitle) {
      result.errors.push("title タグが空または欠落");
    }

    // Check meta description
    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i
    );
    result.hasDescription = !!(descMatch && descMatch[1].trim().length > 0);
    if (!result.hasDescription) {
      result.errors.push("meta description が空または欠落");
    }

    // Check images for broken links
    const imgRegex = /<img[^>]*src=["'](.*?)["'][^>]*>/gi;
    let imgMatch;
    const imageUrls: string[] = [];
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      let imgUrl = imgMatch[1];
      // Skip data URIs and inline SVGs
      if (imgUrl.startsWith("data:") || imgUrl.startsWith("blob:")) continue;
      // Make relative URLs absolute
      if (imgUrl.startsWith("/")) {
        imgUrl = `${SITE_URL}${imgUrl}`;
      }
      imageUrls.push(imgUrl);
    }

    // Check up to 20 images per page to avoid timeout
    const imagesToCheck = imageUrls.slice(0, 20);
    for (const imgUrl of imagesToCheck) {
      try {
        const imgRes = await fetch(imgUrl, { method: "HEAD" });
        if (imgRes.status >= 400) {
          result.brokenImages.push(imgUrl);
        }
      } catch {
        result.brokenImages.push(imgUrl);
      }
    }

    if (result.brokenImages.length > 0) {
      result.errors.push(
        `画像 ${result.brokenImages.length}件 読み込み失敗`
      );
    }
  } catch (e) {
    result.status = 0;
    result.errors.push(`接続エラー: ${(e as Error).message}`);
  }

  return result;
}

/** メイン実行 */
async function main() {
  console.log("🔍 The Skin Atelier パトロール開始...\n");
  const startTime = Date.now();

  // 1. サイトマップからURL取得
  const urls = await fetchSitemapUrls();
  if (urls.length === 0) {
    console.error("URLが0件。サイトマップの取得に問題があります。");
    await reportToSlack({
      success: false,
      totalPages: 0,
      checkedPages: 0,
      errors: ["サイトマップからURLを取得できませんでした"],
      warnings: [],
      blogCount: 0,
      durationMs: Date.now() - startTime,
    });
    process.exit(1);
  }

  console.log(`📄 ${urls.length} ページを検査します\n`);

  // 2. 全ページ検査
  const results: PageCheckResult[] = [];
  for (const url of urls) {
    const result = await checkPage(url);
    const statusIcon = result.errors.length === 0 ? "✅" : "❌";
    console.log(`${statusIcon} ${result.url} (${result.status})`);
    if (result.errors.length > 0) {
      result.errors.forEach((e) => console.log(`   ⚠️  ${e}`));
    }
    results.push(result);
  }

  // 3. 結果を集計
  const errors: string[] = [];
  const warnings: string[] = [];
  let blogCount = 0;

  for (const r of results) {
    if (r.url.includes("/blog/") && !r.url.endsWith("/blog")) {
      blogCount++;
    }
    for (const err of r.errors) {
      if (r.status >= 400 || r.status === 0) {
        errors.push(`${r.url} → ${err}`);
      } else {
        warnings.push(`${r.url} → ${err}`);
      }
    }
  }

  const durationMs = Date.now() - startTime;
  const patrolResult: PatrolResult = {
    success: errors.length === 0,
    totalPages: urls.length,
    checkedPages: results.length,
    errors,
    warnings,
    blogCount,
    durationMs,
  };

  // 4. Slack通知
  await reportToSlack(patrolResult);

  console.log(`\n⏱ 完了: ${(durationMs / 1000).toFixed(1)}秒`);
  console.log(
    `📊 結果: ${errors.length === 0 ? "🟢 全ページ正常" : `🔴 ${errors.length}件のエラー`}`
  );

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("パトロールスクリプトで致命的エラー:", e);
  process.exit(1);
});
