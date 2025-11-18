#!/usr/bin/env node

/**
 * Restart dev server by joining tmux session, stopping it, and starting fresh
 */

import { execSync } from 'child_process';
import { resolve } from 'path';

const SESSION_NAME = 'dev-server';
const LOG_FILE = resolve('dev-server.log');

console.log('🔄 Restarting dev server...');

try {
    // Check if session exists
    execSync(`tmux has-session -t ${SESSION_NAME} 2>/dev/null`);

    // Send Ctrl-C to stop the server
    console.log('🛑 Stopping current server...');
    execSync(`tmux send-keys -t ${SESSION_NAME} C-c`);

    // Wait a moment for cleanup
    execSync('sleep 1');

    // Send command to restart (up arrow to get last command, then enter)
    console.log('🚀 Starting server...');
    execSync(`tmux send-keys -t ${SESSION_NAME} Up Enter`);

    console.log('✅ Server restarted');
    console.log(`  Attach with: tmux attach -t ${SESSION_NAME}`);
    console.log(`  View logs: tail -f ${LOG_FILE}`);

} catch (error) {
    console.error('❌ No dev server session found');
    console.error('   Start one with: npm run dev:jh:signals');
    process.exit(1);
}
