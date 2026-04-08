const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  skills: user.skills,
});

// ── GET /api/users/me ── Logged in user
// Returns current user's profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.json(formatUser(req.user));
  } catch (error) {
    console.error("Get me error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── PUT /api/users/me/skills ── Logged in student
// Updates current user's skills array
router.put("/me/skills", authMiddleware, async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { skills },
      { new: true },
    );

    res.json(formatUser(user));
  } catch (error) {
    console.error("Update skills error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
