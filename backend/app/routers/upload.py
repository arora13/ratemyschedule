# backend/app/routers/upload.py
"""
Upload endpoint v2:
- Saves the file to ./backend/uploads
- Runs a tiny OCR stub (pytesseract) to extract raw text lines
- Returns a "mock" parsed schedule so the frontend can render something
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from PIL import Image
import io, time, os

# optional OCR import; if tesseract isn't installed, we'll fall back gracefully
try:
    import pytesseract
    TESS_AVAILABLE = True
except Exception:
    TESS_AVAILABLE = False

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"  # backend/uploads
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    # 1) read bytes
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="empty file upload")

    # 2) quick sanity check it's an image (won't catch SVGs, that’s fine for now)
    try:
        Image.open(io.BytesIO(contents)).verify()
        is_image = True
    except Exception:
        is_image = False  # some people will upload PDFs or SVG; we’ll still save them

    # 3) save to disk with a simple timestamped name to avoid collisions
    ts = int(time.time())
    safe_name = f"{ts}_{file.filename.replace(' ', '_')}"
    out_path = UPLOAD_DIR / safe_name
    with open(out_path, "wb") as f:
        f.write(contents)

    # 4) OCR stub: try to read text if it's a raster image (png/jpg)
    raw_text = ""
    if TESS_AVAILABLE and is_image:
        try:
            img = Image.open(io.BytesIO(contents))
            raw_text = pytesseract.image_to_string(img)
        except Exception as e:
            raw_text = f"(ocr failed: {e})"
    else:
        if not TESS_AVAILABLE:
            raw_text = "(tesseract not installed; run `brew install tesseract`)"
        elif not is_image:
            raw_text = "(not a raster image; skipping OCR)"

    # 5) very dumb “parsed schedule” mock so the frontend has something to render
    #    later we’ll replace this with a real parser based on raw_text
    mock_events = [
        # day_of_week: 1=Mon ... 5=Fri
        {"title": "MATH 101", "day_of_week": 1, "start_time": "09:00", "end_time": "10:15", "location": "ENG-201", "color": "#A6E3E9"},
        {"title": "CS 160",   "day_of_week": 2, "start_time": "11:00", "end_time": "12:15", "location": "CS-105",  "color": "#FFADAD"},
        {"title": "HIST 210", "day_of_week": 3, "start_time": "13:30", "end_time": "14:45", "location": "HUM-12",  "color": "#FFD6A5"},
    ]

    return JSONResponse({
        "ok": True,
        "saved_as": str(out_path),
        "is_image": is_image,
        "raw_text_preview": raw_text[:300],  # just first 300 chars so response is small
        "parsed": {
            "term": "Fall 2025",
            "events": mock_events
        },
        "message": "File saved and OCR attempted"
    })
