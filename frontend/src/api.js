const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Fallback demo dataset used only when FastAPI backend is disconnected
const FALLBACK_ASSETS = [
  {
    id: "BR-07",
    name: "Bridge BR-07",
    type: "Bridge",
    district: "Cuttack / Mahanadi River Corridor",
    position: [20.2961, 85.8245],
    rainfall_24h_mm: 185.0,
    elevation_m: 12.0,
    water_distance_km: 0.35,
    exposure: 0.92,
    risk_score: 0.91,
    risk_level: "CRITICAL",
    priority_score: 0.91,
    recommended_action: "Priority inspection required within 2 hours. Deploy field team.",
    last_assessed: "Demo Fallback",
    is_demo: true,
  },
  {
    id: "RD-14",
    name: "Road Segment RD-14",
    type: "Road",
    district: "Jagatsinghpur Coastal Highway",
    position: [20.4625, 85.8830],
    rainfall_24h_mm: 162.0,
    elevation_m: 18.0,
    water_distance_km: 0.80,
    exposure: 0.85,
    risk_score: 0.82,
    risk_level: "HIGH",
    priority_score: 0.82,
    recommended_action: "Inspect asset within 6 hours. Monitor upstream rainfall.",
    last_assessed: "Demo Fallback",
    is_demo: true,
  },
  {
    id: "WF-03",
    name: "Water Facility WF-03",
    type: "Water Facility",
    district: "Paradeep Estuary Zone",
    position: [20.2710, 86.6930],
    rainfall_24h_mm: 155.0,
    elevation_m: 8.0,
    water_distance_km: 0.20,
    exposure: 0.88,
    risk_score: 0.79,
    risk_level: "HIGH",
    priority_score: 0.80,
    recommended_action: "Monitor closely. Verify backup pumps and flood gates.",
    last_assessed: "Demo Fallback",
    is_demo: true,
  },
  {
    id: "A-02",
    name: "Infrastructure Asset A-02",
    type: "Infrastructure",
    district: "Khurda / Bhubaneswar Substation",
    position: [20.2600, 85.8200],
    rainfall_24h_mm: 95.0,
    elevation_m: 42.0,
    water_distance_km: 2.10,
    exposure: 0.60,
    risk_score: 0.43,
    risk_level: "MODERATE",
    priority_score: 0.46,
    recommended_action: "Routine monitoring. Maintain operational readiness.",
    last_assessed: "Demo Fallback",
    is_demo: true,
  },
  {
    id: "M-01",
    name: "Monitoring Zone M-01",
    type: "Monitoring",
    district: "Banki Floodplain Sub-basin",
    position: [20.4900, 85.6200],
    rainfall_24h_mm: 40.0,
    elevation_m: 65.0,
    water_distance_km: 4.50,
    exposure: 0.30,
    risk_score: 0.19,
    risk_level: "LOW",
    priority_score: 0.21,
    recommended_action: "Normal status. Standard periodic review.",
    last_assessed: "Demo Fallback",
    is_demo: true,
  },
  {
    id: "BR-12",
    name: "Kendrapara Embankment Bridge BR-12",
    type: "Bridge",
    district: "Kendrapara Coastal Delta",
    position: [20.5000, 86.4200],
    rainfall_24h_mm: 175.0,
    elevation_m: 10.0,
    water_distance_km: 0.40,
    exposure: 0.90,
    risk_score: 0.88,
    risk_level: "CRITICAL",
    priority_score: 0.88,
    recommended_action: "Priority inspection required within 2 hours.",
    last_assessed: "Demo Fallback",
    is_demo: true,
  },
  {
    id: "RD-05",
    name: "Puri Coastal Trunk RD-05",
    type: "Road",
    district: "Puri District Highway",
    position: [19.8136, 85.8312],
    rainfall_24h_mm: 110.0,
    elevation_m: 35.0,
    water_distance_km: 1.50,
    exposure: 0.50,
    risk_score: 0.51,
    risk_level: "MODERATE",
    priority_score: 0.51,
    recommended_action: "Routine monitoring.",
    last_assessed: "Demo Fallback",
    is_demo: true,
  },
];

const FALLBACK_ALERTS = [
  {
    id: "ALT-101",
    title: "Critical Flood Exposure Alert",
    message: "High rainfall inundation detected near Mahanadi River Basin. 3 infrastructure assets require priority inspection.",
    severity: "CRITICAL",
    timestamp: "10 min ago",
    affected_assets: ["BR-07", "BR-12", "WF-03"],
  },
  {
    id: "ALT-102",
    title: "Heavy Rainfall Threshold Exceeded",
    message: "24h rainfall exceeded 150mm in Cuttack & Kendrapara districts.",
    severity: "HIGH",
    timestamp: "25 min ago",
    affected_assets: ["RD-14", "BR-07"],
  },
  {
    id: "ALT-103",
    title: "Inspection Priority Queue Recalculated",
    message: "Priority scores updated dynamically based on latest rule-based risk evaluation.",
    severity: "MODERATE",
    timestamp: "1 hour ago",
    affected_assets: ["BR-07", "RD-14", "WF-03", "A-02", "M-01"],
  },
  {
    id: "ALT-104",
    title: "Coastal Weather Advisory",
    message: "Moderate wind speeds and surface runoff expected along Puri coastal stretch.",
    severity: "LOW",
    timestamp: "2 hours ago",
    affected_assets: ["RD-05"],
  },
];

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    return { data, isConnected: true, error: null };
  } catch (err) {
    console.warn(`API call to ${url} failed, using local fallback demo mode.`, err);
    return { data: null, isConnected: false, error: err.message };
  }
}

