import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { useSocket } from "../../hooks/useSocket";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function getColor(score) {
  if (score >= 61) return "#22c55e";
  if (score >= 31) return "#f59e0b";
  return "#ef4444";
}

function getRiskLabel(score) {
  if (score >= 61) return "Safe";
  if (score >= 31) return "Moderate Risk";
  return "Unsafe";
}

const CAT_COLOR = {
  harassment: "#f97316",
  theft: "#eab308",
  assault: "#ef4444",
  suspicious: "#8b5cf6",
  other: "#64748b",
};

const CAT_EMOJI = {
  harassment: "⚠️",
  theft: "🔓",
  assault: "🚨",
  suspicious: "👁️",
  other: "📍",
};

function FlyTo({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 1.5 });
  }, [coords, map]);

  return null;
}

export default function SafetyMap({ city = "Chennai" }) {
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    axios.get(`/api/zones?city=${city}`)
      .then((r) => setZones(r.data?.zones || []));

    axios.get(`/api/reports?city=${city}`)
      .then((r) => setReports(r.data?.reports || []));
  }, [city]);

  useSocket(city, (newReport) => {
    setReports((prev) => [newReport, ...prev]);
    setLiveAlerts((prev) => [newReport, ...prev.slice(0, 2)]);
    setTimeout(() => setLiveAlerts((prev) => prev.slice(1)), 6000);
  });

  function locateMe() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation([coords.latitude, coords.longitude]);
      },
      () => {
        alert("Unable to fetch location. Permission denied?");
      }
    );
  }

  const filtered =
    filter === "all"
      ? reports
      : reports.filter((r) => r.category === filter);

  /* Inject popup styles */
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .leaflet-popup-content-wrapper {
        background: #fff !important;
        border-radius: 12px !important;
        border: 1px solid #e2e8f0 !important;
        color: #0f172a !important;
      }
      .leaflet-popup-tip {
        background: #fff !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>

      {/* Filter bar */}
      <div style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "#ffffff",
        borderRadius: 14,
        padding: "8px 12px",
        boxShadow: "0 2px 16px rgba(15,23,42,0.1)",
        border: "1px solid #e2e8f0",
        whiteSpace: "nowrap",
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          marginRight: 4,
          letterSpacing: "0.06em",
          textTransform: "uppercase"
        }}>
          Filter:
        </span>

        {["all", "harassment", "theft", "assault", "suspicious"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              border: "1.5px solid",
              borderColor: filter === cat ? "#2563eb" : "#e2e8f0",
              background: filter === cat ? "#eff6ff" : "#fff",
              color: filter === cat ? "#2563eb" : "#94a3b8",
            }}
          >
            {cat}
          </button>
        ))}

        <button
          onClick={locateMe}
          style={{
            marginLeft: 4,
            padding: "5px 12px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            background: "#f0fdf4",
            color: "#059669",
            border: "1.5px solid #bbf7d0",
          }}
        >
          📍 Find me
        </button>
      </div>

      {/* Live alerts */}
      <div style={{
        position: "absolute",
        top: 64,
        right: 12,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}>
        {liveAlerts.map((alert, i) => (
          <div key={i} style={{
            background: "#fff",
            border: "1.5px solid #fecaca",
            borderRadius: 12,
            padding: "10px 14px",
            maxWidth: 260,
            boxShadow: "0 4px 16px rgba(239,68,68,0.12)",
            fontSize: 12,
            fontWeight: 600,
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span className="live-dot" />
            <span><strong>Live:</strong> {alert.category} reported nearby</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute",
        bottom: 24,
        left: 12,
        zIndex: 10,
        background: "#ffffff",
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 2px 16px rgba(15,23,42,0.1)",
        border: "1px solid #e2e8f0",
        minWidth: 160,
      }}>
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          marginBottom: 10
        }}>
          Safety Score
        </p>

        {[{ color: "#22c55e", label: "Safe (61–100)" },
          { color: "#f59e0b", label: "Moderate (31–60)" },
          { color: "#ef4444", label: "Unsafe (0–30)" }]
          .map(({ color, label }) => (
            <div key={label} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 11, color: "#475569" }}>{label}</span>
            </div>
        ))}

        <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 10, paddingTop: 10 }}>
          {Object.entries(CAT_COLOR).map(([cat, color]) => (
            <div key={cat} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 11, color: "#64748b" }}>{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <MapContainer center={[13.0827, 80.2707]} zoom={12} style={{ width: "100%", height: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {userLocation && <FlyTo coords={userLocation} />}

        {filtered.map((report, i) => {
          if (!report.location?.coordinates) return null;
          const [lng, lat] = report.location.coordinates;
          if (!lat || !lng) return null;

          return (
            <CircleMarker key={i} center={[lat, lng]} radius={6} pathOptions={{ color: CAT_COLOR[report.category] }}>
              <Popup>{report.category}</Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}