import math
import pandas as pd
from typing import Optional, List
from config import (
    COL_RFID, COL_BAG_NO, COL_SO_NO, COL_CUSTOMER, COL_DESIGN_NO,
    COL_DESCRIPTION, COL_DIA_QLTY, COL_METAL_KT,
    COL_GROSS_WT, COL_NET_WT, COL_DIA_WT, COL_CENTER_WT,
    COL_SET_CODE, COL_CENT_SZ, COL_SUBLOCATION, COL_LOCATION
)

def apply_filters_and_paginate(
    df: pd.DataFrame,
    search_query: Optional[str] = None,
    image_source: Optional[str] = None,
    # Multi-Dropdown Filters
    bag_no: Optional[List[str]] = None,
    so_no: Optional[List[str]] = None,
    customer: Optional[List[str]] = None,
    design_no: Optional[List[str]] = None,
    description: Optional[List[str]] = None,
    dia_qlty: Optional[List[str]] = None,
    metal_kt: Optional[List[str]] = None,
    location: Optional[List[str]] = None,
    sublocation: Optional[List[str]] = None,
    rfid: Optional[List[str]] = None,
    set_code: Optional[List[str]] = None,
    cent_sz: Optional[List[str]] = None,
    # Min-Max Range Filters (Col K to Col P)
    min_gross_wt: Optional[float] = None,
    max_gross_wt: Optional[float] = None,
    min_net_wt: Optional[float] = None,
    max_net_wt: Optional[float] = None,
    min_dia_wt: Optional[float] = None,
    max_dia_wt: Optional[float] = None,
    min_center_wt: Optional[float] = None,
    max_center_wt: Optional[float] = None,
    # Pagination
    page: int = 1,
    page_size: int = 24
) -> dict:
    filtered_df = df

    # 1. Global Keyword Search
    if search_query and search_query.strip():
        q = search_query.strip().lower()
        mask = (
            filtered_df[COL_DESIGN_NO].str.lower().str.contains(q, na=False) |
            filtered_df[COL_BAG_NO].str.lower().str.contains(q, na=False) |
            filtered_df[COL_SO_NO].str.lower().str.contains(q, na=False) |
            filtered_df[COL_CUSTOMER].str.lower().str.contains(q, na=False) |
            filtered_df[COL_DESCRIPTION].str.lower().str.contains(q, na=False) |
            filtered_df[COL_LOCATION].str.lower().str.contains(q, na=False) |
            filtered_df[COL_SUBLOCATION].str.lower().str.contains(q, na=False) |
            filtered_df[COL_RFID].str.lower().str.contains(q, na=False)
        )
        filtered_df = filtered_df[mask]

    # 2. Multi-Select Dropdowns
    if bag_no:
        filtered_df = filtered_df[filtered_df[COL_BAG_NO].isin(bag_no)]
    if so_no:
        filtered_df = filtered_df[filtered_df[COL_SO_NO].isin(so_no)]
    if customer:
        filtered_df = filtered_df[filtered_df[COL_CUSTOMER].isin(customer)]
    if design_no:
        filtered_df = filtered_df[filtered_df[COL_DESIGN_NO].isin(design_no)]
    if description:
        filtered_df = filtered_df[filtered_df[COL_DESCRIPTION].isin(description)]
    if dia_qlty:
        filtered_df = filtered_df[filtered_df[COL_DIA_QLTY].isin(dia_qlty)]
    if metal_kt:
        filtered_df = filtered_df[filtered_df[COL_METAL_KT].isin(metal_kt)]
    if location:
        filtered_df = filtered_df[filtered_df[COL_LOCATION].isin(location)]
    if sublocation:
        filtered_df = filtered_df[filtered_df[COL_SUBLOCATION].isin(sublocation)]
    if rfid:
        filtered_df = filtered_df[filtered_df[COL_RFID].isin(rfid)]
    if set_code:
        filtered_df = filtered_df[filtered_df[COL_SET_CODE].isin(set_code)]
    if cent_sz:
        filtered_df = filtered_df[filtered_df[COL_CENT_SZ].isin(cent_sz)]

    # 3. Min-Max Range Filters
    if min_gross_wt is not None:
        filtered_df = filtered_df[filtered_df[COL_GROSS_WT] >= min_gross_wt]
    if max_gross_wt is not None:
        filtered_df = filtered_df[filtered_df[COL_GROSS_WT] <= max_gross_wt]

    if min_net_wt is not None:
        filtered_df = filtered_df[filtered_df[COL_NET_WT] >= min_net_wt]
    if max_net_wt is not None:
        filtered_df = filtered_df[filtered_df[COL_NET_WT] <= max_net_wt]

    if min_dia_wt is not None:
        filtered_df = filtered_df[filtered_df[COL_DIA_WT] >= min_dia_wt]
    if max_dia_wt is not None:
        filtered_df = filtered_df[filtered_df[COL_DIA_WT] <= max_dia_wt]

    if min_center_wt is not None:
        filtered_df = filtered_df[filtered_df[COL_CENTER_WT] >= min_center_wt]
    if max_center_wt is not None:
        filtered_df = filtered_df[filtered_df[COL_CENTER_WT] <= max_center_wt]

    # 4. Image Source Filter ('primary', 'secondary', 'none')
    if image_source in ["primary", "secondary", "none"]:
        filtered_df = filtered_df[filtered_df["image_source"] == image_source]

    # 5. Pagination
    total_items = len(filtered_df)
    total_pages = math.ceil(total_items / page_size) if total_items > 0 else 1
    page = max(1, min(page, total_pages))

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_items = filtered_df.iloc[start_idx:end_idx].copy()

    # Compute dynamic cascading options from the filtered dataset
    def get_uniques(col_name):
        if col_name not in filtered_df.columns:
            return []
        return sorted([str(x) for x in filtered_df[col_name].dropna().unique() if str(x).strip()])

    dynamic_options = {
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
    }
    
    return {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "items": page_items.fillna("").to_dict(orient="records"),
        "available_options": dynamic_options  
    }
    
    
    
    