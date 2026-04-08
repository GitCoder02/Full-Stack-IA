const express = require("express");
const router = express.Router();
const Internship = require("../models/Internship");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Formats MongoDB doc to match what our frontend expects
const formatInternship = (doc) => ({
  id: doc._id.toString(),
  company: doc.company,
  role: doc.role,
  description: doc.description,
  requiredSkills: doc.requiredSkills,
  domain: doc.domain,
  stipend: doc.stipend,
  location: doc.location,
  deadline: doc.deadline,
  postedBy: doc.postedBy,
});

// ── GET /api/internships ── Public
router.get("/", async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });
    res.json(internships.map(formatInternship));
  } catch (error) {
    console.error("Get internships error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET /api/internships/:id ── Public
router.get("/:id", async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.json(formatInternship(internship));
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid internship ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST /api/internships ── Admin only
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      company,
      role,
      description,
      requiredSkills,
      domain,
      stipend,
      location,
      deadline,
    } = req.body;

    if (
      !company ||
      !role ||
      !description ||
      !domain ||
      !stipend ||
      !location ||
      !deadline
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    const internship = await Internship.create({
      company,
      role,
      description,
      requiredSkills: requiredSkills || [],
      domain,
      stipend: Number(stipend),
      location,
      deadline,
      postedBy: req.user._id,
    });

    res.status(201).json(formatInternship(internship));
  } catch (error) {
    console.error("Create internship error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── PUT /api/internships/:id ── Admin only
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.json(formatInternship(internship));
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid internship ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE /api/internships/:id ── Admin only
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.json({ message: "Internship deleted successfully", id: req.params.id });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid internship ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
