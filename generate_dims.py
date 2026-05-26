#!/usr/bin/env python3
"""
Scans assets/index/**/* for images and videos and regenerates archive_dims.js.
Format: { "filename_without_ext": [width, height] }          → for .webp (default)
        { "filename_without_ext": [width, height, "jpg"] }   → for non-webp images
        { "filename_without_ext": [width, height, "mp4"] }   → for videos
Run: python3 generate_dims.py  (from the repo root)
"""
import json
from pathlib import Path
from PIL import Image

REPO = Path(__file__).parent
INDEX_DIR = REPO / "assets" / "index"
OUT_FILE = REPO / "archive_dims.js"
IMG_EXTS = {".webp", ".jpg", ".jpeg", ".png"}
VID_EXTS = {".mp4", ".webm", ".mov"}

def video_size(p):
    from pymediainfo import MediaInfo
    mi = MediaInfo.parse(str(p))
    for t in mi.tracks:
        if t.track_type == "Video":
            return int(t.width), int(t.height)
    return None

dims = {}
for path in sorted(INDEX_DIR.rglob("*")):
    suf = path.suffix.lower()
    stem = path.stem
    ext = suf.lstrip(".")
    try:
        if suf in IMG_EXTS:
            with Image.open(path) as im:
                w, h = im.size
            dims[stem] = [w, h] if ext == "webp" else [w, h, ext]
        elif suf in VID_EXTS:
            size = video_size(path)
            if not size:
                print(f"  SKIP {path.name}: no video stream")
                continue
            w, h = size
            dims[stem] = [w, h, ext]
    except Exception as e:
        print(f"  SKIP {path.name}: {e}")

out = "// Auto-generated — run: python3 generate_dims.py\n"
out += f"const ARCHIVE_DIMS = {json.dumps(dims, separators=(',', ':'))};\n"
OUT_FILE.write_text(out, encoding="utf-8")
print(f"Done. {len(dims)} images written to archive_dims.js")
