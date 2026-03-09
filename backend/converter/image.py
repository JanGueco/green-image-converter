"""Convert images to WebP using Pillow."""
import io
from pathlib import Path

from PIL import Image


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif"}


def is_image(filename: str) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in IMAGE_EXTENSIONS


def convert_to_webp(source: bytes | str | Path, quality: int = 85) -> bytes:
    """
    Convert image bytes or file path to WebP.
    source: raw bytes, or path to file.
    quality: 1-100 (100 = lossless).
    Returns WebP bytes.
    """
    if isinstance(source, (str, Path)):
        img = Image.open(source)
    else:
        img = Image.open(io.BytesIO(source))
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")
    out = io.BytesIO()
    img.save(out, "WEBP", quality=quality)
    return out.getvalue()
