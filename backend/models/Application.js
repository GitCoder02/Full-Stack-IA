const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    appliedDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Selected", "Rejected"],
      default: "Applied",
    },
    matchScore: {
      type: Number,
      required: true,
    },
    // Resume attached at time of applying — stored as base64 data URL
    resumeData: {
      type: String,
      default: null,
    },
    resumeName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// Prevent duplicate applications
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
