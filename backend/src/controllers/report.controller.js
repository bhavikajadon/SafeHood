const Report = require("../models/Report");
const SafetyZone = require("../models/SafetyZone");
const { emitToCity } = require("../config/socket");

const CATEGORIES = new Set(["harassment", "theft", "assault", "suspicious", "other"]);

function getSafetyScore(category, description) {
  const scores = {
    assault: 15,
    harassment: 25,
    theft: 30,
    suspicious: 50,
    other: 60,
  };

  let score = scores[category] ?? 50;
  const text = String(description || "").toLowerCase();
  const dangerous = ["weapon", "knife", "gun", "blood", "gang"];
  const mild = ["minor", "left quickly", "no harm"];

  dangerous.forEach((word) => {
    if (text.includes(word)) score = Math.max(0, score - 15);
  });
  mild.forEach((word) => {
    if (text.includes(word)) score = Math.min(100, score + 10);
  });

  return score;
}

async function createReport(req, res) {
  try {
    const {
      category,
      description = "",
      coordinates,
      address = "",
      city,
      isAnonymous = false,
    } = req.body;

    if (!CATEGORIES.has(category)) {
      return res.status(400).json({ message: "Choose a valid report category." });
    }

    if (
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      !coordinates.every(Number.isFinite)
    ) {
      return res.status(400).json({
        message: "Location must contain longitude and latitude coordinates.",
      });
    }

    const [longitude, latitude] = coordinates;
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: "The selected location is invalid." });
    }

    const cleanDescription = String(description).trim();
    if (cleanDescription.length > 500) {
      return res.status(400).json({ message: "Description must be 500 characters or fewer." });
    }

    const resolvedCity = String(city || req.user?.city || "Chennai").trim();
    const safetyScore = getSafetyScore(category, cleanDescription);
    const severity = safetyScore < 30 ? "high" : safetyScore < 60 ? "medium" : "low";

    const report = await Report.create({
      user: isAnonymous ? null : req.user?._id,
      isAnonymous: Boolean(isAnonymous),
      category,
      description: cleanDescription,
      location: { type: "Point", coordinates: [longitude, latitude] },
      address: String(address).trim(),
      city: resolvedCity,
      severity,
      safetyScore,
      isDemoData: false,
    });

    // A zone-score refresh should never make a successfully saved report look like a failed submission.
    try {
      await updateNearestZone([longitude, latitude], resolvedCity);
    } catch (zoneError) {
      console.error("Safety-zone refresh failed:", zoneError.message);
    }

    // Match the same shape returned by GET /api/reports so the live map can add the marker.
    emitToCity(resolvedCity, "newReport", {
      _id: String(report._id),
      category: report.category,
      description: report.description,
      location: report.location,
      address: report.address,
      city: report.city,
      severity: report.severity,
      safetyScore: report.safetyScore,
      createdAt: report.createdAt,
    });

    return res.status(201).json({ report });
  } catch (err) {
    console.error("Create report failed:", err.message);
    return res.status(500).json({ message: "Unable to submit the report right now." });
  }
}

async function updateNearestZone(coordinates, city) {
  const zone = await SafetyZone.findOne({
    city,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: 1000,
      },
    },
  });

  if (!zone) return;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const nearbyReports = await Report.find({
    city,
    status: "active",
    isDemoData: false,
    createdAt: { $gte: thirtyDaysAgo },
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: zone.location.coordinates,
        },
        $maxDistance: 800,
      },
    },
  });

  if (!nearbyReports.length) return;

  const average = nearbyReports.reduce((sum, report) => sum + report.safetyScore, 0) / nearbyReports.length;
  zone.safetyScore = Math.round(average);
  zone.riskLevel = zone.safetyScore >= 61 ? "safe" : zone.safetyScore >= 31 ? "moderate" : "unsafe";
  zone.incidentCount = nearbyReports.length;

  await zone.save();
}

async function getReports(req, res) {
  try {
    const { city, category } = req.query;
    const filter = { status: "active" };
    if (city) filter.city = city;
    if (category && CATEGORIES.has(category)) filter.category = category;

    const reports = await Report.find(filter)
      .select("-user")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ reports });
  } catch (err) {
    console.error("Get reports failed:", err.message);
    return res.status(500).json({ message: "Unable to load reports right now." });
  }
}

async function upvoteReport(req, res) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const alreadyUpvoted = report.upvotes.some((id) => id.equals(req.user._id));
    if (alreadyUpvoted) report.upvotes.pull(req.user._id);
    else report.upvotes.push(req.user._id);

    await report.save();
    return res.json({ upvotes: report.upvotes.length });
  } catch (err) {
    console.error("Upvote report failed:", err.message);
    return res.status(500).json({ message: "Unable to update this report right now." });
  }
}

module.exports = { createReport, getReports, upvoteReport };
