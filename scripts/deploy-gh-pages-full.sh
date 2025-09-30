#!/bin/bash

# Deploy by checking in full codebase to gh-pages branch
set -e

echo "🚀 Starting full codebase deployment to GitHub Pages..."

# Build the project
echo "📦 Building project..."
if ! pnpm run build:prod; then
    echo "❌ Build failed. Exiting deployment."
    exit 1
fi


echo "✅ Build completed successfully!"

# Switch to gh-pages branch
echo "🔄 Switching to gh-pages branch..."
git checkout gh-pages

# Copy dist contents to root of gh-pages branch
echo "📁 Copying built assets to root..."
cp -r dist/* .

# Ensure .nojekyll and CNAME files are present
echo "" > .nojekyll
echo "nick.karnik.io" > CNAME

# Add and commit all changes
echo "💾 Committing changes..."
git add .
git commit -m "Deploy to GitHub Pages - $(date)" || echo "No changes to commit"

# Push to gh-pages branch
echo "🚀 Pushing to gh-pages branch..."
if ! git push origin gh-pages; then
    echo "❌ Push failed. Check your GitHub credentials and permissions."
    exit 1
fi

# Switch back to main branch
git checkout main

echo "✅ Deployment completed successfully!"
echo "🌐 Your site should be available at: https://nick.karnik.io"
echo "⏰ It may take 2-5 minutes for GitHub Pages to update."
echo "💡 If you see 404 errors, wait a few minutes and refresh."
echo "🔍 Check deployment status at: https://github.com/theoutlander/theoutlander.github.io/actions"
