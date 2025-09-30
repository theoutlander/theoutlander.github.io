#!/bin/bash

# Improved deployment script with better error handling and logging
set -e

echo "🚀 Starting deployment to GitHub Pages..."

# Build the project
echo "📦 Building project..."
if ! pnpm run build:prod; then
    echo "❌ Build failed. Exiting deployment."
    exit 1
fi

# Run quality checks
echo "🔍 Running quality checks..."
if ! pnpm run check; then
    echo "❌ Quality checks failed. Exiting deployment."
    exit 1
fi

# Check if dist/ directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ directory not found. Build failed."
    exit 1
fi

echo "✅ Build completed successfully!"

# Create a temporary directory for gh-pages
TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"

# Copy dist/ contents to temp directory
cp -r dist/* "$TEMP_DIR/"

# Ensure .nojekyll and CNAME files are present for GitHub Pages
echo "" > "$TEMP_DIR/.nojekyll"
echo "nick.karnik.io" > "$TEMP_DIR/CNAME"

# Initialize git in temp directory
cd "$TEMP_DIR"
git init
git config user.name "Deploy Bot"
git config user.email "deploy@theoutlander.github.io"
git add .
git commit -m "Deploy to GitHub Pages - $(date)"

# Add the gh-pages remote
git remote add origin "https://github.com/theoutlander/theoutlander.github.io.git"

# Push to gh-pages branch
echo "🚀 Pushing to gh-pages branch..."
if ! git push -f origin HEAD:gh-pages; then
    echo "❌ Push failed. Check your GitHub credentials and permissions."
    exit 1
fi

# Clean up
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo "✅ Deployment completed successfully!"
echo "🌐 Your site should be available at: https://nick.karnik.io"
echo "⏰ It may take 2-5 minutes for GitHub Pages to update."
echo "💡 If you see 404 errors, wait a few minutes and refresh."
echo "🔍 Check deployment status at: https://github.com/theoutlander/theoutlander.github.io/actions"
