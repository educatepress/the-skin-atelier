import { GoogleGenAI } from "@google/genai";
import path from "path";
import dotenv from "dotenv";
import { SheetsDB, ThemeScheduleRow } from "./lib/sheets-db";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("エラー: GEMINI_API_KEY が設定されていません。");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 5000): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRetryable = err?.status === 503 || err?.code === 'UND_ERR_HEADERS_TIMEOUT';
      if (attempt === maxRetries || !isRetryable) throw err;
      console.log(`⏳ API混雑中… ${baseDelay / 1000}秒後にリトライ (${attempt}/${maxRetries})`);
      await new Promise(r => setTimeout(r, baseDelay));
    }
  }
  throw new Error("Unreachable");
}

async function plan10DayThemes(brand: string): Promise<ThemeScheduleRow[]> {
  console.log(`🤖 Geminiによる「向こう10日間のテーマ一括生成 (${brand})」を開始します...`);

  // 過去のスケジュールを取得して重複を避ける
  const pastSchedules = await SheetsDB.getThemeSchedule() || [];
  const brandSchedules = pastSchedules.filter(s => s.brand === brand);
  const recentThemes = brandSchedules.slice(-20).map(t => t.theme).join(" / ");

  const prompt = `
あなたは美容皮膚科・アンチエイジング専門医の視点を持つ「シニア・リサーチ・エディター」です。
直近のSNSと最新論文トレンドから、今後10日間（1日1記事）で執筆すべき「全く新しいバズテーマ10個」を提案してください。

【最優先ミッションと選定アルゴリズム】
「ヒトに対する有効性が確立された（Tier A/B）」最新の美容医学エビデンスに基づくテーマを選定してください。
※マウス・細胞実験（Tier C）は、美容領域では再現性が低いため「採用禁止」とします。
1. ティアA（最優先）：メタアナリス・系統的レビュー・RCT（ヒト臨床試験）
2. ティアB（採用可）：観察研究・大規模コホート研究（ヒトデータ）
3. ティアC（禁止）：動物実験・試験管内での細胞実験。

【厳守事項】
1. 直近で以下のテーマは既に執筆済みです。これらと文脈が被るテーマは絶対に避けてください。
  - [既存テーマ]: ${recentThemes || "(まだ履歴なし)"}

2. 各テーマは以下の5つの大枠（ThemeArea）からそれぞれ2個ずつ、合計10個生成してください。
    ①最新成分ディープダイブ（例: レバーエキス、エクソソーム、レチノール代替成分など）
    ②美容医療トレンド（例: ピコレーザーの真実、ポテンツァのダウンタイムなど）
    ③自宅スキンケアの落とし穴（例: クレンジングの罠、摩擦レスの副作用など）
    ④季節の肌トラブル（例: 紫外線と隠れシミ、花粉とゆらぎ肌など）
    ⑤論文ベースの神話崩し（例: コラーゲンサプリは効くか？ 経皮吸収の限界など）

3. 【隣接テーマの多様性 — 最重要】
   - 連続する2日間で同じ ThemeArea のテーマを並べないこと（例: ①→①は禁止、①→②→③のように散らす）
   - 連続する3日間で似た切り口（「〜は本当か？」「〜の真実」など同じ問い構造）を繰り返さないこと
   - 「水もの」（水素水→高機能水）、「再生医療」（エクソソーム→PDRN）のように隣接日で同カテゴリの素材を扱わないこと
   - 10日間の並び順は ①②③④⑤①②③④⑤ のように均等にローテーションさせること

4. 後日AIが内容を深掘り検索（ディープリサーチ）するための「検索キーワード（主に英語の医学用語や成分名など）」を付与してください。
5. 【絶対禁止ワード】「当院では」「私のクリニックでは」「私のアトリエでは」などの表現をテーマに含めないこと。

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
  ...（必ず10件）
]
  `;

  const response = await withRetry(() => ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
  }));

  let rawText = response.text || "[]";
  rawText = rawText.replace(/^```json\n/gm, "").replace(/^```\n/gm, "").replace(/```$/gm, "").trim();

  try {
    const data = JSON.parse(rawText);
    
    const today = new Date();
    const rows: ThemeScheduleRow[] = [];
    
    // スケジュールの開始日を決定（もし未来の予定があればその翌日から）
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
            brand: brand,
            themeArea: item.themeArea || "未分類",
            theme: item.theme || "未設定のテーマ",
            searchKeywords: item.searchKeywords || "",
            referenceUrl: item.referenceUrl || "",
            status: "pending",
            evidenceTier: item.evidenceTier || "",
            limitations: item.limitations || ""
        });
    }
    
    return rows;
  } catch (error) {
    console.error("❌ JSON parse error:", error);
    console.error("RAW TEXT:", rawText);
    return [];
  }
}

async function main() {
  // Option: pass --brand=atelier
  const args = process.argv.slice(2);
  let brand = "atelier";
  if (args[0] && args[0].includes("--brand=")) {
    brand = args[0].split("=")[1];
  }

  const newSchedules = await plan10DayThemes(brand);
  
  if (newSchedules.length > 0) {
    console.log(`📦 ${newSchedules.length}日分のテーマをThemeScheduleタブに書き込みます...`);
    await SheetsDB.appendThemeSchedule(newSchedules);
    console.log(`✅ テーマスケジュールの一括生成と書き込みが完了しました！`);
  } else {
    console.log("❌ スケジュールの生成に失敗しました。");
  }
}

main();
