import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  ChevronDown,
  CircleAlert,
  CloudRain,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  ShieldAlert,
  Siren,
  Target,
  Users,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  ArrowRight,
  MapPin,
  ExternalLink,
} from "lucide-react";

import RiskMap from "./components/RiskMap";
import {
  fetchHealth,
  fetchSummary,
  fetchRisks,
  fetchPriorities,
  fetchAlerts,
  evaluateCustomRisk,
} from "./api";
import "./App.css";

function RiskBadge({ risk = "LOW" }) {
  const riskStr = (risk || "LOW").toString().toUpperCase();
  return (
    <span className={`risk-badge risk-${riskStr.toLowerCase()}`}>
      {riskStr}
    </span>
  );
}

function App() {
  // Navigation State: 'dashboard' | 'risk_map' | 'priorities' | 'alerts' | 'teams'
  const [activeTab, setActiveTab] = useState("dashboard");

  // Filter State: 'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  const [filterRisk, setFilterRisk] = useState("ALL");

  // Scenario State: 'Extreme Rainfall' | 'Flood-related Conditions' | 'Monitoring Scenario'
  const [scenario, setScenario] = useState("Extreme Rainfall");

  // App Data States
  const [summary, setSummary] = useState(null);
  const [assets, setAssets] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("BR-07");

  // System & Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Custom Assessment Form State
  const [customInput, setCustomInput] = useState({
    rainfall_24h_mm: 180,
    elevation_m: 15,
    water_distance_km: 0.5,
    exposure: 0.85,
  });
  const [customResult, setCustomResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Load backend or fallback data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [healthRes, summaryRes, risksRes, prioritiesRes, alertsRes] = await Promise.all([
        fetchHealth(),
        fetchSummary(scenario),
        fetchRisks(null, scenario),
        fetchPriorities(scenario),
        fetchAlerts(),
      ]);

      setIsConnected(healthRes.isConnected);
      setSummary(summaryRes);
      setAssets(risksRes.assets || []);
      setPriorities(prioritiesRes.assets || []);
      setAlerts(alertsRes.alerts || []);

      // Ensure a valid selected asset exists
      if (risksRes.assets && risksRes.assets.length > 0) {
        if (!risksRes.assets.some((a) => a.id === selectedAssetId)) {
          setSelectedAssetId(risksRes.assets[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setErrorMsg("Failed to synchronize with backend API. Running in local demo fallback.");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [scenario, selectedAssetId]);

  useEffect(() => {
    loadData();
  }, [scenario]);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0] || {
    id: "BR-07",
    name: "Bridge BR-07",
    type: "Bridge",
    district: "Cuttack / Mahanadi River Corridor",
    risk_level: "CRITICAL",
    risk_score: 0.91,
    priority_score: 0.91,
    rainfall_24h_mm: 185.0,
    elevation_m: 12.0,
    water_distance_km: 0.35,
    exposure: 0.92,
    recommended_action: "Priority inspection required within 2 hours.",
  };

  const handleCustomEvaluate = async (e) => {
    e.preventDefault();
    setIsEvaluating(true);
    try {
      const res = await evaluateCustomRisk({
        rainfall_24h_mm: Number(customInput.rainfall_24h_mm),
        elevation_m: Number(customInput.elevation_m),
        water_distance_km: Number(customInput.water_distance_km),
        exposure: Number(customInput.exposure),
      });
      setCustomResult(res.result);
    } catch (err) {
      console.error("Custom evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Metrics setup
  const metricCards = [
    {
      label: "Monitored Assets",
      value: summary ? summary.monitored_assets : assets.length,
      icon: Target,
    },
    {
      label: "Critical Risk",
      value: summary ? String(summary.critical_risk).padStart(2, "0") : "00",
      icon: ShieldAlert,
    },
    {
      label: "High Risk",
      value: summary ? String(summary.high_risk).padStart(2, "0") : "00",
      icon: CircleAlert,
    },
    {
      label: "Open Alerts",
      value: summary ? String(summary.open_alerts).padStart(2, "0") : alerts.length,
      icon: Bell,
    },
  ];

  const filteredAssetsList = filterRisk === "ALL"
    ? assets
    : assets.filter((a) => a.risk_level.toUpperCase() === filterRisk.toUpperCase());

  const filteredAlertsList = filterRisk === "ALL"
    ? alerts
    : alerts.filter((a) => a.severity.toUpperCase() === filterRisk.toUpperCase());

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Siren size={20} />
          </div>
          <div>
            <div className="brand-name">INFRAguard</div>
            <div className="brand-subtitle">AI Risk Intelligence</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === "risk_map" ? "active" : ""}`}
            onClick={() => setActiveTab("risk_map")}
          >
            <MapIcon size={18} />
            <span>Risk Map</span>
          </button>

          <button
            className={`nav-item ${activeTab === "priorities" ? "active" : ""}`}
            onClick={() => setActiveTab("priorities")}
          >
            <ShieldAlert size={18} />
            <span>Priority Assets</span>
          </button>

          <button
            className={`nav-item ${activeTab === "alerts" ? "active" : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            <Bell size={18} />
            <span>Alerts</span>
            <span className="nav-count">{alerts.length}</span>
          </button>

          <button
            className={`nav-item ${activeTab === "teams" ? "active" : ""}`}
            onClick={() => setActiveTab("teams")}
          >
            <Users size={18} />
            <span>Response Teams</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className={`status-dot ${isConnected ? "online" : "demo"}`} />
            <div>
              <strong>{isConnected ? "API Connected" : "DEMO MODE"}</strong>
              <span>{isConnected ? "FastAPI live backend" : "Local fallback engine"}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" title="Navigation Menu">
              <Menu size={20} />
            </button>
            <div>
              <p className="eyebrow">DECISION SUPPORT • ODISHA FLOOD RISK</p>
              <h1>Risk Command Center</h1>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Scenario Selector */}
            <div className="scenario-selector-wrapper">
              <label htmlFor="scenario-select" className="scenario-label">Scenario</label>
              <select
                id="scenario-select"
                className="scenario-dropdown"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              >
                <option value="Extreme Rainfall">Extreme Rainfall (180+ mm)</option>
                <option value="Flood-related Conditions">Flood-related Conditions (120+ mm)</option>
                <option value="Monitoring Scenario">Monitoring Scenario (Baseline)</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              className="icon-button refresh-btn"
              onClick={loadData}
              disabled={isLoading}
              title="Re-query Backend API"
            >
              <RefreshCw size={18} className={isLoading ? "spin" : ""} />
            </button>

            {/* Notifications Button */}
            <button
              className="icon-button"
              onClick={() => setActiveTab("alerts")}
              title="Alert Center"
            >
              <Bell size={18} />
              {alerts.length > 0 && <span className="notification-dot" />}
            </button>

            <div className="user-avatar" title="Commander Session">CK</div>
          </div>
        </header>

        {/* Demo Mode / Disclaimer Banner */}
        <div className="demo-banner">
          <Info size={16} className="banner-icon" />
          <span>
            <strong>DEMO MODE:</strong> Current dashboard demonstrates the complete software workflow using illustrative risk records and a transparent rule-based engine (<code>demo-rule-based</code>). Real ML predictions will replace the demo engine after research dataset & target definition are finalized.
          </span>
        </div>

        {errorMsg && (
          <div className="error-banner">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <section className="page-content">
          {/* Header Overview Row */}
          <div className="overview-row">
            <div>
              <h2>
                {activeTab === "dashboard" && "Operational Overview"}
                {activeTab === "risk_map" && "Geospatial Risk Map & Asset Explorer"}
                {activeTab === "priorities" && "Priority Asset Inspection Ranking"}
                {activeTab === "alerts" && "Early Warning Alert Center"}
                {activeTab === "teams" && "Emergency Response Planning Support"}
              </h2>
              <p>
                {activeTab === "dashboard" && "Current infrastructure vulnerability and inspection priority overview for Odisha, India."}
                {activeTab === "risk_map" && "Interactive Leaflet GIS layer mapping evaluated flood risk assets across Odisha."}
                {activeTab === "priorities" && "Decision-support priority queue sorted dynamically by combined risk & exposure."}
                {activeTab === "alerts" && "System warnings and active flood exposure notifications generated by the backend."}
                {activeTab === "teams" && "Operational planning assistance for field inspection teams and asset triage."}
              </p>
            </div>

            <div className="last-updated">
              Status: <strong>{isConnected ? "FastAPI Online" : "Demo Mode / Local"}</strong> | Updated <strong>Just now</strong>
            </div>
          </div>

          {/* Metric KPI Grid */}
          <section className="metric-grid">
            {metricCards.map((metric) => {
              const Icon = metric.icon;
              return (
                <article className="metric-card" key={metric.label}>
                  <div className="metric-icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p>{metric.label}</p>
                    <strong>{metric.value}</strong>
                  </div>
                </article>
              );
            })}
          </section>

          {/* DYNAMIC VIEW SWITCHING */}

          {/* 1. DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <>
              <section className="dashboard-grid">
                {/* Map Panel */}
                <article className="panel map-panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">GEOSPATIAL MONITORING</p>
                      <h3>Infrastructure Risk Map</h3>
                    </div>

                    <div className="map-controls">
                      {["ALL", "CRITICAL", "HIGH", "MODERATE", "LOW"].map((level) => (
                        <button
                          key={level}
                          className={`filter-button ${filterRisk === level ? "active" : ""}`}
                          onClick={() => setFilterRisk(level)}
                        >
                          {level === "ALL" ? "All" : level.charAt(0) + level.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="real-map-container">
                    <RiskMap
                      assets={assets}
                      selectedAssetId={selectedAssetId}
                      onSelectAsset={(asset) => setSelectedAssetId(asset.id)}
                      filterRiskLevel={filterRisk}
                    />

                    <div className="map-overlay">
                      <div className="map-title">
                        <MapIcon size={17} />
                        <span>GIS Risk Layer (Odisha, India)</span>
                      </div>

                      <div className="map-legend">
                        <span><i className="legend-dot critical" /> Critical</span>
                        <span><i className="legend-dot high" /> High</span>
                        <span><i className="legend-dot moderate" /> Moderate</span>
                        <span><i className="legend-dot low" /> Low</span>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Selected Asset Side Panel */}
                <article className="panel selected-panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">SELECTED ASSET</p>
                      <h3>{selectedAsset.name}</h3>
                    </div>
                    <RiskBadge risk={selectedAsset.risk_level} />
                  </div>

                  <div className="asset-subinfo">
                    <span><strong>ID:</strong> {selectedAsset.id}</span>
                    <span><strong>Type:</strong> {selectedAsset.type}</span>
                    <span><strong>District:</strong> {selectedAsset.district || "Odisha"}</span>
                  </div>

                  <div className="risk-score">
                    <div className="score-ring">
                      <strong>{(selectedAsset.risk_score || 0).toFixed(2)}</strong>
                      <span>Risk Score</span>
                    </div>

                    <div className="priority-card">
                      <span>Priority Score</span>
                      <strong>{(selectedAsset.priority_score || 0).toFixed(2)}</strong>
                      <span className="priority-rank-tag">
                        Ranking #{priorities.findIndex((p) => p.id === selectedAsset.id) + 1 || 1}
                      </span>
                    </div>
                  </div>

                  <div className="evidence-section">
                    <div className="evidence-heading">
                      <h4>Key Contributing Factors</h4>
                      <span>Rule-Based Evidence</span>
                    </div>

                    <div className="factor-row">
                      <span>24h Rainfall</span>
                      <strong>{selectedAsset.rainfall_24h_mm || 0} mm</strong>
                    </div>

                    <div className="factor-row">
                      <span>Elevation</span>
                      <strong>{selectedAsset.elevation_m || 0} m</strong>
                    </div>

                    <div className="factor-row">
                      <span>Water Proximity</span>
                      <strong>{selectedAsset.water_distance_km || 0} km</strong>
                    </div>

                    <div className="factor-row">
                      <span>Exposure Index</span>
                      <strong>{Math.round((selectedAsset.exposure || 0) * 100)}%</strong>
                    </div>
                  </div>

                  <div className="recommendation">
                    <CloudRain size={18} />
                    <div>
                      <span>Recommended Action</span>
                      <strong>{selectedAsset.recommended_action || "Inspect asset routinely."}</strong>
                    </div>
                  </div>
                </article>
              </section>

              {/* Bottom Dashboard Grid */}
              <section className="bottom-grid">
                {/* Inspection Priority Queue */}
                <article className="panel priority-panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">DECISION SUPPORT</p>
                      <h3>Inspection Priority Queue</h3>
                    </div>

                    <button className="text-button" onClick={() => setActiveTab("priorities")}>
                      View all ({priorities.length})
                    </button>
                  </div>

                  <div className="priority-list">
                    {priorities.slice(0, 5).map((asset) => (
                      <div
                        className={`priority-item ${selectedAssetId === asset.id ? "selected-row" : ""}`}
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                      >
                        <div>
                          <strong>{asset.name}</strong>
                          <span className="item-subtitle">{asset.type} • {asset.district}</span>
                        </div>

                        <div className="priority-score">
                          <strong>P-Score: {(asset.priority_score || 0).toFixed(2)}</strong>
                          <span className="item-action">{asset.recommended_action}</span>
                        </div>

                        <RiskBadge risk={asset.risk_level} />
                      </div>
                    ))}
                  </div>
                </article>

                {/* Active Alerts Panel */}
                <article className="panel alerts-panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">EARLY WARNING</p>
                      <h3>Active Early Warning Alerts</h3>
                    </div>
                    <button className="text-button" onClick={() => setActiveTab("alerts")}>
                      Alert Center
                    </button>
                  </div>

                  <div className="alert-list-preview">
                    {alerts.map((alert) => (
                      <div className={`alert-card ${alert.severity.toLowerCase()}-alert`} key={alert.id}>
                        <div className="alert-icon">
                          {alert.severity === "CRITICAL" ? (
                            <ShieldAlert size={18} />
                          ) : alert.severity === "HIGH" ? (
                            <CloudRain size={18} />
                          ) : (
                            <Target size={18} />
                          )}
                        </div>
                        <div>
                          <strong>{alert.title}</strong>
                          <span>{alert.message}</span>
                          <span className="alert-time">{alert.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </>
          )}

          {/* 2. RISK MAP TAB */}
          {activeTab === "risk_map" && (
            <section className="dashboard-grid full-map-grid">
              <article className="panel map-panel full-map-panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">FULL GIS EXPLORER</p>
                    <h3>Odisha Flood Risk Geospatial Layer</h3>
                  </div>

                  <div className="map-controls">
                    {["ALL", "CRITICAL", "HIGH", "MODERATE", "LOW"].map((level) => (
                      <button
                        key={level}
                        className={`filter-button ${filterRisk === level ? "active" : ""}`}
                        onClick={() => setFilterRisk(level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="real-map-container large-map">
                  <RiskMap
                    assets={assets}
                    selectedAssetId={selectedAssetId}
                    onSelectAsset={(asset) => setSelectedAssetId(asset.id)}
                    filterRiskLevel={filterRisk}
                  />
                  <div className="map-overlay">
                    <div className="map-title">
                      <MapIcon size={17} />
                      <span>Viewing {filteredAssetsList.length} Assessed Assets</span>
                    </div>
                  </div>
                </div>
              </article>

              {/* Selected Asset Drawer */}
              <article className="panel selected-panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">ASSET DETAILS</p>
                    <h3>{selectedAsset.name}</h3>
                  </div>
                  <RiskBadge risk={selectedAsset.risk_level} />
                </div>

                <div className="asset-subinfo">
                  <span><strong>ID:</strong> {selectedAsset.id}</span>
                  <span><strong>Type:</strong> {selectedAsset.type}</span>
                </div>

                <div className="risk-score">
                  <div className="score-ring">
                    <strong>{(selectedAsset.risk_score || 0).toFixed(2)}</strong>
                    <span>Risk Score</span>
                  </div>

                  <div className="priority-card">
                    <span>Priority Score</span>
                    <strong>{(selectedAsset.priority_score || 0).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="evidence-section">
                  <div className="evidence-heading">
                    <h4>Assessed Parameters</h4>
                  </div>
                  <div className="factor-row">
                    <span>24h Rainfall</span>
                    <strong>{selectedAsset.rainfall_24h_mm} mm</strong>
                  </div>
                  <div className="factor-row">
                    <span>Elevation</span>
                    <strong>{selectedAsset.elevation_m} m</strong>
                  </div>
                  <div className="factor-row">
                    <span>Water Proximity</span>
                    <strong>{selectedAsset.water_distance_km} km</strong>
                  </div>
                  <div className="factor-row">
                    <span>Exposure</span>
                    <strong>{Math.round((selectedAsset.exposure || 0) * 100)}%</strong>
                  </div>
                </div>

                <div className="recommendation">
                  <CloudRain size={18} />
                  <div>
                    <span>Action Plan</span>
                    <strong>{selectedAsset.recommended_action}</strong>
                  </div>
                </div>
              </article>
            </section>
          )}

          {/* 3. PRIORITY ASSETS TAB */}
          {activeTab === "priorities" && (
            <section className="panel section-view">
              <div className="panel-header">
                <div>
                  <p className="section-label">ORDERED DECISION QUEUE</p>
                  <h3>Priority Assets (Sorted by Priority Score)</h3>
                </div>

                <div className="map-controls">
                  {["ALL", "CRITICAL", "HIGH", "MODERATE", "LOW"].map((level) => (
                    <button
                      key={level}
                      className={`filter-button ${filterRisk === level ? "active" : ""}`}
                      onClick={() => setFilterRisk(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Asset ID</th>
                      <th>Asset Name</th>
                      <th>Type</th>
                      <th>District</th>
                      <th>Risk Level</th>
                      <th>Risk Score</th>
                      <th>Priority Score</th>
                      <th>24h Rain</th>
                      <th>Elevation</th>
                      <th>Water Dist</th>
                      <th>Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priorities
                      .filter((a) => filterRisk === "ALL" || a.risk_level.toUpperCase() === filterRisk.toUpperCase())
                      .map((asset, idx) => (
                        <tr
                          key={asset.id}
                          className={selectedAssetId === asset.id ? "selected-row" : ""}
                          onClick={() => {
                            setSelectedAssetId(asset.id);
                            setActiveTab("dashboard");
                          }}
                        >
                          <td><strong>#{idx + 1}</strong></td>
                          <td><code>{asset.id}</code></td>
                          <td><strong>{asset.name}</strong></td>
                          <td>{asset.type}</td>
                          <td>{asset.district}</td>
                          <td><RiskBadge risk={asset.risk_level} /></td>
                          <td><strong>{(asset.risk_score || 0).toFixed(2)}</strong></td>
                          <td><span className="priority-high-val">{(asset.priority_score || 0).toFixed(2)}</span></td>
                          <td>{asset.rainfall_24h_mm} mm</td>
                          <td>{asset.elevation_m} m</td>
                          <td>{asset.water_distance_km} km</td>
                          <td className="action-cell">{asset.recommended_action}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 4. ALERTS TAB */}
          {activeTab === "alerts" && (
            <section className="panel section-view">
              <div className="panel-header">
                <div>
                  <p className="section-label">ALERT CENTER</p>
                  <h3>Active Early Warning Alerts & System Notifications</h3>
                </div>

                <div className="map-controls">
                  {["ALL", "CRITICAL", "HIGH", "MODERATE", "LOW"].map((level) => (
                    <button
                      key={level}
                      className={`filter-button ${filterRisk === level ? "active" : ""}`}
                      onClick={() => setFilterRisk(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="alerts-full-list">
                {filteredAlertsList.map((alert) => (
                  <div className={`alert-card-large ${alert.severity.toLowerCase()}-alert-large`} key={alert.id}>
                    <div className="alert-large-header">
                      <div className="alert-large-title">
                        <ShieldAlert size={20} />
                        <h4>{alert.title}</h4>
                      </div>
                      <div className="alert-meta">
                        <RiskBadge risk={alert.severity} />
                        <span className="alert-timestamp">{alert.timestamp}</span>
                      </div>
                    </div>

                    <p className="alert-message">{alert.message}</p>

                    {alert.affected_assets && alert.affected_assets.length > 0 && (
                      <div className="affected-assets-bar">
                        <span>Affected Assets:</span>
                        {alert.affected_assets.map((assetId) => (
                          <button
                            key={assetId}
                            className="asset-chip"
                            onClick={() => {
                              setSelectedAssetId(assetId);
                              setActiveTab("dashboard");
                            }}
                          >
                            <MapPin size={12} />
                            {assetId}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. RESPONSE TEAMS TAB */}
          {activeTab === "teams" && (
            <section className="teams-view-container">
              {/* Response Workflow */}
              <article className="panel section-view">
                <div className="panel-header">
                  <div>
                    <p className="section-label">OPERATIONAL WORKFLOW</p>
                    <h3>Emergency Response Support Pipeline</h3>
                  </div>
                  <span className="planning-tag">Demo / Planning Support</span>
                </div>

                <div className="workflow-steps">
                  <div className="step-card">
                    <div className="step-num">1</div>
                    <h4>Inundation Risk Assessment</h4>
                    <p>Evaluate rainfall, elevation, & river proximity parameters using the transparent rule-based engine.</p>
                  </div>
                  <div className="step-arrow"><ArrowRight size={18} /></div>

                  <div className="step-card">
                    <div className="step-num">2</div>
                    <h4>Priority Triage</h4>
                    <p>Rank infrastructure by combined risk score and exposure index to produce inspection queue.</p>
                  </div>
                  <div className="step-arrow"><ArrowRight size={18} /></div>

                  <div className="step-card">
                    <div className="step-num">3</div>
                    <h4>Inspection Dispatch</h4>
                    <p>Assign field inspection teams based on asset location and severity tier.</p>
                  </div>
                  <div className="step-arrow"><ArrowRight size={18} /></div>

                  <div className="step-card">
                    <div className="step-num">4</div>
                    <h4>Field Verification</h4>
                    <p>Engineers verify physical embankment status and feed ground truth back to platform.</p>
                  </div>
                </div>
              </article>

              {/* Inspection Queue & Team Assignment */}
              <div className="dashboard-grid">
                <article className="panel map-panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">INSPECTION QUEUE</p>
                      <h3>Suggested Inspection Sequence</h3>
                    </div>
                  </div>

                  <div className="priority-list">
                    {priorities.map((asset, index) => (
                      <div className="priority-item" key={asset.id}>
                        <div className="seq-badge">#{index + 1}</div>
                        <div>
                          <strong>{asset.name}</strong>
                          <span>{asset.type} • {asset.district}</span>
                        </div>
                        <div className="priority-score">
                          <strong>P-Score: {(asset.priority_score || 0).toFixed(2)}</strong>
                          <span>{asset.recommended_action}</span>
                        </div>
                        <RiskBadge risk={asset.risk_level} />
                      </div>
                    ))}
                  </div>
                </article>

                {/* Team Allocation Area */}
                <article className="panel selected-panel">
                  <div className="panel-header">
                    <div>
                      <p className="section-label">TEAM ALLOCATION</p>
                      <h3>Response Team Rosters</h3>
                    </div>
                    <span className="planning-tag">Planning Only</span>
                  </div>

                  <div className="teams-roster-list">
                    <div className="team-card">
                      <div className="team-header">
                        <strong>Team Alpha-1 (Cuttack Sector)</strong>
                        <span className="team-status assigned">Assigned</span>
                      </div>
                      <p>Assigned Asset: <strong>BR-07 (Bridge BR-07)</strong></p>
                      <p className="team-members">Members: 3 Structural Engineers, 1 GIS Technician</p>
                    </div>

                    <div className="team-card">
                      <div className="team-header">
                        <strong>Team Bravo-2 (Paradeep Sector)</strong>
                        <span className="team-status assigned">Assigned</span>
                      </div>
                      <p>Assigned Asset: <strong>WF-03 (Water Facility WF-03)</strong></p>
                      <p className="team-members">Members: 2 Hydraulics Experts, 1 Safety Lead</p>
                    </div>

                    <div className="team-card">
                      <div className="team-header">
                        <strong>Team Charlie-3 (Kendrapara Sector)</strong>
                        <span className="team-status standby">Standby</span>
                      </div>
                      <p>Assigned Asset: <strong>BR-12 (Embankment Bridge)</strong></p>
                      <p className="team-members">Members: 2 Field Inspectors</p>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          )}

          {/* CUSTOM RISK ENGINE TESTER SECTION (Available on Dashboard) */}
          {activeTab === "dashboard" && (
            <section className="panel section-view tester-section" style={{ marginTop: "24px" }}>
              <div className="panel-header">
                <div>
                  <p className="section-label">BACKEND ENGINE TESTER</p>
                  <h3>Interactive Risk Calculator (<code>POST /api/assessment</code>)</h3>
                </div>
                <span className="engine-badge">demo-rule-based engine</span>
              </div>

              <div className="tester-grid">
                <form onSubmit={handleCustomEvaluate} className="tester-form">
                  <div className="form-group">
                    <label>24h Rainfall (mm):</label>
                    <input
                      type="number"
                      value={customInput.rainfall_24h_mm}
                      onChange={(e) => setCustomInput({ ...customInput, rainfall_24h_mm: e.target.value })}
                      min="0"
                      max="500"
                    />
                  </div>

                  <div className="form-group">
                    <label>Elevation (m):</label>
                    <input
                      type="number"
                      value={customInput.elevation_m}
                      onChange={(e) => setCustomInput({ ...customInput, elevation_m: e.target.value })}
                      min="0"
                      max="1000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Water Distance (km):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customInput.water_distance_km}
                      onChange={(e) => setCustomInput({ ...customInput, water_distance_km: e.target.value })}
                      min="0"
                      max="50"
                    />
                  </div>

                  <div className="form-group">
                    <label>Exposure Index (0.0 - 1.0):</label>
                    <input
                      type="number"
                      step="0.05"
                      value={customInput.exposure}
                      onChange={(e) => setCustomInput({ ...customInput, exposure: e.target.value })}
                      min="0"
                      max="1"
                    />
                  </div>

                  <button type="submit" className="eval-button" disabled={isEvaluating}>
                    {isEvaluating ? "Calculating..." : "Calculate Risk Score"}
                  </button>
                </form>

                <div className="tester-result">
                  {customResult ? (
                    <div className="result-card">
                      <div className="result-header">
                        <h4>Assessment Output</h4>
                        <RiskBadge risk={customResult.risk_level} />
                      </div>
                      <div className="result-scores">
                        <div>
                          <span>Risk Score:</span>
                          <strong>{customResult.risk_score}</strong>
                        </div>
                        <div>
                          <span>Priority Score:</span>
                          <strong>{customResult.priority_score}</strong>
                        </div>
                      </div>
                      <p className="result-action">
                        <strong>Recommended Action:</strong> {customResult.recommended_action}
                      </p>
                      <p className="result-method">
                        <em>Calculated using rule-based formula pipeline.</em>
                      </p>
                    </div>
                  ) : (
                    <div className="result-placeholder">
                      <Sliders size={32} />
                      <p>Adjust inputs and click <strong>Calculate Risk Score</strong> to evaluate custom parameters via the backend API.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;