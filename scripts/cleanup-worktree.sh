#!/bin/bash

# Cleanup script to remove git worktree
set -e

echo "🧹 Cleaning up git worktree..."

if [ -d "gh-pages" ]; then
    echo "📁 Removing gh-pages worktree..."
    git worktree remove gh-pages
    echo "✅ Worktree removed successfully"
else
    echo "ℹ️  No gh-pages worktree found to remove"
fi

echo "✅ Cleanup completed!"
