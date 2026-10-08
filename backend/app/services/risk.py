from abc import ABC, abstractmethod
from typing import Dict, Any


class RiskEngine(ABC):
    """
    Abstract interface for Disaster Risk Calculation Engines.
    Allows easy swapping between the transparent demo rule-based engine
    and future trained Machine Learning models (e.g. RandomForestRiskEngine).
    """

    @abstractmethod
    def evaluate_risk(
        self,
        rainfall_24h_mm: float,
        elevation_m: float,
        water_distance_km: float,
        exposure: float,
    ) -> Dict[str, Any]:
        pass


class DemoRuleRiskEngine(RiskEngine):
    """
    Transparent, deterministic rule-based risk evaluation engine.
    Used for DEMO / decision-support pipeline validation.
    
    IMPORTANT: This is explicitly a deterministic rule-based heuristic,
    NOT a trained machine learning model.
    """

    ENGINE_TYPE = "demo-rule-based"

    def evaluate_risk(
        self,
        rainfall_24h_mm: float,
        elevation_m: float,
        water_distance_km: float,
        exposure: float,
    ) -> Dict[str, Any]:
        # 1. Rainfall component normalized to [0, 1]
        rainfall_comp = min(max(rainfall_24h_mm, 0.0) / 200.0, 1.0)

        # 2. Elevation component (lower elevation = higher risk)
        elevation_comp = 1.0 - min(max(elevation_m, 0.0) / 100.0, 1.0)

        # 3. Water distance component (closer proximity = higher risk)
        water_comp = 1.0 - min(max(water_distance_km, 0.0) / 5.0, 1.0)

        # 4. Exposure component clamped to [0, 1]
        exposure_comp = min(max(exposure, 0.0), 1.0)

        # Weighted Risk Score calculation
        raw_risk = (
            0.40 * rainfall_comp
            + 0.20 * elevation_comp
            + 0.20 * water_comp
            + 0.20 * exposure_comp
        )
        risk_score = min(max(raw_risk, 0.0), 1.0)

        # Risk Classification boundaries
        if risk_score >= 0.85:
            risk_level = "CRITICAL"
            recommended_action = "Priority inspection required within 2 hours. Deploy field team."
        elif risk_score >= 0.65:
            risk_level = "HIGH"
            recommended_action = "Inspect asset within 6 hours. Monitor upstream rainfall."
        elif risk_score >= 0.35:
            risk_level = "MODERATE"
            recommended_action = "Routine monitoring. Maintain operational readiness."
        else:
            risk_level = "LOW"
            recommended_action = "Normal status. Standard periodic review."

        # Priority score calculation
        raw_priority = 0.85 * risk_score + 0.15 * exposure_comp
        priority_score = min(max(raw_priority, 0.0), 1.0)

        return {
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "priority_score": round(priority_score, 2),
            "recommended_action": recommended_action,
            "engine_type": self.ENGINE_TYPE,
            "components": {
                "rainfall": round(rainfall_comp, 2),
                "elevation": round(elevation_comp, 2),
                "water_distance": round(water_comp, 2),
                "exposure": round(exposure_comp, 2),
            },
        }


class MLRiskEngine(RiskEngine):
    """
    Placeholder interface for future trained Machine Learning model.
    Will load trained Random Forest / XGBoost model artifact (.pkl / .onnx).
    """

    ENGINE_TYPE = "trained-random-forest-placeholder"

    def evaluate_risk(
        self,
        rainfall_24h_mm: float,
        elevation_m: float,
        water_distance_km: float,
        exposure: float,
    ) -> Dict[str, Any]:
        raise NotImplementedError(
            "MLRiskEngine will be enabled once research dataset training pipeline is finalized."
        )
