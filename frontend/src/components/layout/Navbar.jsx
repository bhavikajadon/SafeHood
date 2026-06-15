import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { to: "/",          label: "Map",       icon: "🗺️"  },
  { to: "/report",    label: "Report",    icon: "📝"  },
  { to: "/forum",     label: "Forum",     icon: "💬"  },
  { to: "/emergency", label: "Emergency", icon: null, isEmergency: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <nav style={{
      background:   "#ffffff",
      borderBottom: "1px solid #e2e8f0",
      position:     "sticky",
      top:          0,
      zIndex:       50,
      boxShadow:    "0 1px 4px rgba(15,23,42,0.06)",
    }}>
      <div style={{
        maxWidth:       960,
        margin:         "0 auto",
        padding:        "0 20px",
        height:         60,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            16,
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width:          36,
            height:         36,
            borderRadius:   10,
            background:     "linear-gradient(135deg, #3b82f6, #2563eb)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            boxShadow:      "0 2px 8px rgba(37,99,235,0.3)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white" fillOpacity="0.9"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", letterSpacing: "-0.3px" }}>
            Safe<span style={{ color: "#2563eb" }}>Hood</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {NAV_LINKS.map(({ to, label, icon, isEmergency }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            6,
                  padding:        "6px 12px",
                  borderRadius:   8,
                  fontSize:       13,
                  fontWeight:     active ? 700 : 500,
                  textDecoration: "none",
                  transition:     "all 0.15s",
                  color:          isEmergency ? "#dc2626" : active ? "#2563eb" : "#475569",
                  background:     isEmergency
                    ? "rgba(239,68,68,0.07)"
                    : active
                    ? "#eff6ff"
                    : "transparent",
                  border:         isEmergency
                    ? "1px solid rgba(239,68,68,0.2)"
                    : active
                    ? "1px solid #bfdbfe"
                    : "1px solid transparent",
                }}
              >
                {isEmergency ? (
                  <>
                    <span className="live-dot" />
                    {label}
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 14 }}>{icon}</span>
                    {label}
                  </>
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {user ? (
            <>
              <Link
                to="/profile"
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            8,
                  padding:        "6px 12px 6px 6px",
                  borderRadius:   8,
                  border:         "1px solid #e2e8f0",
                  background:     "#f8fafc",
                  textDecoration: "none",
                  fontSize:       13,
                  fontWeight:     600,
                  color:          "#334155",
                  transition:     "all 0.15s",
                }}
              >
                <div style={{
                  width:          28,
                  height:         28,
                  borderRadius:   7,
                  background:     "linear-gradient(135deg, #3b82f6, #06b6d4)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       12,
                  fontWeight:     800,
                  color:          "white",
                }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                {user.name?.split(" ")[0]}
              </Link>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                style={{
                  background: "transparent",
                  border:     "1px solid #fee2e2",
                  color:      "#dc2626",
                  fontSize:   12,
                  fontWeight: 600,
                  padding:    "6px 12px",
                  borderRadius: 8,
                  cursor:     "pointer",
                  transition: "all 0.15s",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: "none", fontSize: 13, fontWeight: 600, color: "#475569", padding: "6px 12px" }}>
                Login
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}