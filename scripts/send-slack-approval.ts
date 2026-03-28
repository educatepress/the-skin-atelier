/**
 * ================================================================
 *  send-slack-approval.ts — 個別コンテンツ承認メッセージ送信
 *
 *  1コンテンツ = 1 Slackメッセージ
 *  - Drive 直リンク
 *  - キャプション全文表示
 *  - ✅承認 / ❌却下 の個別ボタン
 *  - 承認結果を queue.json に記録
 *
 *  Usage:
 *    npx tsx scripts/send-slack-approval.ts
 * ================================================================
 */

import path from 'path';
import fs from 'fs';
import { WebClient } from '@slack/web-api';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || '';
// hiroo-open プロジェクトからの全ての投稿は `#skin-atelier_jp` へ
const TARGET_SLACK_CHANNEL = 'skin-atelier_jp';
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
const OUT_DIR         = path.join(process.cwd(), 'out');
import { SheetsDB, SheetsQueueRow } from './lib/sheets-db';

// ── Types ──────────────────────────────────────────────────────

interface QueueItem {
  id: string;
  brand: string;
  type: 'reel' | 'carousel' | 'x' | 'blog';
  slug: string;
  status: 'pending' | 'approved' | 'rejected' | 'posted';
  captionText: string;
  captionTextJp?: string;
  publicUrl?: string;
  publicUrls?: { image_url: string; media_type: string }[];
  driveLink: string;
  batchId: string;
  slackTs?: string;
  createdAt: string;
  approvedAt?: string;
  postedAt?: string;
}

// ── Helpers ──────────────────────────────────────────────────────

function loadBatchData(): any {
  const batchPath = path.join(OUT_DIR, 'batch-data.json');
  if (!fs.existsSync(batchPath)) {
    console.error('❌ out/batch-data.json が見つかりません。先に npm run upload を実行してください。');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(batchPath, 'utf8'));
}

async function fetchQueueFromSheets(): Promise<QueueItem[]> {
  const sheetsRows = await SheetsDB.getRows();
  return sheetsRows.map(row => {
    let recipe: any = {};
    try { recipe = JSON.parse(row.generation_recipe || '{}'); } catch {}
    return {
      id: row.content_id,
      brand: row.brand || 'book',
      type: row.type as 'reel' | 'carousel' | 'x' | 'blog',
      slug: row.title,
      status: row.status as 'pending' | 'approved' | 'rejected' | 'posted',
      captionText: recipe.captionText || '',
      captionTextJp: recipe.captionTextJp || '',
      publicUrl: row.type === 'reel' ? row.cloudinary_url : undefined,
      publicUrls: row.type === 'carousel' ? (row.cloudinary_url ? JSON.parse(row.cloudinary_url) : []) : undefined,
      driveLink: row.gdrive_url,
      batchId: recipe.batchId || '',
      slackTs: row.slack_ts || '',
      createdAt: recipe.createdAt || '',
    };
  });
}

function getBatchId(): string {
  const batchIdPath = path.join(OUT_DIR, 'latest-batch-id.txt');
  if (fs.existsSync(batchIdPath)) {
    return fs.readFileSync(batchIdPath, 'utf8').trim();
  }
  return '';
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}

// ── Block Kit: 個別コンテンツ用メッセージ ──────────────────────

