import { TwitterApi } from 'twitter-api-v2';
import { GoogleGenAI } from "@google/genai";
import { WebClient } from '@slack/web-api';
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// -------------------------------------------------------------
// 初期化・環境変数読み込み
// -------------------------------------------------------------
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

const {
  TWITTER_API_KEY,
  TWITTER_API_SECRET,
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_SECRET,
  GEMINI_API_KEY,
  SLACK_BOT_TOKEN
} = process.env;

const TARGET_CHANNEL = 'skin-atelier_jp';

if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
  console.error("❌ エラー: X API (Twitter) の各種アクセスキーが .env.local に設定されていません。");
  process.exit(1);
}

if (!GEMINI_API_KEY || !SLACK_BOT_TOKEN) {
  console.error("❌ エラー: GEMINI_API_KEY または SLACK_BOT_TOKEN が設定されていません。");
  process.exit(1);
}

const twitterClient = new TwitterApi({
  appKey: TWITTER_API_KEY,
  appSecret: TWITTER_API_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_SECRET,
});

// v2 API クライアント
const xClient = twitterClient.v2;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const slackClient = new WebClient(SLACK_BOT_TOKEN);

// -------------------------------------------------------------
// 設定値 (検索クエリなど)
// -------------------------------------------------------------
// キーワードを日替わりランダムで切り替え、毎日同じ人の投稿にヒットするのを防ぎます
const KEYWORD_GROUPS = [
  '("肌管理" OR "美容皮膚科" OR "スキンケア迷子")',
  '("ポテンツァ" OR "ダーマペン" OR "ダウンタイム")',
  '("ジュベルック" OR "水光注射" OR "美容医療")',
  '("肝斑" OR "シミ取り" OR "ピコトーニング")',
  '("乾燥肌" OR "ゆらぎ肌" OR "肌荒れ やばい")',
  '("美容クリニック" OR "肌質改善" OR "ピーリング")'
];
const randomGroup = KEYWORD_GROUPS[Math.floor(Math.random() * KEYWORD_GROUPS.length)];
const SEARCH_QUERY = `${randomGroup} -is:retweet -has:links lang:ja`;
const MAX_RESULTS = 100; // 有望な5件を抽出するため、一次取得の母数を100件に拡大

// 履歴ファイルのパス（二度同じ人に送らないためのDB）
const HISTORY_FILE = path.join(process.cwd(), "x-patrol-history.json");

function loadHistory(): string[] {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
    }
  } catch (e) { console.error("History load error", e); }
  return [];
}

function saveHistory(authorIds: string[]) {
  try {
    const existing = loadHistory();
    const merged = Array.from(new Set([...existing, ...authorIds]));
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(merged), "utf-8");
  } catch (e) { console.error("History save error", e); }
}

/**
 * 1. X APIを使ってツイートを検索収集
 */
async function fetchTargetTweets() {
  console.log(`🔍 X APIで本日のテーマ「${randomGroup}」を検索中...`);
  const history = loadHistory();
  
  try {
    // 過去24時間以内の投稿だけに絞る（昨日の投稿と重複しないように）
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const searchResponse = await xClient.search(SEARCH_QUERY, {
      max_results: MAX_RESULTS,
      start_time: startTime,
      "tweet.fields": ["created_at", "public_metrics", "author_id"],
      "user.fields": ["username", "name"]
    });

    const fetchedTweets = searchResponse.tweets || [];
    const tweets: any[] = [];
    
    for (const tweet of fetchedTweets) {
      if (tweet.text.length < 20) continue; // 短すぎるつぶやきは除外
      if (history.includes(tweet.author_id!)) continue; // 過去に抽出したことのある人は「bot対策」として無条件で除外
      
      tweets.push({
        id: tweet.id,
        author_id: tweet.author_id,
        text: tweet.text,
        metrics: tweet.public_metrics,
        url: `https://x.com/i/web/status/${tweet.id}`
      });
    }
    
    console.log(`✅ ${tweets.length}件 の新規ツイート（過去24時間＆未接触ユーザー）を収集しました。`);
    return tweets;
  } catch (error) {
    console.error("❌ X API 検索エラー (Basicプラン未契約の可能性があります):", error);
    return [];
  }
}

/**
 * 2. Gemini APIでツイートを評価・フィルタリングし、下書きを作成
 */
