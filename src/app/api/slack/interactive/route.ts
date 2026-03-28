import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { SheetsDB } from '../../../../../scripts/lib/sheets-db';
import { Octokit } from '@octokit/rest';
import { WebClient } from '@slack/web-api';

// Vercel上で動作するSlack承認受け口（Webhook）
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const payloadStr = params.get('payload');
    
    if (!payloadStr) {
      return NextResponse.json({ error: 'No payload' }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);

    // Block Kitのアクションが「承認（Approve）」かどうか確認
    if (payload.type === 'block_actions' && payload.actions[0].action_id === 'approve_content') {
      const { id, batchId } = JSON.parse(payload.actions[0].value);
      
      // キューデータからの判定
      const isXPost = id.startsWith('x-');
      const isBlogPost = id.startsWith('blog-');

      console.log(`[Slack Webhook] 承認リクエスト受信: ${id}`);

      // ──────────────────────────────────────────────
      // 共通処理：スプレッドシートから対象コンテンンを取得
      // ──────────────────────────────────────────────
      let queueItems = [];
      try {
        queueItems = await SheetsDB.getRows();
      } catch (e) {
        console.error('SheetsDB error:', e);
        return NextResponse.json({ text: "❌ スプレッドシートの読み込みに失敗しました。" });
      }

      const targetRow = queueItems.find(r => r.content_id === id);
      if (!targetRow) {
        return NextResponse.json({ text: "❌ 指定されたコンテンツがキューに見つかりません。" });
      }

      let recipe: any = {};
      try {
        recipe = JSON.parse(targetRow.generation_recipe || '{}');
      } catch (e) {}

      const captionText = recipe.captionText || '';
      if (!captionText) {
        return NextResponse.json({ text: "❌ 本文（captionText）が空です。" });
      }

      // Slackクライアント初期化（メッセージ更新用）
      const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

      // ──────────────────────────────────────────────
      // X (Twitter) の即時自動投稿ロジック
      // ──────────────────────────────────────────────
      if (isXPost) {
        try {
          const twitterClient = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY!,
            appSecret: process.env.TWITTER_API_SECRET!,
            accessToken: process.env.TWITTER_ACCESS_TOKEN!,
            accessSecret: process.env.TWITTER_ACCESS_SECRET!,
          });

          // X API (v2) を叩いて投稿
          await twitterClient.v2.tweet(captionText);
          
          await SheetsDB.updateRow(id, { status: 'posted', posted_at: new Date().toISOString() });
          
          if (payload.message && payload.channel?.id) {
            await slackClient.chat.update({
              channel: payload.channel.id,
              ts: payload.message.ts,
              text: `🐦 X投稿 ${targetRow.title} — ✅ 投稿完了`,
              blocks: [
                {
                  type: 'section',
                  text: { type: 'mrkdwn', text: `✅ *X（Twitter）への投稿が完了しました！*\n\n> ${captionText.replace(/\\n/g, '\\n> ')}` }
                }
              ]
            });
          }
          return NextResponse.json({ ok: true });
        } catch (e: any) {
          console.error('Twitter API error:', e);
          return NextResponse.json({ text: `❌ X への投稿に失敗しました: ${e.message}` });
        }
      }

      // ──────────────────────────────────────────────
      // Blog の自動公開（GitHub API経由でのVercelデプロイ）ロジック
      // ──────────────────────────────────────────────
      if (isBlogPost) {
        try {
          const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
          const owner = process.env.GITHUB_OWNER || 'educatepress';
          const repo = process.env.GITHUB_REPO || 'the-skin-atelier';
          const slug = targetRow.title;
          const filePath = `src/content/blog/${slug}.mdx`;
          const commitMessage = `Auto-publish blog: ${slug}`;
          const contentEncoded = Buffer.from(captionText).toString('base64');

          // Check if file exists to get SHA (for updates)
          let fileSha = undefined;
          try {
            const { data } = await octokit.repos.getContent({ owner, repo, path: filePath });
            if (!Array.isArray(data)) fileSha = data.sha;
          } catch (err) {} // File doesn't exist yet

          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: filePath,
            message: commitMessage,
            content: contentEncoded,
            sha: fileSha,
          });

          await SheetsDB.updateRow(id, { status: 'posted', posted_at: new Date().toISOString() });

          if (payload.message && payload.channel?.id) {
            await slackClient.chat.update({
              channel: payload.channel.id,
              ts: payload.message.ts,
              text: `📝 ブログ投稿 ${slug} — ✅ デプロイ開始`,
              blocks: [
                {
                  type: 'section',
                  text: { type: 'mrkdwn', text: `✅ *GitHubへの連携が完了し、Vercelのデプロイが開始されました！*\n約1〜2分後にサイトに公開されます。\n\n> 記事スラッグ: ${slug}` }
                }
              ]
            });
          }
          return NextResponse.json({ ok: true });
        } catch (e: any) {
          console.error('GitHub API error:', e);
          return NextResponse.json({ text: `❌ ブログの連携（GitHub Push）に失敗しました: ${e.message}` });
        }
      }

      // 処理の完了をSlackに返す（メッセージブロックの更新情報を返せばUIが変わる）
      return NextResponse.json({ text: "✅ コンテンツの本番投稿プロセスを開始しました。" });
    }

    // 却下（Reject）の場合
    if (payload.type === 'block_actions' && payload.actions[0].action_id === 'reject_content') {
      const { id } = JSON.parse(payload.actions[0].value);
      await SheetsDB.updateRow(id, { status: 'rejected' });
      
      const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
      if (payload.message && payload.channel?.id) {
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
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
