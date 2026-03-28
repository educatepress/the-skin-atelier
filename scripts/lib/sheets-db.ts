import { getSheetsClient } from './google-client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_QUEUE_ID;

export const HEADERS = [
  'content_id',
  'brand',
  'type',
  'title',
  'cloudinary_url',        // CSV or JSON for carousels
  'cloudinary_public_id',  // CSV or JSON for carousels
  'gdrive_url',
  'generation_recipe',     // JSON string containing sourceDir, caption, etc.
  'status',
  'patrol_pre_result',
  'scheduled_date',
  'post_url',
  'posted_at',
  'patrol_post_result',
  'cloudinary_deleted',
  'slack_ts',
  'error_detail'
];

export interface SheetsQueueRow {
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
}

export class SheetsDB {
  private static async getClient() {
    if (!SPREADSHEET_ID) throw new Error('GOOGLE_SHEETS_QUEUE_ID is not set in .env');
    return await getSheetsClient();
  }

  // 行データを取得
  static async getRows(): Promise<SheetsQueueRow[]> {
    const sheets = await this.getClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A2:Q'
    }).catch(() => null);

    const rows = res?.data?.values || [];
    return rows.map(row => {
      const obj: any = {};
      HEADERS.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj as SheetsQueueRow;
    });
  }

  // 新規行を追加
  static async appendRows(rows: Partial<SheetsQueueRow>[]) {
    if (rows.length === 0) return;
    const sheets = await this.getClient();

    const values = rows.map(row => {
      return HEADERS.map(header => (row as any)[header] || '');
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A2:Q',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });
  }

  // content_idに基づいて行を更新
  static async updateRow(content_id: string, updates: Partial<SheetsQueueRow>) {
    const sheets = await this.getClient();
    
    // 現在のデータを取得して行番号を特定
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A2:A'
    });
    
    const ids = response.data.values || [];
    const rowIndex = ids.findIndex(row => row[0] === content_id);
    
    if (rowIndex === -1) {
      console.warn(`content_id: ${content_id} not found in Sheets.`);
      return false;
    }

    const actualRowNumber = rowIndex + 2; // ヘッダーが1行目、配列は0からなので+2

    // 更新する列だけを特定してAPIを叩く
    const dataToUpdate = [];
    for (const key of Object.keys(updates)) {
      const colIndex = HEADERS.indexOf(key);
      if (colIndex !== -1) {
        const letter = String.fromCharCode(65 + colIndex); // A, B, C...
        dataToUpdate.push({
          range: `${letter}${actualRowNumber}`,
          values: [[(updates as any)[key]]]
        });
      }
    }

    if (dataToUpdate.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: dataToUpdate
        }
      });
      return true;
    }
    return false;
  }
}
