from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.models import (
    AssessmentInput,
    AssessmentResult,
    Asset,
    Alert,
    SummaryMetrics,
    Metadata,
)
from app.store import (
    get_assessed_assets,
    get_summary_metrics,
    DEMO_ALERTS,
    risk_engine,
)

app = FastAPI(
    title="Intelligent Disaster Risk Management API",
    version="0.1.0",
    description="Backend decision-support API for disaster risk assessment, early warning, and priority decision support in Odisha, India.",
)

# Configure CORS restricted to frontend dev servers
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "disaster-risk-management-api",
        "version": "0.1.0",
        "engine": "demo-rule-based",
        "mode": "DEMO MODE",
    }


@app.get("/api/metadata", response_model=Metadata)
def get_metadata():
    return Metadata(
        project_name="Intelligent Disaster Risk Management and Emergency Response System",
        version="0.1.0",
        research_scope="Flood-related infrastructure vulnerability & risk assessment",
        geographic_focus="Odisha, India",
        engine_type="demo-rule-based",
        disclaimer="Decision-support demonstration only. Illustrative dataset and rule-based engine. Not an official emergency dispatch authority.",
    )


@app.get("/api/risks", response_model=List[Asset])
def get_risks(
    risk_level: Optional[str] = Query(None, description="Filter by risk level: CRITICAL, HIGH, MODERATE, LOW"),
    scenario: str = Query("Extreme Rainfall", description="Scenario type"),
):
    assets = get_assessed_assets(scenario)
    if risk_level and risk_level.upper() != "ALL":
        assets = [a for a in assets if a["risk_level"].upper() == risk_level.upper()]
    return assets


@app.get("/api/risks/{risk_id}", response_model=Asset)
def get_risk_by_id(
    risk_id: str,
    scenario: str = Query("Extreme Rainfall", description="Scenario type"),
):
    assets = get_assessed_assets(scenario)
    for asset in assets:
        if asset["id"].lower() == risk_id.lower():
            return asset
    raise HTTPException(status_code=404, detail=f"Asset with ID '{risk_id}' not found.")


@app.get("/api/priorities", response_model=List[Asset])
def get_priorities(
    scenario: str = Query("Extreme Rainfall", description="Scenario type"),
    limit: Optional[int] = Query(None, ge=1),
):
    assets = get_assessed_assets(scenario)
    # Sort by priority_score descending
    sorted_assets = sorted(assets, key=lambda x: x["priority_score"], reverse=True)
    if limit:
        return sorted_assets[:limit]
    return sorted_assets


@app.get("/api/alerts", response_model=List[Alert])
def get_alerts():
    return DEMO_ALERTS


@app.get("/api/summary", response_model=SummaryMetrics)
def get_summary(
    scenario: str = Query("Extreme Rainfall", description="Scenario type")
):
    return get_summary_metrics(scenario)


@app.post("/api/assessment", response_model=AssessmentResult)
def calculate_custom_assessment(payload: AssessmentInput):
    result = risk_engine.evaluate_risk(
        rainfall_24h_mm=payload.rainfall_24h_mm,
        elevation_m=payload.elevation_m,
        water_distance_km=payload.water_distance_km,
        exposure=payload.exposure,
    )
    return AssessmentResult(
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        priority_score=result["priority_score"],
        recommended_action=result["recommended_action"],
        engine_type=result["engine_type"],
    )
