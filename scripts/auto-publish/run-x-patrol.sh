#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
export PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH

echo "=================================================="
echo "🚀 実行開始: $(date)"
echo "=================================================="

# Skin Atelier プロジェクトディレクトリへ移動
cd /Users/satoutakuma/Desktop/hiroo-open/the-skin-atelier

# X (Twitter) 見込み客パトロールスクリプトの実行
npx tsx scripts/auto-publish/x-prospecting-patrol.ts

echo "=================================================="
echo "🏁 実行完了: $(date)"
echo "=================================================="
