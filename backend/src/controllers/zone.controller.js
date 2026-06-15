const SafetyZone = require("../models/SafetyZone");

async function getZones(req, res) {
  try {
    const { city } = req.query;
    const filter = city ? { city } : {};
    const zones = await SafetyZone.find(filter);
    res.json({ zones });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getZones };