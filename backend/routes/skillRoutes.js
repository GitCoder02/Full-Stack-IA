const express = require("express");
const router = express.Router();
const Skill = require("../models/Skill");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// ── GET /api/skills ── Public — used by student profile and internship form
router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, name: 1 });
    res.json(skills);
  } catch (error) {
    console.error("Get skills error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST /api/skills ── Admin only — add a new skill
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    // Case-insensitive duplicate check
    const existing = await Skill.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (existing) {
      return res.status(400).json({ message: "This skill already exists" });
    }

    const skill = await Skill.create({
      name: name.trim(),
      category: category || "Other",
      addedBy: req.user._id,
    });

    res.status(201).json(skill);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "This skill already exists" });
    }
    console.error("Add skill error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
