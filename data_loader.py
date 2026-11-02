import os
import pandas as pd
from threading import Lock
from config import (
    EXCEL_FILE, EXCEL_SHEET_NAME, EXCEL_SKIP_ROWS,
    COL_RFID, COL_BAG_NO, COL_SO_NO, COL_CUSTOMER, COL_DESIGN_NO,
    COL_DESCRIPTION, COL_DIA_QLTY, COL_METAL_KT,
    COL_GROSS_WT, COL_NET_WT, COL_DIA_WT, COL_CENTER_WT,
    COL_SET_CODE, COL_CENT_SZ, COL_SUBLOCATION, COL_LOCATION
)
from image_service import get_image_source_for_style

_df_cache = None
_filter_options_cache = {}
_last_mtime = 0
_lock = Lock()

def clean_str(val) -> str:
    if pd.isna(val) or val is None:
        return ""
    s = str(val).strip()
    return "" if s in ["-", "nan", "None", "\t"] else s

def clean_numeric(series: pd.Series) -> pd.Series:
    """Fixes typos like 'O.25' (capital O instead of 0) or trailing dots like '0.10.'"""
    cleaned = (
        series.astype(str)
        .str.strip()
        .str.replace("O", "0", regex=False)
        .str.replace("o", "0", regex=False)
        .str.rstrip(".")
    )
    return pd.to_numeric(cleaned, errors="coerce").fillna(0.0)

def load_data(force_reload: bool = False) -> pd.DataFrame:
    global _df_cache, _filter_options_cache, _last_mtime

    with _lock:
        mtime = os.path.getmtime(EXCEL_FILE) if os.path.exists(EXCEL_FILE) else 0
        needs_reload = _df_cache is None or force_reload or (_last_mtime != mtime)

        if needs_reload:
            print(f"[INFO] Loading Excel: {EXCEL_FILE} (Sheet: {EXCEL_SHEET_NAME})...")
            df = pd.read_excel(
                EXCEL_FILE,
                sheet_name=EXCEL_SHEET_NAME,
                skiprows=EXCEL_SKIP_ROWS
            )

            # 1. Clean String Columns
            str_cols = [
                COL_RFID, COL_BAG_NO, COL_SO_NO, COL_CUSTOMER,
                COL_DESIGN_NO, COL_DESCRIPTION, COL_DIA_QLTY,
                COL_METAL_KT, COL_SET_CODE, COL_CENT_SZ,
                COL_SUBLOCATION, COL_LOCATION
            ]
            for col in str_cols:
                if col in df.columns:
                    df[col] = df[col].apply(clean_str)

            # Normalize RFID and Bag/SO codes as clear text strings
            df[COL_RFID] = df[COL_RFID].astype(str).str.strip()
            df = df[df[COL_RFID] != ""].drop_duplicates(subset=[COL_RFID]).copy()

            # 2. Clean Numeric Columns (K to N)
            df[COL_GROSS_WT] = clean_numeric(df[COL_GROSS_WT])
            df[COL_NET_WT] = clean_numeric(df[COL_NET_WT])
            df[COL_DIA_WT] = clean_numeric(df[COL_DIA_WT])
            df[COL_CENTER_WT] = clean_numeric(df[COL_CENTER_WT])

            # 3. Tag image availability
            print("[INFO] Tagging image source availability for designs...")
            df["image_source"] = df[COL_DESIGN_NO].apply(get_image_source_for_style)

            _df_cache = df
            _last_mtime = mtime

            # 4. Generate Filter Metadata & Min-Max Bounds
            def get_uniques(col_name):
                if col_name not in df.columns:
                    return []
                return sorted([x for x in df[col_name].unique() if x])

            _filter_options_cache = {
                "dropdowns": {
                    "bag_no": get_uniques(COL_BAG_NO),
                    "so_no": get_uniques(COL_SO_NO),
                    "customer": get_uniques(COL_CUSTOMER),
                    "design_no": get_uniques(COL_DESIGN_NO),
                    "description": get_uniques(COL_DESCRIPTION),
                    "dia_qlty": get_uniques(COL_DIA_QLTY),
                    "metal_kt": get_uniques(COL_METAL_KT),
                    "location": get_uniques(COL_LOCATION),
                    "sublocation": get_uniques(COL_SUBLOCATION),
                    "rfid": get_uniques(COL_RFID),
                    "set_code": get_uniques(COL_SET_CODE),
                    "cent_sz": get_uniques(COL_CENT_SZ),
                },
                "ranges": {
                    "min_gross_wt": float(df[COL_GROSS_WT].min()),
                    "max_gross_wt": float(df[COL_GROSS_WT].max()),
                    "min_net_wt": float(df[COL_NET_WT].min()),
                    "max_net_wt": float(df[COL_NET_WT].max()),
                    "min_dia_wt": float(df[COL_DIA_WT].min()),
                    "max_dia_wt": float(df[COL_DIA_WT].max()),
                    "min_center_wt": float(df[COL_CENTER_WT].min()),
                    "max_center_wt": float(df[COL_CENTER_WT].max()),
                }
            }
            print(f"[INFO] Engine ready: Loaded {len(df):,} items.")

    return _df_cache

def get_filter_options() -> dict:
    global _filter_options_cache
    if not _filter_options_cache:
        load_data()
    return _filter_options_cache