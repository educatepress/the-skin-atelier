#!/bin/bash
# ================================================================
#  daily-auto-blog.sh — The Skin Atelier Daily Blog Pipeline
#
#  Called by macOS launchd every day at 09:00 JST.
#  1. Runs auto-post-blog.ts (research → generate → review → Slack approval)
#  2. Logs output to scripts/logs/
#
#  Project: hiroo-open/the-skin-atelier
#  Repo:    educatepress/the-skin-atelier
# ================================================================

set -euo pipefail

# ── Config ──
PROJECT_DIR="$HOME/Desktop/hiroo-open/the-skin-atelier"
LOG_DIR="$PROJECT_DIR/scripts/logs"
TODAY=$(date +%Y-%m-%d)
LOG_FILE="$LOG_DIR/daily-blog-$TODAY.log"

# Ensure log directory
mkdir -p "$LOG_DIR"

# Navigate to project
cd "$PROJECT_DIR"

# ── Load Node.js (nvm / Homebrew) ──
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"

echo "════════════════════════════════════════" >> "$LOG_FILE"
echo "📝 The Skin Atelier — Daily Blog — $TODAY $(date +%H:%M:%S)" >> "$LOG_FILE"
echo "════════════════════════════════════════" >> "$LOG_FILE"

# ── Step 1: Generate Blog + X Post + Slack Approval ──
echo "" >> "$LOG_FILE"
echo "🚀 Step 1: auto-post-blog.ts を実行中..." >> "$LOG_FILE"

if npx tsx scripts/auto-post-blog.ts >> "$LOG_FILE" 2>&1; then
    echo "" >> "$LOG_FILE"
    echo "✅ ブログ自動生成パイプライン完了" >> "$LOG_FILE"
else
    echo "" >> "$LOG_FILE"
    echo "⚠️ ブログ自動生成でエラーが発生しました（詳細は上記ログ参照）" >> "$LOG_FILE"
fi

echo "完了: $(date +%H:%M:%S)" >> "$LOG_FILE"

# ── macOS notification ──
osascript -e "display notification \"Skin Atelier ブログ生成が完了しました\" with title \"Skin Atelier Blog\" subtitle \"$TODAY\"" 2>/dev/null || true
