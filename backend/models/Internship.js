const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    domain: {
      type: String,
      required: [true, "Domain is required"],
    },
    stipend: {
      type: Number,
      required: [true, "Stipend is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    deadline: {
      type: String,
      required: [true, "Deadline is required"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Internship", internshipSchema);
