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
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await SafetyZone.deleteMany({});
    await Report.deleteMany({});
    console.log("🗑️  Cleared old data");

    const zones = ZONES.map((z) => ({
      name: z.name,
      city: "Chennai",
      location: { type: "Point", coordinates: z.coordinates },
      safetyScore: z.score,
      riskLevel: z.risk,
      incidentCount: Math.floor(Math.random() * 10),
      policeStation: {
        name: z.name + " Police Station",
        phone: "100",
        distance: "0.8 km",
      },
      hospital: {
        name: z.name + " Govt Hospital",
        phone: "108",
        distance: "1.2 km",
      },
    }));

    await SafetyZone.insertMany(zones);
    console.log(`✅ Added ${zones.length} safety zones`);

    const reports = REPORTS.map((r) => ({
      isAnonymous: true,
      category: r.category,
      description: r.description,
      city: "Chennai",
      location: { type: "Point", coordinates: r.coordinates },
      severity: r.score < 30 ? "high" : r.score < 60 ? "medium" : "low",
      safetyScore: r.score,
      status: "active",
    }));

    await Report.insertMany(reports);
    console.log(`✅ Added ${reports.length} sample reports`);

    console.log("\n🎉 Database ready! Now run: npm run dev\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();