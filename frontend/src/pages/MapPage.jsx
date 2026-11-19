import { useState } from "react";
import { Link } from "react-router-dom";
import SafetyMap from "../components/map/SafetyMap";
import SafeRoutePlanner from "../components/map/SafeRoutePlanner";
import { useAuth } from "../context/AuthContext";

const quickStats = [
  { value: "01", label: "Know your surroundings", icon: "⌖" },
  { value: "02", label: "Stay informed together", icon: "◌" },
  { value: "03", label: "Get help when it matters", icon: "＋" },
];

export default function MapPage() {
  const { user } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [routePlan, setRoutePlan] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const city = user?.city || "Chennai";

  return <main className="dashboard-page">
    <section className="welcome-strip">
      <div className="welcome-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> COMMUNITY SAFETY, MADE VISIBLE</div>
        <h1>A little more aware.<br/><em>A lot more empowered.</em></h1>
        <p>Understand your neighbourhood, share what you notice, and make safer decisions together.</p>
        <div className="welcome-actions">
          <Link to="/report" className="button button-primary">Share a safety update <span>↗</span></Link>
          <Link to="/emergency" className="button button-soft">Get emergency help <span>→</span></Link>
        </div>
      </div>
      <div className="welcome-art" aria-hidden="true">
        <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
        <div className="art-disc"><svg viewBox="0 0 220 220"><path d="M110 24 184 54v53c0 48-31 78-74 91-43-13-74-43-74-91V54l74-30Z" fill="#e5eee5" stroke="#58745f" strokeWidth="2"/><path d="M77 111 99 133l48-51" fill="none" stroke="#58745f" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="167" cy="62" r="9" fill="#e59a65"/><circle cx="54" cy="151" r="6" fill="#e59a65"/></svg></div>
        <div className="art-note note-top"><span>✳</span> Look out for each other</div>
        <div className="art-note note-bottom"><span className="green-mini-dot"/> Your community, connected</div>
      </div>
    </section>

    <section className="principles-row" aria-label="SafeHood principles">
      {quickStats.map((s)=><div className="principle" key={s.value}><span className="principle-number">{s.value}</span><span className="principle-icon">{s.icon}</span><span>{s.label}</span></div>)}
    </section>

    <section className="map-section">
      <div className="section-heading">
        <div><div className="eyebrow muted-eyebrow">YOUR LOCAL PICTURE</div><h2>Explore your area<span className="heading-period">.</span></h2><p>Community-submitted reports and clearly labelled illustrative map fixtures.</p></div>
        <div className="map-heading-right"><span className="city-pill"><span>⌖</span>{city}</span><span className="map-live"><span className="green-mini-dot"/> Live updates</span></div>
      </div>
      <div className="map-frame">
        <SafeRoutePlanner
          city={city}
          onResults={(result) => { setRoutePlan(result); setSelectedRouteIndex(0); }}
          selectedRouteIndex={selectedRouteIndex}
          onSelectRoute={setSelectedRouteIndex}
        />
        <SafetyMap city={city} routePlan={routePlan} selectedRouteIndex={selectedRouteIndex}/>
      </div>
      <div className="map-disclaimer">Map items may include illustrative demo fixtures and community-submitted reports. Scores are not official safety ratings or guarantees. Verify information independently and contact local emergency services when needed.</div>
    </section>

    {showIntro && <section className="community-banner">
      <div className="community-symbol">✳</div>
      <div><span className="eyebrow muted-eyebrow">STRONGER, TOGETHER</span><h3>Safety starts with looking out for one another.</h3><p>Share a useful observation or learn from people in your area.</p></div>
      <div className="community-cta"><Link to="/forum" className="text-link">Visit the community <span>→</span></Link><button className="dismiss-button" onClick={()=>setShowIntro(false)} aria-label="Dismiss message">×</button></div>
    </section>}
    <footer className="site-footer"><span className="brand-name">safehood<span>.</span></span><span>Built around people. Powered by awareness.</span><Link to="/emergency">Emergency resources ↗</Link></footer>
  </main>;
}
