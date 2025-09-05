#!/bin/bash

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

echo "🚀 Starting backend server..."
cd /Users/arjunarora/ratemyschedule/server && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

echo "🌐 Starting frontend server..."
cd /Users/arjunarora/ratemyschedule && npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers starting..."
echo "📊 Backend: http://localhost:4000"
echo "🌐 Frontend: will be on http://localhost:808X (check terminal)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID
