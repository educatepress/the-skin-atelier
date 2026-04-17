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

    const targetItems: typeof eligibleItems = [];
    const xItem = eligibleItems.find(item => item.type === 'x');
    if (xItem) targetItems.push(xItem);
    const blogItem = eligibleItems.find(item => item.type === 'blog');
    if (blogItem) targetItems.push(blogItem);
    const igItem = eligibleItems.find(item => item.type === 'reel' || item.type === 'carousel');
    if (igItem) targetItems.push(igItem);

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

          const blogUrl = 'https://skin-atelier.jp/blog';
          const finalTweet = textToPost.includes('http') ? textToPost : `${textToPost}\n\n👇Read More\n${blogUrl}`;

          const tweetResult = await client.v2.tweet(finalTweet);
          postUrl = `https://twitter.com/user/status/${tweetResult.data.id}`;
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
            status: 'posted', posted_at: new Date().toISOString(), post_url: postUrl
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
