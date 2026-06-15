const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const reportRoutes = require("./routes/report.routes");
const zoneRoutes = require("./routes/zone.routes");
const forumRoutes = require("./routes/forum.routes");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "SaferHood API running!" }));
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/forum", forumRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

module.exports = app;
