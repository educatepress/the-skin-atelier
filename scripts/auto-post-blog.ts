import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { SheetsDB } from "./lib/sheets-db";
import { WebClient } from '@slack/web-api';
import { createClient } from 'pexels';

// .env.localから環境変数を読み込む
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// APIキーの確認
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("エラー: GEMINI_API_KEY が .env.local に設定されていません。");
  process.exit(1);
}

// Geminiクライアントの初期化
const ai = new GoogleGenAI({ apiKey });

// Slack連携の初期化
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const TARGET_CHANNEL = 'skin-atelier_jp';
const slackClient = new WebClient(SLACK_BOT_TOKEN);

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 10000): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRetryable = err?.status === 503 || err?.code === 'UND_ERR_HEADERS_TIMEOUT' || err?.message?.includes('Timeout') || err?.message?.includes('fetch failed');
      if (attempt === maxRetries || !isRetryable) throw err;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`⏳ API混雑中またはタイムアウト… ${delay / 1000}秒後にリトライ (${attempt}/${maxRetries})`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

async function performDeepResearch(theme: string) {
  console.log(`🔍 テーマ「${theme}」についてDeep Researchを実行中...`);
  
  const researchPrompt = `
    あなたは美容医学のリサーチャーです。以下のテーマについて、最新の医学的知見やトレンドをGoogle検索を用いて調査し、要点をまとめてください。
    テーマ: ${theme}
  `;

  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: researchPrompt,
  }));

  return response.text;
}

async function fetchAestheticImage(): Promise<string> {
  try {
    const poolDir = path.join(process.cwd(), "public", "images", "pool");
    if (fs.existsSync(poolDir)) {
      const files = fs.readdirSync(poolDir).filter(f => f.endsWith('.webp'));
      if (files.length > 0) {
        const randomImg = files[Math.floor(Math.random() * files.length)];
        console.log(`Using pool image: /images/pool/${randomImg}`);
        return `/images/pool/${randomImg}`;
      }
    }
  } catch (e) { console.error("Pool error:", e); }

  console.log("Falling back to Pexels...");
  try {
    const PEXELS_KEY = process.env.PEXELS_API_KEY;
    if (!PEXELS_KEY) return "";
    const pexels = createClient(PEXELS_KEY);
    const keywords = ["minimalist cosmetic bottle", "white silk fabric aesthetic", "modern monochrome minimal beauty"];
    const query = keywords[Math.floor(Math.random() * keywords.length)];
    const res = await pexels.photos.search({ query, per_page: 15, orientation: "square" });
    if ('photos' in res && res.photos.length > 0) {
      const idx = Math.floor(Math.random() * res.photos.length);
      return res.photos[idx].src.large;
    }
  } catch(e) { console.error("Pexels error:", e); }
  return ""; 
}

async function generateBlogPost(theme: string, researchData: string, imageUrl: string) {
  console.log(`✍️ 記事を生成中（Elegant Letter Style）...`);

  const promptPath = path.join(process.cwd(), "..", "the-skin-atelier", "prompts", "blog-writing-guide.md");
  let masterPrompt = "";
  try { masterPrompt = fs.readFileSync(promptPath, "utf-8"); } catch (e) { console.error("Could not read prompt MD", e); }

  const writingPrompt = `
    以下の【The Skin Atelier — ブログ執筆ガイドライン＆プロンプト】に完全に従って、ブログ記事を作成してください。
    特に【出力フォーマット】の構造を厳守すること。

    【ガイドライン元ファイル抜粋】:
    ${masterPrompt}

    【テーマ】: ${theme}
    【リサーチデータ】: ${researchData}
    
    ---
    title: "記事のタイトル"
    excerpt: "100文字程度の概要"
    date: "YYYY-MM-DD"
    category: "Skincare"
    readTime: "〇 min read"
    featured: false
    image: "${imageUrl}"
    ---
    
    ## Dear You, 
    ## まず、お伝えしたい大切なこと
    ## 美しさを紐解く、専門医の視点
    ## あなたの不安に寄り添って
    ## 最後に、心を込めて。

    ![Dr. Miyaka Signature](/images/miyaka-signature-new.png)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: writingPrompt,
  });

  return response.text;
}

async function reviewArticle(articleMdx: string) {
  console.log(`🧐 生成された記事を自動で検閲・修正中...`);

  const reviewPrompt = `
    あなたは医療法務部およびVOGUEの編集長です。
    以下の【ブログ原稿】を厳格に検閲し、問題があれば修正した完全なMDXを返してください。
    問題がなければ、そのままのMDXを返してください。

    【検閲基準：シルクトーン・フィルタ5箇条】
    1. 過剰なセールスの排除（Trust First）: 「絶対治る」「最高」「No.1」などの誇大・断定表現がないか。
    2. 「あなた・私」の黄金比（Empathy）: 説教臭くなっていないか。親しい友人に宛てた手紙のような、優しく品のある日本語（余白を感じる文体）になっているか。
    3. 専門医としての客観的トーン（Safety）: 流行りに乗るだけでなく、「いまのあなたには強いかもしれない」といった誠実さがあるか。
    4. フォーマット: 指定された見出し（Dear You, など）や、最後に必ず「あなたの不安に寄り添って（働く女性目線の人肌感ある回答）」とサイン画像が入っているか。
    5. 秘密保持（Confidentiality）: 「白金高輪」「広尾」といった具体的な地名や、自身のクリニックの「開業・開院」に関する言及がないか。また、「当院では」「私のクリニックでは」「私のアトリエでは」等のフレーズがあれば完全に削除・修正すること。
    6. パラグラフ・ライティングの徹底（Readability）: 1つの段落に複数のトピックが詰め込まれておらず、「最初の1文で結論」が徹底されているか厳しくチェックすること。

    【ブログ原稿】
    ${articleMdx}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: reviewPrompt,
  });

  return response.text;
}

