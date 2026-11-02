import io
import os
import re
from pathlib import Path
from typing import Optional, Dict
from PIL import Image as PILImage, ImageChops
from config import PRIMARY_IMG_DIR, FALLBACK_IMG_DIR, IMAGE_CACHE_DIR

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

_primary_index: Dict[str, Path] = {}
_fallback_index: Dict[str, Path] = {}
_match_cache: Dict[str, Optional[Path]] = {}
_is_indexed = False

def index_image_directories():
    """Indexes primary and secondary image directories into fast memory hash maps."""
    global _primary_index, _fallback_index, _match_cache, _is_indexed

    os.makedirs(IMAGE_CACHE_DIR, exist_ok=True)
    _primary_index.clear()
    _fallback_index.clear()
    _match_cache.clear()

    # 1. Primary Folder (500x500 shallow scan)
    p_path = Path(PRIMARY_IMG_DIR)
    if p_path.exists():
        try:
            for entry in os.scandir(p_path):
                if entry.is_file() and Path(entry.name).suffix.lower() in SUPPORTED_EXTENSIONS:
                    stem = Path(entry.name).stem.strip().lower()
                    _primary_index[stem] = Path(entry.path)
            print(f"[INFO] Indexed {len(_primary_index):,} primary images.")
        except Exception as e:
            print(f"[WARNING] Primary folder indexing error: {e}")

    # 2. Secondary Folder (LD Sketches recursive walk)
    f_path = Path(FALLBACK_IMG_DIR)
    if f_path.exists():
        try:
            for root, _, files in os.walk(f_path):
                for f in files:
                    p = Path(f)
                    if p.suffix.lower() in SUPPORTED_EXTENSIONS:
                        full_path = Path(root) / f
                        stem = p.stem.strip().lower()

                        if stem not in _fallback_index:
                            _fallback_index[stem] = full_path

                        stem_clean = stem.rstrip(" ._()")
                        if stem_clean not in _fallback_index:
                            _fallback_index[stem_clean] = full_path

                        for prefix in ["sketch_", "sketch ", "sketch-", "sketch", "ld_", "ld ", "ld-"]:
                            if stem.startswith(prefix):
                                stripped = stem[len(prefix):].strip(" ._()")
                                if stripped and stripped not in _fallback_index:
                                    _fallback_index[stripped] = full_path

                        # Preserve design codes containing hyphens like 'L-PN-76585-050'
                        tokens = re.split(r'[_ \t\(\)\[\]]+', stem)
                        for token in tokens:
                            token_clean = token.strip(" ._")
                            if token_clean and token_clean not in _fallback_index:
                                _fallback_index[token_clean] = full_path

            print(f"[INFO] Indexed {len(_fallback_index):,} secondary images.")
        except Exception as e:
            print(f"[WARNING] Fallback folder indexing error: {e}")

    _is_indexed = True

def find_image_for_style(design_no: str) -> Optional[Path]:
    """Finds image path prioritizing Primary > Secondary > without L- prefix."""
    global _is_indexed
    if not _is_indexed:
        index_image_directories()

    q = str(design_no).strip().lower()
    if not q or q in ["-", "nan", "none"]:
        return None

    if q in _match_cache:
        return _match_cache[q]

    # Priority 1: Exact match in primary
    if q in _primary_index:
        res = _primary_index[q]
        _match_cache[q] = res
        return res

    # Priority 2: Secondary / LD folder
    if q in _fallback_index:
        res = _fallback_index[q]
        _match_cache[q] = res
        return res

    # Priority 3: Fallback without 'l-' prefix
    if q.startswith("l-") and q[2:] in _fallback_index:
        res = _fallback_index[q[2:]]
        _match_cache[q] = res
        return res

    _match_cache[q] = None
    return None

def get_image_source_for_style(design_no: str) -> str:
    """Classifies design image status: 'primary', 'secondary', or 'none'."""
    q = str(design_no).strip().lower()
    if not q or q in ["-", "nan", "none"]:
        return "none"
    if q in _primary_index:
        return "primary"
    if find_image_for_style(design_no):
        return "secondary"
    return "none"

def get_cropped_image_bytes(image_path: Path, full_resolution: bool = False, tolerance: int = 15) -> bytes:
    """Crops excess whitespace padding and caches the thumbnail to disk."""
    suffix = "_full.png" if full_resolution else "_thumb.jpg"
    cache_file = Path(IMAGE_CACHE_DIR) / f"{image_path.stem}{suffix}"

    if cache_file.exists():
        return cache_file.read_bytes()

    with PILImage.open(image_path) as pil_img:
        if pil_img.mode in ("RGBA", "LA") or (pil_img.mode == "P" and "transparency" in pil_img.info):
            bg = PILImage.new("RGB", pil_img.size, (255, 255, 255))
            pil_img = pil_img.convert("RGBA")
            bg.paste(pil_img, mask=pil_img.split()[3])
            img_rgb = bg
        else:
            img_rgb = pil_img.convert("RGB")

        # Autocrop white borders
        bg_diff = PILImage.new("RGB", img_rgb.size, (255, 255, 255))
        diff = ImageChops.difference(img_rgb, bg_diff).convert("L")
        bbox = diff.point(lambda p: 255 if p > tolerance else 0).getbbox()
        cropped = img_rgb.crop(bbox) if bbox else img_rgb

        stream = io.BytesIO()
        if full_resolution:
            cropped.save(stream, format="PNG", optimize=True)
        else:
            cropped.thumbnail((800, 800), PILImage.Resampling.LANCZOS)
            cropped.save(stream, format="JPEG", quality=90, optimize=True)

        data = stream.getvalue()
        try:
            cache_file.write_bytes(data)
        except Exception:
            pass

        return data