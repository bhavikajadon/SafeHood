const Report = require("../models/Report");
const SafetyZone = require("../models/SafetyZone");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";
const REQUEST_GAP_MS = 1100;
const CACHE_TTL_MS = 5 * 60 * 1000;

const geocodeCache = new Map();
const routeCache = new Map();
let geocodeQueue = Promise.resolve();
let routeQueue = Promise.resolve();
let lastGeocodeAt = 0;
let lastRouteAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function remember(cache, key, value) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  if (cache.size > 250) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

function readCache(cache, key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function geocodeDestination(destination, city) {
  const query = `${destination}, ${city}, India`;
  const key = query.toLowerCase();
  const cached = readCache(geocodeCache, key);
  if (cached) return Promise.resolve(cached);

  const task = geocodeQueue.then(async () => {
    const cachedAgain = readCache(geocodeCache, key);
    if (cachedAgain) return cachedAgain;

    const wait = Math.max(0, REQUEST_GAP_MS - (Date.now() - lastGeocodeAt));
    if (wait) await sleep(wait);
    lastGeocodeAt = Date.now();

    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", query);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SafeHoodPortfolio/1.0 (community route planning)",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("The destination search service is temporarily unavailable.");

    const matches = await response.json();
    if (!Array.isArray(matches) || matches.length === 0) {
      throw new Error("We couldn't find that destination. Try a nearby landmark or a more complete address.");
    }

    const result = {
      latitude: Number(matches[0].lat),
      longitude: Number(matches[0].lon),
      displayName: matches[0].display_name,
    };
    if (!Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) {
      throw new Error("The destination search returned an invalid location.");
    }

    remember(geocodeCache, key, result);
    return result;
  });

  geocodeQueue = task.catch(() => undefined);
  return task;
}

function getRoadRoutes(origin, destination) {
  const key = [
    origin.longitude.toFixed(5),
    origin.latitude.toFixed(5),
    destination.longitude.toFixed(5),
    destination.latitude.toFixed(5),
  ].join(":");
  const cached = readCache(routeCache, key);
  if (cached) return Promise.resolve(cached);

  const task = routeQueue.then(async () => {
    const cachedAgain = readCache(routeCache, key);
    if (cachedAgain) return cachedAgain;

    const wait = Math.max(0, REQUEST_GAP_MS - (Date.now() - lastRouteAt));
    if (wait) await sleep(wait);
    lastRouteAt = Date.now();

    const coordinates = [
      `${origin.longitude},${origin.latitude}`,
      `${destination.longitude},${destination.latitude}`,
    ].join(";");
    const url = `${OSRM_URL}/${coordinates}?alternatives=3&geometries=geojson&overview=full&steps=false`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SafeHoodPortfolio/1.0 (community route planning)",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("The road-routing service is temporarily unavailable.");

    const payload = await response.json();
    if (payload.code !== "Ok" || !Array.isArray(payload.routes) || payload.routes.length === 0) {
      throw new Error("No drivable route was found for these locations. Try a destination closer to a mapped road.");
    }

    remember(routeCache, key, payload.routes);
    return payload.routes;
  });

  routeQueue = task.catch(() => undefined);
  return task;
}

// Local equirectangular projection is accurate enough for short-distance proximity checks.
function pointToSegmentMeters(point, start, end) {
  const latitudeScale = 111320;
  const longitudeScale = 111320 * Math.cos((point[1] * Math.PI) / 180);

  const ax = (start[0] - point[0]) * longitudeScale;
  const ay = (start[1] - point[1]) * latitudeScale;
  const bx = (end[0] - point[0]) * longitudeScale;
  const by = (end[1] - point[1]) * latitudeScale;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) return Math.hypot(ax, ay);

  const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

function distanceToRoute(point, coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return Infinity;
  if (coordinates.length === 1) {
    return pointToSegmentMeters(point, coordinates[0], coordinates[0]);
  }

  let closest = Infinity;
  for (let index = 0; index < coordinates.length - 1; index += 1) {
    closest = Math.min(
      closest,
      pointToSegmentMeters(point, coordinates[index], coordinates[index + 1])
    );
    if (closest < 20) break;
  }
  return closest;
}

function reportWeight(category) {
  return {
    assault: 4,
    harassment: 3.5,
    theft: 3,
    suspicious: 2,
    other: 1,
  }[category] ?? 1;
}

function compareRouteExposure(route, reports, zones) {
  const coordinates = route.geometry?.coordinates || [];
  const nearbyReports = reports
    .map((report) => ({
      report,
      distance: distanceToRoute(report.location.coordinates, coordinates),
    }))
    .filter((item) => item.distance <= 350);

  const nearbyCautionZones = zones
    .map((zone) => ({
      zone,
      distance: distanceToRoute(zone.location.coordinates, coordinates),
    }))
    .filter((item) => item.distance <= 500 && Number(zoneScore(item.zone)) < 60);

  const reportExposure = nearbyReports.reduce(
    (sum, item) => sum + reportWeight(item.report.category) * (1 - item.distance / 350),
    0
  );
  const zoneExposure = nearbyCautionZones.reduce((sum, item) => {
    const score = Math.max(0, Math.min(100, Number(zoneScore(item.zone)) || 0));
    return sum + ((60 - score) / 60) * (1 - item.distance / 500) * 2;
  }, 0);

  return {
    exposureIndex: Math.round((reportExposure + zoneExposure) * 10) / 10,
    nearbyReports: nearbyReports.length,
    illustrativeReports: nearbyReports.filter((item) => item.report.isDemoData).length,
    communityReports: nearbyReports.filter((item) => !item.report.isDemoData).length,
    nearbyCautionZones: nearbyCautionZones.length,
    illustrativeZones: nearbyCautionZones.filter((item) => item.zone.isDemoData).length,
  };
}

function zoneScore(zone) {
  return zone.safetyScore;
}

async function getSafestRoutes(req, res) {
  try {
    const { origin, destination, city = "Chennai" } = req.body || {};
    const latitude = Number(origin?.latitude);
    const longitude = Number(origin?.longitude);
    const destinationText = String(destination || "").trim();
    const resolvedCity = String(city || "Chennai").trim().slice(0, 80) || "Chennai";

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({ message: "A valid current location is required to plan a route." });
    }
    if (destinationText.length < 2 || destinationText.length > 160) {
      return res.status(400).json({ message: "Enter a destination between 2 and 160 characters." });
    }

    const destinationPoint = await geocodeDestination(destinationText, resolvedCity);
    const [roadRoutes, reports, zones] = await Promise.all([
      getRoadRoutes(
        { latitude, longitude },
        { latitude: destinationPoint.latitude, longitude: destinationPoint.longitude }
      ),
      Report.find({ city: resolvedCity, status: "active" })
        .select("category location isDemoData")
        .limit(500)
        .lean(),
      SafetyZone.find({ city: resolvedCity })
        .select("name location safetyScore isDemoData")
        .limit(300)
        .lean(),
    ]);

    const rankedRoutes = roadRoutes
      .filter((route) => route.geometry?.type === "LineString" && Array.isArray(route.geometry.coordinates))
      .map((route, index) => ({
        id: index,
        distanceMeters: Math.round(route.distance),
        durationSeconds: Math.round(route.duration),
        geometry: route.geometry,
        ...compareRouteExposure(route, reports, zones),
      }))
      .sort((a, b) => a.exposureIndex - b.exposureIndex || a.durationSeconds - b.durationSeconds)
      .map((route, index) => ({
        ...route,
        rank: index + 1,
        label: index === 0 ? "Lowest reported-risk option" : `Alternative ${index + 1}`,
      }));

    if (rankedRoutes.length === 0) {
      return res.status(502).json({ message: "The routing service did not return a usable road route." });
    }

    return res.json({
      destination: destinationPoint.displayName,
      city: resolvedCity,
      routeCount: rankedRoutes.length,
      signalDataAvailable: reports.length > 0 || zones.length > 0,
      signalCounts: { reports: reports.length, zones: zones.length },
      routes: rankedRoutes,
      disclaimer: "Route rankings use only available active community reports and lower-scored safety zones near each road option. These signals may be incomplete or illustrative and are not verified, live, or a guarantee of safety.",
      attribution: "Routing by OSRM; map data © OpenStreetMap contributors.",
    });
  } catch (error) {
    console.error("Safe route planning failed:", error.message);
    return res.status(502).json({
      message: error.message || "Unable to plan a route right now. Please try again.",
    });
  }
}

module.exports = { getSafestRoutes };
