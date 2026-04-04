import { getGoogleClient } from "./lib/google-client";

async function main() {
  console.log("🔄 Google APIの再認証プロセスを開始します...");
  await getGoogleClient();
  console.log("🎉 完了しました！自動化フローが利用可能です。");
}

main().catch(console.error);
