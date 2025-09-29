#!/bin/bash

# Deploy to GitHub Pages using gh-pages branch
# This script builds locally and pushes only the dist/ folder to gh-pages branch

set -e  # Exit on any error

echo "🚀 Starting deployment to GitHub Pages..."

# Build the project
echo "📦 Building project..."
pnpm run build:prod

# Run quality checks
echo "🔍 Running quality checks..."
pnpm run check

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

# Initialize git in temp directory
cd "$TEMP_DIR"
git init
git add .
git commit -m "Deploy to GitHub Pages - $(date)"

# Add the gh-pages remote (this will be the same repo)
git remote add origin "https://github.com/theoutlander/theoutlander.github.io.git"

# Force push to gh-pages branch
echo "🚀 Pushing to gh-pages branch..."
git push -f origin HEAD:gh-pages

# Clean up
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo "✅ Deployment completed successfully!"
echo "🌐 Your site should be available at: https://nick.karnik.io"
echo "⏰ It may take a few minutes for GitHub Pages to update."
