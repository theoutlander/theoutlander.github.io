#!/bin/bash

# Start serve in background and capture the PID
npx serve dist -l 3000 > /tmp/serve.log 2>&1 &
SERVE_PID=$!

# Wait for serve to start
sleep 3

# Extract the actual port from the serve output
PORT=$(grep -o 'http://localhost:[0-9]*' /tmp/serve.log | head -1 | sed 's/http:\/\/localhost://')

if [ -z "$PORT" ]; then
    echo "Error: Could not determine port from serve output"
    cat /tmp/serve.log
    kill $SERVE_PID 2>/dev/null
    exit 1
fi

echo "Testing links on http://localhost:$PORT"

# Run linkinator with the actual port
npx linkinator http://localhost:$PORT --recurse --skip 'linkedin.com'

# Capture the exit code
EXIT_CODE=$?

# Clean up
kill $SERVE_PID 2>/dev/null
rm -f /tmp/serve.log

exit $EXIT_CODE
