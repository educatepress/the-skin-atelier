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

/**
 * Helper: リトライ付きAPI呼び出し (503対策)
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 10000): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt === maxRetries || err?.status !== 503) throw err;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`⏳ API混雑中 (503)… ${delay / 1000}秒後にリトライ (${attempt}/${maxRetries})`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

/**
 * 1. Deep Research（Google検索を活用した情報収集）
 * ※プロンプトは後日推敲予定のため、仮のシンプルな状態にしています。
 */
async function performDeepResearch(theme: string) {
  console.log(`🔍 テーマ「${theme}」についてDeep Researchを実行中...`);
  
  const researchPrompt = `
    あなたは美容医学のリサーチャーです。以下のテーマについて、最新の医学的知見やトレンドをGoogle検索を用いて調査し、要点をまとめてください。
    テーマ: ${theme}
  `;

  // Gemini 2.5 Pro + Google Search Grounding（リトライ付き）
  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: researchPrompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  }));

  return response.text;
}

/**
 * 2. 記事用の画像自動取得 (ローカルのプールから選定)
 */
async function fetchAestheticImage(): Promise<string> {
  try {
    const poolDir = path.join(process.cwd(), "public", "images", "pool");
    if (fs.existsSync(poolDir)) {
      const files = fs.readdirSync(poolDir).filter((f: string) => f.match(/\.(jpg|jpeg|png|webp)$/i));
      if (files.length > 0) {
        return `/images/pool/${files[Math.floor(Math.random() * files.length)]}`;
      }
    }
  } catch(e) { console.error("Pool search error:", e); }
  return "";
}

/**
 * 3. 記事の生成
 * ※プロンプトは後日推敲予定のため、ガイドラインの内容を簡易的に埋め込んでいます。
 */
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
    
    ## 1. Dear You, 
    ## 2. まず、お伝えしたい大切なこと
    ## 3. 美しさを紐解く、専門医の視点
    ## 4. あなたの不安に寄り添って
    ## 5. 最後に、心を込めて。

    ![Dr. Miyaka Signature](/images/miyaka-signature-trimmed.png)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: writingPrompt,
  });

  return response.text;
}

/**
 * 3. 記事の自動検閲（レビュー＆修正）
 * 生成された記事を「医療広告ガイドライン」および「トーン」の観点から厳格に自己検閲し、修正する
 */
