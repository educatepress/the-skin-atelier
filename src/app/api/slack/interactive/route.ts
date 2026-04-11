import { NextResponse, after } from 'next/server';
import { getEnvVar } from '@/lib/env-helper';
import { updateSheetRow } from '@/lib/sheets-rest';

const SLACK_BOT_TOKEN = getEnvVar('SLACK_BOT_TOKEN');

async function updateSlackMessage(channel: string, ts: string, text: string, blocks: any[]) {
  if (!SLACK_BOT_TOKEN) {
    console.error('[updateSlackMessage] No Slack Bot Token found.');
    return;
  }
  const res = await fetch('https://slack.com/api/chat.update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({ channel, ts, text, blocks })
  });
  const data = await res.json();
  if (!data.ok) {
    console.error('[updateSlackMessage] Failed:', data.error);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payloadStr = formData.get('payload');

    if (!payloadStr || typeof payloadStr !== 'string') {
      return NextResponse.json({ error: 'No payload' }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);

    // =========================================================================
    // 1. Handle Button Clicks (Block Actions)
    // =========================================================================
    if (payload.type === 'block_actions') {
      const action = payload.actions?.[0];
      if (!action) return NextResponse.json({ ok: true });

      if (action.action_id === 'approve_content') {
        const parsedValue = JSON.parse(action.value || '{}');
        const contentId = parsedValue.id;
        const channel = payload.container?.channel_id;
        const ts = payload.container?.message_ts;
        const blocks = payload.message?.blocks;

        // ⚡ Slackは3秒以内の応答を要求するため、重い処理はafter構文でバックグラウンド実行
        after(async () => {
          try {
            const today = new Date().toISOString().split('T')[0];
            await updateSheetRow(contentId, {
              status: 'approved',
              scheduled_date: today
            });
            console.log(`[Slack API] ✅ Successfully approved ${contentId} in Google Sheets.`);
          } catch (err) {
            console.error('[Slack API] Failed to update Google Sheets on approve:', err);
          }

          // --- Automatically publish pending Drafts for Webpage.new ---
          try {
            const fs = require('fs');
            const path = require('path');
            const slugMatch = contentId.match(/^blog-(.+?)-\d+$/);
            const rawSlug = slugMatch ? slugMatch[1] : contentId;

            const jpBlogPath = path.join(process.cwd(), 'src/content/blog/jp', `${rawSlug}.mdx.pending`);
            const enBlogPath = path.join(process.cwd(), 'src/content/blog/en', `${rawSlug}-en.mdx.pending`);
            
            if (fs.existsSync(jpBlogPath)) {
              fs.renameSync(jpBlogPath, jpBlogPath.replace('.pending', ''));
              console.log(`✅ Auto-published: ${rawSlug}.mdx`);
            }
            if (fs.existsSync(enBlogPath)) {
              fs.renameSync(enBlogPath, enBlogPath.replace('.pending', ''));
              console.log(`✅ Auto-published: ${rawSlug}-en.mdx`);
            }
          } catch (postErr) {
            console.error('[Slack API] Failed to auto-publish pending MDX file:', postErr);
          }

          if (channel && ts && blocks) {
            const actionBlockIndex = blocks.findIndex((b: any) => b.type === 'actions');
            if (actionBlockIndex !== -1) {
              blocks[actionBlockIndex] = {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `✅ *承認済み* (明朝の自動投稿キューに登録されました)`
                }
              };
              await updateSlackMessage(channel, ts, '承認されました', blocks);
            }
          }
        });

        // 処理のキューイング完了後、即座にSlackへ200 OKを返す
        return NextResponse.json({ ok: true });
      }

      // ❌ [Reject] -> Open Modal for reason
      if (action.action_id === 'reject_content') {
        const parsedValue = JSON.parse(action.value || '{}');
        const contentId = parsedValue.id;

        console.log(`[Slack API] Opening rejection modal for: ${contentId}`);

        // Save original message context to update it after submission
        const privateMetadata = JSON.stringify({
          id: contentId,
          channel: payload.container?.channel_id,
          ts: payload.container?.message_ts,
          blocks: payload.message?.blocks
        });

        if (SLACK_BOT_TOKEN) {
          await fetch('https://slack.com/api/views.open', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
            },
            body: JSON.stringify({
              trigger_id: payload.trigger_id,
              view: {
                type: 'modal',
                callback_id: 'reject_modal_submission',
                private_metadata: privateMetadata,
                title: { type: 'plain_text', text: '却下理由の入力' },
                submit: { type: 'plain_text', text: '却下する', emoji: true },
                close: { type: 'plain_text', text: 'キャンセル', emoji: true },
                blocks: [
                  {
                    type: 'input',
                    block_id: 'reason_block',
                    label: { type: 'plain_text', text: '修正指示・却下理由を詳しく書いてください' },
                    element: {
                      type: 'plain_text_input',
                      action_id: 'reason_input',
                      multiline: true,
                      placeholder: { type: 'plain_text', text: '例: フックが弱いです。「35歳以上」というキーワードを含めてリライトしてください。' }
                    }
                  }
                ]
              }
            })
          });
        }
        return NextResponse.json({ ok: true });
      }
    }

    // =========================================================================
    // 2. Handle Modal Submission (View Submission)
    // =========================================================================
    if (payload.type === 'view_submission' && payload.view?.callback_id === 'reject_modal_submission') {
      const stateValues = payload.view.state.values;
      const reason = stateValues?.reason_block?.reason_input?.value || '理由なし';
      
      const privateMetadata = JSON.parse(payload.view.private_metadata || '{}');
      const contentId = privateMetadata.id;

      after(async () => {
        let success = false;
        try {
          await updateSheetRow(contentId, {
            status: 'rejected',
            rej_reason: reason
          });
          console.log(`[Slack API] Successfully recorded rejection for ${contentId} in Google Sheets. Reason: ${reason}`);
          success = true;
        } catch (err) {
          console.error('[Slack API] Failed to update Google Sheets:', err);
        }

        // Update the original Slack message to show the rejection
        if (privateMetadata.channel && privateMetadata.ts && privateMetadata.blocks) {
          const blocks = privateMetadata.blocks;
          const actionBlockIndex = blocks.findIndex((b: any) => b.type === 'actions');
          
          if (actionBlockIndex !== -1) {
            blocks[actionBlockIndex] = {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `❌ *却下済み*\n*理由:* ${reason}${!success ? ' (※queue.jsonの更新に失敗)' : ''}`
              }
            };
            await updateSlackMessage(privateMetadata.channel, privateMetadata.ts, '却下されました', blocks);
          }
        }
      });

      // Clear the modal
      return NextResponse.json({
        response_action: 'clear'
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Slack API] Unhandled error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
