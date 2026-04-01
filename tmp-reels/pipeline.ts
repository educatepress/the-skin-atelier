/**
 * ================================================================
 *  pipeline.ts — Full Content Pipeline (One Command)
 *
 *  Chains the entire content generation process:
 *    1. research:deep  → Topic discovery (PubMed-first)
 *    2. script:gen     → Reels script refinement (5-act)
 *    3. carousel:gen   → Carousel JSON generation
 *    4. carousel:render→ Carousel 10-slide PNG export
 *    5. batch          → Reels video (voice + video + render)
 *
 *  Usage:
 *    npm run pipeline              → Full pipeline
 *    npm run pipeline -- --skip-research  → Skip research step
 *    npm run pipeline -- --carousel-only  → Only carousel
 *    npm run pipeline -- --reels-only     → Only reels
 *
 * ================================================================
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const skipResearch = args.includes('--skip-research');
const carouselOnly = args.includes('--carousel-only');
const reelsOnly = args.includes('--reels-only');
const withUpload = args.includes('--with-upload');
const skipUpload = args.includes('--skip-upload');

const steps: { name: string; cmd: string; skip: boolean }[] = [
  {
    name: '🔬 Step 1: Automated Research (PubMed-first)',
    cmd: 'npx tsx scripts/research-auto.ts',
    skip: skipResearch || carouselOnly || reelsOnly,
  },
  {
    name: '✍️  Step 2: Reels Script Refinement (5-Act)',
    cmd: 'npx tsx scripts/generate-script.ts',
    skip: carouselOnly,
  },
  {
    name: '🎠 Step 3: Carousel JSON Generation',
    cmd: 'npx tsx scripts/generate-carousel.ts',
    skip: reelsOnly,
  },
  {
    name: '🖼️  Step 4: Carousel Slide Rendering (10 PNGs)',
    cmd: 'npx tsx scripts/render-carousel.ts',
    skip: reelsOnly,
  },
  {
    name: '🎬 Step 5: Reels Batch (Voice + Video + Render)',
    cmd: 'npx tsx scripts/batch-generate.ts',
    skip: carouselOnly,
  },
  {
    name: '📤 Step 6: Google Drive Upload (Make連携)',
    cmd: 'npx tsx scripts/upload-to-drive.ts',
    skip: skipUpload || !withUpload,
  },
];

console.log('═'.repeat(60));
console.log('🚀 Content Pipeline 起動');
console.log('═'.repeat(60));
console.log(`   モード: ${carouselOnly ? 'カルーセルのみ' : reelsOnly ? 'リールのみ' : 'フルパイプライン'}`);
console.log(`   リサーチ: ${skipResearch ? 'スキップ' : '実行'}`);
console.log(`   Driveアップロード: ${withUpload && !skipUpload ? '実行' : 'スキップ'}\n`);

let passed = 0;
let failed = 0;

for (const step of steps) {
  if (step.skip) {
    console.log(`⏭️  ${step.name} — スキップ\n`);
    continue;
  }

  console.log(`${'─'.repeat(60)}`);
  console.log(`${step.name}`);
  console.log(`${'─'.repeat(60)}`);

  try {
    execSync(step.cmd, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ 完了\n`);
    passed++;
  } catch (err) {
    console.error(`❌ 失敗: ${step.name}`);
    console.error(`   コマンド: ${step.cmd}\n`);
    failed++;
    // Continue to next step instead of aborting
  }
}

console.log('═'.repeat(60));
console.log(`🏁 Pipeline 完了: ${passed} 成功, ${failed} 失敗`);
console.log('═'.repeat(60));

// List output files
const outDir = path.join(process.cwd(), 'out');
if (fs.existsSync(outDir)) {
  const outFiles = fs.readdirSync(outDir, { recursive: true }) as string[];
  console.log(`\n📁 出力ファイル (out/):`);
  for (const f of outFiles.slice(0, 20)) {
    console.log(`   ${f}`);
  }
}

console.log(`\n次のステップ:`);
console.log(`  1. 内容確認: out/ ディレクトリを確認`);
console.log(`  2. 投稿: Instagram / X / Blog に投稿`);
