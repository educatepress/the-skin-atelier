import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { SheetsDB } from '../../../../../scripts/lib/sheets-db';
import { Octokit } from '@octokit/rest';
import { WebClient } from '@slack/web-api';

// Vercel上で動作するSlack承認受け口（Webhook）
export async function POST(req: Request) {
  // --- Vercel Serverless Function Helper & Error Catcher ---
  let payloadStr: string | null = null;
  let payload: any = null;

  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    payloadStr = params.get('payload');
    
    if (!payloadStr) {
      return NextResponse.json({ error: 'No payload' }, { status: 400 });
    }

    payload = JSON.parse(payloadStr);

    if (payload.type === 'block_actions' && payload.actions && payload.actions[0]) {
      const action_id = payload.actions[0].action_id;
      
      if (action_id === 'approve_content' || action_id === 'reject_content') {
        let valueParsed: any = {};
        try {
          valueParsed = JSON.parse(payload.actions[0].value);
        } catch(e){}
        const { id } = valueParsed;
        
        // ------------------------------------------------------------
        // Timeout Wrapper to prevent Vercel 10s hang (and Slack 3s dispatch_failed)
        // ------------------------------------------------------------
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("FUNCTION_TIMEOUT: The process took too long. Check if Google Auth is hanging on prompt or if API is slow.")), 8000);
        });

        const mainTask = async () => {
          // Check ENV sanity
          const missingEnvs = [];
          if (!process.env.GOOGLE_OAUTH_TOKEN_JSON) missingEnvs.push("GOOGLE_OAUTH_TOKEN_JSON");
          if (!process.env.GOOGLE_OAUTH_CLIENT_ID) missingEnvs.push("GOOGLE_OAUTH_CLIENT_ID");
          if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) missingEnvs.push("GOOGLE_OAUTH_CLIENT_SECRET");
          if (!process.env.GOOGLE_SHEETS_QUEUE_ID) missingEnvs.push("GOOGLE_SHEETS_QUEUE_ID");
          
          if (missingEnvs.length > 0) {
            throw new Error(`MISSING_ENV: ${missingEnvs.join(', ')}`);
          }

          // Try to purely parse the token to identify JSON syntax issues in Vercel
          try {
            JSON.parse(process.env.GOOGLE_OAUTH_TOKEN_JSON as string);
          } catch(err) {
            throw new Error("JSON_PARSE_ERROR: GOOGLE_OAUTH_TOKEN_JSON is not a valid JSON. Check Vercel Environment Variables. Avoid trailing/leading quotes.");
          }

          if (action_id === 'reject_content') {
             await SheetsDB.updateRow(id || '', { status: 'rejected' });
             const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
             if (payload.message && payload.channel?.id && id) {
               await slackClient.chat.update({
                 channel: payload.channel.id,
                 ts: payload.message.ts,
                 text: `コンテンツ ${id} — ❌ 却下されました`,
                 blocks: [
                   {
                     type: 'section',
                     text: { type: 'mrkdwn', text: `❌ *このコンテンツは却下（Reject）されました。*\nID: ${id}` }
                   }
                 ]
               });
             }
             return { msg: "✅ 却下処理が完了しました。" };
          }

          // --- Approve Logic ---
          let queueItems = await SheetsDB.getRows();
          const targetRow = queueItems.find(r => r.content_id === id);
          if (!targetRow) {
            throw new Error(`NOT_FOUND: 指定されたコンテンツ(${id})がキューに見つかりません。`);
          }

          let recipe: any = {};
          try { recipe = JSON.parse(targetRow.generation_recipe || '{}'); } catch (e) {}
          const captionText = recipe.captionText || '';

          const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

          // X (Twitter)
          if (id && id.startsWith('x-')) {
            const missingXEnvs = [];
            if (!process.env.TWITTER_API_KEY) missingXEnvs.push("TWITTER_API_KEY");
            if (!process.env.TWITTER_ACCESS_TOKEN) missingXEnvs.push("TWITTER_ACCESS_TOKEN");
            if (missingXEnvs.length > 0) throw new Error(`MISSING_X_ENV: ${missingXEnvs.join(', ')}`);

            const twitterClient = new TwitterApi({
              appKey: process.env.TWITTER_API_KEY!,
              appSecret: process.env.TWITTER_API_SECRET!,
              accessToken: process.env.TWITTER_ACCESS_TOKEN!,
              accessSecret: process.env.TWITTER_ACCESS_SECRET!,
            });
            await twitterClient.v2.tweet(captionText);
            await SheetsDB.updateRow(id, { status: 'posted', posted_at: new Date().toISOString() });
            
            if (payload.message && payload.channel?.id) {
               await slackClient.chat.update({
                 channel: payload.channel.id,
                 ts: payload.message.ts,
                 text: `🐦 X投稿 ${targetRow.title} — ✅ 投稿完了`,
                 blocks: [{ type: 'section', text: { type: 'mrkdwn', text: `✅ *X（Twitter）への投稿が完了しました！*\n\n> ${captionText}` } }]
               });
            }
            return { msg: "X posted successfully" };
          }

          // Blog
          if (id && id.startsWith('blog-')) {
            const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
            const owner = process.env.GITHUB_OWNER || 'educatepress';
            const repo = process.env.GITHUB_REPO || 'the-skin-atelier';
            const slug = targetRow.title;
            const filePath = `content/blog/${slug}.md`;
            const contentEncoded = Buffer.from(captionText).toString('base64');

            let fileSha = undefined;
            try {
              const { data } = await octokit.repos.getContent({ owner, repo, path: filePath });
              if (!Array.isArray(data)) fileSha = (data as any).sha;
            } catch (err) {} 

            await octokit.repos.createOrUpdateFileContents({
              owner, repo, path: filePath, message: `Auto-publish blog: ${slug}`,
              content: contentEncoded, sha: fileSha,
            });

            await SheetsDB.updateRow(id, { status: 'posted', posted_at: new Date().toISOString() });

            if (payload.message && payload.channel?.id) {
               await slackClient.chat.update({
                 channel: payload.channel.id,
                 ts: payload.message.ts,
                 text: `📝 ブログ投稿 ${slug} — ✅ デプロイ開始`,
                 blocks: [{ type: 'section', text: { type: 'mrkdwn', text: `✅ *GitHubへの連携が完了し、Vercelのデプロイが開始されました！*\n約1〜2分後にサイトに公開されます。\n\n> 記事スラッグ: ${slug}` } }]
               });
            }
            return { msg: "Blog pushed successfully" };
          }
          
          return { msg: "ID unknown format" };
        };

        // Execute task with timeout
        await Promise.race([mainTask(), timeoutPromise]);
        
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    
    // Attempt to notify Slack of the specific programmatic error so user knows instead of blind "dispatch_failed"
    try {
      if (payload && payload.channel && payload.channel.id && process.env.SLACK_BOT_TOKEN) {
        const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
        await slackClient.chat.postMessage({
          channel: payload.channel.id,
          thread_ts: payload.message?.ts, // Post as a reply to the approval message
          text: `⚠️ *システムエラー発生*\n詳細: \`${error.message}\``
        });
      }
    } catch(replyErr) {
       console.error("Could not send error reply to Slack", replyErr);
    }
    
    // Slack still requires 200 within 3s or it shows dispatch_failed. To hide dispatch failed we could return 200, but we return 500 to signal true failure.
    // However, if we sent a slack message, returning 200 avoids the scary red warning.
    return NextResponse.json({ text: `エラー: ${error.message}` }, { status: 200 });
  }
}
