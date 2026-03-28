import { TwitterApi } from 'twitter-api-v2';
import { GoogleGenAI } from "@google/genai";
import { WebClient } from '@slack/web-api';
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
// -is:retweet でリツイートを除外
// -has:links でアフィリエイトなどのリンク付き業者ツイートをある程度除外（オプション）
const SEARCH_QUERY = '("肌管理" OR "ポテンツァ" OR "ダウンタイム" OR "ジュベルック" OR "肝斑") -is:retweet -has:links lang:ja';
const MAX_RESULTS = 20; // X API Basicプランの制限に配慮し少なめに（10〜100）

/**
 * 1. X APIを使ってツイートを検索収集
 */
async function fetchTargetTweets() {
  console.log(`🔍 X APIで「${SEARCH_QUERY}」を検索中...`);
  try {
    const searchResponse = await xClient.search(SEARCH_QUERY, {
      max_results: MAX_RESULTS,
      "tweet.fields": ["created_at", "public_metrics", "author_id"],
      "user.fields": ["username", "name"]
    });

    // searchResponse.tweets を見ると、1ページ目のみ（最大 MAX_RESULTS 件）を配列として取得可能
    const fetchedTweets = searchResponse.tweets || [];
    const tweets: any[] = [];
    
    for (const tweet of fetchedTweets) {
      if (tweet.text.length < 20) continue; // 短すぎるつぶやきは除外
      tweets.push({
        id: tweet.id,
        text: tweet.text,
        metrics: tweet.public_metrics,
        url: `https://x.com/i/web/status/${tweet.id}`
      });
    }
    
    console.log(`✅ ${tweets.length}件 のツイートを収集しました。`);
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
    提供される複数のX上のポストから、先生がリアクション（引用RP）すべき「悩める潜在患者」を厳選して抽出してください。
    
    【絶対に除外するポスト（無視してください）】
    1. アフィリエイト、クリニックの宣伝、BOT、同業者の発信
    2. 単なる「愚痴・世の中への不満・ネガティブすぎる感情の吐け口」になっているポスト
    
    【抽出の絶対条件】
    「純粋に肌のことで悩んでおり、専門医からの前向きなアドバイスや安心材料を求めている（受け入れられる状態の）人」のみを抽出してください。

    【出力指示（先生への通知内容）】
    選別したツイートに対し、以下のJSONデータを生成してください。

    [
      {
        "tweetId": "元のツイートID",
        "reason": "反応すべき理由（先生のどの専門性が活かせるか）",
        "draftReply": "引用RPの下書き（案）"
      }
    ]

    【引用RPの下書き（案）作成ルール】
    - 冒頭：相手の不安への共感（大変ですよね😭）
    - 中盤：専門医としての「安心材料」や「見極めポイント」を1行。
    - 結び：「納得できないままベッドに横にならないで」という、患者を思う一言。
    ※下書きには架空の施設名や「アトリエ」を出さず、一貫して「診察室での経験」や「医師としての視点」で構成すること。

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
        text: `💡 *AIの提案理由:*\n${evaluation.reason}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `📝 *引用RP 下書き案:*\n\`\`\`\n${evaluation.draftReply}\n\`\`\``
      }
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

  // 3. Slackへ通知
  for (const evalItem of evaluations) {
    const tweetDetails = tweets.find(t => t.id === evalItem.tweetId);
    if (tweetDetails) {
      await sendProposalToSlack(tweetDetails, evalItem);
      // 通知制限に配慮するため少しWait
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log("\n🎉 AIパトロールがすべて完了しました！");
}

main();
