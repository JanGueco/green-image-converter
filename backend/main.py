"""GreenConvert FastAPI backend: convert images to .webp and videos to .webm."""
import asyncio
import shutil
import tempfile
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from converter.image import convert_to_webp, is_image
from converter.video import convert_to_webm, is_video

app = FastAPI(title="GreenConvert API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REJECT_EXTENSIONS = {".webp", ".webm"}
executor = ThreadPoolExecutor(max_workers=4)

# job_id -> { progress: 0-100, done: bool, result: bytes|None, content_type, filename, error: str|None }
jobs: dict[str, dict] = {}


def reject_webp_webm(filename: str) -> None:
    ext = Path(filename).suffix.lower()
    if ext in REJECT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=".webp and .webm files are not accepted for conversion.",
        )


def run_conversion(
    job_id: str,
    content: bytes,
    filename: str,
    tmpdir: str,
    webp_quality: int = 85,
    webm_crf: int = 33,
):
    base = Path(filename).stem
    try:
        jobs[job_id]["progress"] = 10
        if is_image(filename):
            out_bytes = convert_to_webp(content, quality=webp_quality)
            jobs[job_id]["progress"] = 100
            jobs[job_id]["result"] = out_bytes
            jobs[job_id]["content_type"] = "image/webp"
            jobs[job_id]["filename"] = f"{base}.webp"
        elif is_video(filename):
            src = Path(tmpdir) / filename
            src.write_bytes(content)
            out_path = Path(tmpdir) / f"{base}.webm"
            jobs[job_id]["progress"] = 50

            def video_progress(pct: float) -> None:
                jobs[job_id]["progress"] = 50 + int(pct * 50)

            convert_to_webm(str(src), str(out_path), crf=webm_crf, progress_callback=video_progress)
            jobs[job_id]["progress"] = 100
            jobs[job_id]["result"] = out_path.read_bytes()
            jobs[job_id]["content_type"] = "video/webm"
            jobs[job_id]["filename"] = f"{base}.webm"
        jobs[job_id]["done"] = True
    except Exception as e:
        jobs[job_id]["done"] = True
        jobs[job_id]["error"] = str(e)
    finally:
        jobs[job_id]["progress"] = 100
        try:
            shutil.rmtree(tmpdir, ignore_errors=True)
        except Exception:
            pass


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/convert")
async def convert(
    file: UploadFile = File(...),
    webp_quality: int = Form(85),
    webm_crf: int = Form(33),
):
    """
    Accept a single file; start conversion in background.
    Optional: webp_quality (1-100), webm_crf (0-63).
    Returns job_id. Poll GET /convert/status/{job_id} for progress, then GET /convert/result/{job_id} for the file.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")
    reject_webp_webm(file.filename)
    if not (1 <= webp_quality <= 100):
        raise HTTPException(status_code=400, detail="webp_quality must be between 1 and 100.")
    if not (0 <= webm_crf <= 63):
        raise HTTPException(status_code=400, detail="webm_crf must be between 0 and 63.")

    content = await file.read()
    if not is_image(file.filename) and not is_video(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Use images (jpg, png, gif, bmp, tiff) or videos (mp4, mov, avi, mkv).",
        )

    job_id = str(uuid.uuid4())
    tmpdir = tempfile.mkdtemp()
    jobs[job_id] = {
        "progress": 0,
        "done": False,
        "result": None,
        "content_type": None,
        "filename": None,
        "error": None,
        "_tmpdir": tmpdir,
    }

    loop = asyncio.get_event_loop()
    loop.run_in_executor(
        executor,
        run_conversion,
        job_id,
        content,
        file.filename,
        tmpdir,
        webp_quality,
        webm_crf,
    )
    return {"job_id": job_id}


@app.get("/convert/status/{job_id}")
def convert_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found.")
    j = jobs[job_id]
    return {
        "progress": j["progress"],
        "done": j["done"],
        "error": j.get("error"),
        "filename": j.get("filename"),
    }


@app.get("/convert/result/{job_id}")
def convert_result(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found.")
    j = jobs[job_id]
    if not j["done"]:
        raise HTTPException(status_code=202, detail="Conversion not finished yet.")
    if j.get("error"):
        raise HTTPException(status_code=500, detail=j["error"])
    if not j.get("result"):
        raise HTTPException(status_code=500, detail="No result.")
    return Response(
        content=j["result"],
        media_type=j["content_type"],
        headers={"Content-Disposition": f'attachment; filename="{j["filename"]}"'},
    )
