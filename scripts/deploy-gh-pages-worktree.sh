#!/bin/bash

# Deploy to GitHub Pages using git worktree (prevents config drift)
# This script: builds locally, syncs to worktree, commits and pushes

set -e  # Exit on any error

echo "🚀 Starting deployment to GitHub Pages using worktree..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: Not on main branch (currently on $CURRENT_BRANCH)"
    echo "   This script works best when run from main branch"
fi

# Generate Panda CSS first
echo "🎨 Generating Panda CSS..."
if ! pnpm panda codegen && pnpm panda cssgen; then
    echo "❌ Panda CSS generation failed. Exiting deployment."
    exit 1
fi

# Build the project
echo "📦 Building project..."
if ! pnpm run build:prod; then
    echo "❌ Build failed. Exiting deployment."
    exit 1
fi

# Check if dist/ directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ directory not found. Build failed."
    exit 1
fi

echo "✅ Build completed successfully!"

# One-time setup: Create worktree if it doesn't exist
if [ ! -d "gh-pages" ]; then
    echo "🔧 Setting up git worktree for gh-pages..."
    git worktree add -B gh-pages ./gh-pages origin/gh-pages
    echo "✅ Worktree created successfully"
else
    echo "📁 Using existing worktree"
fi

# Sync dist/ contents to gh-pages worktree
echo "📁 Syncing built assets to gh-pages worktree..."
rsync -a --delete dist/ gh-pages/

# Ensure .nojekyll and CNAME files are present for GitHub Pages
echo "📝 Ensuring GitHub Pages configuration files..."
echo "" > gh-pages/.nojekyll
echo "nick.karnik.io" > gh-pages/CNAME

# Commit and push from gh-pages worktree
echo "💾 Committing and pushing changes..."
cd gh-pages

# Add all changes
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "✅ No changes to commit in gh-pages"
else
    git commit -m "Deploy to GitHub Pages - $(date)"
    echo "✅ Changes committed to gh-pages"
    
    # Push to origin
    echo "🚀 Pushing to gh-pages branch..."
    if ! git push origin gh-pages; then
        echo "❌ Push failed. Check your GitHub credentials and permissions."
        cd ..
        exit 1
    fi
    echo "✅ Successfully pushed to gh-pages branch"
fi

# Return to main directory
cd ..

echo "✅ Deployment completed successfully!"
echo "🌐 Your site should be available at: https://nick.karnik.io"
echo "⏰ It may take 2-5 minutes for GitHub Pages to update."
echo "💡 If you see 404 errors, wait a few minutes and refresh."
echo "🔍 Check deployment status at: https://github.com/theoutlander/theoutlander.github.io/actions"
echo ""
echo "💡 To clean up the worktree later, run: git worktree remove gh-pages"
