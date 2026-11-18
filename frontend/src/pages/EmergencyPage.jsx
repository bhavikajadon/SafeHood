import { useState } from "react";

const HELPLINES = [
  { name: "National Emergency", number: "112", detail: "Police, fire and medical emergency", primary: true },
  { name: "Police", number: "100", detail: "Police assistance" },
  { name: "Ambulance", number: "108", detail: "Medical emergency response" },
  { name: "Women Helpline", number: "181", detail: "Women in distress" },
  { name: "Child Helpline", number: "1098", detail: "Children in need of care and protection" },
  { name: "Cyber Crime Helpline", number: "1930", detail: "Report cyber financial fraud" },
  { name: "Fire", number: "101", detail: "Fire and rescue services" },
];

const TIPS = [
  "Move towards a well-lit, populated place if you feel unsafe.",
  "Tell someone you trust where you are going and when you expect to arrive.",
  "Before entering a cab or auto, verify the vehicle and share the ride details.",
  "Keep your phone charged and emergency contacts easy to reach.",
];

export default function EmergencyPage() {
  const [locationMessage, setLocationMessage] = useState("");
  const [sharing, setSharing] = useState(false);

  async function shareLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location sharing is not supported by this browser.");
      return;
    }

    setSharing(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const url = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;

      try {
        if (navigator.share) {
          await navigator.share({
            title: "My current location",
            text: "Here is my current location.",
            url,
          });
          setLocationMessage("Location share sheet opened.");
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          setLocationMessage("Location link copied. Send it to someone you trust.");
        } else {
          setLocationMessage("Your location link is ready: " + url);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setLocationMessage("Could not share your location. Please try again.");
        }
      } finally {
        setSharing(false);
      }
    }, () => {
      setSharing(false);
      setLocationMessage("Location permission was not granted. You can still call an emergency number above.");
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  }

  return <main className="emergency-page">
    <div className="emergency-container">
      <section className="emergency-hero">
        <div className="emergency-hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot emergency-dot"/> HELP WHEN IT MATTERS</span>
          <h1>You're not<br/><em>on your own.</em></h1>
          <p>Keep essential emergency contacts close. Choose a number below to call directly from your device.</p>
          <a className="emergency-primary-call" href="tel:112"><span className="call-icon">↗</span><span><small>INDIA NATIONAL EMERGENCY</small><strong>Call 112</strong></span></a>
        </div>
        <div className="emergency-hero-art" aria-hidden="true"><div className="emergency-ring ring-a"/><div className="emergency-ring ring-b"/><div className="emergency-shield"><svg viewBox="0 0 160 180"><path d="M80 10 139 32v48c0 43-25 72-59 88C46 152 21 123 21 80V32L80 10Z" fill="#edf2e9" stroke="#5c7a60" strokeWidth="3"/><path d="M80 49v43M80 117v2" stroke="#5c7a60" strokeWidth="8" strokeLinecap="round"/></svg></div><span className="emergency-art-caption">Pause. Breathe. Reach out.</span></div>
      </section>

      <section className="emergency-section">
        <div className="emergency-heading"><div><span className="eyebrow muted-eyebrow">SAVE THESE NUMBERS</span><h2>Emergency contacts<span>.</span></h2><p>Tap a contact to start a phone call.</p></div><span className="emergency-badge">India</span></div>
        <div className="helpline-grid">
          {HELPLINES.map((item) => <a className={item.primary ? "helpline-card primary" : "helpline-card"} href={`tel:${item.number}`} key={item.number}>
            <span className="helpline-symbol">{item.primary ? "!" : "↗"}</span>
            <span className="helpline-content"><strong>{item.name}</strong><small>{item.detail}</small></span>
            <span className="helpline-number">{item.number}</span>
          </a>)}
        </div>
        <p className="emergency-note">Emergency numbers can vary by service area. For an immediate threat to life or safety in India, try 112.</p>
      </section>

      <section className="share-location-card">
        <div className="share-location-icon">⌖</div>
        <div className="share-location-copy"><span className="eyebrow muted-eyebrow">LET SOMEONE KNOW WHERE YOU ARE</span><h3>Share your current location.</h3><p>Open your device's share sheet or copy a map link to send to a trusted contact.</p>{locationMessage&&<p className="location-feedback" role="status">{locationMessage}</p>}</div>
        <button className="button button-primary share-location-button" onClick={shareLocation} disabled={sharing}>{sharing?"Getting location…":"Share location"} <span>↗</span></button>
      </section>

      <section className="safety-tips-section">
        <span className="eyebrow muted-eyebrow">A FEW THINGS TO REMEMBER</span><h2>Small steps. More awareness.</h2>
        <div className="safety-tips-grid">{TIPS.map((tip,index)=><div className="safety-tip" key={tip}><span>0{index+1}</span><p>{tip}</p></div>)}</div>
      </section>
      <p className="emergency-disclaimer">SafeHood is an awareness and community information tool. It is not an emergency response service and does not replace official authorities.</p>
    </div>
  </main>;
}