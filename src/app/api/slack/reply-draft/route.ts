/**
 * Slack Slash Command endpoint: /reply-draft <tweet body>
 *
 * 使い方: Slack で「/reply-draft [相手のツイート本文]」を送ると、
 *        Dr. Miyaka 風の3種類のリプライ案 (empathy / knowledge / bridge) を返す。
 *
 * Slack App 設定:
 *   Slash Commands → New Command
 *     Command:    /reply-draft
 *     Request URL: https://skin-atelier.jp/api/slack/reply-draft
 *     Short Description: X返信案を3種類生成
 *     Usage Hint: [相手のツイート本文]
 */
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

type Tone = "empathy" | "knowledge" | "bridge";

const TONES: { tone: Tone; icon: string; label: string; instruction: string }[] = [
  {
    tone: "empathy",
    icon: "🔵",
    label: "共感型",
    instruction:
      "相手の感情を真正面から受け止め、自分も似た悩みを経験したことを短く自己開示。医師としての立場を前面に出さず、一人の人間として共感。優しい一言で締める。",
  },
  {
    tone: "knowledge",
    icon: "🟢",
    label: "補足型",
    instruction:
      "相手のツイートに対して医学的な追加情報（論文の存在、機序、代替案）を簡潔に提示。『〜という研究があります』等の柔らかい表現で、上から目線にならない。並列視点として提示。",
  },
  {
    tone: "bridge",
    icon: "🟡",
    label: "対話型",
    instruction:
      "相手の主張を尊重しつつ、別の角度・選択肢を丁寧に示す。末尾で読者側にも考える余白を残す短い問いかけで締める。断定や反論にはならない。",
  },
];

async function generateReply(tone: Tone, originalTweet: string): Promise<string> {
  if (!ai) throw new Error("GEMINI_API_KEY 未設定");
  const meta = TONES.find((t) => t.tone === tone)!;
  const prompt = `
あなたは美容皮膚科医 Dr. Miyaka として、X (Twitter) の他人のツイートに返信する単発リプライを1本作成してください。

【相手のツイート】
${originalTweet}

【今回のトーン】
${meta.label}
${meta.instruction}

【出力要件】
- 本文のみ。前置き不要。
- 140文字以内、日本語
- @メンション不要
- 絵文字 0-2個
- ハッシュタグ基本なし

【禁止】
- 否定・批判
- 自院勧誘、価格、「白金高輪」「広尾」「開業」「オープン」「当院」
- 「分子栄養学」「オーソモレキュラー」
- 「絶対」「最高」「No.1」
- 架空の症例
- 確証なきPMID

返信本文だけを出力。
`.trim();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return (response.text || "").replace(/^```\n?/gm, "").replace(/```$/gm, "").trim();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const text = String(formData.get("text") || "").trim();
    const responseUrl = String(formData.get("response_url") || "");

    if (!text) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "使い方: `/reply-draft 相手のツイート本文をそのまま貼り付け`",
      });
    }

    // Respond immediately to acknowledge (within Slack's 3s)
    const ackResponse = NextResponse.json({
      response_type: "ephemeral",
      text: "🎨 3種類のリプライ案を生成中... (10秒ほどお待ちください)",
    });

    // Kick off async generation and posting to response_url
    if (responseUrl) {
      (async () => {
        try {
          const drafts = await Promise.all(
            TONES.map(async (t) => {
              const reply = await generateReply(t.tone, text);
              return { ...t, reply };
            })
          );

          const blocks: any[] = [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*📥 相手のツイート*\n> ${text.replace(/\n/g, "\n> ").substring(0, 300)}${text.length > 300 ? "..." : ""}`,
              },
            },
            { type: "divider" },
          ];

          for (const d of drafts) {
            blocks.push({
              type: "section",
              text: {
                type: "mrkdwn",
                text: `${d.icon} *${d.label}* (${d.reply.length}文字)\n\`\`\`${d.reply}\`\`\``,
              },
            });
          }

          blocks.push({
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "気に入った案をコピーして X で投稿してください。",
              },
            ],
          });

          await fetch(responseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              response_type: "ephemeral",
              replace_original: true,
              blocks,
            }),
          });
        } catch (err: any) {
          await fetch(responseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              response_type: "ephemeral",
              replace_original: true,
              text: `🚨 生成に失敗しました: ${err?.message || "unknown"}`,
            }),
          });
        }
      })().catch(() => {});
    }

    return ackResponse;
  } catch (error: any) {
    console.error("[reply-draft] error:", error);
    return NextResponse.json({
      response_type: "ephemeral",
      text: `エラー: ${error.message}`,
    });
  }
}
