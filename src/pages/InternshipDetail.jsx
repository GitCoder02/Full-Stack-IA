import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { calculateMatch } from "../utils/matchScore";
import MatchBar from "../components/MatchBar";
import SkillBadge from "../components/SkillBadge";

function InternshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { internships, applyToInternship, hasApplied } = useData();
  const { currentUser } = useAuth();

  const internship = internships.find((i) => i.id === id);

  if (!internship) {
    return (
      <div className="container py-5 text-center">
        <h3>Internship not found</h3>
        <button
          className="btn btn-primary mt-3"
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

  function handleApply() {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    applyToInternship(currentUser.id, internship.id, score);
    navigate("/applications");
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

            {/* Meta */}
            <div className="d-flex flex-wrap gap-4 text-muted small mb-3">
              <span>📍 {internship.location}</span>
              <span>💰 ₹{internship.stipend.toLocaleString()}/month</span>
              <span className={daysLeft <= 7 ? "text-danger fw-bold" : ""}>
                📅 Deadline: {internship.deadline}
                {daysLeft > 0 ? ` (${daysLeft} days left)` : " (Passed)"}
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
                            ? "#ffc107"
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
                  onClick={handleApply}
                >
                  Apply Now →
                </button>
              )}
            </div>

            {!applied && daysLeft > 0 && isStudent && (
              <p className="text-muted text-center small mt-2 mb-0">
                Application takes less than 1 minute
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternshipDetail;
