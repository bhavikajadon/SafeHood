export default function EmergencyPage() {
  const HELPLINES = [
    { name: "Police",             number: "100",  emoji: "🚔", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    { name: "Ambulance",          number: "108",  emoji: "🚑", color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
    { name: "Women Helpline",     number: "1091", emoji: "🛡️", color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
    { name: "National Emergency", number: "112",  emoji: "📞", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    { name: "Domestic Violence",  number: "181",  emoji: "🤝", color: "#e11d48", bg: "#fff1f2", border: "#fecdd3" },
    { name: "Child Helpline",     number: "1098", emoji: "🧒", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    { name: "Cyber Crime",        number: "1930", emoji: "💻", color: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe" },
    { name: "Fire",               number: "101",  emoji: "🔥", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  ];

  const TIPS = [
    { icon: "🌙", text: "Share your live location with a trusted contact when traveling alone at night" },
    { icon: "🚗", text: "Note the registration number of autos and cabs before boarding" },
    { icon: "📱", text: "Keep emergency numbers saved in your phone" },
    { icon: "🧠", text: "Trust your instincts — if something feels wrong, move to a crowded place" },
    { icon: "💡", text: "Walk in well-lit, populated areas and avoid shortcuts through dark alleys" },
    { icon: "🔋", text: "Keep your phone charged when going out" },
    { icon: "📢", text: "Inform someone where you are going and your expected arrival time" },
  ];

  function shareLocation() {
    if (!navigator.geolocation) return alert("Location not supported");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const url = `https://maps.google.com?q=${coords.latitude},${coords.longitude}`;
      if (navigator.share) {
        navigator.share({ title: "My Location — SafeHood", url });
      } else {
        navigator.clipboard.writeText(url);
        alert("Location link copied! Share it with your contact.");
      }
    });
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "calc(100vh - 60px)", padding: "40px 20px" }}>
      <div className="fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Hero banner */}
        <div style={{
          background:   "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
          borderRadius: 20,
          padding:      "28px 32px",
          marginBottom: 36,
          position:     "relative",
          overflow:     "hidden",
          boxShadow:    "0 8px 32px rgba(37,99,235,0.25)",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -20, right: 60, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 32, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}>🚨</span>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>Emergency Help</h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>One-tap calling to all major emergency services</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              {["100 Police", "108 Ambulance", "112 Emergency"].map((item) => (
                <span key={item} style={{
                  background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.2)", borderRadius: 99,
                  padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "#fff",
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Helplines grid */}
        <p className="section-label">Emergency Numbers</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 36 }}>
          {HELPLINES.map((h) => (
            <a key={h.number} href={`tel:${h.number}`}
              style={{ textDecoration: "none", display: "block" }}>
              <div className="card card-hover" style={{ padding: "16px 18px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                    background: h.bg, border: `1px solid ${h.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                  }}>
                    {h.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: h.color, fontFamily: "monospace", lineHeight: 1 }}>
                      {h.number}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginTop: 3 }}>{h.name}</p>
                  </div>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: h.bg, border: `1px solid ${h.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, color: h.color, fontWeight: 700, flexShrink: 0,
                  }}>
                    ↗
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Safety Tips */}
        <p className="section-label">Safety Tips</p>
        <div className="card" style={{ marginBottom: 24, overflow: "hidden" }}>
          {TIPS.map((tip, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "14px 20px",
              borderBottom: i < TIPS.length - 1 ? "1px solid #f1f5f9" : "none",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "#eff6ff", border: "1px solid #bfdbfe",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0, marginTop: 1,
              }}>
                {tip.icon}
              </div>
              <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, paddingTop: 5 }}>{tip.text}</p>
            </div>
          ))}
        </div>

        {/* Share location */}
        <div style={{
          background: "linear-gradient(135deg, #fef2f2, #fff1f2)",
          border: "1px solid #fecaca",
          borderRadius: 16,
          padding: "22px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>📍 Share Your Location</h3>
            <p style={{ fontSize: 13, color: "#b91c1c", maxWidth: 360, lineHeight: 1.5 }}>
              If you feel unsafe, share your live location with a trusted contact immediately.
            </p>
          </div>
          <button onClick={shareLocation} className="btn-danger" style={{ flexShrink: 0 }}>
            Share Now →
          </button>
        </div>
      </div>
    </div>
  );
}