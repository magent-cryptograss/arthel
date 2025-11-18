#!/bin/bash
# Helper script for magent to restart the dev server and trigger full rebuild
# This triggers the signal-based restart mechanism

npm run restart-server
echo ""
echo "✅ Restart signal sent. Server will rebuild templates and restart webpack."
echo "   Wait ~5 seconds for the rebuild to complete."