function buildContentBlocks(item: QueueItem): any[] {
  const isCarousel = item.type === 'carousel';
  const isX = item.type === 'x';
  const isBlog = item.type === 'blog';
  
  let icon = '🎬';
  let typeLabel = 'リール';
  if (isCarousel) { icon = '🎠'; typeLabel = 'カルーセル'; }
  if (isX) { icon = '🐦'; typeLabel = 'X (Twitter)'; }
  if (isBlog) { icon = '📝'; typeLabel = 'ブログ'; }
  
  const slideCount = item.publicUrls ? `（${item.publicUrls.length}枚）` : '';

  // Caption display (truncate to Slack limit, keeping most content)
  const captionDisplay = item.captionText
    ? `> ${truncate(item.captionText.replace(/\n/g, '\n> '), 2000)}`
    : '_キャプションなし_';

  const captionJpDisplay = item.captionTextJp
    ? `\n\n*🇯🇵 日本語訳:*\n> ${truncate(item.captionTextJp.replace(/\n/g, '\n> '), 800)}`
    : '';

  const brandBadge = item.brand === 'atelier' ? '🟦 hiroo-open' : '🟩 Skin Atelier';

  const blocks: any[] = [
    // Header
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${icon} *${typeLabel}${slideCount}*: \`${item.slug}\`\n【配信先: ${brandBadge}】`
      },
      accessory: (isX || isBlog) ? undefined : {
        type: 'button',
        text: { 
          type: 'plain_text', 
          text: item.type === 'reel' ? '▶️ 再生プレビュー' : '🖼️ 画像プレビュー', 
          emoji: true 
        },
        url: item.type === 'reel' ? (item.publicUrl || item.driveLink) : (item.publicUrls && item.publicUrls.length > 0 ? item.publicUrls[0].image_url : item.driveLink),
        action_id: `open_preview_${item.id}`
      }
    },

    // Caption
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📝 *キャプション:*\n${captionDisplay}${captionJpDisplay}`
      }
    },

    // Approve / Reject buttons
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '✅ 承認', emoji: true },
          style: 'primary',
          action_id: 'approve_content',
          value: JSON.stringify({ id: item.id, batchId: item.batchId, brand: item.brand }),
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '❌ 却下', emoji: true },
          style: 'danger',
          action_id: 'reject_content',
          value: JSON.stringify({ id: item.id, brand: item.brand }),
        },
      ]
    },

    // Divider
    { type: 'divider' },
  ];

  return blocks;
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  if (!SLACK_BOT_TOKEN) {
    console.error('❌ SLACK_BOT_TOKEN が .env に設定されていません');
    process.exit(1);
  }

  const client = new WebClient(SLACK_BOT_TOKEN);
  const batchData = loadBatchData();
  const batchId = getBatchId();
  const queue = await fetchQueueFromSheets();
  const today = new Date().toISOString().split('T')[0];

  // Build queue items from batch data
  const newItems: QueueItem[] = [];

  // Reels
  for (const reel of batchData.reels || []) {
    const id = `reel-${today}-${reel.slug}`;
    if (queue.some(q => q.id === id)) {
      console.log(`   ⏭️  スキップ（キュー登録済み）: ${reel.slug}`);
      continue;
    }
    newItems.push({
      id,
      brand: reel.brand || 'book',
      type: 'reel',
      slug: reel.slug,
      status: 'pending',
      captionText: reel.captionText || '',
      captionTextJp: reel.captionTextJp || '',
      publicUrl: reel.publicUrl,
      driveLink: `${batchData.driveFolder}`,
      batchId,
      createdAt: new Date().toISOString(),
    });
  }

  // Carousels
  for (const carousel of batchData.carousels || []) {
    const id = `carousel-${today}-${carousel.slug}`;
    if (queue.some(q => q.id === id)) {
      console.log(`   ⏭️  スキップ（キュー登録済み）: ${carousel.slug}`);
      continue;
    }
    newItems.push({
      id,
      brand: carousel.brand || 'book',
      type: 'carousel',
      slug: carousel.slug,
      status: 'pending',
      captionText: carousel.captionText || '',
      captionTextJp: carousel.captionTextJp || '',
      publicUrls: carousel.publicUrls,
      driveLink: `${batchData.driveFolder}`,
      batchId,
      createdAt: new Date().toISOString(),
    });
  }

  if (newItems.length === 0) {
    console.log('ℹ️  新規コンテンツなし。すべてキュー登録済みです。');
    return;
  }

  // Send summary header
  const reelCount = newItems.filter(i => i.type === 'reel').length;
  const carouselCount = newItems.filter(i => i.type === 'carousel').length;
  const todayStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

  console.log(`📤 Slack に ${newItems.length} 件の個別メッセージを送信します...`);
  console.log(`   リール: ${reelCount}本 / カルーセル: ${carouselCount}件`);

  // ヘッダー通知
  await client.chat.postMessage({
    channel: TARGET_SLACK_CHANNEL,
    text: `📅 ${todayStr} コンテンツレビュー`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `📅 ${todayStr} コンテンツレビュー`, emoji: true }
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `🎬 リール: ${reelCount}本 / 🎠 カルーセル: ${carouselCount}件 — 各コンテンツを個別に確認・承認してください` }
        ]
      },
      { type: 'divider' },
    ]
  });

  // Send individual messages
  for (let i = 0; i < newItems.length; i++) {
    const item = newItems[i];
    const blocks = buildContentBlocks(item);

    // hiroo-openプロジェクトの通知は一律で skin-atelier_jp へ送信
    try {
      const result = await client.chat.postMessage({
        channel: TARGET_SLACK_CHANNEL,
        text: `${item.type === 'carousel' ? '🎠' : '🎬'} ${item.slug} — レビュー待ち`,
        blocks,
      });

      if (result.ok) {
        item.slackTs = result.ts as string;
        console.log(`   ✅ [${i + 1}/${newItems.length}] ${item.slug}`);
      }
    } catch (e: any) {
      console.error(`   ❌ [${i + 1}/${newItems.length}] ${item.slug}: ${e.message}`);
    }

    // Rate limit
    if (i < newItems.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Save to Sheets
  const newSheetsRows = newItems.map(item => ({
    content_id: item.id,
    type: item.type,
    title: item.slug,
    cloudinary_url: item.type === 'carousel' ? JSON.stringify(item.publicUrls) : item.publicUrl,
    cloudinary_public_id: '',
    gdrive_url: item.driveLink,
    generation_recipe: JSON.stringify({
      captionText: item.captionText,
      captionTextJp: item.captionTextJp,
      batchId: item.batchId,
      createdAt: item.createdAt,
    }),
    status: item.status,
    patrol_pre_result: 'pass',
    slack_ts: item.slackTs || '',
    cloudinary_deleted: 'false'
  }));

  await SheetsDB.appendRows(newSheetsRows);
  console.log(`\n📦 Google Sheets に ${newItems.length} 件を追加しました`);
  console.log(`\n🎉 完了！Slackで各コンテンツを確認・承認してください。`);
}

main().catch(console.error);
