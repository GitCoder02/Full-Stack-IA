const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Web Development",
        "Programming",
        "Data Science",
        "AI / ML",
        "Mobile Development",
        "Other",
      ],
      default: "Other",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Skill", skillSchema);
