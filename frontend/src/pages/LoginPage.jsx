import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function ShieldMark() {
  return <span className="auth-mark"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 27 7.5v8.2c0 6.9-4.7 11.4-11 13.3C9.7 27.1 5 22.6 5 15.7V7.5L16 3Z" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="m10.8 15.5 3.5 3.5 7-7.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form,setForm] = useState({email:"",password:""});
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const {data} = await axios.post("/api/auth/login",form);
      login(data.user,data.token);
      navigate("/");
    } catch(err) {
      setError(err.response?.data?.message || "We couldn't sign you in. Please check your details and try again.");
    } finally { setLoading(false); }
  }

  return <main className="auth-page">
    <div className="auth-aside">
      <div className="auth-aside-content"><span className="eyebrow"><span className="eyebrow-dot"/> AWARENESS BUILDS SAFER COMMUNITIES</span><h1>Look out for<br/><em>one another.</em></h1><p>Local insight can make a meaningful difference. Join a community that shares information and looks out for its neighbourhood.</p><div className="auth-aside-foot"><span className="auth-aside-star">✳</span><span>People first. Always.</span></div></div>
      <div className="auth-aside-orbit"/>
    </div>
    <section className="auth-content">
      <div className="auth-card-wrap"><Link to="/" className="auth-back">← Back to SafeHood</Link><div className="auth-card">
        <ShieldMark/><span className="eyebrow muted-eyebrow">YOUR COMMUNITY IS HERE</span><h2>Welcome back.</h2><p className="auth-description">Sign in to continue to your SafeHood space.</p>
        {error&&<div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="email" className="input-field auth-input" value={form.email} placeholder="you@example.com" required onChange={e=>setForm({...form,email:e.target.value})}/>
          <label className="auth-label" htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="current-password" className="input-field auth-input" value={form.password} placeholder="Enter your password" required onChange={e=>setForm({...form,password:e.target.value})}/>
          <button type="submit" disabled={loading} className="button button-primary auth-submit">{loading?"Signing in…":"Sign in"} <span>→</span></button>
        </form>
        <p className="auth-switch">New to SafeHood? <Link to="/register">Create an account</Link></p>
      </div><p className="auth-footnote">Your neighbourhood. Your voice. Your SafeHood.</p></div>
    </section>
  </main>;
}