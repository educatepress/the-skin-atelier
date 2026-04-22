import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { SheetsDB, ThemeScheduleRow } from "./lib/sheets-db";
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
 * gemini-2.5-flash のみ使用（クオリティ維持）。
 * 5回リトライしてダメなら失敗 → workflow レベルで時間を空けて再実行。
 */
const MODEL = "gemini-2.5-flash";

async function withRetry<T>(
  fn: (model: string) => Promise<T>,
  maxRetries = 8,
  baseDelay = 10000
): Promise<T> {
  // Gemini の Asia-Pacific ピーク時間帯 (昼・夜) で 503 を連発するため、
  // 累計 ~14.5 分まで粘る。429 (rate limit) と ECONNRESET もリトライ対象。
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn(MODEL);
    } catch (err: any) {
      const isRetryable = err?.status === 503 || err?.status === 429 || err?.code === 'ECONNRESET';
      if (attempt === maxRetries || !isRetryable) throw err;
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 180000);
      console.log(`⏳ API混雑 (${err?.status || err?.code})… ${delay / 1000}秒後にリトライ (${attempt}/${maxRetries})`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

/**
 * 季節テーマを読み込み（今月・来月分を返す）
 */
function getSeasonalHints(): { currentMonth: string; hints: string[] } {
  try {
    const seasonalPath = path.join(process.cwd(), "scripts", "data", "seasonal-themes.json");
    if (!fs.existsSync(seasonalPath)) return { currentMonth: "", hints: [] };
    const data = JSON.parse(fs.readFileSync(seasonalPath, "utf-8"));

    const now = new Date();
    // JST基準の月取得
    const jstNow = new Date(now.getTime() + 9 * 3600 * 1000);
    const currentMonth = (jstNow.getUTCMonth() + 1).toString(); // 1-12
    const nextMonth = ((jstNow.getUTCMonth() + 1) % 12 + 1).toString();

    const currentLabel = data[currentMonth]?.monthLabel || "";
    const nextLabel = data[nextMonth]?.monthLabel || "";
    const currentThemes: string[] = data[currentMonth]?.themes || [];
    const nextThemes: string[] = data[nextMonth]?.themes || [];

    // 今月を優先、来月は補助
    const hints = [
      ...currentThemes.slice(0, 3).map((t) => `[今月=${currentLabel}] ${t}`),
      ...nextThemes.slice(0, 2).map((t) => `[来月=${nextLabel}] ${t}`),
    ];

    return { currentMonth: currentLabel, hints };
  } catch (e) {
    console.warn("⚠️ seasonal-themes.json の読み込みに失敗:", e);
    return { currentMonth: "", hints: [] };
  }
}

/**
 * 0. テーマ自動生成（ThemeScheduleが空の場合にplan-10day-themesと同等の処理を実行）
 */
async function autoGenerateThemes(brand: string): Promise<ThemeScheduleRow[]> {
  console.log(`\n🤖 ThemeScheduleにテーマがないため、10日分のテーマを自動生成します...`);

  const pastSchedules = await SheetsDB.getThemeSchedule() || [];
  const brandSchedules = pastSchedules.filter(s => s.brand === brand);
  const recentThemes = brandSchedules.slice(-20).map(t => t.theme).join(" / ");

  // 季節ヒント取得
  const { currentMonth, hints } = getSeasonalHints();
  const seasonalBlock =
    hints.length > 0
      ? `
【季節コンテンツの必須組み込み (最優先)】
10個のうち少なくとも3〜4個は、以下の「今月・来月の季節テーマ」から選ぶか、非常に近い切り口で生成してください。
読者は「いま、まさにその悩みで検索している」ので、季節性のあるコンテンツは圧倒的に刺さります。

[現在の季節=${currentMonth}]
推奨テーマ（アレンジ可）:
${hints.map((h) => `- ${h}`).join("\n")}

残り6〜7個は、エビデンスベースの evergreen な美容皮膚科テーマから自由に選定してください。
`
      : "";

  const prompt = `
あなたは美容皮膚科・アンチエイジング専門医の視点を持つ「シニア・リサーチ・エディター」です。
直近のSNSと最新論文トレンド、そして「今この瞬間の季節感」を踏まえ、今後10日間（1日1記事）で執筆すべき「読者に刺さるテーマ10個」を提案してください。
${seasonalBlock}
【最優先ミッションと選定アルゴリズム】
「ヒトに対する有効性が確立された（Tier A/B）」最新の美容医学エビデンスに基づくテーマを選定してください。
※マウス・細胞実験（Tier C）は、美容領域では再現性が低いため「採用禁止」とします。
1. ティアA（最優先）：メタアナリス・系統的レビュー・RCT（ヒト臨床試験）
2. ティアB（採用可）：観察研究・大規模コホート研究（ヒトデータ）
3. ティアC（禁止）：動物実験・試験管内での細胞実験。

【厳守事項】
1. 直近で以下のテーマは既に執筆済みです。これらと文脈が被るテーマは絶対に避けてください。
  - [既存テーマ]: ${recentThemes || "(まだ履歴なし)"}

2. 各テーマは以下の5つの大枠（ThemeArea）からバランスよく、合計10個生成してください。
    ①最新成分ディープダイブ（例: レバーエキス、エクソソーム、レチノール代替成分など）
    ②美容医療トレンド（例: ピコレーザーの真実、ポテンツァのダウンタイムなど）
    ③自宅スキンケアの落とし穴（例: クレンジングの罠、摩擦レスの副作用など）
    ④季節の肌トラブル（例: 紫外線と隠れシミ、花粉とゆらぎ肌など） ← 季節テーマは主にここに
    ⑤論文ベースの神話崩し（例: コラーゲンサプリは効くか？ 経皮吸収の限界など）

3. 後日AIが内容を深掘り検索（ディープリサーチ）するための「検索キーワード（主に英語の医学用語や成分名など）」を付与してください。
4. 【絶対禁止ワード】「当院では」「私のクリニックでは」「私のアトリエでは」「分子栄養学」「オーソモレキュラー」「価格」「料金」「開業」「開院」「オープン」「白金高輪」「広尾」などの表現をテーマに含めないこと。

【出力フォーマット】
以下の形式のJSONのみ出力してください（\`\`\`json などのマークダウン修飾は省略してください）。
evidenceTier には必ず "A" または "B" を指定。 "C" の場合はエラーとして再選定すること。
[
  {
    "themeArea": "①最新成分ディープダイブ",
    "theme": "生成されたテーマタイトル",
    "searchKeywords": "Exosome OR Niacinamide mechanism 2024",
    "referenceUrl": "",
    "evidenceTier": "Tier A",
    "limitations": "ヒトでの大規模介入研究はまだ発展途上である点..."
  },
  ...(必ず10件)
]
  `;

  const response = await withRetry((model) => ai.models.generateContent({
    model,
    contents: prompt,
  }));

  let rawText = response.text || "[]";
  rawText = rawText.replace(/^```json\n/gm, "").replace(/^```\n/gm, "").replace(/```$/gm, "").trim();

  try {
    const data = JSON.parse(rawText);

    const today = new Date();
    const rows: ThemeScheduleRow[] = [];

    // スケジュールの開始日を決定（既存の未来の予定があればその翌日から）
    let startDate = new Date();
    if (brandSchedules.length > 0) {
      const lastRow = brandSchedules[brandSchedules.length - 1];
      if (lastRow.date) {
        const lastDate = new Date(lastRow.date);
        if (lastDate >= today) {
          startDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
        }
      }
    }

    for (let i = 0; i < 10; i++) {
      const targetDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const dateStr = targetDate.toISOString().split('T')[0];
      const item = data[i] || {};

      rows.push({
        date: dateStr,
        brand,
        themeArea: item.themeArea || "未分類",
        theme: item.theme || "未設定のテーマ",
        searchKeywords: item.searchKeywords || "",
        referenceUrl: item.referenceUrl || "",
        status: "pending",
        evidenceTier: item.evidenceTier || "",
        limitations: item.limitations || ""
      });
    }

    // シートに保存
    if (rows.length > 0) {
      await SheetsDB.appendThemeSchedule(rows);
      console.log(`✅ ${rows.length}日分のテーマをThemeScheduleに自動追加しました。`);
    }

    return rows;
  } catch (error) {
    console.error("❌ テーマ自動生成のJSON解析に失敗:", error);
    console.error("RAW TEXT:", rawText);
    return [];
  }
}

/**
 * 1. Deep Research（Google検索を活用した情報収集）
 * - 必ず具体的な論文情報（著者・雑誌・年・PMID/DOI）を構造化して収集。
 * - 記事生成時にそのままコピペできる形で 参考文献 セクション用データを返す。
 */
async function performDeepResearch(theme: string) {
  console.log(`🔍 テーマ「${theme}」についてDeep Researchを実行中...`);

  const researchPrompt = `
    あなたは美容医学のシニア・リサーチ・エディターです。以下のテーマについて、PubMed・Cochrane・主要学会誌をGoogle検索を通じて調査し、ブログ記事執筆のためのリサーチデータをまとめてください。

    【エビデンス制約】
    - 必ず「ヒト臨床試験（Tier A/B）」に基づくデータのみを採用すること。
      - Tier A: メタアナリス、システマティックレビュー、RCT（ランダム化比較試験）
      - Tier B: 大規模観察研究、コホート研究
    - マウス・細胞・試験管（Tier C）は絶対に採用しない。

    【最重要ルール — PMIDの捏造厳禁】
    - PMIDは、実際にPubMedで検索して存在が確認できた論文のもののみ記載すること。
    - 「それらしい8桁の数字」を創作することは絶対に禁止。過去にPMID捏造で重大な信頼毀損を招いた実例があり、再発したら事業そのものが崩壊する。
    - 検索して論文の実在を確認できない場合は、PMIDを省略し「PMID: 要確認」と記載すること。
    - DOIも同じ。確認できない場合は「DOI: 要確認」または省略。
    - 著者名・雑誌名・年も、確信が持てないなら「著者名不明」「年代不明」と明記し、絶対に捏造しないこと。

    【出力フォーマット — 必ず以下の2セクションに分けて出力】

    # 要点
    ブログ記事の執筆に必要な医学的要点を自由形式でまとめる(500〜1000字)。
    各主張には対応する論文の第一著者名と年を角括弧で付記すること(例: 「ビタミンCは光老化を改善する[Smith et al. 2020]」)。

    # 参照論文リスト
    記事本文で引用する価値のある論文を2〜5件、以下のフォーマットで列挙すること。
    実在が確認できた論文のみ記載し、PMID/DOIの確証がない場合は「要確認」と明記すること。

    - 著者姓名頭文字. 論文タイトル. 雑誌名. 年;巻(号):ページ. PMID: xxxxxxxx. DOI: xxxxx
    - (例) Hughes MCB, Williams GM. Sunscreen and prevention of skin aging: a randomized trial. Ann Intern Med. 2013;158(11):781-90. PMID: 23732711. DOI: 10.7326/0003-4819-158-11-201306040-00002
    - 該当論文が一件も確認できない場合は「該当なし」と明記すること。

    テーマ: ${theme}
  `;

  // Gemini + Google Search Grounding（リトライ付き + フォールバック）
  const response = await withRetry((model) => ai.models.generateContent({
    model,
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
async function generateBlogPost(theme: string, researchData: string, imageUrl: string, publishDate: string) {
  console.log(`✍️ 記事を生成中（Elegant Letter Style）...`);

  // プロンプトファイルのパス解決（ローカル・GitHub Actions 両対応）
  const promptCandidates = [
    path.join(process.cwd(), "prompts", "blog-writing-guide.md"),                          // GitHub Actions (cwd = project root)
    path.join(process.cwd(), "..", "the-skin-atelier", "prompts", "blog-writing-guide.md"), // ローカル (cwd = hiroo-open/the-skin-atelier)
    path.resolve(__dirname, "..", "..", "prompts", "blog-writing-guide.md"),                 // __dirname ベース
  ];
  let masterPrompt = "";
  for (const p of promptCandidates) {
    try {
      if (fs.existsSync(p)) {
        masterPrompt = fs.readFileSync(p, "utf-8");
        break;
      }
    } catch {}
  }
  if (!masterPrompt) console.warn("⚠️ blog-writing-guide.md が見つかりません。プロンプトなしで記事を生成します。");

  const writingPrompt = `
    以下の【The Skin Atelier — ブログ執筆ガイドライン＆プロンプト】に完全に従って、ブログ記事を作成してください。
    特に【出力フォーマット】の構造を厳守すること。

    【ガイドライン元ファイル抜粋】:
    ${masterPrompt}

    【テーマ】: ${theme}
    【リサーチデータ】: ${researchData}

    【出力frontmatterの厳格ルール】
    - date フィールドには必ず「${publishDate}」をそのまま使用すること（ISO形式 YYYY-MM-DD）。過去日や未来日に勝手に変更しないこと。
    - title, excerpt は記事内容に応じて適切に生成すること。
    - category は "Skincare" / "Treatment" / "Injectable" / "Inner Care" から最適なものを選ぶこと。
    - readTime は本文の長さから見積もった「〇 min read」。

    ---
    title: "記事のタイトル"
    excerpt: "100文字程度の概要"
    date: "${publishDate}"
    category: "Skincare"
    readTime: "〇 min read"
    featured: false
    image: "${imageUrl}"
    ---
    
    ## あなたへ
    ## まず、お伝えしたい大切なこと
    ## 美しさを紐解く、専門医の視点
    ## あなたの不安に寄り添って
    ## 最後に、心を込めて。
    ## 参考文献
    （【厳守】リサーチデータの「# 参照論文リスト」セクションに列挙された論文のうち、記事本文で実際に根拠として用いたもののみを、以下のMarkdownフォーマットで列挙すること：
    - 著者名. 論文タイトル. *雑誌名*. 年;巻(号):ページ. PMID: xxxxxxxx. [DOI: xxxx](https://doi.org/xxxx)

    【絶対禁止】
    - リサーチデータに存在しないPMIDやDOIを、それらしく創作すること。過去にPMID捏造事件が発生し、事業の信頼が揺らいだため、この禁止は絶対。
    - リサーチデータに「PMID: 要確認」と書かれている項目は、参考文献セクションに含めないこと（不確実な情報は載せない）。
    - 曖昧な「信頼できる情報源に基づき〜」という定型文も禁止。

    【該当論文が無い場合】
    「参考文献」セクション自体を省略し、代わりに「本記事は一般的な医学情報の範囲でまとめています」と1行だけ記載すること。

    【論文が1件以上ある場合】最後に以下の1行を必ず付け加えること:
    *本記事はPubMed掲載のTier A/B論文に基づき執筆しています。*）

    ![Dr. Miyaka Signature](/images/miyaka-signature-trimmed.png)
  `;

  const response = await withRetry((model) => ai.models.generateContent({
    model,
    contents: writingPrompt,
  }));

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
    - frontmatterの date フィールドは絶対に書き換えないこと（元原稿の値をそのまま維持）。

    【ブログ原稿】
    ${articleMdx}
  `;

  const response = await withRetry((model) => ai.models.generateContent({
    model,
    contents: reviewPrompt,
  }));

  return response.text;
}

/**
 * メイン実行関数
 */
async function main() {
  console.log("🚀 ブログ自動生成プロセスを開始します...\n");

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 1);
  const tomorrowStr = targetDate.toISOString().split('T')[0];
  const args = process.argv.slice(2);
  let todayTheme = args[0];
  let searchKeywords = "";
  let isFromSheet = false;

  if (!todayTheme) {
    console.log("📥 引数なしのため、ThemeScheduleから今日の未執筆テーマを取得します...");
    const schedules = await SheetsDB.getThemeSchedule() || [];
    const normalizeDate = (d: string) => {
      if (!d) return "";
      // スペースやT以降(時刻部分)を除去し、/を-に統一
      const datePart = d.trim().split(/[T\s]/)[0].replace(/\//g, '-');
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const [y, m, day] = parts;
        return `${y}-${m.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return datePart;
    };
    // 1. まず翌日日付でマッチするテーマを探す
    const allPending = schedules.filter(s => s.brand === "atelier" && s.status === "pending");
    const exactMatch = allPending.find(s => normalizeDate(s.date) === tomorrowStr);

    if (exactMatch) {
      todayTheme = exactMatch.theme;
      searchKeywords = exactMatch.searchKeywords;
      isFromSheet = true;
      console.log(`🎯 シートから翌日分のテーマを取得しました: ${todayTheme}`);
    } else if (allPending.length > 0) {
      // 2. 翌日分がなくても、未使用のpendingテーマがあればそれを使う（テーマ生成をスキップ）
      const picked = allPending[0];
      todayTheme = picked.theme;
      searchKeywords = picked.searchKeywords;
      isFromSheet = true;
      console.log(`📋 翌日分のテーマはありませんが、未使用テーマを使用します: ${todayTheme}`);
    } else {
      // 3. pendingテーマが完全にゼロの場合のみ、テーマ自動生成を実行
      console.log(`⚠️ 未使用テーマが0件です。10日分のテーマを自動生成します...`);

      const newThemes = await autoGenerateThemes("atelier");

      if (newThemes.length > 0) {
        todayTheme = newThemes[0].theme;
        searchKeywords = newThemes[0].searchKeywords;
        isFromSheet = true;
        console.log(`🎯 自動生成テーマから取得しました: ${todayTheme}`);
      } else {
        // テーマ生成自体が失敗した場合のフォールバック
        todayTheme = "美容皮膚科における最新のスキンケアトレンドと肌質改善";
        console.log(`⚠️ テーマ自動生成にも失敗したため、デフォルトテーマで進行します: ${todayTheme}`);
      }
    }
  }

  const slug = `blog-auto-${tomorrowStr}-${Math.random().toString(36).substring(7)}`;
  const contentId = `blog-${tomorrowStr}-${slug}`;

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
    const articleMdx = await generateBlogPost(todayTheme, researchResult || "", imageUrl, tomorrowStr);
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

    // ⑥ Google Sheetsへ保存 (承認不要 → 直接 approved で登録)
    const newRow = {
      content_id: contentId,
      brand: 'atelier',
      type: 'blog',
      title: slug,
      generation_recipe: JSON.stringify({
        captionText: cleanMdx,
        theme: todayTheme
      }),
      status: 'approved',
      scheduled_date: tomorrowStr,
    };

    console.log(`📦 Google Sheets にブログ記事を登録中 (auto-approved, scheduled=${tomorrowStr})...`);
    await SheetsDB.appendRows([newRow]);

    // ⑦ Slackへ通知（承認不要・情報共有のみ）
    console.log(`📤 Slack へ投稿予定通知を送信中...`);

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📝 *ブログ記事* (自動承認済): \`${slug}\`\n【配信先: 🟦 hiroo-open / The Skin Atelier】\n📅 投稿予定: ${tomorrowStr} 10:00 JST\n\n※本文はスレッド内で確認できます 👇`
        }
      },
    ];

    try {
      const result = await slackClient.chat.postMessage({
        channel: TARGET_CHANNEL,
        text: `📝 ブログ記事 ${slug} — ${tomorrowStr} 自動投稿予定`,
        blocks,
      });
      console.log(`✅ Slack通知完了: ${result.ts}`);

      if (result.ts) {
        // スレッド内にMarkdown全文を直接テキスト返信
        await slackClient.chat.postMessage({
           channel: TARGET_CHANNEL,
           thread_ts: result.ts,
           text: cleanMdx,
        });
        await SheetsDB.updateRow(contentId, { slack_ts: result.ts });
      }
    } catch (error: any) {
      console.error(`❌ Slack通知エラー:`, error);
      // Slack 通知失敗しても投稿自体は approved なので daily-publisher が処理する
      try {
        await SheetsDB.updateRow(contentId, {
          error_detail: `Slack notification failed: ${error?.message || String(error)}`,
        });
      } catch (sheetErr) {
        console.error('Failed to record Slack error to sheet:', sheetErr);
      }
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

  } catch (error: any) {
    console.error("❌ エラーが発生しました:", error);

    // Slackにエラー通知を送信（自動実行時もエラーが見えるようにする）
    try {
      if (SLACK_BOT_TOKEN) {
        await slackClient.chat.postMessage({
          channel: TARGET_CHANNEL,
          text: `🚨 *ブログ自動生成パイプラインでエラーが発生しました*\n\`\`\`${error.message || error}\`\`\`\nテーマ: ${todayTheme || '不明'}`,
        });
      }
    } catch (slackErr) {
      console.error("⚠️ Slackへのエラー通知も失敗しました:", slackErr);
    }
  }
}

main();
