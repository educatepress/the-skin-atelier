import * as fs from 'fs';
import * as path from 'path';
import { google, drive_v3, sheets_v4 } from 'googleapis';
import { execSync } from 'child_process';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') });

const OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
const OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || '';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // Desktop app fallback
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
      return oAuth2Client;
    } catch (e) {
      console.error('Error setting credentials, requiring re-auth.', e);
    }
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
  console.log('\nGoogleでログインし、「アクセスを許可」した後、表示されたコードをコピーしてください。');

  const code = await askQuestion('👉 表示されたコードを貼り付けて Enter: ');

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
