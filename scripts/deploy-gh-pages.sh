#!/bin/bash

# Deploy to GitHub Pages using gh-pages branch
# This script: commits to main, switches to gh-pages, builds, commits, switches back

set -e  # Exit on any error

echo "🚀 Starting deployment to GitHub Pages..."

# Step 1: Ensure we're on main branch and commit all changes
echo "📝 Committing all changes to main branch..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    git add .
    git commit -m "Update before deployment - $(date)"
    echo "✅ Changes committed to main"
else
    echo "✅ No changes to commit in main"
fi

# Step 2: Push main branch to ensure it's up to date
echo "📤 Pushing main branch..."
git push origin main

# Step 3: Switch to gh-pages branch
echo "🔄 Switching to gh-pages branch..."
git checkout gh-pages

# Step 4: Build the project
echo "📦 Building project..."
if ! pnpm run build:prod; then
    echo "❌ Build failed. Switching back to main and exiting."
    git checkout main
    exit 1
fi

# Step 5: Run quality checks
echo "🔍 Running quality checks..."
if ! pnpm run check; then
    echo "❌ Quality checks failed. Switching back to main and exiting."
    git checkout main
    exit 1
fi

# Step 6: Check if dist/ directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ directory not found. Build failed. Switching back to main."
    git checkout main
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 7: Copy dist contents to root of gh-pages branch
echo "📁 Copying built assets to root of gh-pages branch..."
cp -r dist/* .

# Step 8: Ensure .nojekyll and CNAME files are present for GitHub Pages
echo "" > .nojekyll
echo "nick.karnik.io" > CNAME

# Step 9: Add and commit all changes to gh-pages
echo "💾 Committing built assets to gh-pages branch..."
git add .
if git diff --cached --quiet; then
    echo "✅ No changes to commit in gh-pages"
else
    git commit -m "Deploy to GitHub Pages - $(date)"
    echo "✅ Changes committed to gh-pages"
fi

# Step 10: Push gh-pages branch
echo "🚀 Pushing gh-pages branch..."
if ! git push origin gh-pages; then
    echo "❌ Push failed. Switching back to main."
    git checkout main
    exit 1
fi

# Step 11: Switch back to main branch
echo "🔄 Switching back to main branch..."
git checkout main

echo "✅ Deployment completed successfully!"
echo "🌐 Your site should be available at: https://nick.karnik.io"
echo "⏰ It may take 2-5 minutes for GitHub Pages to update."
echo "💡 If you see 404 errors, wait a few minutes and refresh."
echo "🔍 Check deployment status at: https://github.com/theoutlander/theoutlander.github.io/actions"
