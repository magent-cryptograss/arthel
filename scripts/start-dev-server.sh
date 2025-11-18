#!/bin/bash
# Auto-start dev server in tmux session on container startup

SESSION_NAME="dev-server"
WORKSPACE_DIR="/home/magent/workspace/arthel"
LOG_FILE="$WORKSPACE_DIR/dev-server.log"

# Check if session already exists
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo "✓ Dev server session '$SESSION_NAME' already running"
    exit 0
fi

# Create new detached tmux session and start dev server
cd "$WORKSPACE_DIR" || exit 1

echo "🚀 Starting dev server in tmux session '$SESSION_NAME' on port 4000..."

# Start dev server with logging
tmux new-session -d -s "$SESSION_NAME" -c "$WORKSPACE_DIR" \
    "SKIP_CHAIN_DATA=true NODE_ENV=development PORT=4000 webpack serve --config src/build_logic/webpack.justinholmes.dev.js 2>&1 | tee $LOG_FILE"

echo "✓ Dev server started in background on port 4000"
echo "  Attach with: tmux attach -t $SESSION_NAME"
echo "  View logs: tail -f $LOG_FILE"
echo "  Restart with: npm run restart-server"
