/**
 * Slack Interactive Endpoint — the-skin-atelier (brand='atelier') 専用
 *
 * 承認ボタン → Google Sheets の status を 'approved' + scheduled_date を翌日JSTに設定
 * daily-publisher cron が翌朝に投稿を実行する。
 */
import { NextResponse } from 'next/server';
import { updateSheetRow } from '@/lib/sheets-rest';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || '';
const MAKE_PUBLISH_WEBHOOK_URL = process.env.MAKE_PUBLISH_WEBHOOK_URL || '';

async function updateSlackMessage(channel: string, ts: string, text: string, blocks: any[]) {
  if (!SLACK_BOT_TOKEN) {
    console.error('[updateSlackMessage] No Slack Bot Token.');
    return;
  }
  await fetch('https://slack.com/api/chat.update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
    body: JSON.stringify({ channel, ts, text, blocks })
  });
}

export async function POST(req: Request) {
  let payload: any = null;

  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const payloadStr = params.get('payload');

    if (!payloadStr) {
      return NextResponse.json({ error: 'No payload' }, { status: 400 });
    }

    payload = JSON.parse(payloadStr);

    if (payload.type === 'block_actions') {
      const action = payload.actions?.[0];
      if (!action) return NextResponse.json({ ok: true });

      // ✅ Approve
      if (action.action_id === 'approve_content') {
        const parsedValue = JSON.parse(action.value || '{}');
        const contentId = parsedValue.id;
        const project = parsedValue.p || '';
        const channel = payload.container?.channel_id;
        const ts = payload.container?.message_ts;
        const blocks = payload.message?.blocks;

        try {
          const tomorrowJst = new Date(Date.now() + 9 * 3600 * 1000 + 24 * 3600 * 1000)
            .toISOString()
            .split('T')[0];
          await updateSheetRow(contentId, {
            status: 'approved',
            scheduled_date: tomorrowJst
          });
          console.log(`[Atelier Slack] ✅ Approved ${contentId} (scheduled for ${tomorrowJst}).`);
        } catch (err) {
          console.error('[Atelier Slack] Failed to update Sheets:', err);
        }

        // reels-factory-atelier の場合、Make.com へ即時発射
        if (project === 'reels-factory' && MAKE_PUBLISH_WEBHOOK_URL) {
          try {
            await fetch(MAKE_PUBLISH_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content_id: contentId,
                action: 'publish',
                approved_at: new Date().toISOString()
              })
            });
            console.log(`[Atelier Slack] 📤 Make.com webhook triggered for ${contentId}`);
          } catch (err) {
            console.error('[Atelier Slack] Make.com webhook failed:', err);
          }
        }

        if (channel && ts && blocks) {
          const actionBlockIndex = blocks.findIndex((b: any) => b.type === 'actions');
          if (actionBlockIndex !== -1) {
            const statusText = project === 'reels-factory'
              ? `✅ *承認済み* — Make.com 経由で Instagram 投稿キューに登録されました`
              : `✅ *承認済み* (明朝の自動投稿キューに登録されました)`;
            blocks[actionBlockIndex] = {
              type: 'section',
              text: { type: 'mrkdwn', text: statusText }
            };
            await updateSlackMessage(channel, ts, '承認されました', blocks);
          }
        }

        return NextResponse.json({ ok: true });
      }

      // ❌ Reject
      if (action.action_id === 'reject_content' || action.action_id === 'request_revision') {
        const parsedValue = JSON.parse(action.value || '{}');
        const contentId = parsedValue.id;
        const isRevision = action.action_id === 'request_revision';

        try {
          const newStatus = isRevision ? 'revision' : 'rejected';
          await updateSheetRow(contentId, { status: newStatus });
          console.log(`[Atelier Slack] ${isRevision ? '🔄' : '❌'} ${contentId} → ${newStatus}`);
        } catch (err) {
          console.error('[Atelier Slack] Failed to update status:', err);
        }

        const channel = payload.container?.channel_id;
        const ts = payload.container?.message_ts;
        const blocks = payload.message?.blocks;

        if (channel && ts && blocks) {
          const actionBlockIndex = blocks.findIndex((b: any) => b.type === 'actions');
          if (actionBlockIndex !== -1) {
            const statusText = isRevision ? '🔄 *修正依頼されました*' : '❌ *却下されました*';
            blocks[actionBlockIndex] = {
              type: 'section',
              text: { type: 'mrkdwn', text: statusText }
            };
            await updateSlackMessage(channel, ts, statusText, blocks);
          }
        }

        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Atelier Slack] Webhook error:', error);

    try {
      if (payload?.container?.channel_id && SLACK_BOT_TOKEN) {
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
          body: JSON.stringify({
            channel: payload.container.channel_id,
            thread_ts: payload.container?.message_ts,
            text: `⚠️ *システムエラー*: \`${error.message}\``
          })
        });
      }
    } catch { /* */ }

    return NextResponse.json({ text: `Error: ${error.message}` }, { status: 200 });
  }
}
