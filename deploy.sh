#!/usr/bin/env bash
set -e

# 1. Ensure gh-pages worktree exists
if [ ! -d "./gh-pages/.git" ]; then
  echo "📦 Setting up gh-pages worktree..."
  git fetch origin gh-pages || true
  git worktree prune
  rm -rf ./gh-pages
  git worktree add ./gh-pages gh-pages
fi

# 2. Build site
echo "🏗️ Building site..."
pnpm build

# 3. Sync dist -> gh-pages
echo "🔄 Syncing dist/ -> gh-pages/"
rsync -a --delete dist/ ./gh-pages/

# 4. Commit + push
cd ./gh-pages
git add .
if git diff --cached --quiet; then
  echo "✅ Nothing to deploy."
else
  git commit -m "Deploy $(date +%Y-%m-%d:%H:%M)"
  git push origin gh-pages
  echo "🚀 Deployed to gh-pages"
fi
cd ..