export async function fetchHealth() {
  const { data, isConnected } = await apiRequest("/api/health");
  if (isConnected && data) {
    return { ...data, isConnected: true };
  }
  return {
    status: "fallback",
    service: "disaster-risk-management-api",
    version: "0.1.0",
    engine: "demo-rule-based",
    isConnected: false,
  };
}

export async function fetchSummary(scenario = "Extreme Rainfall") {
  const query = `?scenario=${encodeURIComponent(scenario)}`;
  const { data, isConnected } = await apiRequest(`/api/summary${query}`);
  if (isConnected && data) {
    return { ...data, isConnected: true };
  }

  // Calculate summary from fallback data
  const critical = FALLBACK_ASSETS.filter((a) => a.risk_level === "CRITICAL").length;
  const high = FALLBACK_ASSETS.filter((a) => a.risk_level === "HIGH").length;
  const mod = FALLBACK_ASSETS.filter((a) => a.risk_level === "MODERATE").length;
  const low = FALLBACK_ASSETS.filter((a) => a.risk_level === "LOW").length;

  return {
    monitored_assets: FALLBACK_ASSETS.length,
    critical_risk: critical,
    high_risk: high,
    moderate_risk: mod,
    low_risk: low,
    open_alerts: FALLBACK_ALERTS.length,
    last_updated: "Offline Demo Fallback",
    scenario,
    engine_type: "demo-rule-based",
    is_demo_mode: true,
    isConnected: false,
  };
}

export async function fetchRisks(riskLevel = null, scenario = "Extreme Rainfall") {
  let endpoint = `/api/risks?scenario=${encodeURIComponent(scenario)}`;
  if (riskLevel && riskLevel !== "ALL") {
    endpoint += `&risk_level=${encodeURIComponent(riskLevel)}`;
  }
  const { data, isConnected } = await apiRequest(endpoint);
  if (isConnected && data) {
    return { assets: data, isConnected: true };
  }

  let filtered = [...FALLBACK_ASSETS];
  if (riskLevel && riskLevel !== "ALL") {
    filtered = filtered.filter(
      (a) => a.risk_level.toUpperCase() === riskLevel.toUpperCase()
    );
  }
  return { assets: filtered, isConnected: false };
}

export async function fetchPriorities(scenario = "Extreme Rainfall") {
  const { data, isConnected } = await apiRequest(
    `/api/priorities?scenario=${encodeURIComponent(scenario)}`
  );
  if (isConnected && data) {
    return { assets: data, isConnected: true };
  }

  const sorted = [...FALLBACK_ASSETS].sort(
    (a, b) => b.priority_score - a.priority_score
  );
  return { assets: sorted, isConnected: false };
}

export async function fetchAlerts() {
  const { data, isConnected } = await apiRequest("/api/alerts");
  if (isConnected && data) {
    return { alerts: data, isConnected: true };
  }
  return { alerts: FALLBACK_ALERTS, isConnected: false };
}

export async function evaluateCustomRisk(payload) {
  const { data, isConnected } = await apiRequest("/api/assessment", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (isConnected && data) {
    return { result: data, isConnected: true };
  }

  // Fallback calculation using demo rule
  const rainComp = Math.min(Math.max(payload.rainfall_24h_mm, 0) / 200, 1.0);
  const elevComp = 1.0 - Math.min(Math.max(payload.elevation_m, 0) / 100, 1.0);
  const waterComp = 1.0 - Math.min(Math.max(payload.water_distance_km, 0) / 5, 1.0);
  const expComp = Math.min(Math.max(payload.exposure, 0), 1.0);

  const riskScore = 0.4 * rainComp + 0.2 * elevComp + 0.2 * waterComp + 0.2 * expComp;
  const clampedRisk = Math.min(Math.max(riskScore, 0), 1.0);

  let riskLevel = "LOW";
  let action = "Normal status.";
  if (clampedRisk >= 0.85) {
    riskLevel = "CRITICAL";
    action = "Priority inspection required within 2 hours.";
  } else if (clampedRisk >= 0.65) {
    riskLevel = "HIGH";
    action = "Inspect asset within 6 hours.";
  } else if (clampedRisk >= 0.35) {
    riskLevel = "MODERATE";
    action = "Routine monitoring.";
  }

  const priorityScore = Math.min(Math.max(0.85 * clampedRisk + 0.15 * expComp, 0), 1.0);

  return {
    result: {
      risk_score: Number(clampedRisk.toFixed(2)),
      risk_level: riskLevel,
      priority_score: Number(priorityScore.toFixed(2)),
      recommended_action: action,
      engine_type: "demo-rule-based",
    },
    isConnected: false,
  };
}
