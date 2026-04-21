/**
 * sheets.ts — Google Sheets キュー管理（サービスアカウント方式）
 *
 * the-skin-atelier (brand='atelier') 専用。
 * webpage.new (brand='book') と同一スプレッドシートを参照するが、
 * Phase 3 で atelier 専用シートに分離する予定。
 */
import { google } from 'googleapis';
import fs from 'fs';

export function getAtelierEnv(): Record<string, string> {
  const envPath = '/Users/satoutakuma/Desktop/hiroo-open/reels-factory-atelier/.env';
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env: Record<string, string> = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

export async function getGoogleAuthClient() {
  let credentials;

  const atelierEnv = getAtelierEnv();
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || atelierEnv.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson && serviceAccountJson.length > 10) {
    credentials = JSON.parse(serviceAccountJson);
  } else {
    const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
      || '/Users/satoutakuma/Desktop/hiroo-open/the-skin-atelier/credentials/drive-service-account.json';
    if (!fs.existsSync(keyPath)) {
      throw new Error('Google Service Account key not found.');
    }
    credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth.getClient();
}

// Phase 3 で atelier 専用シート ID に差し替え予定
export const QUEUE_SPREADSHEET_ID = '1HkBDRsLcCyyx59CdgU-H-LoVIAM6KkC9NPqMjtAfpsY';

// ============================================================================
// Queue Management
// ============================================================================

export type QueueItem = {
  content_id: string;
  brand: string;
  type: string;
  title: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  gdrive_url: string;
  generation_recipe: string;
  status: string;
  patrol_pre_result: string;
  scheduled_date: string;
  post_url: string;
  posted_at: string;
  patrol_post_result: string;
  cloudinary_deleted: string;
  slack_ts: string;
  error_detail: string;
  ymyl_evidence: string;
};

const HEADERS = [
  'content_id', 'brand', 'type', 'title', 'cloudinary_url', 'cloudinary_public_id', 'gdrive_url',
  'generation_recipe', 'status', 'patrol_pre_result', 'scheduled_date', 'post_url',
  'posted_at', 'patrol_post_result', 'cloudinary_deleted', 'slack_ts', 'error_detail', 'ymyl_evidence'
];

export async function addQueueItem(item: Partial<QueueItem>) {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  const rowData = HEADERS.map(header => item[header as keyof QueueItem] || '');

  await sheets.spreadsheets.values.append({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    range: 'A:R',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [rowData] }
  });
}

export async function getQueueItems(): Promise<(QueueItem & { rowNumber: number })[]> {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    range: 'A:R',
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) return [];

  const items: (QueueItem & { rowNumber: number })[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item: any = { rowNumber: i + 1 };
    HEADERS.forEach((header, index) => {
      item[header] = row[index] || '';
    });
    items.push(item as (QueueItem & { rowNumber: number }));
  }
  return items;
}

export async function updateQueueItem(rowNumber: number, updates: Partial<QueueItem>) {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  for (const [key, value] of Object.entries(updates)) {
    const colIndex = HEADERS.indexOf(key);
    if (colIndex === -1) continue;
    const colLetter = String.fromCharCode(65 + colIndex);
    await sheets.spreadsheets.values.update({
      spreadsheetId: QUEUE_SPREADSHEET_ID,
      range: `${colLetter}${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[value]] }
    });
  }
}

// ============================================================================
// Topics (ネタ帳)
// ============================================================================

export type TopicItem = {
  theme_id: string;
  brand: string;
  theme_text: string;
  status: string;
  used_date: string;
};

const TOPICS_HEADERS = ['theme_id', 'brand', 'theme_text', 'status', 'used_date'];
const TOPICS_SHEET_NAME = 'Topics';

export async function getTopics(): Promise<(TopicItem & { rowNumber: number })[]> {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: QUEUE_SPREADSHEET_ID,
      range: `${TOPICS_SHEET_NAME}!A:E`,
    });
    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];
    const items: (TopicItem & { rowNumber: number })[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const item: any = { rowNumber: i + 1 };
      TOPICS_HEADERS.forEach((header, index) => { item[header] = row[index] || ''; });
      items.push(item as (TopicItem & { rowNumber: number }));
    }
    return items;
  } catch (error) {
    console.error(`Failed to fetch topics:`, error);
    return [];
  }
}

export async function updateTopicStatus(rowNumber: number, status: string, usedDate: string, brand?: string) {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });
  await sheets.spreadsheets.values.update({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    range: `${TOPICS_SHEET_NAME}!D${rowNumber}:E${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[status, usedDate]] }
  });
  if (brand) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: QUEUE_SPREADSHEET_ID,
      range: `${TOPICS_SHEET_NAME}!B${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[brand]] }
    });
  }
}

// ============================================================================
// ThemeSchedule
// ============================================================================

export type ThemeScheduleItem = {
  date: string;
  brand: string;
  themeArea: string;
  theme: string;
  searchKeywords: string;
  referenceUrl: string;
  status: string;
  evidenceTier: string;
  limitations: string;
  rowNumber: number;
};

const THEME_SCHEDULE_SHEET_NAME = 'ThemeSchedule';
const THEME_SCHEDULE_HEADERS = ['date', 'brand', 'themeArea', 'theme', 'searchKeywords', 'referenceUrl', 'status', 'evidenceTier', 'limitations'];

export async function getThemeSchedule(dateStr: string, brandFilter: string): Promise<ThemeScheduleItem | null> {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: QUEUE_SPREADSHEET_ID,
      range: `${THEME_SCHEDULE_SHEET_NAME}!A:I`,
    });
    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === dateStr && row[1] === brandFilter) {
        const item: any = { rowNumber: i + 1 };
        THEME_SCHEDULE_HEADERS.forEach((header, index) => { item[header] = row[index] || ''; });
        return item as ThemeScheduleItem;
      }
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch ThemeSchedule:`, error);
    return null;
  }
}

