import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  { value: "harassment", label: "Harassment",          emoji: "⚠️",  desc: "Verbal abuse, stalking, eve-teasing",  accent: "#f97316", bg: "#fff7ed" },
  { value: "theft",      label: "Theft / Robbery",     emoji: "🔓",  desc: "Chain snatching, pickpocketing",       accent: "#eab308", bg: "#fefce8" },
  { value: "assault",    label: "Assault",             emoji: "🚨",  desc: "Physical violence or attack",          accent: "#ef4444", bg: "#fef2f2" },
  { value: "suspicious", label: "Suspicious Activity", emoji: "👁️", desc: "Unusual or threatening behaviour",     accent: "#8b5cf6", bg: "#faf5ff" },
  { value: "other",      label: "Other Safety Issue",  emoji: "📍",  desc: "Unsafe roads, lighting, etc.",         accent: "#64748b", bg: "#f8fafc" },
];

export default function ReportPage() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState({
    category: "", description: "", address: "",
    coordinates: null, isAnonymous: false,
    city: user?.city || "Chennai",
  });
  const [locLoading, setLocLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState("");

  function getLocation() {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((f) => ({ ...f, coordinates: [coords.longitude, coords.latitude] }));
        setLocLoading(false);
      },
      () => { setError("Could not get location. Please allow access."); setLocLoading(false); }
    );
  }

  async function handleSubmit() {
    if (!form.coordinates) return setError("Please detect your location first.");
    setSubmitting(true); setError("");
    try {
      await axios.post("/api/reports", form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit");
    } finally { setSubmitting(false); }
  }

  if (done) return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div className="fade-in" style={{ textAlign: "center", maxWidth: 360, padding: 20 }}>
        <div style={{ fontSize: 64, marginBottom: 20, filter: "drop-shadow(0 4px 12px rgba(16,185,129,0.3))" }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Report Submitted!</h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28 }}>Thank you for helping keep your community safe.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => navigate("/")} className="btn-primary">View on Map</button>
          <button onClick={() => { setDone(false); setStep(1); setForm({ ...form, category: "", description: "", coordinates: null }); }} className="btn-secondary">
            Report Another
          </button>
        </div>
      </div>
    </div>
  );

  const selCat = CATEGORIES.find(c => c.value === form.category);

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: "#f8fafc", padding: "40px 20px" }}>
      <div className="fade-in" style={{ maxWidth: 540, margin: "0 auto" }}>

        <h1 className="page-title">Report an Incident</h1>
        <p className="page-subtitle">Help keep your community informed and safe.</p>

        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          {["What happened?", "Where?", "Confirm"].map((label, idx) => {
            const s = idx + 1;
            const isActive = s === step;
            const isDone   = s < step;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    background: isDone ? "#10b981" : isActive ? "#2563eb" : "#e2e8f0",
                    color:      (isDone || isActive) ? "#fff" : "#94a3b8",
                    boxShadow:  isActive ? "0 0 0 4px rgba(37,99,235,0.15)" : "none",
                    transition: "all 0.3s",
                  }}>
                    {isDone ? "✓" : s}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? "#1e293b" : "#94a3b8", whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                </div>
                {s < 3 && (
                  <div style={{
                    flex: 1, height: 2, margin: "0 8px", marginBottom: 20,
                    background: isDone ? "#10b981" : "#e2e8f0",
                    transition: "background 0.3s",
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#dc2626" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="slide-up">
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 18 }}>What type of incident?</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CATEGORIES.map((cat) => (
                  <button key={cat.value}
                    onClick={() => { setForm({ ...form, category: cat.value }); setStep(2); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0",
                      background: "#fff", cursor: "pointer", textAlign: "left",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = cat.accent; e.currentTarget.style.background = cat.bg; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fff"; }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: `1px solid ${cat.accent}20` }}>
                      {cat.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>{cat.label}</p>
                      <p style={{ fontSize: 12, color: "#94a3b8" }}>{cat.desc}</p>
                    </div>
                    <span style={{ color: "#cbd5e1", fontSize: 16 }}>›</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="slide-up">
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Where did it happen?</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <button onClick={getLocation} disabled={locLoading} style={{
                  padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                  border: form.coordinates ? "1.5px solid #10b981" : "1.5px dashed #93c5fd",
                  background: form.coordinates ? "#f0fdf4" : "#eff6ff",
                  color: form.coordinates ? "#065f46" : "#1d4ed8",
                  fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  {locLoading ? "📡 Detecting location…" : form.coordinates ? "✅ Location captured" : "📍 Detect my current location"}
                </button>

                <div>
                  <label className="label">Address / Landmark (optional)</label>
                  <input type="text" className="input-field" value={form.address}
                    placeholder="e.g. Near Anna Nagar bus stop"
                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>

                <div>
                  <label className="label">Description (optional)</label>
                  <textarea className="input-field" rows={3} maxLength={500}
                    placeholder="Briefly describe what happened…"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={{ resize: "none" }} />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                  <div className={`toggle-track ${form.isAnonymous ? "on" : ""}`}
                    onClick={() => setForm({ ...form, isAnonymous: !form.isAnonymous })}>
                    <div className="toggle-thumb" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Submit anonymously</p>
                    <p style={{ fontSize: 11, color: "#94a3b8" }}>Your name won't appear on the map</p>
                  </div>
                </label>

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>← Back</button>
                  <button onClick={() => { if (!form.coordinates) return setError("Location required"); setError(""); setStep(3); }}
                    className="btn-primary" style={{ flex: 1 }}>
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="slide-up">
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Confirm your report</h2>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 18px", marginBottom: 18, border: "1px solid #e2e8f0" }}>
                {selCat && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: selCat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `1px solid ${selCat.accent}20` }}>
                      {selCat.emoji}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{selCat.label}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>Incident category</p>
                    </div>
                  </div>
                )}
                {[
                  ["📍 Location", form.address || "GPS coordinates captured"],
                  ["👤 Anonymous", form.isAnonymous ? "Yes — name hidden" : "No — name visible"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                    <span style={{ color: "#64748b" }}>{k}</span>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>{v}</span>
                  </div>
                ))}
                {form.description && (
                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, marginTop: 4 }}>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Description</p>
                    <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{form.description}</p>
                  </div>
                )}
              </div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 12, color: "#92400e" }}>
                ⚠️ Only submit real incidents. False reports weaken community trust.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1 }}>← Back</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-danger" style={{ flex: 1 }}>
                  {submitting ? "Submitting…" : "🚨 Submit Report"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}