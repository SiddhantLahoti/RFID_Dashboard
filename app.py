import os
import threading
from typing import Optional, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles

from data_loader import load_data, get_filter_options
from filters import apply_filters_and_paginate
from image_service import (
    index_image_directories,
    find_image_for_style,
    get_cropped_image_bytes,
    _primary_index,
    _fallback_index
)

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")
FRONTEND_ASSETS = os.path.join(FRONTEND_DIST, "assets")

sync_status = {
    "is_ready": False,
    "step": "Initializing engine...",
    "records": 0,
    "images": 0
}

def background_initial_sync():
    global sync_status
    try:
        sync_status["step"] = "Indexing jewelry image directories..."
        index_image_directories()
        sync_status["images"] = len(_primary_index) + len(_fallback_index)

        sync_status["step"] = "Reading and indexing Excel file..."
        df = load_data(force_reload=True)
        sync_status["records"] = len(df)

        sync_status["step"] = "Ready"
        sync_status["is_ready"] = True
        print("[INFO] Background initial sync complete. Server ready.")
    except Exception as e:
        sync_status["step"] = f"Error: {e}"
        print(f"[ERROR] Initial sync failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    t = threading.Thread(target=background_initial_sync, daemon=True)
    t.start()
    yield

app = FastAPI(title="RFID Range Stock Dashboard", lifespan=lifespan)

if os.path.exists(FRONTEND_ASSETS):
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS), name="assets")

@app.get("/")
def serve_home():
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "RFID Stock API is running. Build frontend to view UI."}

@app.get("/api/status")
def api_get_status():
    return sync_status

@app.get("/api/filters")
def api_get_filters():
    """Returns dynamic multi-select values and min/max ranges for sliders."""
    return get_filter_options()

@app.get("/api/image/{design_no}")
def api_get_product_image(design_no: str, full: bool = False):
    """Serves the autocropped primary or fallback thumbnail for the design number."""
    matched_path = find_image_for_style(design_no)
    if not matched_path:
        raise HTTPException(status_code=404, detail="Image not found")
    try:
        img_bytes = get_cropped_image_bytes(matched_path, full_resolution=full)
        media_type = "image/png" if full else "image/jpeg"
        return Response(content=img_bytes, media_type=media_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products")
def api_get_products(
    search: Optional[str] = None,
    image_source: Optional[str] = Query(None),
    # Multi-dropdown filters
    bag_no: Optional[List[str]] = Query(None),
    so_no: Optional[List[str]] = Query(None),
    customer: Optional[List[str]] = Query(None),
    design_no: Optional[List[str]] = Query(None),
    description: Optional[List[str]] = Query(None),
    dia_qlty: Optional[List[str]] = Query(None),
    metal_kt: Optional[List[str]] = Query(None),
    location: Optional[List[str]] = Query(None),
    sublocation: Optional[List[str]] = Query(None),
    rfid: Optional[List[str]] = Query(None),
    set_code: Optional[List[str]] = Query(None),
    cent_sz: Optional[List[str]] = Query(None),
    # Min-max range filters
    min_gross_wt: Optional[float] = None,
    max_gross_wt: Optional[float] = None,
    min_net_wt: Optional[float] = None,
    max_net_wt: Optional[float] = None,
    min_dia_wt: Optional[float] = None,
    max_dia_wt: Optional[float] = None,
    min_center_wt: Optional[float] = None,
    max_center_wt: Optional[float] = None,
    # Pagination
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=12, le=96)
):
    df = load_data()
    return apply_filters_and_paginate(
        df=df,
        search_query=search,
        image_source=image_source,
        bag_no=bag_no,
        so_no=so_no,
        customer=customer,
        design_no=design_no,
        description=description,
        dia_qlty=dia_qlty,
        metal_kt=metal_kt,
        location=location,
        sublocation=sublocation,
        rfid=rfid,
        set_code=set_code,
        cent_sz=cent_sz,
        min_gross_wt=min_gross_wt,
        max_gross_wt=max_gross_wt,
        min_net_wt=min_net_wt,
        max_net_wt=max_net_wt,
        min_dia_wt=min_dia_wt,
        max_dia_wt=max_dia_wt,
        min_center_wt=min_center_wt,
        max_center_wt=max_center_wt,
        page=page,
        page_size=page_size
    )

@app.post("/api/refresh")
def api_force_refresh():
    df = load_data(force_reload=True)
    return {"status": "success", "total_records": len(df)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8003, reload=True)