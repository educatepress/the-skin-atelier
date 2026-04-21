/**
 * x-monitor — the-skin-atelier (brand='atelier') X パフォーマンス監視 cron
 *
 * status='posted' の直近 14 日の X 投稿を対象に public_metrics を取得し、
 * PostMetrics シートに蓄積。Slack に daily summary を通知。
 *
 * GitHub Actions で毎日 12:00 JST (03:00 UTC) にトリガー。
 */
import { NextResponse } from 'next/server';
import { getQueueItems, appendOrUpdateMetric, getAtelierEnv, PostMetric } from '@/lib/sheets';
import { TwitterApi } from 'twitter-api-v2';

export const maxDuration = 300;

function extractTweetId(postUrl: string): string | null {
  // https://twitter.com/dr_miyaka_skin/status/1234567890 or https://x.com/...
  const match = postUrl.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

export async function GET(req: Request) {
  const atelierEnv = getAtelierEnv();
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || atelierEnv.CRON_SECRET || 'dev-secret';

  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV !== 'development') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('📊 [Atelier] X Performance Monitor Started.');

  const apiKey = process.env.TWITTER_API_KEY || atelierEnv.TWITTER_API_KEY || '';
  const apiSecret = process.env.TWITTER_API_SECRET || atelierEnv.TWITTER_API_SECRET || '';
  const accessToken = process.env.TWITTER_ACCESS_TOKEN || atelierEnv.TWITTER_ACCESS_TOKEN || '';
  const accessSecret = process.env.TWITTER_ACCESS_SECRET || atelierEnv.TWITTER_ACCESS_SECRET || '';
  const slackToken = process.env.SLACK_BOT_TOKEN || atelierEnv.SLACK_BOT_TOKEN;
  const slackChannel = process.env.SLACK_CHANNEL_ID || atelierEnv.SLACK_CHANNEL_ID || '#skin-atelier_jp';

  if (!apiKey || !accessToken) {
    console.error('❌ Twitter credentials missing');
    return NextResponse.json({ error: 'Twitter credentials missing' }, { status: 500 });
  }

  const client = new TwitterApi({ appKey: apiKey, appSecret: apiSecret, accessToken, accessSecret });

  // 直近 14 日の posted アイテムを取得
  const allItems = await getQueueItems();
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const postedItems = allItems.filter(item => {
    if (item.status !== 'posted') return false;
    if (!item.post_url || !item.post_url.includes('status/')) return false;
    // type が x or x-thread のみ対象
    if (!item.type.startsWith('x')) return false;
    // posted_at で 14 日以内をフィルタ
    if (item.posted_at) {
      const postedDate = new Date(item.posted_at);
      if (postedDate < fourteenDaysAgo) return false;
    }
    return true;
  });

  console.log(`📊 対象ツイート: ${postedItems.length}件 (直近14日)`);

  const results: { content_id: string; impressions: number; likes: number; retweets: number }[] = [];
  let errors = 0;

  for (const item of postedItems) {
    const tweetId = extractTweetId(item.post_url);
    if (!tweetId) {
      console.warn(`⚠️ tweet ID 抽出失敗: ${item.content_id} (${item.post_url})`);
      continue;
    }

    try {
      const tweet = await client.v2.singleTweet(tweetId, {
        'tweet.fields': ['created_at', 'public_metrics'],
      });

      const metrics = tweet.data.public_metrics;
      if (!metrics) {
        console.warn(`⚠️ metrics なし: ${tweetId}`);
        continue;
      }

      const metric: PostMetric = {
        content_id: item.content_id,
        tweet_id: tweetId,
        posted_date: item.posted_at || item.scheduled_date || '',
        pattern_type: item.type,
        impressions: metrics.impression_count ?? 0,
        likes: metrics.like_count ?? 0,
        retweets: metrics.retweet_count ?? 0,
        replies: metrics.reply_count ?? 0,
        quotes: metrics.quote_count ?? 0,
        bookmarks: metrics.bookmark_count ?? 0,
        last_updated: new Date().toISOString(),
      };

      await appendOrUpdateMetric(metric);
      results.push({
        content_id: item.content_id,
        impressions: metric.impressions,
        likes: metric.likes,
        retweets: metric.retweets,
      });

      console.log(`✅ ${item.content_id}: ${metric.impressions} imp / ${metric.likes} likes`);
    } catch (e: any) {
      errors++;
      console.error(`❌ ${item.content_id} (${tweetId}): ${e.message}`);
    }
  }

  // Slack に daily summary を送信
  if (slackToken && results.length > 0) {
    const totalImpressions = results.reduce((s, r) => s + r.impressions, 0);
    const totalLikes = results.reduce((s, r) => s + r.likes, 0);
    const totalRetweets = results.reduce((s, r) => s + r.retweets, 0);

    // 上位3件をピックアップ
    const top3 = [...results].sort((a, b) => b.impressions - a.impressions).slice(0, 3);
    const topLines = top3.map((r, i) =>
      `  ${i + 1}. \`${r.content_id}\` — ${r.impressions.toLocaleString()} imp / ${r.likes} likes`
    ).join('\n');

    const slackText = [
      `📊 *X パフォーマンス日次レポート*`,
      `対象: 直近14日の投稿 ${results.length}件${errors > 0 ? ` (${errors}件エラー)` : ''}`,
      ``,
      `*合計* — ${totalImpressions.toLocaleString()} impressions / ${totalLikes} likes / ${totalRetweets} RTs`,
      ``,
      `*Top 3:*`,
      topLines,
    ].join('\n');

    try {
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${slackToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: slackChannel, text: slackText }),
      });
    } catch (e: any) {
      console.error('Slack notification failed:', e.message);
    }
  }

  return NextResponse.json({
    ok: true,
    monitored: results.length,
    errors,
    summary: results.length > 0 ? {
      totalImpressions: results.reduce((s, r) => s + r.impressions, 0),
      totalLikes: results.reduce((s, r) => s + r.likes, 0),
    } : null,
  });
}
