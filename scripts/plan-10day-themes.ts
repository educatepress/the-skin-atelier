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

// --- 重複検出ユーティリティ ---
// 美容テーマは「核となる固有名詞（成分名・施術名）を共有しつつ装飾語が多い」ため、
// 全文の類似度だけでは弱い。そこで二段判定する:
//   (1) 全体シグネチャ（カタカナ語/英数字/漢字バイグラム）の overlap 係数 >= 0.45
//   (2) 識別力の高い固有名詞（カタカナ5字以上 or 英字4字以上）を1つでも共有
// のどちらかを満たせば「近似重複」とみなす。実投稿データで較正済み。
const STOP_KATAKANA = new Set([
  "スキンケア", "エイジング", "アプローチ", "インナーケア", "ストレス",
  "バランス", "クリニック", "アトリエ", "ストーリー", "リスク",
]);

function fullSig(text: string): Set<string> {
  const s = new Set<string>();
  const t = text || "";
  for (const m of t.matchAll(/[ァ-ヴー]{3,}/g)) s.add("K:" + m[0]);
  for (const m of t.matchAll(/[A-Za-z0-9]{2,}/g)) s.add("L:" + m[0].toUpperCase());
  for (const run of t.match(/[一-龥]+/g) || [])
    for (let i = 0; i < run.length - 1; i++) s.add("J:" + run.slice(i, i + 2));
  return s;
}

function salientSig(text: string): Set<string> {
  const s = new Set<string>();
  const t = text || "";
  for (const m of t.matchAll(/[ァ-ヴー]{5,}/g)) if (!STOP_KATAKANA.has(m[0])) s.add("K:" + m[0]);
  for (const m of t.matchAll(/[A-Za-z]{4,}/g)) s.add("L:" + m[0].toUpperCase());
  return s;
}

function overlapCoef(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const g of a) if (b.has(g)) inter++;
  return inter / Math.min(a.size, b.size);
}

const DUP_COEF_THRESHOLD = 0.45;

function isNearDuplicate(a: string, b: string): boolean {
  if (overlapCoef(fullSig(a), fullSig(b)) >= DUP_COEF_THRESHOLD) return true;
  const sa = salientSig(a), sb = salientSig(b);
  for (const g of sa) if (sb.has(g)) return true; // 固有名詞を1つでも共有
  return false;
}

// 新テーマ群を、過去テーマ＋バッチ内の既出テーマと突き合わせ、重複している theme 文字列を返す
function findDuplicateThemes(newThemes: string[], pastThemes: string[]): string[] {
  const dups: string[] = [];
  const accepted: string[] = [];
  for (const theme of newThemes) {
    const hitPast = pastThemes.some(p => isNearDuplicate(theme, p));
    const hitBatch = accepted.some(p => isNearDuplicate(theme, p));
    if (hitPast || hitBatch) dups.push(theme);
    else accepted.push(theme);
  }
  return dups;
}

// 過去テーマを「直近120日 ＋ 最低でも直近90件」で集める。
// 重複は約1ヶ月周期で再発していたため、20件(=約20日)の窓では検出できなかった。
function collectHistory(brandSchedules: ThemeScheduleRow[]): string[] {
  const cutoff = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
  const recentByDate = brandSchedules.filter(s => {
    if (!s.date) return false;
    const d = new Date(s.date);
    return !isNaN(d.getTime()) && d >= cutoff;
  });
  const pool = recentByDate.length >= 20 ? recentByDate : brandSchedules.slice(-90);
  return pool.map(t => t.theme).filter(Boolean);
}

// Gemini にテーマ10件を生成させる（avoidThemes に列挙したテーマは明示的に回避させる）
async function generateThemes(brand: string, avoidThemes: string[]): Promise<any[]> {
  const recentThemes = avoidThemes.join(" / ");
  // 季節ズレ防止: 実行時点(JST)の月をプロンプトに明示し、過去の例示季節の流用を防ぐ
  const jstMonth = new Date(Date.now() + 9 * 3600 * 1000).getUTCMonth() + 1;
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
   ※このメディアは「大人ニキビ」の専門です。すべて大人ニキビ・ニキビ跡・肌質改善に接続する切り口で。
    ①大人ニキビの病態・原因（例: 月経前の悪化とホルモン、Uゾーンに繰り返す理由、バリア低下と乾燥性ニキビ）
    ②ニキビの治療・薬（例: スピロノラクトンの抗アンドロゲン、イソトレチノインのリアル、アダパレン/BPO、アゼライン酸）※処方薬は一般論・「医療機関で相談を」の姿勢
    ③ニキビ跡・肌質改善（例: 跡のタイプ別、赤い跡(PIE)と茶色い跡(PIH)の違い、サブシジョン/TCA CROSS/マイクロニードリング）
    ④インナーケア・生活習慣（例: 低GL食、乳製品/ホエイ、オメガ3・亜鉛、睡眠・ストレス、月経周期に合わせたケア）
    ⑤スキンケア成分と神話崩し（例: ナイアシンアミド/レチノール/ビタミンC誘導体、洗いすぎ・肌断食の誤解、叩き込みパッティング）
   ※現在は${jstMonth}月です。季節に触れる場合は必ず現在の季節（${jstMonth}月）に合わせ、過去の例示の季節を流用しないこと。季節ネタは全体の1〜2割まで。

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
    "themeArea": "①大人ニキビの病態・原因",
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
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ JSON parse error:", error);
    console.error("RAW TEXT:", rawText);
    return [];
  }
}

async function plan10DayThemes(brand: string): Promise<ThemeScheduleRow[]> {
  console.log(`🤖 Geminiによる「向こう10日間のテーマ一括生成 (${brand})」を開始します...`);

  // 過去のスケジュールを取得して重複を避ける（直近120日分を履歴として参照）
  const pastSchedules = await SheetsDB.getThemeSchedule() || [];
  const brandSchedules = pastSchedules.filter(s => s.brand === brand);
  const history = collectHistory(brandSchedules);

  // 生成 → 機械的な重複検出 → 重複があれば回避リストに足して再生成（最大3回）
  let data: any[] = [];
  const avoid = [...history];
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    data = await generateThemes(brand, avoid);
    const newThemes: string[] = data.map(d => d?.theme).filter(Boolean);
    const dups = findDuplicateThemes(newThemes, history);
    if (dups.length === 0) {
      console.log(`✅ 重複チェック合格（試行 ${attempt}/${MAX_ATTEMPTS}、履歴 ${history.length} 件と照合）`);
      break;
    }
    console.warn(`⚠️ 近似重複を ${dups.length} 件検出（試行 ${attempt}/${MAX_ATTEMPTS}）: ${dups.join(" / ")}`);
    if (attempt < MAX_ATTEMPTS) {
      // 重複したテーマを回避リストに明示追加して再生成させる
      for (const d of dups) if (!avoid.includes(d)) avoid.push(d);
    } else {
      console.warn("⚠️ 上限到達。重複を含む可能性があるまま書き込みます（要・取締役確認）。");
    }
  }

  if (data.length === 0) return [];

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
