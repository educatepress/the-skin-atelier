#!/bin/bash
# ================================================================
#  daily-blog.sh — Daily Automated Blog Generation Pipeline
#
#  Called by macOS launchd (or manually).
#  Runs auto-post-blog.ts to generate 1 new blog post per day,
#  complete with Pexels image and Slack approval notification.
#
#  Logs output to docs/logs/daily-blog-YYYY-MM-DD.log
# ================================================================

set -euo pipefail

# ── Config ──
PROJECT_DIR="$HOME/Desktop/hiroo-open/the-skin-atelier"
LOG_DIR="$PROJECT_DIR/docs/logs"
TODAY=$(date +%Y-%m-%d)
LOG_FILE="$LOG_DIR/daily-blog-$TODAY.log"

# Ensure log directory
mkdir -p "$LOG_DIR"

# Navigate to project
cd "$PROJECT_DIR"

# ── Load Node.js (Homebrew) ──
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "════════════════════════════════════════" >> "$LOG_FILE"
echo "📝 Daily Blog Generation — $TODAY $(date +%H:%M:%S)" >> "$LOG_FILE"
echo "════════════════════════════════════════" >> "$LOG_FILE"

# ── Run Blog Generation ──
npx tsx scripts/auto-post-blog.ts >> "$LOG_FILE" 2>&1

echo "" >> "$LOG_FILE"
echo "✅ 完了: $(date +%H:%M:%S)" >> "$LOG_FILE"

# ── Optional: macOS notification ──
osascript -e "display notification \"新しいブログ記事がSlackに送信されました\" with title \"The Skin Atelier\" subtitle \"Daily Blog Complete\"" 2>/dev/null || true
