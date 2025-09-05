#!/bin/bash

# Kill any existing process on port 4000
echo "🧹 Killing existing processes on port 4000..."
lsof -ti :4000 | xargs kill -9 2>/dev/null || true
pkill -f "tsx watch" 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

echo "🚀 Starting backend server..."
npm run dev
