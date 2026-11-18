const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
      enum: ["harassment", "theft", "assault", "suspicious", "other"],
    },
    description: {
      type: String,
      maxlength: 500,
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
    address: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    safetyScore: {
      type: Number,
      default: 50,
    },
    // True only for illustrative fixtures created by the seed script.
    isDemoData: {
      type: Boolean,
      default: false,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },
  },
  { timestamps: true }
);

reportSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Report", reportSchema);