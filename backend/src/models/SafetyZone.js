const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    safetyScore: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ["safe", "moderate", "unsafe"],
      default: "safe",
    },
    incidentCount: {
      type: Number,
      default: 0,
    },
    policeStation: {
      name: String,
      phone: String,
      distance: String,
    },
    hospital: {
      name: String,
      phone: String,
      distance: String,
    },
  },
  { timestamps: true }
);

zoneSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("SafetyZone", zoneSchema);