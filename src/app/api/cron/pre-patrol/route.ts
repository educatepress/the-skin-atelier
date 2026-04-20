/**
 * pre-patrol — the-skin-atelier (brand='atelier') 専用 AI コンプライアンス監査 cron
 *
 * pending + patrol_pre_result='pending' のアイテムに対して AI 監査を実行し、
 * Slack に承認ボタン付きメッセージを送信する。
 *
 * NOTE: プロンプト本体は webpage.new の既存ロジックをそのまま踏襲（改変禁止ルール）
 */
import { NextResponse } from 'next/server';
import { getQueueItems, updateQueueItem, getAtelierEnv } from '@/lib/sheets';
import { brandBadge } from '@/lib/brand';

export const maxDuration = 300;

export async function GET(req: Request) {
  const atelierEnv = getAtelierEnv();
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || atelierEnv.CRON_SECRET || 'dev-secret';

  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV !== 'development') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('🛡️ [Atelier] AI Pre-Patrol Cron Started.');

  const geminiKey = process.env.GEMINI_API_KEY || atelierEnv.GEMINI_API_KEY;
  const slackToken = process.env.SLACK_BOT_TOKEN || atelierEnv.SLACK_BOT_TOKEN;
  const slackChannel = process.env.SLACK_CHANNEL_ID || atelierEnv.SLACK_CHANNEL_ID || '#skin-atelier_jp';

  if (!slackToken) {
    return NextResponse.json({ error: 'SLACK_BOT_TOKEN missing' }, { status: 500 });
  }

  try {
    const queue = await getQueueItems();

    // atelier ブランドかつ Slack 未送信の pending アイテム
    // auto-post-blog.ts の Slack 送信が失敗したケースを救済するフォールバック
    const pendingItems = queue.filter(
      item => item.brand === 'atelier' && item.status === 'pending' && !item.slack_ts
    );

    if (pendingItems.length === 0) {
      console.log('ℹ️ [Atelier] No pending items for Pre-Patrol.');
      return NextResponse.json({ success: true, message: 'No items to patrol.' });
    }

    for (const item of pendingItems) {
      console.log(`🔍 [Atelier Pre-Patrol] ${item.title} (${item.type})`);

      let contentText = '';
      try {
        const recipe = JSON.parse(item.generation_recipe || '{}');
        if (item.type === 'blog') {
          contentText = `[JP BLOG]\n${recipe.captionText || recipe.jpBlog || ''}`;
        } else if (item.type === 'x') {
          contentText = `[X POST]\n${recipe.captionText || recipe.xPost || ''}`;
        } else if (item.type === 'reel') {
          const r = recipe.reelScript;
          contentText = r ? `[HOOK]\n${r.hookText}\n[AUDIO]\n${r.englishAudio}` : JSON.stringify(recipe, null, 2);
        } else if (item.type === 'carousel') {
          const slides = recipe.slides || [];
          contentText = slides.map((s: any) => `[Slide ${s.slideNumber}] ${s.headline || ''} ${s.body || ''}`).join('\n');
        } else {
          contentText = recipe.text || item.title;
        }
      } catch { contentText = item.title; }

      // AI 監査（Gemini）
      let aiFeedback = '';
      if (geminiKey) {
        try {
          const { GoogleGenAI } = require('@google/genai');
          const ai = new GoogleGenAI({ apiKey: geminiKey });

          const prompt = `あなたは美容皮膚科（Skin Atelier）専門の校閲者です。トーンは「洗練された身近な専門家」。薬機法や過剰な美容医療の勧誘表現、不自然なNGワードがないかチェックしてください。

以下の原稿を読み、以下のルールに違反していないか厳密にチェックし、結果を返してください。
1. トーン＆マナーの逸脱
2. 医療情報の断定表現（YMYL違反）
3. 美容医療の価格強調やBefore/Afterの過度な断言

問題がない場合は「✅ 異常なし。」と出力。問題がある場合は「⚠️ 要注意: [問題箇所] -> [修正提案]」を簡潔に出力。

【原稿】
${contentText}`;

          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          aiFeedback = response.text || 'パース失敗';
        } catch (e: any) {
          console.warn(`⚠️ [Atelier Pre-Patrol] AI failed: ${e.message}`);
          aiFeedback = '⚠️ AI Audit Failed. Please manually review.';
        }
      } else {
        aiFeedback = '⚠️ GEMINI_API_KEY not set. Manual review required.';
      }

      // Slack 通知
      const badge = brandBadge(item.brand);
      const previewText = contentText.length > 80 ? contentText.substring(0, 80) + '...' : contentText;

      let mediaLinkText = '';
      if (item.cloudinary_url || item.gdrive_url) {
        mediaLinkText = `\n\n🎬 *メディアプレビュー:*\n${item.cloudinary_url ? `<${item.cloudinary_url}|Cloudinary>` : ''} ${item.gdrive_url ? `<${item.gdrive_url}|Google Drive>` : ''}`;
      }

      const blocks = [
        {
          type: 'header',
          text: { type: 'plain_text', text: `📋 承認待ち: ${item.title} (${item.type})`, emoji: true }
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `*配信先:* ${badge}  |  *ID:* \`${item.content_id}\`` }]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*📝 プレビュー:* ${previewText.replace(/\n/g, ' ')}\n📍 *全文はスレッドをご確認ください。*${mediaLinkText}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button', text: { type: 'plain_text', text: '✅ 承認', emoji: true },
              style: 'primary', action_id: 'approve_content',
              value: JSON.stringify({ id: item.content_id })
            },
            {
              type: 'button', text: { type: 'plain_text', text: '❌ 却下', emoji: true },
              style: 'danger', action_id: 'reject_content',
              value: JSON.stringify({ id: item.content_id })
            }
          ]
        }
      ];

      try {
        const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${slackToken}` },
          body: JSON.stringify({ channel: slackChannel, text: `承認待ち: ${item.title}`, blocks })
        });
        const slackData = await slackRes.json();
        if (!slackData.ok) throw new Error(slackData.error || 'Slack API Error');

        if (slackData.ts) {
          await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${slackToken}` },
            body: JSON.stringify({
              channel: slackChannel, thread_ts: slackData.ts,
              text: `*🤖 AI監査結果:*\n${aiFeedback}\n\n---\n*📝 全テキスト:*\n\n${contentText}`
            })
          });
        }

        await updateQueueItem(item.rowNumber, {
          patrol_pre_result: 'done',
          slack_ts: slackData.ts || '',
        });
        console.log(`✅ [Atelier Pre-Patrol] ${item.content_id} → Slack notified (ts=${slackData.ts})`);
      } catch (err) {
        console.error(`❌ [Atelier Pre-Patrol] Slack failed for ${item.content_id}:`, err);
      }
    }

    return NextResponse.json({ success: true, processedCount: pendingItems.length });

  } catch (error: any) {
    console.error('❌ [Atelier Pre-Patrol] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
