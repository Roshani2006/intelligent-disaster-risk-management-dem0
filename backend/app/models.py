from typing import List, Optional
from pydantic import BaseModel, Field


class AssessmentInput(BaseModel):
    rainfall_24h_mm: float = Field(..., ge=0.0, description="24-hour rainfall in millimeters")
    elevation_m: float = Field(..., description="Elevation in meters above sea level")
    water_distance_km: float = Field(..., ge=0.0, description="Distance to nearest major river/waterway in kilometers")
    exposure: float = Field(..., ge=0.0, le=1.0, description="Asset exposure index clamped between 0 and 1")


class AssessmentResult(BaseModel):
    risk_score: float
    risk_level: str
    priority_score: float
    recommended_action: str
    engine_type: str = "demo-rule-based"


class Asset(BaseModel):
    id: str
    name: str
    type: str
    position: List[float]  # [latitude, longitude]
    district: str
    rainfall_24h_mm: float
    elevation_m: float
    water_distance_km: float
    exposure: float  # 0.0 to 1.0 (or percentage representation in UI)
    risk_score: float
    risk_level: str
    priority_score: float
    recommended_action: str
    last_assessed: str
    is_demo: bool = True


class Alert(BaseModel):
    id: str
    title: str
    message: str
    severity: str  # CRITICAL, HIGH, MODERATE, LOW
    timestamp: str
    affected_assets: List[str]


class SummaryMetrics(BaseModel):
    monitored_assets: int
    critical_risk: int
    high_risk: int
    moderate_risk: int
    low_risk: int
    open_alerts: int
    last_updated: str
    scenario: str
    engine_type: str = "demo-rule-based"
    is_demo_mode: bool = True


class Metadata(BaseModel):
    project_name: str
    version: str
    research_scope: str
    geographic_focus: str
    engine_type: str
    disclaimer: str
