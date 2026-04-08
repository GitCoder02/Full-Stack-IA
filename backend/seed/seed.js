const path = require("path");
const fs = require("fs");

// Manually read .env
const envPath = path.resolve(__dirname, "../.env");
const envFile = fs.readFileSync(envPath, "utf8");
envFile.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...valueParts] = trimmed.split("=");
    process.env[key.trim()] = valueParts.join("=").trim();
  }
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MOCK_INTERNSHIPS = [
  {
    company: "Google",
    role: "Frontend Developer Intern",
    description:
      "Work on Google Maps UI and internal dashboard tools. You will collaborate with senior engineers to build responsive, accessible React components used by millions of users worldwide.",
    requiredSkills: ["React", "JavaScript", "CSS", "Git"],
    domain: "Web Development",
    stipend: 30000,
    location: "Bangalore",
    deadline: "2026-04-15",
  },
  {
    company: "Microsoft",
    role: "Full Stack Developer Intern",
    description:
      "Join the Azure DevTools team to build full stack features using React on the frontend and Node.js on the backend. Work with real cloud infrastructure and ship features to thousands of developers.",
    requiredSkills: ["React", "Node.js", "MongoDB", "Git"],
    domain: "Web Development",
    stipend: 35000,
    location: "Hyderabad",
    deadline: "2026-04-10",
  },
  {
    company: "Amazon",
    role: "Backend Developer Intern",
    description:
      "Build and maintain REST APIs for Amazon's internal logistics platform. You will write clean Node.js and Express code, work with SQL databases, and participate in code reviews.",
    requiredSkills: ["Node.js", "Express.js", "SQL", "REST API"],
    domain: "Web Development",
    stipend: 28000,
    location: "Bangalore",
    deadline: "2026-04-20",
  },
  {
    company: "Flipkart",
    role: "React Developer Intern",
    description:
      "Help build Flipkart's next generation seller dashboard using React and Redux. You will work closely with the design team to implement pixel-perfect UI components.",
    requiredSkills: ["React", "Redux", "JavaScript", "Bootstrap"],
    domain: "Web Development",
    stipend: 20000,
    location: "Bangalore",
    deadline: "2026-05-01",
  },
  {
    company: "Infosys",
    role: "Web Development Intern",
    description:
      "Work on client-facing web applications for Infosys enterprise clients. Ideal for beginners looking to gain real-world experience with HTML, CSS, and JavaScript.",
    requiredSkills: ["HTML", "CSS", "JavaScript"],
    domain: "Web Development",
    stipend: 15000,
    location: "Pune",
    deadline: "2026-05-15",
  },
  {
    company: "TCS",
    role: "Data Analyst Intern",
    description:
      "Analyze large datasets for TCS banking clients. Use Python and SQL to extract insights and build reports.",
    requiredSkills: ["Python", "SQL", "Excel"],
    domain: "Data Science",
    stipend: 18000,
    location: "Chennai",
    deadline: "2026-04-25",
  },
  {
    company: "Wipro",
    role: "Data Science Intern",
    description:
      "Join Wipro's AI practice to build predictive models for retail clients. You will use Python, Pandas, and Scikit-learn to clean data and train ML models.",
    requiredSkills: ["Python", "Pandas", "Machine Learning", "Scikit-learn"],
    domain: "Data Science",
    stipend: 20000,
    location: "Bangalore",
    deadline: "2026-04-30",
  },
  {
    company: "IBM",
    role: "ML Engineer Intern",
    description:
      "Work with IBM Research on computer vision models. Build and fine-tune deep learning models using TensorFlow.",
    requiredSkills: ["Python", "TensorFlow", "Machine Learning", "NumPy"],
    domain: "AI / ML",
    stipend: 25000,
    location: "Bangalore",
    deadline: "2026-04-05",
  },
  {
    company: "NVIDIA",
    role: "AI Research Intern",
    description:
      "Contribute to NVIDIA's deep learning research team. Work on cutting-edge neural network architectures using PyTorch.",
    requiredSkills: ["Python", "PyTorch", "Machine Learning", "NumPy"],
    domain: "AI / ML",
    stipend: 40000,
    location: "Hyderabad",
    deadline: "2026-05-30",
  },
  {
    company: "Zoho",
    role: "Android Developer Intern",
    description:
      "Build features for Zoho's suite of Android productivity apps used by millions. You will write clean Java code and design XML layouts.",
    requiredSkills: ["Java", "Android", "XML"],
    domain: "Mobile Development",
    stipend: 22000,
    location: "Chennai",
    deadline: "2026-05-10",
  },
  {
    company: "Swiggy",
    role: "React Native Developer Intern",
    description:
      "Work on Swiggy's customer-facing mobile app using React Native. Build smooth, performant UI components and integrate with REST APIs.",
    requiredSkills: ["React Native", "JavaScript", "REST API"],
    domain: "Mobile Development",
    stipend: 24000,
    location: "Bangalore",
    deadline: "2026-04-18",
  },
  {
    company: "Razorpay",
    role: "Node.js Backend Intern",
    description:
      "Build payment APIs and internal tooling at Razorpay. Work with Node.js, MongoDB, and REST APIs in a fast-paced fintech environment.",
    requiredSkills: ["Node.js", "MongoDB", "Express.js", "REST API"],
    domain: "Web Development",
    stipend: 30000,
    location: "Bangalore",
    deadline: "2026-04-22",
  },
  {
    company: "Myntra",
    role: "UI Developer Intern",
    description:
      "Design and implement beautiful UI components for Myntra's fashion e-commerce platform using Figma designs and React.",
    requiredSkills: ["React", "CSS", "Figma", "JavaScript"],
    domain: "UI / UX Design",
    stipend: 22000,
    location: "Bangalore",
    deadline: "2026-05-05",
  },
  {
    company: "ISRO",
    role: "Data Processing Intern",
    description:
      "Process and analyze satellite data using Python and MATLAB. Work with ISRO scientists on real space mission data pipelines.",
    requiredSkills: ["Python", "MATLAB", "NumPy"],
    domain: "Data Science",
    stipend: 12000,
    location: "Bangalore",
    deadline: "2026-05-20",
  },
  {
    company: "StartupX",
    role: "Full Stack Intern",
    description:
      "Be one of the first engineering interns at a fast-growing startup. Work on everything from React frontend to Node.js backend.",
    requiredSkills: ["React", "Node.js", "MongoDB", "Git"],
    domain: "Web Development",
    stipend: 18000,
    location: "Remote",
    deadline: "2026-05-30",
  },
];

