"""Shrink oversized website images so pages load quickly.

Runs automatically from .github/workflows/optimize-images.yml whenever images
are added or changed under assets/. It can also be run by hand:

    python scripts/optimize_images.py assets

What it does to each image:
  * turns phone photos upright and removes hidden photo data (camera details
    and GPS location),
  * shrinks anything larger than MAX_EDGE pixels on its longest side,
  * re-saves JPG/WebP files at good web quality and PNG files losslessly,
  * converts iPhone HEIC photos to JPG (same name, .jpg extension).

A file is only replaced when the new version is meaningfully smaller, so
images that are already web-sized are left alone.
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    HEIC_SUPPORTED = True
except ImportError:
    HEIC_SUPPORTED = False

MAX_EDGE = 1600
JPEG_QUALITY = 82
WEBP_QUALITY = 80
MIN_SAVINGS = 0.10
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}


def save(image, path, fmt):
    if fmt == "JPEG":
        image.convert("RGB").save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    elif fmt == "WEBP":
        image.save(path, "WEBP", quality=WEBP_QUALITY, method=6)
    else:
        image.save(path, "PNG", optimize=True)


def optimize(path):
    suffix = path.suffix.lower()
    if suffix in {".heic", ".heif"} and not HEIC_SUPPORTED:
        print(f"skip   {path} (HEIC support not installed)")
        return False

    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original)
        image.load()

    resized = max(image.size) > MAX_EDGE
    if resized:
        image.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)

    if suffix in {".heic", ".heif"}:
        target = path.with_suffix(".jpg")
        save(image, target, "JPEG")
        path.unlink()
        print(f"heic   {path} -> {target.name}")
        return True

    fmt = {".jpg": "JPEG", ".jpeg": "JPEG", ".webp": "WEBP"}.get(suffix, "PNG")
    temp = path.with_name(path.name + ".tmp")
    save(image, temp, fmt)

    old_size, new_size = path.stat().st_size, temp.stat().st_size
    if resized or new_size < old_size * (1 - MIN_SAVINGS):
        temp.replace(path)
        print(f"shrunk {path}: {old_size // 1024}K -> {new_size // 1024}K")
        return True
    temp.unlink()
    return False


def main(roots):
    changed = 0
    for root in roots or ["assets"]:
        root = Path(root)
        files = [root] if root.is_file() else sorted(root.rglob("*"))
        for path in files:
            if path.is_file() and path.suffix.lower() in EXTENSIONS:
                changed += optimize(path)
    print(f"{changed} image(s) optimized")


if __name__ == "__main__":
    main(sys.argv[1:])
