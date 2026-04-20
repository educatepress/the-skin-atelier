/**
 * ================================================================
 *  x-variety-single.ts — X Variety Post Generator
 *
 *  5種類のバイラルパターンから1つを選んで、単発ツイートを生成して即投稿。
 *  複数回/日走らせることで、1日のX発信量を爆増させる。
 *
 *  Pattern types:
 *    - myth     : 神話崩し   (controversy → virality)
 *    - evidence : 論文引用   (authority → save-bait)
 *    - contrast : 対比       (save-bait → shareable)
 *    - confession: 告白      (emotional → follow-bait)
 *    - qa       : Q&A即答    (search + reply-bait)
 *
 *  Usage:
 *    npx tsx scripts/auto-publish/x-variety-single.ts --type=myth
 *    npx tsx scripts/auto-publish/x-variety-single.ts --type=random
 * ================================================================
 */
import { GoogleGenAI } from "@google/genai";
import { TwitterApi } from "twitter-api-v2";
import { WebClient } from "@slack/web-api";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { SheetsDB } from "../lib/sheets-db";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY が未設定です");
  process.exit(1);
}

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const TARGET_CHANNEL = "skin-atelier_jp";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const slackClient = new WebClient(SLACK_BOT_TOKEN);

// 5 Pattern types
type PatternType = "myth" | "evidence" | "contrast" | "confession" | "qa";

const PATTERN_DESCRIPTIONS: Record<PatternType, string> = {
  myth: "神話崩しツイート (controversy)",
  evidence: "論文引用ツイート (authority)",
  contrast: "対比ツイート (save-bait)",
  confession: "告白ツイート (emotional)",
  qa: "Q&A即答ツイート (search + reply)",
};

// ---------- withRetry ----------
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5, baseDelay = 10000): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt === maxRetries || err?.status !== 503) throw err;
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 60000);
      console.log(`⏳ API混雑中 (503)… ${delay / 1000}秒後にリトライ (${attempt}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

// ---------- Prompt file loader ----------
function loadViralPatternsDoc(): string {
  const candidates = [
    path.join(process.cwd(), "prompts", "x-viral-patterns.md"),
    path.join(process.cwd(), "..", "the-skin-atelier", "prompts", "x-viral-patterns.md"),
    path.resolve(__dirname, "..", "..", "prompts", "x-viral-patterns.md"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p, "utf-8");
    } catch {}
  }
  console.warn("⚠️ x-viral-patterns.md not found. Falling back to minimal prompt.");
  return "";
}

// ---------- Theme selection ----------
async function pickTheme(): Promise<{ theme: string; searchKeywords: string }> {
  const schedules = (await SheetsDB.getThemeSchedule()) || [];
  const pendingAtelier = schedules.filter(
    (s) => s.brand === "atelier" && (s.status === "pending" || s.status === "completed")
  );
  if (pendingAtelier.length === 0) {
    return {
      theme: "美容皮膚科医として大切にしていること",
      searchKeywords: "evidence-based beauty medicine inner wellness",
    };
  }
  // Use the most recently scheduled theme (tomorrow or most recent)
  // This aligns with the main blog content so X stays topical
  const latest = pendingAtelier[pendingAtelier.length - 1];
  return { theme: latest.theme, searchKeywords: latest.searchKeywords };
}

// ---------- Generator ----------
async function generateVarietyPost(type: PatternType, theme: string): Promise<string> {
  const viralDoc = loadViralPatternsDoc();
  const typeBlock = `
    今回のパターン: **${type}** (${PATTERN_DESCRIPTIONS[type]})

    上記 x-viral-patterns.md の該当パターンの「構造」と「具体例」を厳密に踏襲してください。
    今日のテーマは以下の通りですが、無理に押し込まず、パターン本来の力が出るように自由にアレンジしてOK:
    【テーマ】: ${theme}
  `;

  const prompt = `
    あなたは美容皮膚科医 Dr. Miyaka 本人として、X (Twitter) に投稿する**単発ツイート1本**を作成してください。

    【参照ドキュメント — x-viral-patterns.md】
    ${viralDoc}

    ${typeBlock}

    【出力要件】
    - 本文のみ（前置き、「承知しました」等一切不要）
    - ツイート本文（日本語で140文字以内、全角換算）
    - ハッシュタグは本文末尾に 2-4個（hashtag-strategy.md参照可能なら参照）
    - 絵文字は最小限 (1-2個まで)
    - 末尾に余計な改行や記号を付けない
    - コードブロック (\`\`\`) で囲わない

    【禁止ワード】
    - 「白金高輪」「広尾」「当院」「開業」「オープン」
    - 「分子栄養学」「オーソモレキュラー」
    - 具体的な価格・料金
    - 「絶対」「最高」「No.1」
    - 架空の患者エピソード

    ツイート本文だけを出力してください。
  `;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
  );

  const text = response.text || "";
  return text
    .replace(/^```\n?/gm, "")
    .replace(/```$/gm, "")
    .trim();
}

