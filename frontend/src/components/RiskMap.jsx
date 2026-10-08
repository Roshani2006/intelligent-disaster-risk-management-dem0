import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const riskColors = {
  CRITICAL: "#ff5d68",
  HIGH: "#ff9f43",
  MODERATE: "#f4c95d",
  LOW: "#43d69c",
};

// Helper component to center map on selected asset
function MapRecenter({ selectedAsset }) {
  const map = useMap();
  useEffect(() => {
    if (selectedAsset && selectedAsset.position) {
      map.panTo(selectedAsset.position, { animate: true });
    }
  }, [selectedAsset, map]);
  return null;
}

function RiskMap({ assets = [], selectedAssetId, onSelectAsset, filterRiskLevel = "ALL" }) {
  // Default map center on Odisha, India [Latitude: 20.35, Longitude: 85.95]
  const defaultCenter = [20.35, 85.95];

  const filteredAssets = filterRiskLevel === "ALL"
    ? assets
    : assets.filter(a => a.risk_level.toUpperCase() === filterRiskLevel.toUpperCase());

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  return (
    <div className="map-wrapper" style={{ position: "relative", width: "100%", height: "100%" }}>
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={true}
        className="risk-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter selectedAsset={selectedAsset} />

        {filteredAssets.map((asset) => {
          const isSelected = asset.id === selectedAssetId;
          const color = riskColors[asset.risk_level] || "#3b82f6";

          return (
            <CircleMarker
              key={asset.id}
              center={asset.position}
              radius={isSelected ? 14 : 9}
              pathOptions={{
                color: isSelected ? "#ffffff" : "#000000",
                weight: isSelected ? 3 : 1.5,
                fillColor: color,
                fillOpacity: isSelected ? 1.0 : 0.85,
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectAsset) {
                    onSelectAsset(asset);
                  }
                },
              }}
            >
              <Popup>
                <div className="map-popup-card">
                  <div className="popup-title">
                    <strong>{asset.name}</strong>
                    <span className="popup-type">{asset.type}</span>
                  </div>
                  <div className="popup-body">
                    <p><strong>District:</strong> {asset.district || "Odisha AOI"}</p>
                    <p>
                      <strong>Risk Level:</strong>{" "}
                      <span className={`risk-badge risk-${asset.risk_level.toLowerCase()}`}>
                        {asset.risk_level}
                      </span>
                    </p>
                    <p><strong>Risk Score:</strong> {(asset.risk_score || 0).toFixed(2)}</p>
                    <p><strong>Priority Score:</strong> {(asset.priority_score || 0).toFixed(2)}</p>
                    <p className="popup-note"><em>Illustrative / Demo Data</em></p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default RiskMap;
