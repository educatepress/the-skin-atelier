# 今のタスク

フォロワー増加戦略の実装がひと段落。X + ブログの品質改善と自動化の安定化フェーズ。

# アクティブチャネル

- **X (Twitter):** 稼働中（バイラル単発 3回/日 + ブログ連動スレッド 1回/日）
- **ブログ:** 稼働中（1記事/日）
- **Instagram:** 一時停止中（リール・カルーセルともにストップ。再開時は IG ハッシュタグ 5-6 個の自動付与を実装予定）

# 直近の変更

- `src/app/api/cron/daily-publisher/route.ts` — `.find()` → `.filter()` で同日同タイプ全件処理に修正
- `scripts/auto-publish/x-variety-single.ts` — hashtag-strategy.md を埋め込み、ハッシュタグ 3-5 個自動付与
- `scripts/auto-publish/generate-x-post.ts` — ハッシュタグ自動付与 + 120文字/ツイート制限 + エビデンス引用ルール + 文体バリエーション5パターン追加
- `scripts/auto-publish/x-prospecting-patrol.ts` — 自動リプライ(403エラー)をやめてSlack提案モードに変更。ワンタップ返信ボタン(X intent URL)付き
- `scripts/plan-10day-themes.ts` — ThemeArea ①→②→③→④→⑤ ローテーション指示追加。隣接日の類似テーマ禁止
- `.github/workflows/site-patrol.yml` — 自動実行を停止（画像エラー警告がノイズのため）
- CLAUDE.md / CONTEXT.md / ISSUES.md / LESSONS.md / REVIEW.md — プロジェクトドキュメント一式を整備
- 新しい10日分テーマ（4/28〜5/7）を ThemeSchedule に生成済み

# 試したけどダメだったこと

- x-patrol の自動リプライ — Twitter Free Tier で 403 エラー（権限不足）。Slack提案モードに切り替え

# 次にやること

1. post-patrol の実装強化 — 投稿後エンゲージメント率の自動計測と低パフォーマンスパターン検出
2. x-monitor のデータを次回テーマ選定にフィードバックする仕組み
3. (IG 再開時) daily-publisher で IG キャプションにハッシュタグ 5-6 個を自動付与

# 未解決の疑問・迷い

- Twitter Free Tier のリプライ制限は恒久的か？Basic プラン（月$100）に上げる価値はあるか？
- x-patrol の Gemini タイムアウト（ECONNRESET）が散発 — retry 追加で対応すべきか？

# 最終更新

2026-05-01
