import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { calculateMatch } from "../utils/matchScore";
import MatchBar from "../components/MatchBar";
import SkillBadge from "../components/SkillBadge";

// Converts a File object to a base64 data URL string
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function InternshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { internships, applyToInternship, hasApplied } = useData();
  const { currentUser } = useAuth();

  // Apply modal states
  const [showModal, setShowModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  const internship = internships.find((i) => i.id === id);

  if (!internship) {
    return (
      <div className="container py-5 text-center">
        <div className="fs-1 mb-3">🔍</div>
        <h3 className="fw-bold mb-2">Internship not found</h3>
        <p className="text-muted mb-4">This listing may have been removed.</p>
        <button
          className="btn btn-primary rounded-3"
          onClick={() => navigate("/internships")}
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const isStudent = currentUser?.role === "student";
  const applied = isStudent && hasApplied(currentUser.id, internship.id);

  const { score, matched, missing } = isStudent
    ? calculateMatch(currentUser.skills, internship.requiredSkills)
    : { score: null, matched: [], missing: [] };

  const daysLeft = Math.ceil(
    (new Date(internship.deadline) - new Date()) / (1000 * 60 * 60 * 24),
  );

  function handleFileChange(e) {
    const file = e.target.files[0];
    setResumeError("");
    if (!file) {
      setResumeFile(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setResumeError("Only PDF files are accepted");
      setResumeFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("File size must be under 5MB");
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
  }

  function openModal() {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setResumeFile(null);
    setResumeError("");
    setApplyError("");
    setShowModal(true);
  }

  function closeModal() {
    if (applying) return;
    setShowModal(false);
    setResumeFile(null);
    setResumeError("");
    setApplyError("");
  }

  async function handleModalSubmit() {
    setApplyError("");
    setApplying(true);

    let resumeData = null;
    let resumeName = null;

    if (resumeFile) {
      try {
        resumeData = await readFileAsBase64(resumeFile);
        resumeName = resumeFile.name;
      } catch {
        setApplyError("Failed to read resume file. Please try again.");
        setApplying(false);
        return;
      }
    }

    const result = await applyToInternship(
      currentUser.id,
      internship.id,
      score,
      resumeData,
      resumeName,
    );

    setApplying(false);

    if (result.success) {
      setShowModal(false);
      navigate("/applications");
    } else {
      setApplyError(result.message || "Could not apply. Please try again.");
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 860 }}>
      {/* Back button */}
      <button
        className="btn btn-link text-muted ps-0 mb-4"
        onClick={() => navigate("/internships")}
      >
        ← Back to Listings
      </button>

      <div className="row g-4">
        {/* ── LEFT: Main content ── */}
        <div className="col-lg-8">
          {/* Header card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 mb-2">
                  {internship.domain}
                </span>
                <h2 className="fw-bold mb-1">{internship.role}</h2>
                <h5 className="text-muted fw-normal">{internship.company}</h5>
              </div>
              {applied && (
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2">
                  ✓ Already Applied
                </span>
              )}
            </div>
            <div className="d-flex flex-wrap gap-4 text-muted small mb-0">
              <span>📍 {internship.location}</span>
              <span>💰 ₹{internship.stipend.toLocaleString()}/month</span>
              <span
                className={
                  daysLeft <= 7 && daysLeft > 0 ? "text-danger fw-bold" : ""
                }
              >
                📅 Deadline: {internship.deadline}
                {daysLeft > 0
                  ? ` (${daysLeft} day${daysLeft !== 1 ? "s" : ""} left)`
                  : " (Deadline passed)"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3">About This Internship</h5>
            <p className="text-muted lh-lg mb-0">{internship.description}</p>
          </div>

          {/* Required Skills */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-3">Required Skills</h5>
            <div className="d-flex flex-wrap gap-2">
              {internship.requiredSkills.map((skill) => (
                <SkillBadge
                  key={skill}
                  skill={skill}
                  matched={isStudent && matched.includes(skill)}
                  missing={isStudent && missing.includes(skill)}
                />
              ))}
            </div>
            {isStudent && missing.length > 0 && (
              <div className="alert alert-warning mt-3 mb-0 py-2 px-3 small rounded-3">
                💡 You're missing: <strong>{missing.join(", ")}</strong>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Match + Apply ── */}
        <div className="col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-4 p-4 sticky-top"
            style={{ top: 20 }}
          >
            {/* Match score — students only */}
            {isStudent && (
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Your Match</h6>
                <div className="text-center mb-3">
                  <span
                    className="display-5 fw-bold"
                    style={{
                      color:
                        score >= 75
                          ? "#198754"
                          : score >= 50
                            ? "#e6a817"
                            : "#dc3545",
                    }}
                  >
                    {score}%
                  </span>
                  <p className="text-muted small mb-0">compatibility</p>
                </div>
                <MatchBar score={score} />
                {matched.length > 0 && (
                  <div className="mt-3">
                    <p className="small text-muted fw-semibold mb-2">
                      Skills you have:
                    </p>
                    <div className="d-flex flex-wrap gap-1">
                      {matched.map((s) => (
                        <SkillBadge key={s} skill={s} matched />
                      ))}
                    </div>
                  </div>
                )}
                {missing.length > 0 && (
                  <div className="mt-3">
                    <p className="small text-muted fw-semibold mb-2">
                      Skills to learn:
                    </p>
                    <div className="d-flex flex-wrap gap-1">
                      {missing.map((s) => (
                        <SkillBadge key={s} skill={s} missing />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Apply button */}
            <div className="d-grid">
              {!currentUser ? (
                <button
                  className="btn btn-primary btn-lg rounded-3"
                  onClick={() => navigate("/login")}
                >
                  Login to Apply
                </button>
              ) : applied ? (
                <button className="btn btn-success btn-lg rounded-3" disabled>
                  ✓ Applied
                </button>
              ) : currentUser.role === "admin" ? (
                <button className="btn btn-secondary btn-lg rounded-3" disabled>
                  Admin cannot apply
                </button>
              ) : daysLeft <= 0 ? (
                <button className="btn btn-secondary btn-lg rounded-3" disabled>
                  Deadline Passed
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-lg rounded-3"
                  onClick={openModal}
                >
                  Apply Now →
                </button>
              )}
            </div>

            {!applied && daysLeft > 0 && isStudent && (
              <p className="text-muted text-center small mt-2 mb-0">
                Attach your resume and apply in seconds
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── APPLY MODAL ── */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.55)", zIndex: 9999 }}
          onClick={closeModal}
        >
          <div
            className="card border-0 shadow-lg rounded-4 p-4"
            style={{ maxWidth: 480, width: "92%" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="fw-bold mb-1">Confirm Application</h5>
                <p className="text-muted small mb-0">
                  {internship.role} — {internship.company}
                </p>
              </div>
              <button
                className="btn-close"
                onClick={closeModal}
                disabled={applying}
              />
            </div>

            {/* Match score summary */}
            {isStudent && (
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3"
                style={{ background: "#f0f4ff" }}
              >
                <div
                  className="fw-bold fs-4"
                  style={{
                    color:
                      score >= 75
                        ? "#198754"
                        : score >= 50
                          ? "#e6a817"
                          : "#dc3545",
                  }}
                >
                  {score}%
                </div>
                <div>
                  <p className="fw-semibold mb-0 small">Your Match Score</p>
                  <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                    {matched.length} of {internship.requiredSkills.length}{" "}
                    required skills
                  </p>
                </div>
              </div>
            )}

            {/* Resume upload */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Attach Resume{" "}
                <span className="text-muted fw-normal small">
                  (Optional · PDF only · max 5MB)
                </span>
              </label>
              <input
                type="file"
                accept=".pdf"
                className={`form-control rounded-3 ${resumeError ? "is-invalid" : ""}`}
                onChange={handleFileChange}
              />
              {resumeFile && !resumeError && (
                <div className="text-success small mt-1">
                  ✓ {resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)
                </div>
              )}
              {resumeError && (
                <div className="invalid-feedback d-block">{resumeError}</div>
              )}
              {!resumeFile && !resumeError && (
                <div className="text-muted small mt-1">
                  Tip: Tailor your resume to this role for a stronger
                  application
                </div>
              )}
            </div>

            {/* API error */}
            {applyError && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                ⚠️ {applyError}
              </div>
            )}

            {/* Buttons */}
            <div className="d-flex gap-3">
              <button
                className="btn btn-primary rounded-3 flex-fill"
                onClick={handleModalSubmit}
                disabled={applying || !!resumeError}
              >
                {applying ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
              <button
                className="btn btn-outline-secondary rounded-3 flex-fill"
                onClick={closeModal}
                disabled={applying}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InternshipDetail;
