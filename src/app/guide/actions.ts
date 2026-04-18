"use server";

import { google } from "googleapis";
import { getGoogleAuthClient, QUEUE_SPREADSHEET_ID } from "@/lib/sheets";

const LEADS_SHEET_NAME = "Leads";
const LEADS_HEADERS = ["timestamp", "email", "name", "source", "consent", "ip"];

export type LeadSubmitResult =
  | { ok: true; downloadUrl: string }
  | { ok: false; error: string };

/**
 * リード情報（メールアドレス等）を Google Sheets の Leads シートに追記する。
 * 加えて Slack (#skin-atelier_jp) に新規登録通知を送る。
 */
export async function submitLead(formData: FormData): Promise<LeadSubmitResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const source = String(formData.get("source") || "guide");
  const consent = formData.get("consent") === "on" ? "yes" : "no";

  // Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "有効なメールアドレスを入力してください。" };
  }
  if (consent !== "yes") {
    return { ok: false, error: "プライバシーに関する同意にチェックしてください。" };
  }

  try {
    const auth = await getGoogleAuthClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    // Ensure Leads sheet exists (idempotent)
    try {
      await sheets.spreadsheets.values.get({
        spreadsheetId: QUEUE_SPREADSHEET_ID,
        range: `${LEADS_SHEET_NAME}!A1:F1`,
      });
    } catch {
      // シート未作成の場合はここでは作らない（初回は手動作成推奨）
      // ログだけ残して処理は続行
      console.warn(`[submitLead] Leads sheet may not exist. Skipping header check.`);
    }

    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.append({
      spreadsheetId: QUEUE_SPREADSHEET_ID,
      range: `${LEADS_SHEET_NAME}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[timestamp, email, name, source, consent, ""]],
      },
    });

    // Slack 通知 (非必須、失敗してもメイン処理は通す)
    const slackToken = process.env.SLACK_BOT_TOKEN;
    if (slackToken) {
      try {
        await fetch("https://slack.com/api/chat.postMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${slackToken}`,
          },
          body: JSON.stringify({
            channel: "skin-atelier_jp",
            text: `📩 *新規リード登録*\n${name ? `お名前: ${name}\n` : ""}メール: \`${email}\`\nソース: ${source}`,
          }),
        });
      } catch (err) {
        console.warn("[submitLead] Slack notification failed:", err);
      }
    }

    return {
      ok: true,
      downloadUrl: "/guide/download",
    };
  } catch (error: any) {
    console.error("[submitLead] Error:", error);
    return {
      ok: false,
      error: "登録に問題が発生しました。恐れ入りますが、少し時間をおいて再度お試しください。",
    };
  }
}
