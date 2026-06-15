const Report = require("../models/Report");
const SafetyZone = require("../models/SafetyZone");
const { emitToCity } = require("../config/socket");

function getSafetyScore(category, description) {
  const scores = {
    assault: 15,
    harassment: 25,
    theft: 30,
    suspicious: 50,
    other: 60,
  };

  let score = scores[category] || 50;

  if (description) {
    const text = description.toLowerCase();
    const dangerous = ["weapon", "knife", "gun", "blood", "gang"];
    const mild = ["minor", "left quickly", "no harm"];
    dangerous.forEach((w) => {
      if (text.includes(w)) score = Math.max(0, score - 15);
    });
    mild.forEach((w) => {
      if (text.includes(w)) score = Math.min(100, score + 10);
    });
  }

  return score;
}

async function createReport(req, res) {
  try {
    const { category, description, coordinates, address, city, isAnonymous } =
      req.body;

    if (!coordinates || coordinates.length !== 2) {
      return res
        .status(400)
        .json({ message: "coordinates [lng, lat] are required" });
    }

    const safetyScore = getSafetyScore(category, description);
    const severity =
      safetyScore < 30 ? "high" : safetyScore < 60 ? "medium" : "low";

    const report = await Report.create({
      user: isAnonymous ? null : req.user?._id,
      isAnonymous: isAnonymous || false,
      category,
      description,
      location: { type: "Point", coordinates },
      address,
      city: city || req.user?.city || "Chennai",
      severity,
      safetyScore,
    });

    await updateNearestZone(coordinates, city);

    emitToCity(city, "newReport", {
      id: report._id,
      category: report.category,
      severity: report.severity,
      coordinates: report.location.coordinates,
      address: report.address,
      safetyScore,
      createdAt: report.createdAt,
    });

    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

  if (nearbyReports.length === 0) return;

  const avg =
    nearbyReports.reduce((sum, r) => sum + r.safetyScore, 0) /
    nearbyReports.length;

  zone.safetyScore = Math.round(avg);
  zone.riskLevel =
    zone.safetyScore >= 61
      ? "safe"
      : zone.safetyScore >= 31
      ? "moderate"
      : "unsafe";
  zone.incidentCount = nearbyReports.length;

  await zone.save();
}

async function getReports(req, res) {
  try {
    const { city, category } = req.query;
    const filter = { status: "active" };
    if (city) filter.city = city;
    if (category) filter.category = category;

    const reports = await Report.find(filter)
      .select("-user")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function upvoteReport(req, res) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const already = report.upvotes.includes(req.user._id);
    if (already) {
      report.upvotes.pull(req.user._id);
    } else {
      report.upvotes.push(req.user._id);
    }

    await report.save();
    res.json({ upvotes: report.upvotes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createReport, getReports, upvoteReport };