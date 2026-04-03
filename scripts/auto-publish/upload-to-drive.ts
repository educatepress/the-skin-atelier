/**
 * ================================================================
 *  upload-to-drive.ts — Google Drive Uploader (Make連携用)
 *
 *  パイプライン出力（リール .mp4 / カルーセル .png / キャプション .txt）を
 *  Google Drive にアップロードし、Make が自動検知 → Instagram投稿する。
 *
 *  フォルダ構造:
 *    Google Drive/
 *      reels-factory/
 *        reels/
 *          YYYY-MM-DD-{slug}/
 *            {slug}.mp4
 *            {slug}-caption.txt
 *        carousels/
 *          YYYY-MM-DD-{slug}/
 *            {slug}-01.png … {slug}-10.png
 *            caption.txt
 *
 *  Usage:
 *    npm run drive:upload                → out/ から自動検出してアップロード
 *    npm run drive:upload -- --dry-run   → ドライラン（アップロードしない）
 *    npm run drive:upload -- --test      → テストファイルで動作確認
 *
 * ================================================================
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { google, drive_v3 } from 'googleapis';
import { getDriveClient } from '../lib/google-client';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Config ──
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
const FACTORY_DIR = path.join(process.cwd(), '..', 'reels-factory-atelier');
const OUT_DIR = path.join(FACTORY_DIR, 'out');
const REELS_DIR = path.join(FACTORY_DIR, 'out', 'reels');
const BANK_PATH = path.join(FACTORY_DIR, 'scripts', 'data', 'topics-bank.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const TEST_MODE = args.includes('--test');

// ── OAuth2 Config ──
const OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
const OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
const OAUTH_TOKEN_PATH = path.join(process.cwd(), 'credentials', 'oauth-token.json');
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // ブラウザコピペースト方式

// ══════════════════════════════════════════════════════════
//  OAuth2 Auth
// ══════════════════════════════════════════════════════════

async function createDriveClient(): Promise<drive_v3.Drive> {
  return await getDriveClient();
}

// ══════════════════════════════════════════════════════════
//  Drive Helpers
// ══════════════════════════════════════════════════════════

/**
 * Find or create a subfolder inside parentId.
 */
async function findOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId: string,
): Promise<string> {
  // Search for existing folder
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  // Create new folder
  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });

  console.log(`   📁 フォルダ作成: ${name}`);
  return folder.data.id!;
}

/**
 * Upload a single file to Google Drive.
 */
