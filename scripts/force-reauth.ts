import { getGoogleClient } from './lib/google-client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const tokenPath = path.join(process.cwd(), 'scripts', 'data', 'token.json');
  if (fs.existsSync(tokenPath)) {
    fs.unlinkSync(tokenPath);
  }
  
  // We must delete the broken token from memory so google-client forces re-auth
  delete process.env.GOOGLE_OAUTH_TOKEN_JSON;

  console.log("🚨 古い認証情報をリセットしました。Googleの再認証を開始します...");
  
  try {
    const client = await getGoogleClient();
    console.log("✅ 認証に成功しました！");
    
    if (fs.existsSync(tokenPath)) {
      const tokenObj = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      const singleLineToken = JSON.stringify(tokenObj);
      console.log("\n=======================================================");
      console.log("👇 次の1行をコピーして、Vercelの GOOGLE_OAUTH_TOKEN_JSON に貼り付けてください 👇");
      console.log("=======================================================\n");
      console.log(singleLineToken);
      console.log("\n=======================================================");
    }
  } catch(e) {
    console.error("Auth failed:", e);
  }
}
run();