async function evaluateTweetsWithAI(tweets: any[]) {
  console.log(`🤖 Gemini APIで優良ポストの選別と提案文を作成中...`);
  
  const systemPrompt = `
    あなたは美容皮膚科医 Dr.みやかの「選別秘書」です。
    X上のポストから、先生がリアクション（引用RP）すべき投稿を厳選し、「一瞬で読めて、心がふっと軽くなる」短文の返信案を作成してください。
    
    【絶対に除外するポスト（無視してください）】
    1. アフィリエイト、クリニックの宣伝、BOT、同業者の発信
    2. 単なる「愚痴・世の中への不満・ネガティブすぎる感情の吐け口」になっているポスト
    
    【抽出の絶対条件】
    「純粋に肌のことで悩んでおり、専門医からの前向きなアドバイスや安心材料を求めている（受け入れられる状態の）人」のみを抽出してください。

    【1. 返信（引用RP）の鉄則】
    - 文字数制限: 40文字〜80文字以内を厳守（スマホで2〜3行に見える長さ）。
    - 「教える」より「共感」: 詳しい解説はブログ等の役割です。リプライでは「あなたの悩みが見えていますよ」という合図を送ることに徹してください。
    - 定型文・敬語の使いすぎ禁止: 「突然の失礼を〜」「〜をご存知でしょうか」「初めまして」といった硬い表現は絶対に避け、「〜ですよね😭」「〜かもしれません✨」といった、親しみやすい「現場の先生の独り言」のような口調にしてください。

    【2. 返信案の構成イメージ】
    - 一言の共感: 「その不安、よく分かります😭」「もどかしいですよね…」
    - 一言の光: 「実は〇〇で解決できることも多いですよ」「無理せず、今は守りのケアを✨」
    - 結び: 「応援しています」「少しでも楽になりますように」

    💡 返信案のビフォーアフター（手本）
    140文字（NG例：長すぎて業者っぽい）
    「初めまして、美容皮膚科医の佐藤みやかです。レチノールのA反応で皮剥けが続くと不安になりますよね。実は今の時期は花粉の影響もありバリア機能が低下しがちなんです。一度濃度を下げるか回数を減らして、保湿を徹底するのがお勧めですよ。納得できないまま続けず、お肌を休ませてくださいね。応援しています！」
    → 読まれません。

    60文字（OK案：スマートでプロっぽい）
    「皮剥けが続くと不安になりますよね😭 今は花粉の影響もあるので、あえて濃度を落として『守り』のケアを厚くするのが近道かもしれません。無理せず、お肌を休ませてあげてくださいね。✨」
    → これなら「先生、ありがとう！」と返信が来やすくなります。

    【出力指示（先生への通知内容）】
    選別したツイートに対し、最も良質なものを【最大5件まで】厳選して以下のJSONデータを生成してください。

    [
      {
        "tweetId": "元のツイートID",
        "summary": "ユーザーの悩み要約（例：ポテンツァの赤みが引かない）",
        "draftReply": "返信案（80文字以内）"
      }
    ]

    ※該当するツイートが1件もない場合は、空の配列 [] を返してください。
    ※JSONフォーマットのみを出力し、マークダウンの \`\`\`json などの修飾は除外してください。

    【入力ツイートデータ】
    ${JSON.stringify(tweets.map((t: any) => ({ id: t.id, text: t.text })), null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: systemPrompt,
    });

    let rawText = response.text || "[]";
    // マークダウンタグの除去
    rawText = rawText.replace(/^```json\n/gm, "").replace(/^```\n/gm, "").replace(/```$/gm, "").trim();

    const evaluations = JSON.parse(rawText);
    return evaluations;
  } catch (error) {
    console.error("❌ Gemini API 評価エラー:", error);
    return [];
  }
}

/**
 * 3. Slackへ提案（通知）
 */
async function sendProposalToSlack(tweetDetails: any, evaluation: any) {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `🔍 [AI パトロール] 見込み客の発見`,
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `👤 *対象のポスト:*\n> ${tweetDetails.text.replace(/\n/g, '\n> ')}`
      },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "📱 Xを開く (いいね/RP)", emoji: true },
        url: tweetDetails.url,
        action_id: `open_tweet_${tweetDetails.id}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `💡 *ユーザーの悩み要約:*\n${evaluation.summary}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `📝 *リプライ 下書き案:*\n\`\`\`\n${evaluation.draftReply}\n\`\`\``
      }
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: 'plain_text', text: '✨ この案でリプライする (Xアプリ起動)', emoji: true },
          style: 'primary',
          url: `https://x.com/intent/tweet?in_reply_to=${tweetDetails.id}&text=${encodeURIComponent(evaluation.draftReply)}`.substring(0, 3000),
          action_id: `intent_reply_${tweetDetails.id}`
        }
      ]
    },
    { type: "divider" }
  ];

  try {
    await slackClient.chat.postMessage({
      channel: TARGET_CHANNEL,
      text: `🔍 見込み客のポストを発見しました（ID: ${tweetDetails.id}）`,
      blocks,
    });
    console.log(`✅ Slackに提案を通知しました（Tweet ID: ${tweetDetails.id}）`);
  } catch (error) {
    console.error(`❌ Slack通知エラー:`, error);
  }
}

/**
 * メイン実行関数
 */
async function main() {
  console.log("=== 🚀 X (Twitter) プロスペクティング AIパトロール開始 ===");
  
  // 1. ツイート取得
  const tweets = await fetchTargetTweets();
  if (tweets.length === 0) {
    console.log("ℹ️ 対象となるツイートが見つかりませんでした。終了します。");
    return;
  }

  // 2. Geminiでフィルタリング・下書き作成
  const evaluations = await evaluateTweetsWithAI(tweets);
  if (!Array.isArray(evaluations) || evaluations.length === 0) {
    console.log("ℹ️ 優良な見込み患者のツイートはありませんでした（すべてフィルタリングされました）。");
    return;
  }

  console.log(`🎯 ${evaluations.length} 件の【優良ターゲットポスト】が抽出されました。Slackへ通知します...`);

  const proposedAuthorIds: string[] = [];

  // 3. Slackへ通知
  for (const evalItem of evaluations) {
    const tweetDetails = tweets.find(t => t.id === evalItem.tweetId);
    if (tweetDetails) {
      await sendProposalToSlack(tweetDetails, evalItem);
      proposedAuthorIds.push(tweetDetails.author_id);
      // 通知制限に配慮するため少しWait
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // 今回提案した人たちを「アプローチ済み」として記録する
  if (proposedAuthorIds.length > 0) {
    saveHistory(proposedAuthorIds);
    console.log(`📝 ${proposedAuthorIds.length} 名のユーザーIDをブロックリストに保存しました。`);
  }

  console.log("\n🎉 AIパトロールがすべて完了しました！");
}

main();