async function main() {
  console.log("🚀 ブログ自動生成プロセスを開始します...\n");

  const todayStr = new Date().toISOString().split('T')[0];
  const args = process.argv.slice(2);
  let todayTheme = args[0];
  let searchKeywords = "";

  try {
    const schedules = await SheetsDB.getThemeSchedule();
    if (schedules && schedules.length > 0) {
      // Find today's row for "atelier" brand
      const todayRow = schedules.find(r => r.date === todayStr && r.brand === "atelier");
      if (!todayTheme && todayRow && todayRow.theme) {
        console.log(`📅 今日のスケジュールされたテーマを発見 [${todayRow.themeArea}]: ${todayRow.theme}`);
        todayTheme = todayRow.theme;
        searchKeywords = todayRow.searchKeywords || "";
        await SheetsDB.updateThemeStatus(todayStr, "posted");
      }
    }
  } catch (error) {
    console.error("⚠️ テーマスケジュールの取得に失敗しました。フォールバックします。", error);
  }

  if (!todayTheme) {
    todayTheme = "春のゆらぎ肌と花粉による肌荒れのメカニズムと正しいスキンケア";
    console.log(`ℹ️ スケジュールが見つからないため、デフォルトテーマで実行します: ${todayTheme}`);
  }

  const slug = `blog-auto-${todayStr}-${Math.random().toString(36).substring(7)}`;
  const contentId = `blog-${todayStr}-${slug}`;

  try {
    const researchQuery = searchKeywords ? `${todayTheme} ${searchKeywords}` : todayTheme;
    const researchResult = await performDeepResearch(researchQuery);
    console.log("✅ リサーチ完了\n");

    console.log("📸 LP用のサムネイル画像を取得中...");
    const imageUrl = await fetchAestheticImage();

    const articleMdx = await generateBlogPost(todayTheme, researchResult || "", imageUrl);
    console.log("✅ 記事生成完了\n");

    const rawMdx = articleMdx || "";
    const reviewedMdx = await reviewArticle(rawMdx);
    console.log("✅ 自動検閲・修正完了\n");

    const cleanMdx = reviewedMdx?.replace(/^```markdown\n/, "").replace(/\n```$/, "") || "";

    const newRow = {
      content_id: contentId,
      brand: 'atelier',
      type: 'blog',
      title: slug,
      generation_recipe: JSON.stringify({
        captionText: cleanMdx,
        theme: todayTheme
      }),
      status: 'pending',
    };

    console.log(`📦 Google Sheets にブログ記事をキュー登録中...`);
    await SheetsDB.appendRows([newRow]);

    console.log(`📤 Slack へ承認メッセージを送信中...`);
    
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📝 *ブログ記事*: \`${slug}\`\n【配信先: 🟦 hiroo-open / The Skin Atelier】\n\n※本文はスレッド内のファイルをクリックして確認してください 👇`
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
            value: JSON.stringify({ id: contentId, batchId: 'auto-blog', brand: 'atelier' }),
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❌ 却下', emoji: true },
            style: 'danger',
            action_id: 'reject_content',
            value: JSON.stringify({ id: contentId, brand: 'atelier' }),
          },
        ]
      }
    ];

    try {
      const result = await slackClient.chat.postMessage({
        channel: TARGET_CHANNEL,
        text: `📝 ブログ記事 ${slug} — レビュー待ち`,
        blocks,
      });
      console.log(`✅ Slack親通知完了: ${result.ts}`);
      
      if (result.ts) {
        await slackClient.files.uploadV2({
           channel_id: TARGET_CHANNEL,
           thread_ts: result.ts,
           content: cleanMdx,
           filename: `${slug}.md`,
           title: "記事全文",
           initial_comment: "クリックして全文を確認してください✨"
        });
        await SheetsDB.updateRow(contentId, { slack_ts: result.ts });
      }
    } catch (error) {
      console.error(`❌ Slack通知エラー:`, error);
    }

    console.log(`🎉 キュー登録＆Slack通知完了！`);

  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
  }
}

main();
