import * as fs from 'fs';
import * as path from 'path';
import { google, drive_v3, sheets_v4 } from 'googleapis';
import { execSync } from 'child_process';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') });

const OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
const OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
const REDIRECT_URI = 'http://localhost:8080'; // Replaced OOB due to Google deprecation
const OAUTH_TOKEN_PATH = path.join(process.cwd(), 'scripts', 'data', 'token.json');

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
];

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

export async function getGoogleClient() {
  if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) {
    console.error('\n❌ GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET が .env に未設定です。');
    process.exit(1);
  }

  const oAuth2Client = new google.auth.OAuth2(OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, REDIRECT_URI);

  // Check if token exists in env or file
  let tokenData = null;
  if (process.env.GOOGLE_OAUTH_TOKEN_JSON) {
    try {
      tokenData = JSON.parse(process.env.GOOGLE_OAUTH_TOKEN_JSON);
    } catch (e) {
      console.error('Error parsing GOOGLE_OAUTH_TOKEN_JSON from env', e);
    }
  } else if (fs.existsSync(OAUTH_TOKEN_PATH)) {
    try {
      tokenData = JSON.parse(fs.readFileSync(OAUTH_TOKEN_PATH, 'utf8'));
    } catch (e) {
      console.error('Error reading token.json from file', e);
    }
  }

  if (tokenData) {
    try {
      oAuth2Client.setCredentials(tokenData);

      // access_token の期限切れを検知して自動リフレッシュ
      const now = Date.now();
      const expiryDate = tokenData.expiry_date || 0;
      if (expiryDate < now + 60_000) {
        // 期限切れ or 1分以内に切れる場合
        if (tokenData.refresh_token) {
          console.log('🔄 Google OAuth access_token が期限切れです。refresh_token で自動更新中...');
          const { credentials } = await oAuth2Client.refreshAccessToken();
          oAuth2Client.setCredentials(credentials);

          // 更新されたトークンをファイルに保存（refresh_token が消えないよう元のを維持）
          // Vercel等の読み取り専用ファイルシステムでは保存をスキップ
          const merged = { ...tokenData, ...credentials };
          if (!merged.refresh_token) merged.refresh_token = tokenData.refresh_token;
          try {
            if (!fs.existsSync(path.dirname(OAUTH_TOKEN_PATH))) {
              fs.mkdirSync(path.dirname(OAUTH_TOKEN_PATH), { recursive: true });
            }
            fs.writeFileSync(OAUTH_TOKEN_PATH, JSON.stringify(merged, null, 2));
            console.log('✅ トークンを自動更新し、ファイルに保存しました。');
          } catch {
            // Vercel serverless 等ではファイル書き込みが失敗するが、インメモリのトークンは有効
            console.log('✅ トークンを自動更新しました（サーバーレス環境のためファイル保存はスキップ）。');
          }
        } else {
          console.warn('⚠️ access_token が期限切れですが refresh_token がありません。再認証が必要です。');
          // refresh_token がない場合は再認証フローにフォールスルー
          tokenData = null;
        }
      }

      if (tokenData) return oAuth2Client;
    } catch (e) {
      console.error('Error setting/refreshing credentials, requiring re-auth.', e);
    }
  }

  // サーバーレス環境（Vercel等）では対話的な認証フローは不可能
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (isServerless) {
    throw new Error(
      'GOOGLE_AUTH_FAILED: サーバーレス環境でGoogle認証トークンが無効または期限切れです。' +
      'Vercelの環境変数 GOOGLE_OAUTH_TOKEN_JSON に refresh_token を含む有効なトークンを設定してください。' +
      '（ローカルで npx tsx scripts/reauth.ts を実行してトークンを取得できます）'
    );
  }

  // Initial Auth flow
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });

  console.log('\n🔐 【Google 認証が必要です (Drive & Sheets連携)】');
  try {
    execSync(`open "${authUrl}"`);
    console.log('\n✅ ブラウザで認証ページを開きました。');
  } catch {
    console.log('\n以下の URL をブラウザで手動で開いてください:');
    console.log('\n' + authUrl + '\n');
  }
  console.log('\nGoogleでログインし、「アクセスを許可」した後、表示された「http://localhost...」から始まるURL全体をコピーしてください。（ページがエラーになってもURLをコピーすればOKです）');

  const rawCode = await askQuestion('👉 アドレスバーのURL（またはコード）を貼り付けて Enter: ');
  
  let code = rawCode.trim();
  if (code.startsWith('http')) {
    const url = new URL(code);
    code = url.searchParams.get('code') || code;
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    if (!fs.existsSync(path.dirname(OAUTH_TOKEN_PATH))) {
      fs.mkdirSync(path.dirname(OAUTH_TOKEN_PATH), { recursive: true });
    }
    fs.writeFileSync(OAUTH_TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log(`\n✅ 認証完了！新しくトークンを保存しました。\n`);
    
    return oAuth2Client;
  } catch (error) {
    console.error('❌ 認証に失敗しました。コードが正しいか確認してください。', error);
    process.exit(1);
  }
}

export async function getDriveClient(): Promise<drive_v3.Drive> {
  const auth = await getGoogleClient();
  return google.drive({ version: 'v3', auth });
}

export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  const auth = await getGoogleClient();
  return google.sheets({ version: 'v4', auth });
}

export async function downloadFileJSON(
  drive: drive_v3.Drive,
  fileId: string
): Promise<any> {
  const res = await drive.files.get({
    fileId,
    alt: 'media',
  });
  return res.data;
}
