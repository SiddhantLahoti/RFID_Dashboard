import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Excel File Configuration
EXCEL_FILE = os.path.join(BASE_DIR, "RANGE STOCK RFID - 23-07-26.xlsx")
EXCEL_SHEET_NAME = "DETAILS"
EXCEL_SKIP_ROWS = 5  # Row 6 in Excel contains the actual table headers

# Image Folders (Set your actual mounted drive paths)
PRIMARY_IMG_DIR = r"Y:\\"       # 500x500 primary renders
FALLBACK_IMG_DIR = r"Z:\LD"     # LD sketches / secondary renders
IMAGE_CACHE_DIR = os.path.join(BASE_DIR, ".cache_images")

# Column Definitions matching the Excel sheet
COL_RFID = "RFID CODE"          # Col T (Unique)
COL_BAG_NO = "Bag No."          # Col B
COL_SO_NO = "So No."            # Col C
COL_CUSTOMER = "Customer"       # Col E
COL_DESIGN_NO = "DesignNo"      # Col F (Used for image search)
COL_DESCRIPTION = "Description"  # Col G
COL_DIA_QLTY = "DIAQLTY"        # Col H
COL_METAL_KT = "MetalKt"        # Col I

# Numeric / Range Filter Columns (Col K to Col P)
COL_GROSS_WT = "GROSSWT"        # Col K
COL_NET_WT = "NETWT"            # Col L
COL_DIA_WT = "DIA WT."          # Col M
COL_CENTER_WT = "CENTERWT"      # Col N
COL_SET_CODE = "Set Code"       # Col O
COL_CENT_SZ = "Cent Sz"         # Col P

# Location Columns
COL_SUBLOCATION = "sublocation."# Col Q
COL_LOCATION = "LOCATION"       # Col S