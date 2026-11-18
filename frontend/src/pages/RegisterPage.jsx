import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CITIES = ["Chennai","Mumbai","Delhi","Bangalore","Hyderabad","Pune"];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form,setForm] = useState({name:"",email:"",password:"",city:"Chennai"});
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    if(form.password.length<6){setError("Password must be at least 6 characters.");return;}
    setLoading(true);
    try {
      const {data} = await axios.post("/api/auth/register",form);
      login(data.user,data.token);
      navigate("/");
    } catch(err) {
      setError(err.response?.data?.message || "We couldn't create your account. Please try again.");
    } finally { setLoading(false); }
  }

  return <main className="auth-page">
    <div className="auth-aside">
      <div className="auth-aside-content"><span className="eyebrow"><span className="eyebrow-dot"/> EVERY NEIGHBOURHOOD HAS A STORY</span><h1>Safer places<br/><em>start with us.</em></h1><p>Become part of a community that notices, shares and supports. A small update from you could help someone make a better-informed decision.</p><div className="auth-aside-foot"><span className="auth-aside-star">✳</span><span>Awareness is a shared effort.</span></div></div>
      <div className="auth-aside-orbit"/>
    </div>
    <section className="auth-content">
      <div className="auth-card-wrap"><Link to="/" className="auth-back">← Back to SafeHood</Link><div className="auth-card">
        <span className="auth-mark"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 27 7.5v8.2c0 6.9-4.7 11.4-11 13.3C9.7 27.1 5 22.6 5 15.7V7.5L16 3Z" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="m10.8 15.5 3.5 3.5 7-7.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
        <span className="eyebrow muted-eyebrow">A GOOD PLACE TO BEGIN</span><h2>Join your community.</h2><p className="auth-description">Create an account to share local updates and connect.</p>
        {error&&<div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="register-name">Full name</label><input id="register-name" type="text" autoComplete="name" className="input-field auth-input" value={form.name} placeholder="Your name" required onChange={e=>setForm({...form,name:e.target.value})}/>
          <label className="auth-label" htmlFor="register-email">Email address</label><input id="register-email" type="email" autoComplete="email" className="input-field auth-input" value={form.email} placeholder="you@example.com" required onChange={e=>setForm({...form,email:e.target.value})}/>
          <label className="auth-label" htmlFor="register-password">Password</label><input id="register-password" type="password" autoComplete="new-password" minLength={6} className="input-field auth-input" value={form.password} placeholder="At least 6 characters" required onChange={e=>setForm({...form,password:e.target.value})}/>
          <label className="auth-label" htmlFor="register-city">Your city</label><select id="register-city" className="input-field auth-input" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}>{CITIES.map(city=><option key={city} value={city}>{city}</option>)}</select>
          <button type="submit" disabled={loading} className="button button-primary auth-submit">{loading?"Creating account…":"Create account"} <span>→</span></button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div><p className="auth-footnote">Your neighbourhood. Your voice. Your SafeHood.</p></div>
    </section>
  </main>;
}