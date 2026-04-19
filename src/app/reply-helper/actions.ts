"use server";

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export type ReplyTone = "empathy" | "knowledge" | "bridge";

export type ReplyDraft = {
  tone: ReplyTone;
  label: string;
  icon: string;
  description: string;
  text: string;
};

export type ReplyDraftsResult =
  | { ok: true; drafts: ReplyDraft[] }
  | { ok: false; error: string };

const TONE_META: Record<ReplyTone, { label: string; icon: string; description: string; prompt: string }> = {
  empathy: {
    label: "共感型 (Empathy)",
    icon: "🔵",
    description: "相手の気持ちに深く寄り添う。自己開示を軽く含める。",
    prompt:
      "相手の体験・感情を真正面から受け止め、自分も似た悩みを経験したことを短く自己開示する。 医師としての立場を前面に出さず、一人の女性・人間として共感する。 最後はそっと肩を支えるような、優しい一言で締める。",
  },
  knowledge: {
    label: "補足型 (Knowledge)",
    icon: "🟢",
    description: "医学的エビデンスや事実を短く補足する。押し付けがましくならない。",
    prompt:
      "相手のツイートで言及されていることに対して、医学的な追加情報（論文の存在、機序、代替案など）を簡潔に提示する。 『〜という研究があります』『〜と言われています』等の柔らかい表現で、決して上から目線にならない。 相手の意見を否定せず、並列の視点として提示する。",
  },
  bridge: {
    label: "対話型 (Bridge)",
    icon: "🟡",
    description: "異なる視点を優しく架橋。対話を続けたくなる問いかけ。",
    prompt:
      "相手の主張を尊重しつつ、別の角度・別の選択肢がある可能性を丁寧に示す。 末尾で読者側にも考える余白を残す短い問いかけ（『〜はどう感じていますか？』等）で締める。 断定や反論にはならず、あくまで会話のキャッチボールを続ける形。",
  },
};

function loadXViralDoc(): string {
  const candidates = [
    path.join(process.cwd(), "prompts", "x-viral-patterns.md"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p, "utf-8");
    } catch {}
  }
  return "";
}

export async function generateReplyDrafts(formData: FormData): Promise<ReplyDraftsResult> {
  if (!ai) {
    return { ok: false, error: "GEMINI_API_KEY が未設定です。管理者にお問い合わせください。" };
  }

  const originalTweet = String(formData.get("tweet") || "").trim();
  const context = String(formData.get("context") || "").trim();

  if (!originalTweet || originalTweet.length < 3) {
    return { ok: false, error: "相手のツイート本文を貼り付けてください。" };
  }
  if (originalTweet.length > 2000) {
    return { ok: false, error: "ツイートが長すぎます。2000文字以内に。" };
  }

  const viralDoc = loadXViralDoc();
  const viralSlim = viralDoc.split("---")[0] + "---"; // 先頭の共通ルールのみ

  const drafts: ReplyDraft[] = [];

  for (const tone of ["empathy", "knowledge", "bridge"] as ReplyTone[]) {
    const meta = TONE_META[tone];

    const prompt = `
あなたは美容皮膚科医 Dr. Miyaka 本人として、X (Twitter) で他の人のツイートに返信する**単発リプライ1本**を作成してください。

【Dr. Miyaka のブランド指針（抜粋）】
${viralSlim}

【相手のツイート本文】
${originalTweet}

${context ? `【文脈メモ / あなたが意識したいこと】\n${context}\n` : ""}

【このリプライのトーン】
${meta.label}
${meta.prompt}

【出力要件】
- 本文のみ（前置き、「承知しました」等は一切不要）
- 140文字以内（全角換算）
- @メンションは書かない（X UIが自動で付ける前提）
- 絵文字は 0-2個 まで
- ハッシュタグは基本付けない（リプライには不要）
- コードブロック（\`\`\`）で囲わない
- 先頭と末尾の余計な改行を入れない

【絶対禁止】
- 相手を否定・批判する表現
- 自分のクリニックへの勧誘
- 「白金高輪」「広尾」「当院」「開業」「オープン」
- 「分子栄養学」「オーソモレキュラー」
- 具体的な価格・料金
- 「絶対」「最高」「No.1」
- 架空の患者エピソード
- 論文のPMIDを確証なく記載

返信本文だけを出力してください。
    `.trim();

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const text = (response.text || "")
        .replace(/^```\n?/gm, "")
        .replace(/```$/gm, "")
        .trim();

      drafts.push({
        tone,
        label: meta.label,
        icon: meta.icon,
        description: meta.description,
        text,
      });
    } catch (err: any) {
      console.error(`[reply-helper] ${tone} generation failed:`, err?.message);
      drafts.push({
        tone,
        label: meta.label,
        icon: meta.icon,
        description: meta.description,
        text: `（生成に失敗しました: ${err?.message || "unknown error"}）`,
      });
    }
  }

  return { ok: true, drafts };
}
