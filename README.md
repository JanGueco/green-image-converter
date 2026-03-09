# GreenConvert

Single-page web app to convert images to .webp and videos to .webm, with a dark eco-themed UI.

## Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Python FastAPI (Pillow for images, ffmpeg for video)

## Prerequisites

- Node.js 18+
- Python 3.10+
- [ffmpeg](https://ffmpeg.org/) with libvpx-vp9 (e.g. `brew install ffmpeg` on macOS)

## Quick start with scripts

One command to check requirements, install dependencies, and start both servers:

- **Mac / Linux:** `./run.sh` (or `bash run.sh`) from the project root.
- **Windows:** run `run.bat` from the project root (double-click or `run.bat` in Command Prompt).

The scripts check for Node.js 18+, npm, Python 3.10+, pip, and ffmpeg; install backend and frontend dependencies if needed; then start the backend and frontend. On Windows, the backend runs in a separate window—close it to stop the backend; use Ctrl+C in the frontend window to stop the frontend.

**First-time setup on Windows?** See [WINDOWS.md](WINDOWS.md) for installing Node.js, Python, and ffmpeg.

## Run (manual)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The app talks to the API at `http://localhost:8000` (set `VITE_API_URL` to override).

## Usage

1. Drag and drop (or select) images or videos in the left panel. .webp and .webm are rejected with a toast.
2. Use the **Convert All** button to convert queued files. Progress appears on each card.
3. Converted files show in the right panel with size reduction %. Hover for **Show** (modal/play) and **Download**.

## API

- `GET /health` — health check
- `POST /convert` — multipart file upload; returns `{ "job_id": "..." }`
- `GET /convert/status/{job_id}` — `{ "progress", "done", "error?", "filename?" }`
- `GET /convert/result/{job_id}` — binary converted file (when `done`)
