/**
 * daily-publisher — the-skin-atelier (brand='atelier') 専用日次投稿 cron
 *
 * Vercel cron で毎朝 JST 10:00 (01:00 UTC) に実行。
 * status='approved' & scheduled_date=今日 のアイテムを処理。
 */
import { NextResponse } from 'next/server';
import { getQueueItems, updateQueueItem, QueueItem, getAtelierEnv } from '@/lib/sheets';
import { TwitterApi } from 'twitter-api-v2';

export const maxDuration = 300;

async function pushToGithub(token: string, owner: string, repo: string, path: string, content: string, message: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
  };

  let sha = undefined;
  const getRes = await fetch(url, { headers });
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

  const utf8Buffer = Buffer.from(content, 'utf8');
  const base64Content = utf8Buffer.toString('base64');

  const putRes = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message, content: base64Content, sha })
  });

  if (!putRes.ok) {
    const errorText = await putRes.text();
    throw new Error(`GitHub API Error (${putRes.status}): ${errorText}`);
  }
}

export async function GET(req: Request) {
  const atelierEnv = getAtelierEnv();
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || atelierEnv.CRON_SECRET || 'dev-secret';

  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV !== 'development') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('🚀 [Atelier] Daily Publisher Cron Job Started.');

  try {
    const allItems = await getQueueItems();
    const dt = new Date(Date.now() + 9 * 3600 * 1000);
    const today = dt.toISOString().split('T')[0];

    // atelier ブランドかつ今日の approved のみ
    const eligibleItems = allItems.filter(
      item => item.brand === 'atelier' && item.status === 'approved' && item.scheduled_date === today
    );

    const targetItems: typeof eligibleItems = [
      ...eligibleItems.filter(item => item.type === 'x'),
      ...eligibleItems.filter(item => item.type === 'blog'),
      ...eligibleItems.filter(item => item.type === 'reel' || item.type === 'carousel'),
    ];

    if (targetItems.length === 0) {
      console.log('ℹ️ [Atelier] No approved items for today.');
      return NextResponse.json({ success: true, message: 'No items to publish.' });
    }

    const processedResults = [];

    for (const item of targetItems) {
      console.log(`📡 [Atelier] Publishing [${item.type}] ${item.title}...`);
      let postUrl = '';
      let isSuccess = false;

      try {
        if (item.type === 'x') {
          const apiKey = process.env.TWITTER_API_KEY || atelierEnv.TWITTER_API_KEY || '';
          const apiSecret = process.env.TWITTER_API_SECRET || atelierEnv.TWITTER_API_SECRET || '';
          const accessToken = process.env.TWITTER_ACCESS_TOKEN || atelierEnv.TWITTER_ACCESS_TOKEN || '';
          const accessSecret = process.env.TWITTER_ACCESS_SECRET || atelierEnv.TWITTER_ACCESS_SECRET || '';

          if (!apiKey || !accessToken) throw new Error('Twitter API Keys missing');

          const client = new TwitterApi({ appKey: apiKey, appSecret: apiSecret, accessToken, accessSecret });

          let textToPost = '';
          try {
            const recipe = JSON.parse(item.generation_recipe || '{}');
            textToPost = recipe.captionText || recipe.xPost || recipe.text || '';
          } catch { textToPost = item.title; }

          if (!textToPost) throw new Error('投稿用テキストが空です');

          // "---" セパレータでスレッド分割 (generate-x-post.ts の出力形式)
          // Free Tier は 1ツイート最大280 weight（日本語1文字=2 weight）。
          // プロンプトで1ポスト130字以内を要求している前提で、最終ポストにブログURLを付与。
          const blogUrl = 'https://skin-atelier.jp/blog';
          const rawParts = textToPost
            .split(/^---\s*$/m)
            .map(p => p.trim())
            .filter(Boolean);
          const parts = rawParts.length > 0 ? rawParts : [textToPost.trim()];

          // 最終ポストに Read More を付与（既にURL含む場合はスキップ）
          const lastIdx = parts.length - 1;
          if (!parts[lastIdx].includes('http')) {
            parts[lastIdx] = `${parts[lastIdx]}\n\n👇Read More\n${blogUrl}`;
          }

          // Free Tier の 280 weight 制限チェック
          // CJK 系は 2 weight、英数字は 1 weight として近似
          const tweetWeight = (s: string) =>
            [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x7F ? 2 : 1), 0);
          const tooLong = parts.find(p => tweetWeight(p) > 280);
          if (tooLong) {
            throw new Error(
              `Tweet part exceeds 280 weight (${tweetWeight(tooLong)}): "${tooLong.slice(0, 40)}..."`
            );
          }

          // スレッド投稿: 1本目は tweet, 2本目以降は reply
          let firstTweetId = '';
          let prevTweetId = '';
          for (let i = 0; i < parts.length; i++) {
            const opts: any = prevTweetId ? { reply: { in_reply_to_tweet_id: prevTweetId } } : undefined;
            const result = opts
              ? await client.v2.tweet(parts[i], opts)
              : await client.v2.tweet(parts[i]);
            if (i === 0) firstTweetId = result.data.id;
            prevTweetId = result.data.id;
          }
          postUrl = `https://twitter.com/dr_miyaka_skin/status/${firstTweetId}`;
          isSuccess = true;

        } else if (item.type === 'blog') {
          const githubToken = process.env.GITHUB_TOKEN || atelierEnv.GITHUB_TOKEN;

          if (!githubToken) {
            console.log(`⏭️ GITHUB_TOKEN not set. Skipping.`);
            postUrl = 'https://github.com/pending/token-missing';
            isSuccess = true;
          } else {
            let jpContent = '';
            try {
              const recipe = JSON.parse(item.generation_recipe || '{}');
              jpContent = recipe.captionText || recipe.jpBlog || '';
            } catch { /* */ }

            if (!jpContent) throw new Error('ブログのコンテンツが空です');

            const commitMessage = `Auto-publish: ${item.title}`;
            await pushToGithub(githubToken, 'educatepress', 'the-skin-atelier', `content/blog/${item.title}.md`, jpContent, commitMessage);
            postUrl = `https://github.com/educatepress/the-skin-atelier/blob/main/content/blog/${item.title}.md`;
            isSuccess = true;
          }

        } else if (item.type === 'carousel' || item.type === 'reel') {
          const makeWebhookUrl = process.env.MAKE_IG_PUBLISH_WEBHOOK_URL || process.env.MAKE_PUBLISH_WEBHOOK_URL || atelierEnv.MAKE_PUBLISH_WEBHOOK_URL;

          if (!makeWebhookUrl) {
            console.log(`⏭️ MAKE webhook not set. Skipping IG post.`);
            postUrl = 'https://instagram.com/pending';
            isSuccess = true;
          } else {
            let captionText = '';
            try {
              const recipe = JSON.parse(item.generation_recipe || '{}');
              captionText = recipe.captionText || recipe.text || item.title;
            } catch { captionText = item.title; }

            const response = await fetch(makeWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: item.type, title: item.title, brand: 'atelier',
                cloudinary_url: item.cloudinary_url, captionText
              })
            });

            if (!response.ok) throw new Error(`Make Webhook failed: ${response.status}`);
            postUrl = 'https://instagram.com/published_via_make';
            isSuccess = true;
          }
        }

        if (isSuccess) {
          await updateQueueItem(item.rowNumber, {
            status: 'posted',
            posted_at: new Date().toISOString(),
            post_url: postUrl,
            error_detail: '', // 過去の失敗ログをクリア（再試行で成功したケース）
          });
          processedResults.push({ id: item.content_id, status: 'success', url: postUrl });
          console.log(`✅ [Atelier] Published [${item.type}] ${item.title}`);
        }

      } catch (e: any) {
        console.error(`❌ [Atelier] Failed: ${item.title}:`, e.message);
        await updateQueueItem(item.rowNumber, { error_detail: e.message });
        processedResults.push({ id: item.content_id, status: 'error', reason: e.message });
      }
    }

    return NextResponse.json({ success: true, processed: processedResults });

  } catch (error: any) {
    console.error('❌ [Atelier] Daily Publisher Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
