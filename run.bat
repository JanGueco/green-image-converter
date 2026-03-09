@echo off
setlocal
cd /d "%~dp0"

echo GreenConvert — checking requirements...

where node >nul 2>&1
if errorlevel 1 (
  echo Error: Node.js is not installed or not on PATH.
  echo Install from https://nodejs.org/ or use nvm. Ensure "Add to PATH" is checked.
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo Error: npm is not found. It is usually bundled with Node.js.
  exit /b 1
)

where python >nul 2>&1
if errorlevel 1 (
  echo Error: Python is not installed or not on PATH.
  echo Install from https://www.python.org/ and check "Add Python to PATH".
  exit /b 1
)

python -m pip --version >nul 2>&1
if errorlevel 1 (
  echo Error: pip is not available. Run: python -m ensurepip --upgrade
  exit /b 1
)

where ffmpeg >nul 2>&1
if errorlevel 1 (
  echo Error: ffmpeg is not installed or not on PATH.
  echo Install from https://ffmpeg.org/ or run: winget install ffmpeg
  echo See WINDOWS.md for detailed setup.
  exit /b 1
)

echo Installing backend dependencies...
python -m pip install -q -r backend\requirements.txt
if errorlevel 1 (
  echo Failed to install backend dependencies.
  exit /b 1
)

echo Installing frontend dependencies...
cd frontend
call npm install --silent
if errorlevel 1 (
  echo Failed to install frontend dependencies.
  exit /b 1
)
cd ..

echo.
echo Backend: http://localhost:8000  ^|  Frontend: http://localhost:5173
echo Press Ctrl+C to stop the frontend. Close the backend window to stop the backend.
echo.

start "GreenConvert Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"

cd frontend
call npm run dev
