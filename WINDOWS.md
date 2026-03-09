# GreenConvert — Setup on Windows

Step-by-step instructions for installing prerequisites and running GreenConvert on Windows.

## Prerequisites

You need:

- **Node.js** 18 or newer (includes npm)
- **Python** 3.10 or newer
- **pip** (Python package manager; usually installed with Python)
- **ffmpeg** with libvpx-vp9 support (for video conversion)

---

## Installing Node.js

1. Download the **LTS** installer from [nodejs.org](https://nodejs.org/).
2. Run the installer and ensure **"Add to PATH"** is checked.
3. Open a **new** Command Prompt or PowerShell and verify:

   ```cmd
   node --version
   npm --version
   ```

   You should see version numbers (e.g. `v20.x.x` and `10.x.x`).

---

## Installing Python

1. Download the latest Python 3 installer from [python.org](https://www.python.org/downloads/).
2. Run the installer and:
   - Check **"Add Python to PATH"**.
   - Optionally check **"Install pip"** (recommended).
3. Open a **new** Command Prompt or PowerShell and verify:

   ```cmd
   python --version
   python -m pip --version
   ```

   You should see Python 3.10+ and pip version info.

---

## Installing ffmpeg

Choose one of the following.

### Option 1: winget (recommended)

```cmd
winget install ffmpeg
```

Then open a **new** terminal so PATH is updated.

### Option 2: Chocolatey

If you use [Chocolatey](https://chocolatey.org/):

```cmd
choco install ffmpeg
```

### Option 3: Manual install

1. Download a Windows build from [ffmpeg.org](https://ffmpeg.org/download.html) (e.g. the "Windows builds" from gyan.dev or BtbN).
2. Extract the archive to a folder (e.g. `C:\ffmpeg`).
3. Add the **bin** subfolder (e.g. `C:\ffmpeg\bin`) to your system PATH:
   - Search "Environment Variables" in Windows → Edit "Path" → Add the `bin` folder.
4. Open a new terminal and verify:

   ```cmd
   ffmpeg -version
   ```

Most official builds include libvpx-vp9. If you have issues with .webm conversion, ensure your build supports VP9.

---

## Running the project

From the project root (the folder that contains `backend` and `frontend`):

- **Double-click** `run.bat`, or
- In Command Prompt: `run.bat`

The script will:

1. Check that Node.js, npm, Python, pip, and ffmpeg are available.
2. Install backend dependencies (`pip install -r backend\requirements.txt`).
3. Install frontend dependencies (`npm install` in `frontend`).
4. Open a **new window** for the backend (uvicorn on port 8000).
5. Run the frontend in the current window (Vite on port 5173).

Then open **http://localhost:5173** in your browser.

- **Stop the frontend:** Press Ctrl+C in the window where the frontend is running.
- **Stop the backend:** Close the "GreenConvert Backend" window, or press Ctrl+C in that window.

### Manual run (without the script)

If you prefer not to use `run.bat`:

```cmd
cd /d path\to\Green Image Converter
python -m pip install -r backend\requirements.txt
cd frontend
npm install
npm run dev
```

In a **second** terminal:

```cmd
cd /d path\to\Green Image Converter\backend
python -m uvicorn main:app --reload --port 8000
```

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| **"ffmpeg is not recognized"** | ffmpeg is not on PATH. Reinstall (winget/Chocolatey) or add the ffmpeg `bin` folder to your system PATH. Then open a **new** terminal. |
| **"python is not recognized"** | Reinstall Python and check **"Add Python to PATH"**, or use the full path to `python.exe` (e.g. `C:\Users\You\AppData\Local\Programs\Python\Python311\python.exe`). |
| **"node is not recognized"** | Reinstall Node.js and ensure "Add to PATH" is checked. Open a new terminal after installing. |
| **Port 8000 or 5173 already in use** | Another app is using the port. Close that app, or change the port in the backend/frontend config and in the script if you edited it. |
| **pip install fails** | Run `python -m ensurepip --upgrade`, then try again. Use a non-admin terminal if you get permission errors, or use a virtual environment. |

For more on the app itself, see the main [README](README.md).
