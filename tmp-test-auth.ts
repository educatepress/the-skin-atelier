import * as fs from 'fs';
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const c = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET
);
c.setCredentials(JSON.parse(fs.readFileSync('../reels-factory-atelier/credentials/oauth-token.json', 'utf8')));

const drive = google.drive({version: 'v3', auth: c});
drive.files.list({pageSize: 1}).then(() => console.log('✅ Alive')).catch(e => console.log('❌ Dead', e.message));
