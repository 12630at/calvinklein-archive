#!/usr/bin/env python3
"""
Scans assets/index/**/* for all images and regenerates archive_dims.js.
Format: { "filename_without_ext": [width, height] }          → for .webp (default)
        { "filename_without_ext": [width, height, "jpg"] }   → for non-webp
Run: python3 generate_dims.py  (from the repo root)
"""
import json
import os
from pathlib import Path
from PIL import Image

REPO = Path(__file__).parent
INDEX_DIR = REPO / "assets" / "index"
OUT_FILE = REPO / "archive_dims.js"
EXTS = {".webp", ".jpg", ".jpeg", ".png"}

dims = {}
for img_path in sorted(INDEX_DIR.rglob("*")):
    if img_path.suffix.lower() not in EXTS:
        continue
    stem = img_path.stem
    ext = img_path.suffix.lower().lstrip(".")
    try:
        with Image.open(img_path) as im:
            w, h = im.size
        if ext == "webp":
            dims[stem] = [w, h]
        else:
            dims[stem] = [w, h, ext]
    except Exception as e:
        print(f"  SKIP {img_path.name}: {e}")

out = "// Auto-generated — run: python3 generate_dims.py\n"
out += f"const ARCHIVE_DIMS = {json.dumps(dims, separators=(',', ':'))};\n"
OUT_FILE.write_text(out, encoding="utf-8")
print(f"Done. {len(dims)} images written to archive_dims.js")
