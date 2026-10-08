# Data Architecture & Ingestion Guidelines

This directory manages datasets for the **Intelligent Disaster Risk Management and Emergency Response System** focusing on flood-related infrastructure risk assessment in **Odisha, India**.

> **IMPORTANT:** Raw datasets (especially large satellite rasters or high-resolution shapefiles) must **NOT** be committed to Git. Raw data belongs in `data/raw/` (which is excluded via `.gitignore`).

---

## Folder Structure

```text
data/
├── raw/         # Unmodified raw source data (SRTM rasters, IMD NetCDF/Gridded binaries, OSM PBFs)
├── processed/   # Spatially aligned GeoDataFrames, feature tables, and normalized CSV/Parquet files
├── demo/        # Lightweight illustrative sample records for local UI/backend demonstration
└── README.md    # Data documentation (this file)
```

---

## Data Sources & Mapping

### 1. Rainfall Data
- **Source:** India Meteorological Department (IMD) Daily Gridded Rainfall (0.25° x 0.25° resolution).
- **Features Extracted:**
  - `rainfall_24h` (mm): Accumulated 24-hour precipitation prior to evaluation.
  - `rainfall_3d` (mm): 3-day cumulative antecedent rainfall.
  - `rainfall_7d` (mm): 7-day cumulative antecedent rainfall.
- **License / Terms:** Open Government Data (OGD) Portal India / IMD Research License.

### 2. Terrain & Elevation
- **Source:** NASA SRTM 30m Digital Elevation Model (DEM) / Copernicus DEM 30m.
- **Features Extracted:**
  - `elevation` (meters above sea level).
  - `slope` (degrees).
  - `topographic_wetness_index` (TWI).
- **License / Terms:** Public Domain (NASA / USGS).

### 3. Infrastructure & Location Assets
- **Source:** OpenStreetMap (OSM) Odisha Extract & State Public Works Department (PWD) asset layers.
- **Features Extracted:**
  - `asset_id`: Unique identifier (e.g. `BR-07`, `RD-14`, `WF-03`).
  - `asset_type`: Infrastructure category (Bridge, Road, Water Facility, Substation).
  - `position`: Coordinates `[latitude, longitude]`.
  - `water_distance_km`: Euclidean distance to nearest major river/canal waterway.

### 4. Administrative Boundaries
- **Source:** Survey of India State & District Boundaries.
- **Features Extracted:** District name, sub-basin block boundary.

### 5. Historical Flood Reference Data
- **Source:** ISRO Bhuvan / NRSC Flood Inundation Hazard Maps for Odisha.
- **Role:** Ground truth validation mask for research dataset training.

---

## Demonstration Dataset (`data/demo/demo_assets.json`)

For software demo purposes, lightweight sample records are stored in `data/demo/demo_assets.json`. All assets are clearly marked with `is_demo: true` and labeled as **Illustrative / Demo Data**.
