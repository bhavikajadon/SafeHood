import { useState } from "react";
import axios from "axios";

function formatDistance(meters) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDuration(seconds) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

export default function SafeRoutePlanner({
  city = "Chennai",
  onResults,
  selectedRouteIndex = 0,
  onSelectRoute,
}) {
  const [destination, setDestination] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const destinationText = destination.trim();
    if (destinationText.length < 2) {
      setError("Enter a destination to compare routes.");
      return;
    }
    if (!navigator.geolocation) {
      setError("This browser does not support location access. Try a location-enabled browser.");
      return;
    }

    setLoading(true);
    setError("");
    setPlan(null);
    onResults?.(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 60000,
        });
      });

      const response = await axios.post("/api/routes/safest", {
        origin: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        destination: destinationText,
        city,
      });

      setPlan(response.data);
      onResults?.(response.data);
      onSelectRoute?.(0);
    } catch (requestError) {
      const message = requestError.code === 1
        ? "Location permission was denied. Allow location access in your browser and try again."
        : requestError.code === 3
          ? "Your location took too long to load. Try again."
          : requestError.response?.data?.message || "Unable to compare routes right now. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function clearPlan() {
    setPlan(null);
    setError("");
    onResults?.(null);
    onSelectRoute?.(0);
  }

  return (
    <section className="route-planner" aria-label="Lower reported-risk route planner">
      <div className="route-planner-heading">
        <div>
          <div className="route-planner-eyebrow">PLAN A JOURNEY</div>
          <h3>Find a lower-reported-risk route</h3>
          <p>Compare road options using the community signals currently available in SafeHood.</p>
        </div>
        <span className="route-planner-icon" aria-hidden="true">↗</span>
      </div>

      <form className="route-planner-form" onSubmit={handleSubmit}>
        <div className="route-origin-summary">
          <span className="route-field-label">FROM</span>
          <span className="route-origin-value"><span className="route-origin-dot" /> Your current location</span>
          <span className="route-origin-hint">GPS permission required</span>
        </div>
        <label className="route-destination-field">
          <span className="route-field-label">TO</span>
          <input
            type="text"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="Enter a place or address in your area"
            maxLength={160}
            required
          />
        </label>
        <button className="route-submit-button" type="submit" disabled={loading}>
          {loading ? "Comparing routes…" : "Compare routes"}
          <span aria-hidden="true">→</span>
        </button>
      </form>

      {error && <div className="route-error" role="alert">{error}</div>}

      {plan && (
        <div className="route-plan-results" aria-live="polite">
          <div className="route-results-heading">
            <div>
              <span className="route-field-label">DESTINATION FOUND</span>
              <strong>{plan.destination}</strong>
              <span className="route-results-count">{plan.routeCount} road option{plan.routeCount === 1 ? "" : "s"} returned</span>
            </div>
            <button type="button" className="route-clear-button" onClick={clearPlan}>Clear route</button>
          </div>

          {!plan.signalDataAvailable && (
            <p className="route-no-signals">No community reports or safety zones were available for comparison. Options are ordered by travel time only.</p>
          )}

          <div className="route-option-list">
            {plan.routes.map((route, index) => (
              <button
                type="button"
                key={route.id}
                className={selectedRouteIndex === index ? "route-option selected" : "route-option"}
                onClick={() => onSelectRoute?.(index)}
                aria-pressed={selectedRouteIndex === index}
              >
                <span className="route-option-rank">{index + 1}</span>
                <span className="route-option-copy">
                  <strong>{index === 0 ? "Lowest nearby-signal exposure" : `Alternative route ${index + 1}`}</strong>
                  <span>{formatDistance(route.distanceMeters)} · {formatDuration(route.durationSeconds)}</span>
                  <span>{route.nearbyReports} nearby report{route.nearbyReports === 1 ? "" : "s"} · {route.nearbyCautionZones} lower-scored zone{route.nearbyCautionZones === 1 ? "" : "s"}</span>
                </span>
                <span className="route-option-radio" aria-hidden="true">{selectedRouteIndex === index ? "✓" : ""}</span>
              </button>
            ))}
          </div>

          <p className="route-disclaimer">
            This is a relative comparison of available map signals, not a safety guarantee. Reports may be incomplete or illustrative; the route does not account for unreported incidents, lighting, live conditions or road closures. Check local information and use your judgement.
          </p>
          <p className="route-attribution">{plan.attribution}</p>
        </div>
      )}
    </section>
  );
}
