import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// ── Slugify: turn title into filesystem-safe name ──
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, '')           // Remove apostrophes
    .replace(/[^a-z0-9]+/g, '-')   // Non-alphanumeric → dash
    .replace(/^-|-$/g, '')          // Trim leading/trailing dashes
    .substring(0, 60);              // Cap length
}

// Load the topics to generate
const topicsPath = path.join(process.cwd(), 'scripts', 'data', 'topics.json');
if (!fs.existsSync(topicsPath)) {
  console.error('❌ topics.json not found at scripts/data/topics.json');
  process.exit(1);
}

const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));

// The paths where intermediate files are stored (isolated in public/tmp/)
const tmpDir = path.join(process.cwd(), 'public', 'tmp');
const voiceoverPath = path.join(tmpDir, 'voiceover.mp3');
const backgroundPath = path.join(tmpDir, 'background.mp4');
const backgroundBPath = path.join(tmpDir, 'background-b.mp4');
const syncedDataPath = path.join(process.cwd(), 'src', 'synced-data.json');

// ── ElevenLabs直接呼び出し用 ──────────────────────────────────────
// Ensure output and tmp directories exist
const outDir = path.join(process.cwd(), 'out', 'reels');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

console.log(`🚀 Starting Batch Generation for ${topics.length} videos...`);

async function runBatch() {
  for (let i = 0; i < topics.length; i++) {
    // 💡 バッチ開始前に一時ファイルをクリーンアップ（前回の残骸を防ぐ）
    const tempFiles = [voiceoverPath, backgroundPath, backgroundBPath, syncedDataPath];
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });

    const topic = topics[i];
    console.log(`\n============================================================`);
    console.log(`🎬 Generating Video ${i + 1}/${topics.length} : [${topic.id}] ${topic.title}`);
    console.log(`============================================================`);
    
    // 1. Generate Voice (ElevenLabs)
    console.log(`\n🗣️ [1/5] Generating voiceover...`);
    // We pass the text via an environment variable or write to a temp file, 
    // but the current generate-voice.ts has hardcoded prompt text.
    // For this batch script to truly work dynamically, we need to temporarily modify `test-data.json` or pass args.
    // Here we will update `test-data.json` so the other scripts pick it up.
    
    const testDataPath = path.join(process.cwd(), 'src', 'test-data.json');
    const currentTestData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    currentTestData.title = topic.title;
    currentTestData.hook = topic.hook;
    currentTestData.text = topic.text;
    currentTestData.keyTakeaway = topic.keyTakeaway;
    currentTestData.thumbnailText = topic.thumbnailText;
    
    fs.writeFileSync(testDataPath, JSON.stringify(currentTestData, null, 2));
    
    try {
      execSync('npm run voice:gen', { stdio: 'inherit' });
    } catch (e) {
      console.error(`❌ Voice generation failed for ${topic.id}`);
      continue;
    }

    // 1.5. Generate Infographic Narration Audio (Deleted because narration is now integrated into Act 3)

    // 2. Extract Timestamps (Whisper)
    console.log(`\n⏱️ [2/5] Extracting timestamps...`);
    try {
      execSync('npm run voice:sync', { stdio: 'inherit' });
    } catch (e) {
      console.error(`❌ Timestamp syncing failed for ${topic.id}`);
      continue;
    }

    // synced-data.json にinfographicデータを追記（voice:syncが生成したファイルに追加）
    if (topic.infographic && fs.existsSync(syncedDataPath)) {
      try {
        const syncedData = JSON.parse(fs.readFileSync(syncedDataPath, 'utf8'));
        syncedData.infographic = topic.infographic;
        fs.writeFileSync(syncedDataPath, JSON.stringify(syncedData, null, 2));
        console.log(`  📊 infographicデータをsynced-data.jsonに追記しました`);
      } catch (e) {
        console.warn(`  ⚠️ synced-data.json更新失敗 (non-critical)`);
      }
    }

    // 3. Fetch Background Video (Pexels)
    console.log(`\n🎥 [3/5] Fetching background video from Pexels...`);
    try {
      execSync(`npm run video:fetch "${topic.videoKeyword || ''}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`❌ Background video selection failed for ${topic.id}`);
      continue;
    }

    // 4. Render Video (Remotion) with AUTO-RETRY
    console.log(`\n🎞️ [4/5] Rendering video with Remotion...`);
    const slug = slugify(topic.title);
    const outputPath = path.join(outDir, `${slug}.mp4`);
    let renderSuccess = false;

    // First attempt: concurrency=2
    try {
      execSync(`npx remotion render ReelComposition ${outputPath} --gl=swangle --concurrency=2`, { stdio: 'inherit' });
      console.log(`\n✅ Render completed: ${outputPath}`);
      renderSuccess = true;
    } catch (e) {
      console.warn(`\n⚠️ Render failed with concurrency=2. Retrying with concurrency=1...`);
      // Retry with concurrency=1 (slower but more stable)
      try {
        execSync(`npx remotion render ReelComposition ${outputPath} --gl=swangle --concurrency=1`, { stdio: 'inherit' });
        console.log(`\n✅ Render completed (retry): ${outputPath}`);
        renderSuccess = true;
      } catch (e2) {
        console.error(`❌ Remotion rendering failed even with concurrency=1 for ${topic.id}`);
        continue;
      }
    }

    // 5. Generate Instagram Caption
    console.log(`\n📝 [5/5] Generating Instagram caption...`);
    try {
      execSync(`npx tsx scripts/generate-caption.ts ${topic.id}`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`⚠️ Caption generation failed for ${topic.id} (non-critical)`);
    }

    // ⭐️ Mark topic as 'rendered' in topics-bank.json
    if (renderSuccess) {
      const bankPath = path.join(process.cwd(), 'scripts', 'data', 'topics-bank.json');
      if (fs.existsSync(bankPath)) {
        try {
          const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
          const bankEntry = bank.find((e: any) => e.id === topic.id);
          if (bankEntry) {
            bankEntry.status = 'rendered';
            fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));
            console.log(`📦 Topics Bank: ${topic.id} → rendered`);
          }
        } catch (e) {
          // Non-critical, don't fail the batch
        }
      }
    }

    // Rate limit prevention
    if (i < topics.length - 1) {
      console.log(`\n💤 Sleeping for 3 seconds to prevent API rate limits...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  
  // ── Final Summary ──
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🎉 Batch Generation Finished!`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`📁 Output directory: ${outDir}`);
  
  // 🧹 Cleanup tmp/ files after all batches
  [voiceoverPath, backgroundPath, backgroundBPath, syncedDataPath].forEach(file => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
  console.log(`🧹 一時ファイルをクリーンアップしました (public/tmp/)`);
  
  // List generated files
  const outFiles = fs.readdirSync(outDir).filter(f => f.endsWith('.mp4') || f.endsWith('-caption.txt'));
  outFiles.sort();
  for (const f of outFiles) {
    const stats = fs.statSync(path.join(outDir, f));
    const size = f.endsWith('.mp4') ? `${(stats.size / 1024 / 1024).toFixed(1)} MB` : `${stats.size} bytes`;
    console.log(`   ${f.endsWith('.mp4') ? '🎬' : '📝'} ${f} (${size})`);
  }
}

runBatch();
