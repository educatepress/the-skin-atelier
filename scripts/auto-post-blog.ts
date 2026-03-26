import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

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

  // Gemini 2.5 Pro + Google Search Groundingを使用
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: researchPrompt,
    config: {
      tools: [{ googleSearch: {} }], // Google検索を有効化
    }
  });

  return response.text;
}

/**
 * 2. 記事の生成
 * ※プロンプトは後日推敲予定のため、ガイドラインの内容を簡易的に埋め込んでいます。
 */
async function generateBlogPost(theme: string, researchData: string) {
  console.log(`✍️ 記事を生成中（Elegant Letter Style）...`);

  const writingPrompt = `
    あなたは美容皮膚科医であり、トップクラスのWebマーケターです。
    以下の【リサーチデータ】をもとに、【出力フォーマット】に従ってマークダウン記事を書いてください。
    
    【テーマ】: ${theme}
    【リサーチデータ】: ${researchData}

    【出力フォーマット】: 洗練された手紙風 (Elegant Letter Style)
    （※詳細は prompts/blog-writing-guide.md を参照）
    
    ---
    title: "記事のタイトル"
    excerpt: "100文字程度の概要"
    date: "YYYY-MM-DD"
    category: "Skincare"
    readTime: "〇 min read"
    ---
    
    ## 1. Dear You, 
    ## 2. Why I Share This
    ## 3. My Medical View
    ## 4. Your Questions
    ## 5. With Love,

    ![Dr. Miyaka Signature](/images/miyaka-signature-new.png)
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
    以下の【ブログ原稿】を厳格に検閲し、問題があれば修正した完全なMDXを返してください。
    問題がなければ、そのままのMDXを返してください。

    【検閲基準】
    1. 医療広告ガイドライン: 「絶対治る」「最高」「No.1」などの誇大・断定表現がないか。「〜という報告があります」等の控えめな表現になっているか。
    2. トーン＆マナー: 不安を煽っていないか。上品で洗練された手紙風（Elegant Letter Style）を維持できているか。
    3. フォーマット: 指定された見出し（Dear You, など）や、末尾のサイン画像が正しく入っているか。

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
  // ① 本日のテーマ（将来的にはこれもAIに自動で決めさせるか、リストからランダム取得）
  const todayTheme = "春のゆらぎ肌と花粉による肌荒れのメカニズムと正しいスキンケア";
  const dateStr = new Date().toISOString().split('T')[0];
  const slug = `spring-skin-care-${dateStr}`;

  try {
    // ② リサーチ
    const researchResult = await performDeepResearch(todayTheme);
    console.log("✅ リサーチ完了\n");

    // ③ 執筆
    const articleMdx = await generateBlogPost(todayTheme, researchResult || "");
    console.log("✅ 記事生成完了\n");

    // ④ 検閲・自己修正
    const rawMdx = articleMdx || "";
    const reviewedMdx = await reviewArticle(rawMdx);
    console.log("✅ 自動検閲・修正完了\n");

    // ⑤ ファイル保存
    const filePath = path.join(process.cwd(), "content/blog", `${slug}.mdx`);
    
    // MDXの中身だけを抽出（AIが ```markdown などを付けた場合の除去）
    const cleanMdx = reviewedMdx?.replace(/^```markdown\n/, "").replace(/\n```$/, "") || "";

    fs.writeFileSync(filePath, cleanMdx, "utf8");
    console.log(`🎉 検閲済み記事を保存しました: ${filePath}`);
    
    // ⑤（後日追加）自動で git add / commit / push する処理をここに書く

  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
  }
}

main();