async function uploadFile(
  drive: drive_v3.Drive,
  localPath: string,
  parentId: string,
  fileName?: string,
): Promise<{ id: string; webViewLink: string }> {
  const name = fileName || path.basename(localPath);
  const mimeTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.txt': 'text/plain',
    '.json': 'application/json',
  };
  const ext = path.extname(localPath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';

  const fileSize = fs.statSync(localPath).size;
  const sizeMB = (fileSize / 1024 / 1024).toFixed(1);

  const res = await drive.files.create({
    requestBody: {
      name,
      parents: [parentId],
    },
    media: {
      mimeType,
      body: fs.createReadStream(localPath),
    },
    fields: 'id, webViewLink',
  });

  // Make the file accessible (anyone with link can view)
  await drive.permissions.create({
    fileId: res.data.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  console.log(`   ✅ ${name} (${sizeMB} MB) → アップロード完了`);
  return {
    id: res.data.id!,
    webViewLink: res.data.webViewLink || '',
  };
}

/**
 * Upload a file to Cloudinary and return the secure public URL
 */
async function uploadToCloudinary(localPath: string, resourceType: 'video' | 'image', folder: string): Promise<string> {
  const isDryRun = process.argv.includes('--dry-run');
  if (isDryRun) return `https://res.cloudinary.com/demo/${resourceType}/upload/sample`;

  try {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: resourceType,
      folder: `reels-factory/${folder}`,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });
    console.log(`   ☁️  Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  } catch (error: any) {
    console.error(`   ❌ Cloudinary upload failed for ${localPath}:`, error.message);
    return '';
  }
}

// ══════════════════════════════════════════════════════════
//  Content Detection
// ══════════════════════════════════════════════════════════

interface ReelContent {
  type: 'reel';
  brand?: string;
  slug: string;
  videoPath: string;
  captionPath?: string;
  publicUrl?: string;
}

interface CarouselContent {
  type: 'carousel';
  brand?: string;
  slug: string;
  slidePaths: string[];
  captionPath?: string;
  instagramCaption?: string; // from src/data/carousels/*.json
  publicUrls?: { image_url: string; media_type: 'IMAGE' }[];
}

type Content = ReelContent | CarouselContent;

function detectContent(): Content[] {
  if (!fs.existsSync(OUT_DIR)) {
    console.error(`❌ out/ ディレクトリが見つかりません。先に npm run pipeline を実行してください。`);
    process.exit(1);
  }

  const contents: Content[] = [];
  const entries = fs.readdirSync(OUT_DIR, { withFileTypes: true });

  // Detect Reels — out/reels/ サブフォルダ優先、out/ 直下も互換のため検索
  const reelsDirs = [
    ...(fs.existsSync(REELS_DIR) ? fs.readdirSync(REELS_DIR, { withFileTypes: true }).filter(e => e.isFile() && e.name.endsWith('.mp4')).map(e => ({ dir: REELS_DIR, name: e.name })) : []),
    ...entries.filter(e => e.isFile() && e.name.endsWith('.mp4')).map(e => ({ dir: OUT_DIR, name: e.name })),
  ];

  for (const { dir, name: mp4 } of reelsDirs) {
    const slug = mp4.replace('.mp4', '');
    // キャプションは同じフォルダ内を優先、次に out/ を検索
    const captionCandidates = [
      path.join(dir, `${slug}-caption.json`),
      path.join(OUT_DIR, `${slug}-caption.json`),
      path.join(dir, `${slug}-caption.txt`),
      path.join(OUT_DIR, `${slug}-caption.txt`),
    ];
    const captionPath = captionCandidates.find(p => fs.existsSync(p));
    const brand = slug.startsWith('atelier') ? 'atelier' : 'book';

    contents.push({
      type: 'reel',
      brand,
      slug,
      videoPath: path.join(dir, mp4),
      captionPath,
    });
  }

  // Detect Carousels (carousel-* directories)
  const carouselDirs = entries
    .filter(e => e.isDirectory() && e.name.startsWith('carousel-'));

  for (const dir of carouselDirs) {
    const dirPath = path.join(OUT_DIR, dir.name);
    const slug = dir.name.replace('carousel-', '');
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.png'))
      .sort()
      .map(f => path.join(dirPath, f));

    // Look for caption file in various locations
    const captionCandidates = [
      path.join(dirPath, 'caption.json'),
      path.join(dirPath, 'caption.txt'),
      path.join(dirPath, `${slug}-caption.json`),
      path.join(OUT_DIR, `${slug}-caption.json`),
      path.join(dirPath, `${slug}-caption.txt`),
      path.join(OUT_DIR, `${slug}-caption.txt`),
    ];
    const captionPath = captionCandidates.find(p => fs.existsSync(p));
    const brand = slug.startsWith('atelier') ? 'atelier' : 'book';

    if (files.length > 0) {
      contents.push({
        type: 'carousel',
        brand,
        slug,
        slidePaths: files,
        captionPath,
      });
    }
  }

  return contents;
}

// ── carousel JSON から instagramCaption を取得 ──
const CAROUSEL_DATA_DIR = path.join(FACTORY_DIR, 'src', 'data', 'carousels');
function lookupCarouselCaption(slug: string): string {
  if (!fs.existsSync(CAROUSEL_DATA_DIR)) return '';
  const files = fs.readdirSync(CAROUSEL_DATA_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(CAROUSEL_DATA_DIR, file), 'utf8'));
      // Match by slug: convert title to slug and compare
      const dataSlug = data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      // Also try matching files that contain the slug as part of the name
      if (
        dataSlug === slug ||
        file.replace('.json', '') === slug ||
        slug.includes(dataSlug) ||
        dataSlug?.includes(slug)
      ) {
        return data.instagramCaption || '';
      }
    } catch { /* skip */ }
  }
  return '';
}

// ══════════════════════════════════════════════════════════
//  Main
// ══════════════════════════════════════════════════════════

async function main() {
  // 日付プレフィックス
  const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  console.log('═'.repeat(60));
  console.log('📤 Google Drive Uploader 起動');
  console.log('═'.repeat(60));

  if (DRY_RUN) {
    console.log('🔍 ドライランモード — アップロードは行いません\n');
  }

  if (TEST_MODE) {
    console.log('🧪 テストモード — テストファイルで動作確認\n');
  }

  // ── Detect content ──
  const contents = detectContent();

  if (contents.length === 0) {
    console.log('⚠️  アップロード対象のコンテンツが見つかりません。');
    console.log('   out/ ディレクトリに .mp4 または carousel-* フォルダがあるか確認してください。');
    return;
  }

  const reels = contents.filter(c => c.type === 'reel');
  const carousels = contents.filter(c => c.type === 'carousel');

  console.log(`   リール: ${reels.length} 件`);
  console.log(`   カルーセル: ${carousels.length} 件\n`);

  // ── DRY RUN: Show what would be uploaded ──
  if (DRY_RUN) {
    for (const c of contents) {
      console.log(`─`.repeat(50));
      if (c.type === 'reel') {
        const reel = c as ReelContent;
        console.log(`🎬 リール: ${reel.slug}`);
        console.log(`   動画: ${reel.videoPath}`);
        console.log(`   キャプション: ${reel.captionPath || '未検出'}`);
        console.log(`   → Google Drive: reels-factory/reels/${TODAY}-${reel.slug}/`);
      } else {
        const carousel = c as CarouselContent;
        console.log(`🎠 カルーセル: ${carousel.slug}`);
        console.log(`   スライド: ${carousel.slidePaths.length} 枚`);
        console.log(`   キャプション: ${carousel.captionPath || '未検出'}`);
        console.log(`   → Google Drive: reels-factory/carousels/${TODAY}-${carousel.slug}/`);
      }
    }
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🔍 ドライラン完了 — 実際にアップロードするには --dry-run を外してください`);
    return;
  }

  // ── Validate config ──
  if (!DRIVE_FOLDER_ID) {
    console.error('❌ GOOGLE_DRIVE_FOLDER_ID が .env に設定されていません。');
    console.error('   1. Google Drive でフォルダを作成');
    console.error('   2. URLから Folder ID をコピー (https://drive.google.com/drive/folders/{ID})');
    console.error('   3. .env に GOOGLE_DRIVE_FOLDER_ID={ID} を追加');
    process.exit(1);
  }

  const drive = await createDriveClient();

  // ── Create top-level structure ──
  const reelsRootId = await findOrCreateFolder(drive, 'reels', DRIVE_FOLDER_ID);
  const carouselsRootId = await findOrCreateFolder(drive, 'carousels', DRIVE_FOLDER_ID);

  let uploadedCount = 0;

  // ── Upload Reels ──
  for (const content of reels) {
    const reel = content as ReelContent;
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`🎬 リール: ${reel.slug}`);

    const folderName = `${TODAY}-${reel.slug}`;
    const folderId = await findOrCreateFolder(drive, folderName, reelsRootId);

    // Upload video
    await uploadFile(drive, reel.videoPath, folderId);

    // Upload to Cloudinary for Instagram API
    reel.publicUrl = await uploadToCloudinary(reel.videoPath, 'video', `reels/${TODAY}`);

    // Upload caption if exists
    if (reel.captionPath) {
      await uploadFile(drive, reel.captionPath, folderId);
    }

    uploadedCount++;
  }

  // ── Upload Carousels ──
  for (const content of carousels) {
    const carousel = content as CarouselContent;
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`🎠 カルーセル: ${carousel.slug}`);

    const folderName = `${TODAY}-${carousel.slug}`;
    const folderId = await findOrCreateFolder(drive, folderName, carouselsRootId);

    // Upload slides (max 10 for Instagram carousel limit)
    carousel.publicUrls = [];
    for (const slidePath of carousel.slidePaths.slice(0, 10)) {
      await uploadFile(drive, slidePath, folderId);
      const url = await uploadToCloudinary(slidePath, 'image', `carousels/${TODAY}/${carousel.slug}`);
      if (url) carousel.publicUrls.push({ image_url: url, media_type: 'IMAGE' });
    }

    // Upload caption if exists
    if (carousel.captionPath) {
      await uploadFile(drive, carousel.captionPath, folderId, 'caption.txt');
    }

    uploadedCount++;
  }

  // ── Update topics-bank status ──
  if (fs.existsSync(BANK_PATH)) {
    try {
      const bank = JSON.parse(fs.readFileSync(BANK_PATH, 'utf8'));
      const uploadedSlugs = contents.map(c => c.slug);

      for (const entry of bank) {
        const entrySlug = entry.title
          ?.toLowerCase()
          .replace(/['']/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 60);

        if (uploadedSlugs.includes(entrySlug) && entry.status === 'rendered') {
          entry.status = 'uploaded';
        }
      }

      fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2));
      console.log(`\n📦 Topics Bank: ステータスを uploaded に更新`);
    } catch {
      // Non-critical
    }
  }

  // ── Cleanup (Disk Space Management) ──
  if (!DRY_RUN && !TEST_MODE && uploadedCount > 0) {
    console.log(`\n🧹 ディスク容量確保のため、アップロード済みの中間ファイルを削除します...`);
    try {
      // 1. Delete generated Reels MP4s
      for (const content of reels) {
        const reel = content as ReelContent;
        if (fs.existsSync(reel.videoPath)) {
          fs.unlinkSync(reel.videoPath);
          console.log(`     🗑️  Deleted: ${path.basename(reel.videoPath)}`);
        }
      }
      
      // 2. Delete generated Carousel PNGs and folders
      for (const content of carousels) {
        const carousel = content as CarouselContent;
        if (carousel.slidePaths.length > 0) {
          const carouselDir = path.dirname(carousel.slidePaths[0]);
          if (fs.existsSync(carouselDir)) {
             fs.rmSync(carouselDir, { recursive: true, force: true });
             console.log(`     🗑️  Deleted Folder: ${path.basename(carouselDir)}`);
          }
        }
      }

      // 3. Clean up public/tmp/ audio & video intermediate files
      const TMP_DIR = path.join(FACTORY_DIR, 'public', 'tmp');
      if (fs.existsSync(TMP_DIR)) {
         const tmpFiles = fs.readdirSync(TMP_DIR);
         for (const file of tmpFiles) {
            if (file.endsWith('.mp3') || file.endsWith('.mp4') || file.endsWith('.wav')) {
               fs.unlinkSync(path.join(TMP_DIR, file));
            }
         }
         console.log(`     🗑️  Deleted intermediate media from public/tmp/`);
      }
    } catch (cleanupErr: any) {
      console.warn(`   ⚠️ Cleanup failed (non-critical): ${cleanupErr.message}`);
    }
  }

  // ── Summary ──
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ アップロード完了: ${uploadedCount} 件`);
  console.log('═'.repeat(60));

  // ── Make Webhook 通知 ──
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || '';
  if (MAKE_WEBHOOK_URL && uploadedCount > 0) {
    console.log(`\n📡 Make Webhook を呼び出し中...`);
    try {
      const payload = {
        uploadedCount,
        reels: reels.map(c => {
          const r = c as ReelContent;
          let captionText = '';
          let captionTextJp = '';
          if (r.captionPath) {
            const raw = fs.readFileSync(r.captionPath, 'utf8');
            if (r.captionPath.endsWith('.json')) {
              try {
                const parsed = JSON.parse(raw);
                captionText = parsed.captionText || '';
                captionTextJp = parsed.captionTextJp || '';
              } catch {}
            } else {
              captionText = raw;
            }
          }
          return { brand: r.brand || 'book', slug: r.slug, publicUrl: r.publicUrl, captionText, captionTextJp };
        }),
        carousels: carousels.map(c => {
          const r = c as CarouselContent;
          let captionText = '';
          let captionTextJp = '';
          
          if (r.captionPath && fs.existsSync(r.captionPath)) {
            const raw = fs.readFileSync(r.captionPath, 'utf8').trim();
            if (r.captionPath.endsWith('.json')) {
              try {
                const parsed = JSON.parse(raw);
                captionText = parsed.captionText || '';
                captionTextJp = parsed.captionTextJp || '';
              } catch {}
            } else {
              captionText = raw;
            }
          }
          
          if (!captionText) {
            captionText = lookupCarouselCaption(r.slug);
          }
          
          return { brand: r.brand || 'book', slug: r.slug, publicUrls: r.publicUrls, captionText, captionTextJp };
        }),
        timestamp: new Date().toISOString(),
        driveFolder: `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`,
      };

      // 1. JSONファイルをローカルに保存
      const batchDataPath = path.join(OUT_DIR, 'batch-data.json');
      fs.writeFileSync(batchDataPath, JSON.stringify(payload, null, 2));

      // 2. Google Drive のルート(reels-factory) にアップロード
      console.log(`\n📄 Make連携用 batch-data.json をGoogle Driveにアップロード中...`);
      const uploadedJson = await uploadFile(drive, batchDataPath, DRIVE_FOLDER_ID, `batch-data-${TODAY}.json`);
      
      // 3. ローカルに Drive File ID を記録（Slack通知スクリプト用）
      fs.writeFileSync(
        path.join(OUT_DIR, 'latest-batch-id.txt'), 
        uploadedJson.id
      );
      console.log(`   ✅ Batch Data ID を保存しました: ${uploadedJson.id}`);

      // 4. (既存) Make Webhook Scenario 1 呼び出し（後方互換）
      const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || '';
      if (MAKE_WEBHOOK_URL) {
        console.log(`\n📡 Make Webhook (Scenario 1) を呼び出し中...`);
        try {
          const res = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) console.log(`✅ Make Webhook 送信完了`);
        } catch (e: any) {
          console.warn(`⚠️ Make Webhook 送信失敗 (非クリティカル)`);
        }
      }
    } catch (e: any) {
      console.warn(`⚠️ Make Webhook 送信失敗 (非クリティカル): ${e.message}`);
    }
  }

  console.log(`\n次のステップ:`);
  console.log(`  1. Google Drive でファイルを確認`);
  console.log(`  2. Make シナリオ → Slack通知 → Instagram投稿`);
}

main().catch((err) => {
  console.error('❌ アップロード中にエラーが発生しました:', err.message);
  process.exit(1);
});
