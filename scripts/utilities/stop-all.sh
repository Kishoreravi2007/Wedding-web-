#!/bin/bash

# Wedding Website - Stop All Services

echo "🛑 Stopping Wedding Website Services..."

# Kill backend
pkill -f "node server.js" && echo "  ✅ Backend stopped" || echo "  ℹ️  No backend process found"

# Kill frontend  
pkill -f "vite" && echo "  ✅ Frontend stopped" || echo "  ℹ️  No frontend process found"

sleep 1

echo ""
echo "✅ All services stopped!"
echo ""
echo "To start again, run: ./start-all.sh"

