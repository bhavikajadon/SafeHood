import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "../utils/time";

const CAT_CONFIG = {
  warning:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca",  label: "⚠️ Warning"  },
  tip:      { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0",  label: "💡 Tip"      },
  question: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe",  label: "❓ Question" },
  general:  { bg: "#f8fafc", color: "#475569", border: "#e2e8f0",  label: "📢 General"  },
};

export default function ForumPage() {
  const { user }   = useAuth();
  const city       = user?.city || "Chennai";
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ content: "", category: "warning", isAnonymous: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    axios.get(`/api/forum?city=${city}`)
      .then((r) => setPosts(r.data.posts))
      .finally(() => setLoading(false));
  }, []);

  async function handlePost(e) {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSubmitting(true); setError("");
    try {
      const { data } = await axios.post("/api/forum", { ...form, city });
      setPosts((prev) => [data.post, ...prev]);
      setForm({ content: "", category: "warning", isAnonymous: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post");
    } finally { setSubmitting(false); }
  }

  async function upvote(id) {
    const { data } = await axios.patch(`/api/forum/${id}/upvote`);
    setPosts((prev) => prev.map((p) => p._id === id ? { ...p, upvotes: Array(data.upvotes).fill(null) } : p));
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "calc(100vh - 60px)", padding: "40px 20px" }}>
      <div className="fade-in" style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 className="page-title">Community Forum</h1>
            <p style={{ fontSize: 14, color: "#64748b" }}>
              <span style={{ color: "#2563eb", fontWeight: 700 }}>📍 {city}</span> — safety tips & warnings
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "#64748b" }}>
            <span className="blue-dot" />
            {posts.length} posts
          </div>
        </div>

        {/* Compose */}
        <div className="card" style={{ padding: 22, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span>✍️</span> Share with your community
          </h3>
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          )}
          <form onSubmit={handlePost}>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Share a safety tip or warning for your community…"
              rows={3} maxLength={500}
              className="input-field"
              style={{ resize: "none", marginBottom: 14 }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {/* Category pills */}
              <div style={{ display: "flex", gap: 6 }}>
                {Object.entries(CAT_CONFIG).map(([cat, cfg]) => (
                  <button key={cat} type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    style={{
                      padding: "5px 11px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                      cursor: "pointer", transition: "all 0.15s", border: "1.5px solid",
                      borderColor: form.category === cat ? cfg.color : "#e2e8f0",
                      background:  form.category === cat ? cfg.bg : "#fff",
                      color:       form.category === cat ? cfg.color : "#94a3b8",
                    }}>
                    {cfg.label}
                  </button>
                ))}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b", cursor: "pointer", marginLeft: "auto" }}>
                <div className={`toggle-track ${form.isAnonymous ? "on" : ""}`}
                  style={{ width: 34, height: 20 }}
                  onClick={() => setForm({ ...form, isAnonymous: !form.isAnonymous })}>
                  <div className="toggle-thumb" style={{ width: 14, height: 14, top: 2, left: 2 }} />
                </div>
                <span style={{ fontWeight: 600 }}>Anon</span>
              </label>
              <button type="submit" disabled={submitting || !form.content.trim()} className="btn-primary"
                style={{ padding: "8px 18px", fontSize: 13 }}>
                {submitting ? "Posting…" : "Post →"}
              </button>
            </div>
          </form>
        </div>

        {/* Posts */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
            <div className="blue-dot" style={{ margin: "0 auto 12px" }} />
            Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>💬</div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No posts yet</p>
            <p style={{ fontSize: 13 }}>Be the first to share a safety tip!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {posts.map((post, i) => {
              const cfg = CAT_CONFIG[post.category] || CAT_CONFIG.general;
              return (
                <div key={post._id} className="card card-hover"
                  style={{ padding: 20, animationDelay: `${i * 0.04}s` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: post.isAnonymous ? "#f1f5f9" : "linear-gradient(135deg, #dbeafe, #eff6ff)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 800, color: post.isAnonymous ? "#94a3b8" : "#2563eb",
                        border: "1px solid #e2e8f0",
                      }}>
                        {post.isAnonymous ? "?" : post.user?.name?.[0] || "?"}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                          {post.isAnonymous ? "Anonymous" : post.user?.name}
                        </p>
                        <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                          {formatDistanceToNow(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                      letterSpacing: "0.04em",
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{post.content}</p>
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => upvote(post._id)}
                      style={{
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        borderRadius: 8, padding: "4px 12px",
                        fontSize: 12, fontWeight: 600, color: "#64748b",
                        cursor: "pointer", transition: "all 0.15s",
                        display: "flex", alignItems: "center", gap: 5,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.color = "#2563eb"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
                    >
                      👍 {post.upvotes?.length || 0} helpful
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}