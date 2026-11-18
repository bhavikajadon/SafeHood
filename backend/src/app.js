const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const reportRoutes = require("./routes/report.routes");
const zoneRoutes = require("./routes/zone.routes");
const forumRoutes = require("./routes/forum.routes");

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    // Permit server-to-server calls and local tools with no Origin header.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => res.json({
  name: "SafeHood API",
  status: "ok",
  message: "SafeHood backend is running.",
}));

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/forum", forumRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error("API error:", err.message);
  res.status(err.status || 500).json({
    message: err.status && err.status < 500 ? err.message : "Something went wrong. Please try again.",
  });
});

module.exports = app;
