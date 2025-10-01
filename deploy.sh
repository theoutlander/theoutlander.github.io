#!/usr/bin/env bash
set -euo pipefail

# Usage: pnpm run deploy  (runs this script)
# This script ensures a clean gh-pages worktree, syncs ./dist into it,
# commits, and pushes to origin/gh-pages only.

# --- Safety: repo root check ---
if [ ! -d .git ]; then
  echo "❌ Run this from the repository root (where .git lives)." >&2
  exit 1
fi

# --- Ensure gh-pages branch exists (and track remote if present) ---
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  # Create local branch if missing, set upstream
  if ! git show-ref --verify --quiet refs/heads/gh-pages; then
    git fetch origin gh-pages:refs/heads/gh-pages
  fi
  git branch --set-upstream-to=origin/gh-pages gh-pages >/dev/null 2>&1 || true
else
  # No remote branch yet, ensure local exists
  git show-ref --verify --quiet refs/heads/gh-pages || git branch gh-pages
fi

# --- Clean up any stale worktree state ---
# If the directory exists but isn't a proper worktree, remove it.
if [ -d gh-pages ] && [ ! -f gh-pages/.git ]; then
  echo "🧹 Removing non-worktree gh-pages directory…"
  rm -rf gh-pages
fi

# Prune stale worktrees and, if necessary, nuke a stale registry entry.
# Sometimes Git keeps .git/worktrees/gh-pages even if the dir was deleted.
if git worktree list | grep -q " gh-pages \-> "; then
  : # looks healthy
else
  # If registry exists without a matching entry, prune it
  git worktree prune || true
fi

# If add still fails due to a stale registry, remove it forcefully.
fix_registry_if_needed() {
  echo "⚠️ Attempting to fix stale worktree registry for gh-pages…"
  rm -rf .git/worktrees/gh-pages || true
  git worktree prune || true
}

# --- Ensure the gh-pages worktree is present and on gh-pages branch ---
# Always remove and recreate the worktree to avoid branch conflicts
if [ -d gh-pages ]; then
  echo "🧹 Removing existing gh-pages worktree…"
  rm -rf gh-pages || true
  git worktree prune || true
fi

echo "📦 Creating gh-pages worktree…"
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  # Create worktree in detached HEAD state first
  if ! git worktree add gh-pages origin/gh-pages 2>/tmp/wt_err.txt; then
    fix_registry_if_needed
    git worktree add gh-pages origin/gh-pages
  fi
  # Switch to gh-pages branch in the worktree
  cd gh-pages
  if ! git checkout -b gh-pages origin/gh-pages 2>/tmp/wt_err.txt; then
    # Branch already exists, just switch to it
    git checkout gh-pages
  fi
  cd ..
else
  # No remote branch, create local branch
  if ! git worktree add -B gh-pages gh-pages gh-pages 2>/tmp/wt_err.txt; then
    fix_registry_if_needed
    git worktree add -B gh-pages gh-pages gh-pages
  fi
fi

# --- Build site ---
echo "🏗️ Building site…"
pnpm build:prod

# --- Sync dist into the worktree ---
echo "🔄 Syncing dist/ -> gh-pages/"
rsync -a --delete dist/ gh-pages/

# --- Commit and push from inside the worktree only ---
cd gh-pages

# Defensive: set upstream again
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git branch --set-upstream-to=origin/gh-pages gh-pages >/dev/null 2>&1 || true
fi

# Verify branch, or hard fail with guidance
branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" != "gh-pages" ]; then
  echo "❌ Worktree is on '$branch', expected 'gh-pages'." >&2
  echo "Run: git worktree remove -f gh-pages; rm -rf .git/worktrees/gh-pages; git worktree prune; then rerun deploy." >&2
  exit 2
fi

git add .
if git diff --cached --quiet; then
  echo "✅ Nothing to deploy."
else
  git commit -m "Deploy $(date +%Y-%m-%d:%H:%M)"
  git push origin gh-pages
  echo "🚀 Deployed to gh-pages"
fi
cd ..