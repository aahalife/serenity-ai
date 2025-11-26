#!/bin/bash

# AI Multi-Agent Well-Being System - Development Start Script
# Usage: ./scripts/start_dev.sh [anthropic_api_key]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AI Multi-Agent Well-Being System - Development Setup    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for API key
if [ -n "$1" ]; then
    export ANTHROPIC_API_KEY="$1"
elif [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${RED}Error: ANTHROPIC_API_KEY not set${NC}"
    echo "Usage: ./scripts/start_dev.sh YOUR_ANTHROPIC_API_KEY"
    echo "   or: export ANTHROPIC_API_KEY=your-key && ./scripts/start_dev.sh"
    exit 1
fi

echo -e "${GREEN}✓${NC} API Key configured"

# Kill any existing processes
echo -e "${YELLOW}Stopping existing processes...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend
echo -e "${YELLOW}Starting backend...${NC}"
cd "$PROJECT_ROOT/backend"
python3 simple_main.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 5

# Check backend health
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} Backend running on http://localhost:8000 (PID: $BACKEND_PID)"
else
    echo -e "${RED}✗${NC} Backend failed to start. Check /tmp/backend.log"
    exit 1
fi

# Start frontend
echo -e "${YELLOW}Starting frontend...${NC}"
cd "$PROJECT_ROOT/frontend"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 10

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"
else
    echo -e "${RED}✗${NC} Frontend failed to start. Check /tmp/frontend.log"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    System Ready!                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:3000"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:8000"
echo -e "  ${BLUE}API Docs:${NC}  http://localhost:8000/docs"
echo ""
echo -e "  ${YELLOW}Logs:${NC}"
echo -e "    Backend:  tail -f /tmp/backend.log"
echo -e "    Frontend: tail -f /tmp/frontend.log"
echo ""
echo -e "  ${YELLOW}Stop:${NC}"
echo -e "    kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop watching logs...${NC}"
echo ""

# Tail logs
tail -f /tmp/backend.log /tmp/frontend.log

