"""Convert videos to WebM using ffmpeg (libvpx-vp9)."""
import re
import threading
from pathlib import Path

import ffmpeg

VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv"}

# ffmpeg stderr line: time=00:01:23.45 or time=83.45
TIME_RE = re.compile(r"time=(\d+):(\d+):(\d+)\.(\d+)|time=(\d+)\.(\d+)")


def is_video(filename: str) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in VIDEO_EXTENSIONS


def _parse_time(match) -> float:
    if match.group(1) is not None:
        h, m, s, frac = int(match.group(1)), int(match.group(2)), int(match.group(3)), int(match.group(4))
        return h * 3600 + m * 60 + s + frac / 100.0
    return float(match.group(5)) + float(match.group(6)) / 100.0


def _read_stderr(process, duration_sec: float, on_progress) -> None:
    """Read ffmpeg stderr and call on_progress(0.0-1.0) based on time=.
    FFmpeg often uses \\r to overwrite the same line, so we read by chunk and scan for time=.
    """
    last_pct = -1
    buf = ""
    while True:
        chunk = process.stderr.read(4096)
        if not chunk:
            break
        buf += chunk.decode("utf-8", errors="ignore")
        for part in buf.replace("\r", "\n").split("\n"):
            m = TIME_RE.search(part)
            if m and duration_sec > 0:
                current = _parse_time(m)
                pct = min(1.0, current / duration_sec)
                if pct > last_pct and (pct - last_pct) >= 0.02:
                    last_pct = pct
                    on_progress(pct)
        # Keep tail in case time= was split across chunks
        buf = buf[-128:] if len(buf) > 128 else buf
    process.stderr.close()


def get_duration_seconds(src_path: str) -> float:
    """Return duration in seconds from ffmpeg probe."""
    try:
        info = ffmpeg.probe(src_path)
        return float(info.get("format", {}).get("duration", 0) or 0)
    except Exception:
        return 0.0


def convert_to_webm(
    src_path: str,
    out_path: str,
    crf: int = 33,
    progress_callback=None,
) -> None:
    """
    Convert video at src_path to WebM at out_path using libvpx-vp9.
    crf: 0-63 (lower = better quality, higher = more compression).
    progress_callback: optional callable(percent_0_to_1) for encode progress.
    """
    duration_sec = get_duration_seconds(src_path)

    process = (
        ffmpeg.input(src_path)
        .output(
            out_path,
            vcodec="libvpx-vp9",
            acodec="libopus",
            **{"crf": crf, "b:a": "128k"},
        )
        .overwrite_output()
        .run_async(pipe_stderr=True)
    )

    def on_progress(pct: float) -> None:
        if progress_callback:
            progress_callback(pct)

    reader = threading.Thread(target=_read_stderr, args=(process, duration_sec, on_progress), daemon=True)
    reader.start()
    process.wait()
    reader.join(timeout=1.0)

    if process.returncode != 0:
        raise RuntimeError(f"ffmpeg exited with code {process.returncode}")
