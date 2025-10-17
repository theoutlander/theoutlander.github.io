#!/bin/bash

# Development script with environment variables
# Usage: ./scripts/dev.sh

# Set default environment variables for local development
export SITE_URL=${SITE_URL:-http://localhost:5173}
export NODE_ENV=${NODE_ENV:-development}

echo "🚀 Starting development server with:"
echo "   SITE_URL: $SITE_URL"
echo "   NODE_ENV: $NODE_ENV"
echo ""

# Run the development server
pnpm dev
