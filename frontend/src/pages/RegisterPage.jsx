import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CITIES = ["Chennai", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"];

export default function RegisterPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ name: "", email: "", password: "", city: "Chennai" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/register", form);
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight:      "calc(100vh - 60px)",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "20px",
      background:     "linear-gradient(160deg, #eff6ff 0%, #f8fafc 50%, #ecfdf5 100%)",
    }}>
      <div className="fade-in" style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 4px 20px rgba(6,182,212,0.3)",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white"/>
              <path d="M12 8v4l3 3" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Join SafeHood</h1>
          <p style={{ fontSize: 14, color: "#64748b" }}>Help keep your community safe</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 10, padding: "10px 14px", marginBottom: 20,
              fontSize: 13, color: "#dc2626",
            }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {[
              { label: "Full Name",  field: "name",     type: "text",     placeholder: "Priya Sharma" },
              { label: "Email",      field: "email",    type: "email",    placeholder: "you@example.com" },
              { label: "Password",   field: "password", type: "password", placeholder: "Min 6 characters" },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field} style={{ marginBottom: 18 }}>
                <label className="label">{label}</label>
                <input
                  type={type} className="input-field"
                  value={form[field]} placeholder={placeholder} required
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              </div>
            ))}
            <div style={{ marginBottom: 24 }}>
              <label className="label">Your City</label>
              <select
                className="input-field"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              >
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "12px 20px" }}>
              {loading ? "Creating account…" : "Create account →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 20 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}