async function reviewArticle(articleMdx: string) {
  console.log(`🧐 生成された記事を自動で検閲・修正中...`);

  const reviewPrompt = `
    あなたは医療法務部およびVOGUEの編集長です。
    以下の【ブログ原稿】を厳格に検閲し、問題があれば修正してください。

    【検閲基準：シルクトーン・フィルタ6箇条】
    1. 過剰なセールスの排除（Trust First）: 「絶対治る」「最高」「No.1」などの誇大・断定表現がないか。
    2. 「あなた・私」の黄金比（Empathy）: 説教臭くなっていないか。親しい友人に宛てた手紙のような、優しく品のある日本語（余白を感じる文体）になっているか。
    3. 専門医としての客観的トーン（Safety & Positivity）: 「錆びついている」「ボロボロ」「手遅れ」などの不快でマイナスなイメージや不安を煽る言葉が使われていないか厳しく確認し、万が一あれば「前向きで希望を持てる言葉」に必ず書き換えること。また、流行の治療法に対して「いまのあなたには強いかもしれない」と『やらない選択』を示す誠実さがあるか。
    4. フォーマット: 指定された見出し（Dear You, や、まず、お伝えしたい大切なこと、など）や、見出し「あなたの不安に寄り添って」の中にFAQ（Q&A形式で働く女性目線の人肌感ある回答）とサイン画像が入っているか。
    5. 秘密保持（Confidentiality）: 「白金高輪」「広尾」といった具体的な地名や、自身のクリニックの「開業・開院」に関する予告・言及がないか。「当院では」「The Skin Atelierでは」等も禁止。
    6. パラグラフ・ライティングの徹底（Readability）: 1つの段落に複数のトピックが詰め込まれていないか。各段落の最初の1文で結論が述べられているか。

    【絶対厳守の出力ルール】
    - あなたの検閲結果やコメント、感想は一切出力しないでください。
    - 「承知いたしました」「検閲結果」「修正点」等の前置き文言も一切不要です。
    - 出力は「---」で始まるfrontmatterから始まるMDXの本文のみにしてください。
    - コードフェンス（\`\`\`markdown や \`\`\`mdx）で囲まないでください。
    - 修正の有無に関わらず、完全なMDXのみを返してください。

    【ブログ原稿】
    ${articleMdx}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: reviewPrompt,
  });

  return response.text;
}

/**
 * メイン実行関数
 */
async function main() {
  console.log("🚀 ブログ自動生成プロセスを開始します...\n");

  const todayStr = new Date().toISOString().split('T')[0];
  const args = process.argv.slice(2);
  let todayTheme = args[0];
  let searchKeywords = "";
  let isFromSheet = false;

  if (!todayTheme) {
    console.log("📥 引数なしのため、ThemeScheduleから今日の未執筆テーマを取得します...");
    const schedules = await SheetsDB.getThemeSchedule() || [];
    const normalizeDate = (d: string) => {
      if (!d) return "";
      const parts = d.replace(/\//g, '-').split('-');
      if (parts.length === 3) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      return d;
    };
    const pending = schedules.find(s => 
      s.brand === "atelier" && 
      s.status === "pending" && 
      normalizeDate(s.date) === todayStr
    );
    if (pending) {
      todayTheme = pending.theme;
      searchKeywords = pending.searchKeywords;
      isFromSheet = true;
      console.log(`🎯 シートから取得しました: ${todayTheme}`);
    } else {
      todayTheme = "美容皮膚科における最新のスキンケアトレンドと肌質改善";
      console.log(`⚠️ 保留中のテーマが見つからないため、デフォルトテーマで進行します: ${todayTheme}`);
    }
  }

  const slug = `blog-auto-${todayStr}-${Math.random().toString(36).substring(7)}`;
  const contentId = `blog-${todayStr}-${slug}`;

  // 検索・リサーチ用のキーワード構築
  const researchTarget = searchKeywords ? `${todayTheme} (${searchKeywords})` : todayTheme;

  try {
    // 1. レポート用のリサーチ実行
    const researchResult = await performDeepResearch(researchTarget);
    console.log("✅ リサーチ完了\n");

    // ② 写真の自動取得
    console.log("📸 LP用のサムネイル画像を取得中...");
    const imageUrl = await fetchAestheticImage();

    // ③ 執筆
    const articleMdx = await generateBlogPost(todayTheme, researchResult || "", imageUrl);
    console.log("✅ 記事生成完了\n");

    // ④ 検閲・自己修正
    const rawMdx = articleMdx || "";
    const reviewedMdx = await reviewArticle(rawMdx);
    console.log("✅ 自動検閲・修正完了\n");

    // ⑤ MDXの中身だけを抽出（AIがコードフェンスやコメントを付けた場合のクリーンアップ）
    let cleanMdx = reviewedMdx || "";
    // コードフェンスの除去
    cleanMdx = cleanMdx.replace(/^```(?:markdown|mdx)?\n/gm, "").replace(/\n```$/gm, "").trim();
    // AIの前置きコメントが残った場合、frontmatter(---)より前を全て除去
    const frontmatterStart = cleanMdx.indexOf('---');
    if (frontmatterStart > 0) {
      cleanMdx = cleanMdx.substring(frontmatterStart);
    }

    // ⑥ Google Sheetsへ保存 (キュー登録)
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

    // ⑦ Slackへ承認メッセージを送信
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
            text: { type: 'plain_text', text: '✏️ 修正依頼', emoji: true },
            action_id: 'revise_content',
            value: JSON.stringify({ id: contentId, brand: 'atelier' }),
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
        // ⑧ スレッド内にMarkdown全文を直接テキスト返信
        await slackClient.chat.postMessage({
           channel: TARGET_CHANNEL,
           thread_ts: result.ts,
           text: cleanMdx,
        });
        await SheetsDB.updateRow(contentId, { slack_ts: result.ts });
      }
    } catch (error) {
      console.error(`❌ Slack通知エラー:`, error);
    }

    // ⑨ X（Twitter）スレッドの連携生成とステータス更新
    try {
      if (isFromSheet) {
        await SheetsDB.updateThemeScheduleStatus(todayTheme, "completed");
        console.log("✅ ThemeScheduleのステータスを'completed'に更新しました。");
      }
      
      console.log("\n🚀 引き続き X (Twitter) 用の投稿を生成します...");
      const { execSync } = require('child_process');
      // X投稿スクリプトを呼び出し（引数として、同じテーマと背景コンテキストを渡す）
      execSync(`npx tsx scripts/auto-publish/generate-x-post.ts "${todayTheme}" "日々の診察や最新の美容ニュースから"`, { stdio: 'inherit' });
      console.log("✅ X 投稿の生成フローが完了しました！");
    } catch (e) {
      console.error("⚠️ X用投稿スクリプトの呼び出し中にエラーが発生しました:", e);
    }

    console.log(`\n🎉 すべての自動化プロセスが完了しました！`);

  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
  }
}

main();
