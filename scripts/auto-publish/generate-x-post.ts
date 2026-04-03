import { GoogleGenAI } from "@google/genai";
import { WebClient } from '@slack/web-api';
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { SheetsDB } from "../lib/sheets-db";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") }); // Also load .env for Slack token

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ エラー: GEMINI_API_KEY が設定されていません。");
  process.exit(1);
}

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const TARGET_CHANNEL = 'skin-atelier_jp'; // XとBlogはskin-atelier_jpへ

const ai = new GoogleGenAI({ apiKey });
const slackClient = new WebClient(SLACK_BOT_TOKEN);

/**
 * X (Twitter) 用の投稿文を生成する（3〜5ポストのスレッド形式）
 */
async function generateXPost(theme: string, sceneContext: string) {
  console.log(`✍️ 拡散スレッド（X/Twitter）を生成中...`);

  const promptPath = path.join(process.cwd(), "..", "the-skin-atelier", "prompts", "multi-platform-content-prompts.md");
  let masterPrompt = "";
  try { masterPrompt = fs.readFileSync(promptPath, "utf-8"); } catch (e) { console.error("Could not read prompt MD", e); }

  const prompt = `
    以下のルールに従いXのスレッド（3〜5ポスト）を作成してください。
    特にMarkdownの【2. 【X (Twitter) / Threads 用】】の指示を絶対に守ること。

    【ルール元ファイル抜粋】:
    ${masterPrompt}

    【今回のインプット】
    ・テーマ：${theme}
    ・今日のきっかけ（Scene）：${sceneContext || '本日の診察での気づき'}

    ※余計なマークダウン（\`\`\`など）を使わず、そのままコピペして使えるプレーンテキストを出力してください。スレッドの区切りは「---」としてください。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}

/**
 * Slackへ承認ブロックを送信する
 */
async function sendSlackApprovalMessage(contentId: string, slug: string, captionText: string): Promise<string | undefined> {
  console.log(`📤 Slack へ承認メッセージを送信中...`);
  
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🐦 *X (Twitter) 投稿*: \`${slug}\`\n【配信先: 🟦 hiroo-open / Dr. Miyaka】`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📝 *投稿内容 (スレッド):*\n> ${captionText.replace(/\n/g, '\n> ')}`
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '✅ 承認', emoji: true },
          style: 'primary',
          action_id: 'approve_content',
          value: JSON.stringify({ id: contentId, batchId: 'auto-x', brand: 'atelier' }),
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '❌ 却下', emoji: true },
          style: 'danger',
          action_id: 'reject_content',
          value: JSON.stringify({ id: contentId, brand: 'atelier' }),
        },
      ]
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '✨ この案で手動ポスト/編集する (Xアプリ起動)', emoji: true },
          style: 'primary',
          url: `https://x.com/intent/tweet?text=${encodeURIComponent(captionText)}`.substring(0, 3000),
          action_id: `intent_tweet_${contentId}`
        }
      ]
    },
    { type: 'divider' },
  ];

  try {
    const result = await slackClient.chat.postMessage({
      channel: TARGET_CHANNEL,
      text: `🐦 X投稿 ${slug} — レビュー待ち`,
      blocks,
    });
    console.log(`✅ Slack通知完了: ${result.ts}`);
    return result.ts as string;
  } catch (error) {
    console.error(`❌ Slack通知エラー:`, error);
    return undefined;
  }
}

/**
 * メイン実行関数
 */
async function main() {
  const todayStr = new Date().toISOString().split('T')[0];
  const args = process.argv.slice(2);
  const theme = args[0] || "春のゆらぎ肌と花粉によるスキンケア";
  const sceneContext = args[1] || "最新の医学論文や自身のスキンケア経験から得られた客観的な気づき。架空の患者は絶対に出さないこと。";
  const slug = `x-${todayStr}-${Math.random().toString(36).substring(7)}`;
  const contentId = `x-${todayStr}-${slug}`;

  try {
    // 1. AIで投稿文を生成
    const generatedText = await generateXPost(theme, sceneContext);
    const cleanText = generatedText?.replace(/^```\n/gm, "").replace(/```$/gm, "").trim() || "";
    console.log("\n==============================");
    console.log(cleanText);
    console.log("==============================\n");

    // 2. Slackへ承認申請
    const slackTs = await sendSlackApprovalMessage(contentId, slug, cleanText);

    // 3. Google Sheetsへ保存 (キュー登録)
    const newRow = {
      content_id: contentId,
      brand: 'atelier',
      type: 'x',
      title: slug,
      generation_recipe: JSON.stringify({
        captionText: cleanText,
        theme,
        sceneContext
      }),
      status: 'pending',
      slack_ts: slackTs || '',
    };

    console.log(`📦 Google Sheets にキューを登録中...`);
    await SheetsDB.appendRows([newRow]);
    console.log(`🎉 キュー登録完了！Slackで確認・承認してください。`);

  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
  }
}

main();
