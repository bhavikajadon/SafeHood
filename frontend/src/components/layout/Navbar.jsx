import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Explore map", icon: "⌖" },
  { to: "/report", label: "Report", icon: "＋" },
  { to: "/forum", label: "Community", icon: "◌" },
];

function Brand() {
  return <Link to="/" className="brand" aria-label="SafeHood home">
    <span className="brand-mark"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 27 7.5v8.2c0 6.9-4.7 11.4-11 13.3C9.7 27.1 5 22.6 5 15.7V7.5L16 3Z" fill="currentColor" opacity=".17"/><path d="M16 3 27 7.5v8.2c0 6.9-4.7 11.4-11 13.3C9.7 27.1 5 22.6 5 15.7V7.5L16 3Z" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="m11.7 15.8 2.8 2.8 5.9-6.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
    <span className="brand-name">safehood<span>.</span></span>
  </Link>;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return <header className="topbar">
    <div className="topbar-inner">
      <Brand />
      <nav className="main-nav" aria-label="Main navigation">
        {NAV_LINKS.map(({to,label,icon}) => <Link key={to} to={to} className={location.pathname === to ? "nav-link active" : "nav-link"}><span>{icon}</span>{label}</Link>)}
      </nav>
      <div className="nav-actions">
        <Link to="/emergency" className="emergency-nav"><span className="emergency-pulse" />Emergency</Link>
        {user ? <>
          <Link to="/profile" className="profile-chip"><span className="avatar">{user.name?.[0]?.toUpperCase() || "U"}</span><span className="profile-name">{user.name?.split(" ")[0] || "Account"}</span></Link>
          <button className="nav-login" onClick={() => { logout(); navigate("/"); }}>Sign out</button>
        </> : <Link to="/login" className="nav-login">Log in <span>↗</span></Link>}
      </div>
    </div>
  </header>;
}