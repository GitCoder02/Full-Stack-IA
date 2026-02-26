import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { calculateMatch } from "../utils/matchScore";
import { ALL_SKILLS } from "../data/skills";
import { Link } from "react-router-dom";

function ProfilePage() {
  const { currentUser, updateSkills } = useAuth();
  const { internships } = useData();

  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  const mySkills = currentUser.skills || [];

  function toggleSkill(skill) {
    setSaved(false);
    if (mySkills.includes(skill)) {
      updateSkills(mySkills.filter((s) => s !== skill));
    } else {
      updateSkills([...mySkills, skill]);
    }
  }

  function removeSkill(skill) {
    setSaved(false);
    updateSkills(mySkills.filter((s) => s !== skill));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // Filtered skill list for the picker
  const filteredSkills = ALL_SKILLS.filter((skill) =>
    skill.toLowerCase().includes(search.toLowerCase()),
  );

  // Top 3 matches based on current skills
  const topMatches = internships
    .map((i) => ({
      ...i,
      score: calculateMatch(mySkills, i.requiredSkills).score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Avatar initials
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container py-5" style={{ maxWidth: 1000 }}>
      {/* Profile header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <div className="d-flex align-items-center gap-4 flex-wrap">
          {/* Avatar */}
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-4 flex-shrink-0"
            style={{ width: 72, height: 72, background: "#0d6efd" }}
          >
            {initials}
          </div>
          <div>
            <h3 className="fw-bold mb-1">{currentUser.name}</h3>
            <p className="text-muted mb-1">📧 {currentUser.email}</p>
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
              Student
            </span>
          </div>
          <div className="ms-auto text-end">
            <p className="text-muted small mb-1">Skills added</p>
            <span className="fs-3 fw-bold text-primary">{mySkills.length}</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* ── LEFT: Skill manager ── */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-1">🛠 Manage Your Skills</h5>
            <p className="text-muted small mb-4">
              Click a skill to add or remove it. Your match scores update
              instantly.
            </p>

            {/* Current skills */}
            {mySkills.length > 0 && (
              <div className="mb-4">
                <p className="small fw-semibold text-muted mb-2">
                  YOUR SKILLS ({mySkills.length})
                </p>
                <div className="d-flex flex-wrap gap-2">
                  {mySkills.map((skill) => (
                    <span
                      key={skill}
                      className="badge rounded-pill px-3 py-2 text-white d-flex align-items-center gap-1"
                      style={{
                        backgroundColor: "#0d6efd",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                      }}
                      onClick={() => removeSkill(skill)}
                      title="Click to remove"
                    >
                      {skill}
                      <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                        ✕
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search skills */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="Search skills to add..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Skill picker grid */}
            <div
              className="d-flex flex-wrap gap-2 overflow-auto p-1"
              style={{ maxHeight: 260 }}
            >
              {filteredSkills.map((skill) => {
                const isAdded = mySkills.includes(skill);
                return (
                  <span
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className="badge rounded-pill px-3 py-2"
                    style={{
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      backgroundColor: isAdded ? "#198754" : "#e9ecef",
                      color: isAdded ? "#fff" : "#495057",
                      transition: "all 0.15s ease",
                      userSelect: "none",
                    }}
                  >
                    {isAdded ? "✓ " : "+ "}
                    {skill}
                  </span>
                );
              })}
            </div>

            {/* Save button */}
            <div className="mt-4">
              <button
                className={`btn rounded-3 px-4 ${saved ? "btn-success" : "btn-primary"}`}
                onClick={handleSave}
              >
                {saved ? "✓ Skills Saved!" : "Save Skills"}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Match preview ── */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-1">🎯 Your Top Matches</h5>
            <p className="text-muted small mb-4">Updates as you add skills</p>

            {mySkills.length === 0 ? (
              <div className="text-center py-4">
                <div className="fs-1 mb-2">🛠</div>
                <p className="text-muted">Add skills to see your matches</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {topMatches.map((internship) => (
                  <div key={internship.id} className="p-3 rounded-3 border">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <p className="fw-bold mb-0 small">{internship.role}</p>
                        <p
                          className="text-muted mb-0"
                          style={{ fontSize: "0.78rem" }}
                        >
                          {internship.company}
                        </p>
                      </div>
                      <span
                        className="fw-bold small"
                        style={{
                          color:
                            internship.score >= 75
                              ? "#198754"
                              : internship.score >= 50
                                ? "#ffc107"
                                : "#dc3545",
                        }}
                      >
                        {internship.score}%
                      </span>
                    </div>
                    <div
                      className="progress rounded-pill"
                      style={{ height: 6 }}
                    >
                      <div
                        className={`progress-bar bg-${internship.score >= 75 ? "success" : internship.score >= 50 ? "warning" : "danger"}`}
                        style={{ width: `${internship.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/internships"
              className="btn btn-outline-primary rounded-3 w-100 mt-3"
            >
              Browse All Internships →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
