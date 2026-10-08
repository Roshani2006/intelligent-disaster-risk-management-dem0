from fastapi.testclient import TestClient
from app.main import app
from app.services.risk import DemoRuleRiskEngine

client = TestClient(app)
risk_engine = DemoRuleRiskEngine()


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["engine"] == "demo-rule-based"


def test_metadata_endpoint():
    response = client.get("/api/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "geographic_focus" in data
    assert data["engine_type"] == "demo-rule-based"
    assert "Odisha" in data["geographic_focus"]


def test_get_risks_all_and_filtering():
    # Test all assets
    res_all = client.get("/api/risks")
    assert res_all.status_code == 200
    assets = res_all.json()
    assert len(assets) >= 5

    # Test filtering by CRITICAL
    res_crit = client.get("/api/risks?risk_level=CRITICAL")
    assert res_crit.status_code == 200
    crit_assets = res_crit.json()
    assert all(a["risk_level"] == "CRITICAL" for a in crit_assets)

    # Test filtering by LOW
    res_low = client.get("/api/risks?risk_level=LOW")
    assert res_low.status_code == 200
    low_assets = res_low.json()
    assert all(a["risk_level"] == "LOW" for a in low_assets)


def test_get_risk_by_id_and_404():
    # Valid asset
    res_valid = client.get("/api/risks/BR-07")
    assert res_valid.status_code == 200
    data = res_valid.json()
    assert data["id"] == "BR-07"
    assert data["name"] == "Bridge BR-07"

    # Invalid asset 404
    res_404 = client.get("/api/risks/NONEXISTENT-99")
    assert res_404.status_code == 404
    assert "not found" in res_404.json()["detail"].lower()


def test_get_priorities_sorted():
    response = client.get("/api/priorities")
    assert response.status_code == 200
    priorities = response.json()
    assert len(priorities) > 0
    # Verify descending order of priority_score
    scores = [a["priority_score"] for a in priorities]
    assert scores == sorted(scores, reverse=True)


def test_get_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 3
    assert any(a["severity"] == "CRITICAL" for a in alerts)


def test_get_summary():
    response = client.get("/api/summary?scenario=Extreme%20Rainfall")
    assert response.status_code == 200
    summary = response.json()
    assert summary["monitored_assets"] >= 5
    assert summary["engine_type"] == "demo-rule-based"
    assert summary["is_demo_mode"] is True


def test_custom_assessment_api():
    payload = {
        "rainfall_24h_mm": 190.0,
        "elevation_m": 5.0,
        "water_distance_km": 0.2,
        "exposure": 0.95,
    }
    response = client.post("/api/assessment", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "CRITICAL"
    assert data["risk_score"] >= 0.85
    assert data["engine_type"] == "demo-rule-based"


def test_risk_engine_classification_boundaries():
    # Critical boundary test
    crit_res = risk_engine.evaluate_risk(200.0, 0.0, 0.0, 1.0)
    assert crit_res["risk_score"] >= 0.85
    assert crit_res["risk_level"] == "CRITICAL"

    # Low boundary test
    low_res = risk_engine.evaluate_risk(0.0, 100.0, 5.0, 0.0)
    assert low_res["risk_score"] < 0.35
    assert low_res["risk_level"] == "LOW"
