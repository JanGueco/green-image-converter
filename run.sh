#!/usr/bin/env bash
set -e

# Project root = directory containing this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "GreenConvert — checking requirements..."

# Node.js 18+
if ! command -v node &>/dev/null; then
  echo "Error: Node.js is not installed or not on PATH."
  echo "Install from https://nodejs.org/ or use nvm."
  exit 1
fi
NODE_VER=$(node -p "process.versions.node" 2>/dev/null | cut -d. -f1)
if [ -z "$NODE_VER" ] || [ "$NODE_VER" -lt 18 ] 2>/dev/null; then
  echo "Error: Node.js 18+ is required (found: $(node --version 2>/dev/null))."
  echo "Install from https://nodejs.org/ or use nvm."
  exit 1
fi

# npm
if ! command -v npm &>/dev/null; then
  echo "Error: npm is not installed or not on PATH (usually bundled with Node.js)."
  exit 1
fi

# Python 3.10+
if ! command -v python3 &>/dev/null; then
  echo "Error: Python 3 is not installed or not on PATH."
  echo "Install from https://www.python.org/ (macOS: brew install python@3.11)."
  exit 1
fi
PY_VER=$(python3 -c "import sys; print(sys.version_info.major, sys.version_info.minor)" 2>/dev/null)
PY_MAJOR=$(echo "$PY_VER" | cut -d' ' -f1)
PY_MINOR=$(echo "$PY_VER" | cut -d' ' -f2)
if [ -z "$PY_MAJOR" ] || [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 10 ]; } 2>/dev/null; then
  echo "Error: Python 3.10+ is required (found: $(python3 --version 2>/dev/null))."
  echo "Install from https://www.python.org/."
  exit 1
fi

# pip
if ! python3 -m pip --version &>/dev/null; then
  echo "Error: pip is not available. Run: python3 -m ensurepip --upgrade"
  exit 1
fi

# ffmpeg
if ! command -v ffmpeg &>/dev/null; then
  echo "Error: ffmpeg is not installed or not on PATH."
  echo "macOS: brew install ffmpeg"
  echo "Linux: apt install ffmpeg / dnf install ffmpeg (or equivalent)."
  exit 1
fi

echo "Installing backend dependencies..."
python3 -m pip install -q -r backend/requirements.txt

echo "Installing frontend dependencies..."
(cd frontend && npm install --silent)

echo ""
echo "Backend: http://localhost:8000  |  Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop (frontend and backend will both stop)."
echo ""

# Start backend in background (from backend dir)
(cd backend && python3 -m uvicorn main:app --reload --port 8000) &
BACKEND_PID=$!
trap "kill $BACKEND_PID 2>/dev/null; exit" INT TERM

# Give backend a moment to bind
sleep 2

# Start frontend in foreground
cd frontend && exec npm run dev
