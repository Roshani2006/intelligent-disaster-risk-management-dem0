from typing import List, Dict, Any, Optional
from app.services.risk import DemoRuleRiskEngine

risk_engine = DemoRuleRiskEngine()

# Base demo asset raw parameters for Odisha, India AOI
RAW_DEMO_ASSETS = [
    {
        "id": "BR-07",
        "name": "Bridge BR-07",
        "type": "Bridge",
        "district": "Cuttack / Mahanadi River Corridor",
        "position": [20.2961, 85.8245],
        "elevation_m": 12.0,
        "water_distance_km": 0.35,
        "exposure": 0.92,
        "rainfall_scenarios": {
            "Extreme Rainfall": 185.0,
            "Flood-related Conditions": 140.0,
            "Monitoring Scenario": 45.0,
        },
    },
    {
        "id": "RD-14",
        "name": "Road Segment RD-14",
        "type": "Road",
        "district": "Jagatsinghpur Coastal Highway",
        "position": [20.4625, 85.8830],
        "elevation_m": 18.0,
        "water_distance_km": 0.80,
        "exposure": 0.85,
        "rainfall_scenarios": {
            "Extreme Rainfall": 162.0,
            "Flood-related Conditions": 115.0,
            "Monitoring Scenario": 30.0,
        },
    },
    {
        "id": "WF-03",
        "name": "Water Facility WF-03",
        "type": "Water Facility",
        "district": "Paradeep Estuary Zone",
        "position": [20.2710, 86.6930],
        "elevation_m": 8.0,
        "water_distance_km": 0.20,
        "exposure": 0.88,
        "rainfall_scenarios": {
            "Extreme Rainfall": 155.0,
            "Flood-related Conditions": 130.0,
            "Monitoring Scenario": 25.0,
        },
    },
    {
        "id": "A-02",
        "name": "Infrastructure Asset A-02",
        "type": "Infrastructure",
        "district": "Khurda / Bhubaneswar Substation",
        "position": [20.2600, 85.8200],
        "elevation_m": 42.0,
        "water_distance_km": 2.10,
        "exposure": 0.60,
        "rainfall_scenarios": {
            "Extreme Rainfall": 95.0,
            "Flood-related Conditions": 75.0,
            "Monitoring Scenario": 15.0,
        },
    },
    {
        "id": "M-01",
        "name": "Monitoring Zone M-01",
        "type": "Monitoring",
        "district": "Banki Floodplain Sub-basin",
        "position": [20.4900, 85.6200],
        "elevation_m": 65.0,
        "water_distance_km": 4.50,
        "exposure": 0.30,
        "rainfall_scenarios": {
            "Extreme Rainfall": 40.0,
            "Flood-related Conditions": 35.0,
            "Monitoring Scenario": 10.0,
        },
    },
    {
        "id": "BR-12",
        "name": "Kendrapara Embankment Bridge BR-12",
        "type": "Bridge",
        "district": "Kendrapara Coastal Delta",
        "position": [20.5000, 86.4200],
        "elevation_m": 10.0,
        "water_distance_km": 0.40,
        "exposure": 0.90,
        "rainfall_scenarios": {
            "Extreme Rainfall": 175.0,
            "Flood-related Conditions": 150.0,
            "Monitoring Scenario": 35.0,
        },
    },
    {
        "id": "RD-05",
        "name": "Puri Coastal Trunk RD-05",
        "type": "Road",
        "district": "Puri District Highway",
        "position": [19.8136, 85.8312],
        "elevation_m": 35.0,
        "water_distance_km": 1.50,
        "exposure": 0.50,
        "rainfall_scenarios": {
            "Extreme Rainfall": 110.0,
            "Flood-related Conditions": 80.0,
            "Monitoring Scenario": 20.0,
        },
    },
]

DEMO_ALERTS = [
    {
        "id": "ALT-101",
        "title": "Critical Flood Exposure Alert",
        "message": "High rainfall inundation detected near Mahanadi River Basin. 3 infrastructure assets require priority inspection.",
        "severity": "CRITICAL",
        "timestamp": "10 min ago",
        "affected_assets": ["BR-07", "BR-12", "WF-03"],
    },
    {
        "id": "ALT-102",
        "title": "Heavy Rainfall Threshold Exceeded",
        "message": "24h rainfall exceeded 150mm in Cuttack & Kendrapara districts.",
        "severity": "HIGH",
        "timestamp": "25 min ago",
        "affected_assets": ["RD-14", "BR-07"],
    },
    {
        "id": "ALT-103",
        "title": "Inspection Priority Queue Recalculated",
        "message": "Priority scores updated dynamically based on latest rule-based risk evaluation.",
        "severity": "MODERATE",
        "timestamp": "1 hour ago",
        "affected_assets": ["BR-07", "RD-14", "WF-03", "A-02", "M-01"],
    },
    {
        "id": "ALT-104",
        "title": "Coastal Weather Advisory",
        "message": "Moderate wind speeds and surface runoff expected along Puri coastal stretch.",
        "severity": "LOW",
        "timestamp": "2 hours ago",
        "affected_assets": ["RD-05"],
    },
]


def get_assessed_assets(scenario: str = "Extreme Rainfall") -> List[Dict[str, Any]]:
    """
    Evaluates risk for all demo assets under the requested scenario.
    """
    assessed = []
    for raw in RAW_DEMO_ASSETS:
        rainfall = raw["rainfall_scenarios"].get(
            scenario, raw["rainfall_scenarios"]["Extreme Rainfall"]
        )
        res = risk_engine.evaluate_risk(
            rainfall_24h_mm=rainfall,
            elevation_m=raw["elevation_m"],
            water_distance_km=raw["water_distance_km"],
            exposure=raw["exposure"],
        )
        assessed.append(
            {
                "id": raw["id"],
                "name": raw["name"],
                "type": raw["type"],
                "district": raw["district"],
                "position": raw["position"],
                "rainfall_24h_mm": rainfall,
                "elevation_m": raw["elevation_m"],
                "water_distance_km": raw["water_distance_km"],
                "exposure": raw["exposure"],
                "risk_score": res["risk_score"],
                "risk_level": res["risk_level"],
                "priority_score": res["priority_score"],
                "recommended_action": res["recommended_action"],
                "last_assessed": "Just now",
                "is_demo": True,
            }
        )
    return assessed


def get_summary_metrics(scenario: str = "Extreme Rainfall") -> Dict[str, Any]:
    assets = get_assessed_assets(scenario)
    critical_count = sum(1 for a in assets if a["risk_level"] == "CRITICAL")
    high_count = sum(1 for a in assets if a["risk_level"] == "HIGH")
    mod_count = sum(1 for a in assets if a["risk_level"] == "MODERATE")
    low_count = sum(1 for a in assets if a["risk_level"] == "LOW")

    return {
        "monitored_assets": len(assets),
        "critical_risk": critical_count,
        "high_risk": high_count,
        "moderate_risk": mod_count,
        "low_risk": low_count,
        "open_alerts": len(DEMO_ALERTS),
        "last_updated": "Just now",
        "scenario": scenario,
        "engine_type": "demo-rule-based",
        "is_demo_mode": True,
    }