// ---------- Slack notification ----------
async function notifySlack(type: PatternType, tweet: string, tweetUrl?: string) {
  if (!SLACK_BOT_TOKEN) return;
  const icon = {
    myth: "🔥",
    evidence: "📚",
    contrast: "⚖️",
    confession: "💌",
    qa: "💭",
  }[type];
  try {
    await slackClient.chat.postMessage({
      channel: TARGET_CHANNEL,
      text: `${icon} X Variety Post (${type}) 投稿完了`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${icon} *X Variety Post* - パターン: \`${type}\` (${PATTERN_DESCRIPTIONS[type]})\n${tweetUrl ? `<${tweetUrl}|ツイートを見る>` : ""}`,
          },
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: `\`\`\`${tweet}\`\`\`` },
        },
      ],
    });
  } catch (e: any) {
    console.warn("⚠️ Slack notification failed:", e.message);
  }
}

// ---------- Twitter Post ----------
async function postToTwitter(tweet: string): Promise<string> {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });
  const result = await client.v2.tweet(tweet);
  const tweetId = result.data.id;
  return `https://twitter.com/dr_miyaka_skin/status/${tweetId}`;
}

// ---------- Main ----------
async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find((a) => a.startsWith("--type="))?.split("=")[1] || "random";
  const dryRun = args.includes("--dry-run");

  let selectedType: PatternType;
  if (typeArg === "random") {
    const types: PatternType[] = ["myth", "evidence", "contrast", "confession", "qa"];
    selectedType = types[Math.floor(Math.random() * types.length)];
  } else if (["myth", "evidence", "contrast", "confession", "qa"].includes(typeArg)) {
    selectedType = typeArg as PatternType;
  } else {
    console.error(`❌ Invalid --type: ${typeArg}. Use myth/evidence/contrast/confession/qa/random`);
    process.exit(1);
  }

  console.log(`🎨 Pattern: ${selectedType} (${PATTERN_DESCRIPTIONS[selectedType]})`);

  try {
    const { theme } = await pickTheme();
    console.log(`📌 Theme: ${theme}`);

    const tweet = await generateVarietyPost(selectedType, theme);
    console.log("\n====== 生成されたツイート ======");
    console.log(tweet);
    console.log("================================\n");

    // Validation: 140 chars max (rough check; full-width chars counted)
    if (tweet.length > 280) {
      console.warn(`⚠️ ツイートが長すぎる可能性 (${tweet.length} chars)。送信を中止します。`);
      await notifySlack(selectedType, `⚠️ 長すぎて送信中止: ${tweet.substring(0, 100)}...`);
      process.exit(1);
    }

    if (dryRun) {
      console.log("🧪 --dry-run 指定のため送信スキップ");
      return;
    }

    // Post
    const tweetUrl = await postToTwitter(tweet);
    console.log(`✅ Twitter投稿完了: ${tweetUrl}`);

    // Slack notify
    await notifySlack(selectedType, tweet, tweetUrl);
  } catch (error: any) {
    console.error("❌ エラー:", error);
    try {
      if (SLACK_BOT_TOKEN) {
        await slackClient.chat.postMessage({
          channel: TARGET_CHANNEL,
          text: `🚨 *X Variety Post 失敗* (${selectedType})\n\`\`\`${error.message || error}\`\`\``,
        });
      }
    } catch {}
    process.exit(1);
  }
}

main();