// Raw schemas — defined inline to avoid pre-save hook issues during seeding
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "student" },
    skills: { type: [String], default: [] },
  },
  { timestamps: true },
);

const internshipSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    description: String,
    requiredSkills: [String],
    domain: String,
    stipend: Number,
    location: String,
    deadline: String,
    postedBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true },
);

const applicationSchema = new mongoose.Schema(
  {
    student: mongoose.Schema.Types.ObjectId,
    internship: mongoose.Schema.Types.ObjectId,
    appliedDate: String,
    status: { type: String, default: "Applied" },
    matchScore: Number,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
const Internship = mongoose.model("Internship", internshipSchema);
const Application = mongoose.model("Application", applicationSchema);

const seed = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    // Clear existing data
    await Application.deleteMany();
    await Internship.deleteMany();
    await User.deleteMany();
    console.log("Cleared existing data");

    // Hash passwords manually here — no pre-save hook in this script
    const adminHash = await bcrypt.hash("admin123", 10);
    const studentHash = await bcrypt.hash("student123", 10);

    // Create admin
    const admin = await User.create({
      name: "Admin",
      email: "admin@mit.edu",
      password: adminHash,
      role: "admin",
      skills: [],
    });
    console.log("Admin user created: admin@mit.edu / admin123");

    // Create demo student
    await User.create({
      name: "Arjun Sharma",
      email: "student@mit.edu",
      password: studentHash,
      role: "student",
      skills: ["React", "JavaScript", "Node.js", "Git", "HTML", "CSS"],
    });
    console.log("Student user created: student@mit.edu / student123");

    // Insert internships
    const internshipsWithAdmin = MOCK_INTERNSHIPS.map((i) => ({
      ...i,
      postedBy: admin._id,
    }));
    await Internship.insertMany(internshipsWithAdmin);
    console.log("15 internships inserted");

    console.log("\n✅ Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seed();
