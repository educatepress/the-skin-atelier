import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function main() {
  const factoryDir = path.join(__dirname, "..", "..", "reels-factory-atelier");
  const atelierDir = path.join(__dirname, "..");
  
  const bankPath = path.join(factoryDir, "scripts", "data", "topics-bank.json");

  console.log("🧹 1. Cleaning up old pending topics in topics-bank.json...");
  let bank = JSON.parse(fs.readFileSync(bankPath, "utf-8"));
  let cleanCount = 0;
  for (const t of bank) {
    if (["pending", "scripted", "generated"].includes(t.status) || ["pending", "generated"].includes(t.carouselStatus)) {
      t.status = "uploaded"; // mark as done to skip
      t.carouselStatus = "uploaded"; // mark as done to skip
      cleanCount++;
    }
  }
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));
  console.log(`✅ Cleared ${cleanCount} old items.`);

  console.log("🔬 2. Running Research (research-auto.ts atelier)...");
  execSync("npx tsx scripts/research-auto.ts atelier", { cwd: factoryDir, stdio: "inherit" });

  // Read the newest topic
  bank = JSON.parse(fs.readFileSync(bankPath, "utf-8"));
  let newestTopic = null;
  // Get the last added topic that is "scripted" or "pending"
  for (let i = bank.length - 1; i >= 0; i--) {
    if (bank[i].brand === "atelier" && (bank[i].status === "pending" || bank[i].status === "scripted")) {
      newestTopic = bank[i];
      break;
    }
  }

  if (!newestTopic) {
    console.error("❌ 最新のテーマが見つかりません。");
    process.exit(1);
  }

  const themeArg = newestTopic.title || newestTopic.themeArea || "春のスキンケア";
  const hookArg = newestTopic.hook || "最近のお悩みについて";

  console.log(`\n🎯 ターゲットテーマ: ${themeArg}\n`);

  console.log("📝 3. Running Blog post generation...");
  execSync(`npx tsx scripts/auto-post-blog.ts "${themeArg}"`, { cwd: atelierDir, stdio: "inherit" });

  console.log("🐦 4. Running X post generation...");
  execSync(`npx tsx scripts/auto-publish/generate-x-post.ts "${themeArg}" "${hookArg}"`, { cwd: atelierDir, stdio: "inherit" });

  console.log("🎬 5. Running Reel script/carousel generation...");
  // Note: if research-auto created it as `scripted`, generate-script might skip it. 
  // Let's force it to pending if needed.
  newestTopic.status = "pending";
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));

  execSync("npm run script:gen", { cwd: factoryDir, stdio: "inherit" });
  execSync("npm run carousel:gen", { cwd: factoryDir, stdio: "inherit" });

  console.log("🎥 6. Running Video Batch & Render...");
  execSync("npm run batch", { cwd: factoryDir, stdio: "inherit" });

  console.log("📤 7. Running Drive Upload...");
  execSync("npx tsx scripts/auto-publish/upload-to-drive.ts", { cwd: atelierDir, stdio: "inherit" });

  console.log("✅ 8. Running Slack Approval...");
  execSync("npx tsx scripts/auto-publish/send-slack-approval.ts", { cwd: atelierDir, stdio: "inherit" });

  console.log("🔍 9. Running X Patrol...");
  execSync("bash scripts/auto-publish/run-x-patrol.sh", { cwd: atelierDir, stdio: "inherit" });

  console.log("🎉 All E2E Tests Completed Successfully!");
}

main().catch(console.error);
