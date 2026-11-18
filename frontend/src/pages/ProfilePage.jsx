import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const quickLinks = [
    { label: "Submit a report",    to: "/report",    emoji: "📝", desc: "Report a safety incident in your area",  color: "#55745b", bg: "#edf2e9" },
    { label: "View the safety map",to: "/",          emoji: "🗺️", desc: "Browse your city's live safety heatmap", color: "#55745b", bg: "#edf2e9" },
    { label: "Community forum",    to: "/forum",     emoji: "💬", desc: "Tips & warnings from your neighbours",   color: "#7c3aed", bg: "#faf5ff" },
    { label: "Emergency contacts", to: "/emergency", emoji: "🚨", desc: "One-tap helpline numbers",               color: "#dc2626", bg: "#fef2f2" },
  ];

  return (
    <div style={{ background: "#fafbf8", minHeight: "calc(100vh - 60px)", padding: "40px 20px" }}>
      <div className="fade-in" style={{ maxWidth: 520, margin: "0 auto" }}>

        <h1 className="page-title" style={{ marginBottom: 24 }}>My Profile</h1>

        {/* Profile card */}
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22, paddingBottom: 22, borderBottom: "1px solid #edf1eb" }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: "linear-gradient(135deg, #67816a, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 800, color: "#fff",
              boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
              flexShrink: 0,
            }}>
              {user?.name?.[0]}
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#202a22", marginBottom: 2 }}>{user?.name}</p>
              <p style={{ fontSize: 13, color: "#738074", fontFamily: "monospace" }}>{user?.email}</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "City",  value: user?.city || "Chennai", icon: "🏙️" },
              { label: "Role",  value: user?.role || "user",    icon: "👤" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#fafbf8", borderRadius: 10, padding: "11px 14px",
                border: "1px solid #e5e9e1",
              }}>
                <span style={{ fontSize: 13, color: "#738074" }}>{icon} {label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#2b382d", textTransform: "capitalize" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Quick Links</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quickLinks.map(({ label, to, emoji, desc, color, bg }) => (
              <button key={to} onClick={() => navigate(to)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", borderRadius: 12, border: "1px solid #edf1eb",
                  background: "#fff", cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s", width: "100%",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = color + "30"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#edf1eb"; }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  {emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#2b382d", marginBottom: 1 }}>{label}</p>
                  <p style={{ fontSize: 11, color: "#98a597" }}>{desc}</p>
                </div>
                <span style={{ color: "#cbd8c7", fontSize: 16 }}>›</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate("/login"); }}
          style={{
            width: "100%", padding: "13px", borderRadius: 12, cursor: "pointer",
            background: "#fff", border: "1.5px solid #fecaca",
            color: "#dc2626", fontSize: 14, fontWeight: 700,
            transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
        >
          🚪 Log out
        </button>
      </div>
    </div>
  );
}