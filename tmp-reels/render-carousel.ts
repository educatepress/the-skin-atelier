/**
 * ================================================================
 *  render-carousel.ts — Carousel Slide Image Exporter
 *
 *  Renders all 10 carousel slides as PNG using Remotion still.
 *  Reads slide data from src/carousel/sampleData.json.
 *
 *  Auto-naming:
 *    - Folder: out/carousel-{slug}  (e.g. out/carousel-stress-and-fertility)
 *    - Files:  {slug}-01.png … {slug}-10.png
 *
 *  Usage:
 *    npm run carousel:render                          → Auto-named from JSON title
 *    npm run carousel:render -- --outdir out/custom   → Manual override
 *
 * ================================================================
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ── Load carousel data ──
const dataPath = path.join(process.cwd(), 'src', 'carousel', 'sampleData.json');
if (!fs.existsSync(dataPath)) {
  console.error('❌ src/carousel/sampleData.json が見つかりません。');
  console.error('   先に npm run carousel:gen を実行してください。');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const slideCount = data.slides?.length || 10;

// ── Generate content-descriptive slug from Cover headline ──
// "Feeling stressed? It might affect fertility!" → "stressed-affect-fertility"
// "Trying to conceive? You might be missing THIS nutrient." → "conceive-missing-nutrient"
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
  'it', 'its', 'you', 'your', 'we', 'our', 'they', 'their',
  'this', 'that', 'these', 'those', 'of', 'in', 'on', 'at',
  'to', 'for', 'with', 'by', 'from', 'and', 'or', 'but', 'not',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'can', 'have', 'has', 'had', 'what', 'how', 'why',
  'who', 'which', 'where', 'when', 'if', 'up', 'out', 'so',
  'just', 'really', 'very', 'most', 'about', 'need', 'know',
]);

function toSlug(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));

  // Take up to 4 meaningful words for a concise but descriptive name
  return words.slice(0, 4).join('-') || 'untitled';
}

// Use the Cover slide headline for a content-descriptive name
const coverSlide = data.slides?.find((s: any) => s.type === 'Cover');
const headlineRaw: string = coverSlide?.headline || data.title || 'untitled';
const slug = toSlug(headlineRaw);

// ── Determine output directory ──
const args = process.argv.slice(2);
const outdirIdx = args.indexOf('--outdir');
const outDir = outdirIdx !== -1 && args[outdirIdx + 1]
  ? path.resolve(args[outdirIdx + 1])
  : path.join(process.cwd(), 'out', `carousel-${slug}`);

// Create output directory
fs.mkdirSync(outDir, { recursive: true });

console.log(`🎠 Carousel Renderer 起動`);
console.log(`   テーマ: ${headlineRaw}`);
console.log(`   スラッグ: ${slug}`);
console.log(`   スライド数: ${slideCount}`);
console.log(`   出力先: ${outDir}\n`);

let success = 0;

for (let i = 1; i <= slideCount; i++) {
  const slideId = `Carousel-Slide-${String(i).padStart(2, '0')}`;
  const outputPath = path.join(outDir, `${slug}-${String(i).padStart(2, '0')}.png`);

  process.stdout.write(`   🖼️  ${slideId}...`);

  try {
    execSync(
      `npx remotion still "${slideId}" "${outputPath}" --frame=150 --gl=swangle`,
      { stdio: 'pipe', cwd: process.cwd() }
    );
    success++;
    console.log(` ✅`);
  } catch (err: any) {
    console.log(` ❌`);
    console.error(`      ${err.message?.split('\n')[0] || 'Unknown error'}`);
  }
}

console.log(`\n🎠 完了: ${success}/${slideCount} スライドをレンダリング`);
console.log(`📁 出力先: ${outDir}`);

// ── キャプションを caption.json として出力フォルダに保存 ──
if (data.instagramCaption) {
  const captionData = {
    captionText: data.instagramCaption,
    captionTextJp: data.instagramCaptionJp || ''
  };
  const captionFilePath = path.join(outDir, 'caption.json');
  fs.writeFileSync(captionFilePath, JSON.stringify(captionData, null, 2), 'utf8');
  console.log(`📝 キャプション保存: ${captionFilePath}`);
  console.log(`   "${data.instagramCaption.slice(0, 60)}..."`);
} else {
  console.log(`⚠️ instagramCaption が sampleData.json に含まれていないため、キャプションは保存されませんでした。`);
}

