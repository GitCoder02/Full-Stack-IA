const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const sendEmail = require("../utils/sendEmail");

// Format for student-facing responses (no resumeData — too large)
const formatApplication = (doc) => {
  const isPopulated = doc.internship && doc.internship._id;
  return {
    id: doc._id.toString(),
    studentId:
      doc.student && doc.student._id
        ? doc.student._id.toString()
        : doc.student
          ? doc.student.toString()
          : null,
    internshipId: isPopulated
      ? doc.internship._id.toString()
      : doc.internship
        ? doc.internship.toString()
        : null,
    appliedDate: doc.appliedDate,
    status: doc.status,
    matchScore: doc.matchScore,
    resumeName: doc.resumeName || null,
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
// Includes student skills + resumeData so admin can view resume
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("internship")
      .populate("student", "name email skills")
      .sort({ createdAt: -1 });

    const formatted = applications.map((app) => ({
      ...formatApplication(app),
      studentName: app.student ? app.student.name : "Unknown",
      studentEmail: app.student ? app.student.email : "",
      studentSkills: app.student ? app.student.skills : [],
      resumeData: app.resumeData || null, // full base64 for admin
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Get all applications error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST /api/applications ── Student only — apply to internship
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { internshipId, matchScore, resumeData, resumeName } = req.body;

    if (!internshipId || matchScore === undefined) {
      return res
        .status(400)
        .json({ message: "internshipId and matchScore are required" });
    }

    // Check already applied
    const existing = await Application.findOne({
      student: req.user._id,
      internship: internshipId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Already applied to this internship" });
    }

    const applicationData = {
      student: req.user._id,
      internship: internshipId,
      matchScore: Number(matchScore),
      appliedDate: new Date().toISOString().split("T")[0],
      status: "Applied",
    };

    if (resumeData) applicationData.resumeData = resumeData;
    if (resumeName) applicationData.resumeName = resumeName;

    const application = await Application.create(applicationData);
    await application.populate("internship");

    // Send confirmation email to student
    const intern = application.internship;
    sendEmail(
      req.user.email,
      `Application Submitted – ${intern.role} at ${intern.company}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#0d6efd;margin-bottom:8px">Application Submitted!</h2>
        <p>Hi <b>${req.user.name}</b>,</p>
        <p>Your application has been submitted successfully. Here are your details:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr style="background:#f8f9fa">
            <td style="padding:10px 12px;font-weight:bold;width:140px">Role</td>
            <td style="padding:10px 12px">${intern.role}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;font-weight:bold;background:#f8f9fa">Company</td>
            <td style="padding:10px 12px">${intern.company}</td>
          </tr>
          <tr style="background:#f8f9fa">
            <td style="padding:10px 12px;font-weight:bold">Location</td>
            <td style="padding:10px 12px">${intern.location}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;font-weight:bold;background:#f8f9fa">Match Score</td>
            <td style="padding:10px 12px"><b style="color:#198754">${application.matchScore}%</b></td>
          </tr>
          <tr style="background:#f8f9fa">
            <td style="padding:10px 12px;font-weight:bold">Applied On</td>
            <td style="padding:10px 12px">${application.appliedDate}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;font-weight:bold;background:#f8f9fa">Resume</td>
            <td style="padding:10px 12px">${resumeName ? resumeName : "Not attached"}</td>
          </tr>
        </table>
        <p>You can track your application status on the portal.</p>
        <p style="color:#6c757d;font-size:12px;margin-top:24px">MIT Smart Internship Portal · ICT 3230</p>
      </div>`,
    );

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
    )
      .populate("internship")
      .populate("student", "name email");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const intern = application.internship;
    const student = application.student;

    // Send email only for meaningful outcomes — not for every status change
    if (status === "Selected") {
      sendEmail(
        student.email,
        `Congratulations! Selected for ${intern.role} at ${intern.company}`,
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#198754">Congratulations! 🎉</h2>
          <p>Hi <b>${student.name}</b>,</p>
          <p>We are delighted to inform you that you have been <b style="color:#198754">selected</b> for the following position:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr style="background:#f8f9fa">
              <td style="padding:10px 12px;font-weight:bold;width:140px">Role</td>
              <td style="padding:10px 12px">${intern.role}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;font-weight:bold;background:#f8f9fa">Company</td>
              <td style="padding:10px 12px">${intern.company}</td>
            </tr>
            <tr style="background:#f8f9fa">
              <td style="padding:10px 12px;font-weight:bold">Location</td>
              <td style="padding:10px 12px">${intern.location}</td>
            </tr>
          </table>
          <p>The company will reach out to you shortly with the next steps. Best of luck!</p>
          <p style="color:#6c757d;font-size:12px;margin-top:24px">MIT Smart Internship Portal · ICT 3230</p>
        </div>`,
      );
    } else if (status === "Rejected") {
      sendEmail(
        student.email,
        `Application Update – ${intern.role} at ${intern.company}`,
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#212529">Application Update</h2>
          <p>Hi <b>${student.name}</b>,</p>
          <p>Thank you for applying to <b>${intern.role}</b> at <b>${intern.company}</b>.</p>
          <p>After careful review, we regret to inform you that your application has not been taken forward at this time.</p>
          <p>Don't be discouraged — every application is a learning experience. Keep building your skills and applying to other opportunities on the portal.</p>
          <p style="margin-top:16px">Best of luck on your internship journey!</p>
          <p style="color:#6c757d;font-size:12px;margin-top:24px">MIT Smart Internship Portal · ICT 3230</p>
        </div>`,
      );
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
