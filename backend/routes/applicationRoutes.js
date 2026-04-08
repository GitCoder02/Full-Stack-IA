/* eslint-disable no-undef */
const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Formats application doc — handles both populated and unpopulated internship
const formatApplication = (doc) => {
  const isPopulated = doc.internship && doc.internship._id;

  return {
    id: doc._id.toString(),
    studentId: doc.student._id
      ? doc.student._id.toString()
      : doc.student.toString(),
    internshipId: isPopulated
      ? doc.internship._id.toString()
      : doc.internship.toString(),
    appliedDate: doc.appliedDate,
    status: doc.status,
    matchScore: doc.matchScore,
    internship: isPopulated
      ? {
          id: doc.internship._id.toString(),
          company: doc.internship.company,
          role: doc.internship.role,
          location: doc.internship.location,
          domain: doc.internship.domain,
          stipend: doc.internship.stipend,
          deadline: doc.internship.deadline,
          requiredSkills: doc.internship.requiredSkills,
        }
      : null,
  };
};

// ── GET /api/applications/mine ── Student only
// Returns all applications for the logged-in student
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("internship")
      .sort({ createdAt: -1 });

    res.json(applications.map(formatApplication));
  } catch (error) {
    console.error("Get my applications error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET /api/applications/all ── Admin only
// Returns all applications across all students
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("internship")
      .populate("student", "name email skills")
      .sort({ createdAt: -1 });

    const formatted = applications.map((app) => ({
      ...formatApplication(app),
      studentName: app.student.name,
      studentEmail: app.student.email,
      studentSkills: app.student.skills,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Get all applications error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST /api/applications ── Student only
// Apply to an internship
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { internshipId, matchScore } = req.body;

    if (!internshipId || matchScore === undefined) {
      return res
        .status(400)
        .json({ message: "internshipId and matchScore are required" });
    }

    // Check if already applied
    const existing = await Application.findOne({
      student: req.user._id,
      internship: internshipId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Already applied to this internship" });
    }

    // Create application
    const application = await Application.create({
      student: req.user._id,
      internship: internshipId,
      matchScore: Number(matchScore),
      appliedDate: new Date().toISOString().split("T")[0],
      status: "Applied",
    });

    // Populate internship before sending response
    await application.populate("internship");

    res.status(201).json(formatApplication(application));
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid internship ID" });
    }
    console.error("Apply error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── PUT /api/applications/:id/status ── Admin only
// Update application status
router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Applied", "Under Review", "Selected", "Rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate("internship");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(formatApplication(application));
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    console.error("Update status error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
