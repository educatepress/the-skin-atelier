/**
 * sheets-rest.ts — Slack 承認ハンドラ用のスプレッドシート更新（サービスアカウント方式）
 *
 * the-skin-atelier 専用。content_id ベースで行を検索して更新する。
 * src/lib/sheets.ts の認証と SPREADSHEET_ID を共有。
 */
import { google } from 'googleapis';
import { getGoogleAuthClient, QUEUE_SPREADSHEET_ID } from './sheets';

export const HEADERS = [
  'content_id', 'brand', 'type', 'title', 'cloudinary_url', 'cloudinary_public_id', 'gdrive_url',
  'generation_recipe', 'status', 'patrol_pre_result', 'scheduled_date', 'post_url',
  'posted_at', 'patrol_post_result', 'cloudinary_deleted', 'slack_ts', 'error_detail',
  'ymyl_evidence'
];

async function getSheetsClient() {
  const auth = await getGoogleAuthClient();
  return google.sheets({ version: 'v4', auth: auth as any });
}

export async function getSheetsRows() {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    range: 'シート1!A2:R'
  });
  const rows = res.data.values || [];
  return rows.map((row: any[]) => {
    const obj: Record<string, string> = {};
    HEADERS.forEach((header, index) => { obj[header] = row[index] || ''; });
    return obj;
  });
}

export async function updateSheetRow(contentId: string, updates: Record<string, string>) {
  const sheets = await getSheetsClient();

  const idsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    range: 'シート1!A2:A'
  });
  const ids = idsResponse.data.values || [];
  const rowIndex = ids.findIndex((row: any[]) => row[0] === contentId);
  if (rowIndex === -1) return false;

  const actualRowNumber = rowIndex + 2;

  const data: { range: string; values: string[][] }[] = [];
  for (const key of Object.keys(updates)) {
    const colIndex = HEADERS.indexOf(key);
    if (colIndex !== -1) {
      const letter = String.fromCharCode(65 + colIndex);
      data.push({
        range: `シート1!${letter}${actualRowNumber}`,
        values: [[updates[key]]]
      });
    }
  }
  if (data.length === 0) return false;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: QUEUE_SPREADSHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data }
  });
  return true;
}