export async function updateThemeScheduleStatus(rowNumber: number, newStatus: string): Promise<void> {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });
  await sheets.spreadsheets.values.update({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    range: `ThemeSchedule!G${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[newStatus]] }
  });
}

// ============================================================================
// PostMetrics シート (X パフォーマンス監視)
// ============================================================================

export type PostMetric = {
  content_id: string;
  tweet_id: string;
  posted_date: string;
  pattern_type: string;
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  last_updated: string;
};

const POST_METRICS_SHEET = 'PostMetrics';
const POST_METRICS_HEADERS = [
  'content_id', 'tweet_id', 'posted_date', 'pattern_type',
  'impressions', 'likes', 'retweets', 'replies', 'quotes', 'bookmarks', 'last_updated'
];

export async function appendOrUpdateMetric(metric: PostMetric) {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });

  // 既存行を検索
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: QUEUE_SPREADSHEET_ID,
      range: `${POST_METRICS_SHEET}!A:A`,
    });
    const rows = res.data.values || [];
    let existingRow = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === metric.content_id) {
        existingRow = i + 1;
        break;
      }
    }

    const rowData = POST_METRICS_HEADERS.map(h => {
      const val = metric[h as keyof PostMetric];
      return val !== undefined ? String(val) : '';
    });

    if (existingRow > 0) {
      // 既存行を更新
      await sheets.spreadsheets.values.update({
        spreadsheetId: QUEUE_SPREADSHEET_ID,
        range: `${POST_METRICS_SHEET}!A${existingRow}:K${existingRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
    } else {
      // 新規行を追加
      await sheets.spreadsheets.values.append({
        spreadsheetId: QUEUE_SPREADSHEET_ID,
        range: `${POST_METRICS_SHEET}!A:K`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
    }
  } catch (e: any) {
    // シートが存在しない場合はヘッダー行を含めて作成
    if (e.message?.includes('Unable to parse range') || e.code === 400) {
      console.log('📊 PostMetrics sheet not found, creating with headers...');
      const rowData = POST_METRICS_HEADERS.map(h => {
        const val = metric[h as keyof PostMetric];
        return val !== undefined ? String(val) : '';
      });
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: QUEUE_SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: POST_METRICS_SHEET } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: QUEUE_SPREADSHEET_ID,
        range: `${POST_METRICS_SHEET}!A1:K1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [POST_METRICS_HEADERS] },
      });
      await sheets.spreadsheets.values.append({
        spreadsheetId: QUEUE_SPREADSHEET_ID,
        range: `${POST_METRICS_SHEET}!A:K`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
      });
    } else {
      throw e;
    }
  }
}

// ============================================================================
// Prompts シート
// ============================================================================

export type PromptsRow = {
  brand: string;
  persona: string;
  target_audience: string;
  tone_and_style: string;
  cta_template: string;
  forbidden_rules: string;
};

export async function getPrompts(): Promise<PromptsRow[]> {
  const auth = await getGoogleAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: auth as any });
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: QUEUE_SPREADSHEET_ID,
      range: 'prompts!A2:F'
    });
    const rows = res.data.values || [];
    return rows.map(r => ({
      brand: r[0] || '', persona: r[1] || '', target_audience: r[2] || '',
      tone_and_style: r[3] || '', cta_template: r[4] || '', forbidden_rules: r[5] || ''
    }));
  } catch (e: any) {
    console.warn('⚠️ prompts sheet not found:', e.message);
    return [];
  }
}
