/**
 * Slack Reporter — パトロール結果を Slack に通知
 */

export interface PatrolResult {
  success: boolean;
  totalPages: number;
  checkedPages: number;
  errors: string[];
  warnings: string[];
  blogCount: number;
  durationMs: number;
}

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL = process.env.SLACK_PATROL_CHANNEL || "#skin-atelier_jp";

export async function reportToSlack(result: PatrolResult): Promise<void> {
  if (!SLACK_BOT_TOKEN) {
    console.warn("⚠️ SLACK_BOT_TOKEN が未設定。Slack通知をスキップします。");
    console.log("--- Patrol Report (stdout) ---");
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const icon = result.success ? "🟢" : "🔴";
  const title = result.success
    ? "The Skin Atelier パトロール完了"
    : "The Skin Atelier パトロール — 異常検出";

  // Build message blocks
  const blocks: object[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${icon} ${title}`,
        emoji: true,
      },
    },
    {
      type: "divider",
    },
  ];

  if (result.success) {
    // All clear
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: [
          `✅ 全 *${result.totalPages}* ページ正常 (200 OK)`,
          `✅ OGP / meta タグ: 完備`,
          `✅ 画像: 全件読み込み成功`,
          `📊 ブログ記事: *${result.blogCount}* 件`,
          `⏱ 実行時間: ${(result.durationMs / 1000).toFixed(1)}秒`,
        ].join("\n"),
      },
    });
  } else {
    // Errors found
    const errorList = result.errors.slice(0, 10).map((e) => `❌ ${e}`);
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: errorList.join("\n"),
      },
    });

    if (result.errors.length > 10) {
      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `…他 ${result.errors.length - 10} 件のエラー`,
          },
        ],
      });
    }
  }

  // Warnings
  if (result.warnings.length > 0) {
    const warnList = result.warnings.slice(0, 5).map((w) => `⚠️ ${w}`);
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Warnings:*\n${warnList.join("\n")}`,
      },
    });
  }

  // Timestamp
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `🕐 ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
      },
    ],
  });

  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: SLACK_CHANNEL,
        blocks,
        text: `${icon} ${title}`, // Fallback
      }),
    });

    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!data.ok) {
      console.error("Slack送信失敗:", data.error);
    } else {
      console.log(`✅ Slack通知を ${SLACK_CHANNEL} に送信しました`);
    }
  } catch (e) {
    console.error("Slack API接続エラー:", e);
  }
}
