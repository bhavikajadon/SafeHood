require("dotenv").config();

const mongoose = require("mongoose");
const SafetyZone = require("./models/SafetyZone");
const Report = require("./models/Report");

const ZONES = [
  { name: "Anna Nagar", coordinates: [80.2089, 13.0849], score: 78, risk: "safe" },
  { name: "T. Nagar", coordinates: [80.2341, 13.0418], score: 45, risk: "moderate" },
  { name: "Adyar", coordinates: [80.2565, 13.0012], score: 71, risk: "safe" },
  { name: "Velachery", coordinates: [80.2209, 12.9815], score: 55, risk: "moderate" },
  { name: "Tambaram", coordinates: [80.1270, 12.9249], score: 35, risk: "unsafe" },
  { name: "Egmore", coordinates: [80.2601, 13.0732], score: 48, risk: "moderate" },
  { name: "Kodambakkam", coordinates: [80.2249, 13.0533], score: 58, risk: "moderate" },
  { name: "Mylapore", coordinates: [80.2671, 13.0368], score: 69, risk: "safe" },
  { name: "Perambur", coordinates: [80.2455, 13.1140], score: 32, risk: "unsafe" },
  { name: "Guindy", coordinates: [80.2132, 13.0067], score: 65, risk: "safe" },
  { name: "Besant Nagar", coordinates: [80.2693, 12.9990], score: 82, risk: "safe" },
  { name: "Chromepet", coordinates: [80.1430, 12.9516], score: 47, risk: "moderate" },
  { name: "Porur", coordinates: [80.1579, 13.0339], score: 60, risk: "moderate" },
  { name: "Sholinganallur", coordinates: [80.2272, 12.9010], score: 73, risk: "safe" },
  { name: "Kolathur", coordinates: [80.2255, 13.1218], score: 38, risk: "unsafe" },
];

const REPORTS = [
  { category: "harassment", description: "Eve teasing near bus stop", coordinates: [80.2341, 13.0418], score: 30 },
  { category: "theft", description: "Chain snatching reported", coordinates: [80.2601, 13.0732], score: 20 },
  { category: "suspicious", description: "Suspicious person near ATM", coordinates: [80.2089, 13.0849], score: 55 },
  { category: "assault", description: "Fight near market area", coordinates: [80.1270, 12.9249], score: 15 },
  { category: "other", description: "Very dark road after 9pm", coordinates: [80.2209, 12.9815], score: 45 },
  { category: "harassment", description: "Group harassing women at signal", coordinates: [80.2455, 13.1140], score: 18 },
  { category: "theft", description: "Bike theft in parking area", coordinates: [80.2671, 13.0368], score: 35 },
];

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Upsert demo fixtures: running this again will not wipe user-submitted data.
    for (const zone of ZONES) {
      await SafetyZone.updateOne(
        { city: "Chennai", name: zone.name },
        {
          $set: {
            name: zone.name,
            city: "Chennai",
            location: { type: "Point", coordinates: zone.coordinates },
            safetyScore: zone.score,
            riskLevel: zone.risk,
            incidentCount: 0,
            isDemoData: true,
            policeStation: { name: `${zone.name} Police Station`, phone: "100", distance: "0.8 km" },
            hospital: { name: `${zone.name} Govt Hospital`, phone: "108", distance: "1.2 km" },
          },
        },
        { upsert: true }
      );
    }

    for (const item of REPORTS) {
      await Report.updateOne(
        { city: "Chennai", category: item.category, description: item.description },
        {
          $set: {
            isAnonymous: true,
            category: item.category,
            description: item.description,
            city: "Chennai",
            location: { type: "Point", coordinates: item.coordinates },
            severity: item.score < 30 ? "high" : item.score < 60 ? "medium" : "low",
            safetyScore: item.score,
            isDemoData: true,
            status: "active",
          },
        },
        { upsert: true }
      );
    }

    console.log(`Seed complete: ${ZONES.length} demo zones and ${REPORTS.length} demo reports available.`);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
