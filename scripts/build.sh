#!/bin/bash

# Production build script with environment variables
# Usage: ./scripts/build.sh

# Set default environment variables for production
export HASHNODE_HOST=${HASHNODE_HOST:-theoutlander.hashnode.dev}
export SITE_URL=${SITE_URL:-https://nick.karnik.io}
export NODE_ENV=${NODE_ENV:-production}

echo "🏗️  Building for production with:"
echo "   HASHNODE_HOST: $HASHNODE_HOST"
echo "   SITE_URL: $SITE_URL"
echo "   NODE_ENV: $NODE_ENV"
echo ""

# Run the production build
pnpm build:prod

echo ""
echo "✅ Build complete! Files are in the dist/ directory"
